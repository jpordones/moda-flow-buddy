import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { formatarMoeda } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";

interface CashFlowSummaryCardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingReceivables: number;
  pendingPayables: number;
}

export function CashFlowSummaryCard({
  totalIncome,
  totalExpenses,
  balance,
  pendingReceivables,
  pendingPayables,
}: CashFlowSummaryCardProps) {
  const navigate = useNavigate();
  const isPositive = balance >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fluxo de Caixa
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                {formatarMoeda(balance)}
              </div>
              <Badge variant={isPositive ? "success" : "destructive"}>
                {isPositive ? "Positivo" : "Negativo"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo do período
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs p-2 bg-success/5 rounded">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                Entradas:
              </span>
              <span className="font-medium text-success">
                {formatarMoeda(totalIncome)}
              </span>
            </div>
            
            <div className="flex justify-between text-xs p-2 bg-danger/5 rounded">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-danger" />
                Saídas:
              </span>
              <span className="font-medium text-danger">
                {formatarMoeda(totalExpenses)}
              </span>
            </div>

            {(pendingReceivables > 0 || pendingPayables > 0) && (
              <div className="flex justify-between text-xs p-2 bg-warning/5 rounded">
                <span className="text-muted-foreground">Pendências:</span>
                <span className="font-medium text-warning">
                  +{formatarMoeda(pendingReceivables)} / -{formatarMoeda(pendingPayables)}
                </span>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/app/fluxo-caixa')}
          >
            Ver Fluxo Completo
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
