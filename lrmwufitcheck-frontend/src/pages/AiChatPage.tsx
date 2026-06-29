import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History, Loader, Sparkles, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParseMeal } from "@/hooks/api/use-nutritionai";
import { nutritionaiService } from "@/services/api/nutritionai-api";

export default function AiChatPage() {
  const navigate = useNavigate();
  const parseMeal = useParseMeal();
  const [inputText, setInputText] = useState("");

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
            toast.error("AI oturumu oluşturulamadı.");
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
            "AI analizi sırasında bir hata oluştu.";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Öğün Analizi
          </h1>
          <p className="text-sm text-muted-foreground">
            Yediğinizi doğal dilde tarif edin, AI besin değerlerini hesaplasın.
          </p>
        </div>
        <Link
          to="/ai-sessions"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <History className="w-4 h-4" />
          Geçmiş
        </Link>
      </header>

      <Card className="p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="ai-meal-input"
            className="block text-sm font-medium text-foreground"
          >
            Ne yediniz?
          </label>
          <textarea
            id="ai-meal-input"
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Örneğin: '2 yumurta ve 40g sucuk yedim'"
            disabled={parseMeal.isPending}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              AI analizinin doğru çalışması için miktarları belirtin (örn. 100g, 2 adet).
            </p>
            <Button
              type="submit"
              disabled={parseMeal.isPending || !inputText.trim()}
              className="gap-2"
            >
              {parseMeal.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analiz Ediliyor…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analiz Et
                </>
              )}
            </Button>
          </div>
        </form>

        {parseMeal.isPending && (
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <Loader className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              AI analiz ediyor... Bu birkaç saniye sürebilir.
            </p>
          </div>
        )}

        {parseMeal.isError && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Analiz başarısız oldu. Lütfen tekrar deneyin.
            </p>
          </div>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Örnek
          </p>
          <p className="text-sm text-foreground">
            &ldquo;Kahvaltıda 2 omlet, 1 dilim ekmek ve çay&rdquo;
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            İpucu
          </p>
          <p className="text-sm text-foreground">
            Miktar belirtmek (g, adet, bardak) daha doğru sonuç verir.
          </p>
        </div>
      </div>
    </div>
  );
}
