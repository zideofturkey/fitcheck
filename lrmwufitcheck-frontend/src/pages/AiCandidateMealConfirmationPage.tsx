import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Loader,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useConfirmCandidateMeal,
  useGetAiCandidateMeal,
  useRejectCandidateMeal,
} from "@/hooks/api/use-nutritionai";

export default function AiCandidateMealConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAiCandidateMeal(id);
  const confirmMutation = useConfirmCandidateMeal();
  const rejectMutation = useRejectCandidateMeal();

  const candidate = data?.aiCandidateMeal;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        Yükleniyor…
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Aday öğün bulunamadı.</p>
        <Link
          to="/ai-sessions"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          AI oturumlarına dön
        </Link>
      </Card>
    );
  }

  const handleConfirm = () => {
    confirmMutation.mutate(
      { aiCandidateMealId: candidate.id, data: {} },
      {
        onSuccess: () =>
          navigate(
            candidate.committedMealLogId
              ? `/meals/${candidate.committedMealLogId}`
              : "/meals",
          ),
      },
    );
  };

  const handleReject = () => {
    rejectMutation.mutate(candidate.id, {
      onSuccess: () => navigate("/ai-sessions"),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <Link
          to="/ai-sessions"
          className="rounded-full p-2 hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Confirm Meal
          </h1>
          <p className="text-sm text-muted-foreground">
            Review the AI-proposed meal and confirm to log it.
          </p>
        </div>
      </header>

      <Card className="p-5 shadow-sm space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            AI Candidate
          </span>
          {candidate.isCommitted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CircleCheck className="w-3.5 h-3.5" /> Committed
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-semibold">{candidate.proposedMealDate ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-semibold">{candidate.proposedMealTime ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slot</p>
            <p className="font-semibold">{candidate.proposedSlotName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="font-semibold">
              {candidate.totalCalories ?? "—"} kcal
            </p>
          </div>
        </div>

        {candidate.warningText && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠ {candidate.warningText}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
          {[
            ["Protein", candidate.totalProtein],
            ["Carbs", candidate.totalCarbohydrates],
            ["Fat", candidate.totalFat],
            ["Sugar", candidate.totalSugar],
            ["Fiber", candidate.totalFiber],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold">
                {(value as number | undefined) ?? "—"} g
              </p>
            </div>
          ))}
        </div>
      </Card>

      {!candidate.isCommitted && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            <CircleX className="w-4 h-4" />
            Reject
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            <CircleCheck className="w-4 h-4" />
            {confirmMutation.isPending ? "Committing…" : "Confirm & Log"}
          </Button>
        </div>
      )}
    </div>
  );
}
