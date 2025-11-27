import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configurações</h1>
        <p className="text-gray-600">Personalize o sistema de acordo com suas necessidades</p>
      </div>

      <Card>
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-brand/10">
              <SettingsIcon className="h-6 w-6 text-brand-foreground" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Em Desenvolvimento</CardTitle>
              <CardDescription className="text-gray-600">Esta funcionalidade estará disponível em breve</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="border-t border-border pt-4">
            <p className="text-gray-600">
              Aqui você poderá configurar categorias personalizadas, preferências e outras opções do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
