import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Apple,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader,
  Milk,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Send,
  AlertCircle,
  Layers,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { useParseMeal } from "@/hooks/api/use-nutritionai";
import { nutritionaiHelpers } from "@/services/api/nutritionai-helpers";
import { useCreateSuggestion } from "@/hooks/api/use-suggestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useCreateFoodItem,
  useDeleteFoodItem,
  useListFoodItems,
  useUpdateFoodItem,
} from "@/hooks/api/use-nutritionlibrary";
import { useGroupedFoodItems } from "@/hooks/api/use-food-item-groups";
import type { NutritionlibraryFoodItem } from "@/types/api";
import type { FoodItemWithBaseName } from "@/types/food-item-extensions";
import { CATEGORIES, categoryLabel } from "@/lib/food-category";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Meat: Apple,
  Dairy: Milk,
  Bakery: Apple,
  Vegetable: Apple,
  Fruit: Apple,
  Grain: Apple,
  Snack: Apple,
  Beverage: Apple,
  Other: Apple,
};

type FormState = {
  name: string;
  brand: string;
  baseName: string;
  category: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  fiber: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  brand: "",
  baseName: "",
  category: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  sugar: "",
  fiber: "",
};

function itemToForm(item: NutritionlibraryFoodItem): FormState {
  return {
    name: item.foodName,
    brand: item.brandName ?? "",
    baseName: (item as FoodItemWithBaseName).baseName ?? "",
    category: item.foodCategory ?? "",
    calories: String(item.caloriePer100g),
    protein: String(item.proteinPer100g),
    carbs: String(item.carbohydratePer100g),
    fat: String(item.fatPer100g),
    sugar: String(item.sugarPer100g),
    fiber: String(item.fiberPer100g),
  };
}

