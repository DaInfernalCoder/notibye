import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, Zap, Mail, History, Plus, CalendarDays } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// Linear's inverted L-shape navigation pattern
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: Home,
  },
  {
    title: 'Triggers',
    url: '/app/triggers',
    icon: Zap,
  },
  {
    title: 'Campaigns',
    url: '/app/templates',
    icon: Mail,
  },
  {
    title: 'Analytics',
    url: '/app/history',
    icon: History,
  },
  {
    title: 'Settings',
    url: '/app/integrations',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="w-[280px] border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-sidebar-foreground">notibye</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarMenu className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={`h-11 px-4 rounded-lg transition-colors ${
                    active 
                      ? 'bg-sidebar-accent text-sidebar-primary border-l-4 border-l-sidebar-primary' 
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  }`}
                >
                  <NavLink to={item.url} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}