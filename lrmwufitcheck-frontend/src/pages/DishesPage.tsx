import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader,
  Megaphone,
  Plus,
  Send,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddDishLine,
  useCreateDish,
  useDeleteDish,
  useDeleteDishLine,
  useListDishes,
  useListDishLines,
} from "@/hooks/api/use-dish";
import { useListFoodItems } from "@/hooks/api/use-nutritionlibrary";
import { useCreateSuggestion } from "@/hooks/api/use-suggestion";
import { useParseMeal } from "@/hooks/api/use-nutritionai";
import { nutritionaiHelpers } from "@/services/api/nutritionai-helpers";
import ManualNutritionForm, {
  type ManualNutritionFormValues,
} from "@/components/ManualNutritionForm";
import ManualEntrySuggestionDialog from "@/components/ManualEntrySuggestionDialog";
import { persistManualFoodItem } from "@/services/api/manual-entry-helpers";
import StepIndicator from "@/components/StepIndicator";
import { DISH_CATEGORIES, dishCategoryLabel } from "@/lib/dish-category";
import CategoryAccordionFoodPicker from "@/components/CategoryAccordionFoodPicker";
import type { NutritionlibraryFoodItem } from "@/types/api";
import { useAuth } from "@/context/AuthContext";

interface AiDishLine {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
}

const per100g = (value: number, grams: number) =>
  grams > 0 ? +((value / grams) * 100).toFixed(2) : 0;

