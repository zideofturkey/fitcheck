import * as React from "react";
import * as Icons from "lucide-react";

interface WizardStepIndicatorStep {
  /** Tailwind background classes, e.g. "bg-primary" */
  bg: string;
  /** Tailwind text classes, e.g. "text-primary-foreground" */
  text: string;
  /** Valid Lucide icon name in PascalCase, e.g. "Utensils" */
  icon: keyof typeof Icons;
  /** Label text displayed under the circle */
  label: string;
  /** Tailwind text color classes for the label, e.g. "text-muted-foreground" */
  labelColor: string;
}

interface WizardStepIndicatorProps {
  step1: WizardStepIndicatorStep;
  step2: WizardStepIndicatorStep;
  step3: WizardStepIndicatorStep;
  /** Tailwind background color classes for connector between step 1 and 2 */
  connector1Color: string;
  /** Tailwind background color classes for connector between step 2 and 3 */
  connector2Color: string;
}

const WizardStepIndicatorIcon: React.FC<{ name: keyof typeof Icons }> = ({
  name,
}) => {
  const IconComponent = Icons[name] as React.ComponentType<{
    className?: string;
  }>;
  if (!IconComponent) return null;
  return <IconComponent className="h-4 w-4" />;
};

const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  step1,
  step2,
  step3,
  connector1Color,
  connector2Color,
}) => {
  return (
    <div
      className="flex items-center justify-center gap-2 mb-8"
      role="progressbar"
      aria-label="Meal logging progress"
    >
      {/* Step 1 + Connector 1 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step1.bg} ${step1.text}`}
          >
            <WizardStepIndicatorIcon name={step1.icon} />
          </div>
          <span className={`text-xs font-medium ${step1.labelColor}`}>
            {step1.label}
          </span>
        </div>
        <div className={`w-10 h-0.5 ${connector1Color}`} />
      </div>

      {/* Step 2 + Connector 2 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step2.bg} ${step2.text}`}
          >
            <WizardStepIndicatorIcon name={step2.icon} />
          </div>
          <span className={`text-xs font-medium ${step2.labelColor}`}>
            {step2.label}
          </span>
        </div>
        <div className={`w-10 h-0.5 ${connector2Color}`} />
      </div>

      {/* Step 3 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step3.bg} ${step3.text}">
          <WizardStepIndicatorIcon name={step3.icon} />
        </div>
        <span className={`text-xs font-medium ${step3.labelColor}`}>
          {step3.label}
        </span>
      </div>
    </div>
  );
};

export default WizardStepIndicator;
