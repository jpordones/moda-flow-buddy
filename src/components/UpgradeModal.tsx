import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan?: string;
  currentPlan?: string;
}

const planBenefits: Record<string, string[]> = {
  starter: [
    "Até 25 produtos",
    "Exportação PDF e Excel",
    "Gestão de estoque",
    "50 análises de custos"
  ],
  professional: [
    "Até 100 produtos",
    "Fluxo de caixa completo",
    "Relatórios avançados",
    "Multi-usuários (5)",
    "Análises ilimitadas"
  ],
  enterprise: [
    "Produtos ilimitados",
    "Usuários ilimitados",
    "Suporte prioritário",
    "Todas as funcionalidades"
  ]
};

export function UpgradeModal({ isOpen, onClose, feature, requiredPlan = "professional", currentPlan = "free" }: UpgradeModalProps) {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onClose();
    navigate("/app/planos");
  };

  const benefits = planBenefits[requiredPlan] || planBenefits.professional;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Funcionalidade Premium</DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-semibold text-foreground">{feature}</span> não está disponível no plano {currentPlan === "free" ? "Gratuito" : currentPlan}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-warning" />
              <span className="font-semibold">Desbloqueie com o plano {requiredPlan === "starter" ? "Starter" : requiredPlan === "professional" ? "Profissional" : "Enterprise"}</span>
            </div>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
            <Sparkles className="h-4 w-4" />
            <span>Comece agora e aumente sua produtividade</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleViewPlans} className="w-full gap-2" variant="action">
            <Crown className="h-4 w-4" />
            Ver Planos e Preços
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Continuar no plano atual
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
