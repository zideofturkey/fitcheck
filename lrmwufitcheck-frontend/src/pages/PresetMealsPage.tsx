import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader,
  Pencil,
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
    if (!confirm("Delete this preset meal?")) return;
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
              Preset Meals
            </h1>
            <p className="text-sm text-muted-foreground">
              Reusable meal templates for quick logging.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="size-4" aria-hidden="true" />
            New Preset
          </Button>
        </header>

        {isLoading && presets.length === 0 ? (
          <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin mr-2" />
            Yükleniyor…
          </Card>
        ) : presets.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Henüz kayıtlı preset öğün yok. Yeni bir preset oluşturmak için
            &quot;New Preset&quot; butonunu kullanın.
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
                    aria-label="Delete preset"
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
                      Calories
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalCalories} kcal
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">Protein</span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalProtein} g
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">Carbs</span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalCarbohydrates} g
                    </span>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <span className="block text-muted-foreground">Fat</span>
                    <span className="text-sm font-semibold text-foreground">
                      {preset.totalFat} g
                    </span>
                  </div>
                </div>

                <Link
                  to={`/preset-meals/${preset.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  View Details
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {presets.length}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalCount}</span>{" "}
            presets
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:ml-1 sm:inline">Previous</span>
            </button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label="Next page"
            >
              <span className="hidden sm:mr-1 sm:inline">Next</span>
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
              <h2 className="text-lg font-semibold">New Preset</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-full p-1.5 hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <form
              onSubmit={handleCreate}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Name *</label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Description</label>
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
                You can add food items to this preset from the detail page after
                creation.
              </p>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving…" : "Save Preset"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
