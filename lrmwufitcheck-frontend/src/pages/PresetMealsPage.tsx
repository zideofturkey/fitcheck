import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  useDeletePresetLine,
  useListPresetLines,
  useListPresetMeals,
  nutritionlibraryKeys,
} from "@/hooks/api/use-nutritionlibrary";
import { useListDishes } from "@/hooks/api/use-dish";
import type { Dish } from "@/services/api/dish-api";
import CategoryAccordionDishPicker from "@/components/CategoryAccordionDishPicker";
import { useCreateSuggestion } from "@/hooks/api/use-suggestion";
import {
  addPresetLineDish,
  addPresetLineManual,
} from "@/services/api/preset-line-helpers";
import ManualNutritionForm, {
  type ManualNutritionFormValues,
} from "@/components/ManualNutritionForm";
import ManualEntrySuggestionDialog from "@/components/ManualEntrySuggestionDialog";
import { persistManualDish } from "@/services/api/manual-entry-helpers";
import StepIndicator from "@/components/StepIndicator";

export default function PresetMealsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListPresetMeals({
    pageNumber: page,
    pageRowCount: 12,
  });
  const deleteMutation = useDeletePresetMeal();
  const createMutation = useCreatePresetMeal();
  const suggestMutation = useCreateSuggestion();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [createdPresetId, setCreatedPresetId] = useState<string | null>(null);
  const [pickerTab, setPickerTab] = useState<"library" | "manual">("library");
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [gramAmount, setGramAmount] = useState<number>(100);
  const [pendingSuggestion, setPendingSuggestion] = useState<
    ManualNutritionFormValues | null
  >(null);
  const [isPersisting, setIsPersisting] = useState(false);

  const { data: linesData } = useListPresetLines(createdPresetId, {});
  const removeLineMutation = useDeletePresetLine();
  const { data: dishData } = useListDishes({
    dishName: librarySearch || undefined,
    pageRowCount: 8,
  });
  const addLineMutation = useMutation({
    mutationFn: ({
      presetMealId,
      data,
    }: {
      presetMealId: string;
      data:
        | { dishId: string; gramAmount: number }
        | Parameters<typeof addPresetLineManual>[1];
    }) =>
      "dishId" in data
        ? addPresetLineDish(presetMealId, data)
        : addPresetLineManual(presetMealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionlibraryKeys.all() });
    },
  });

  const presets = data?.presetMeals ?? [];
  const totalCount = data?.rowCount ?? presets.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 12));
  const createdLines = linesData?.presetLines ?? [];

  const handleDelete = (id: string) => {
    if (!confirm(t("presetMeals.deleteConfirm"))) return;
    deleteMutation.mutate(id);
  };

  const resetCreateState = () => {
    setCreateStep(1);
    setCreateForm({ name: "", description: "" });
    setCreatedPresetId(null);
    setPickerTab("library");
    setLibrarySearch("");
    setSelectedDish(null);
    setGramAmount(100);
    setPendingSuggestion(null);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    resetCreateState();
  };

  // Step 1 -> Step 2: creates the preset meal in the background right away,
  // then switches the same drawer to the item picker instead of navigating
  // away - the user never leaves this modal until they press "Bitir".
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;
    createMutation.mutate(
      {
        templateName: createForm.name,
        descriptionText: createForm.description || undefined,
      },
      {
        onSuccess: (res) => {
          setCreatedPresetId(res.presetMeal.id);
          setCreateStep(2);
        },
      },
    );
  };

  const grams = gramAmount > 0 ? gramAmount : 100;
  const dishBase =
    selectedDish && selectedDish.totalGramWeight > 0
      ? selectedDish.totalGramWeight
      : 0;
  const libraryPreview =
    selectedDish && dishBase > 0
      ? {
          calories: Math.round((selectedDish.totalCalories / dishBase) * grams),
          protein: +((selectedDish.totalProtein / dishBase) * grams).toFixed(1),
          fat: +((selectedDish.totalFat / dishBase) * grams).toFixed(1),
        }
      : null;

  const handleAddFromLibrary = () => {
    if (!createdPresetId || !selectedDish) return;
    addLineMutation.mutate(
      {
        presetMealId: createdPresetId,
        data: { dishId: selectedDish.id, gramAmount: grams },
      },
      {
        onSuccess: () => {
          setSelectedDish(null);
          setGramAmount(100);
        },
      },
    );
  };

  const handleAddManual = (values: ManualNutritionFormValues) => {
    if (!createdPresetId) return;
    addLineMutation.mutate(
      {
        presetMealId: createdPresetId,
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
        onSuccess: () => {
          // The line is already saved as an embedded/one-off entry at this
          // point regardless of what the user answers next - the popup only
          // decides whether a *separate*, reusable Dish also gets created
          // in the Yemek Kütüphanesi.
          setPendingSuggestion(values);
        },
      },
    );
  };

  const handleSuggestionChoice = async (mode: "suggest" | "keepPrivate") => {
    if (!pendingSuggestion) return;
    setIsPersisting(true);
    try {
      const dish = await persistManualDish(pendingSuggestion);
      if (mode === "suggest") {
        await suggestMutation.mutateAsync({
          entityType: "dish",
          sourceRecordId: dish.id,
        });
        toast.success(t("manualEntry.suggestedSuccess"));
      } else {
        toast.success(t("manualEntry.savedToLibrary"));
      }
    } catch {
      toast.error(t("manualEntry.persistError"));
    } finally {
      setIsPersisting(false);
      setPendingSuggestion(null);
    }
  };

  const handleRemoveCreatedLine = (presetLineId: string) => {
    if (!createdPresetId) return;
    removeLineMutation.mutate({
      presetMealId: createdPresetId,
      presetLineId,
    });
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
                    title={t("presetMeals.deleteAria")}
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
              title={t("presetMeals.previousPage")}
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
              title={t("presetMeals.nextPage")}
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
            onClick={handleCloseCreate}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  {createStep === 1
                    ? t("presetMeals.newPreset")
                    : t("presetMealDetail.addFood")}
                </h2>
                <StepIndicator currentStep={createStep} totalSteps={2} />
              </div>
              <button
                type="button"
                onClick={handleCloseCreate}
                className="rounded-full p-1.5 hover:bg-muted"
                aria-label={t("presetMeals.closeAria")}
                title={t("presetMeals.closeAria")}
              >
                <X className="size-5" />
              </button>
            </div>

            {createStep === 1 ? (
              <form
                onSubmit={handleNextStep}
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
                    onClick={handleCloseCreate}
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
                      : t("dishes.nextStep")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col">
                {createdLines.length > 0 && (
                  <div className="p-4 border-b border-border space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("presetMealDetail.item", {
                        count: createdLines.length,
                      })}
                    </p>
                    {createdLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                      >
                        <span className="text-sm truncate">
                          {line.lineFoodName}{" "}
                          <span className="text-muted-foreground">
                            ({line.gramAmount}g)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCreatedLine(line.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                          aria-label={t("presetMealDetail.removeAria", {
                            name: line.lineFoodName,
                          })}
                          title={t("common.remove")}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex border-b border-border">
                  <button
                    type="button"
                    onClick={() => setPickerTab("library")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                      pickerTab === "library"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("manualEntry.dishLibraryTab")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTab("manual")}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                      pickerTab === "manual"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("manualEntry.manualTab")}
                  </button>
                </div>

                {pickerTab === "library" ? (
                  <>
                    <div className="p-4 border-b border-border">
                      <input
                        type="search"
                        placeholder={t("presetMealDetail.searchFoods")}
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {librarySearch ? (
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
                                <p className="text-sm font-medium">
                                  {dish.dishName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {dish.totalCalories} kcal / {dish.totalGramWeight}g
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
                    {selectedDish && libraryPreview && (
                      <div className="border-t border-border p-4 space-y-3 bg-muted/30">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t("presetMealDetail.gramAmount")}
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
                              {t("presetMealDetail.calories")}
                            </p>
                            <p className="font-semibold text-foreground">
                              {libraryPreview.calories} kcal
                            </p>
                          </div>
                          <div className="rounded-md bg-card border border-border p-2">
                            <p className="text-muted-foreground">
                              {t("presetMealDetail.protein")}
                            </p>
                            <p className="font-semibold text-foreground">
                              {libraryPreview.protein} g
                            </p>
                          </div>
                          <div className="rounded-md bg-card border border-border p-2">
                            <p className="text-muted-foreground">
                              {t("presetMealDetail.fat")}
                            </p>
                            <p className="font-semibold text-foreground">
                              {libraryPreview.fat} g
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          className="w-full"
                          disabled={addLineMutation.isPending || gramAmount <= 0}
                          onClick={handleAddFromLibrary}
                        >
                          {addLineMutation.isPending
                            ? t("presetMealDetail.adding")
                            : t("presetMealDetail.addGrams", { grams })}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4">
                    <ManualNutritionForm
                      nameLabel={t("manualEntry.dishNameLabel")}
                      submitLabel={t("manualEntry.addDish")}
                      isPending={addLineMutation.isPending}
                      onSubmit={handleAddManual}
                    />
                  </div>
                )}

                <div className="p-4 border-t border-border">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleCloseCreate}
                  >
                    {t("manualEntry.finish")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {pendingSuggestion && (
        <ManualEntrySuggestionDialog
          open={!!pendingSuggestion}
          itemName={pendingSuggestion.name}
          kind="dish"
          isPending={isPersisting}
          onSuggest={() => handleSuggestionChoice("suggest")}
          onKeepPrivate={() => handleSuggestionChoice("keepPrivate")}
          onDismiss={() => setPendingSuggestion(null)}
        />
      )}
    </div>
  );
}
