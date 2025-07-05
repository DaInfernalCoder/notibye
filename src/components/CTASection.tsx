import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
        description: "Sign up now to get started with ChurnFlow.",
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
    <section className="py-32 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-6xl font-bold">
              Ready to understand your churn?
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started with ChurnFlow and turn your customer data into actionable insights.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={loading}>
              {loading ? 'Starting...' : 'Start Now →'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CTASection;