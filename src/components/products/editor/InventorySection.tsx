import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Infinity } from "lucide-react";

interface InventorySectionProps {
  hasVariations: boolean;
  isInfiniteStock: boolean;
  quantity: number;
  minStock: number;
  onChange: (field: string, value: number | boolean) => void;
}

export function InventorySection({
  hasVariations,
  isInfiniteStock,
  quantity,
  minStock,
  onChange,
}: InventorySectionProps) {
  // Don't show this section if product has variations
  // (stock is managed per variation)
  if (hasVariations) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Inventário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Infinite stock toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Infinity className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Estoque infinito</p>
              <p className="text-sm text-muted-foreground">
                Não controlar quantidade em estoque
              </p>
            </div>
          </div>
          <Switch
            checked={isInfiniteStock}
            onCheckedChange={(checked) => onChange('isInfiniteStock', checked)}
          />
        </div>

        {!isInfiniteStock && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade em estoque *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={quantity || ''}
                onChange={(e) => onChange('quantity', parseInt(e.target.value) || 0)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                placeholder="5"
                value={minStock || ''}
                onChange={(e) => onChange('minStock', parseInt(e.target.value) || 0)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Você receberá um alerta quando atingir
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
