import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, CreditCard, User, Shield, Ban, AlertTriangle, Headphones, RefreshCw, XCircle, Scale, Mail } from "lucide-react";

export default function TermsOfUse() {
  const lastUpdate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground">
            Última atualização: {lastUpdate}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar a plataforma FEDCOM, você concorda com estes Termos de Uso. 
              Leia atentamente antes de criar sua conta.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              1. Aceitação dos Termos
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">Ao se cadastrar, você declara:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Ter capacidade legal para celebrar contratos</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Aceitar estes termos e a Política de Privacidade</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              2. Descrição do Serviço
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">O FEDCOM é uma plataforma SaaS que oferece:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Sistema de precificação inteligente</li>
                <li>Controle de estoque multi-loja</li>
                <li>Gestão de fluxo de caixa</li>
                <li>Relatórios e análises</li>
                <li>Integrações com marketplaces</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              3. Planos e Pagamentos
            </h2>
            <div className="pl-4 sm:pl-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">3.1 Planos Disponíveis:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Gratuito (limitado)</li>
                  <li>Starter (R$ 149/mês)</li>
                  <li>Professional (R$ 299/mês)</li>
                  <li>Enterprise (R$ 799/mês)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.2 Formas de Pagamento:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Cartão de crédito (via Stripe/Mercado Pago)</li>
                  <li>Boleto bancário (planos anuais)</li>
                  <li>PIX (disponível)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.3 Cobrança:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Cobrança recorrente mensal ou anual</li>
                  <li>Renovação automática</li>
                  <li>Reajustes avisados com 30 dias de antecedência</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.4 Reembolso:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>7 dias de garantia de satisfação (planos pagos)</li>
                  <li>Reembolso proporcional em caso de downtime &gt; 24h</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              4. Conta do Usuário
            </h2>
            <div className="pl-4 sm:pl-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">4.1 Sua Responsabilidade:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Manter senha segura</li>
                  <li>Não compartilhar credenciais</li>
                  <li>Notificar acessos não autorizados</li>
                  <li>Usar o serviço conforme a lei</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.2 Suspensão ou Encerramento:</h3>
                <p className="text-muted-foreground mb-2">Podemos suspender sua conta se:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Houver violação destes termos</li>
                  <li>Atividade fraudulenta for detectada</li>
                  <li>Pagamento estiver atrasado &gt; 15 dias</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              5. Propriedade Intelectual
            </h2>
            <div className="pl-4 sm:pl-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">5.1 Nossa Propriedade:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Código-fonte, design, marca FEDCOM</li>
                  <li>Documentação e materiais de marketing</li>
                  <li>Algoritmos e modelos de IA</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.2 Seus Dados:</h3>
                <p className="text-muted-foreground mb-2">Você mantém propriedade total de:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Dados de produtos</li>
                  <li>Informações de clientes</li>
                  <li>Dados financeiros</li>
                  <li>Conteúdo criado na plataforma</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Ban className="h-6 w-6 text-primary" />
              6. Uso Aceitável
            </h2>
            <div className="pl-4 sm:pl-8">
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4">
                  <p className="font-semibold text-destructive mb-2">Proibido:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Usar para atividades ilegais</li>
                    <li>Tentar hackear ou violar segurança</li>
                    <li>Fazer engenharia reversa do software</li>
                    <li>Revender acesso sem autorização</li>
                    <li>Sobrecarregar sistema (DDoS)</li>
                    <li>Usar para spam ou phishing</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              7. Limitação de Responsabilidade
            </h2>
            <div className="pl-4 sm:pl-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">7.1 Disponibilidade:</h3>
                <p className="text-muted-foreground mb-2">Garantimos uptime de 99.5% (SLA). Não nos responsabilizamos por:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Problemas de internet do usuário</li>
                  <li>Incompatibilidade de navegadores antigos</li>
                  <li>Manutenções programadas (avisadas)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">7.2 Dados:</h3>
                <p className="text-muted-foreground mb-2">Fazemos backup diário, mas recomendamos que você:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Exporte dados regularmente</li>
                  <li>Mantenha cópia de segurança</li>
                  <li>Não use como única fonte de dados críticos</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">7.3 Decisões de Negócio:</h3>
                <p className="text-muted-foreground mb-2">O FEDCOM fornece ferramentas e insights, mas:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Decisões finais são suas</li>
                  <li>Não garantimos resultados específicos</li>
                  <li>Não somos consultoria contábil ou jurídica</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              8. Suporte
            </h2>
            <div className="pl-4 sm:pl-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">8.1 Canais:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Email: suporte@fedcom.com.br</li>
                  <li>Chat (planos Professional e Enterprise)</li>
                  <li>WhatsApp (Enterprise)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">8.2 Horários:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Plano Gratuito e Starter: 9h-18h (dias úteis)</li>
                  <li>Professional: 8h-20h (dias úteis)</li>
                  <li>Enterprise: 24/7</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">8.3 Tempo de Resposta:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Crítico: 2 horas (Enterprise)</li>
                  <li>Urgente: 8 horas (Professional)</li>
                  <li>Normal: 24 horas (todos)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-primary" />
              9. Modificações no Serviço
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">Podemos:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Adicionar funcionalidades</li>
                <li>Modificar recursos existentes</li>
                <li>Descontinuar funcionalidades (com aviso de 60 dias)</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <XCircle className="h-6 w-6 text-primary" />
              10. Cancelamento
            </h2>
            <div className="pl-4 sm:pl-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">10.1 Por Você:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Cancele a qualquer momento</li>
                  <li>Acesso mantido até fim do período pago</li>
                  <li>Dados disponíveis para exportação por 90 dias</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">10.2 Por Nós:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Com 30 dias de aviso (sem justa causa)</li>
                  <li>Imediatamente (com justa causa: violação de termos)</li>
                  <li>Reembolso proporcional</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              11. Lei Aplicável
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground">
                Estes termos são regidos pelas leis brasileiras.<br />
                Foro: Comarca de São Paulo/SP.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              12. Contato
            </h2>
            <Card className="bg-muted/50">
              <CardContent className="p-4 sm:p-6">
                <p className="text-muted-foreground mb-2">Para dúvidas sobre estes termos:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong>Email:</strong> juridico@fedcom.com.br</li>
                  <li><strong>Telefone:</strong> (11) 4000-0000</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
