import { LayoutDashboard, TrendingUp, Package, ShoppingBag, Calculator, Settings } from "lucide-react";
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

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Fluxo de Caixa", url: "/fluxo-caixa", icon: TrendingUp },
  { title: "Produtos", url: "/produtos", icon: ShoppingBag },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Custos & Precificação", url: "/custos", icon: Calculator },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6">
          <img 
            src={fedcomLogo} 
            alt="FEDCOM" 
            className={`w-32 h-32 transition-opacity ${!open && "opacity-0"}`}
          />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "opacity-0" : ""}>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className={!open ? "hidden" : ""}>{item.title}</span>
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
