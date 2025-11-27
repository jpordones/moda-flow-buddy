import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { CustoFixo } from '@/types/costs';
import { CostItemInput } from './CostItemInput';

interface FixedCostsSectionProps {
  custosFixos: CustoFixo[];
  onAdd: (custo: Omit<CustoFixo, 'id'>) => void;
  onUpdate: (id: string, custo: Partial<CustoFixo>) => void;
  onDelete: (id: string) => void;
}

export function FixedCostsSection({ custosFixos, onAdd, onUpdate, onDelete }: FixedCostsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('administrativo');

  const totalCustosFixos = custosFixos.reduce((acc, custo) => acc + custo.valor, 0);

  const handleAdd = () => {
    const valor = parseFloat(novoValor);
    if (!novoNome.trim() || isNaN(valor) || valor < 0) {
      return;
    }

    onAdd({
      nome: novoNome,
      valor,
      categoria: novaCategoria,
    });

    setNovoNome('');
    setNovoValor('');
    setNovaCategoria('administrativo');
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Custos Fixos Mensais</CardTitle>
            <CardDescription className="text-gray-600">Despesas recorrentes do e-commerce</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-gray-900">Novo Custo Fixo</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Adicione um novo custo fixo mensal ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700 font-medium">Nome do Custo</Label>
                  <Input
                    id="nome"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Aluguel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-gray-700 font-medium">Valor Mensal (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-gray-700 font-medium">Categoria</Label>
                  <select
                    id="categoria"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand transition-colors"
                  >
                    <option value="infraestrutura">Infraestrutura</option>
                    <option value="administrativo">Administrativo</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="operacional">Operacional</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="action" onClick={handleAdd}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-0">
        {custosFixos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum custo fixo cadastrado
          </p>
        ) : (
          <>
            {custosFixos.map((custo) => (
              <CostItemInput
                key={custo.id}
                id={custo.id}
                nome={custo.nome}
                valor={custo.valor}
                onUpdate={(data) => onUpdate(custo.id, data)}
                onDelete={() => onDelete(custo.id)}
              />
            ))}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <span className="text-lg font-semibold text-gray-900">Total Mensal</span>
              <span className="text-2xl font-bold text-brand-foreground">
                R$ {totalCustosFixos.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
