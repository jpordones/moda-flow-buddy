import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt } from 'lucide-react';
import { TaxSettings, TaxRegime } from '@/types/pricing';

interface TaxSettingsSectionProps {
  taxes: TaxSettings;
  onUpdate: (updates: Partial<TaxSettings>) => void;
}

export function TaxSettingsSection({ taxes, onUpdate }: TaxSettingsSectionProps) {
  const totalTax = taxes.taxRegime === 'simples'
    ? taxes.simplesRate
    : taxes.icms + taxes.pis + taxes.cofins;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Receipt className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg">Impostos</CardTitle>
            <CardDescription>
              Configuração do regime tributário
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-purple-500">{totalTax.toFixed(1)}%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Regime Tributário</Label>
          <Select
            value={taxes.taxRegime}
            onValueChange={(value) => onUpdate({ taxRegime: value as TaxRegime })}
          >
            <SelectTrigger className="h-11 text-base mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simples">Simples Nacional</SelectItem>
              <SelectItem value="presumido">Lucro Presumido</SelectItem>
              <SelectItem value="real">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {taxes.taxRegime === 'simples' && (
          <div>
            <Label htmlFor="simplesRate">Alíquota Simples Nacional (%)</Label>
            <Input
              id="simplesRate"
              type="number"
              min={4}
              max={33}
              step={0.1}
              value={taxes.simplesRate || ''}
              onChange={(e) => onUpdate({ simplesRate: Number(e.target.value) })}
              placeholder="Ex: 6.0"
              className="h-11 text-base mt-1"
            />
            <div className="mt-2 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Faixas do Simples Nacional (Anexo I - Comércio):</strong>
              </p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>• Até R$ 180.000/ano: <strong>4%</strong></li>
                <li>• R$ 180.001 a R$ 360.000: <strong>7,3%</strong></li>
                <li>• R$ 360.001 a R$ 720.000: <strong>9,5%</strong></li>
                <li>• R$ 720.001 a R$ 1.800.000: <strong>10,7%</strong></li>
                <li>• R$ 1.800.001 a R$ 3.600.000: <strong>14,3%</strong></li>
                <li>• R$ 3.600.001 a R$ 4.800.000: <strong>19%</strong></li>
              </ul>
            </div>
          </div>
        )}

        {taxes.taxRegime !== 'simples' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="icms">ICMS (%)</Label>
              <Input
                id="icms"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={taxes.icms || ''}
                onChange={(e) => onUpdate({ icms: Number(e.target.value) })}
                placeholder="Ex: 18"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Varia por estado (7% a 18%)
              </p>
            </div>
            
            <div>
              <Label htmlFor="pis">PIS (%)</Label>
              <Input
                id="pis"
                type="number"
                min={0}
                max={5}
                step={0.01}
                value={taxes.pis || ''}
                onChange={(e) => onUpdate({ pis: Number(e.target.value) })}
                placeholder="Ex: 1.65"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                0,65% (cumulativo) ou 1,65% (não-cumulativo)
              </p>
            </div>
            
            <div>
              <Label htmlFor="cofins">COFINS (%)</Label>
              <Input
                id="cofins"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={taxes.cofins || ''}
                onChange={(e) => onUpdate({ cofins: Number(e.target.value) })}
                placeholder="Ex: 7.6"
                className="h-11 text-base mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                3% (cumulativo) ou 7,6% (não-cumulativo)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
