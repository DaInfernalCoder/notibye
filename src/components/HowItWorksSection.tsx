import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, CheckCircle, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Connect PostHog (2 minutes)",
    description: "Add your PostHog API key and we'll start analyzing your customer behavior patterns immediately.",
    icon: BarChart3,
    time: "2 min",
    detail: "We pull engagement data, feature usage, and activity patterns from your existing analytics."
  },
  {
    number: "2", 
    title: "Create Email Templates",
    description: "Design emails that actually work. Use customer data like engagement scores and usage stats in your messages.",
    icon: CheckCircle,
    time: "5 min",
    detail: "Templates auto-fill with real customer data like 'Your engagement dropped 40% this week.'"
  },
  {
    number: "3",
    title: "Set Trigger Rules", 
    description: "Tell us when to send emails: 'If engagement drops below 30%, send retention email.' Then we handle everything.",
    icon: Clock,
    time: "3 min",
    detail: "Example: Send email when customer hasn't used key features for 7 days and engagement < 40%."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Setup takes 10 minutes, saves customers forever
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Most churn prevention tools take weeks to implement. We designed notibye to work with your existing PostHog setup.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-20 w-0.5 h-24 bg-primary/20 z-0 lg:hidden"></div>
              )}
              
              <Card className={`mb-8 ${index % 2 === 1 ? 'lg:ml-auto lg:w-3/4' : 'lg:mr-auto lg:w-3/4'}`}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          <Clock className="w-3 h-3" />
                          {step.time}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-lg">
                        {step.description}
                      </p>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Example:</strong> {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Results showcase */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Then watch the magic happen</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Within 24hrs</div>
                <p className="text-sm text-muted-foreground">First at-risk customers identified</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Week 1</div>
                <p className="text-sm text-muted-foreground">First customers saved from churning</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Month 1</div>
                <p className="text-sm text-muted-foreground">20-40% reduction in churn rate</p>
              </div>
            </div>

            <Button className="mt-8 gap-2" size="lg">
              Start Your 10-Minute Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;