import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Box, 
  Building2, 
  ShoppingCart, 
  Receipt, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';
import { PricingResult, PricingData } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface PriceAnatomyCardProps {
  result: PricingResult;
  data: PricingData;
}

export function PriceAnatomyCard({ result, data }: PriceAnatomyCardProps) {
  if (!result.viable) return null;

  const totalPrice = result.suggestedPrice;
  const directCosts = result.directCost;
  const fixedCostPerUnit = result.fixedCostPerUnit;
  const totalFixedCosts = result.totalFixedCostsMonthly;
  const monthlyVolume = data.config.monthlyVolume;
  
  // Calcular custos variáveis detalhados
  const marketplaceFee = data.variableCosts.marketplaceFee;
  const gatewayFee = data.variableCosts.paymentGateway;
  const shippingCost = data.variableCosts.shippingCost;
  const shippingPackaging = data.variableCosts.shippingPackaging;
  const adsCost = data.variableCosts.adsCost;
  const returnRate = data.variableCosts.reverseLogistics;
  
  // Custos variáveis em R$
  const variableCostsValue = result.variableFixedCosts + (result.suggestedPrice * result.variableFeesPercent);
  
  // Impostos
  const taxes = result.suggestedPrice * result.taxPercent;
  const taxRate = result.taxPercent * 100;
  const taxRegime = data.taxes.taxRegime;
  
  // Lucro
  const netProfit = result.netProfit;

  // Custos do produto detalhados
  const materialCost = data.productCosts.fabric;
  const accessoriesCost = data.productCosts.accessories;
  const packagingCost = data.productCosts.packaging;
  const laborCost = data.productCosts.laborCost;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Anatomia do Preço - De onde vem cada centavo
        </CardTitle>
        <CardDescription>
          Entenda a composição completa do seu preço de venda de {formatarMoeda(totalPrice)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. CUSTOS DIRETOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              <span className="font-semibold">Custos Diretos do Produto</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Custos que variam com cada peça produzida. Quanto mais produz, mais gasta nesses itens.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xl font-bold">{formatarMoeda(directCosts)}</span>
          </div>
          
          <Progress 
            value={(directCosts / totalPrice) * 100} 
            className="h-3"
          />
          
          <div className="ml-6 text-sm text-muted-foreground space-y-1 font-mono">
            <p>├─ Tecido/Material: {formatarMoeda(materialCost)}</p>
            <p>├─ Aviamentos: {formatarMoeda(accessoriesCost)}</p>
            <p>├─ Embalagem: {formatarMoeda(packagingCost)}</p>
            <p>└─ Mão de obra: {formatarMoeda(laborCost)}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-primary">
              {formatarPorcentagem((directCosts / totalPrice) * 100)} do preço final
            </span>
            <span className="text-muted-foreground">Base de produção</span>
          </div>
        </div>

        <Separator />

        {/* 2. CUSTOS FIXOS DILUÍDOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Custos Fixos Diluídos</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-medium mb-2">💡 Por que diluir custos fixos?</p>
                    <p className="text-xs mb-2">
                      Custos como aluguel e salários existem independente de quantas peças você produz.
                    </p>
                    <div className="bg-muted p-2 rounded text-xs space-y-1 mt-2">
                      <p className="font-medium">Exemplo com R$ 10.000/mês:</p>
                      <p>• 300 peças → R$ 33,33/peça</p>
                      <p>• 500 peças → R$ 20,00/peça ⬇️</p>
                      <p>• 1000 peças → R$ 10,00/peça ⬇️⬇️</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xl font-bold">{formatarMoeda(fixedCostPerUnit)}</span>
          </div>
          
          <Progress 
            value={(fixedCostPerUnit / totalPrice) * 100} 
            className="h-3 [&>div]:bg-blue-500"
          />
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
            <p className="text-muted-foreground mb-2">
              {formatarMoeda(totalFixedCosts)}/mês ÷ {monthlyVolume} peças
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              💡 Produzindo mais {Math.ceil(monthlyVolume * 0.5)} peças, esse custo cai para {formatarMoeda(fixedCostPerUnit / 1.5)}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-blue-600">
              {formatarPorcentagem((fixedCostPerUnit / totalPrice) * 100)} do preço final
            </span>
            <span className="text-muted-foreground">Operação mensal</span>
          </div>
        </div>

        <Separator />

        {/* 3. CUSTOS DE VENDA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Custos de Venda</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Custos que acontecem toda vez que você faz uma venda: frete, embalagem, taxas de marketplace e gateway.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xl font-bold">{formatarMoeda(variableCostsValue)}</span>
          </div>
          
          <Progress 
            value={(variableCostsValue / totalPrice) * 100} 
            className="h-3 [&>div]:bg-orange-500"
          />
          
          <div className="ml-6 text-sm text-muted-foreground space-y-1 font-mono">
            {marketplaceFee > 0 && (
              <p>├─ Taxa Marketplace ({marketplaceFee}%): {formatarMoeda(totalPrice * marketplaceFee / 100)}</p>
            )}
            <p>├─ Gateway Pagamento ({gatewayFee}%): {formatarMoeda(totalPrice * gatewayFee / 100)}</p>
            <p>├─ Frete: {formatarMoeda(shippingCost)}</p>
            <p>├─ Embalagem envio: {formatarMoeda(shippingPackaging)}</p>
            {adsCost > 0 && (
              <p>├─ Marketing ({adsCost}%): {formatarMoeda(totalPrice * adsCost / 100)}</p>
            )}
            {returnRate > 0 && (
              <p>└─ Devoluções ({returnRate}%): {formatarMoeda(totalPrice * returnRate / 100)}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-orange-600">
              {formatarPorcentagem((variableCostsValue / totalPrice) * 100)} do preço final
            </span>
            <span className="text-muted-foreground">Por cada venda</span>
          </div>
        </div>

        <Separator />

        {/* 4. IMPOSTOS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-500" />
              <span className="font-semibold">Impostos</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Tributos obrigatórios sobre cada venda. No Simples Nacional, varia de 4% a 19% conforme faturamento.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-xl font-bold text-red-600">{formatarMoeda(taxes)}</span>
          </div>
          
          <Progress 
            value={(taxes / totalPrice) * 100} 
            className="h-3 [&>div]:bg-red-500"
          />
          
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
            <p className="text-muted-foreground">
              {taxRegime === 'simples' 
                ? `Simples Nacional - Alíquota de ${taxRate.toFixed(1)}%`
                : `ICMS + PIS + COFINS = ${taxRate.toFixed(1)}%`
              }
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-red-600">
              {formatarPorcentagem((taxes / totalPrice) * 100)} do preço final
            </span>
            <span className="text-muted-foreground">Obrigatório</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* 5. LUCRO LÍQUIDO */}
        <div className="space-y-3 p-4 bg-success/10 dark:bg-success/5 rounded-lg border border-success">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-success" />
              <span className="font-bold text-success">Seu Lucro Líquido</span>
            </div>
            <span className="text-2xl font-bold text-success">{formatarMoeda(netProfit)}</span>
          </div>
          
          <Progress 
            value={(netProfit / totalPrice) * 100} 
            className="h-3 [&>div]:bg-success"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-success">
              {formatarPorcentagem((netProfit / totalPrice) * 100)} de margem líquida
            </span>
            <span className="text-sm text-success/80">
              {formatarMoeda(netProfit * monthlyVolume)} por mês
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
