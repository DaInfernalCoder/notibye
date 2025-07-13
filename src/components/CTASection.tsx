import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight, DollarSign, Shield, Zap, Heart, AlertTriangle, TrendingUp } from "lucide-react";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      toast({
        title: "Thanks for your interest!",
        description: "Sign up now to get started with notibye.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cta" className="py-32 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Emotional urgency */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-medium mb-8">
              <AlertTriangle className="w-4 h-4" />
              Revenue is leaving your business right now
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
              Every day you wait,
              <br />
              <span className="text-red-600">more customers disappear.</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              While you're thinking about it, Sarah's engagement dropped 60% this week and Marcus hasn't logged in for 12 days. 
              <span className="font-medium text-foreground">They're about to cancel and no one knows.</span>
            </p>

            {/* Cost visualization */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-12 max-w-3xl mx-auto shadow-elegant">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-8 h-8 text-red-500 rotate-180" />
                  </div>
                  <div className="text-3xl font-bold text-red-600">-$18,750</div>
                  <p className="text-sm text-muted-foreground">Monthly revenue lost to preventable churn</p>
                  <div className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    Just 5 customers at $125 MRR × 30 months LTV
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">+$12,500</div>
                  <p className="text-sm text-muted-foreground">Revenue recovered with notibye</p>
                  <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
                    67% retention rate on outreach
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Button 
                size="xl" 
                className="gap-2 shadow-glow hover:shadow-glow/80 transition-all duration-300 text-lg px-12 py-6"
                onClick={() => navigate('/auth')}
              >
                <DollarSign className="w-6 h-6" />
                Stop the Revenue Bleeding Now
                <ArrowRight className="w-6 h-6" />
              </Button>
              
              <p className="text-muted-foreground">
                Free trial • Connect PostHog in 2 minutes • Start saving customers today
              </p>
            </div>
          </div>

          {/* Trust and guarantees */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2-minute setup</h3>
                <p className="text-sm text-muted-foreground">
                  PostHog API key → start saving customers. That's it.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant ROI</h3>
                <p className="text-sm text-muted-foreground">
                  Save one $200/month customer = 4 months of notibye paid for.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Zero risk</h3>
                <p className="text-sm text-muted-foreground">
                  14-day free trial. Cancel anytime. No contracts, no gotchas.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Final emotional appeal */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 max-w-3xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <p className="text-lg font-medium text-foreground">
                    "I wish I'd found notibye two years ago."
                  </p>
                  <p className="text-muted-foreground">
                    Don't be the founder saying this in 2026. Your future self will thank you for starting today.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    — Every founder who waited too long to fix their churn problem
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;