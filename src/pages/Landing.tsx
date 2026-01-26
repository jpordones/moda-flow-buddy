import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Box,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricing = [
  {
    name: "Starter",
    subtitle: "Para começar a precificar sem planilhas",
    price: "R$ 49",
    period: "/mês",
    highlight: false,
    features: [
      "Até 100 produtos",
      "Dashboard de margem e giro",
      "Alertas básicos de preço e estoque",
      "1 usuário",
    ],
  },
  {
    name: "Pro",
    subtitle: "Para loja online em crescimento",
    price: "R$ 149",
    period: "/mês",
    highlight: true,
    features: [
      "Até 1.000 produtos",
      "Recomendações de preço por objetivo",
      "Previsão de demanda (beta)",
      "Até 3 usuários",
      "Suporte prioritário",
    ],
  },
  {
    name: "Scale",
    subtitle: "Para operação maior e multicanal",
    price: "R$ 399",
    period: "/mês",
    highlight: false,
    features: [
      "Produtos ilimitados",
      "Regras avançadas e automações",
      "Equipe ilimitada",
      "Integrações (sob demanda)",
      "Onboarding assistido",
    ],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Precificação inteligente para moda
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Aumente sua margem e o{" "}
                <span className="text-primary">giro</span> com decisões de preço mais
                rápidas.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                O <span className="font-semibold text-foreground">FEDCOM</span>{" "}
                junta estoque, caixa e custos para sugerir preços melhores — sem
                planilhas. Feito para pequenos lojistas de e-commerce de moda.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="w-full sm:w-auto"
                >
                  Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/precos")}
                >
                  Ver planos
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-primary" /> Sem cartão no teste
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Setup em minutos
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" /> Feito para moda
                </span>
              </div>
            </div>

            {/* Product preview */}
            <div className="relative">
              <div className="rounded-2xl border bg-card p-4 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Visão geral</h3>
                      <p className="text-sm text-muted-foreground">
                        Hoje você pode recuperar margem em 3 produtos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Alertas</Badge>
                      <Badge variant="default">
                        Recomendação de preço
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4" /> Margem média
                        </CardDescription>
                        <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-2xl font-bold text-primary">23,4%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta sugerida: 28% (custos + giro)
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <Box className="h-4 w-4" /> Risco de ruptura
                        </CardDescription>
                        <span className="text-xs text-muted-foreground">Próximos 14 dias</span>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-2xl font-bold text-destructive">7 SKUs</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sugestão: ajuste preço / recompre
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <Zap className="h-4 w-4" /> Oportunidade
                        </CardDescription>
                        <span className="text-xs text-muted-foreground">Precificação</span>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-2xl font-bold text-primary">R$ 1.240</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lucro potencial com ajustes sugeridos
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Top alertas</CardTitle>
                          <CardDescription>
                            Exemplos de insights (MVP)
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/auth")}
                        >
                          Abrir app
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-destructive/10">
                        <Shield className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Preço abaixo do mínimo</p>
                          <p className="text-xs text-muted-foreground">
                            Vestido midi: +R$ 12 no preço sugerido
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-warning/10">
                        <Clock className="h-5 w-5 text-warning mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Encalhe (giro baixo)</p>
                          <p className="text-xs text-muted-foreground">
                            Camiseta básica: estratégia "queima"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Caixa pressionado</p>
                          <p className="text-xs text-muted-foreground">
                            Evite promoções em itens de alta demanda
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Como o FEDCOM funciona
              </h2>
              <p className="text-lg text-muted-foreground">
                Você registra custos, controla estoque e acompanha o caixa. O
                sistema cruza tudo isso para sugerir preços e prioridades.
              </p>
            </div>
            <Button size="lg" onClick={() => navigate("/auth")}>
              Criar conta
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardDescription className="text-primary font-semibold">
                  <BarChart3 className="h-5 w-5 inline mr-2" /> 1) Entenda custos e margem
                </CardDescription>
                <CardTitle>Preço mínimo, margem real e despesas</CardTitle>
              </CardHeader>
              <CardContent>
                Configure custos fixos e variáveis para descobrir a margem real por produto.
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardDescription className="text-primary font-semibold">
                  <Box className="h-5 w-5 inline mr-2" /> 2) Conecte com estoque
                </CardDescription>
                <CardTitle>Giro, encalhe e risco de ruptura</CardTitle>
              </CardHeader>
              <CardContent>
                Controle entradas/saídas e veja onde o preço precisa acelerar ou segurar vendas.
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardDescription className="text-primary font-semibold">
                  <Target className="h-5 w-5 inline mr-2" /> 3) Ajuste preços com objetivo
                </CardDescription>
                <CardTitle>Lucro, giro ou liquidação</CardTitle>
              </CardHeader>
              <CardContent>
                Sugestões práticas de preço para bater meta de margem e não travar seu caixa.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos simples, sem pegadinha
            </h2>
            <p className="text-lg text-muted-foreground">
              Assinatura mensal. Cancele quando quiser.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {pricing.map((p) => (
              <Card
                key={p.name}
                className={`relative ${p.highlight ? "border-primary shadow-lg scale-105" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{p.name}</CardTitle>
                    {p.highlight && (
                      <Badge variant="default">Mais escolhido</Badge>
                    )}
                  </div>
                  <CardDescription>{p.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={p.highlight ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    Começar {p.name.toLowerCase()} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8">
            Quer um plano sob medida?{" "}
            <a href="mailto:contato@fedcom.com.br" className="text-primary hover:underline">
              Fale com a gente
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Preciso colocar cartão para testar?</AccordionTrigger>
              <AccordionContent>
                Não. Você consegue criar conta e explorar o produto sem cartão no início.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>O FEDCOM integra com Shopify/Tray/Nuvemshop?</AccordionTrigger>
              <AccordionContent>
                No MVP, começamos com importação e fluxo manual. Integrações entram no roadmap do plano Scale.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Isso serve para moda com variação (cor/tamanho)?</AccordionTrigger>
              <AccordionContent>
                Sim — o foco é moda. A estrutura do app é pensada para SKUs e giro por variação.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
