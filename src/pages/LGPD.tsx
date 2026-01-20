import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Edit, Trash2, Package, Ban, Info, AlertTriangle, Lock, Share2, AlertCircle, Cookie, Globe, Baby, HelpCircle, Mail } from "lucide-react";

const rights = [
  { icon: Eye, title: "Confirmação e Acesso", description: "Saber se tratamos seus dados e acessá-los" },
  { icon: Edit, title: "Correção", description: "Corrigir dados incompletos ou desatualizados" },
  { icon: Trash2, title: "Eliminação", description: "Solicitar exclusão de dados desnecessários" },
  { icon: Package, title: "Portabilidade", description: "Exportar seus dados em formato estruturado" },
  { icon: Ban, title: "Revogação", description: "Revogar consentimento dado anteriormente" },
  { icon: Info, title: "Informação", description: "Saber com quem compartilhamos seus dados" },
  { icon: AlertTriangle, title: "Oposição", description: "Opor-se a tratamentos não essenciais" },
  { icon: Lock, title: "Anonimização", description: "Solicitar anonimização quando possível" }
];

const securityMeasures = [
  "Criptografia de dados em trânsito e repouso",
  "Autenticação de dois fatores (2FA)",
  "Controle de acesso baseado em função (RBAC)",
  "Backup automático criptografado",
  "Monitoramento 24/7",
  "Testes de penetração periódicos",
  "Treinamento de equipe em privacidade"
];

const faqs = [
  {
    question: "Vocês vendem meus dados?",
    answer: "Não. Nunca."
  },
  {
    question: "Quanto tempo guardam meus dados?",
    answer: "Conta ativa: indefinidamente. Após cancelamento: 90 dias. Dados fiscais: 5 anos."
  },
  {
    question: "Posso excluir minha conta?",
    answer: "Sim. Em Configurações > Conta > Excluir. Ou solicite para lgpd@fedcom.com.br"
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Sim. Usamos criptografia, backups e seguimos as melhores práticas da indústria."
  }
];

export default function LGPD() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Compromisso com sua Privacidade
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Conformidade Total com a LGPD
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* O que é LGPD */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">O que é LGPD?</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                A Lei Geral de Proteção de Dados (Lei 13.709/2018) regula o tratamento de 
                dados pessoais no Brasil, garantindo mais controle e transparência sobre 
                suas informações.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Nosso Compromisso */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Nosso Compromisso</h2>
          <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                O FEDCOM está 100% comprometido com a LGPD. Tratamos seus dados com máxima 
                segurança e transparência.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Seus Direitos */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Seus Direitos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rights.map((right, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <right.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{right.title}</h3>
                  <p className="text-xs text-muted-foreground">{right.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Como Exercer Seus Direitos */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Como Exercer Seus Direitos</h2>
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Envie sua solicitação para: <strong>lgpd@fedcom.com.br</strong>
              </p>
              <p className="text-muted-foreground mb-4">
                Responderemos em até <strong>15 dias úteis</strong>.
              </p>
              <p className="text-muted-foreground mb-2">Você precisará:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Identificar-se (CPF + email cadastrado)</li>
                <li>Especificar o direito que deseja exercer</li>
                <li>Fornecer informações adicionais se necessário</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Base Legal */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Base Legal para Tratamento</h2>
          <div className="pl-4 sm:pl-8">
            <p className="text-muted-foreground mb-2">Tratamos seus dados com base em:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Execução de contrato:</strong> Para fornecer o serviço contratado</li>
              <li><strong>Consentimento:</strong> Para marketing e newsletters</li>
              <li><strong>Legítimo interesse:</strong> Para melhorias e segurança</li>
              <li><strong>Obrigação legal:</strong> Para cumprir leis fiscais e contábeis</li>
            </ul>
          </div>
        </section>

        {/* DPO */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Encarregado de Dados (DPO)
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Nosso DPO (Data Protection Officer) é responsável por:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mb-4">
                <li>Atender suas solicitações</li>
                <li>Garantir conformidade com LGPD</li>
                <li>Comunicação com ANPD (quando necessário)</li>
              </ul>
              <div className="border-t pt-4 mt-4">
                <p className="font-semibold mb-2">Contato:</p>
                <p className="text-muted-foreground">Email: dpo@fedcom.com.br</p>
                <p className="text-muted-foreground">Telefone: (11) 4000-0000</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Medidas de Segurança */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            Medidas de Segurança
          </h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {securityMeasures.map((measure, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-success">✅</span>
                    {measure}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Compartilhamento */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Compartilhamento de Dados
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Compartilhamos dados apenas quando necessário:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Processadores de Pagamento:</h4>
                  <p className="text-muted-foreground text-sm">Stripe Inc. (EUA) - PCI-DSS compliant</p>
                  <p className="text-muted-foreground text-sm">Mercado Pago (Brasil)</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Infraestrutura:</h4>
                  <p className="text-muted-foreground text-sm">Amazon Web Services (AWS) - ISO 27001</p>
                  <p className="text-muted-foreground text-sm">Supabase (EUA) - SOC 2 Type II</p>
                </div>
                <p className="text-sm text-muted-foreground italic mt-4">
                  Todos com cláusulas contratuais de proteção de dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Incidentes */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-primary" />
            Incidentes de Segurança
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-2">Em caso de vazamento de dados:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-4">
                <li>Notificaremos você em até 72 horas</li>
                <li>Informaremos ANPD quando necessário</li>
                <li>Tomaremos medidas para mitigar danos</li>
                <li>Forneceremos suporte e orientação</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Cookies */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Cookie className="h-6 w-6 text-primary" />
            Cookies e Rastreamento
          </h2>
          <div className="pl-4 sm:pl-8">
            <p className="text-muted-foreground">
              Usamos cookies essenciais e analíticos.
              Você pode gerenciar preferências nas configurações do seu navegador.
            </p>
          </div>
        </section>

        {/* Transferência Internacional */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Transferência Internacional
          </h2>
          <div className="pl-4 sm:pl-8">
            <p className="text-muted-foreground mb-2">Seus dados podem ser transferidos para:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Estados Unidos (AWS, Stripe)</li>
              <li>União Europeia (parceiros)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong>Garantias:</strong> Cláusulas contratuais padrão da UE + certificações de segurança.
            </p>
          </div>
        </section>

        {/* Menores */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" />
            Crianças e Adolescentes
          </h2>
          <div className="pl-4 sm:pl-8">
            <p className="text-muted-foreground">
              Não coletamos intencionalmente dados de menores de 18 anos sem consentimento 
              dos responsáveis.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-4 sm:p-5">
                  <h4 className="font-semibold mb-2">{faq.question}</h4>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contato */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Contato</h2>
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Dúvidas sobre LGPD:</p>
              <div className="space-y-1">
                <p className="text-muted-foreground"><strong>Email:</strong> lgpd@fedcom.com.br</p>
                <p className="text-muted-foreground"><strong>DPO:</strong> dpo@fedcom.com.br</p>
                <p className="text-muted-foreground"><strong>Telefone:</strong> (11) 4000-0000</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
