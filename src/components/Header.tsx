import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Code } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDevAuth = async () => {
    console.log('Dev button clicked!'); // Debug log
    
    const password = prompt("Enter dev password:");
    console.log('Password entered:', password ? 'YES' : 'NO'); // Debug log
    
    if (password === "A16") {
      try {
        // Generate unique dev credentials
        const timestamp = Date.now();
        const devEmail = `dev${timestamp}@gmail.com`;
        const devPassword = 'DevPassword123!';

        console.log('Creating dev user with email:', devEmail);

        // First try to sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: devEmail,
          password: devPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/app/dashboard`,
            data: {
              full_name: 'Dev User',
              company_name: 'Dev Company'
            }
          }
        });

        console.log('Signup response:', { signUpData, signUpError });

        if (signUpError) {
          console.error('Dev signup error:', signUpError);
          throw signUpError;
        }

        // If signup succeeded but user needs confirmation, try to sign in directly
        if (!signUpData.session) {
          console.log('No session from signup, trying direct sign in...');
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: devEmail,
            password: devPassword
          });

          console.log('Sign in response:', { signInData, signInError });

          if (signInError) {
            // If can't sign in, the user was created but needs email confirmation
            toast({
              title: "Dev User Created",
              description: `Dev user ${devEmail} created but needs email confirmation. Check Supabase settings to disable email confirmation for faster dev testing.`,
              variant: "default"
            });
            return;
          }
        }

        console.log('Dev user successfully authenticated');

        toast({
          title: "Dev Mode Activated",
          description: `Authenticated as: ${devEmail}`,
        });

        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 100);

      } catch (error: any) {
        console.error('Dev auth error:', error);
        toast({
          title: "Dev Auth Failed", 
          description: error.message || "Failed to create dev user",
          variant: "destructive"
        });
      }
    } else if (password !== null) {
      toast({
        title: "Access Denied",
        description: "Wrong password",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 animate-slide-down">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-semibold text-foreground">notibye</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm scroll-smooth">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm scroll-smooth">
              How it works
            </a>
            <a href="#cta" className="text-muted-foreground hover:text-foreground transition-colors text-sm scroll-smooth">
              Get started
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="clean" onClick={handleDevAuth}>
                  <Code className="w-4 h-4 mr-2" />
                  Dev
                </Button>
                <Button variant="clean" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="clean" onClick={handleDevAuth}>
                  <Code className="w-4 h-4 mr-2" />
                  Dev
                </Button>
                <Button variant="clean" onClick={() => navigate('/auth')}>
                  Log in
                </Button>
                <Button variant="hero" onClick={() => navigate('/auth')}>
                  Start Now →
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border">
            <nav className="flex flex-col gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm scroll-smooth">
                Features
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm scroll-smooth">
                How it works
              </a>
              <a href="#cta" className="text-muted-foreground hover:text-foreground transition-colors text-sm scroll-smooth">
                Get started
              </a>
              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                {user ? (
                  <>
                    <Button variant="clean" className="w-full" onClick={handleDevAuth}>
                      <Code className="w-4 h-4 mr-2" />
                      Dev
                    </Button>
                    <Button variant="clean" className="w-full" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="clean" className="w-full" onClick={handleDevAuth}>
                      <Code className="w-4 h-4 mr-2" />
                      Dev
                    </Button>
                    <Button variant="clean" className="w-full" onClick={() => navigate('/auth')}>
                      Log in
                    </Button>
                    <Button variant="hero" className="w-full" onClick={() => navigate('/auth')}>
                      Start Now →
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;