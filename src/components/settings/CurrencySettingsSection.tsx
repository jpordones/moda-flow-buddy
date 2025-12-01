import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencySettings } from "@/types/settings";
import { DollarSign } from "lucide-react";

interface CurrencySettingsSectionProps {
  settings: CurrencySettings;
  onUpdate: (updates: Partial<CurrencySettings>) => void;
  formatCurrency: (value: number) => string;
}

export function CurrencySettingsSection({ settings, onUpdate, formatCurrency }: CurrencySettingsSectionProps) {
  const previewValue = 1234.56;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <DollarSign className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Formato de Moeda</CardTitle>
            <CardDescription>Configure como os valores monetários são exibidos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency-symbol">Símbolo da Moeda</Label>
            <Select
              value={settings.symbol}
              onValueChange={(value) => onUpdate({ symbol: value })}
            >
              <SelectTrigger id="currency-symbol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R$">R$ (Real)</SelectItem>
                <SelectItem value="$">$ (Dólar)</SelectItem>
                <SelectItem value="€">€ (Euro)</SelectItem>
                <SelectItem value="£">£ (Libra)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimal-separator">Separador Decimal</Label>
            <Select
              value={settings.decimalSeparator}
              onValueChange={(value: ',' | '.') => onUpdate({ decimalSeparator: value })}
            >
              <SelectTrigger id="decimal-separator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Vírgula (,)</SelectItem>
                <SelectItem value=".">Ponto (.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thousand-separator">Separador de Milhar</Label>
            <Select
              value={settings.thousandSeparator}
              onValueChange={(value: '.' | ',' | ' ') => onUpdate({ thousandSeparator: value })}
            >
              <SelectTrigger id="thousand-separator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=".">Ponto (.)</SelectItem>
                <SelectItem value=",">Vírgula (,)</SelectItem>
                <SelectItem value=" ">Espaço ( )</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimal-places">Casas Decimais</Label>
            <Select
              value={settings.decimalPlaces.toString()}
              onValueChange={(value) => onUpdate({ decimalPlaces: parseInt(value) as 0 | 2 | 3 | 4 })}
            >
              <SelectTrigger id="decimal-places">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 casas</SelectItem>
                <SelectItem value="2">2 casas</SelectItem>
                <SelectItem value="3">3 casas</SelectItem>
                <SelectItem value="4">4 casas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-sm text-muted-foreground">Exemplo de Visualização</Label>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(previewValue)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
