import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, DollarSign } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Hero */}
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-sm text-red-700 border border-red-200">
              <TrendingDown className="w-4 h-4" />
              Losing 5-10% of customers monthly?
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-foreground">
              Your customers are canceling.
              <br />
              <span className="text-primary">We'll save them.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Connect your PostHog analytics and we'll automatically email customers who are about to churn. 
              Real companies are saving 20-40% of lost revenue this way.
            </p>

            {/* Social Proof Numbers */}
            <div className="flex items-center justify-center gap-8 py-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2.3M</div>
                <div className="text-sm text-muted-foreground">Revenue saved</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">73%</div>
                <div className="text-sm text-muted-foreground">Average save rate</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2 min</div>
                <div className="text-sm text-muted-foreground">Setup time</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <Button size="lg" className="gap-2 text-lg px-8 py-6">
              <DollarSign className="w-5 h-5" />
              Start Saving Revenue
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Free 14-day trial • No credit card required • Takes 2 minutes
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 pt-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                SOC 2 Certified
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;