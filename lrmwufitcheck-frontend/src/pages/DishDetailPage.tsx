import { formatMacro } from "@/lib/format";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronRight,
  Loader,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import {
  useDeleteDish,
  useGetDish,
  useListDishLines,
  useDeleteDishLine,
  useAddDishLine,
} from "@/hooks/api/use-dish";
import { useListFoodItems } from "@/hooks/api/use-nutritionlibrary";
import CategoryAccordionFoodPicker from "@/components/CategoryAccordionFoodPicker";
import ManualNutritionForm, {
  type ManualNutritionFormValues,
} from "@/components/ManualNutritionForm";
import type { NutritionlibraryFoodItem } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { extractApiErrorMessage } from "@/lib/api-error";

interface EditLineForm {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}

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
  const { user } = useAuth();
  const isAdmin = user?.roleId === "admin" || user?.roleId === "superAdmin";
  const { data, isLoading, error } = useGetDish(dishId);
  const { data: linesData } = useListDishLines(dishId);
  const deleteMutation = useDeleteDish();
  const deleteLineMutation = useDeleteDishLine();
  const addLineMutation = useAddDishLine();
  const [addOpen, setAddOpen] = useState(false);
  useLockBodyScroll(addOpen);
  const [addTab, setAddTab] = useState<"library" | "manual" | "direct">(
    "library",
  );
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] =
    useState<NutritionlibraryFoodItem | null>(null);
  const [gramAmount, setGramAmount] = useState<number>(100);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditLineForm | null>(null);
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

  const canEdit = isAdmin || !dish.isGlobal;

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
          setSelectedFood(null);
          setGramAmount(100);
        },
        onError: (err) =>
          toast.error(extractApiErrorMessage(err, t("dishes.addLineError"))),
      },
    );
  };

  const handleAddManualIngredient = (values: ManualNutritionFormValues) => {
    addLineMutation.mutate(
      {
        dishId: dish.id,
        data: {
          gramAmount: values.gramAmount,
          manualFoodName: values.name,
          manualCaloriePer100g: values.caloriePer100g,
          manualProteinPer100g: values.proteinPer100g,
          manualCarbohydratePer100g: values.carbohydratePer100g,
          manualFatPer100g: values.fatPer100g,
          manualSugarPer100g: values.sugarPer100g,
          manualFiberPer100g: values.fiberPer100g,
        },
      },
      {
        onSuccess: () => setAddOpen(false),
        onError: (err) =>
          toast.error(extractApiErrorMessage(err, t("dishes.addLineError"))),
      },
    );
  };

  const handleStartEditLine = (line: (typeof lines)[number]) => {
    setEditingLineId(line.id);
    setEditForm({
      name: line.lineFoodName,
      grams: line.gramAmount,
      calories: line.lineCalories,
      protein: line.lineProtein,
      carbs: line.lineCarbohydrates,
      fat: line.lineFat,
      sugar: line.lineSugar,
      fiber: line.lineFiber,
    });
  };

  const handleCancelEditLine = () => {
    setEditingLineId(null);
    setEditForm(null);
  };

  const handleSaveEditLine = async (lineId: string) => {
    if (!editForm) return;
    const grams = editForm.grams > 0 ? editForm.grams : 100;
    const per100g = (value: number) => (grams > 0 ? +((value / grams) * 100).toFixed(2) : 0);
    await deleteLineMutation.mutateAsync({ dishId: dish.id, dishLineId: lineId });
    await addLineMutation.mutateAsync({
      dishId: dish.id,
      data: {
        gramAmount: grams,
        manualFoodName: editForm.name,
        manualCaloriePer100g: per100g(editForm.calories),
        manualProteinPer100g: per100g(editForm.protein),
        manualCarbohydratePer100g: per100g(editForm.carbs),
        manualFatPer100g: per100g(editForm.fat),
        manualSugarPer100g: per100g(editForm.sugar),
        manualFiberPer100g: per100g(editForm.fiber),
      },
    });
    setEditingLineId(null);
    setEditForm(null);
  };

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
            {canEdit && (
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
            )}
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
                  value={formatMacro(dish.totalCalories)}
                  unit={t("common.kcal")}
                />
                <NutritionTile
                  label={t("aiCandidateMeal.protein")}
                  value={formatMacro(dish.totalProtein)}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.carbs")}
                  value={formatMacro(dish.totalCarbohydrates)}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.fat")}
                  value={formatMacro(dish.totalFat)}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.sugar")}
                  value={formatMacro(dish.totalSugar)}
                  unit="g"
                />
                <NutritionTile
                  label={t("aiCandidateMeal.fiber")}
                  value={formatMacro(dish.totalFiber)}
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
          {lines.map((line) =>
            editingLineId === line.id && editForm ? (
              <Card key={line.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => f && { ...f, name: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                  <div className="relative w-28 flex-shrink-0">
                    <Input
                      type="number"
                      min={1}
                      value={editForm.grams}
                      onChange={(e) =>
                        setEditForm(
                          (f) => f && { ...f, grams: Number(e.target.value) || 0 },
                        )
                      }
                      className="h-9 text-sm pr-6"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      g
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(
                    [
                      ["calories", "aiCandidateMeal.calories"],
                      ["protein", "aiCandidateMeal.protein"],
                      ["carbs", "aiCandidateMeal.carbs"],
                      ["fat", "aiCandidateMeal.fat"],
                      ["sugar", "aiCandidateMeal.sugar"],
                      ["fiber", "aiCandidateMeal.fiber"],
                    ] as const
                  ).map(([field, labelKey]) => (
                    <div key={field} className="space-y-0.5">
                      <label className="block text-[10px] text-muted-foreground">
                        {t(labelKey)}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={editForm[field]}
                        onChange={(e) =>
                          setEditForm(
                            (f) =>
                              f && {
                                ...f,
                                [field]: Number(e.target.value) || 0,
                              },
                          )
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    disabled={
                      deleteLineMutation.isPending ||
                      addLineMutation.isPending ||
                      editForm.grams <= 0
                    }
                    onClick={() => handleSaveEditLine(line.id)}
                  >
                    {t("common.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEditLine}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </Card>
            ) : (
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
                          {formatMacro(line.lineCalories)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("aiCandidateMeal.protein")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineProtein)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("aiCandidateMeal.carbs")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineCarbohydrates)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("aiCandidateMeal.fat")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineFat)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("aiCandidateMeal.sugar")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineSugar)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("aiCandidateMeal.fiber")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineFiber)}g
                        </span>
                      </div>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditLine(line)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-muted h-9 w-9"
                        aria-label={t("dishes.editLineAria", { name: line.lineFoodName })}
                        title={t("common.edit")}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                        aria-label={t("dishes.removeAria", { name: line.lineFoodName })}
                        title={t("common.remove")}
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ),
          )}
          {lines.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              {t("dishes.noIngredients")}
            </Card>
          )}
        </section>

        {canEdit && (
          <section className="mb-12">
            <button
              type="button"
              onClick={() => {
                setSelectedFood(null);
                setGramAmount(100);
                setSearch("");
                setAddTab("library");
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
        )}
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
                className="tap-target-expand rounded-full p-1.5 hover:bg-muted"
                aria-label={t("common.close")}
                title={t("common.close")}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setAddTab("library")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  addTab === "library"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("manualEntry.libraryTab")}
              </button>
              <button
                type="button"
                onClick={() => setAddTab("manual")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  addTab === "manual"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("manualEntry.manualTab")}
              </button>
              <button
                type="button"
                onClick={() => setAddTab("direct")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  addTab === "direct"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("dishes.directTab")}
              </button>
            </div>

            {addTab === "manual" ? (
              <div className="p-4">
                <ManualNutritionForm
                  nameLabel={t("manualEntry.ingredientNameLabel")}
                  submitLabel={t("manualEntry.addIngredient")}
                  isPending={addLineMutation.isPending}
                  onSubmit={handleAddManualIngredient}
                />
              </div>
            ) : addTab === "direct" ? (
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground rounded-md border border-border bg-muted/40 p-2.5">
                  {t("dishes.directHint")}
                </p>
                <ManualNutritionForm
                  nameLabel={t("manualEntry.dishNameLabel")}
                  submitLabel={t("manualEntry.addDish")}
                  isPending={addLineMutation.isPending}
                  onSubmit={handleAddManualIngredient}
                />
              </div>
            ) : (
              <>
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
              {search ? (
                <>
                  {(foodData?.foodItems ?? []).map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => setSelectedFood(food)}
                        className={`w-full text-left rounded-md border p-3 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted"
                        }`}
                        disabled={addLineMutation.isPending}
                      >
                        <p className="text-sm font-medium">{food.foodName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMacro(food.caloriePer100g)} {t("common.kcal")} · {formatMacro(food.proteinPer100g)}
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
                </>
              ) : (
                <CategoryAccordionFoodPicker
                  selectedId={selectedFood?.id ?? null}
                  onSelect={(food) => setSelectedFood(food)}
                  emptyLabel={t("dishes.noFoodsFound")}
                />
              )}
            </div>

            {selectedFood && preview && (
              <div className="relative border-t border-border p-4 pt-9 space-y-3 bg-muted/30">
                <button
                  type="button"
                  onClick={() => setSelectedFood(null)}
                  className="tap-target-expand absolute right-3 top-3 text-foreground/50 transition-colors hover:text-destructive active:text-destructive"
                  aria-label={t("common.clearSelection")}
                  title={t("common.clearSelection")}
                >
                  <X className="h-4 w-4" />
                </button>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t("dishes.gramAmount")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      placeholder="100"
                      value={gramAmount === 0 ? "" : gramAmount}
                      onChange={(e) =>
                        setGramAmount(
                          e.target.value === ""
                            ? 0
                            : Number(e.target.value) || 0,
                        )
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
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
