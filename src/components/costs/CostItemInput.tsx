import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostItemInputProps {
  id: string;
  nome: string;
  valor: number;
  tipo?: 'monetario' | 'percentual';
  onUpdate: (data: { nome?: string; valor?: number; tipo?: 'monetario' | 'percentual' }) => void;
  onDelete: () => void;
  showTipo?: boolean;
}

export function CostItemInput({ id, nome, valor, tipo, onUpdate, onDelete, showTipo = false }: CostItemInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState(nome);
  const [editValor, setEditValor] = useState(valor.toString());
  const [editTipo, setEditTipo] = useState<'monetario' | 'percentual'>(tipo || 'monetario');

  const handleSave = () => {
    const valorNumerico = parseFloat(editValor);
    if (!editNome.trim() || isNaN(valorNumerico) || valorNumerico < 0) {
      return;
    }
    onUpdate({
      nome: editNome,
      valor: valorNumerico,
      ...(showTipo && { tipo: editTipo }),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditNome(nome);
    setEditValor(valor.toString());
    setEditTipo(tipo || 'monetario');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
        <Input
          value={editNome}
          onChange={(e) => setEditNome(e.target.value)}
          placeholder="Nome do custo"
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          {showTipo && (
            <select
              value={editTipo}
              onChange={(e) => setEditTipo(e.target.value as 'monetario' | 'percentual')}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="monetario">R$</option>
              <option value="percentual">%</option>
            </select>
          )}
          <Input
            type="number"
            value={editValor}
            onChange={(e) => setEditValor(e.target.value)}
            placeholder="Valor"
            className="w-24"
            step="0.01"
            min="0"
          />
        </div>
        <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8">
          <Check className="h-4 w-4 text-success" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8">
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/20 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-foreground">{nome}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold text-foreground">
          {tipo === 'percentual' ? `${valor}%` : `R$ ${valor.toFixed(2)}`}
        </span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
