import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, AlertTriangle, Calculator, Plus, Zap } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProductAnalysis {
  id: string;
  name: string;
  sku: string;
  revenue: number;
  soldUnits: number;
  margin: number;
  growth: number;
  cost: number;
  price: number;
  quantity: number;
  daysInStock: number;
  totalValue: number;
  lastSale?: string;
}

interface ProductAnalysisCardsProps {
  topProducts: ProductAnalysis[];
  lowMarginProducts: ProductAnalysis[];
  outOfStockProducts: ProductAnalysis[];
  slowMovingProducts: ProductAnalysis[];
}

export function ProductAnalysisCards({
  topProducts,
  lowMarginProducts,
  outOfStockProducts,
  slowMovingProducts,
}: ProductAnalysisCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Sellers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Top 10 Produtos (Valor em Estoque)
          </CardTitle>
          <CardDescription>
            Produtos com maior valor potencial de venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Adicione produtos para ver os rankings
              </p>
            ) : (
              topProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
                    idx === 0 ? "bg-amber-500 text-white" :
                    idx === 1 ? "bg-gray-400 text-white" :
                    idx === 2 ? "bg-amber-700 text-white" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{product.quantity} em estoque</span>
                      <span>•</span>
                      <span className="text-success">{product.margin.toFixed(0)}% margem</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{formatarMoeda(product.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Produtos com Problema */}
      <Card className="border-warning/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Produtos com Atenção Necessária
          </CardTitle>
          <CardDescription>
            Problemas que precisam de ação imediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="low-margin">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="low-margin" className="text-xs">
                Margem Baixa
              </TabsTrigger>
              <TabsTrigger value="no-stock" className="text-xs">
                Sem Estoque
              </TabsTrigger>
              <TabsTrigger value="slow-moving" className="text-xs">
                Giro Lento
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="low-margin" className="space-y-3 mt-4 max-h-[320px] overflow-y-auto">
              {lowMarginProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ✓ Nenhum produto com margem baixa
                </p>
              ) : (
                lowMarginProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-danger/5 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Custo: {formatarMoeda(product.cost)} | Venda: {formatarMoeda(product.price)}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg font-bold text-danger">{product.margin.toFixed(0)}%</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1" 
                        onClick={() => navigate(`/custos`)}
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Recalcular
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="no-stock" className="space-y-3 mt-4 max-h-[320px] overflow-y-auto">
              {outOfStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ✓ Todos os produtos em estoque
                </p>
              ) : (
                outOfStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-danger/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/estoque`)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Repor
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="slow-moving" className="space-y-3 mt-4 max-h-[320px] overflow-y-auto">
              {slowMovingProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  ✓ Todos os produtos com bom giro
                </p>
              ) : (
                slowMovingProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Parado há {product.daysInStock} dias • {product.quantity} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warning">
                        {formatarMoeda(product.totalValue)}
                      </p>
                      <Button size="sm" variant="outline" className="mt-1">
                        <Zap className="h-3 w-3 mr-1" />
                        Promoção
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
