import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, CreditCard, Truck, Megaphone } from 'lucide-react';
import { VariableSalesCosts, MarketplaceType, marketplacePresets } from '@/types/pricing';
import { formatarMoeda } from '@/lib/formatters';

interface VariableSalesCostsSectionProps {
  costs: VariableSalesCosts;
  onUpdate: (updates: Partial<VariableSalesCosts>) => void;
  onSetMarketplace: (type: MarketplaceType) => void;
}

export function VariableSalesCostsSection({ costs, onUpdate, onSetMarketplace }: VariableSalesCostsSectionProps) {
  const totalFixedVariable = costs.shippingCost + costs.shippingPackaging + costs.marketplaceShipping;
  const totalPercentVariable = costs.marketplaceFee + costs.paymentGateway + costs.reverseLogistics + costs.adsCost + costs.affiliateCommission;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-danger/20">
            <ShoppingCart className="h-5 w-5 text-danger" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg">Custos Variáveis de Venda</CardTitle>
            <CardDescription>
              Custos por cada venda realizada
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Fixos + %</p>
            <p className="text-lg font-bold text-danger">
              {formatarMoeda(totalFixedVariable)} + {totalPercentVariable.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Marketplace */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground">Marketplace</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Onde você vende?</Label>
              <Select
                value={costs.marketplaceType}
                onValueChange={(value) => onSetMarketplace(value as MarketplaceType)}
              >
                <SelectTrigger className="h-11 text-base mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(marketplacePresets).map(([key, { name }]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="marketplaceFee">Taxa Marketplace (%)</Label>
              <Input
                id="marketplaceFee"
                type="number"
                min={0}
                max={50}
                step={0.1}
                value={costs.marketplaceFee || ''}
                onChange={(e) => onUpdate({ marketplaceFee: Number(e.target.value) })}
                placeholder="Ex: 16"
                className="h-11 text-base mt-1"
                disabled={costs.marketplaceType !== 'custom' && costs.marketplaceType !== 'none'}
              />
            </div>
            
            <div className="sm:col-span-2">
              <Label htmlFor="marketplaceShipping">Taxa Frete Marketplace (R$)</Label>
              <Input
                id="marketplaceShipping"
                type="number"
                min={0}
                step={0.01}
                value={costs.marketplaceShipping || ''}
                onChange={(e) => onUpdate({ marketplaceShipping: Number(e.target.value) })}
                placeholder="Taxa fixa de envio (se houver)"
                className="h-11 text-base mt-1"
              />
            </div>
          </div>
        </div>

        {/* Pagamento */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground">Pagamento</h4>
          </div>
          
          <div>
            <Label htmlFor="paymentGateway">Taxa Gateway de Pagamento (%)</Label>
            <Input
              id="paymentGateway"
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={costs.paymentGateway || ''}
              onChange={(e) => onUpdate({ paymentGateway: Number(e.target.value) })}
              placeholder="Ex: 3.5"
              className="h-11 text-base mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Stripe/PagSeguro: ~3.5% | PIX: ~1% | Mercado Pago: ~4.99%
            </p>
          </div>
        </div>

        {/* Logística */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground">Logística</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shippingCost">Custo de Frete (R$)</Label>
              <Input
                id="shippingCost"
                type="number"
                min={0}
                step={0.01}
                value={costs.shippingCost || ''}
                onChange={(e) => onUpdate({ shippingCost: Number(e.target.value) })}
                placeholder="Ex: 15.00"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se você oferece frete grátis, coloque o custo aqui
              </p>
            </div>
            
            <div>
              <Label htmlFor="shippingPackaging">Embalagem de Envio (R$)</Label>
              <Input
                id="shippingPackaging"
                type="number"
                min={0}
                step={0.01}
                value={costs.shippingPackaging || ''}
                onChange={(e) => onUpdate({ shippingPackaging: Number(e.target.value) })}
                placeholder="Caixa, plástico bolha"
                className="h-11 text-base mt-1"
              />
            </div>
            
            <div className="sm:col-span-2">
              <Label htmlFor="reverseLogistics">Custo de Devoluções (%)</Label>
              <Input
                id="reverseLogistics"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={costs.reverseLogistics || ''}
                onChange={(e) => onUpdate({ reverseLogistics: Number(e.target.value) })}
                placeholder="Ex: 3"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Taxa média de devoluções/trocas (geralmente 2-5% para moda)
              </p>
            </div>
          </div>
        </div>

        {/* Marketing */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-foreground">Marketing</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adsCost">Custo de Marketing (%)</Label>
              <Input
                id="adsCost"
                type="number"
                min={0}
                max={50}
                step={0.1}
                value={costs.adsCost || ''}
                onChange={(e) => onUpdate({ adsCost: Number(e.target.value) })}
                placeholder="Ex: 10"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                % da venda investido em anúncios (Meta, Google, etc)
              </p>
            </div>
            
            <div>
              <Label htmlFor="affiliateCommission">Comissão Afiliados (%)</Label>
              <Input
                id="affiliateCommission"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={costs.affiliateCommission || ''}
                onChange={(e) => onUpdate({ affiliateCommission: Number(e.target.value) })}
                placeholder="Ex: 10"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se você usa programa de afiliados
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
