import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Navigation Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/fluxo-caixa" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Fluxo de Caixa
                </Link>
              </li>
              <li>
                <Link to="/estoque" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Estoque
                </Link>
              </li>
              <li>
                <Link to="/configuracoes" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Configurações
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Importar Dados
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Backup
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Integrações
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Tutoriais
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Sobre</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Termos de Uso
                </a>
              </li>
              <li>
                <span className="text-sm sm:text-base text-footer-muted">v1.0.0</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-footer-border">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-footer-muted text-xs sm:text-sm">
            © 2024 FEDCOM - Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
