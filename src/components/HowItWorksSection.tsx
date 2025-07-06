import { ArrowRight, CreditCard, Brain, Mail } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "Connect Stripe",
    description: "Link your Stripe account to monitor payment patterns and subscription changes in real-time."
  },
  {
    icon: Brain,
    title: "AI Analyzes Risk",
    description: "Our AI detects early warning signs of churn by analyzing customer behavior and payment history."
  },
  {
    icon: Mail,
    title: "Auto Recovery",
    description: "Personalized retention emails are sent automatically to at-risk customers before they cancel."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8">
            How notibye works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Set up once, prevent churn forever. It's that simple.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-8 h-8 -ml-4">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;