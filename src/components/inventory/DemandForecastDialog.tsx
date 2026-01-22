import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DemandForecast } from "@/components/DemandForecast";
import { Product } from "@/types/products";

interface DemandForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function DemandForecastDialog({ open, onOpenChange, product }: DemandForecastDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Previsão de Demanda</DialogTitle>
          <DialogDescription>
            {product
              ? `Forecast e insights a partir do histórico real de saídas (vendas) do produto: ${product.name}`
              : "Selecione um produto para visualizar a previsão."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {product ? (
            <DemandForecast initialProduct={product} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum produto selecionado.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
