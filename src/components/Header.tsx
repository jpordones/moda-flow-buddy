import { useState, useEffect } from "react";
import { Search, Sun, Moon, User, Settings, HelpCircle, LogOut, X, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import fedcomLogo from "@/assets/FEDCOM.svg";

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { user, profile, signOut } = useAuth();
  const { currentPlan } = useSubscription();

  useEffect(() => {
    // Persist dark mode preference
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getCompanyInitial = () => {
    if (profile?.company_name) {
      return profile.company_name[0].toUpperCase();
    }
    if (profile?.full_name) {
      return profile.full_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'E';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getPlanDisplayName = () => {
    if (!currentPlan) return 'Free';
    const planNames: Record<string, string> = {
      free: 'Free',
      starter: 'Starter',
      professional: 'Pro',
      enterprise: 'Enterprise'
    };
    return planNames[currentPlan.plan_type] || 'Free';
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-header-border bg-header shadow-sm">
      <div className="flex h-full items-center justify-between gap-2 px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-header-foreground hover:bg-sidebar-accent" />
          
          {/* Logo - visible on mobile when sidebar is closed */}
          {isMobile && (
            <img 
              src={fedcomLogo} 
              alt="FEDCOM" 
              className="h-8 w-auto"
            />
          )}
        </div>

        {/* Center Section - Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos, transações..."
              className="pl-10 h-10 bg-card border-border focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-header-foreground hover:bg-sidebar-accent"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Notifications - Using NotificationCenter component */}
          <NotificationCenter />

          {/* Daily Balance - Desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="balance-card">
              <span className="text-xs text-header-foreground/70">Saldo do dia</span>
              <span className="block font-bold text-success text-sm">R$ 0,00</span>
            </div>
          </div>

          {/* Plan Badge - Click navigates to /planos */}
          <Badge 
            variant="outline" 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 cursor-pointer hover:bg-muted/50 transition-colors border-amber-500/50 text-amber-600"
            onClick={() => navigate("/app/planos")}
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Plano {getPlanDisplayName()}</span>
          </Badge>

          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            className="text-header-foreground hover:bg-sidebar-accent"
            title={isDarkMode ? "Modo claro" : "Modo escuro"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-sidebar-accent p-0">
              <Avatar className="h-10 w-10 border-2 border-amber-600/30">
                <AvatarImage src={profile?.logo_url || ""} alt="Avatar" />
                <AvatarFallback className="bg-amber-600 text-white font-bold text-lg">{getCompanyInitial()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.logo_url || ""} alt="Avatar" />
                <AvatarFallback className="bg-amber-600 text-white font-bold text-lg">{getCompanyInitial()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{profile?.company_name || profile?.full_name || 'Empresa'}</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </div>
              
              {/* Mobile Balance & Plan */}
              <div className="lg:hidden p-3 border-b space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saldo do dia</span>
                  <span className="font-bold text-success">R$ 0,00</span>
                </div>
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => navigate("/app/planos")}
                >
                  <span className="text-sm text-muted-foreground">Seu plano</span>
                  <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                    <Crown className="h-3 w-3 mr-1" />
                    {getPlanDisplayName()}
                  </Badge>
                </div>
              </div>

              <DropdownMenuItem onClick={() => navigate("/app/configuracoes")} className="gap-3 p-3 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/configuracoes")} className="gap-3 p-3 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 p-3 cursor-pointer">
                <HelpCircle className="h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="gap-3 p-3 text-danger cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-header border-b border-header-border p-4 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos, transações..."
              className="pl-10 h-12 bg-card border-border text-base"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}