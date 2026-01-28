import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, TrendingUp, Calculator, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GetStartedSectionProps {
  hasProducts: boolean;
  hasTransactions: boolean;
  hasCosts: boolean;
}

export function GetStartedSection({ hasProducts, hasTransactions, hasCosts }: GetStartedSectionProps) {
  const navigate = useNavigate();

  const steps = [
    {
      id: "products",
      title: "Cadastre seus produtos",
      description: "Adicione produtos com custo e preço de venda para análises precisas",
      icon: ShoppingBag,
      actionLabel: "Adicionar Produto",
      actionUrl: "/app/produtos",
      completed: hasProducts,
    },
    {
      id: "transactions",
      title: "Registre suas transações",
      description: "Controle entradas e saídas do seu fluxo de caixa",
      icon: TrendingUp,
      actionLabel: "Adicionar Transação",
      actionUrl: "/app/fluxo-caixa",
      completed: hasTransactions,
    },
    {
      id: "costs",
      title: "Configure seus custos",
      description: "Defina custos fixos e variáveis para precificação inteligente",
      icon: Calculator,
      actionLabel: "Configurar Custos",
      actionUrl: "/app/custos",
      completed: hasCosts,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const allCompleted = completedCount === steps.length;

  if (allCompleted) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Comece por aqui</CardTitle>
            <CardDescription>
              Complete {steps.length - completedCount} passo{steps.length - completedCount > 1 ? 's' : ''} para desbloquear todo o potencial da sua dashboard
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "relative p-4 rounded-lg border transition-all",
                step.completed
                  ? "bg-success/5 border-success/30"
                  : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
              )}
            >
              {step.completed && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              )}
              <div className={cn(
                "rounded-full w-10 h-10 flex items-center justify-center mb-3",
                step.completed ? "bg-success/10" : "bg-muted"
              )}>
                <step.icon className={cn(
                  "h-5 w-5",
                  step.completed ? "text-success" : "text-muted-foreground"
                )} />
              </div>
              <h4 className={cn(
                "font-medium mb-1",
                step.completed && "text-success"
              )}>
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {step.description}
              </p>
              {!step.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(step.actionUrl)}
                >
                  {step.actionLabel}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
