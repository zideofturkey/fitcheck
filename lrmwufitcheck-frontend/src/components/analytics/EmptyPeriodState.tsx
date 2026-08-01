import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";

interface EmptyPeriodStateProps {
  title: string;
  body: string;
  cta: string;
}

export default function EmptyPeriodState({
  title,
  body,
  cta,
}: EmptyPeriodStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sprout className="w-6 h-6" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      <Link
        to="/meals/log"
        className="mt-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {cta}
      </Link>
    </Card>
  );
}
