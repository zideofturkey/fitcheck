import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader,
  Megaphone,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateDish, useDeleteDish, useListDishes } from "@/hooks/api/use-dish";
import { useCreateSuggestion } from "@/hooks/api/use-suggestion";

export default function DishesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListDishes({ pageNumber: page, pageRowCount: 12 });
  const deleteMutation = useDeleteDish();
  const createMutation = useCreateDish();
  const suggestMutation = useCreateSuggestion();

  const handleSuggest = (id: string) => {
    suggestMutation.mutate(
      { entityType: "dish", sourceRecordId: id },
      {
        onSuccess: () => toast.success(t("dishes.suggestSuccess")),
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ?? t("dishes.suggestError");
          toast.error(msg);
        },
      },
    );
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });

  const dishes = data?.dishes ?? [];
  const totalCount = dishes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 12));

  const handleDelete = (id: string) => {
    if (!confirm(t("dishes.confirmDelete"))) return;
    deleteMutation.mutate(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;
    createMutation.mutate(
      {
        dishName: createForm.name,
        descriptionText: createForm.description || undefined,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setCreateForm({ name: "", description: "" });
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="relative">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("dishes.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("dishes.subtitle")}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            {t("dishes.newDish")}
          </Button>
        </header>

        {isLoading && dishes.length === 0 ? (
          <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin mr-2" />
            {t("common.loading")}
          </Card>
        ) : dishes.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            {t("dishes.empty")}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link to={`/dishes/${dish.id}`} className="hover:underline">
                      <h3 className="truncate text-base font-semibold text-card-foreground">
                        {dish.dishName}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {dish.descriptionText || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!dish.isGlobal && (
                      <button
                        type="button"
                        onClick={() => handleSuggest(dish.id)}
                        disabled={suggestMutation.isPending}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/50"
                        aria-label={t("dishes.suggestAria")}
                        title={t("dishes.suggestTooltip")}
                      >
                        <Megaphone className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(dish.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={t("dishes.deleteAria")}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    <UtensilsCrossed className="size-3" aria-hidden="true" />
                    {dish.totalGramWeight}g
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("aiCandidateMeal.calories")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {dish.totalCalories} {t("common.kcal")}
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("aiCandidateMeal.protein")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {dish.totalProtein} g
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("aiCandidateMeal.carbs")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {dish.totalCarbohydrates} g
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("aiCandidateMeal.fat")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {dish.totalFat} g
                    </span>
                  </div>
                </div>

                <Link
                  to={`/dishes/${dish.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {t("dishes.viewDetails")}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {dishes.length > 0 && (
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              {t("dishes.showingCount", { count: dishes.length })}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                aria-label={t("common.back")}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="px-2 text-sm text-muted-foreground">
                {t("dishes.pageOf", { page, totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                aria-label={t("common.next")}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {createOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/30"
            onClick={() => setCreateOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">{t("dishes.newDish")}</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-full p-1.5 hover:bg-muted"
                aria-label={t("common.close")}
              >
                <X className="size-5" />
              </button>
            </div>
            <form
              onSubmit={handleCreate}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">
                  {t("dishes.nameLabel")} *
                </label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">
                  {t("dishes.descriptionLabel")}
                </label>
                <Input
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dishes.createHint")}
              </p>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCreateOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? t("dishes.saving")
                    : t("dishes.saveDish")}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
