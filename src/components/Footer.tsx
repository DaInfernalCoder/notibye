const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-xl font-semibold">ChurnFlow</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Understand why customers churn and win them back with data-driven insights.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Product</h3>
            <div className="space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Features
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Pricing
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Integrations
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Resources</h3>
            <div className="space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Documentation
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Blog
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Support
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Company</h3>
            <div className="space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                About
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">&copy; 2024 ChurnFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;