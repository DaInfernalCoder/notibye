import { TrendingDown, Twitter, Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ChurnFlow</span>
            </div>
            <p className="text-muted-foreground">
              Understand why customers churn and win them back with data-driven insights.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Integrations
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                API
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Guides
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground">
          <p>&copy; 2024 ChurnFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;