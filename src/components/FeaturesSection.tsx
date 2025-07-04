import { Card } from "@/components/ui/card";
import { Zap, Users, Mail, BarChart3, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Get notified the moment a customer cancels their subscription or payment fails."
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description: "See exactly how customers used your product in their final 30 days."
  },
  {
    icon: Mail,
    title: "Smart Emails",
    description: "Automatically send personalized insights to help you understand the churn."
  },
  {
    icon: Users,
    title: "Customer Insights",
    description: "Track engagement patterns, feature usage, and behavioral trends."
  },
  {
    icon: Clock,
    title: "Real-time Data",
    description: "Connect Stripe webhooks and PostHog events for instant synchronization."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared. Full GDPR compliance."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Reduce Churn</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ChurnFlow connects your existing tools to give you actionable insights 
            about why customers leave and how to win them back.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-elegant transition-all duration-300 group"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;