import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Mail, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // TODO: Connect to Supabase to store email
    console.log("Waitlist email:", email);
    setIsSubmitted(true);
    setEmail("");
    
    toast({
      title: "You're on the waitlist!",
      description: "We'll notify you when ChurnFlow is ready.",
    });
  };

  return (
    <section className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-12 bg-card/80 backdrop-blur-sm border-border/50 shadow-elegant">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Ready to Reduce Churn?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join the waitlist and be the first to know when ChurnFlow launches. 
                Start understanding your customers better today.
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background/50 border-border/50"
                    required
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="group">
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-3 text-primary">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-medium">Thank you! You're on the waitlist.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Launch updates only</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;