export default function DishesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.roleId === "admin" || user?.roleId === "superAdmin";
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState<
    "all" | "mine" | "global"
  >("all");
  const { data, isLoading } = useListDishes({
    pageNumber: page,
    pageRowCount: 12,
    dishCategory: categoryFilter === "all" ? undefined : categoryFilter,
    searchTerm: search || undefined,
    ownershipFilter,
  });
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
            (err as { message?: string })?.message ?? t("dishes.suggestError");
          toast.error(msg);
        },
      },
    );
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [createIsGlobal, setCreateIsGlobal] = useState(false);
  const [createdDishId, setCreatedDishId] = useState<string | null>(null);
  const [pickerTab, setPickerTab] = useState<"library" | "manual">("library");
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedFood, setSelectedFood] =
    useState<NutritionlibraryFoodItem | null>(null);
  const [gramAmount, setGramAmount] = useState<number>(100);
  const [pendingSuggestion, setPendingSuggestion] = useState<
    ManualNutritionFormValues | null
  >(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  // Ingredients parsed by AI, waiting for the dish itself to be created
  // (Step 1) before they can be added as manual DishLines in Step 2.
  const [pendingAiLines, setPendingAiLines] = useState<AiDishLine[] | null>(
    null,
  );
  const [aiLinesLoading, setAiLinesLoading] = useState(false);

  const addLineMutation = useAddDishLine();
  const removeLineMutation = useDeleteDishLine();
  const { data: linesData } = useListDishLines(createdDishId);
  const { data: foodData } = useListFoodItems({
    searchTerm: librarySearch || undefined,
    pageRowCount: 8,
  });
  const [isPersisting, setIsPersisting] = useState(false);
  const parseMeal = useParseMeal();

  const dishes = data?.dishes ?? [];
  const totalCount = dishes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 12));
  const createdLines = linesData?.dishLines ?? [];

  const handleDelete = (id: string) => {
    if (!confirm(t("dishes.confirmDelete"))) return;
    deleteMutation.mutate(id);
  };

  const resetCreateState = () => {
    setCreateStep(1);
    setCreateForm({ name: "", description: "", category: "" });
    setCreateIsGlobal(false);
    setCreatedDishId(null);
    setPickerTab("library");
    setLibrarySearch("");
    setSelectedFood(null);
    setGramAmount(100);
    setPendingSuggestion(null);
    setPendingAiLines(null);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    resetCreateState();
  };

  // Step 1 -> Step 2: creates the dish in the background right away, then
  // switches the same drawer to the ingredient picker instead of navigating
  // away - the user never leaves this modal until they press "Bitir".
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;
    createMutation.mutate(
      {
        dishName: createForm.name,
        descriptionText: createForm.description || undefined,
        dishCategory: createForm.category || undefined,
        isGlobal: isAdmin && createIsGlobal ? true : undefined,
      },
      {
        onSuccess: async (res) => {
          setCreatedDishId(res.dish.id);
          setCreateStep(2);
          if (pendingAiLines && pendingAiLines.length > 0) {
            setPickerTab("manual");
            for (const line of pendingAiLines) {
              try {
                await addLineMutation.mutateAsync({
                  dishId: res.dish.id,
                  data: {
                    gramAmount: line.grams || 100,
                    manualFoodName: line.name,
                    manualCaloriePer100g: per100g(line.calories, line.grams),
                    manualProteinPer100g: per100g(line.protein, line.grams),
                    manualCarbohydratePer100g: per100g(
                      line.carbs,
                      line.grams,
                    ),
                    manualFatPer100g: per100g(line.fat, line.grams),
                    manualSugarPer100g: per100g(line.sugar, line.grams),
                    manualFiberPer100g: per100g(line.fiber, line.grams),
                  },
                });
              } catch {
                toast.error(
                  t("dishes.aiIngredientAddFailed", { name: line.name }),
                );
              }
            }
            setPendingAiLines(null);
          }
        },
      },
    );
  };

  const handleAiParse = (e: React.FormEvent) => {
    e.preventDefault();
    const text = aiInput.trim();
    if (!text) return;
    parseMeal.mutate(
      { inputText: text },
      {
        onSuccess: async (sessionRes) => {
          const sessionId = sessionRes.aiSession?.id;
          if (!sessionId) {
            toast.error(t("dishes.aiSessionFailed"));
            return;
          }
          setAiLinesLoading(true);
          try {
            const linesRes = await nutritionaiHelpers.listAiCandidateLines({
              aiSessionId: sessionId,
            });
            const lines = linesRes?.aiCandidateLines ?? [];
            if (lines.length === 0) {
              toast.error(
                sessionRes.aiSession?.finalResponseText ??
                  t("dishes.aiSuggestionFailed"),
              );
              return;
            }
            setPendingAiLines(
              lines.map((l) => ({
                name: l.detectedFoodName ?? "",
                grams: l.estimatedGrams || 100,
                calories: l.estimatedCalories ?? 0,
                protein: l.estimatedProtein ?? 0,
                carbs: l.estimatedCarbohydrates ?? 0,
                fat: l.estimatedFat ?? 0,
                sugar: l.estimatedSugar ?? 0,
                fiber: l.estimatedFiber ?? 0,
              })),
            );
            setAiOpen(false);
            setAiInput("");
            setCreateOpen(true);
            toast.success(t("dishes.aiValuesTransferred"));
          } catch {
            toast.error(
              sessionRes.aiSession?.finalResponseText ??
                t("dishes.aiSuggestionRetrieveFailed"),
            );
          } finally {
            setAiLinesLoading(false);
          }
        },
        onError: (err: unknown) => {
          const msg =
            (err as { message?: string })?.message ??
            t("dishes.aiAnalysisError");
          toast.error(msg);
        },
      },
    );
  };

  const grams = gramAmount > 0 ? gramAmount : 100;
  const libraryPreview = selectedFood
    ? {
        calories: Math.round((selectedFood.caloriePer100g / 100) * grams),
        protein: +((selectedFood.proteinPer100g / 100) * grams).toFixed(1),
        carbs: +((selectedFood.carbohydratePer100g / 100) * grams).toFixed(1),
        fat: +((selectedFood.fatPer100g / 100) * grams).toFixed(1),
      }
    : null;

  const handleAddFromLibrary = () => {
    if (!createdDishId || !selectedFood) return;
    addLineMutation.mutate(
      {
        dishId: createdDishId,
        data: { foodItemId: selectedFood.id, gramAmount: grams },
      },
      {
        onSuccess: () => {
          setSelectedFood(null);
          setGramAmount(100);
        },
      },
    );
  };

  const handleAddManual = (values: ManualNutritionFormValues) => {
    if (!createdDishId) return;
    addLineMutation.mutate(
      {
        dishId: createdDishId,
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
          // decides whether a *separate*, reusable foodItem also gets
          // created in the Malzeme Kütüphanesi.
          setPendingSuggestion(values);
        },
      },
    );
  };

  const handleSuggestionChoice = async (mode: "suggest" | "keepPrivate") => {
    if (!pendingSuggestion) return;
    setIsPersisting(true);
    try {
      const foodItem = await persistManualFoodItem(pendingSuggestion);
      if (mode === "suggest") {
        await suggestMutation.mutateAsync({
          entityType: "foodItem",
          sourceRecordId: foodItem.id,
        });
        toast.success(t("manualEntry.suggestedSuccess"));
      } else {
        toast.success(t("manualEntry.savedToLibrary"));
      }
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ??
        t("manualEntry.persistError");
      toast.error(msg);
    } finally {
      setIsPersisting(false);
      setPendingSuggestion(null);
    }
  };

  const handleRemoveCreatedLine = (dishLineId: string) => {
    if (!createdDishId) return;
    removeLineMutation.mutate({ dishId: createdDishId, dishLineId });
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAiOpen(true)}
              className="gap-2"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {t("dishes.addWithAi")}
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="size-4" aria-hidden="true" />
              {t("dishes.newDish")}
            </Button>
          </div>
        </header>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Input
              type="search"
              placeholder={t("dishes.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-medium h-auto gap-1.5 w-auto">
                {categoryFilter === "all"
                  ? t("dishes.allCategories")
                  : dishCategoryLabel(t, categoryFilter)}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dishes.allCategories")}</SelectItem>
                {DISH_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {dishCategoryLabel(t, c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={ownershipFilter}
              onValueChange={(v) => {
                setOwnershipFilter(v as "all" | "mine" | "global");
                setPage(1);
              }}
            >
              <SelectTrigger className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-medium h-auto gap-1.5 w-auto">
                {ownershipFilter === "mine"
                  ? t("dishes.ownershipMine")
                  : ownershipFilter === "global"
                    ? t("dishes.ownershipGlobal")
                    : t("dishes.ownershipAll")}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dishes.ownershipAll")}</SelectItem>
                <SelectItem value="mine">{t("dishes.ownershipMine")}</SelectItem>
                <SelectItem value="global">
                  {t("dishes.ownershipGlobal")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
                      title={t("dishes.deleteAria")}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    <UtensilsCrossed className="size-3" aria-hidden="true" />
                    {dish.totalGramWeight}g
                  </span>
                  {dish.dishCategory && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {dishCategoryLabel(t, dish.dishCategory)}
                    </span>
                  )}
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
                title={t("common.back")}
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
                title={t("common.next")}
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
            onClick={handleCloseCreate}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  {createStep === 1
                    ? t("dishes.newDish")
                    : t("dishes.addIngredientTitle")}
                </h2>
                <StepIndicator currentStep={createStep} totalSteps={2} />
              </div>
              <button
                type="button"
                onClick={handleCloseCreate}
                className="rounded-full p-1.5 hover:bg-muted"
                aria-label={t("common.close")}
                title={t("common.close")}
              >
                <X className="size-5" />
              </button>
            </div>

            {createStep === 1 ? (
              <form
                onSubmit={handleNextStep}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {pendingAiLines && pendingAiLines.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
                    <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">
                      {t("dishes.aiIngredientsDetected", {
                        count: pendingAiLines.length,
                        names: pendingAiLines.map((l) => l.name).join(", "),
                      })}
                    </p>
                  </div>
                )}
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
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">
                    {t("dishes.categoryLabel")}
                  </label>
                  <Select
                    value={createForm.category}
                    onValueChange={(v) =>
                      setCreateForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("dishes.categoryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {DISH_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {dishCategoryLabel(t, c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isAdmin && (
                  <label className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={createIsGlobal}
                      onChange={(e) => setCreateIsGlobal(e.target.checked)}
                    />
                    <span className="font-medium text-foreground">
                      {t("dishes.addAsGlobal")}
                    </span>
                  </label>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("dishes.createHint")}
                </p>
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCloseCreate}
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
                      : t("dishes.nextStep")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col">
                {createdLines.length > 0 && (
                  <div className="p-4 border-b border-border space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("dishes.itemCount", { count: createdLines.length })}
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
                          aria-label={t("dishes.removeAria", {
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
                    {t("manualEntry.libraryTab")}
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
                        placeholder={t("dishes.searchFoods")}
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {librarySearch ? (
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
                                <p className="text-sm font-medium">
                                  {food.foodName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {food.caloriePer100g} {t("common.kcal")} · 100g
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
                    {selectedFood && libraryPreview && (
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
                              {libraryPreview.calories} {t("common.kcal")}
                            </p>
                          </div>
                          <div className="rounded-md bg-card border border-border p-2">
                            <p className="text-muted-foreground">
                              {t("aiCandidateMeal.protein")}
                            </p>
                            <p className="font-semibold text-foreground">
                              {libraryPreview.protein} g
                            </p>
                          </div>
                          <div className="rounded-md bg-card border border-border p-2">
                            <p className="text-muted-foreground">
                              {t("aiCandidateMeal.fat")}
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
                            ? t("dishes.adding")
                            : t("dishes.addGrams", { grams })}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4">
                    <ManualNutritionForm
                      nameLabel={t("manualEntry.ingredientNameLabel")}
                      submitLabel={t("manualEntry.addIngredient")}
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

      {aiOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/30"
            onClick={() => setAiOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                <Sparkles className="size-5 text-primary" />
                {t("dishes.addWithAi")}
              </h2>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label={t("common.close")}
                title={t("common.close")}
              >
                <X className="size-5 text-muted-foreground" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleAiParse} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <p className="text-sm text-muted-foreground">
                  {t("dishes.aiDescribe")}
                </p>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("dishes.aiDescriptionLabel")}
                  </label>
                  <textarea
                    rows={5}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={t("dishes.aiPlaceholder")}
                    disabled={parseMeal.isPending || aiLinesLoading}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-none disabled:opacity-60"
                  />
                </div>
                {(parseMeal.isPending || aiLinesLoading) && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <Loader className="size-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t("dishes.aiAnalyzing")}
                    </p>
                  </div>
                )}
                {parseMeal.isError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">
                      {t("dishes.aiFailed")}
                    </p>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAiOpen(false)}
                  >
                    {t("dishes.aiCancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    disabled={
                      parseMeal.isPending || aiLinesLoading || !aiInput.trim()
                    }
                  >
                    {parseMeal.isPending || aiLinesLoading ? (
                      <>
                        <Loader className="size-4 animate-spin" />
                        {t("dishes.aiAnalyzingBtn")}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {t("dishes.aiAnalyzeBtn")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {pendingSuggestion && (
        <ManualEntrySuggestionDialog
          open={!!pendingSuggestion}
          itemName={pendingSuggestion.name}
          kind="ingredient"
          isPending={isPersisting}
          onSuggest={() => handleSuggestionChoice("suggest")}
          onKeepPrivate={() => handleSuggestionChoice("keepPrivate")}
          onDismiss={() => setPendingSuggestion(null)}
        />
      )}
    </div>
  );
}
