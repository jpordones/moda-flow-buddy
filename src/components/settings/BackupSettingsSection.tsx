import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, RotateCcw } from "lucide-react";
import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BackupSettingsSectionProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onReset: () => void;
}

export function BackupSettingsSection({ onExport, onImport, onReset }: BackupSettingsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
        toast.success('Configurações importadas com sucesso!');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao importar configurações');
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    onReset();
    toast.success('Configurações restauradas para o padrão');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Database className="h-5 w-5 text-brand-foreground" />
          </div>
          <div>
            <CardTitle className="text-gray-900">Backup e Dados</CardTitle>
            <CardDescription>Exporte, importe ou restaure suas configurações</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="outline" onClick={onExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exportar Configurações
          </Button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-settings"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Configurações
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar configurações padrão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá apagar todas as suas configurações personalizadas e restaurar os valores padrão do sistema. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Restaurar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-sm text-muted-foreground">
          Suas configurações são salvas automaticamente no navegador. Use a exportação para fazer backup ou transferir para outro dispositivo.
        </p>
      </CardContent>
    </Card>
  );
}
