import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultCategories } from "@/types/products";

interface NameDescriptionSectionProps {
  name: string;
  description: string;
  category: string;
  status: 'ativo' | 'inativo' | 'descontinuado';
  onChange: (field: string, value: string) => void;
}

export function NameDescriptionSection({
  name,
  description,
  category,
  status,
  onChange,
}: NameDescriptionSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Nome e descrição</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do produto *</Label>
          <Input
            id="name"
            placeholder="Ex: Camiseta Calmy"
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva o produto para seus clientes..."
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            A descrição será exibida na página do produto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={(v) => onChange('category', v)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {defaultCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => onChange('status', v)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="descontinuado">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
