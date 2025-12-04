import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X } from "lucide-react";
import { 
  ProductFormData, 
  Product,
  VariableCost,
  emptyFormData,
  defaultCategories,
  defaultSizes,
  defaultColors,
  defaultUnits,
  defaultSeasonality,
  defaultSalesChannels
} from "@/types/products";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ProductForm({ initialData, onSubmit, onCancel, isEditing = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        sku: initialData.sku,
        category: initialData.category,
        description: initialData.description || "",
        status: initialData.status,
        variableCosts: initialData.variableCosts,
        fixedCostAllocation: initialData.fixedCostAllocation,
        customMargin: initialData.customMargin || 30,
        salePrice: initialData.salePrice.toString(),
        costPrice: initialData.costPrice.toString(),
        quantity: initialData.quantity.toString(),
        minStock: initialData.minStock.toString(),
        maxStock: initialData.maxStock.toString(),
        unit: initialData.unit,
        location: initialData.location || "",
        size: initialData.size || "",
        color: initialData.color || "",
        productionTime: initialData.productionTime?.toString() || "",
        dailyCapacity: initialData.dailyCapacity?.toString() || "",
        leadTime: initialData.leadTime?.toString() || "",
        monthlySalesAvg: initialData.monthlySalesAvg?.toString() || "",
        seasonality: initialData.seasonality || [],
        salesChannel: initialData.salesChannel || "",
      };
    }
    return emptyFormData;
  });

  const [newCostName, setNewCostName] = useState("");
  const [newCostValue, setNewCostValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addVariableCost = () => {
    if (!newCostName || !newCostValue) return;
    const newCost: VariableCost = {
      id: `cost_${Date.now()}`,
      name: newCostName,
      value: parseFloat(newCostValue),
    };
    setFormData(prev => ({
      ...prev,
      variableCosts: [...prev.variableCosts, newCost],
    }));
    setNewCostName("");
    setNewCostValue("");
  };

  const removeVariableCost = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variableCosts: prev.variableCosts.filter(c => c.id !== id),
    }));
  };

  const toggleSeasonality = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      seasonality: prev.seasonality.includes(tag)
        ? prev.seasonality.filter(s => s !== tag)
        : [...prev.seasonality, tag],
    }));
  };

  const totalVariableCost = formData.variableCosts.reduce((sum, c) => sum + c.value, 0);
  const calculatedCost = totalVariableCost + (parseFloat(formData.costPrice) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="precificacao">Precificação</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
        </TabsList>

        {/* Tab Geral */}
        <TabsContent value="geral" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                placeholder="Ex: Camiseta Básica"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU/Código</Label>
              <Input
                id="sku"
                placeholder="Auto-gerado se vazio"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamanho</Label>
              <Select 
                value={formData.size} 
                onValueChange={(value) => setFormData({ ...formData, size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultSizes.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultColors.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="descontinuado">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição detalhada do produto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Tab Precificação */}
        <TabsContent value="precificacao" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Custo Base (R$) *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Preço de Venda (R$) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Variable Costs */}
          <div className="space-y-3">
            <Label>Custos Variáveis do Produto</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do custo"
                value={newCostName}
                onChange={(e) => setNewCostName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Valor"
                type="number"
                step="0.01"
                value={newCostValue}
                onChange={(e) => setNewCostValue(e.target.value)}
                className="w-32"
              />
              <Button type="button" variant="outline" size="icon" onClick={addVariableCost}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.variableCosts.length > 0 && (
              <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                {formData.variableCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between">
                    <span className="text-sm">{cost.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">R$ {cost.value.toFixed(2)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeVariableCost(cost.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t flex justify-between font-medium">
                  <span>Total Custos Variáveis:</span>
                  <span>R$ {totalVariableCost.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Margem de Lucro Personalizada</Label>
              <span className="text-sm font-medium">{formData.customMargin}%</span>
            </div>
            <Slider
              value={[formData.customMargin]}
              onValueChange={(value) => setFormData({ ...formData, customMargin: value[0] })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Alocação de Custos Fixos</Label>
              <span className="text-sm font-medium">{formData.fixedCostAllocation}%</span>
            </div>
            <Slider
              value={[formData.fixedCostAllocation]}
              onValueChange={(value) => setFormData({ ...formData, fixedCostAllocation: value[0] })}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Percentual dos custos fixos mensais alocados a este produto
            </p>
          </div>
        </TabsContent>

        {/* Tab Estoque */}
        <TabsContent value="estoque" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade Atual *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                placeholder="10"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStock">Estoque Máximo</Label>
              <Input
                id="maxStock"
                type="number"
                min="0"
                placeholder="200"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unidade de Medida</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Ex: A1-B2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab Produção */}
        <TabsContent value="producao" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productionTime">Tempo de Produção (dias)</Label>
              <Input
                id="productionTime"
                type="number"
                min="0"
                placeholder="0"
                value={formData.productionTime}
                onChange={(e) => setFormData({ ...formData, productionTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyCapacity">Capacidade Diária</Label>
              <Input
                id="dailyCapacity"
                type="number"
                min="0"
                placeholder="0"
                value={formData.dailyCapacity}
                onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (dias)</Label>
              <Input
                id="leadTime"
                type="number"
                min="0"
                placeholder="0"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlySalesAvg">Média de Vendas Mensal</Label>
              <Input
                id="monthlySalesAvg"
                type="number"
                min="0"
                placeholder="0"
                value={formData.monthlySalesAvg}
                onChange={(e) => setFormData({ ...formData, monthlySalesAvg: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Canal de Venda Principal</Label>
              <Select 
                value={formData.salesChannel} 
                onValueChange={(value) => setFormData({ ...formData, salesChannel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {defaultSalesChannels.map((channel) => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sazonalidade</Label>
            <div className="flex flex-wrap gap-2">
              {defaultSeasonality.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.seasonality.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSeasonality(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="action">
          {isEditing ? "Salvar Alterações" : "Cadastrar Produto"}
        </Button>
      </div>
    </form>
  );
}
