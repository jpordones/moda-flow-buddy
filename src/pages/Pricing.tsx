import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Shield, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    subtitle: "Para começar a precificar sem planilhas",
    price: "R$ 49",
    period: "/mês",
    highlight: false,
    features: ["Até 100 produtos", "Dashboard de margem e giro", "Alertas básicos de preço e estoque", "1 usuário"],
  },
  {
    name: "Pro",
    subtitle: "Para loja online em crescimento",
    price: "R$ 149",
    period: "/mês",
    highlight: true,
    features: ["Até 1.000 produtos", "Recomendações de preço por objetivo", "Previsão de demanda (beta)", "Até 3 usuários", "Suporte prioritário"],
  },
  {
    name: "Scale",
    subtitle: "Para operação maior e multicanal",
    price: "R$ 399",
    period: "/mês",
    highlight: false,
    features: ["Produtos ilimitados", "Regras avançadas e automações", "Equipe ilimitada", "Integrações (sob demanda)", "Onboarding assistido"],
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm">
            <Sparkles className="w-4 h-4 mr-1" />
            Assinatura mensal
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Planos para pequenos lojistas de moda
          </h1>

          <p className="text-lg text-muted-foreground">
            Comece no Starter e faça upgrade quando precisar. Sem fidelidade.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Sem cartão no teste</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Cancele quando quiser</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => (
            <Card key={p.name} className={`relative ${p.highlight ? "border-primary shadow-lg scale-105" : ""}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {p.name}
                  {p.highlight && <Badge className="bg-primary text-primary-foreground">Mais escolhido</Badge>}
                </div>
                <CardDescription>{p.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground ml-1">{p.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <BadgeCheck className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button className="w-full" variant={p.highlight ? "default" : "outline"} onClick={() => navigate("/auth")}>
                  Começar {p.name.toLowerCase()} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Posso trocar de plano quando quiser?</AccordionTrigger>
              <AccordionContent>Sim. Você pode fazer upgrade/downgrade a qualquer momento.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Esses valores são finais?</AccordionTrigger>
              <AccordionContent>No MVP, os preços são referência. Você pode ajustar depois quando validar a tração.</AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Começar grátis <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
