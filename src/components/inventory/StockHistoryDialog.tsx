import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, History, ArrowUp, ArrowDown } from 'lucide-react';
import { StockMovement } from '@/types/inventory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movements: StockMovement[];
  productName?: string;
  isLoading?: boolean;
}

export function StockHistoryDialog({ 
  open, 
  onOpenChange, 
  movements,
  productName,
  isLoading 
}: StockHistoryDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      compra: 'Compra',
      producao: 'Produção',
      devolucao: 'Devolução',
      ajuste: 'Ajuste',
      transferencia: 'Transferência',
      venda: 'Venda',
      perda: 'Perda',
      doacao: 'Doação',
    };
    return labels[reason] || reason;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Movimentações
          </DialogTitle>
          <DialogDescription>
            {productName 
              ? `Movimentações de estoque para "${productName}"`
              : 'Todas as movimentações de estoque'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma movimentação encontrada</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(movement.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.product?.name || 'Produto'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={movement.type === 'entrada' ? 'success' : 'danger'}>
                          {movement.type === 'entrada' ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className={movement.type === 'entrada' ? 'text-success font-medium' : 'text-danger font-medium'}>
                        {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                      </TableCell>
                      <TableCell>{getReasonLabel(movement.reason)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {movement.previousStock !== null && movement.newStock !== null ? (
                          <span>
                            {movement.previousStock} → {movement.newStock}
                          </span>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={movement.type === 'entrada' ? 'success' : 'danger'}>
                      {movement.type === 'entrada' ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                    <span className={`text-lg font-bold ${movement.type === 'entrada' ? 'text-success' : 'text-danger'}`}>
                      {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                    </span>
                  </div>
                  <div className="text-sm font-medium">{movement.product?.name || 'Produto'}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {getReasonLabel(movement.reason)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(movement.createdAt)}
                    {movement.previousStock !== null && movement.newStock !== null && (
                      <span className="ml-2">
                        | Estoque: {movement.previousStock} → {movement.newStock}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
