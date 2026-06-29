import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

interface VerificationCodeInputProps {
  codeIndex: number;
  secretCode?: string;
  showSecretCode?: boolean;
  onComplete: (code: string) => void;
  onResend: () => void;
  cooldownActive: boolean;
  cooldown: number;
  disabled: boolean;
}

export default function VerificationCodeInput({
  codeIndex,
  secretCode,
  showSecretCode = false,
  onComplete,
  onResend,
  cooldownActive,
  cooldown,
  disabled,
}: VerificationCodeInputProps) {
  const [code, setCode] = React.useState<string[]>(Array(6).fill(""));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    const completedCode = newCode.join("");
    if (completedCode.length === 6) {
      onComplete(completedCode);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setCode(digits);
    onComplete(pastedData);
    inputRefs.current[5]?.focus();
  };

  const otpInput = (
    <>
      {code.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="h-12 w-12 text-center text-lg font-semibold"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Kod: #{codeIndex}</Badge>
      </div>

      <div className="flex justify-center gap-2">{otpInput}</div>

      {showSecretCode && (
        <div className="p-3 bg-muted rounded-md text-center">
          <p className="text-xs text-muted-foreground">Dev Modu — Test Kodu:</p>
          <p className="text-lg font-mono font-bold tracking-widest">
            {secretCode}
          </p>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <Button
          variant="link"
          size="sm"
          disabled={cooldownActive || disabled}
          onClick={onResend}
          type="button"
        >
          {cooldownActive ? (
            <>
              <Loader className="mr-1 h-3 w-3 animate-spin" />
              Kodu Tekrar Gönder ({cooldown}s)
            </>
          ) : (
            "Kodu Tekrar Gönder"
          )}
        </Button>
      </div>
    </div>
  );
}
