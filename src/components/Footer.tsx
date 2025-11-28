import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Navigation Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-footer-muted hover:text-brand transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/fluxo-caixa" className="text-footer-muted hover:text-brand transition-colors">
                  Fluxo de Caixa
                </Link>
              </li>
              <li>
                <Link to="/estoque" className="text-footer-muted hover:text-brand transition-colors">
                  Estoque
                </Link>
              </li>
              <li>
                <Link to="/configuracoes" className="text-footer-muted hover:text-brand transition-colors">
                  Configurações
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Importar Dados
                </a>
              </li>
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Backup
                </a>
              </li>
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Integrações
                </a>
              </li>
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Tutoriais
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Sobre</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-footer-muted hover:text-brand transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <span className="text-footer-muted">Versão 1.0.0</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-footer-border">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-footer-muted text-sm">
            © 2024 FECOM - Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
