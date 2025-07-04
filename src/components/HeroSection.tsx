import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, TrendingDown, Mail } from "lucide-react";
import heroImage from "@/assets/hero-analytics.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-background/80" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-sm text-primary-foreground">
                <TrendingDown className="w-4 h-4" />
                Churn Analytics
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Know Why Your
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Customers Leave</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect your Stripe and PostHog data to get instant insights when customers churn. 
                Understand their behavior and win them back.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Connected to 50+ SaaS tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">10k+ churn emails sent</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant border border-border/50">
              <img 
                src={heroImage} 
                alt="ChurnFlow Analytics Dashboard" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse delay-1000" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;