import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CodesSectionProps {
  hasVariations: boolean;
  sku: string;
  barcode: string;
  onChange: (field: string, value: string) => void;
}

export function CodesSection({
  hasVariations,
  sku,
  barcode,
  onChange,
}: CodesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Códigos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU {hasVariations && '(base)'}</Label>
            <Input
              id="sku"
              placeholder="Código interno"
              value={sku}
              onChange={(e) => onChange('sku', e.target.value)}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              {hasVariations 
                ? 'Cada variação terá seu próprio SKU baseado neste'
                : 'Código único para identificar o produto'
              }
            </p>
          </div>
          
          {!hasVariations && (
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <Input
                id="barcode"
                placeholder="EAN, UPC, etc."
                value={barcode}
                onChange={(e) => onChange('barcode', e.target.value)}
                className="h-11"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
