import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // DEV MODE: Disable auth requirement
  // useEffect(() => {
  //   if (!user) {
  //     navigate('/auth');
  //   }
  // }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out."
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // DEV MODE: Skip auth check
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-4">
            <SidebarTrigger className="-ml-1 md:ml-0" />
            <div className="flex-1" />
            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="text-muted-foreground hidden md:inline">
                  {user?.email || 'dev@example.com'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="gap-1 md:gap-2 text-xs md:text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-background via-muted/20 to-accent/30">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}