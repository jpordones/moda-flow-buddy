import { Check, X, Crown, Zap, Building2, Sparkles, Loader2, Shield, TrendingUp, Clock, Target, Star, Flame } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripePayment } from '@/hooks/useStripePayment';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanType, PlanFeature } from '@/types/subscription';
import { cn } from '@/lib/utils';

const planIcons: Record<PlanType, React.ReactNode> = {
  free: <Sparkles className="h-6 w-6" />,
  starter: <Zap className="h-6 w-6" />,
  professional: <Crown className="h-6 w-6" />,
  enterprise: <Building2 className="h-6 w-6" />
};

const planColors: Record<PlanType, string> = {
  free: 'from-slate-500 to-slate-600',
  starter: 'from-amber-500 to-amber-600',
  professional: 'from-purple-500 to-purple-600',
  enterprise: 'from-blue-600 to-indigo-700'
};

// Updated pricing strategy
const staticPlans = [
  {
    type: 'free' as PlanType,
    name: 'Gratuito',
    price: 0,
    description: 'Para experimentar',
    features: [
      { text: '5 produtos', included: true },
      { text: '1 usuário', included: true },
      { text: 'Dashboard básico', included: true },
      { text: 'Precificação LAMAR básica', included: true },
      { text: 'Relatórios com marca d\'água', included: true },
      { text: 'Fluxo de Caixa', included: false },
      { text: 'Exportação PDF/Excel', included: false },
      { text: 'Integrações', included: false },
    ]
  },
  {
    type: 'starter' as PlanType,
    name: 'Starter',
    price: 149,
    description: 'Para pequenos negócios',
    roi: 'Economize até R$ 500/mês em planilhas e erros',
    features: [
      { text: '50 produtos', included: true },
      { text: '2 usuários', included: true },
      { text: 'Dashboard completo', included: true },
      { text: 'Fluxo de Caixa', included: true },
      { text: 'Exportação PDF/Excel', included: true },
      { text: 'Controle de estoque avançado', included: true },
      { text: 'Precificação LAMAR completa', included: true },
      { text: 'Suporte por email', included: true },
    ]
  },
  {
    type: 'professional' as PlanType,
    name: 'Professional',
    price: 299,
    badge: '🔥 MAIS ESCOLHIDO',
    description: 'Para equipes em crescimento',
    roi: 'Aumente margem média em 18% = +R$ 15k/mês',
    features: [
      { text: 'Tudo do Starter +', included: true },
      { text: '200 produtos', included: true },
      { text: '5 usuários', included: true },
      { text: '🤖 IA de Previsão de Demanda', included: true },
      { text: '🤖 Precificação Dinâmica com IA', included: true },
      { text: '🔗 Integrações (Nuvemshop, ML)', included: true },
      { text: '📊 Relatórios Avançados', included: true },
      { text: '👥 Multi-equipes', included: true },
      { text: '🎓 1h de Consultoria Onboarding', included: true },
      { text: '⚡ Suporte Prioritário (24h)', included: true },
    ]
  },
  {
    type: 'enterprise' as PlanType,
    name: 'Enterprise',
    price: 799,
    badge: '👑 PARA ESCALAR',
    description: 'Para grandes empresas',
    roi: 'Para faturamentos acima de R$ 100k/mês',
    features: [
      { text: 'Tudo do Professional +', included: true },
      { text: 'Produtos ilimitados', included: true },
      { text: 'Usuários ilimitados', included: true },
      { text: '🏪 Multi-Lojas', included: true },
      { text: '💻 API Completa + Webhooks', included: true },
      { text: '🎨 White-Label (sua marca)', included: true },
      { text: '👤 Gestor de Conta Dedicado', included: true },
      { text: '📞 Suporte SLA 2h', included: true },
      { text: '🎓 Onboarding Personalizado', included: true },
      { text: '📱 Acesso WhatsApp direto', included: true },
      { text: '🔧 Customizações sob demanda', included: true },
    ]
  }
];

