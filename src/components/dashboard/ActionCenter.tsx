import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/products";
import { buildActionCenter, summarizeActions, ActionSeverity } from "@/lib/actionCenter";

function severityIcon(sev: ActionSeverity) {
  if (sev === "critical") return <AlertTriangle className="h-5 w-5 text-destructive" />;
  if (sev === "warning") return <AlertTriangle className="h-5 w-5 text-warning" />;
  return <Info className="h-5 w-5 text-muted-foreground" />;
}

function severityBadge(sev: ActionSeverity) {
  if (sev === "critical") return <Badge variant="destructive">Crítico</Badge>;
  if (sev === "warning") return <Badge className="bg-warning text-warning-foreground">Atenção</Badge>;
  return <Badge variant="secondary">Info</Badge>;
}

export function ActionCenter({ products }: { products: Product[] }) {
  const actions = useMemo(() => buildActionCenter(products), [products]);
  const summary = useMemo(() => summarizeActions(actions), [actions]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Central de Ações (hoje)</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{summary.total} itens</Badge>
            {summary.critical > 0 && (
              <Badge variant="destructive">{summary.critical} críticos</Badge>
            )}
            {summary.warning > 0 && (
              <Badge className="bg-warning text-warning-foreground">{summary.warning} atenção</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Decida rápido: ajuste preço, evite ruptura e destrave giro.
        </p>
      </CardHeader>

      <CardContent>
        {actions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Nenhuma ação urgente encontrada. Você está em dia 🎯
          </div>
        ) : (
          <div className="space-y-3">
            {actions.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {severityIcon(a.severity)}
                    <span className="font-medium text-sm">{a.title}</span>
                    {severityBadge(a.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    <span className="font-medium">{a.productName}</span>: {a.description}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <Button asChild size="sm" variant="outline">
                    <Link to={a.ctaHref}>{a.ctaLabel}</Link>
                  </Button>
                </div>
              </div>
            ))}

            {actions.length > 8 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Mostrando 8 de {actions.length}. (Depois a gente adiciona "ver todas".)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
