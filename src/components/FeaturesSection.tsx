import { Activity, Mail, Zap, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problemStatements = [
  {
    icon: AlertTriangle,
    stat: "73%",
    problem: "of cancelled customers never received a retention email",
    solution: "We email them before they cancel"
  },
  {
    icon: Users,
    stat: "$127",
    problem: "average value lost per churned customer",
    solution: "We help you save that revenue"
  },
  {
    icon: Activity,
    stat: "48hrs",
    problem: "between early churn signals and cancellation",
    solution: "We detect and act within minutes"
  }
];

const features = [
  {
    icon: Activity,
    title: "PostHog Integration",
    description: "Connect your existing PostHog analytics. We'll analyze user behavior patterns to predict when someone's about to cancel.",
    details: ["Track engagement drops", "Monitor feature usage", "Detect inactivity patterns"]
  },
  {
    icon: Mail,
    title: "Smart Email Templates",
    description: "Create personalized email campaigns that actually work. Include their usage stats, offer help, or provide incentives.",
    details: ["Dynamic customer data", "A/B test subject lines", "Track open & click rates"]
  },
  {
    icon: Zap,
    title: "Automated Triggers",
    description: "Set up rules like 'if engagement drops 40% in 7 days, send retention email'. Then forget about it - we handle the rest.",
    details: ["Custom trigger conditions", "Multiple email sequences", "Pause/resume anytime"]
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-muted/20">
      <div className="container mx-auto px-6">
        {/* Problem Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Why customers leave (and how we stop them)
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-16">
            Most SaaS companies lose customers silently. By the time you notice, it's too late.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {problemStatements.map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="mb-4">
                    <item.icon className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-red-600">{item.stat}</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{item.problem}</p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                    <CheckCircle className="w-4 h-4" />
                    {item.solution}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h3 className="text-2xl lg:text-4xl font-bold mb-4">
            Here's exactly how it works
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple tools that work together to save your customers before they cancel.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call out box */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h4 className="text-xl font-bold mb-3">Real example from our users:</h4>
              <p className="text-muted-foreground mb-4">
                "We saved 47 customers last month who would have cancelled. That's $11,750 in MRR we kept. 
                notibye literally pays for itself 20x over."
              </p>
              <p className="text-sm font-medium">— Sarah Chen, Founder @ DataFlow</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;