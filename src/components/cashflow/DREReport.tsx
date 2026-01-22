import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, TrendingUp, TrendingDown, DollarSign, 
  Package, Megaphone, Users, Building2, 
  Download, ChevronDown, ChevronUp, Info
} from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DREData {
  period: string;
  revenue: {
    productSales: number;
    serviceSales: number;
    shippingReceived: number;
    otherIncome: number;
    total: number;
  };
  deductions: {
    taxes: number;
    returns: number;
    discounts: number;
    total: number;
  };
  netRevenue: number;
  cogs: {
    inventory: number;
    suppliers: number;
    packaging: number;
    total: number;
  };
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: {
    marketing: number;
    salaries: number;
    rent: number;
    utilities: number;
    telecom: number;
    transport: number;
    maintenance: number;
    bankFees: number;
    equipment: number;
    other: number;
    total: number;
  };
  operatingProfit: number;
  operatingMargin: number;
  financialResult: {
    income: number;
    expenses: number;
    total: number;
  };
  netProfit: number;
  netMargin: number;
}

interface DREReportProps {
  transactions: Array<{
    id: string;
    type: 'entrada' | 'saida';
    amount: number;
    category: string;
    status: string;
    reference_date: string;
  }>;
  period: string;
}

const categoryMapping: Record<string, { section: string; key: string }> = {
  // Revenue
  'Vendas de Produtos': { section: 'revenue', key: 'productSales' },
  'Vendas Online': { section: 'revenue', key: 'productSales' },
  'Serviços': { section: 'revenue', key: 'serviceSales' },
  'Frete Recebido': { section: 'revenue', key: 'shippingReceived' },
  'Outros Recebimentos': { section: 'revenue', key: 'otherIncome' },
  
  // COGS
  'Compra de Estoque': { section: 'cogs', key: 'inventory' },
  'Fornecedores': { section: 'cogs', key: 'suppliers' },
  
  // Operating Expenses
  'Marketing e Publicidade': { section: 'operatingExpenses', key: 'marketing' },
  'Salários e Pró-labore': { section: 'operatingExpenses', key: 'salaries' },
  'Aluguel e Condomínio': { section: 'operatingExpenses', key: 'rent' },
  'Energia e Água': { section: 'operatingExpenses', key: 'utilities' },
  'Internet e Telefone': { section: 'operatingExpenses', key: 'telecom' },
  'Transporte e Logística': { section: 'operatingExpenses', key: 'transport' },
  'Manutenção': { section: 'operatingExpenses', key: 'maintenance' },
  'Taxas Bancárias': { section: 'operatingExpenses', key: 'bankFees' },
  'Equipamentos': { section: 'operatingExpenses', key: 'equipment' },
  'Outras Despesas': { section: 'operatingExpenses', key: 'other' },
  
  // Deductions
  'Impostos e Taxas': { section: 'deductions', key: 'taxes' },
};