function BrandField({
  value,
  onChange,
  options,
  onAddBrand,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  onAddBrand: (v: string) => void;
  t: TFunction;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddBrand(trimmed);
    onChange(trimmed);
    setDraft("");
    setAdding(false);
  };

  const handleCancel = () => {
    setDraft("");
    setAdding(false);
  };

  // The item's own current brand might not be in `options` yet (e.g. it's
  // the only foodItem with that brand and the options query hasn't caught
  // up) — always keep the active value selectable.
  const fullOptions =
    value && !options.includes(value) ? [value, ...options] : options;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {t("foodLibrary.brand")}
      </label>
      {adding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder={t("foodLibrary.newBrandPlaceholder")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
          <Button type="button" size="sm" onClick={handleSave}>
            {t("common.save")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleCancel}
          >
            {t("common.cancel")}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select
            value={value || "none"}
            onValueChange={(v) => onChange(v === "none" ? "" : v)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("foodLibrary.selectEllipsis")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("foodLibrary.noBrand")}</SelectItem>
              {fullOptions.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input hover:bg-muted transition-colors"
            aria-label={t("foodLibrary.addBrand")}
            title={t("foodLibrary.addBrand")}
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FoodLibraryPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingFood, setEditingFood] =
    useState<NutritionlibraryFoodItem | null>(null);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [createIsAi, setCreateIsAi] = useState(false);
  const [groupedView, setGroupedView] = useState(false);
  const parseMeal = useParseMeal();

  const { data, isLoading } = useListFoodItems({
    searchTerm: search || undefined,
    foodCategory: categoryFilter === "all" ? undefined : categoryFilter,
    creationSource:
      sourceFilter === "all"
        ? undefined
        : (sourceFilter as "manualEntry" | "aiAssistant"),
    pageNumber: page,
    pageRowCount: 10,
  });
  const { data: groupedData, isLoading: groupedLoading } =
    useGroupedFoodItems(groupedView);

  // Separate, unfiltered, large-page fetch just to derive the full set of
  // brand names the user has ever used — the main list above is paginated
  // 10 at a time and would only ever surface the current page's brands.
  const { data: brandSourceData } = useListFoodItems({ pageRowCount: 500 });
  const [extraBrands, setExtraBrands] = useState<string[]>([]);
  const brandOptions = useMemo(() => {
    const set = new Set<string>(extraBrands);
    for (const f of brandSourceData?.foodItems ?? []) {
      if (f.brandName) set.add(f.brandName);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [brandSourceData, extraBrands]);
  const handleAddBrand = (brand: string) => {
    setExtraBrands((prev) => (prev.includes(brand) ? prev : [...prev, brand]));
  };

  const items = data?.foodItems ?? [];
  const totalCount = data?.rowCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const createMutation = useCreateFoodItem();
  const updateMutation = useUpdateFoodItem();
  const deleteMutation = useDeleteFoodItem();
  const suggestMutation = useCreateSuggestion();

  const handleSuggest = (id: string) => {
    suggestMutation.mutate(
      { entityType: "foodItem", sourceRecordId: id },
      {
        onSuccess: () => toast.success(t("foodLibrary.suggestionSent")),
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ?? t("foodLibrary.suggestionFailed");
          toast.error(msg);
        },
      },
    );
  };

  const openEdit = (food: NutritionlibraryFoodItem) => {
    setEditingFood(food);
    setEditForm(itemToForm(food));
    setEditOpen(true);
  };

  const buildPayload = (form: FormState) => ({
    foodName: form.name,
    caloriePer100g: Number(form.calories) || 0,
    proteinPer100g: Number(form.protein) || 0,
    carbohydratePer100g: Number(form.carbs) || 0,
    fatPer100g: Number(form.fat) || 0,
    sugarPer100g: Number(form.sugar) || 0,
    fiberPer100g: Number(form.fiber) || 0,
    brandName: form.brand || undefined,
    foodCategory: form.category || undefined,
    // baseName isn't in the generated Create/UpdateFoodItemInput types
    // (added outside the Mindbricks spec) - the extra field is dropped by
    // TS structural typing at the call site, not by us casting it away.
    baseName: form.baseName || undefined,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.calories) return;
    createMutation.mutate(
      {
        ...buildPayload(createForm),
        creationSource: createIsAi ? "aiAssistant" : "manualEntry",
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setCreateForm(EMPTY_FORM);
          setCreateIsAi(false);
        },
      },
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;
    updateMutation.mutate(
      { foodItemId: editingFood.id, data: buildPayload(editForm) },
      {
        onSuccess: () => {
          setEditOpen(false);
          setEditingFood(null);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("foodLibrary.deleteConfirm"))) return;
    deleteMutation.mutate(id);
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
            toast.error(t("foodLibrary.aiSessionFailed"));
            return;
          }
          try {
            const linesRes =
              await nutritionaiHelpers.listAiCandidateLines({
                aiSessionId: sessionId,
              });
            const firstLine = linesRes?.aiCandidateLines?.[0];
            if (!firstLine) {
              toast.error(
                sessionRes.aiSession?.finalResponseText ??
                  t("foodLibrary.aiSuggestionFailed"),
              );
              return;
            }
            // Pre-fill the create form with the AI-estimated values.
            setCreateForm({
              name: firstLine.detectedFoodName ?? "",
              brand: "",
              baseName: "",
              category: "",
              calories: String(firstLine.estimatedCalories ?? ""),
              protein: String(firstLine.estimatedProtein ?? ""),
              carbs: String(firstLine.estimatedCarbohydrates ?? ""),
              fat: String(firstLine.estimatedFat ?? ""),
              sugar: String(firstLine.estimatedSugar ?? ""),
              fiber: String(firstLine.estimatedFiber ?? ""),
            });
            setAiOpen(false);
            setAiInput("");
            setCreateIsAi(true);
            setCreateOpen(true);
            toast.success(t("foodLibrary.aiValuesTransferred"));
          } catch {
            toast.error(
              sessionRes.aiSession?.finalResponseText ??
                t("foodLibrary.aiSuggestionRetrieveFailed"),
            );
          }
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ??
            (err as Error)?.message ??
            t("foodLibrary.aiAnalysisError");
          toast.error(msg);
        },
      },
    );
  };

  const drawerOverlay = "fixed inset-0 z-50 bg-foreground/30";
  const drawerPanel =
    "fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col bg-background p-0 md:inset-y-4 md:right-4 md:ml-auto md:h-auto md:w-full md:max-w-lg md:rounded-2xl md:shadow-2xl";

  const renderFoodList = () => {
    if (isLoading && items.length === 0) {
      return (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("foodLibrary.loading")}
        </Card>
      );
    }
    if (items.length === 0) {
      return (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("foodLibrary.emptyLibrary")}
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((food) => {
          const Icon = ICONS[food.foodCategory ?? "Other"] ?? Apple;
          return (
            <div
              key={food.id}
              className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/food-library/${food.id}`}
                    className="block hover:underline"
                  >
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {food.foodName}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-1 mt-0.5">
                    {food.foodCategory && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {categoryLabel(t, food.foodCategory)}
                      </Badge>
                    )}
                    {food.creationSource === "aiAssistant" && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 gap-1 bg-accent text-accent-foreground border-0"
                      >
                        <Sparkles className="size-3" aria-hidden="true" /> AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {food.caloriePer100g} kcal · {food.proteinPer100g}g{" "}
                    {t("foodLibrary.protein")} · {food.carbohydratePer100g}g{" "}
                    {t("foodLibrary.carbs")} / 100g
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {t("foodLibrary.fat")}: {food.fatPer100g}g
                    </span>
                    <span>
                      {t("foodLibrary.sugar")}: {food.sugarPer100g}g
                    </span>
                    <span>
                      {t("foodLibrary.fiber")}: {food.fiberPer100g}g
                    </span>
                    {food.brandName && (
                      <span>
                        {t("foodLibrary.brand")}: {food.brandName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!(food as FoodItemWithBaseName).isGlobal && (
                    <button
                      type="button"
                      onClick={() => handleSuggest(food.id)}
                      disabled={suggestMutation.isPending}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent/50 transition-colors"
                      aria-label={t("foodLibrary.suggestAria", {
                        name: food.foodName,
                      })}
                      title={t("foodLibrary.suggestTooltip")}
                    >
                      <Megaphone
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(food)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                    aria-label={t("foodLibrary.editAria", {
                      name: food.foodName,
                    })}
                    title={t("common.edit")}
                  >
                    <Pencil
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(food.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors"
                    aria-label={t("foodLibrary.deleteAria", {
                      name: food.foodName,
                    })}
                    title={t("common.delete")}
                  >
                    <Trash2
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGroupedList = () => {
    if (groupedLoading) {
      return (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          {t("foodLibrary.loading")}
        </Card>
      );
    }
    const groups = groupedData?.groups ?? [];
    if (groups.length === 0) {
      return (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t("foodLibrary.emptyGrouped")}
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {groups.map((group, idx) => {
          const heading = group.baseName ?? group.items[0]?.foodName;
          return (
            <Card
              key={group.baseName ?? `singleton-${group.items[0]?.id ?? idx}`}
              className="p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Layers
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-foreground">
                  {heading}
                </h3>
                {group.items.length > 1 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {group.items.length} {t("foodLibrary.variants")}
                  </Badge>
                )}
              </div>
              <div className="space-y-2 pl-6">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/food-library/${item.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm text-foreground">
                      {item.brandName || item.foodName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.caloriePer100g} kcal · {item.proteinPer100g}g{" "}
                      {t("foodLibrary.protein").toLowerCase()} / 100g
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("foodLibrary.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("foodLibrary.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAiOpen(true)}
            className="gap-2 min-h-[44px]"
          >
            <Sparkles className="size-4" aria-hidden="true" />{" "}
            {t("foodLibrary.addWithAi")}
          </Button>
          <Button
            onClick={() => {
              setCreateForm(EMPTY_FORM);
              setCreateIsAi(false);
              setCreateOpen(true);
            }}
            className="gap-2 min-h-[44px] min-w-[44px]"
          >
            <Plus className="size-4" aria-hidden="true" />{" "}
            {t("foodLibrary.addFood")}
          </Button>
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder={t("foodLibrary.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
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
                ? t("foodLibrary.allCategories")
                : categoryLabel(t, categoryFilter)}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("foodLibrary.allCategories")}
              </SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel(t, c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(v) => {
              setSourceFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-medium h-auto gap-1.5 w-auto">
              {sourceFilter === "all"
                ? t("foodLibrary.allSources")
                : sourceFilter === "manualEntry"
                  ? t("foodLibrary.manual")
                  : t("foodLibrary.ai")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("foodLibrary.allSources")}</SelectItem>
              <SelectItem value="manualEntry">
                {t("foodLibrary.manual")}
              </SelectItem>
              <SelectItem value="aiAssistant">{t("foodLibrary.ai")}</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setGroupedView((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              groupedView
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3" aria-hidden="true" />
            {t("foodLibrary.groupByBrand")}
          </button>
        </div>
      </div>

      {groupedView ? renderGroupedList() : renderFoodList()}

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          {t("foodLibrary.showing")}{" "}
          <span className="font-medium text-foreground">{items.length}</span>{" "}
          {t("foodLibrary.of")}{" "}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          {t("foodLibrary.foods")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label={t("foodLibrary.previousPage")}
            title={t("foodLibrary.previousPage")}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="text-sm text-muted-foreground">
            {t("foodLibrary.pageOf", { page, totalPages })}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label={t("foodLibrary.nextPage")}
            title={t("foodLibrary.nextPage")}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Create Drawer */}
      {createOpen && (
        <>
          <div
            className={drawerOverlay}
            onClick={() => setCreateOpen(false)}
            aria-hidden="true"
          />
          <div className={drawerPanel}>
            <form onSubmit={handleCreate} className="flex flex-col h-full">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4 md:rounded-t-2xl">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                  {t("foodLibrary.addFood")}
                  {createIsAi && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5">
                      <Sparkles className="size-3" />
                      {t("foodLibrary.ai")}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label={t("foodLibrary.closeAria")}
                  title={t("foodLibrary.closeAria")}
                >
                  <X
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("foodLibrary.foodName")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder={t("foodLibrary.foodNamePlaceholder")}
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] gap-4">
                  <BrandField
                    value={createForm.brand}
                    onChange={(v) =>
                      setCreateForm((f) => ({ ...f, brand: v }))
                    }
                    options={brandOptions}
                    onAddBrand={handleAddBrand}
                    t={t}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      {t("foodLibrary.category")}
                    </label>
                    <Select
                      value={createForm.category}
                      onValueChange={(v) =>
                        setCreateForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("foodLibrary.selectEllipsis")} />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {categoryLabel(t, c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("foodLibrary.baseIngredientName")}
                  </label>
                  <Input
                    placeholder={t("foodLibrary.baseNamePlaceholder")}
                    value={createForm.baseName}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        baseName: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("foodLibrary.baseNameHint")}
                  </p>
                </div>
                <fieldset className="space-y-4 rounded-xl border border-border p-4">
                  <legend className="text-sm font-semibold text-foreground px-1">
                    {t("foodLibrary.per100gNutrition")}
                  </legend>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        ["calories", t("foodLibrary.calories")],
                        ["protein", t("foodLibrary.proteinG")],
                        ["carbs", t("foodLibrary.carbsG")],
                        ["fat", t("foodLibrary.fatG")],
                        ["sugar", t("foodLibrary.sugarG")],
                        ["fiber", t("foodLibrary.fiberG")],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field} className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          {label} <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={createForm[field]}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              [field]: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4 md:rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCreateOpen(false)}
                  >
                    {t("foodLibrary.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending
                      ? t("foodLibrary.saving")
                      : t("foodLibrary.saveFood")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Drawer */}
      {editOpen && editingFood && (
        <>
          <div
            className={drawerOverlay}
            onClick={() => setEditOpen(false)}
            aria-hidden="true"
          />
          <div className={drawerPanel}>
            <form onSubmit={handleUpdate} className="flex flex-col h-full">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4 md:rounded-t-2xl">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {t("foodLibrary.editFood")}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label={t("foodLibrary.closeAria")}
                  title={t("foodLibrary.closeAria")}
                >
                  <X
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("foodLibrary.foodName")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] gap-4">
                  <BrandField
                    value={editForm.brand}
                    onChange={(v) => setEditForm((f) => ({ ...f, brand: v }))}
                    options={brandOptions}
                    onAddBrand={handleAddBrand}
                    t={t}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      {t("foodLibrary.category")}
                    </label>
                    <Select
                      value={editForm.category}
                      onValueChange={(v) =>
                        setEditForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {categoryLabel(t, c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("foodLibrary.baseIngredientName")}
                  </label>
                  <Input
                    placeholder={t("foodLibrary.baseNamePlaceholder")}
                    value={editForm.baseName}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, baseName: e.target.value }))
                    }
                  />
                </div>
                <fieldset className="space-y-4 rounded-xl border border-border p-4">
                  <legend className="text-sm font-semibold text-foreground px-1">
                    {t("foodLibrary.per100gNutrition")}
                  </legend>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        ["calories", t("foodLibrary.calories")],
                        ["protein", t("foodLibrary.proteinG")],
                        ["carbs", t("foodLibrary.carbsG")],
                        ["fat", t("foodLibrary.fatG")],
                        ["sugar", t("foodLibrary.sugarG")],
                        ["fiber", t("foodLibrary.fiberG")],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field} className="space-y-1.5">
                        <label className="block text-xs font-medium text-muted-foreground">
                          {label}
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editForm[field]}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              [field]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
                  <Info
                    className="size-4 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("foodLibrary.editNutritionHint")}
                  </p>
                </div>
              </div>
              <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4 md:rounded-b-2xl">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditOpen(false)}
                  >
                    {t("foodLibrary.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending
                      ? t("foodLibrary.updating")
                      : t("foodLibrary.updateFood")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* AI Parse Modal */}
      {aiOpen && (
        <>
          <div
            className={drawerOverlay}
            onClick={() => setAiOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                <Sparkles className="size-5 text-primary" />
                {t("foodLibrary.addWithAi")}
              </h2>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label={t("foodLibrary.closeAria")}
                title={t("foodLibrary.closeAria")}
              >
                <X className="size-5 text-muted-foreground" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleAiParse} className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <p className="text-sm text-muted-foreground">
                  {t("foodLibrary.aiDescribe")}
                </p>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    {t("foodLibrary.aiDescriptionLabel")}
                  </label>
                  <textarea
                    rows={5}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={t("foodLibrary.aiPlaceholder")}
                    disabled={parseMeal.isPending}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-none disabled:opacity-60"
                  />
                </div>
                {parseMeal.isPending && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <Loader className="size-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t("foodLibrary.aiAnalyzing")}
                    </p>
                  </div>
                )}
                {parseMeal.isError && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">
                      {t("foodLibrary.aiFailed")}
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
                    {t("foodLibrary.aiCancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    disabled={parseMeal.isPending || !aiInput.trim()}
                  >
                    {parseMeal.isPending ? (
                      <>
                        <Loader className="size-4 animate-spin" />
                        {t("foodLibrary.aiAnalyzingBtn")}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {t("foodLibrary.aiAnalyzeBtn")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
