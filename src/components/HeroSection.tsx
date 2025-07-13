import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-background via-background to-muted/30 pt-20 pb-32 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.02)_25%,rgba(0,0,0,.02)_50%,transparent_50%,transparent_75%,rgba(0,0,0,.02)_75%)] bg-[length:60px_60px]"></div>
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Social proof banner */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
              <div className="flex -space-x-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-background"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 border-2 border-background"></div>
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">187 SaaS founders</span> saved customers this week
              </span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center space-y-8 mb-16">
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-foreground tracking-tight">
              Watch customers
              <br />
              <span className="relative">
                leave in silence
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-red-500/30" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 6 Q150 1 295 6" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                or do something about it.
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light">
              Every month, customers are canceling subscriptions without a word. 
              <br className="hidden lg:block" />
              <span className="font-medium text-foreground">notibye</span> catches them before they leave.
            </p>
          </div>

          {/* Value prop with visual */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-12 shadow-elegant">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-500 rotate-180" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">The Silent Problem</h3>
                    <p className="text-sm text-muted-foreground">Most customers don't complain—they just leave</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Sarah's engagement dropped 60% last week. No one noticed.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Marcus hasn't logged in for 12 days. No follow-up.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>3 payment failures this month. Only automated receipts sent.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">What Actually Works</h3>
                    <p className="text-sm text-muted-foreground">Personal outreach at the right moment</p>
                  </div>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm italic text-foreground mb-2">
                    "We noticed your team hasn't been using the analytics dashboard lately. 
                    Is there anything we can help with? Here's a quick guide..."
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>47% response rate • 23% retained</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="xl" 
                className="gap-2 shadow-glow hover:shadow-glow/80 transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Start Saving Customers
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="clean" 
                size="xl" 
                className="gap-2 group"
                onClick={() => navigate('/auth')}
              >
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                See How It Works
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Start free • Connect PostHog in 2 minutes • No credit card required
            </p>

            {/* Trust metrics */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>$2.3M revenue saved this quarter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                <span>1,247 customers retained</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                <span>Average 34% churn reduction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;