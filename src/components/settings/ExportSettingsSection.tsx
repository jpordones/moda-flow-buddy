import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportSettings } from "@/types/settings";
import { FileDown } from "lucide-react";

interface ExportSettingsSectionProps {
  settings: ExportSettings;
  onUpdate: (updates: Partial<ExportSettings>) => void;
}

export function ExportSettingsSection({ settings, onUpdate }: ExportSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <FileDown className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Exportação</CardTitle>
            <CardDescription>Personalize seus relatórios exportados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Conteúdo do Relatório</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-logo">Incluir logo da empresa</Label>
              <Switch
                id="include-logo"
                checked={settings.includeLogo}
                onCheckedChange={(checked) => onUpdate({ includeLogo: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-company">Incluir informações da empresa</Label>
              <Switch
                id="include-company"
                checked={settings.includeCompanyInfo}
                onCheckedChange={(checked) => onUpdate({ includeCompanyInfo: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-breakdown">Incluir detalhamento de custos</Label>
              <Switch
                id="include-breakdown"
                checked={settings.includeCostBreakdown}
                onCheckedChange={(checked) => onUpdate({ includeCostBreakdown: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-charts">Incluir gráficos</Label>
              <Switch
                id="include-charts"
                checked={settings.includeCharts}
                onCheckedChange={(checked) => onUpdate({ includeCharts: checked })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="file-name">Nome padrão do arquivo</Label>
            <Input
              id="file-name"
              value={settings.defaultFileName}
              onChange={(e) => onUpdate({ defaultFileName: e.target.value })}
              placeholder="relatorio-precificacao"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-scheme">Esquema de cores do PDF</Label>
            <Select
              value={settings.pdfColorScheme}
              onValueChange={(value: ExportSettings['pdfColorScheme']) => onUpdate({ pdfColorScheme: value })}
            >
              <SelectTrigger id="color-scheme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="minimal">Minimalista</SelectItem>
                <SelectItem value="branded">Com marca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
