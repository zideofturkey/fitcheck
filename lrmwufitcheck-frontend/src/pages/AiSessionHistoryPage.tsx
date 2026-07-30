import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader,
  MessageCircle,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useListAiSessions } from "@/hooks/api/use-nutritionai";
import type { NutritionaiAiSession } from "@/types/api";

type SessionType = NutritionaiAiSession["sessionType"];
type SessionStatus = NutritionaiAiSession["sessionState"];

const TYPE_ICON: Record<
  SessionType,
  React.ComponentType<{ className?: string }>
> = {
  mealParsing: UtensilsCrossed,
  nutritionGuidance: MessageCircle,
};

const TYPE_ICON_COLOR: Record<SessionType, string> = {
  mealParsing: "text-chart-1",
  nutritionGuidance: "text-chart-2",
};

const TYPE_ICON_BG: Record<SessionType, string> = {
  mealParsing: "bg-chart-1/10",
  nutritionGuidance: "bg-chart-2/10",
};

function relativeTime(iso: string | undefined, t: TFunction) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 60) return t("aiSessionHistory.minutesAgo", { count: diffMin });
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return t("aiSessionHistory.hoursAgo", { count: diffHr });
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return t("aiSessionHistory.daysAgo", { count: diffDay });
  return new Date(iso).toLocaleDateString();
}

export default function AiSessionHistoryPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<"all" | SessionType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const TYPE_LABEL: Record<SessionType, string> = {
    mealParsing: t("aiSessionHistory.mealParsing"),
    nutritionGuidance: t("aiSessionHistory.nutritionGuidance"),
  };

  const STATUS_BADGE: Record<
    SessionStatus,
    { label: string; className: string }
  > = {
    pending: {
      label: t("aiSessionHistory.statusPending"),
      className: "bg-blue-100 text-blue-700",
    },
    needsConfirmation: {
      label: t("aiSessionHistory.statusNeedsConfirmation"),
      className: "bg-amber-100 text-amber-700",
    },
    completed: {
      label: t("aiSessionHistory.statusCompleted"),
      className: "bg-green-100 text-green-700",
    },
    failed: {
      label: t("aiSessionHistory.statusFailed"),
      className: "bg-red-100 text-red-700",
    },
  };

  const params = {
    sessionType: activeFilter === "all" ? undefined : activeFilter,
    pageNumber: page,
    pageRowCount: 10,
  };
  const { data, isLoading } = useListAiSessions(params);

  const sessions = (data?.aiSessions ?? []).filter((s) => {
    if (!searchQuery) return true;
    return (
      s.inputText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.finalResponseText ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });
  const totalCount = data?.rowCount ?? sessions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const filters: {
    key: "all" | SessionType;
    label: string;
    icon: typeof Layers;
  }[] = [
    { key: "all", label: t("aiSessionHistory.all"), icon: Layers },
    {
      key: "mealParsing",
      label: t("aiSessionHistory.mealParsing"),
      icon: UtensilsCrossed,
    },
    {
      key: "nutritionGuidance",
      label: t("aiSessionHistory.guidance"),
      icon: MessageCircle,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("aiSessionHistory.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("aiSessionHistory.subtitle")}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setActiveFilter(f.key);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("aiSessionHistory.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="h-auto w-40 border-none bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>

      {isLoading && sessions.length === 0 && (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("aiSessionHistory.loading")}
        </Card>
      )}

      {!isLoading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-12 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {t("aiSessionHistory.noSessions")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("aiSessionHistory.adjustFilters")}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => {
          const Icon = TYPE_ICON[session.sessionType];
          const badge = STATUS_BADGE[session.sessionState];
          return (
            <Link
              key={session.id}
              to={`/ai-sessions/${session.id}`}
              className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${TYPE_ICON_BG[session.sessionType]}`}
                >
                  <Icon
                    className={`h-5 w-5 ${TYPE_ICON_COLOR[session.sessionType]}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {TYPE_LABEL[session.sessionType]}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {relativeTime(session.createdAt, t)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {session.inputText}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          {t("aiSessionHistory.pageOf", { page, totalPages })}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted disabled:opacity-50"
            aria-label={t("aiSessionHistory.previousPage")}
            title={t("aiSessionHistory.previousPage")}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted disabled:opacity-50"
            aria-label={t("aiSessionHistory.nextPage")}
            title={t("aiSessionHistory.nextPage")}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
