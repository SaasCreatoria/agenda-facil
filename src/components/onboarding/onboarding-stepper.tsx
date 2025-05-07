'use client';

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  name: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function OnboardingStepper({ steps, currentStep, className }: OnboardingStepperProps) {
  return (
    <nav aria-label="Progress" className={cn("mb-8", className)}>
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "")}>
            {stepIdx < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
                >
                  <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-primary">{step.name}</p>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-primary">{step.name}</p>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-muted" />
                </div>
                <div
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background hover:border-muted-foreground"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted-foreground/50" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted-foreground">{step.name}</p>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
