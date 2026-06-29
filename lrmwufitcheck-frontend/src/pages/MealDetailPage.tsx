import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDeleteMealLog,
  useGetMealLog,
  useListMealLines,
  useDeleteMealLine,
} from "@/hooks/api/use-mealtracker";

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetMealLog(id);
  const { data: linesData } = useListMealLines(
    id ? { mealLogId: id } : undefined,
  );
  const deleteMutation = useDeleteMealLog();
  const deleteLineMutation = useDeleteMealLine();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const meal = data?.mealLog;
  const lines = linesData?.mealLines ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        Yükleniyor…
      </div>
    );
  }

  if (error || !meal) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Öğün kaydı bulunamadı.</p>
        <Link
          to="/meals"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Öğün geçmişine dön
        </Link>
      </Card>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(meal.id, {
      onSuccess: () => navigate("/meals"),
    });
  };

  const handleDeleteLine = (lineId: string) => {
    if (!confirm("Bu satır silinsin mi?")) return;
    deleteLineMutation.mutate(lineId);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/meals"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Meal History
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Detail</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(meal.mealDate)} · {meal.slotName} · {meal.mealTime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/meals/${meal.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </header>

      {/* Meal-Level Summary Card */}
      <Card className="mb-8 rounded-2xl shadow-md p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {meal.slotName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {meal.logSource}
              </span>
              <span className="text-xs text-muted-foreground">
                Logged at {meal.mealTime}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm leading-relaxed">{meal.noteText || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-3">
            {[
              { value: meal.totalCalories, label: "kcal" },
              { value: meal.totalProtein, label: "Protein g" },
              { value: meal.totalCarbohydrates, label: "Carbs g" },
              { value: meal.totalFat, label: "Fat g" },
              { value: meal.totalSugar, label: "Sugar g" },
              { value: meal.totalFiber, label: "Fiber g" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Meal Line Items Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Food Items</h2>
          <Link to={`/meals/${meal.id}/edit`}>
            <Button size="sm">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "Item",
                  "Grams",
                  "kcal",
                  "Protein",
                  "Carbs",
                  "Fat",
                  "Source",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`${i === 0 ? "text-start" : "text-end"} px-4 py-3 font-semibold text-muted-foreground`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{item.itemName}</td>
                  <td className="px-4 py-3 text-end tabular-nums">
                    {item.consumedGrams} g
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums">
                    {item.itemCalories}
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums">
                    {item.itemProtein}
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums">
                    {item.itemCarbohydrates}
                  </td>
                  <td className="px-4 py-3 text-end tabular-nums">
                    {item.itemFat}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {item.lineSource === "aiAssistant" ||
                    item.lineSource === "temporaryAi" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                        <Sparkles className="w-3 h-3" /> AI
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {item.lineSource}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteLine(item.id)}
                      className="rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                      aria-label="Delete line"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    No food items in this meal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {lines.map((item) => (
            <Card key={item.id} className="p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{item.itemName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.consumedGrams} g
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {item.lineSource}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { value: item.itemCalories, label: "kcal" },
                  { value: item.itemProtein, label: "Protein" },
                  { value: item.itemCarbohydrates, label: "Carbs" },
                  { value: item.itemFat, label: "Fat" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-sm font-bold">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => handleDeleteLine(item.id)}
                  className="rounded-md p-1.5 hover:bg-destructive/10 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </Card>
          ))}
          {lines.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No food items in this meal.
            </Card>
          )}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-border">
        <Link
          to="/meals"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Meals
        </Link>
        <Link
          to="/meals/log"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Log Another Meal
        </Link>
      </div>

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Meal</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this meal? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
