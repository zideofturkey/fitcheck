import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { History, Loader, Sparkles, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useParseMeal } from "@/hooks/api/use-nutritionai";
import { nutritionaiService } from "@/services/api/nutritionai-api";

export default function AiChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const parseMeal = useParseMeal();
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    t("aiChat.suggestion1"),
    t("aiChat.suggestion2"),
    t("aiChat.suggestion3"),
    t("aiChat.suggestion4"),
  ];

  const applySuggestion = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    parseMeal.mutate(
      { inputText: text },
      {
        onSuccess: async (sessionRes) => {
          const session = sessionRes.aiSession;
          const sessionId = session?.id;
          if (!sessionId) {
            toast.error(t("aiChat.sessionCreateFailed"));
            return;
          }
          // The candidate meal is linked to the session — fetch it.
          try {
            const list = await nutritionaiService.listAiCandidateMeals({
              aiSessionId: sessionId,
            });
            const candidate = list?.aiCandidateMeals?.[0];
            if (candidate?.id) {
              navigate(`/ai-candidate-meals/${candidate.id}/confirm`);
              return;
            }
          } catch {
            /* fall through to session detail */
          }
          // No candidate meal yet — surface the AI's textual response.
          if (session?.finalResponseText) {
            toast(session.finalResponseText);
          }
          navigate(`/ai-sessions/${sessionId}`);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ??
            (err as Error)?.message ??
            t("aiChat.analysisError");
          toast.error(msg);
        },
      },
    );
  };

  return (
    <div className="relative min-h-[80vh]">
      {/* Page-scoped gradient wash — kept subtle (low opacity, two blobs) so
          the off-white background still reads through instead of an overly
          saturated green field. min-h-[80vh] (rather than min-h-full, which
          can't resolve through the plain, non-stretched .animate-page-fade
          wrapper) keeps the wash covering most of the visible viewport so it
          doesn't stop abruptly wherever the (possibly short) content ends. */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 -top-32 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[10%] top-24 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-6 flex justify-end">
          <Link
            to="/ai-sessions"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={t("aiChat.history")}
          >
            <History className="w-4 h-4" />
            {t("aiChat.history")}
          </Link>
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-semibold tracking-tight text-foreground">
            <Sparkles className="w-7 h-7 text-primary" aria-hidden />
            {t("aiChat.title")}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {t("aiChat.subtitle")}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySuggestion(s)}
              disabled={parseMeal.isPending}
              className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50 hover:bg-primary/10 hover:shadow-sm transition-all disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-[110%] h-24 rounded-full bg-primary/25 blur-2xl" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-shadow">
              <input
                ref={inputRef}
                id="ai-meal-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("aiChat.placeholder")}
                disabled={parseMeal.isPending}
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={parseMeal.isPending || !inputText.trim()}
                aria-label={t("aiChat.analyze")}
                title={t("aiChat.analyze")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
              >
                {parseMeal.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t("aiChat.hint")}
        </p>

        {parseMeal.isPending && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Loader className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("aiChat.analyzingLong")}
            </p>
          </div>
        )}

        {parseMeal.isError && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{t("aiChat.failed")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
