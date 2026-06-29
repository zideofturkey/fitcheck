import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordInputWithStrengthMeterProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showStrength?: boolean;
  disabled?: boolean;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong" | "very-strong";

const strengthConfig: Record<
  StrengthLevel,
  { label: string; color: string; segments: number; criteria: string[] }
> = {
  weak: {
    label: "Weak",
    color: "bg-red-500",
    segments: 1,
    criteria: ["At least 8 characters"],
  },
  fair: {
    label: "Fair",
    color: "bg-orange-500",
    segments: 2,
    criteria: ["At least 8 characters", "Contains a number"],
  },
  good: {
    label: "Good",
    color: "bg-yellow-500",
    segments: 3,
    criteria: [
      "At least 8 characters",
      "Contains a number",
      "Contains a special character",
    ],
  },
  strong: {
    label: "Strong",
    color: "bg-lime-500",
    segments: 4,
    criteria: [
      "At least 12 characters",
      "Contains uppercase & lowercase",
      "Contains a number",
      "Contains a special character",
    ],
  },
  "very-strong": {
    label: "Very Strong",
    color: "bg-green-500",
    segments: 5,
    criteria: [
      "At least 16 characters",
      "Contains uppercase & lowercase",
      "Contains numbers",
      "Contains special characters",
      "No common patterns",
    ],
  },
};

function calculateStrength(password: string): StrengthLevel {
  if (!password) return "weak";
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (!/(.)\1{2,}/.test(password) && !/(abc|123|qwerty)/i.test(password))
    score++;

  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "good";
  if (score === 4) return "strong";
  return "very-strong";
}

const PasswordInputWithStrengthMeter: React.FC<
  PasswordInputWithStrengthMeterProps
> = ({
  value,
  onChange,
  placeholder = "Enter password",
  showStrength = true,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const strength = calculateStrength(value);
  const config = strengthConfig[strength];
  const totalSegments = 5;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10 transition-all",
            showStrength && value && "border-2",
            showStrength &&
              value &&
              config.segments >= 4 &&
              "border-green-500 focus-visible:ring-green-500/20",
            showStrength &&
              value &&
              config.segments === 3 &&
              "border-yellow-500 focus-visible:ring-yellow-500/20",
            showStrength &&
              value &&
              config.segments <= 2 &&
              "border-red-500 focus-visible:ring-red-500/20",
          )}
          aria-label="Password"
          aria-describedby="password-strength-meter"
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          tabIndex={-1}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div id="password-strength-meter" className="space-y-2">
          <div
            className="flex gap-1"
            role="progressbar"
            aria-valuenow={config.segments}
            aria-valuemin={0}
            aria-valuemax={totalSegments}
            aria-label={`Password strength: ${config.label}`}
          >
            {Array.from({ length: totalSegments }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-200",
                  i < config.segments ? config.color : "bg-muted",
                )}
              />
            ))}
          </div>

          <div className="flex items-start gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {config.label}
            </p>
            <ul className="space-y-0.5">
              {config.criteria.map((criterion, i) => {
                const met =
                  (criterion.includes("8 characters") && value.length >= 8) ||
                  (criterion.includes("12 characters") && value.length >= 12) ||
                  (criterion.includes("16 characters") && value.length >= 16) ||
                  (criterion.includes("uppercase & lowercase") &&
                    /[A-Z]/.test(value) &&
                    /[a-z]/.test(value)) ||
                  (criterion.includes("Contains numbers") &&
                    /\d/.test(value)) ||
                  (criterion.includes("Contains a number") &&
                    /\d/.test(value)) ||
                  (criterion.includes("Contains special characters") &&
                    /[^A-Za-z0-9]/.test(value)) ||
                  (criterion.includes("Contains a special character") &&
                    /[^A-Za-z0-9]/.test(value)) ||
                  (criterion.includes("No common patterns") &&
                    !/(.)\1{2,}/.test(value) &&
                    !/(abc|123|qwerty)/i.test(value));
                return (
                  <li
                    key={i}
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    {met ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50" />
                    )}
                    {criterion}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInputWithStrengthMeter;
