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

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: Home,
    description: 'Active triggers overview'
  },
  {
    title: 'Integrations',
    url: '/app/integrations',
    icon: Settings,
    description: 'Connect your services'
  },
  {
    title: 'Triggers',
    url: '/app/triggers',
    icon: Zap,
    description: 'Manage churn triggers'
  },
  {
    title: 'Email Templates',
    url: '/app/templates',
    icon: Mail,
    description: 'Create email templates'
  },
  {
    title: 'History',
    url: '/app/history',
    icon: History,
    description: 'View sent emails'
  },
  {
    title: 'User Timeline',
    url: '/app/timeline',
    icon: CalendarDays,
    description: 'Track user journeys'
  },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">ChurnGuard</h2>
            <p className="text-xs text-muted-foreground">Prevent customer churn</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/app/triggers/new" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Trigger</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/app/templates/new" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>New Template</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}