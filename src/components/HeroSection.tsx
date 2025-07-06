import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-background py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm text-primary border border-primary/20">
              Try today!
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Stop customer churn{" "}
              <span className="underline decoration-primary decoration-4 underline-offset-8">
                before it happens
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              notibye automatically detects when customers are about to cancel and sends personalized emails to win them back. 
              Connect your Stripe and get instant churn prevention that actually works.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl">
              Start Now →
            </Button>
            
            <Button variant="clean" size="xl" className="gap-2">
              <Play className="w-4 h-4" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;