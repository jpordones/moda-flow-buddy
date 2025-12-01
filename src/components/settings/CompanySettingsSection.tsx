import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CompanySettings } from "@/types/settings";
import { Building2, Upload, X } from "lucide-react";
import { useRef } from "react";

interface CompanySettingsSectionProps {
  settings: CompanySettings;
  onUpdate: (updates: Partial<CompanySettings>) => void;
}

export function CompanySettingsSection({ settings, onUpdate }: CompanySettingsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onUpdate({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Building2 className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Informações da Empresa</CardTitle>
            <CardDescription>Dados que aparecerão nos relatórios exportados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa/Marca</Label>
            <Input
              id="company-name"
              value={settings.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Sua empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-document">CNPJ/CPF (opcional)</Label>
            <Input
              id="company-document"
              value={settings.document}
              onChange={(e) => onUpdate({ document: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-currency">Moeda Padrão</Label>
            <Select
              value={settings.defaultCurrency}
              onValueChange={(value) => onUpdate({ defaultCurrency: value })}
            >
              <SelectTrigger id="default-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL (Real Brasileiro)</SelectItem>
                <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo da Empresa</Label>
          <div className="flex items-center gap-4">
            {settings.logo ? (
              <div className="relative">
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="h-16 w-16 object-contain rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {settings.logo ? 'Alterar Logo' : 'Enviar Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 2MB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
