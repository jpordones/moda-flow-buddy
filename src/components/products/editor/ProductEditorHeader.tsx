import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface ProductEditorHeaderProps {
  title: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ProductEditorHeader({
  title,
  isSubmitting,
  onCancel,
  onSave,
}: ProductEditorHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="hidden sm:flex"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="action"
            onClick={onSave}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Salvar alterações</span>
                <span className="sm:hidden">Salvar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
