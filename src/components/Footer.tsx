import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Empresa Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/sobre-nos" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/carreiras" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/politica-privacidade" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-uso" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/lgpd" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:suporte@fedcom.com.br" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  suporte@fedcom.com.br
                </a>
              </li>
              <li>
                <Link to="/planos" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Planos
                </Link>
              </li>
            </ul>
          </div>

          {/* Navegação Column */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/estoque" className="text-sm sm:text-base text-footer-muted hover:text-brand transition-colors py-1 inline-block">
                  Estoque
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-footer-border">
        <div className="container mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-footer-muted text-xs sm:text-sm">
            © 2024 FEDCOM. Todos os direitos reservados.
          </p>
          <p className="text-footer-muted text-xs mt-1">
            CNPJ: XX.XXX.XXX/0001-XX | São Paulo, SP
          </p>
        </div>
      </div>
    </footer>
  );
}
