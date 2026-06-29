import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple,
  ChevronDown,
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
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
import type { NutritionlibraryFoodItem } from "@/types/api";

const CATEGORIES = [
  "Meat",
  "Dairy",
  "Bakery",
  "Vegetable",
  "Fruit",
  "Grain",
  "Snack",
  "Beverage",
  "Other",
];

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
    category: item.foodCategory ?? "",
    calories: String(item.caloriePer100g),
    protein: String(item.proteinPer100g),
    carbs: String(item.carbohydratePer100g),
    fat: String(item.fatPer100g),
    sugar: String(item.sugarPer100g),
    fiber: String(item.fiberPer100g),
  };
}

export default function FoodLibraryPage() {
  const queryClient = useQueryClient();
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

  const items = data?.foodItems ?? [];
  const totalCount = data?.rowCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const createMutation = useCreateFoodItem();
  const updateMutation = useUpdateFoodItem();
  const deleteMutation = useDeleteFoodItem();

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
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.calories) return;
    createMutation.mutate(buildPayload(createForm), {
      onSuccess: () => {
        setCreateOpen(false);
        setCreateForm(EMPTY_FORM);
      },
    });
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
    if (!confirm("Delete this food item? This cannot be undone.")) return;
    deleteMutation.mutate(id);
  };

  const drawerOverlay = "fixed inset-0 z-50 bg-foreground/30";
  const drawerPanel =
    "fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col bg-background p-0 md:inset-y-4 md:right-4 md:ml-auto md:h-auto md:w-full md:max-w-lg md:rounded-2xl md:shadow-2xl";

  const renderFoodList = () => {
    if (isLoading && items.length === 0) {
      return (
        <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin mr-2" />
          Yükleniyor…
        </Card>
      );
    }
    if (items.length === 0) {
      return (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Henüz kütüphanede besin yok. Yeni bir besin eklemek için &quot;Add
          Food&quot; butonunu kullan.
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
                        {food.foodCategory}
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
                    {food.caloriePer100g} kcal · {food.proteinPer100g}g Protein
                    · {food.carbohydratePer100g}g Carbs per 100g
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Fat: {food.fatPer100g}g</span>
                    <span>Sugar: {food.sugarPer100g}g</span>
                    <span>Fiber: {food.fiberPer100g}g</span>
                    {food.brandName && <span>Brand: {food.brandName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(food)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                    aria-label={`Edit ${food.foodName}`}
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
                    aria-label={`Delete ${food.foodName}`}
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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Food Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal food items and nutrition per 100g.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 min-h-[44px] min-w-[44px]"
        >
          <Plus className="size-4" aria-hidden="true" /> Add Food
        </Button>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search foods..."
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
              {categoryFilter === "all" ? "All Categories" : categoryFilter}{" "}
              <ChevronDown className="size-3 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
                ? "All Sources"
                : sourceFilter === "manualEntry"
                  ? "Manual"
                  : "AI"}{" "}
              <ChevronDown className="size-3 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="manualEntry">Manual</SelectItem>
              <SelectItem value="aiAssistant">AI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderFoodList()}

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{items.length}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span>{" "}
          foods
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            aria-label="Next page"
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
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Add Food
                </h2>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
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
                    Food Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Oatmeal"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Brand
                    </label>
                    <Input
                      placeholder="e.g. Quaker"
                      value={createForm.brand}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, brand: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Category
                    </label>
                    <Select
                      value={createForm.category}
                      onValueChange={(v) =>
                        setCreateForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <fieldset className="space-y-4 rounded-xl border border-border p-4">
                  <legend className="text-sm font-semibold text-foreground px-1">
                    Per 100g Nutrition
                  </legend>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        ["calories", "Calories (kcal)"],
                        ["protein", "Protein (g)"],
                        ["carbs", "Carbs (g)"],
                        ["fat", "Fat (g)"],
                        ["sugar", "Sugar (g)"],
                        ["fiber", "Fiber (g)"],
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving…" : "Save Food"}
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
                  Edit Food
                </h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
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
                    Food Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Brand
                    </label>
                    <Input
                      value={editForm.brand}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, brand: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Category
                    </label>
                    <Select
                      value={editForm.category}
                      onValueChange={(v) =>
                        setEditForm((f) => ({ ...f, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <fieldset className="space-y-4 rounded-xl border border-border p-4">
                  <legend className="text-sm font-semibold text-foreground px-1">
                    Per 100g Nutrition
                  </legend>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        ["calories", "Calories (kcal)"],
                        ["protein", "Protein (g)"],
                        ["carbs", "Carbs (g)"],
                        ["fat", "Fat (g)"],
                        ["sugar", "Sugar (g)"],
                        ["fiber", "Fiber (g)"],
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
                    Editing nutrition values won&apos;t affect meal logs
                    you&apos;ve already created.
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving…" : "Update Food"}
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