export function DREReport({ transactions, period }: DREReportProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    cogs: false,
    operatingExpenses: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const dreData = useMemo((): DREData => {
    // Initialize data structure
    const data: DREData = {
      period,
      revenue: { productSales: 0, serviceSales: 0, shippingReceived: 0, otherIncome: 0, total: 0 },
      deductions: { taxes: 0, returns: 0, discounts: 0, total: 0 },
      netRevenue: 0,
      cogs: { inventory: 0, suppliers: 0, packaging: 0, total: 0 },
      grossProfit: 0,
      grossMargin: 0,
      operatingExpenses: {
        marketing: 0, salaries: 0, rent: 0, utilities: 0, telecom: 0,
        transport: 0, maintenance: 0, bankFees: 0, equipment: 0, other: 0, total: 0
      },
      operatingProfit: 0,
      operatingMargin: 0,
      financialResult: { income: 0, expenses: 0, total: 0 },
      netProfit: 0,
      netMargin: 0,
    };

    // Process transactions
    transactions.forEach(tx => {
      if (tx.status === 'cancelado') return;

      const mapping = categoryMapping[tx.category];
      
      if (tx.type === 'entrada') {
        if (mapping && mapping.section === 'revenue') {
          (data.revenue as any)[mapping.key] += tx.amount;
        } else {
          data.revenue.otherIncome += tx.amount;
        }
      } else if (tx.type === 'saida') {
        if (mapping) {
          if (mapping.section === 'cogs') {
            (data.cogs as any)[mapping.key] += tx.amount;
          } else if (mapping.section === 'operatingExpenses') {
            (data.operatingExpenses as any)[mapping.key] += tx.amount;
          } else if (mapping.section === 'deductions') {
            (data.deductions as any)[mapping.key] += tx.amount;
          }
        } else {
          data.operatingExpenses.other += tx.amount;
        }
      }
    });

    // Calculate totals
    data.revenue.total = data.revenue.productSales + data.revenue.serviceSales + 
                         data.revenue.shippingReceived + data.revenue.otherIncome;
    
    data.deductions.total = data.deductions.taxes + data.deductions.returns + data.deductions.discounts;
    
    data.netRevenue = data.revenue.total - data.deductions.total;
    
    data.cogs.total = data.cogs.inventory + data.cogs.suppliers + data.cogs.packaging;
    
    data.grossProfit = data.netRevenue - data.cogs.total;
    data.grossMargin = data.netRevenue > 0 ? (data.grossProfit / data.netRevenue) * 100 : 0;
    
    data.operatingExpenses.total = Object.entries(data.operatingExpenses)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, val]) => sum + (val as number), 0);
    
    data.operatingProfit = data.grossProfit - data.operatingExpenses.total;
    data.operatingMargin = data.netRevenue > 0 ? (data.operatingProfit / data.netRevenue) * 100 : 0;
    
    data.netProfit = data.operatingProfit + data.financialResult.total;
    data.netMargin = data.netRevenue > 0 ? (data.netProfit / data.netRevenue) * 100 : 0;

    return data;
  }, [transactions, period]);

  const renderLineItem = (
    label: string, 
    value: number, 
    options?: { 
      isTotal?: boolean; 
      isSubtotal?: boolean; 
      indent?: boolean;
      showPercentage?: boolean;
      percentageBase?: number;
      isNegative?: boolean;
      icon?: React.ReactNode;
    }
  ) => {
    const { isTotal, isSubtotal, indent, showPercentage, percentageBase, isNegative, icon } = options || {};
    const percentage = percentageBase && percentageBase > 0 ? (value / percentageBase) * 100 : 0;
    
    return (
      <div className={`flex items-center justify-between py-2 ${indent ? 'pl-6' : ''} ${isTotal ? 'font-bold text-lg border-t-2 border-border pt-3' : ''} ${isSubtotal ? 'font-semibold border-t border-dashed border-border pt-2' : ''}`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className={isTotal ? 'text-foreground' : isSubtotal ? 'text-foreground' : 'text-muted-foreground'}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {showPercentage && percentageBase && percentageBase > 0 && (
            <span className="text-xs text-muted-foreground w-16 text-right">
              {percentage.toFixed(1)}%
            </span>
          )}
          <span className={`font-mono ${isNegative || value < 0 ? 'text-danger' : isTotal ? 'text-foreground' : 'text-foreground'}`}>
            {isNegative && value > 0 ? '-' : ''}{formatarMoeda(Math.abs(value))}
          </span>
        </div>
      </div>
    );
  };

  const renderResultBadge = (value: number, label: string, margin: number) => {
    const isPositive = value >= 0;
    return (
      <div className={`p-4 rounded-lg border ${isPositive ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-danger" />
            )}
            <span className="font-medium">{label}</span>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
              {formatarMoeda(value)}
            </p>
            <p className="text-sm text-muted-foreground">
              Margem: {margin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                DRE - Demonstrativo de Resultado
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>O DRE mostra o resultado financeiro do período, detalhando receitas, custos e despesas para calcular o lucro líquido.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                Análise detalhada de receitas, custos e lucros
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderResultBadge(dreData.grossProfit, 'Lucro Bruto', dreData.grossMargin)}
          {renderResultBadge(dreData.operatingProfit, 'Lucro Operacional', dreData.operatingMargin)}
          {renderResultBadge(dreData.netProfit, 'Lucro Líquido', dreData.netMargin)}
        </div>

        <Separator />

        {/* Detailed DRE */}
        <div className="space-y-4">
          {/* RECEITA BRUTA */}
          <Collapsible open={expandedSections.revenue} onOpenChange={() => toggleSection('revenue')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 hover:bg-success/10 transition-colors">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <span className="font-semibold text-success">RECEITA BRUTA</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-success">{formatarMoeda(dreData.revenue.total)}</span>
                  {expandedSections.revenue ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-4 border-l-2 border-success/20 ml-2 mt-2 space-y-1">
                {renderLineItem('Vendas de Produtos', dreData.revenue.productSales, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.revenue.total 
                })}
                {renderLineItem('Serviços', dreData.revenue.serviceSales, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.revenue.total 
                })}
                {renderLineItem('Frete Recebido', dreData.revenue.shippingReceived, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.revenue.total 
                })}
                {renderLineItem('Outros Recebimentos', dreData.revenue.otherIncome, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.revenue.total 
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* DEDUÇÕES */}
          {dreData.deductions.total > 0 && (
            <div className="pl-4 space-y-1">
              {renderLineItem('(-) Impostos sobre Vendas', dreData.deductions.taxes, { isNegative: true })}
              {dreData.deductions.returns > 0 && renderLineItem('(-) Devoluções', dreData.deductions.returns, { isNegative: true })}
              {dreData.deductions.discounts > 0 && renderLineItem('(-) Descontos', dreData.deductions.discounts, { isNegative: true })}
            </div>
          )}

          {/* RECEITA LÍQUIDA */}
          <div className="p-3 rounded-lg bg-muted/50">
            {renderLineItem('= RECEITA LÍQUIDA', dreData.netRevenue, { isSubtotal: true })}
          </div>

          {/* CUSTO DAS MERCADORIAS VENDIDAS (CMV) */}
          <Collapsible open={expandedSections.cogs} onOpenChange={() => toggleSection('cogs')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-danger/5 hover:bg-danger/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-danger" />
                  <span className="font-semibold text-danger">(-) CUSTO DAS MERCADORIAS (CMV)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-danger">-{formatarMoeda(dreData.cogs.total)}</span>
                  {expandedSections.cogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-4 border-l-2 border-danger/20 ml-2 mt-2 space-y-1">
                {renderLineItem('Compra de Estoque', dreData.cogs.inventory, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.cogs.total,
                  isNegative: true 
                })}
                {renderLineItem('Fornecedores', dreData.cogs.suppliers, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.cogs.total,
                  isNegative: true 
                })}
                {dreData.cogs.packaging > 0 && renderLineItem('Embalagens', dreData.cogs.packaging, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.cogs.total,
                  isNegative: true 
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* LUCRO BRUTO */}
          <div className={`p-3 rounded-lg ${dreData.grossProfit >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">= LUCRO BRUTO</span>
                <Badge variant={dreData.grossProfit >= 0 ? "default" : "destructive"} className="text-xs">
                  {dreData.grossMargin.toFixed(1)}% margem
                </Badge>
              </div>
              <span className={`font-bold text-lg ${dreData.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatarMoeda(dreData.grossProfit)}
              </span>
            </div>
          </div>

          {/* DESPESAS OPERACIONAIS */}
          <Collapsible open={expandedSections.operatingExpenses} onOpenChange={() => toggleSection('operatingExpenses')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5 hover:bg-warning/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-warning" />
                  <span className="font-semibold text-warning">(-) DESPESAS OPERACIONAIS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-warning">-{formatarMoeda(dreData.operatingExpenses.total)}</span>
                  {expandedSections.operatingExpenses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-4 border-l-2 border-warning/20 ml-2 mt-2 space-y-1">
                {dreData.operatingExpenses.marketing > 0 && renderLineItem('Marketing e Publicidade', dreData.operatingExpenses.marketing, { 
                  indent: true, 
                  icon: <Megaphone className="h-4 w-4 text-muted-foreground" />,
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.salaries > 0 && renderLineItem('Salários e Pró-labore', dreData.operatingExpenses.salaries, { 
                  indent: true, 
                  icon: <Users className="h-4 w-4 text-muted-foreground" />,
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.rent > 0 && renderLineItem('Aluguel e Condomínio', dreData.operatingExpenses.rent, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.utilities > 0 && renderLineItem('Energia e Água', dreData.operatingExpenses.utilities, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.telecom > 0 && renderLineItem('Internet e Telefone', dreData.operatingExpenses.telecom, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.transport > 0 && renderLineItem('Transporte e Logística', dreData.operatingExpenses.transport, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.maintenance > 0 && renderLineItem('Manutenção', dreData.operatingExpenses.maintenance, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.bankFees > 0 && renderLineItem('Taxas Bancárias', dreData.operatingExpenses.bankFees, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.equipment > 0 && renderLineItem('Equipamentos', dreData.operatingExpenses.equipment, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
                {dreData.operatingExpenses.other > 0 && renderLineItem('Outras Despesas', dreData.operatingExpenses.other, { 
                  indent: true, 
                  showPercentage: true, 
                  percentageBase: dreData.operatingExpenses.total,
                  isNegative: true 
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* LUCRO OPERACIONAL */}
          <div className={`p-3 rounded-lg ${dreData.operatingProfit >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">= LUCRO OPERACIONAL (EBIT)</span>
                <Badge variant={dreData.operatingProfit >= 0 ? "default" : "destructive"} className="text-xs">
                  {dreData.operatingMargin.toFixed(1)}% margem
                </Badge>
              </div>
              <span className={`font-bold text-lg ${dreData.operatingProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatarMoeda(dreData.operatingProfit)}
              </span>
            </div>
          </div>

          <Separator />

          {/* LUCRO LÍQUIDO */}
          <div className={`p-4 rounded-lg border-2 ${dreData.netProfit >= 0 ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dreData.netProfit >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-danger" />
                )}
                <span className="font-bold text-lg">= LUCRO LÍQUIDO</span>
                <Badge variant={dreData.netProfit >= 0 ? "default" : "destructive"}>
                  {dreData.netMargin.toFixed(1)}% margem
                </Badge>
              </div>
              <span className={`font-bold text-2xl ${dreData.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatarMoeda(dreData.netProfit)}
              </span>
            </div>
          </div>

          {/* Margin Analysis */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">📊 Análise de Margens</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Margem Bruta</span>
                  <span className="font-medium">{dreData.grossMargin.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, dreData.grossMargin))} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ideal para e-commerce: 30-50%
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Margem Operacional</span>
                  <span className="font-medium">{dreData.operatingMargin.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, dreData.operatingMargin))} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ideal para e-commerce: 10-20%
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Margem Líquida</span>
                  <span className="font-medium">{dreData.netMargin.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, dreData.netMargin))} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ideal para e-commerce: 5-15%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
