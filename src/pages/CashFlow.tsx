import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, TrendingUp, TrendingDown, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/UpgradeModal";

interface Transaction {
  id: string;
  date: string;
  type: "entrada" | "saida";
  value: string;
  category: string;
  description: string;
  paymentMethod: string;
}

const incomeCategories = ["Vendas", "Investimentos", "Outros"];
const expenseCategories = [
  "Fornecedores",
  "Matéria-prima",
  "Salários",
  "Aluguel",
  "Marketing",
  "Transporte",
  "Impostos",
  "Manutenção",
  "Outros",
];
const paymentMethods = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Transferência Bancária"];

export default function CashFlow() {
  const { canUseFeature, currentPlan, loading: subscriptionLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "entrada" as "entrada" | "saida",
    value: "",
    category: "",
    description: "",
    paymentMethod: "",
  });

  const hasAccess = canUseFeature('has_cash_flow');

  useEffect(() => {
    if (hasAccess) {
      const stored = localStorage.getItem("transactions");
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    }
  }, [hasAccess]);

  const saveTransactions = (newTransactions: Transaction[]) => {
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.value || !formData.category || !formData.description || !formData.paymentMethod) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      ...formData,
    };

    saveTransactions([newTransaction, ...transactions]);
    
    const typeLabel = formData.type === "entrada" ? "Entrada" : "Saída";
    const formattedValue = parseFloat(formData.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: "entrada",
      value: "",
      category: "",
      description: "",
      paymentMethod: "",
    });
    
    setIsDialogOpen(false);
    toast.success(`${typeLabel} registrada`, {
      description: `${formData.description} - ${formattedValue}`
    });
  };

  const handleDelete = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    saveTransactions(transactions.filter(t => t.id !== id));
    
    if (transaction) {
      const typeLabel = transaction.type === "entrada" ? "Entrada" : "Saída";
      const formattedValue = parseFloat(transaction.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      toast.success(`${typeLabel} removida`, {
        description: `${transaction.description} - ${formattedValue}`
      });
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions
    .filter(t => t.type === "entrada")
    .reduce((sum, t) => sum + parseFloat(t.value), 0);

  const totalExpense = transactions
    .filter(t => t.type === "saida")
    .reduce((sum, t) => sum + parseFloat(t.value), 0);

  const balance = totalIncome - totalExpense;

  // Show blocked state if no access
  if (!subscriptionLoading && !hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">Gerencie suas entradas e saídas financeiras</p>
          </div>
        </div>

        {/* Blurred preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <Card className="max-w-md text-center p-6">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Funcionalidade Premium</h3>
              <p className="text-muted-foreground mb-4">
                O Fluxo de Caixa está disponível a partir do plano Profissional. Faça upgrade para gerenciar suas finanças.
              </p>
              <Button onClick={() => setShowUpgradeModal(true)} className="gap-2" variant="action">
                <Crown className="h-4 w-4" />
                Ver Planos
              </Button>
            </Card>
          </div>

          {/* Preview content */}
          <div className="grid gap-6 md:grid-cols-3 opacity-50 pointer-events-none">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Entradas</CardTitle>
              <div className="p-2 rounded-lg bg-success/10 dark:bg-success/20">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-3xl font-bold text-success">R$ 0,00</div>
              </CardContent>
            </Card>

            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Saídas</CardTitle>
              <div className="p-2 rounded-lg bg-danger/10 dark:bg-danger/20">
                <TrendingDown className="h-5 w-5 text-danger" />
              </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-3xl font-bold text-danger">R$ 0,00</div>
              </CardContent>
            </Card>

            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
              <div className="p-2 rounded-lg bg-success/10 dark:bg-success/20">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-3xl font-bold text-success">R$ 0,00</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Fluxo de Caixa"
          requiredPlan="professional"
          currentPlan={currentPlan?.plan_type}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Fluxo de Caixa</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie suas entradas e saídas financeiras</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto h-11">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Registrar Transação</DialogTitle>
              <DialogDescription className="text-muted-foreground">Adicione uma nova entrada ou saída financeira</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground font-medium">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-11 text-base"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground font-medium">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: "entrada" | "saida") => setFormData({ ...formData, type: value, category: "" })}>
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value" className="text-foreground font-medium">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="h-11 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground font-medium">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === "entrada" ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-foreground font-medium">Forma de Pagamento</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição da transação"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-11 text-base"
                  required
                />
              </div>

              <Button type="submit" variant="action" className="w-full h-11">Registrar Transação</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo - Grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Entradas</CardTitle>
            <div className="p-2 rounded-lg bg-success/10 dark:bg-success/20">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl md:text-3xl font-bold text-success">R$ {totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Saídas</CardTitle>
            <div className="p-2 rounded-lg bg-danger/10 dark:bg-danger/20">
              <TrendingDown className="h-5 w-5 text-danger" />
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-2xl md:text-3xl font-bold text-danger">R$ {totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-success/10 dark:bg-success/20' : 'bg-danger/10 dark:bg-danger/20'}`}>
              {balance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className={`text-2xl md:text-3xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
              R$ {balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-foreground">Histórico de Transações</CardTitle>
          <CardDescription className="text-muted-foreground">Visualize e gerencie todas as suas transações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          {/* Filtros - Stack em mobile */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela - Desktop */}
          <div className="hidden lg:block rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-6xl mb-4">💰</span>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Nenhuma transação registrada
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Comece adicionando uma entrada ou saída financeira
                        </p>
                        <Button variant="action" className="gap-2 h-11" onClick={() => setIsDialogOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Nova Transação
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma transação encontrada para o filtro atual
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "entrada" ? "success" : "danger"}>
                          {transaction.type === "entrada" ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{transaction.paymentMethod}</TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === "entrada" ? "text-success" : "text-danger"}`}>
                        {transaction.type === "entrada" ? "+" : "-"}R$ {parseFloat(transaction.value).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                          className="h-10 w-10 hover:bg-danger-light hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Cards - Mobile/Tablet */}
          <div className="lg:hidden space-y-3">
            {filteredTransactions.length === 0 && transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <span className="text-5xl mb-4">💰</span>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma transação registrada
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Comece adicionando uma entrada ou saída financeira
                </p>
                <Button variant="action" className="gap-2 h-11" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nova Transação
                </Button>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada para o filtro atual
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="space-y-3">
                    {/* Header do card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      </div>
                      <Badge variant={transaction.type === "entrada" ? "success" : "danger"} className="shrink-0">
                        {transaction.type === "entrada" ? "Entrada" : "Saída"}
                      </Badge>
                    </div>
                    
                    {/* Detalhes */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4 text-muted-foreground">
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        <span>{transaction.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Valor e ação */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className={`text-lg font-bold ${transaction.type === "entrada" ? "text-success" : "text-danger"}`}>
                        {transaction.type === "entrada" ? "+" : "-"}R$ {parseFloat(transaction.value).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        className="h-10 w-10 hover:bg-danger-light hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
