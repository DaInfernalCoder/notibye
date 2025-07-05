import { Search, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "Our AI watches every customer interaction, identifying patterns and labeling key moments automatically."
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Search for specific user behaviors across thousands of customers using natural language."
  },
  {
    icon: BarChart3,
    title: "Behavioral KPIs",
    description: "Transform qualitative user behavior into quantifiable metrics that drive product decisions."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8">
            Stop watching endless videos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ChurnFlow turns your customer data into searchable, quantifiable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;