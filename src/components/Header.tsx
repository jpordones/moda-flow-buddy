import { useState } from "react";
import { Bell, Search, Sun, Moon, User, Settings, HelpCircle, LogOut, X } from "lucide-react";
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
import fedcomLogo from "@/assets/FEDCOM.svg";

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount] = useState(3);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { user, profile, signOut } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
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

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-header-foreground hover:bg-sidebar-accent">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs bg-danger text-danger-foreground"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 font-semibold border-b text-foreground">Notificações</div>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">Estoque baixo</span>
                  <span className="text-sm text-muted-foreground">3 produtos precisam de reposição</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">Nova transação</span>
                  <span className="text-sm text-muted-foreground">Entrada registrada há 2 horas</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 text-center text-primary cursor-pointer justify-center">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Daily Balance - Desktop only */}
          <div className="hidden lg:flex items-center">
            <div className="balance-card">
              <span className="text-xs text-header-foreground/70">Saldo do dia</span>
              <span className="block font-bold text-success text-sm">R$ 0,00</span>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-sidebar-accent p-0">
              <Avatar className="h-9 w-9 border-2 border-header-foreground/20">
                <AvatarImage src={profile?.logo_url || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback className="bg-brand text-brand-foreground font-semibold">{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.logo_url || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback className="bg-brand text-brand-foreground font-semibold">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{profile?.full_name || 'Usuário'}</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </div>
              
              {/* Mobile Balance */}
              <div className="lg:hidden p-3 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saldo do dia</span>
                  <span className="font-bold text-success">R$ 0,00</span>
                </div>
              </div>

              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="gap-3 p-3 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="gap-3 p-3 cursor-pointer">
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

          {/* Dark Mode Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            className="text-header-foreground hover:bg-sidebar-accent"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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