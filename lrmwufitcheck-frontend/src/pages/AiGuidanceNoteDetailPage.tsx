import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  History,
  Loader,
  MessageCircle,
  MessageSquare,
  Target,
  TriangleAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetAiGuidanceNote } from "@/hooks/api/use-nutritionai";

function formatDateTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AiGuidanceNoteDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetAiGuidanceNote(id);

  const note = data?.aiGuidanceNote;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("aiGuidanceNote.loading")}
      </div>
    );
  }

  if (error || !note) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("aiGuidanceNote.notFound")}
        </p>
        <Link
          to="/ai-sessions"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("aiGuidanceNote.backToSessions")}
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={
          note.aiSessionId ? `/ai-sessions/${note.aiSessionId}` : "/ai-sessions"
        }
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("aiGuidanceNote.sessionDetail")}
      </Link>

      <Card className="shadow-md overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-chart-3/10 text-chart-3">
              <Target className="w-3.5 h-3.5" />
              {note.questionType}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {note.contextRange}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {note.questionType}
          </h1>
          <p className="text-xs text-muted-foreground mt-3">
            {formatDateTime(note.createdAt)}
          </p>
        </div>

        <div className="p-6 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            {t("aiGuidanceNote.answer")}
          </h2>
          <p className="text-base leading-relaxed text-foreground bg-muted/50 rounded-lg p-4 whitespace-pre-line">
            {note.answerSummary}
          </p>
        </div>

        {note.rationaleText && (
          <details className="group border-b border-border" open>
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors list-none">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Brain className="w-4 h-4 text-chart-2" />
                {t("aiGuidanceNote.howCalculated")}
              </h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 -mt-2">
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {note.rationaleText}
              </div>
            </div>
          </details>
        )}

        {note.cautionText && (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-chart-4/10 border border-chart-4/30">
              <TriangleAlert className="w-5 h-5 text-chart-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {t("aiGuidanceNote.headsUp")}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {note.cautionText}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 flex flex-wrap gap-3">
          <Button variant="secondary" asChild>
            <Link to="/ai-sessions">
              <History className="w-4 h-4" />
              {t("aiGuidanceNote.viewAllSessions")}
            </Link>
          </Button>
          <Link to="/ai-sessions">
            <Button>
              <MessageCircle className="w-4 h-4" />
              {t("aiGuidanceNote.askAnother")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
