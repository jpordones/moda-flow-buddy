import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Home, BookOpen, Scale, MapPin, Briefcase, ArrowRight, Send } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Salário Competitivo",
    description: "Remuneração acima da média + participação nos resultados"
  },
  {
    icon: Home,
    title: "Remoto First",
    description: "Trabalhe de onde quiser. Escritório opcional em São Paulo."
  },
  {
    icon: BookOpen,
    title: "Aprendizado Contínuo",
    description: "Budget para cursos, livros e conferências"
  },
  {
    icon: Scale,
    title: "Work-Life Balance",
    description: "Horário flexível, férias ilimitadas, saúde mental em primeiro lugar"
  }
];

const jobs = [
  {
    id: 1,
    title: "Desenvolvedor Full-Stack (React + Node.js)",
    location: "Remoto",
    type: "CLT",
    salary: "R$ 8k - 15k",
    description: "Buscamos um desenvolvedor experiente para ajudar a construir novas funcionalidades e melhorar nossa plataforma."
  },
  {
    id: 2,
    title: "Designer de Produto (UI/UX)",
    location: "Remoto",
    type: "CLT",
    salary: "R$ 6k - 12k",
    description: "Procuramos um designer apaixonado por criar experiências incríveis para nossos usuários."
  },
  {
    id: 3,
    title: "Customer Success Manager",
    location: "Híbrido (SP)",
    type: "CLT",
    salary: "R$ 4k - 8k",
    description: "Ajude nossos clientes a ter sucesso e extrair o máximo valor do FEDCOM."
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Trabalhe no <span className="text-primary">FEDCOM</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ajude-nos a Revolucionar o E-commerce de Moda no Brasil
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">Por que FEDCOM?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Nossa Cultura</h2>
          <Card>
            <CardContent className="p-6 sm:p-8">
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                No FEDCOM, acreditamos que grandes produtos são construídos por pessoas felizes e motivadas. 
                Nossa cultura é baseada em transparência, autonomia e resultados. Não medimos horas trabalhadas, 
                mas sim o impacto que você gera.
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mt-4">
                Somos uma equipe pequena mas poderosa, onde cada pessoa faz diferença. Valorizamos 
                diversidade, curiosidade e a coragem de experimentar. Se você quer crescer junto com 
                uma startup em ascensão, este é o lugar certo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">Vagas Abertas</h2>
          
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <Button className="shrink-0">
                        Ver detalhes
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center">
              <CardContent className="p-8 sm:p-12">
                <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-bold text-lg sm:text-xl mb-2">Nenhuma vaga aberta no momento</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Envie seu currículo para <strong>carreiras@fedcom.com.br</strong> e entraremos 
                  em contato quando surgir algo alinhado ao seu perfil!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Não encontrou a vaga ideal?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Estamos sempre em busca de talentos. Envie seu currículo e conte sua história.
          </p>
          <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8" asChild>
            <a href="mailto:carreiras@fedcom.com.br">
              <Send className="mr-2 h-5 w-5" />
              Enviar Currículo Espontâneo
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