const features: PlanFeature[] = [
  { name: 'Produtos cadastrados', free: '5', starter: '50', professional: '200', enterprise: 'Ilimitado' },
  { name: 'Usuários', free: '1', starter: '2', professional: '5', enterprise: 'Ilimitado' },
  { name: 'Dashboard', free: 'Básico', starter: 'Completo', professional: 'Completo', enterprise: 'Completo' },
  { name: 'Precificação LAMAR', free: 'Básica', starter: 'Completa', professional: 'Com IA', enterprise: 'Com IA' },
  { name: 'Fluxo de Caixa', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Exportação PDF/Excel', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Controle de Estoque', free: false, starter: true, professional: true, enterprise: true },
  { name: 'IA Previsão de Demanda', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Integrações', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Multi-Lojas', free: false, starter: false, professional: false, enterprise: true },
  { name: 'API + Webhooks', free: false, starter: false, professional: false, enterprise: true },
  { name: 'White-Label', free: false, starter: false, professional: false, enterprise: true },
  { name: 'Suporte', free: 'Básico', starter: 'Email', professional: '24h', enterprise: 'SLA 2h' },
];

export default function Plans() {
  const { currentPlan, loading } = useSubscription();
  const { subscribe, loading: stripeLoading, stripeSubscription, openCustomerPortal } = useStripePayment();

  const handleUpgrade = async (planType: PlanType) => {
    await subscribe(planType);
  };

  // Use Stripe subscription if available, otherwise fall back to database subscription
  const activePlanType = stripeSubscription?.plan_type || currentPlan?.plan_type || 'free';

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[500px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      <div className="text-center mb-6 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Escolha seu Plano</h1>
        <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
          Invista no crescimento do seu negócio. Retorno garantido ou seu dinheiro de volta.
        </p>
      </div>

      {/* Current Plan Badge */}
      {activePlanType && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
            Plano atual: <span className="font-semibold ml-1 capitalize">{activePlanType}</span>
          </Badge>
          {stripeSubscription?.subscribed && (
            <Button variant="outline" size="sm" onClick={openCustomerPortal} disabled={stripeLoading} className="h-10 sm:h-auto">
              Gerenciar Assinatura
            </Button>
          )}
        </div>
      )}

      {/* Plan Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-16">
        {staticPlans.map(plan => {
          const isCurrentPlan = activePlanType === plan.type;
          const isProfessional = plan.type === 'professional';
          const isEnterprise = plan.type === 'enterprise';
          
          return (
            <Card 
              key={plan.type} 
              className={cn(
                "relative flex flex-col transition-all duration-300 hover:shadow-xl",
                isCurrentPlan && "ring-2 ring-primary",
                isProfessional && "border-2 border-amber-500 shadow-lg shadow-amber-500/20",
                isEnterprise && "border-2 border-indigo-500 shadow-lg shadow-indigo-500/20"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={cn(
                    "text-white px-3 py-1",
                    isProfessional ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : 
                    "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  )}>
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-6">
                <div className={cn(
                  "w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white bg-gradient-to-br",
                  planColors[plan.type]
                )}>
                  {planIcons[plan.type]}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/mês</span>
                  )}
                </div>

                {/* ROI Info */}
                {plan.roi && (
                  <div className={cn(
                    "text-center text-xs mb-4 p-2 rounded-lg",
                    isProfessional ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
                    isEnterprise ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" :
                    "bg-success/10 text-success"
                  )}>
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    {plan.roi}
                  </div>
                )}

                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <FeatureItem 
                      key={index}
                      included={feature.included} 
                      text={feature.text} 
                    />
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                {isCurrentPlan ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Plano Atual
                  </Button>
                ) : plan.type === 'free' ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
                    Plano Básico
                  </Button>
                ) : plan.type === 'enterprise' ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" 
                    onClick={() => handleUpgrade(plan.type)}
                    disabled={stripeLoading}
                  >
                    Falar com Especialista
                  </Button>
                ) : isProfessional ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" 
                    onClick={() => handleUpgrade(plan.type)}
                    disabled={stripeLoading}
                  >
                    {stripeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Flame className="mr-2 h-4 w-4" />
                        Começar Agora
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    onClick={() => handleUpgrade(plan.type)}
                    disabled={stripeLoading}
                  >
                    {stripeLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Fazer Upgrade'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Why Invest Section */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">
            💰 Quanto você PERDE sem o FEDCOM?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl sm:text-4xl font-bold text-destructive mb-2">R$ 8.500</div>
              <p className="text-sm text-muted-foreground">
                Perda média por mês vendendo produtos com margem errada
              </p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl sm:text-4xl font-bold text-destructive mb-2 flex items-center justify-center gap-1">
                <Clock className="h-8 w-8" />
                20h
              </div>
              <p className="text-sm text-muted-foreground">
                Tempo perdido por mês em planilhas e cálculos manuais
              </p>
            </div>
            <div className="text-center p-4 bg-background/50 rounded-lg">
              <div className="text-3xl sm:text-4xl font-bold text-destructive mb-2 flex items-center justify-center gap-1">
                <Target className="h-8 w-8" />
                40%
              </div>
              <p className="text-sm text-muted-foreground">
                Dos produtos em e-commerces têm margem abaixo do ideal
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 sm:p-6 bg-success/10 rounded-lg border border-success/20 text-center">
            <p className="text-base sm:text-lg font-semibold text-success mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Clientes FEDCOM aumentam margem média em 18% nos primeiros 90 dias
            </p>
            <p className="text-sm text-muted-foreground">
              Com faturamento de R$ 50k/mês, isso significa <strong className="text-success">+R$ 9.000/mês</strong> de lucro = ROI de 30x
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guarantee Section */}
      <div className="mb-8 text-center p-6 bg-muted/50 rounded-lg border border-success/20">
        <Shield className="h-12 w-12 mx-auto mb-4 text-success" />
        <h4 className="font-bold text-lg mb-2">
          🛡️ Garantia de 30 Dias
        </h4>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Se você não aumentar sua margem de lucro em pelo menos 10% nos primeiros 30 dias, 
          devolvemos 100% do valor. <strong>Sem perguntas.</strong>
        </p>
      </div>

      {/* Features Comparison Table - Hidden on mobile, shown on tablet+ */}
      <div className="mt-8 sm:mt-16 hidden md:block">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-8">Comparativo de Recursos</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base">Recurso</th>
                {staticPlans.map(plan => (
                  <th key={plan.type} className={cn(
                    "text-center py-3 sm:py-4 px-2 sm:px-4 font-medium text-sm sm:text-base",
                    plan.type === 'professional' && "bg-amber-500/10",
                    plan.type === 'enterprise' && "bg-indigo-500/10"
                  )}>
                    <div className="flex flex-col items-center gap-1">
                      {plan.name}
                      <span className="text-xs font-normal text-muted-foreground">
                        {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}/mês`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.name} className={cn("border-b", index % 2 === 0 && "bg-muted/30")}>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base">{feature.name}</td>
                  <td className="text-center py-3 sm:py-4 px-2 sm:px-4">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="text-center py-3 sm:py-4 px-2 sm:px-4">
                    <FeatureValue value={feature.starter} />
                  </td>
                  <td className={cn("text-center py-3 sm:py-4 px-2 sm:px-4", "bg-amber-500/5")}>
                    <FeatureValue value={feature.professional} />
                  </td>
                  <td className={cn("text-center py-3 sm:py-4 px-2 sm:px-4", "bg-indigo-500/5")}>
                    <FeatureValue value={feature.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ or CTA */}
      <div className="mt-8 sm:mt-16 text-center px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Dúvidas?</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
          Entre em contato conosco para saber mais sobre nossos planos.
        </p>
        <Button variant="outline" size="lg" className="h-12 w-full sm:w-auto">
          <Star className="mr-2 h-4 w-4" />
          Falar com Suporte
        </Button>
      </div>
    </div>
  );
}

function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2">
      {included ? (
        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      )}
      <span className={cn("leading-tight", !included && "text-muted-foreground")}>{text}</span>
    </li>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-success mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}
