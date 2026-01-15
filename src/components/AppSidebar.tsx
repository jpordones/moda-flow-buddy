import { LayoutDashboard, TrendingUp, Package, ShoppingBag, Calculator, Settings, X, Crown, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import fedcomLogo from "@/assets/FEDCOM.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Fluxo de Caixa", url: "/fluxo-caixa", icon: TrendingUp },
  { title: "Produtos", url: "/produtos", icon: ShoppingBag },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Custos & Precificação", url: "/custos", icon: Calculator },
  { title: "Equipe", url: "/equipe", icon: Users },
  { title: "Planos", url: "/planos", icon: Crown },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { currentPlan } = useSubscription();
  const navigate = useNavigate();

  const getPlanDisplay = () => {
    if (!currentPlan) return { name: "Free", color: "secondary" as const };
    switch (currentPlan.plan_type) {
      case "starter": return { name: "Starter", color: "info" as const };
      case "professional": return { name: "Pro", color: "success" as const };
      case "enterprise": return { name: "Enterprise", color: "warning" as const };
      default: return { name: "Free", color: "secondary" as const };
    }
  };

  const planDisplay = getPlanDisplay();

  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}
      
      <Sidebar 
        collapsible="icon"
        className={cn(
          "border-r border-sidebar-border transition-all duration-300",
          isMobile && "fixed inset-y-0 left-0 z-50 w-[280px] shadow-xl"
        )}
      >
        <SidebarContent className="bg-sidebar h-full">
          {/* Header with Logo */}
          <div className="flex items-center justify-between px-4 py-6">
            <img 
              src={fedcomLogo} 
              alt="FEDCOM" 
              className={cn(
                "transition-all duration-300",
                open ? "w-28 h-28" : "w-8 h-8",
                isMobile && "w-20 h-20"
              )}
            />
            
            {/* Close button for mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMobile(false)}
                className="h-11 w-11 text-sidebar-foreground hover:bg-sidebar-accent-hover"
              >
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>

          <SidebarGroup>
            <SidebarGroupLabel 
              className={cn(
                "text-sidebar-foreground/60 uppercase text-xs font-semibold tracking-wider px-4",
                !open && !isMobile && "sr-only"
              )}
            >
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg min-h-[44px]",
                          "text-sidebar-foreground",
                          "hover:bg-sidebar-accent-hover transition-colors duration-200"
                        )}
                        activeClassName="bg-sidebar-accent font-semibold border-l-[3px] border-sidebar-foreground -ml-[3px] pl-[calc(0.75rem+3px)]"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className={cn(
                          "transition-opacity duration-200",
                          !open && !isMobile && "opacity-0 w-0 overflow-hidden"
                        )}>
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Plan Badge */}
          {(open || isMobile) && (
            <div className="px-4 py-3 mt-auto border-t border-sidebar-border">
              <div 
                className="flex items-center gap-2 p-3 rounded-lg bg-sidebar-accent/50 cursor-pointer hover:bg-sidebar-accent transition-colors min-h-[44px]"
                onClick={() => {
                  handleNavClick();
                  navigate("/planos");
                }}
              >
                <Crown className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-sidebar-foreground">Plano:</span>
                <Badge variant={planDisplay.color} className="text-xs">
                  {planDisplay.name}
                </Badge>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
    </>
  );
}