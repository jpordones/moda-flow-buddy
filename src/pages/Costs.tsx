import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Costs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custos & Precificação</h1>
        <p className="text-muted-foreground">Gerencie custos e calcule preços de venda</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>Esta funcionalidade estará disponível em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aqui você poderá gerenciar custos fixos e variáveis, além de calcular preços de venda otimizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
