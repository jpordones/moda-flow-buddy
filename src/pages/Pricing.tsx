import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Shield, Clock, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PLANS, PlanConfig } from "@/config/plans";
import { PlanType } from "@/types/subscription";

const planOrder: PlanType[] = ['free', 'starter', 'professional', 'enterprise'];

const getFeaturesList = (plan: PlanConfig): { text: string; included: boolean }[] => {
  const features: { text: string; included: boolean }[] = [];
  
  // Products limit
  const productLimit = plan.features.max_products === -1 
    ? 'Produtos ilimitados' 
    : `Até ${plan.features.max_products} produtos`;
  features.push({ text: productLimit, included: true });
  
  // Users limit
  const userLimit = plan.features.max_users === -1 
    ? 'Usuários ilimitados' 
    : `Até ${plan.features.max_users} usuário${plan.features.max_users > 1 ? 's' : ''}`;
  features.push({ text: userLimit, included: true });
  
  // Dashboard
  if (plan.features.has_full_dashboard) {
    features.push({ text: 'Dashboard completo', included: true });
  } else if (plan.features.has_basic_dashboard) {
    features.push({ text: 'Dashboard básico', included: true });
  }
  
  // Cash flow
  features.push({ text: 'Fluxo de caixa', included: plan.features.has_cash_flow });
  
  // Stock management
  if (plan.features.has_advanced_stock) {
    features.push({ text: 'Gestão avançada de estoque', included: true });
  } else if (plan.features.has_stock_management) {
    features.push({ text: 'Gestão de estoque', included: true });
  } else {
    features.push({ text: 'Gestão de estoque', included: false });
  }
  
  // AI features
  if (plan.features.has_ai_demand_forecast) {
    features.push({ text: 'Previsão de demanda (IA)', included: true });
  }
  if (plan.features.has_ai_dynamic_pricing) {
    features.push({ text: 'Precificação dinâmica (IA)', included: true });
  }
  
  // Exports
  if (plan.features.has_export_pdf || plan.features.has_export_excel) {
    const exports = [];
    if (plan.features.has_export_pdf) exports.push('PDF');
    if (plan.features.has_export_excel) exports.push('Excel');
    features.push({ text: `Exportação ${exports.join(' e ')}`, included: true });
  }
  
  // Integrations
  if (plan.features.has_integrations) {
    features.push({ text: 'Integrações', included: true });
  }
  
  // Multi-teams
  if (plan.features.has_multi_teams) {
    features.push({ text: 'Múltiplas equipes', included: true });
  }
  
  // Multi-stores
  if (plan.features.has_multi_stores) {
    features.push({ text: 'Múltiplas lojas', included: true });
  }
  
  // API access
  if (plan.features.has_api_access) {
    features.push({ text: 'Acesso à API', included: true });
  }
  
  // Support
  if (plan.features.has_dedicated_manager) {
    features.push({ text: 'Gerente de conta dedicado', included: true });
  } else if (plan.features.has_priority_support) {
    features.push({ text: 'Suporte prioritário', included: true });
  } else if (plan.features.has_email_support) {
    features.push({ text: 'Suporte por e-mail', included: true });
  }
  
  // Onboarding
  if (plan.features.has_custom_onboarding) {
    features.push({ text: 'Onboarding personalizado', included: true });
  } else if (plan.features.has_onboarding_consultation) {
    features.push({ text: 'Consultoria de onboarding', included: true });
  }
  
  return features;
};

const formatPrice = (price: number): string => {
  if (price === 0) return 'Grátis';
  return `R$ ${price}`;
};

export default function Pricing() {
  const navigate = useNavigate();

  const plans = planOrder.map(planId => PLANS[planId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm">
            <Sparkles className="w-4 h-4 mr-1" />
            Assinatura mensal
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Planos para pequenos e médios lojistas
          </h1>

          <p className="text-lg text-muted-foreground">
            Comece gratuitamente e faça upgrade quando precisar. Sem fidelidade.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Sem cartão no teste</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Cancele quando quiser</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isHighlighted = plan.id === 'professional';
            const features = getFeaturesList(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${isHighlighted ? "border-primary shadow-lg scale-105 z-10" : ""}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.badge && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && <span className="text-muted-foreground ml-1">/mês</span>}
                  </div>
                  
                  {plan.roi && (
                    <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">
                      {plan.roi}
                    </p>
                  )}

                  <ul className="space-y-2 mb-6 flex-1">
                    {features.slice(0, 8).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full mt-auto" 
                    variant={isHighlighted ? "default" : "outline"} 
                    onClick={() => navigate("/auth")}
                  >
                    {plan.price === 0 ? 'Começar grátis' : `Assinar ${plan.name}`}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Posso trocar de plano quando quiser?</AccordionTrigger>
              <AccordionContent>
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. 
                A diferença de valor é calculada proporcionalmente.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Preciso de cartão de crédito para começar?</AccordionTrigger>
              <AccordionContent>
                Não. O plano Gratuito não requer cartão de crédito. 
                Você só precisa informar dados de pagamento ao fazer upgrade.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>O que acontece se eu ultrapassar o limite de produtos?</AccordionTrigger>
              <AccordionContent>
                Você receberá um aviso e poderá fazer upgrade para um plano maior. 
                Seus produtos existentes continuarão funcionando normalmente.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>Existe garantia de reembolso?</AccordionTrigger>
              <AccordionContent>
                Sim! Oferecemos garantia de 30 dias. Se não ficar satisfeito, 
                devolvemos 100% do valor pago.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Começar grátis <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
