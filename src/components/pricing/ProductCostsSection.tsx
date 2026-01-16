import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Scissors, Tag } from 'lucide-react';
import { ProductCosts } from '@/types/pricing';
import { formatarMoeda } from '@/lib/formatters';

interface ProductCostsSectionProps {
  costs: ProductCosts;
  onUpdate: (updates: Partial<ProductCosts>) => void;
}

export function ProductCostsSection({ costs, onUpdate }: ProductCostsSectionProps) {
  const totalDirectCost = Object.values(costs).reduce((a, b) => a + b, 0);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-info/20">
            <Package className="h-5 w-5 text-info" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg">Custos Diretos do Produto</CardTitle>
            <CardDescription>
              Custos por unidade produzida
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-info">{formatarMoeda(totalDirectCost)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fabric" className="flex items-center gap-1">
              <Scissors className="h-3 w-3" />
              Tecido/Material (R$)
            </Label>
            <Input
              id="fabric"
              type="number"
              min={0}
              step={0.01}
              value={costs.fabric || ''}
              onChange={(e) => onUpdate({ fabric: Number(e.target.value) })}
              placeholder="Ex: 20.00"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="accessories" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Aviamentos (R$)
            </Label>
            <Input
              id="accessories"
              type="number"
              min={0}
              step={0.01}
              value={costs.accessories || ''}
              onChange={(e) => onUpdate({ accessories: Number(e.target.value) })}
              placeholder="Botões, zíperes, etc"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="packaging">Embalagem Individual (R$)</Label>
            <Input
              id="packaging"
              type="number"
              min={0}
              step={0.01}
              value={costs.packaging || ''}
              onChange={(e) => onUpdate({ packaging: Number(e.target.value) })}
              placeholder="Saquinho, tag, etc"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="laborCost">Mão de Obra/Confecção (R$)</Label>
            <Input
              id="laborCost"
              type="number"
              min={0}
              step={0.01}
              value={costs.laborCost || ''}
              onChange={(e) => onUpdate({ laborCost: Number(e.target.value) })}
              placeholder="Custo por peça"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="qualityControl">Controle de Qualidade (R$)</Label>
            <Input
              id="qualityControl"
              type="number"
              min={0}
              step={0.01}
              value={costs.qualityControl || ''}
              onChange={(e) => onUpdate({ qualityControl: Number(e.target.value) })}
              placeholder="Opcional"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="photography">Fotografia/Vídeo (R$)</Label>
            <Input
              id="photography"
              type="number"
              min={0}
              step={0.01}
              value={costs.photography || ''}
              onChange={(e) => onUpdate({ photography: Number(e.target.value) })}
              placeholder="Custo amortizado"
              className="h-11 text-base mt-1"
            />
          </div>
          
          <div className="sm:col-span-2">
            <Label htmlFor="otherProduct">Outros Custos Diretos (R$)</Label>
            <Input
              id="otherProduct"
              type="number"
              min={0}
              step={0.01}
              value={costs.other || ''}
              onChange={(e) => onUpdate({ other: Number(e.target.value) })}
              placeholder="Design, moodboard, etc"
              className="h-11 text-base mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
