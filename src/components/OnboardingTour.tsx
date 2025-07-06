import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    target: '[data-tour="integrations"]',
    title: 'Connect Your Services',
    description: 'First, connect your Stripe, PostHog, and Resend accounts to start monitoring customer churn.',
    position: 'bottom'
  },
  {
    target: '[data-tour="integration-card"]',
    title: 'Setup Each Integration',
    description: 'Click "Connect" on each service and enter your API keys to enable churn monitoring.',
    position: 'top'
  },
  {
    target: '[data-tour="test-section"]',
    title: 'Test Your Setup',
    description: 'Use this section to test your churn flow and see how the system works.',
    position: 'top'
  },
  {
    target: '[data-tour="churn-events"]',
    title: 'Monitor Churn Events',
    description: 'Once connected, you\'ll see all your customer churn events and automated responses here.',
    position: 'top'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const updateTooltipPosition = () => {
      const step = onboardingSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightedElement(element);
        
        let top = 0;
        let left = 0;
        
        switch (step.position) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 16;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - 16;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 16;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 16;
            break;
        }
        
        setTooltipPosition({ top, left });
      }
    };

    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition);
    
    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition);
    };
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top + window.scrollY - 8,
            left: highlightedElement.getBoundingClientRect().left + window.scrollX - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            boxShadow: '0 0 0 4px hsl(var(--primary)), 0 0 0 9999px rgba(0, 0, 0, 0.8)',
            borderRadius: '8px',
            zIndex: 51
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="absolute z-52 w-80 shadow-lg border-primary/20"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentStepData.position === 'top' ? 'translate(-50%, -100%)' : 
                     currentStepData.position === 'bottom' ? 'translate(-50%, 0%)' :
                     currentStepData.position === 'left' ? 'translate(-100%, -50%)' :
                     'translate(0%, -50%)'
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {onboardingSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={skip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {currentStepData.description}
          </CardDescription>
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button size="sm" onClick={nextStep}>
              {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < onboardingSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;