import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight, DollarSign, Clock, CheckCircle } from "lucide-react";

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
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Stop losing $10K+ per month to churn
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              If you're losing even 5 customers per month at $200 MRR each, that's $120,000 annual revenue walking out the door. 
              notibye typically saves 30-50% of those customers.
            </p>

            <div className="bg-background border-2 border-primary/20 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600 mb-1">Without notibye</div>
                  <div className="text-sm text-muted-foreground">Lose $120K annually</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">With notibye</div>
                  <div className="text-sm text-muted-foreground">Save $50K+ annually</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email to start free trial"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="gap-2">
                <DollarSign className="w-5 h-5" />
                {loading ? 'Starting...' : 'Start Free Trial'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground">
              14-day free trial • No setup fees • Cancel anytime
            </p>
          </div>

          {/* Trust signals */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Setup in 10 minutes</h3>
                <p className="text-sm text-muted-foreground">
                  Works with your existing PostHog data. No complicated integrations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">ROI in first month</h3>
                <p className="text-sm text-muted-foreground">
                  Most customers save more money than notibye costs within 30 days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Risk-free trial</h3>
                <p className="text-sm text-muted-foreground">
                  Try for 14 days completely free. See results before you pay anything.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Final urgency push */}
          <div className="text-center mt-16">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Every day you wait, more customers cancel
              </p>
              <p className="text-sm text-yellow-700">
                While you're reading this, customers are canceling because no one reached out to help them. 
                Start preventing churn today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;