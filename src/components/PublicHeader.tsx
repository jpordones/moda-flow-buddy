import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import fedcomLogo from "@/assets/FEDCOM.svg";

export function PublicHeader() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem('darkMode', String(newMode));
  };

  const navLinks = [
    { label: "Sobre", to: "/sobre-nos" },
    { label: "Blog", to: "/blog" },
    { label: "Planos", to: "/planos" },
    { label: "Carreiras", to: "/carreiras" },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-header-border bg-header shadow-sm">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={fedcomLogo} 
            alt="FEDCOM" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-header-foreground/80 hover:text-header-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            className="text-header-foreground hover:bg-muted/50"
            title={isDarkMode ? "Modo claro" : "Modo escuro"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Login Button - Desktop */}
          <Button 
            variant="outline"
            className="hidden sm:flex"
            onClick={() => navigate("/auth")}
          >
            Entrar
          </Button>

          {/* CTA Button - Desktop */}
          <Button 
            className="hidden sm:flex"
            onClick={() => navigate("/auth")}
          >
            Começar Grátis
          </Button>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-header-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-header border-b border-header-border shadow-lg animate-in slide-in-from-top-2">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 text-sm font-medium text-header-foreground hover:bg-muted/50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-header-border my-2" />
            <div className="flex gap-2 px-4 pt-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Entrar
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Começar Grátis
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
