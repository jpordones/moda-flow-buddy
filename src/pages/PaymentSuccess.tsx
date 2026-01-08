import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshPlan, currentPlan, loading } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refresh = async () => {
      setIsRefreshing(true);
      await refreshPlan();
      setIsRefreshing(false);
    };
    
    refresh();
    
    // Refresh again after a short delay to ensure Stripe webhook has processed
    const timeout = setTimeout(refresh, 3000);
    return () => clearTimeout(timeout);
  }, [refreshPlan]);

  const getPlanDisplayName = () => {
    if (!currentPlan) return "Premium";
    switch (currentPlan.plan_type) {
      case "starter": return "Starter";
      case "professional": return "Profissional";
      case "enterprise": return "Enterprise";
      default: return currentPlan.plan_name || "Premium";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 animate-ping bg-success/20 rounded-full" />
            <div className="relative p-4 rounded-full bg-success/10">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">
            Pagamento Confirmado! 🎉
          </CardTitle>
          <CardDescription className="text-base">
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-6">
            {isRefreshing || loading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Atualizando sua conta...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-lg font-semibold mb-2">
                  <Sparkles className="h-5 w-5 text-warning" />
                  <span>Plano {getPlanDisplayName()}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Todas as funcionalidades do seu plano já estão disponíveis
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full gap-2"
              variant="action"
              size="lg"
            >
              Começar a Usar
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => navigate("/planos")} 
              variant="outline"
              className="w-full"
            >
              Ver Detalhes do Plano
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Um email de confirmação foi enviado para você com os detalhes da sua assinatura.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
