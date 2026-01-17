import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  TrendingDown,
  ArrowRight 
} from 'lucide-react';
import { PricingResult, PricingData } from '@/types/pricing';
import { formatarMoeda, formatarPorcentagem } from '@/lib/formatters';

interface SmartAlertsSectionProps {
  result: PricingResult;
  data: PricingData;
}

export function SmartAlertsSection({ result, data }: SmartAlertsSectionProps) {
  if (!result.viable) return null;

  const netMargin = result.netMargin;
  const directCosts = result.directCost;
  const fixedCostPerUnit = result.fixedCostPerUnit;
  const calculatedPrice = result.calculatedPrice;
  const monthlyVolume = data.config.monthlyVolume;
  const marketPrice = data.config.marketPrice;
  const adsCost = data.variableCosts.adsCost;

  const alerts = [];

  // Alerta: Margem Baixa
  if (netMargin < 20 && netMargin > 0) {
    alerts.push(
      <Alert key="low-margin" variant="default" className="border-warning bg-warning/10">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="font-semibold">⚠️ Margem de Lucro Abaixo do Recomendado</AlertTitle>
        <AlertDescription>
          <p className="mb-3">
            Sua margem de <strong>{formatarPorcentagem(netMargin)}</strong> está abaixo do ideal para e-commerce (20-35%). 
            Isso pode comprometer a sustentabilidade do negócio.
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-medium">💡 Sugestões para melhorar:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-warning" />
                <span>
                  Negociar <strong>10% de desconto</strong> com fornecedor = <strong className="text-success">+{formatarMoeda(directCosts * 0.1)}</strong> de lucro por peça
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-warning" />
                <span>
                  Aumentar volume para <strong>{Math.ceil(monthlyVolume * 1.5)} peças/mês</strong> = reduz custo fixo de {formatarMoeda(fixedCostPerUnit)} para {formatarMoeda(fixedCostPerUnit / 1.5)}
                </span>
              </li>
              {adsCost > 5 && (
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-warning" />
                  <span>
                    Reduzir gastos com marketing de {adsCost}% para {Math.max(adsCost - 3, 5)}% = <strong className="text-success">+{formatarMoeda(calculatedPrice * 0.03)}</strong> por venda
                  </span>
                </li>
              )}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta: Custo Fixo Muito Alto
  if (fixedCostPerUnit / calculatedPrice > 0.3) {
    alerts.push(
      <Alert key="high-fixed" variant="default" className="border-warning bg-warning/10">
        <TrendingDown className="h-4 w-4 text-warning" />
        <AlertTitle className="font-semibold">⚠️ Custos Fixos Representam Muito do Preço</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Seus custos fixos representam <strong>{formatarPorcentagem((fixedCostPerUnit / calculatedPrice) * 100)}</strong> do preço final. 
            O ideal é manter abaixo de 30%.
          </p>
          <div className="p-3 bg-background rounded-lg mt-3">
            <p className="text-sm font-medium mb-2">💡 Solução: Aumentar escala</p>
            <div className="text-sm space-y-1">
              <p>• Volume atual: {monthlyVolume} peças → {formatarMoeda(fixedCostPerUnit)}/peça</p>
              <p className="text-success">
                • Volume {Math.ceil(monthlyVolume * 1.5)}: peças → {formatarMoeda(fixedCostPerUnit / 1.5)}/peça
                <strong> (-{formatarMoeda(fixedCostPerUnit - fixedCostPerUnit / 1.5)})</strong>
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta: Preço Não Competitivo
  if (marketPrice > 0 && calculatedPrice > marketPrice * 1.2) {
    alerts.push(
      <Alert key="not-competitive" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">🚨 Preço Acima do Mercado</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Seu preço está <strong>{(((calculatedPrice - marketPrice) / marketPrice) * 100).toFixed(0)}%</strong> acima do praticado no mercado ({formatarMoeda(marketPrice)}).
          </p>
          <p className="text-sm">
            Com esse preço, você provavelmente terá dificuldade para vender. 
            Considere revisar seus custos ou aceitar uma margem menor para ser competitivo.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta: Sucesso - Margem Boa
  if (netMargin >= 30 && netMargin <= 50 && alerts.length === 0) {
    alerts.push(
      <Alert key="success" className="border-success bg-success/5">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle className="font-semibold text-success">✓ Precificação Ideal!</AlertTitle>
        <AlertDescription>
          <p>
            Sua margem de <strong>{formatarPorcentagem(netMargin)}</strong> está na faixa ideal para e-commerce de moda (30-50%). 
            Continue monitorando custos e otimizando processos.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Margem muito alta (pode estar perdendo vendas)
  if (netMargin > 50) {
    alerts.push(
      <Alert key="high-margin" className="border-info bg-info/5">
        <CheckCircle className="h-4 w-4 text-info" />
        <AlertTitle className="font-semibold text-info">💡 Margem Alta Detectada</AlertTitle>
        <AlertDescription>
          <p>
            Sua margem de <strong>{formatarPorcentagem(netMargin)}</strong> é alta! 
            Se as vendas estão boas, ótimo. Senão, considere reduzir um pouco o preço para aumentar o volume.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts}
    </div>
  );
}
