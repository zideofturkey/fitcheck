import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowLeft,
  Clock,
  Loader,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useGetAiSession,
  useListAiCandidateMeals,
} from "@/hooks/api/use-nutritionai";

function formatDateTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AiSessionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: sessionData, isLoading, error } = useGetAiSession(id);
  const { data: candidatesData } = useListAiCandidateMeals(
    id ? { aiSessionId: id } : undefined,
  );

  const session = sessionData?.aiSession;
  const candidates = candidatesData?.aiCandidateMeals ?? [];

  const STATUS_LABEL: Record<string, string> = {
    pending: t("aiSessionDetail.statusPending"),
    needsConfirmation: t("aiSessionDetail.statusNeedsConfirmation"),
    completed: t("aiSessionDetail.statusCompleted"),
    failed: t("aiSessionDetail.statusFailed"),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("aiSessionDetail.loading")}
      </div>
    );
  }

  if (error || !session) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("aiSessionDetail.notFound")}
        </p>
        <Link
          to="/ai-sessions"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("aiSessionDetail.backToSessions")}
        </Link>
      </Card>
    );
  }

  const isGuidance = session.sessionType === "nutritionGuidance";

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/ai-sessions"
            className="rounded-full p-2 hover:bg-muted transition-colors"
            aria-label={t("aiSessionDetail.backAria")}
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("aiSessionDetail.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(session.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            {isGuidance
              ? t("aiSessionDetail.nutritionGuidance")
              : t("aiSessionDetail.mealParsing")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
            <span className="w-2 h-2 rounded-full bg-chart-1" />
            {STATUS_LABEL[session.sessionState] ?? session.sessionState}
          </span>
        </div>
      </div>

      {/* Session Input */}
      <Card className="p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {t("aiSessionDetail.userInput")}
            </p>
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">
                {session.inputText}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateTime(session.createdAt)}
              </span>
              {typeof session.confidenceScore === "number" && (
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {t("aiSessionDetail.confidence")}:{" "}
                  {Math.round(session.confidenceScore * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Response */}
      {session.finalResponseText && (
        <Card className="p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {t("aiSessionDetail.aiResponse")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {session.finalResponseText}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Candidate meal section (meal parsing only) */}
      {!isGuidance && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              {t("aiSessionDetail.candidateMeals")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("aiSessionDetail.candidateCount", {
                count: candidates.length,
              })}
            </span>
          </div>
          {candidates.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              {t("aiSessionDetail.noCandidates")}
            </Card>
          ) : (
            candidates.map((c) => (
              <Card key={c.id} className="p-5 shadow-sm space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("aiSessionDetail.date")}
                    </p>
                    <p className="text-sm font-semibold">
                      {c.proposedMealDate ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("aiSessionDetail.time")}
                    </p>
                    <p className="text-sm font-semibold">
                      {c.proposedMealTime ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("aiSessionDetail.slot")}
                    </p>
                    <p className="text-sm font-semibold">
                      {c.proposedSlotName ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("aiSessionDetail.calories")}
                    </p>
                    <p className="text-sm font-semibold">
                      {c.totalCalories ?? "—"} kcal
                    </p>
                  </div>
                </div>
                {c.warningText && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    ⚠ {c.warningText}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                  {c.isCommitted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {t("aiSessionDetail.committed")}
                    </span>
                  ) : c.confirmationRequired && !c.isConfirmed ? (
                    <Link
                      to={`/ai-candidate-meals/${c.id}/confirm`}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {t("aiSessionDetail.reviewConfirm")}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      {c.isConfirmed
                        ? t("aiSessionDetail.confirmed")
                        : t("aiSessionDetail.pending")}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Guidance Note Section (guidance sessions) */}
      {isGuidance && (
        <Card className="p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
              <Target className="w-3.5 h-3.5" />
              {t("aiSessionDetail.guidanceNote")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {session.finalResponseText ?? t("aiSessionDetail.noResponseYet")}
          </p>
        </Card>
      )}
    </div>
  );
}
