import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreatePresetMeal,
  useDeletePresetMeal,
  useListPresetMeals,
} from "@/hooks/api/use-nutritionlibrary";

export default function PresetMealsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListPresetMeals({
    pageNumber: page,
    pageRowCount: 12,
  });
  const deleteMutation = useDeletePresetMeal();
  const createMutation = useCreatePresetMeal();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });

  const presets = data?.presetMeals ?? [];
  const totalCount = data?.rowCount ?? presets.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 12));

  const handleDelete = (id: string) => {
    if (!confirm(t("presetMeals.deleteConfirm"))) return;
    deleteMutation.mutate(id);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;
    createMutation.mutate(
      {
        templateName: createForm.name,
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
        <div
          className="absolute -top-40 right-0 -z-10 size-96 rounded-full bg-primary/5 blur-3xl opacity-50"
          aria-hidden="true"
        />

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("presetMeals.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("presetMeals.subtitle")}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            {t("presetMeals.newPreset")}
          </Button>
        </header>

        {isLoading && presets.length === 0 ? (
          <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin mr-2" />
            {t("presetMeals.loading")}
          </Card>
        ) : presets.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            {t("presetMeals.empty")}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/preset-meals/${preset.id}`}
                      className="hover:underline"
                    >
                      <h3 className="truncate text-base font-semibold text-card-foreground">
                        {preset.templateName}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {preset.descriptionText || "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(preset.id)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t("presetMeals.deleteAria")}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    <Layers className="size-3" aria-hidden="true" />
                    {preset.totalCalories} kcal
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("presetMeals.calories")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalCalories} kcal
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("presetMeals.protein")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalProtein} g
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("presetMeals.carbs")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalCarbohydrates} g
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">
                      {t("presetMeals.fat")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalFat} g
                    </span>
                  </div>
                </div>

                <Link
                  to={`/preset-meals/${preset.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {t("presetMeals.viewDetails")}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            {t("presetMeals.showing")}{" "}
            <span className="font-medium text-foreground">
              {presets.length}
            </span>{" "}
            {t("presetMeals.of")}{" "}
            <span className="font-medium text-foreground">{totalCount}</span>{" "}
            {t("presetMeals.presets")}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label={t("presetMeals.previousPage")}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:ml-1 sm:inline">
                {t("presetMeals.previous")}
              </span>
            </button>
            <span className="px-2 text-sm text-muted-foreground">
              {t("presetMeals.pageOf", { page, totalPages })}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label={t("presetMeals.nextPage")}
            >
              <span className="hidden sm:mr-1 sm:inline">
                {t("presetMeals.next")}
              </span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Drawer */}
      {createOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/30"
            onClick={() => setCreateOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">
                {t("presetMeals.newPreset")}
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-full p-1.5 hover:bg-muted"
                aria-label={t("presetMeals.closeAria")}
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
                  {t("presetMeals.name")} *
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
                  {t("presetMeals.description")}
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
                {t("presetMeals.createHint")}
              </p>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCreateOpen(false)}
                >
                  {t("presetMeals.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? t("presetMeals.saving")
                    : t("presetMeals.savePreset")}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
