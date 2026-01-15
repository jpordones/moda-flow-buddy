import { Check, X, Crown, Zap, Building2, Sparkles, Loader2 } from 'lucide-react';
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
  enterprise: 'from-blue-500 to-blue-600'
};

// Static plan data matching the requirements
const staticPlans = [
  {
    type: 'free' as PlanType,
    name: 'Gratuito',
    price: 0,
    description: 'Para começar',
    features: [
      { text: '10 produtos', included: true },
      { text: '1 usuário', included: true },
      { text: 'Relatórios básicos', included: true },
      { text: 'Suporte por email', included: true },
    ]
  },
  {
    type: 'starter' as PlanType,
    name: 'Starter',
    price: 49,
    badge: 'Recomendado',
    description: 'Para pequenos negócios',
    features: [
      { text: '100 produtos', included: true },
      { text: '2 usuários', included: true },
      { text: 'Relatórios completos', included: true },
      { text: 'Exportação ilimitada', included: true },
    ]
  },
  {
    type: 'professional' as PlanType,
    name: 'Professional',
    price: 99,
    badge: 'Mais Popular',
    description: 'Para equipes em crescimento',
    features: [
      { text: 'Produtos ilimitados', included: true },
      { text: '5 usuários', included: true },
      { text: 'Previsão com IA', included: true },
      { text: 'Integrações', included: true },
      { text: 'Suporte prioritário', included: true },
    ]
  },
  {
    type: 'enterprise' as PlanType,
    name: 'Enterprise',
    price: 249,
    description: 'Para grandes empresas',
    features: [
      { text: 'Tudo do Professional', included: true },
      { text: 'Usuários ilimitados', included: true },
      { text: 'Multi-lojas', included: true },
      { text: 'API dedicada', included: true },
      { text: 'White-label', included: true },
    ]
  }
];

const features: PlanFeature[] = [
  { name: 'Produtos cadastrados', free: '10', starter: '100', professional: 'Ilimitado', enterprise: 'Ilimitado' },
  { name: 'Usuários', free: '1', starter: '2', professional: '5', enterprise: 'Ilimitado' },
  { name: 'Relatórios', free: 'Básicos', starter: 'Completos', professional: 'Completos', enterprise: 'Completos' },
  { name: 'Exportação', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Previsão com IA', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Integrações', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Multi-lojas', free: false, starter: false, professional: false, enterprise: true },
  { name: 'API dedicada', free: false, starter: false, professional: false, enterprise: true },
  { name: 'White-label', free: false, starter: false, professional: false, enterprise: true },
  { name: 'Suporte prioritário', free: false, starter: false, professional: true, enterprise: true },
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
          Selecione o plano ideal para o seu negócio. Faça upgrade a qualquer momento.
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
          const isPopular = plan.type === 'professional';
          const isRecommended = plan.type === 'starter';
          const canUpgrade = !isCurrentPlan && plan.type !== 'free';
          
          return (
            <Card 
              key={plan.type} 
              className={cn(
                "relative flex flex-col transition-all duration-300 hover:shadow-lg",
                isCurrentPlan && "ring-2 ring-primary",
                isPopular && "border-primary border-2"
              )}
            >
              {(isPopular || isRecommended) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={cn(
                    "text-white",
                    isPopular ? "bg-purple-600 hover:bg-purple-600" : "bg-amber-500 hover:bg-amber-500"
                  )}>
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white bg-gradient-to-br",
                  planColors[plan.type]
                )}>
                  {planIcons[plan.type]}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/mês</span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <FeatureItem 
                      key={index}
                      included={feature.included} 
                      text={feature.text} 
                    />
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled
                  >
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
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleUpgrade(plan.type)}
                    disabled={stripeLoading}
                  >
                    Falar com vendas
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
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

      {/* Features Comparison Table - Hidden on mobile, shown on tablet+ */}
      <div className="mt-8 sm:mt-16 hidden md:block">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-8">Comparativo de Recursos</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-medium text-sm sm:text-base">Recurso</th>
                {staticPlans.map(plan => (
                  <th key={plan.type} className="text-center py-3 sm:py-4 px-2 sm:px-4 font-medium text-sm sm:text-base">
                    {plan.name}
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
                  <td className="text-center py-3 sm:py-4 px-2 sm:px-4">
                    <FeatureValue value={feature.professional} />
                  </td>
                  <td className="text-center py-3 sm:py-4 px-2 sm:px-4">
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
          Falar com Suporte
        </Button>
      </div>
    </div>
  );
}

function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2">
      {included ? (
        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <span className={cn(!included && "text-muted-foreground")}>{text}</span>
    </li>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}