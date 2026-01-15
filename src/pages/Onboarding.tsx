import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ArrowLeft, Check, Store, Settings, Package, Sparkles } from 'lucide-react';
import fedcomLogo from '@/assets/FEDCOM.svg';
import { cn } from '@/lib/utils';

const SEGMENTS = [
  'Moda e Vestuário',
  'Acessórios',
  'Calçados',
  'Cosméticos e Beleza',
  'Eletrônicos',
  'Alimentos e Bebidas',
  'Casa e Decoração',
  'Artesanato',
  'Joias e Bijuterias',
  'Outro',
];

interface OnboardingData {
  companyName: string;
  segment: string;
  defaultMargin: number;
  monthlySalesGoal: number;
}

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    segment: '',
    defaultMargin: 30,
    monthlySalesGoal: 10000,
  });
  
  const { user, profile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && profile?.onboarding_completed) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const totalSteps = 4;

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return data.companyName.trim().length > 0;
      case 3:
        return data.segment.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setIsLoading(true);
      try {
        const { error } = await updateProfile({
          company_name: data.companyName,
          company_segment: data.segment,
          default_margin: data.defaultMargin,
          monthly_sales_goal: data.monthlySalesGoal,
          onboarding_completed: true,
        });

        if (error) {
          toast.error('Erro ao salvar', {
            description: 'Não foi possível salvar suas configurações'
          });
        } else {
          toast.success(`Bem-vindo ao FEDCOM, ${data.companyName}!`, {
            description: 'Sua empresa foi configurada com sucesso'
          });
          navigate('/');
        }
      } catch (error) {
        toast.error('Erro inesperado', {
          description: 'Ocorreu um problema. Tente novamente.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ onboarding_completed: true });
      navigate('/');
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Não foi possível pular o onboarding'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light to-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const steps = [
    { icon: Sparkles, title: 'Bem-vindo' },
    { icon: Store, title: 'Sua Loja' },
    { icon: Settings, title: 'Configurações' },
    { icon: Package, title: 'Finalizar' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-light via-background to-brand-light/50 dark:from-background dark:via-card dark:to-background">
      {/* Header - Responsivo */}
      <div className="flex justify-center py-6 md:py-8 px-4">
        <img src={fedcomLogo} alt="FEDCOM" className="h-12 md:h-16 w-auto" />
      </div>

      {/* Progress Steps - Responsivo */}
      <div className="flex justify-center mb-6 md:mb-8 px-4 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {steps.map((s, index) => (
            <div key={index} className="flex items-center">
              <div className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all",
                step > index + 1 && "bg-success/10",
                step === index + 1 && "bg-brand text-brand-foreground",
                step < index + 1 && "bg-muted text-muted-foreground"
              )}>
                <div className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0",
                  step > index + 1 && "bg-success text-success-foreground",
                  step === index + 1 && "bg-brand-foreground text-brand",
                  step < index + 1 && "bg-muted-foreground/20"
                )}>
                  {step > index + 1 ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <s.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
                <span className="hidden sm:inline text-xs md:text-sm font-medium whitespace-nowrap">{s.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-8 md:w-12 h-0.5 mx-1 sm:mx-2",
                  step > index + 1 ? "bg-success" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <Card className="w-full max-w-lg border-0 shadow-elevation-lg dark:shadow-dark-elevation-lg dark:border dark:border-border/50">
          <CardHeader className="text-center pb-4 px-4 md:px-6">
            {step === 1 && (
              <>
                <div className="mx-auto mb-4 w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-brand" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Bem-vindo ao FEDCOM!</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Vamos configurar sua loja em apenas 3 passos rápidos para você começar a gerenciar seus produtos e precificação.
                </CardDescription>
              </>
            )}
            {step === 2 && (
              <>
                <div className="mx-auto mb-4 w-14 h-14 md:w-16 md:h-16 rounded-full bg-info/10 flex items-center justify-center">
                  <Store className="h-7 w-7 md:h-8 md:w-8 text-info" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Dados da sua Loja</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Conte-nos sobre seu negócio
                </CardDescription>
              </>
            )}
            {step === 3 && (
              <>
                <div className="mx-auto mb-4 w-14 h-14 md:w-16 md:h-16 rounded-full bg-warning/10 flex items-center justify-center">
                  <Settings className="h-7 w-7 md:h-8 md:w-8 text-warning" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Configurações Iniciais</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Defina seus padrões de precificação
                </CardDescription>
              </>
            )}
            {step === 4 && (
              <>
                <div className="mx-auto mb-4 w-14 h-14 md:w-16 md:h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="h-7 w-7 md:h-8 md:w-8 text-success" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold">Tudo Pronto!</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Sua loja está configurada e pronta para uso
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6 px-4 md:px-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 rounded-lg bg-muted/50 text-center">
                    <Package className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-info" />
                    <p className="font-medium text-sm md:text-base">Gestão de Produtos</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Cadastre e controle seu estoque</p>
                  </div>
                  <div className="p-3 md:p-4 rounded-lg bg-muted/50 text-center">
                    <Settings className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-warning" />
                    <p className="font-medium text-sm md:text-base">Precificação</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Calcule preços ideais</p>
                  </div>
                  <div className="p-3 md:p-4 rounded-lg bg-muted/50 text-center">
                    <Store className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-success" />
                    <p className="font-medium text-sm md:text-base">Relatórios</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Acompanhe seu negócio</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm md:text-base">Nome da loja/empresa</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: Minha Loja Fashion"
                    value={data.companyName}
                    onChange={(e) => setData({ ...data, companyName: e.target.value })}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segment" className="text-sm md:text-base">Segmento</Label>
                  <Select
                    value={data.segment}
                    onValueChange={(value) => setData({ ...data, segment: value })}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((segment) => (
                        <SelectItem key={segment} value={segment}>
                          {segment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm md:text-base">Margem de lucro padrão</Label>
                    <span className="text-lg font-bold text-brand">{data.defaultMargin}%</span>
                  </div>
                  <Slider
                    value={[data.defaultMargin]}
                    onValueChange={(value) => setData({ ...data, defaultMargin: value[0] })}
                    min={5}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Essa margem será usada como padrão ao calcular preços
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesGoal" className="text-sm md:text-base">Meta de vendas mensal (R$)</Label>
                  <Input
                    id="salesGoal"
                    type="number"
                    placeholder="10000"
                    value={data.monthlySalesGoal}
                    onChange={(e) => setData({ ...data, monthlySalesGoal: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3 text-sm md:text-base">Resumo da configuração:</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Loja:</span>
                      <span className="font-medium text-right max-w-[60%] truncate">{data.companyName || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Segmento:</span>
                      <span className="font-medium text-right">{data.segment || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Margem padrão:</span>
                      <span className="font-medium">{data.defaultMargin}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Meta mensal:</span>
                      <span className="font-medium">R$ {data.monthlySalesGoal.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation - Mobile optimized */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
              <div className="w-full sm:w-auto">
                {step > 1 ? (
                  <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="w-full sm:w-auto h-11">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handleSkip} disabled={isLoading} className="w-full sm:w-auto h-11">
                    Pular por enquanto
                  </Button>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                size="lg"
                className="w-full sm:w-auto h-11"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {step === totalSteps ? 'Começar a usar' : 'Continuar'}
                {step < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}