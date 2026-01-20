import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Share2, Clock, Globe, Baby, FileText, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Política de Privacidade
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
              Esta Política de Privacidade descreve como o FEDCOM coleta, usa, armazena e 
              protege suas informações pessoais, em conformidade com a Lei Geral de Proteção 
              de Dados (LGPD - Lei 13.709/2018).
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              1. Informações que Coletamos
            </h2>
            
            <div className="space-y-4 pl-4 sm:pl-8">
              <div>
                <h3 className="font-semibold mb-2">1.1 Dados Fornecidos por Você:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Nome completo</li>
                  <li>Email</li>
                  <li>Telefone (opcional)</li>
                  <li>CNPJ da empresa (opcional)</li>
                  <li>Endereço de cobrança</li>
                  <li>Dados de pagamento (processados por Stripe/Mercado Pago)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.2 Dados Coletados Automaticamente:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador</li>
                  <li>Páginas visitadas</li>
                  <li>Tempo de permanência</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.3 Dados de Uso da Plataforma:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Produtos cadastrados</li>
                  <li>Transações financeiras</li>
                  <li>Configurações da conta</li>
                  <li>Logs de atividade</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              2. Como Usamos Suas Informações
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">Utilizamos seus dados para:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e emitir notas fiscais</li>
                <li>Enviar comunicações importantes sobre a conta</li>
                <li>Oferecer suporte técnico</li>
                <li>Enviar newsletters (com seu consentimento)</li>
                <li>Cumprir obrigações legais e fiscais</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Share2 className="h-6 w-6 text-primary" />
              3. Compartilhamento de Dados
            </h2>
            <div className="pl-4 sm:pl-8">
              <Card className="bg-success/10 border-success/20 mb-4">
                <CardContent className="p-4">
                  <p className="font-semibold text-success">Não vendemos seus dados a terceiros.</p>
                </CardContent>
              </Card>
              <p className="text-muted-foreground mb-2">Compartilhamos apenas com:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Processadores de pagamento:</strong> Stripe, Mercado Pago (para processar transações)</li>
                <li><strong>Provedores de infraestrutura:</strong> AWS, Supabase (para hospedagem e banco de dados)</li>
                <li><strong>Ferramentas de analytics:</strong> Google Analytics (dados anonimizados)</li>
                <li><strong>Autoridades:</strong> Quando exigido por lei</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              4. Segurança dos Dados
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">Medidas de segurança:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Criptografia SSL/TLS em todas as conexões</li>
                <li>Criptografia de dados sensíveis em repouso</li>
                <li>Autenticação de dois fatores (2FA)</li>
                <li>Backup automático diário</li>
                <li>Acesso restrito aos dados (princípio do menor privilégio)</li>
                <li>Monitoramento contínuo de segurança</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              5. Seus Direitos (LGPD)
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">Você tem direito a:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Acessar</strong> seus dados pessoais</li>
                <li><strong>Corrigir</strong> dados incompletos ou desatualizados</li>
                <li><strong>Excluir</strong> sua conta e dados (direito ao esquecimento)</li>
                <li><strong>Portabilidade:</strong> exportar seus dados em formato estruturado</li>
                <li><strong>Revogar consentimento</strong> para uso de dados não essenciais</li>
                <li><strong>Oposição:</strong> opor-se a certos usos dos seus dados</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para exercer seus direitos: <strong>privacidade@fedcom.com.br</strong>
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">6. Cookies</h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground mb-2">Usamos cookies para:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Manter você logado</li>
                <li>Lembrar preferências</li>
                <li>Analisar uso do site (Google Analytics)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Você pode desabilitar cookies nas configurações do navegador, mas isso pode afetar funcionalidades.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              7. Retenção de Dados
            </h2>
            <div className="pl-4 sm:pl-8">
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Dados de conta ativa:</strong> mantidos enquanto sua conta estiver ativa</li>
                <li><strong>Após cancelamento:</strong> dados mantidos por 90 dias (para reativação)</li>
                <li><strong>Dados fiscais:</strong> 5 anos (obrigação legal)</li>
                <li><strong>Logs de segurança:</strong> 6 meses</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              8. Transferência Internacional
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground">
                Seus dados podem ser armazenados em servidores fora do Brasil (AWS, Supabase). 
                Garantimos que essas empresas seguem padrões adequados de proteção.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Baby className="h-6 w-6 text-primary" />
              9. Menores de Idade
            </h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground">
                Nosso serviço não é destinado a menores de 18 anos. Não coletamos 
                intencionalmente dados de menores.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">10. Alterações nesta Política</h2>
            <div className="pl-4 sm:pl-8">
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Mudanças significativas serão 
                notificadas por email.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              11. Contato - DPO (Encarregado de Dados)
            </h2>
            <Card className="bg-muted/50">
              <CardContent className="p-4 sm:p-6">
                <p className="text-muted-foreground mb-2">Para questões sobre privacidade:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li><strong>Email:</strong> dpo@fedcom.com.br</li>
                  <li><strong>Telefone:</strong> (11) 4000-0000</li>
                  <li><strong>Endereço:</strong> São Paulo, SP</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
