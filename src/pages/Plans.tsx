import { Check, X, Crown, Zap, Building2, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
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
  starter: 'from-blue-500 to-blue-600',
  professional: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-amber-600'
};

const features: PlanFeature[] = [
  { name: 'Produtos cadastrados', free: '5', starter: '25', professional: '100', enterprise: 'Ilimitado' },
  { name: 'Análises de custo/mês', free: '10', starter: '50', professional: '200', enterprise: 'Ilimitado' },
  { name: 'Exportar PDF', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Exportar Excel', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Gestão de estoque', free: false, starter: true, professional: true, enterprise: true },
  { name: 'Fluxo de caixa', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Relatórios avançados', free: false, starter: false, professional: true, enterprise: true },
  { name: 'Multi-usuários', free: false, starter: false, professional: '5 usuários', enterprise: 'Ilimitado' },
  { name: 'Suporte prioritário', free: false, starter: false, professional: true, enterprise: true },
];

export default function Plans() {
  const { plans, currentPlan, loading, upgradePlan } = useSubscription();

  const handleUpgrade = async (planType: PlanType) => {
    if (planType === 'enterprise') {
      window.open('mailto:contato@fedcom.com.br?subject=Interesse no Plano Enterprise', '_blank');
      return;
    }
    await upgradePlan(planType);
  };

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
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Selecione o plano ideal para o seu negócio. Faça upgrade a qualquer momento.
        </p>
      </div>

      {/* Current Plan Badge */}
      {currentPlan && (
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="text-base px-4 py-2">
            Plano atual: <span className="font-semibold ml-1">{currentPlan.plan_name}</span>
          </Badge>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map(plan => {
          const isCurrentPlan = currentPlan?.plan_type === plan.type;
          const isPopular = plan.type === 'professional';
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative flex flex-col transition-all duration-300 hover:shadow-lg",
                isCurrentPlan && "ring-2 ring-primary",
                isPopular && "border-primary"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={cn(
                  "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white bg-gradient-to-br",
                  planColors[plan.type as PlanType]
                )}>
                  {planIcons[plan.type as PlanType]}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.type === 'free' && 'Para começar'}
                  {plan.type === 'starter' && 'Para pequenos negócios'}
                  {plan.type === 'professional' && 'Para equipes em crescimento'}
                  {plan.type === 'enterprise' && 'Para grandes empresas'}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/mês</span>
                  )}
                </div>

                <ul className="space-y-3">
                  <FeatureItem 
                    included={true} 
                    text={plan.max_products === -1 ? 'Produtos ilimitados' : `${plan.max_products} produtos`} 
                  />
                  <FeatureItem 
                    included={true} 
                    text={plan.max_cost_analyses === -1 ? 'Análises ilimitadas' : `${plan.max_cost_analyses} análises/mês`} 
                  />
                  <FeatureItem included={plan.has_export_pdf} text="Exportar PDF" />
                  <FeatureItem included={plan.has_export_excel} text="Exportar Excel" />
                  <FeatureItem included={plan.has_stock_management} text="Gestão de estoque" />
                  <FeatureItem included={plan.has_cash_flow} text="Fluxo de caixa" />
                  <FeatureItem included={plan.has_reports} text="Relatórios avançados" />
                  <FeatureItem 
                    included={plan.has_multi_users} 
                    text={plan.max_users === -1 ? 'Usuários ilimitados' : `${plan.max_users} usuário${plan.max_users > 1 ? 's' : ''}`} 
                  />
                  <FeatureItem included={plan.has_priority_support} text="Suporte prioritário" />
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : isPopular ? "default" : "secondary"}
                  disabled={isCurrentPlan}
                  onClick={() => handleUpgrade(plan.type as PlanType)}
                >
                  {isCurrentPlan ? 'Plano Atual' : plan.type === 'enterprise' ? 'Falar com Vendas' : 'Escolher Plano'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison Table */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Comparativo de Recursos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium">Recurso</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center py-4 px-4 font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.name} className={cn("border-b", index % 2 === 0 && "bg-muted/50")}>
                  <td className="py-4 px-4">{feature.name}</td>
                  <td className="text-center py-4 px-4">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="text-center py-4 px-4">
                    <FeatureValue value={feature.starter} />
                  </td>
                  <td className="text-center py-4 px-4">
                    <FeatureValue value={feature.professional} />
                  </td>
                  <td className="text-center py-4 px-4">
                    <FeatureValue value={feature.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ or CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Dúvidas?</h2>
        <p className="text-muted-foreground mb-6">
          Entre em contato conosco para saber mais sobre nossos planos e encontrar a melhor opção para você.
        </p>
        <Button variant="outline" size="lg">
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
