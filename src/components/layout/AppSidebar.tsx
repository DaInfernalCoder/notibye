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
    <Sidebar className="w-[240px] md:w-[280px] border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
          </div>
          <span className="text-lg md:text-xl font-semibold text-sidebar-foreground">notibye</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 md:px-3 py-4 md:py-6">
        <SidebarMenu className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={`h-10 md:h-11 px-3 md:px-4 rounded-lg transition-colors ${
                    active 
                      ? 'bg-sidebar-accent text-sidebar-primary border-l-4 border-l-sidebar-primary' 
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  }`}
                >
                  <NavLink to={item.url} className="flex items-center gap-2 md:gap-3">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="font-medium text-xs md:text-sm">{item.title}</span>
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