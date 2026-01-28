import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

export function DemandForecastShortcut() {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2.5">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Previsão de Demanda com IA</CardTitle>
              <CardDescription className="text-xs">
                Otimize seu estoque com análise preditiva
              </CardDescription>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-primary/40" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>Holt-Winters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-info" />
              <span>Regressão Linear</span>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/app/previsao-demanda')}
            className="shrink-0"
          >
            Abrir
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
