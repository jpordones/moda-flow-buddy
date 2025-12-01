import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TaxSettings } from "@/types/settings";
import { Receipt } from "lucide-react";

interface TaxSettingsSectionProps {
  settings: TaxSettings;
  onUpdate: (updates: Partial<TaxSettings>) => void;
}

export function TaxSettingsSection({ settings, onUpdate }: TaxSettingsSectionProps) {
  const toggleTax = (taxId: string) => {
    const updatedBreakdown = settings.taxBreakdown.map(tax =>
      tax.id === taxId ? { ...tax, enabled: !tax.enabled } : tax
    );
    onUpdate({ taxBreakdown: updatedBreakdown });
  };

  const updateTaxPercentage = (taxId: string, percentage: number) => {
    const updatedBreakdown = settings.taxBreakdown.map(tax =>
      tax.id === taxId ? { ...tax, percentage } : tax
    );
    onUpdate({ taxBreakdown: updatedBreakdown });
  };

  const totalTax = settings.taxBreakdown
    .filter(t => t.enabled)
    .reduce((sum, t) => sum + t.percentage, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Receipt className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Impostos e Encargos</CardTitle>
            <CardDescription>Configure os impostos que serão aplicados automaticamente</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <Label htmlFor="include-taxes" className="font-medium">Incluir impostos automaticamente</Label>
            <p className="text-sm text-muted-foreground">Os impostos serão adicionados ao preço final</p>
          </div>
          <Switch
            id="include-taxes"
            checked={settings.includeTaxes}
            onCheckedChange={(checked) => onUpdate({ includeTaxes: checked })}
          />
        </div>

        {settings.includeTaxes && (
          <>
            <div className="space-y-2">
              <Label htmlFor="total-tax">Percentual Total de Impostos</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="total-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxPercentage}
                  onChange={(e) => onUpdate({ taxPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-32"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Detalhamento por Categoria</Label>
              <div className="space-y-2">
                {settings.taxBreakdown.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={tax.enabled}
                        onCheckedChange={() => toggleTax(tax.id)}
                      />
                      <span className={tax.enabled ? 'text-gray-900' : 'text-muted-foreground'}>
                        {tax.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={tax.percentage}
                        onChange={(e) => updateTaxPercentage(tax.id, parseFloat(e.target.value) || 0)}
                        className="w-20 text-right"
                        disabled={!tax.enabled}
                      />
                      <span className="text-muted-foreground w-4">%</span>
                    </div>
                  </div>
                ))}
              </div>
              {totalTax > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total selecionado: <span className="font-medium text-gray-900">{totalTax.toFixed(2)}%</span>
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
