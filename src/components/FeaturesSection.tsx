import { Brain, Heart, Zap, CheckCircle, Quote, ArrowRight, Sparkles, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const storyData = [
  {
    company: "DevFlow",
    founder: "Marcus Chen",
    mrr: "$87K",
    churnReduction: "41%",
    story: "Marcus was losing sleep watching $8K MRR disappear monthly. Three months with notibye later, his churn dropped 41% and he's sleeping again.",
    quote: "I wish I'd found this two years ago. We'd have an extra $200K in revenue by now."
  },
  {
    company: "DataCorp",
    founder: "Sarah Kim", 
    mrr: "$134K",
    churnReduction: "38%",
    story: "Sarah's team was manually tracking usage drops in spreadsheets. Now they save 2 customers weekly on autopilot.",
    quote: "notibye caught 23 customers last month that our manual process completely missed."
  },
  {
    company: "CloudBase",
    founder: "Alex Rivera",
    mrr: "$203K", 
    churnReduction: "44%",
    story: "Alex's payment failures were going to a generic receipt system. Now failed payments trigger personal outreach within hours.",
    quote: "We recovered $18K in revenue just from payment failure emails in our first quarter."
  }
];

const principles = [
  {
    icon: Brain,
    title: "Smart Detection",
    description: "We don't just look at login frequency. Our algorithm analyzes 12+ behavioral signals to predict churn risk with 87% accuracy.",
    features: ["Feature adoption scoring", "Session depth analysis", "Support ticket patterns", "Engagement velocity tracking"]
  },
  {
    icon: Heart,
    title: "Human Touch",
    description: "Every email feels personal because it is. Dynamic content pulls their actual usage data to craft relevant, helpful messages.",
    features: ["Real usage statistics", "Personalized recommendations", "Context-aware timing", "Founder-voice templates"]
  },
  {
    icon: Zap,
    title: "Perfect Timing",
    description: "We email at the sweet spot—early enough to help, late enough to be certain. No spam, no false alarms, just results.",
    features: ["Multi-signal validation", "Smart sending windows", "Frequency optimization", "Response-based learning"]
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        
        {/* Story-driven introduction */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Real stories from SaaS founders
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            "We'd have an extra
            <br />
            <span className="text-primary">$200K in revenue"</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed">
            Three founders who were hemorrhaging revenue from silent churn. 
            Here's what happened when they started catching customers before they left.
          </p>

          {/* Story cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {storyData.map((story, index) => (
              <Card key={index} className="text-left group hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="font-bold text-lg">{story.company}</div>
                      <div className="text-sm text-muted-foreground">{story.founder}, Founder</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{story.churnReduction}</div>
                      <div className="text-xs text-muted-foreground">churn reduction</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{story.story}</p>
                    
                    <div className="border-l-2 border-primary/20 pl-4">
                      <Quote className="w-4 h-4 text-primary/60 mb-2" />
                      <p className="text-sm italic text-foreground">{story.quote}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">{story.mrr} MRR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it actually works */}
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-5xl font-bold mb-6">
            The method behind the magic
          </h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Most tools send generic "we miss you" emails based on login dates. 
            We built something that actually understands user behavior.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {principles.map((principle, index) => (
            <div key={index} className="space-y-8 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                  <principle.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{principle.title}</h3>
                  <div className="w-12 h-0.5 bg-primary/30 mt-1"></div>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {principle.description}
              </p>

              <div className="space-y-3">
                {principle.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results showcase with better visual */}
        <div className="mt-24">
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-elegant">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    <h4 className="text-2xl font-bold">Real results, not vanity metrics</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">87%</div>
                      <div className="text-sm text-muted-foreground">Prediction accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">34%</div>
                      <div className="text-sm text-muted-foreground">Average churn reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">23%</div>
                      <div className="text-sm text-muted-foreground">Email response rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">$2.3M</div>
                      <div className="text-sm text-muted-foreground">Revenue saved</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-semibold">This week's saves</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment failure recovery</span>
                        <span className="font-medium">47 customers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low engagement outreach</span>
                        <span className="font-medium">23 customers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Feature adoption help</span>
                        <span className="font-medium">31 customers</span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between font-semibold">
                        <span>Total revenue saved</span>
                        <span className="text-primary">$18,750</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;