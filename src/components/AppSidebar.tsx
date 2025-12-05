import { LayoutDashboard, TrendingUp, Package, ShoppingBag, Calculator, Settings, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Fluxo de Caixa", url: "/fluxo-caixa", icon: TrendingUp },
  { title: "Produtos", url: "/produtos", icon: ShoppingBag },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Custos & Precificação", url: "/custos", icon: Calculator },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { open, isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon"
      className={cn(
        "border-r border-sidebar-border transition-all duration-300",
        isMobile && "fixed inset-y-0 left-0 z-50"
      )}
    >
      <SidebarContent className="bg-sidebar">
        {/* Header with Logo */}
        <div className="flex items-center justify-between px-4 py-6">
          <img 
            src={fedcomLogo} 
            alt="FEDCOM" 
            className={cn(
              "transition-all duration-300",
              open ? "w-28 h-28" : "w-8 h-8"
            )}
          />
          
          {/* Close button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent-hover"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel 
            className={cn(
              "text-sidebar-foreground/60 uppercase text-xs font-semibold tracking-wider px-4",
              !open && "sr-only"
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
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "text-sidebar-foreground",
                        "hover:bg-sidebar-accent-hover transition-colors duration-200"
                      )}
                      activeClassName="bg-sidebar-accent font-semibold border-l-[3px] border-sidebar-foreground -ml-[3px] pl-[calc(0.75rem+3px)]"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className={cn(
                        "transition-opacity duration-200",
                        !open && "opacity-0 w-0 overflow-hidden"
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
      </SidebarContent>
    </Sidebar>
  );
}