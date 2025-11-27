import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { CustoVariavel } from '@/types/costs';
import { CostItemInput } from './CostItemInput';

interface VariableCostsSectionProps {
  custosVariaveis: CustoVariavel[];
  onAdd: (custo: Omit<CustoVariavel, 'id'>) => void;
  onUpdate: (id: string, custo: Partial<CustoVariavel>) => void;
  onDelete: (id: string) => void;
}

export function VariableCostsSection({ custosVariaveis, onAdd, onUpdate, onDelete }: VariableCostsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoTipo, setNovoTipo] = useState<'monetario' | 'percentual'>('monetario');
  const [novaCategoria, setNovaCategoria] = useState('producao');

  const custosMonetarios = custosVariaveis
    .filter(c => c.tipo === 'monetario')
    .reduce((acc, c) => acc + c.valor, 0);

  const handleAdd = () => {
    const valor = parseFloat(novoValor);
    if (!novoNome.trim() || isNaN(valor) || valor < 0) {
      return;
    }

    onAdd({
      nome: novoNome,
      valor,
      tipo: novoTipo,
      categoria: novaCategoria,
    });

    setNovoNome('');
    setNovoValor('');
    setNovoTipo('monetario');
    setNovaCategoria('producao');
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Custos Variáveis por Produto</CardTitle>
            <CardDescription className="text-gray-600">Custos que variam com cada unidade vendida</CardDescription>
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
                <DialogTitle className="text-gray-900">Novo Custo Variável</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Adicione um novo custo variável por produto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-var" className="text-gray-700 font-medium">Nome do Custo</Label>
                  <Input
                    id="nome-var"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Embalagem"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-gray-700 font-medium">Tipo de Valor</Label>
                  <select
                    id="tipo"
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as 'monetario' | 'percentual')}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand transition-colors"
                  >
                    <option value="monetario">Valor Fixo (R$)</option>
                    <option value="percentual">Percentual (%)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor-var" className="text-gray-700 font-medium">
                    {novoTipo === 'monetario' ? 'Valor (R$)' : 'Percentual (%)'}
                  </Label>
                  <Input
                    id="valor-var"
                    type="number"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder={novoTipo === 'monetario' ? '0.00' : '0'}
                    step={novoTipo === 'monetario' ? '0.01' : '0.1'}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria-var" className="text-gray-700 font-medium">Categoria</Label>
                  <select
                    id="categoria-var"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand transition-colors"
                  >
                    <option value="producao">Produção</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="logistica">Logística</option>
                    <option value="criacao">Criação</option>
                    <option value="marketing">Marketing</option>
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
        {custosVariaveis.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum custo variável cadastrado
          </p>
        ) : (
          <>
            {custosVariaveis.map((custo) => (
              <CostItemInput
                key={custo.id}
                id={custo.id}
                nome={custo.nome}
                valor={custo.valor}
                tipo={custo.tipo}
                onUpdate={(data) => onUpdate(custo.id, data)}
                onDelete={() => onDelete(custo.id)}
                showTipo
              />
            ))}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
              <span className="text-sm text-gray-600">
                Custos Monetários Base
              </span>
              <span className="text-lg font-semibold text-gray-900">
                R$ {custosMonetarios.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
