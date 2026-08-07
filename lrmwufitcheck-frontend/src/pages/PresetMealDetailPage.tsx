import { formatMacro } from "@/lib/format";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
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
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import {
  useDeletePresetMeal,
  useGetPresetMeal,
  useListPresetLines,
  useDeletePresetLine,
  nutritionlibraryKeys,
} from "@/hooks/api/use-nutritionlibrary";
import { useListDishes } from "@/hooks/api/use-dish";
import {
  addPresetLineDish,
  addPresetLineManual,
} from "@/services/api/preset-line-helpers";
import type { Dish } from "@/services/api/dish-api";
import CategoryAccordionDishPicker from "@/components/CategoryAccordionDishPicker";
import ManualNutritionForm, {
  type ManualNutritionFormValues,
} from "@/components/ManualNutritionForm";
import { useAuth } from "@/context/AuthContext";

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

export default function PresetMealDetailPage() {
  const { t } = useTranslation();
  const { presetMealId } = useParams<{ presetMealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roleId === "admin" || user?.roleId === "superAdmin";
  const { data, isLoading, error } = useGetPresetMeal(presetMealId);
  const { data: linesData } = useListPresetLines(presetMealId ?? "", {});
  const deleteMutation = useDeletePresetMeal();
  const deleteLineMutation = useDeletePresetLine();
  const queryClient = useQueryClient();
  const addLineMutation = useMutation({
    mutationFn: ({
      presetMealId,
      data,
    }: {
      presetMealId: string;
      data: { dishId: string; gramAmount: number };
    }) => addPresetLineDish(presetMealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
  const editLineMutation = useMutation({
    mutationFn: ({
      presetMealId,
      data,
    }: {
      presetMealId: string;
      data: Parameters<typeof addPresetLineManual>[1];
    }) => addPresetLineManual(presetMealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });
  const [addOpen, setAddOpen] = useState(false);
  useLockBodyScroll(addOpen);
  const [addTab, setAddTab] = useState<"library" | "manual">("library");
  const [search, setSearch] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [gramAmount, setGramAmount] = useState<number>(100);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditLineForm | null>(null);
  const { data: dishData } = useListDishes({
    dishName: search || undefined,
    pageRowCount: 8,
  });

  const preset = data?.presetMeal;
  const lines = linesData?.presetLines ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("presetMealDetail.loading")}
      </div>
    );
  }

  if (error || !preset) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("presetMealDetail.notFound")}
        </p>
        <Link
          to="/preset-meals"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("presetMealDetail.backToList")}
        </Link>
      </Card>
    );
  }

  const canEdit = isAdmin || !preset.isGlobal;

  const handleDelete = () => {
    deleteMutation.mutate(preset.id, {
      onSuccess: () => navigate("/preset-meals"),
    });
  };

  const handleRemoveLine = (lineId: string) => {
    if (!confirm(t("presetMealDetail.removeConfirm"))) return;
    deleteLineMutation.mutate({
      presetMealId: preset.id,
      presetLineId: lineId,
    });
  };

  const handleAddDish = (dishId: string) => {
    addLineMutation.mutate(
      {
        presetMealId: preset.id,
        data: { dishId, gramAmount: gramAmount || 100 },
      },
      {
        onSuccess: () => {
          setAddOpen(false);
          setSelectedDish(null);
          setGramAmount(100);
        },
      },
    );
  };

  const handleAddManualItem = (values: ManualNutritionFormValues) => {
    editLineMutation.mutate(
      {
        presetMealId: preset.id,
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
    await deleteLineMutation.mutateAsync({
      presetMealId: preset.id,
      presetLineId: lineId,
    });
    await editLineMutation.mutateAsync({
      presetMealId: preset.id,
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
  // Dishes aren't per-100g like a foodItem — scale against the dish's own
  // recipe weight (totalGramWeight), mirroring the backend's dishFactor math
  // in add-presetline-api.js exactly, so the preview matches what gets saved.
  const dishBase =
    selectedDish && selectedDish.totalGramWeight > 0
      ? selectedDish.totalGramWeight
      : 0;
  const preview = selectedDish && dishBase > 0
    ? {
        calories: Math.round((selectedDish.totalCalories / dishBase) * grams),
        protein: +((selectedDish.totalProtein / dishBase) * grams).toFixed(1),
        carbs: +((selectedDish.totalCarbohydrates / dishBase) * grams).toFixed(1),
        fat: +((selectedDish.totalFat / dishBase) * grams).toFixed(1),
        sugar: +((selectedDish.totalSugar / dishBase) * grams).toFixed(1),
        fiber: +((selectedDish.totalFiber / dishBase) * grams).toFixed(1),
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
            to="/preset-meals"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            {t("presetMealDetail.presets")}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-foreground font-medium truncate">
            {preset.templateName}
          </span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <Link
                to="/preset-meals"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> {t("presetMealDetail.back")}
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight truncate">
                {preset.templateName}
              </h1>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {preset.descriptionText || "—"}
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
                  <span className="hidden sm:inline">
                    {t("presetMealDetail.delete")}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </header>

        <section className="mb-8">
          <Card className="rounded-xl border-border shadow-sm">
            <div className="p-4 sm:p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {t("presetMealDetail.nutritionTotals")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <NutritionTile
                  label={t("presetMealDetail.calories")}
                  value={formatMacro(preset.totalCalories)}
                  unit="kcal"
                />
                <NutritionTile
                  label={t("presetMealDetail.protein")}
                  value={formatMacro(preset.totalProtein)}
                  unit="g"
                />
                <NutritionTile
                  label={t("presetMealDetail.carbs")}
                  value={formatMacro(preset.totalCarbohydrates)}
                  unit="g"
                />
                <NutritionTile
                  label={t("presetMealDetail.fat")}
                  value={formatMacro(preset.totalFat)}
                  unit="g"
                />
                <NutritionTile
                  label={t("presetMealDetail.sugar")}
                  value={formatMacro(preset.totalSugar)}
                  unit="g"
                />
                <NutritionTile
                  label={t("presetMealDetail.fiber")}
                  value={formatMacro(preset.totalFiber)}
                  unit="g"
                />
              </div>
            </div>
          </Card>
        </section>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("presetMealDetail.foodItems")}
          </h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {t("presetMealDetail.item", { count: lines.length })}
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
                      ["calories", "presetMealDetail.calories"],
                      ["protein", "presetMealDetail.protein"],
                      ["carbs", "presetMealDetail.carbs"],
                      ["fat", "presetMealDetail.fat"],
                      ["sugar", "presetMealDetail.sugar"],
                      ["fiber", "presetMealDetail.fiber"],
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
                      editLineMutation.isPending ||
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
                          {t("presetMealDetail.calories")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineCalories)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("presetMealDetail.protein")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineProtein)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("presetMealDetail.carbs")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineCarbohydrates)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("presetMealDetail.fat")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineFat)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("presetMealDetail.sugar")}
                        </span>
                        <span className="text-sm font-medium block">
                          {formatMacro(line.lineSugar)}g
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t("presetMealDetail.fiber")}
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
                        aria-label={t("presetMealDetail.editAria", {
                          name: line.lineFoodName,
                        })}
                        title={t("common.edit")}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                        aria-label={t("presetMealDetail.removeAria", {
                          name: line.lineFoodName,
                        })}
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
              {t("presetMealDetail.noItems")}
            </Card>
          )}
        </section>

        {canEdit && (
          <section className="mb-12">
            <button
              type="button"
              onClick={() => {
                setSelectedDish(null);
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
                {t("presetMealDetail.addFoodItem")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("presetMealDetail.addFoodHint")}
              </p>
            </button>
          </section>
        )}
      </main>

      {/* Add dish drawer */}
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
                {t("presetMealDetail.addFood")}
              </h2>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="tap-target-expand rounded-full p-1.5 hover:bg-muted"
                aria-label={t("presetMealDetail.closeAria")}
                title={t("presetMealDetail.closeAria")}
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
                {t("manualEntry.dishLibraryTab")}
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
            </div>

            {addTab === "manual" ? (
              <div className="p-4">
                <ManualNutritionForm
                  nameLabel={t("manualEntry.dishNameLabel")}
                  submitLabel={t("manualEntry.addDish")}
                  isPending={editLineMutation.isPending}
                  onSubmit={handleAddManualItem}
                />
              </div>
            ) : (
              <>
            <div className="p-4 border-b border-border">
              <input
                type="search"
                placeholder={t("presetMealDetail.searchFoods")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {search ? (
                <>
                  {(dishData?.dishes ?? []).map((dish) => {
                    const isSelected = selectedDish?.id === dish.id;
                    return (
                      <button
                        key={dish.id}
                        type="button"
                        onClick={() => {
                          setSelectedDish(dish);
                          setGramAmount(dish.totalGramWeight || 100);
                        }}
                        className={`w-full text-left rounded-md border p-3 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted"
                        }`}
                        disabled={addLineMutation.isPending}
                      >
                        <p className="text-sm font-medium">{dish.dishName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMacro(dish.totalCalories)} kcal · {formatMacro(dish.totalProtein)}g{" "}
                          {t("presetMealDetail.protein").toLowerCase()} /{" "}
                          {dish.totalGramWeight}g
                        </p>
                      </button>
                    );
                  })}
                  {(dishData?.dishes ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      {t("presetMealDetail.noFoodsFound")}
                    </p>
                  )}
                </>
              ) : (
                <CategoryAccordionDishPicker
                  selectedId={selectedDish?.id ?? null}
                  onSelect={(dish) => {
                    setSelectedDish(dish);
                    setGramAmount(dish.totalGramWeight || 100);
                  }}
                  emptyLabel={t("presetMealDetail.noFoodsFound")}
                />
              )}
            </div>

            {/* Gram amount + live preview for the selected dish */}
            {selectedDish && preview && (
              <div className="border-t border-border p-4 space-y-3 bg-muted/30">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t("presetMealDetail.gramAmount")}
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
                      {t("presetMealDetail.calories")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.calories} kcal
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("presetMealDetail.protein")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.protein} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("presetMealDetail.carbs")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.carbs} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("presetMealDetail.fat")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.fat} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("presetMealDetail.sugar")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {preview.sugar} g
                    </p>
                  </div>
                  <div className="rounded-md bg-card border border-border p-2">
                    <p className="text-muted-foreground">
                      {t("presetMealDetail.fiber")}
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
                  onClick={() => handleAddDish(selectedDish.id)}
                >
                  {addLineMutation.isPending
                    ? t("presetMealDetail.adding")
                    : t("presetMealDetail.addGrams", { grams })}
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
