import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronRight,
  Loader,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDeleteDish,
  useGetDish,
  useListDishLines,
  useDeleteDishLine,
  useAddDishLine,
} from "@/hooks/api/use-dish";
import { useListFoodItems } from "@/hooks/api/use-nutritionlibrary";

function NutritionTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{unit}</p>
    </div>
  );
}

export default function DishDetailPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetDish(dishId);
  const { data: linesData } = useListDishLines(dishId);
  const deleteMutation = useDeleteDish();
  const deleteLineMutation = useDeleteDishLine();
  const addLineMutation = useAddDishLine();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [gramAmount, setGramAmount] = useState<number>(100);
  const { data: foodData } = useListFoodItems({
    searchTerm: search || undefined,
    pageRowCount: 8,
  });

  const dish = data?.dish;
  const lines = linesData?.dishLines ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("common.loading")}
      </div>
    );
  }

  if (error || !dish) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("dishes.notFound")}</p>
        <Link
          to="/dishes"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("dishes.backToDishes")}
        </Link>
      </Card>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(dish.id, {
      onSuccess: () => navigate("/dishes"),
    });
  };

  const handleRemoveLine = (lineId: string) => {
    if (!confirm(t("dishes.confirmRemoveLine"))) return;
    deleteLineMutation.mutate({ dishId: dish.id, dishLineId: lineId });
  };

  const handleAddFood = (foodItemId: string) => {
    addLineMutation.mutate(
      {
        dishId: dish.id,
        data: { foodItemId, gramAmount: gramAmount || 100 },
      },
      {
        onSuccess: () => {
          setAddOpen(false);
          setSelectedFoodId(null);
          setGramAmount(100);
        },
      },
    );
  };

  const selectedFood = (foodData?.foodItems ?? []).find(
    (f) => f.id === selectedFoodId,
  );
  const grams = gramAmount > 0 ? gramAmount : 100;
  const preview = selectedFood
    ? {
        calories: Math.round((selectedFood.caloriePer100g / 100) * grams),
        protein: +((selectedFood.proteinPer100g / 100) * grams).toFixed(1),
        carbs: +((selectedFood.carbohydratePer100g / 100) * grams).toFixed(1),
        fat: +((selectedFood.fatPer100g / 100) * grams).toFixed(1),
        sugar: +((selectedFood.sugarPer100g / 100) * grams).toFixed(1),
        fiber: +((selectedFood.fiberPer100g / 100) * grams).toFixed(1),
      }
    : null;

  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <nav
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dishes"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" aria-hidden="true" />
            {t("dishes.title")}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-foreground font-medium truncate">
            {dish.dishName}
          </span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Link
                to="/dishes"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> {t("dishes.back")}
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight truncate">
                {dish.dishName}
              </h1>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dish.descriptionText || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("common.delete")}</span>
              </Button>
            </div>
          </div>
        </header>

        <section className="mb-8">
          <Card className="rounded-xl border-border shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {t("dishes.nutritionTotals")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <NutritionTile
                  label={t("aiCandidateMeal.calories")}
                  value={dish.totalCalories}
                  unit={t("common.kcal")}
                />
                <NutritionTile
                  label={t("aiCandidateMeal.protein")}
                  value={dish.totalProtein}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.carbs")}
                  value={dish.totalCarbohydrates}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.fat")}
                  value={dish.totalFat}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.sugar")}
                  value={dish.totalSugar}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.fiber")}
                  value={dish.totalFiber}
                  unit="g"
                />
              </div>
            </div>
          </Card>
        </section>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("dishes.ingredientsTitle")}
          </h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {t("dishes.itemCount", { count: lines.length })}
          </span>
        </div>

        <section className="space-y-3 mb-8">
          {lines.map((line) => (
            <Card key={line.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {line.lineFoodName}
                    </h3>
                    <span className="text-sm text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                      {line.gramAmount}g
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("aiCandidateMeal.calories")}
                      </span>
                      <span className="text-sm font-medium block">
                        {line.lineCalories}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("aiCandidateMeal.protein")}
                      </span>
                      <span className="text-sm font-medium block">
                        {line.lineProtein}g
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("aiCandidateMeal.carbs")}
                      </span>
                      <span className="text-sm font-medium block">
                        {line.lineCarbohydrates}g
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("aiCandidateMeal.fat")}
                      </span>
                      <span className="text-sm font-medium block">
                        {line.lineFat}g
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("aiCandidateMeal.sugar")}
                      </span>
                      <span className="text-sm font-medium block">
                        {line.lineSugar}g
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {t("aiCandidateMeal.fiber")}
                      </span>
                      <span className="text-sm font-medium block">
                        {line.lineFiber}g
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLine(line.id)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-destructive/10 hover:text-destructive h-9 w-9 flex-shrink-0"
                  aria-label={t("dishes.removeAria", { name: line.lineFoodName })}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </Card>
          ))}
          {lines.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              {t("dishes.noIngredients")}
            </Card>
          )}
        </section>

        <section className="mb-12">
          <button
            type="button"
            onClick={() => {
              setSelectedFoodId(null);
              setGramAmount(100);
              setAddOpen(true);
            }}
            className="w-full rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">
              {t("dishes.addIngredient")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("dishes.addIngredientHint")}
            </p>
          </button>
        </section>
      </main>

      {addOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/30"
            onClick={() => setAddOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">
                {t("dishes.addIngredientTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-full p-1.5 hover:bg-muted"
                aria-label={t("common.close")}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-4 border-b border-border">
              <input
                type="search"
                placeholder={t("dishes.searchFoods")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(foodData?.foodItems ?? []).map((food) => {
                const isSelected = selectedFoodId === food.id;
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => setSelectedFoodId(food.id)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                    disabled={addLineMutation.isPending}
                  >
                    <p className="text-sm font-medium">{food.foodName}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.caloriePer100g} {t("common.kcal")} · {food.proteinPer100g}
                      g {t("aiCandidateMeal.protein").toLowerCase()} / 100g
                    </p>
                  </button>
                );
              })}
              {(foodData?.foodItems ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("dishes.noFoodsFound")}
                </p>
              )}
            </div>

            {selectedFood && preview && (
              <div className="border-t border-border p-4 space-y-3 bg-muted/30">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t("dishes.gramAmount")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={gramAmount}
                      onChange={(e) =>
                        setGramAmount(Number(e.target.value) || 0)
                      }
                      className="w-full rounded-md border border-input bg-card px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      g
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("aiCandidateMeal.calories")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.calories} {t("common.kcal")}
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("aiCandidateMeal.protein")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.protein} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("aiCandidateMeal.carbs")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.carbs} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("aiCandidateMeal.fat")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.fat} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("aiCandidateMeal.sugar")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.sugar} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("aiCandidateMeal.fiber")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.fiber} g
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  disabled={addLineMutation.isPending || gramAmount <= 0}
                  onClick={() => handleAddFood(selectedFood.id)}
                >
                  {addLineMutation.isPending
                    ? t("dishes.adding")
                    : t("dishes.addGrams", { grams })}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
