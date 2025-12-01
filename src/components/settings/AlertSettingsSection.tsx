import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertSettings } from "@/types/settings";
import { Bell } from "lucide-react";

interface AlertSettingsSectionProps {
  settings: AlertSettings;
  onUpdate: (updates: Partial<AlertSettings>) => void;
}

export function AlertSettingsSection({ settings, onUpdate }: AlertSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Bell className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Alertas e Notificações</CardTitle>
            <CardDescription>Configure avisos automáticos sobre sua precificação</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="low-margin-alert" className="font-medium">Alertar margem baixa</Label>
            <p className="text-sm text-muted-foreground">Notificar quando a margem estiver abaixo do limite</p>
          </div>
          <div className="flex items-center gap-3">
            {settings.lowMarginAlert && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.lowMarginThreshold}
                  onChange={(e) => onUpdate({ lowMarginThreshold: parseInt(e.target.value) || 0 })}
                  className="w-16 text-right"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            )}
            <Switch
              id="low-margin-alert"
              checked={settings.lowMarginAlert}
              onCheckedChange={(checked) => onUpdate({ lowMarginAlert: checked })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="below-cost-alert" className="font-medium">Alertar preço abaixo do custo</Label>
            <p className="text-sm text-muted-foreground">Notificar quando preço estiver próximo ao custo</p>
          </div>
          <div className="flex items-center gap-3">
            {settings.belowCostAlert && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Buffer:</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.belowCostBuffer}
                  onChange={(e) => onUpdate({ belowCostBuffer: parseInt(e.target.value) || 0 })}
                  className="w-16 text-right"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            )}
            <Switch
              id="below-cost-alert"
              checked={settings.belowCostAlert}
              onCheckedChange={(checked) => onUpdate({ belowCostAlert: checked })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div>
            <Label htmlFor="monthly-reminder" className="font-medium">Lembrete mensal de revisão</Label>
            <p className="text-sm text-muted-foreground">Sugerir revisão de custos fixos todo mês</p>
          </div>
          <Switch
            id="monthly-reminder"
            checked={settings.monthlyReviewReminder}
            onCheckedChange={(checked) => onUpdate({ monthlyReviewReminder: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
