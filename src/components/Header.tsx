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
    const password = prompt("Enter dev password:");
    if (password === "A16") {
      try {
        // Try to sign in first, if not exists, create the user
        let { data, error } = await supabase.auth.signInWithPassword({
          email: 'dev@test.com',
          password: 'devpassword123'
        });

        if (error && error.message.includes('Invalid login')) {
          // User doesn't exist, create it
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'dev@test.com',
            password: 'devpassword123',
            options: {
              emailRedirectTo: `${window.location.origin}/`
            }
          });
          
          if (signUpError) {
            throw signUpError;
          }

          // Sign in after creating
          ({ data, error } = await supabase.auth.signInWithPassword({
            email: 'dev@test.com',
            password: 'devpassword123'
          }));
        }

        if (error) {
          throw error;
        }

        toast({
          title: "Dev Mode Activated",
          description: "You're now signed in as dev user"
        });

        navigate('/app/dashboard');
      } catch (error: any) {
        toast({
          title: "Dev Auth Failed",
          description: error.message,
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
                <Button variant="clean" onClick={() => navigate('/dashboard')}>
                  Dashboard
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
                    <Button variant="clean" className="w-full" onClick={() => navigate('/dashboard')}>
                      Dashboard
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