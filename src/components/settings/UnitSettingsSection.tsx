import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitSettings } from "@/types/settings";
import { Ruler } from "lucide-react";

interface UnitSettingsSectionProps {
  settings: UnitSettings;
  onUpdate: (updates: Partial<UnitSettings>) => void;
}

const unitOptions = [
  { value: 'unit', label: 'Peça/Unidade' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'liter', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'meter', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'pack', label: 'Pacote' },
  { value: 'box', label: 'Caixa' },
];

export function UnitSettingsSection({ settings, onUpdate }: UnitSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Ruler className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Unidades de Medida</CardTitle>
            <CardDescription>Configure a unidade padrão para seus produtos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default-unit">Unidade Padrão</Label>
            <Select
              value={settings.defaultUnit}
              onValueChange={(value: UnitSettings['defaultUnit']) => onUpdate({ defaultUnit: value })}
            >
              <SelectTrigger id="default-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-label">Rótulo Personalizado</Label>
            <Input
              id="custom-label"
              value={settings.customUnitLabel}
              onChange={(e) => onUpdate({ customUnitLabel: e.target.value })}
              placeholder="Ex: Peça, Unidade, Item"
            />
            <p className="text-xs text-muted-foreground">
              Será exibido como: "por {settings.customUnitLabel || 'unidade'}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
