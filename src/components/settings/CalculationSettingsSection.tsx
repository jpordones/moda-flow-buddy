import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CalculationDefaults } from "@/types/settings";
import { Calculator } from "lucide-react";

interface CalculationSettingsSectionProps {
  settings: CalculationDefaults;
  onUpdate: (updates: Partial<CalculationDefaults>) => void;
}

export function CalculationSettingsSection({ settings, onUpdate }: CalculationSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Calculator className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Padrões de Cálculo</CardTitle>
            <CardDescription>Valores padrão para novos cálculos de precificação</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Margem de Lucro Padrão</Label>
              <span className="text-sm font-medium text-brand-foreground">{settings.defaultProfitMargin}%</span>
            </div>
            <Slider
              value={[settings.defaultProfitMargin]}
              onValueChange={([value]) => onUpdate({ defaultProfitMargin: value })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Margem Premium Padrão</Label>
              <span className="text-sm font-medium text-brand-foreground">{settings.defaultPremiumMargin}%</span>
            </div>
            <Slider
              value={[settings.defaultPremiumMargin]}
              onValueChange={([value]) => onUpdate({ defaultPremiumMargin: value })}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default-sales">Média de Vendas Padrão (peças/mês)</Label>
            <Input
              id="default-sales"
              type="number"
              min="1"
              value={settings.defaultMonthlySales}
              onChange={(e) => onUpdate({ defaultMonthlySales: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markup-rate">Taxa de Markup Padrão (%)</Label>
            <Input
              id="markup-rate"
              type="number"
              min="0"
              value={settings.defaultMarkupRate}
              onChange={(e) => onUpdate({ defaultMarkupRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
