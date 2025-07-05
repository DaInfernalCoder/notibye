import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-semibold text-foreground">ChurnFlow</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Pricing
            </a>
            <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Docs
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
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Pricing
              </a>
              <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Docs
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