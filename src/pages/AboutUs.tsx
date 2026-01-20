import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Rocket, Handshake, Linkedin, Users, DollarSign, Package, Star } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Simplicidade",
    description: "Tecnologia complexa, interface simples. Qualquer um consegue usar."
  },
  {
    icon: BarChart3,
    title: "Transparência",
    description: "Dados claros, sem letras miúdas. Você entende exatamente o que está acontecendo."
  },
  {
    icon: Rocket,
    title: "Crescimento",
    description: "Seu sucesso é o nosso sucesso. Crescemos juntos."
  },
  {
    icon: Handshake,
    title: "Parceria",
    description: "Não somos apenas software. Somos parceiros do seu negócio."
  }
];

const team = [
  {
    name: "João Silva",
    role: "CEO & Co-fundador",
    linkedin: "#",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
  },
  {
    name: "Maria Santos",
    role: "CTO & Co-fundadora",
    linkedin: "#",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
  },
  {
    name: "Carlos Mendes",
    role: "Head de Produto",
    linkedin: "#",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
  },
  {
    name: "Ana Costa",
    role: "Head de Sucesso do Cliente",
    linkedin: "#",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
  }
];

const stats = [
  { icon: Users, value: "500+", label: "Lojas Ativas" },
  { icon: DollarSign, value: "R$ 50M+", label: "Processados" },
  { icon: Star, value: "95%", label: "Taxa de Satisfação" },
  { icon: Package, value: "2M+", label: "Produtos Gerenciados" }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Sobre o <span className="text-primary">FEDCOM</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Transformando a Gestão de E-commerce de Moda no Brasil
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Nossa História</h2>
          <div className="space-y-4 sm:space-y-6 text-muted-foreground text-base sm:text-lg leading-relaxed">
            <p>
              O FEDCOM nasceu em 2024 da frustração de dezenas de lojistas que perdiam dinheiro 
              sem entender o porquê. Preços calculados no "feeling", estoque descontrolado em 
              múltiplos canais e margem de lucro invisível eram problemas constantes.
            </p>
            <p>
              Fundado por empreendedores que viveram essas dores na própria pele, o FEDCOM 
              combina tecnologia de ponta com conhecimento profundo do mercado de moda brasileiro. 
              Nossa missão é simples: fazer cada lojista ter controle total do seu negócio.
            </p>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">🎯 Nossa Missão</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Democratizar a gestão inteligente de e-commerce, permitindo que lojistas de todos 
                os tamanhos tenham acesso a ferramentas profissionais de precificação e controle de estoque.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">Nossos Valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Time */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">Nosso Time</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                  />
                  <h3 className="font-bold text-sm sm:text-base">{member.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{member.role}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline text-xs sm:text-sm"
                  >
                    <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    LinkedIn
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center">Nossos Números</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-4 sm:p-6">
                  <stat.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-2 sm:mb-3" />
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pronto para Crescer com a Gente?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de lojistas que já transformaram a gestão do seu e-commerce.
          </p>
          <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8">
            <Link to="/auth">Começar Gratuitamente</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
