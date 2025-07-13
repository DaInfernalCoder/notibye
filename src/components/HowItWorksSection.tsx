import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Mail, BarChart3, Sparkles, CheckCircle, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const workflowSteps = [
  {
    number: "01",
    title: "PostHog → notibye",
    description: "Connect your PostHog analytics in under 60 seconds. We immediately start analyzing user behavior patterns.",
    icon: BarChart3,
    details: "Tracks 12+ engagement signals including feature adoption, session depth, and usage velocity."
  },
  {
    number: "02",
    title: "Smart Detection",
    description: "Our algorithm identifies at-risk customers before they decide to leave. No false alarms, just real churn signals.",
    icon: Zap,
    details: "87% prediction accuracy using multi-signal analysis and machine learning."
  },
  {
    number: "03",
    title: "Personal Outreach",
    description: "Automatically send personalized emails with their actual usage data. Feel human, not robotic.",
    icon: Mail,
    details: "Dynamic templates with real customer data and context-aware messaging."
  }
];

const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Simple</span> setup, powerful results
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            From setup to first save
            <br />
            <span className="text-primary">in under an hour.</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            While other tools require complex configurations and weeks of setup, 
            notibye works with your existing PostHog data immediately.
          </p>
        </div>

        {/* Visual workflow */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector line for desktop */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 -right-4 w-8 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                )}
                
                <Card className="h-full group-hover:shadow-elegant transition-all duration-300 border-border/50 group-hover:border-primary/20">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                          <step.icon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-2xl font-bold text-primary/60">{step.number}</div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {step.description}
                        </p>
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {step.details}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline of success */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-primary/20 shadow-elegant max-w-5xl mx-auto">
            <CardContent className="p-12">
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-3xl font-bold">Timeline to Success</h3>
                </div>
                
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">5 min</div>
                    <p className="text-sm text-muted-foreground">PostHog connected, analyzing data</p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">24 hrs</div>
                    <p className="text-sm text-muted-foreground">First at-risk customers identified</p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">Week 1</div>
                    <p className="text-sm text-muted-foreground">First retention emails sent</p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">Month 1</div>
                    <p className="text-sm text-muted-foreground">20-40% churn reduction</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <Button size="xl" className="gap-2 shadow-glow" onClick={() => navigate('/auth')}>
                    Start Saving Customers Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Free trial • Connect PostHog in minutes • See results in days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;