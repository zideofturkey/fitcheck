import { formatMacro } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  Trash,
  UtensilsCrossed,
  ClipboardList,
  Apple,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FlatPicker } from "@/components/ui/flat-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreateBrand,
  useDeleteBrand,
  useListBrands,
  useRenameBrand,
  useRestoreBrand,
} from "@/hooks/api/use-brand-admin";
import {
  useCreateCategory,
  useDeleteCategory,
  useListCategories,
  useRenameCategory,
  useRestoreCategory,
} from "@/hooks/api/use-category-admin";
import type { CategoryEntity } from "@/services/api/category-admin-api";
import {
  useCreateFoodItem,
  useCreatePresetMeal,
  useDeleteFoodItem,
  useDeletePresetMeal,
  useListFoodItems,
  useListPresetMeals,
  useUpdateFoodItem,
  useUpdatePresetMeal,
} from "@/hooks/api/use-nutritionlibrary";
import {
  useCreateDish,
  useDeleteDish,
  useListDishes,
  useUpdateDish,
} from "@/hooks/api/use-dish";
import { useBulkDeleteWithUndo } from "@/hooks/use-bulk-delete-with-undo";
import TrashDrawer from "@/components/admin-library/TrashDrawer";
import type { FoodItemWithBaseName } from "@/types/food-item-extensions";
import type { Dish } from "@/services/api/dish-api";
import type { NutritionlibraryPresetMeal } from "@/types/api";
import { CATEGORIES, categoryLabel } from "@/lib/food-category";
import { DISH_CATEGORIES, dishCategoryLabel } from "@/lib/dish-category";
import type {
  CreateFoodItemInputWithGlobal,
  CreatePresetMealInputWithGlobal,
} from "@/types/admin-create-extensions";

type PresetMealWithGlobal = NutritionlibraryPresetMeal & {
  isGlobal?: boolean;
  _archivedAt?: string;
};
type DishWithArchive = Dish & { _archivedAt?: string };
type FoodItemRow = FoodItemWithBaseName & { _archivedAt?: string };

function extractError(err: unknown, fallback: string) {
  return (err as { message?: string })?.message ?? fallback;
}

// ---------------------------------------------------------------------------
// Shared pagination: page-size selector + prev/next footer, plus a
// "select all visible" button placed under each tab's search bar. All 4
// tabs share this so behavior/positioning stays consistent.
// ---------------------------------------------------------------------------

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500] as const;

function SelectAllRow({
  visibleCount,
  selectedCount,
  onSelectAll,
  onClear,
}: {
  visibleCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  if (visibleCount === 0) return null;
  const allSelected = selectedCount === visibleCount;
  return (
    <div className="flex items-center">
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 text-muted-foreground"
        onClick={allSelected ? onClear : onSelectAll}
      >
        <Check className="w-3.5 h-3.5" />
        {allSelected
          ? t("adminLibrary.clearSelection")
          : t("adminLibrary.selectAllVisible", { count: visibleCount })}
      </Button>
    </div>
  );
}

function PaginationFooter({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  shownCount,
  totalCount,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  shownCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  if (totalCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {t("adminLibrary.showingCount", { shown: shownCount, total: totalCount })}
        </span>
        <FlatPicker
          className="w-[110px]"
          triggerClassName="h-8"
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
          options={PAGE_SIZE_OPTIONS.map((n) => ({
            value: String(n),
            label: t("adminLibrary.rowsPerPage", { count: n }),
          }))}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("adminLibrary.prevPage")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("adminLibrary.pageOf", { page, totalPages })}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("adminLibrary.nextPage")}
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared bulk-select toolbar
// ---------------------------------------------------------------------------

function SelectionToolbar({
  count,
  onClear,
  onDelete,
  deleteLabel,
  onEdit,
  editLabel,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  deleteLabel: string;
  onEdit?: () => void;
  editLabel?: string;
}) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
      <span className="text-sm font-medium">
        {t("adminLibrary.selectedCount", { count })}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onClear}>
          {t("adminLibrary.clearSelection")}
        </Button>
        {onEdit && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
            {editLabel ?? t("common.edit")}
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              {deleteLabel}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("adminLibrary.bulkDeleteConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("adminLibrary.bulkDeleteConfirmDesc", { count })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={onDelete}
              >
                {deleteLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Food items tab
// ---------------------------------------------------------------------------

const EMPTY_ADMIN_FOOD_FORM = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  sugar: "",
  fiber: "",
  category: "",
  brand: "",
  baseName: "",
};

function FoodItemsTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trashOpen, setTrashOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItemRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editForm, setEditForm] = useState(EMPTY_ADMIN_FOOD_FORM);
  const [addOpen, setAddOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_ADMIN_FOOD_FORM);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkBrand, setBulkBrand] = useState("");
  const [bulkBaseName, setBulkBaseName] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const { data, isLoading, refetch } = useListFoodItems({
    ownershipFilter: "global",
    searchTerm: search || undefined,
    pageNumber: page,
    pageRowCount: pageSize,
  });
  const deleteMutation = useDeleteFoodItem();
  const updateMutation = useUpdateFoodItem();
  const createMutation = useCreateFoodItem();
  const { runDelete } = useBulkDeleteWithUndo("fooditem");

  const items = (data?.foodItems ?? []) as FoodItemRow[];
  const totalCount = data?.paging?.totalRowCount ?? data?.rowCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openEdit = (item: FoodItemRow) => {
    setEditing(item);
    setEditForm({
      name: item.foodName,
      calories: String(item.caloriePer100g),
      protein: String(item.proteinPer100g),
      carbs: String(item.carbohydratePer100g),
      fat: String(item.fatPer100g),
      sugar: String(item.sugarPer100g),
      fiber: String(item.fiberPer100g),
      category: item.foodCategory ?? "",
      brand: item.brandName ?? "",
      baseName: item.baseName ?? "",
    });
  };

  const openAdd = () => {
    setCreateForm(EMPTY_ADMIN_FOOD_FORM);
    setAddOpen(true);
  };

  const handleAdd = () => {
    if (!createForm.name.trim() || !createForm.category) return;
    const payload: CreateFoodItemInputWithGlobal = {
      foodName: createForm.name,
      caloriePer100g: Number(createForm.calories) || 0,
      proteinPer100g: Number(createForm.protein) || 0,
      carbohydratePer100g: Number(createForm.carbs) || 0,
      fatPer100g: Number(createForm.fat) || 0,
      sugarPer100g: Number(createForm.sugar) || 0,
      fiberPer100g: Number(createForm.fiber) || 0,
      foodCategory: createForm.category,
      brandName: createForm.brand || undefined,
      baseName: createForm.baseName || undefined,
      creationSource: "manualEntry" as const,
      isGlobal: true,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("adminLibrary.addFoodItemSuccess", { name: createForm.name }));
        setAddOpen(false);
        setCreateForm(EMPTY_ADMIN_FOOD_FORM);
      },
      onError: (err) => toast.error(extractError(err, t("adminLibrary.addFoodItemError"))),
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    const data = {
      foodName: editForm.name,
      caloriePer100g: Number(editForm.calories) || 0,
      proteinPer100g: Number(editForm.protein) || 0,
      carbohydratePer100g: Number(editForm.carbs) || 0,
      fatPer100g: Number(editForm.fat) || 0,
      sugarPer100g: Number(editForm.sugar) || 0,
      fiberPer100g: Number(editForm.fiber) || 0,
      foodCategory: editForm.category || undefined,
      brandName: editForm.brand || undefined,
      // baseName isn't in the generated UpdateFoodItemInput type (added
      // outside the Mindbricks spec) - kept out of a typed literal here so
      // TS's excess-property check doesn't fire; the backend accepts it.
      baseName: editForm.baseName || undefined,
    };
    updateMutation.mutate(
      { foodItemId: editing.id, data },
      {
        onSuccess: () => {
          toast.success(t("adminLibrary.saveSuccess"));
          setEditing(null);
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.saveError"))),
      },
    );
  };

  const handleDeleteOne = (id: string) => runDelete([id], (i) => deleteMutation.mutateAsync(i));
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    setSelected(new Set());
    await runDelete(ids, (i) => deleteMutation.mutateAsync(i));
  };

  const openBulkEdit = () => {
    setBulkCategory("");
    setBulkBrand("");
    setBulkBaseName("");
    setBulkEditOpen(true);
  };

  const applyBulkEdit = async () => {
    if (!bulkCategory && !bulkBrand && !bulkBaseName) return;
    const ids = Array.from(selected);
    setSelected(new Set());
    setBulkEditOpen(false);
    const patch: { foodCategory?: string; brandName?: string; baseName?: string } = {};
    if (bulkCategory) patch.foodCategory = bulkCategory;
    if (bulkBrand) patch.brandName = bulkBrand;
    if (bulkBaseName) patch.baseName = bulkBaseName;
    const results = await Promise.allSettled(
      ids.map((foodItemId) => updateMutation.mutateAsync({ foodItemId, data: patch })),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = ids.length - succeeded;
    if (succeeded > 0) toast.success(t("adminLibrary.bulkEditSuccess", { count: succeeded }));
    if (failed > 0) toast.error(t("adminLibrary.bulkEditFailed", { count: failed }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("adminLibrary.searchFoodItems")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setTrashOpen(true)}
          title={t("adminLibrary.trashTitle")}
        >
          <Trash className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          {t("adminLibrary.addFoodItem")}
        </Button>
      </div>

      <SelectAllRow
        visibleCount={items.length}
        selectedCount={selected.size}
        onSelectAll={() => setSelected(new Set(items.map((i) => i.id)))}
        onClear={() => setSelected(new Set())}
      />

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={handleBulkDelete}
        deleteLabel={t("adminLibrary.deleteSelected")}
        onEdit={openBulkEdit}
        editLabel={t("adminLibrary.editSelected")}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("common.loading")}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Apple className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t("adminLibrary.emptyFoodItems")}</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <Checkbox
              checked={selected.has(item.id)}
              onCheckedChange={() => toggle(item.id)}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {item.foodName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatMacro(item.caloriePer100g)} kcal · P{formatMacro(item.proteinPer100g)} K
                {formatMacro(item.carbohydratePer100g)} Y{formatMacro(item.fatPer100g)}{" "}
                {item.brandName ? `· ${item.brandName}` : ""}
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => openEdit(item)}>
              <Pencil className="w-3.5 h-3.5" />
              {t("common.edit")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("adminLibrary.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("adminLibrary.deleteConfirmDesc", { name: item.foodName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteOne(item.id)}
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        shownCount={items.length}
        totalCount={totalCount}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.addFoodItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("foodLibrary.foodName")}
            />
            <div className="grid grid-cols-3 gap-2">
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
                <div key={field} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input
                    type="number"
                    value={createForm[field]}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("foodLibrary.category")} *
                </label>
                <FlatPicker
                  value={createForm.category}
                  onValueChange={(v) =>
                    setCreateForm((f) => ({ ...f, category: v }))
                  }
                  options={CATEGORIES.map((c) => ({
                    value: c,
                    label: categoryLabel(t, c),
                  }))}
                  placeholder={t("foodLibrary.selectEllipsis")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("foodLibrary.brand")}
                </label>
                <Input
                  value={createForm.brand}
                  onChange={(e) => setCreateForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder={t("foodLibrary.newBrandPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("foodLibrary.baseIngredientName")}
              </label>
              <Input
                value={createForm.baseName}
                onChange={(e) => setCreateForm((f) => ({ ...f, baseName: e.target.value }))}
                placeholder={t("foodLibrary.baseNamePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                createMutation.isPending || !createForm.name.trim() || !createForm.category
              }
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.editFoodItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("foodLibrary.foodName")}
            />
            <div className="grid grid-cols-3 gap-2">
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
                <div key={field} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <Input
                    type="number"
                    value={editForm[field]}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("foodLibrary.category")}
                </label>
                <FlatPicker
                  value={editForm.category}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, category: v }))
                  }
                  options={[
                    { value: "", label: t("foodLibrary.noCategory") },
                    ...CATEGORIES.map((c) => ({
                      value: c,
                      label: categoryLabel(t, c),
                    })),
                  ]}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("foodLibrary.brand")}
                </label>
                <Input
                  value={editForm.brand}
                  onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder={t("foodLibrary.newBrandPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("foodLibrary.baseIngredientName")}
              </label>
              <Input
                value={editForm.baseName}
                onChange={(e) => setEditForm((f) => ({ ...f, baseName: e.target.value }))}
                placeholder={t("foodLibrary.baseNamePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1.5">
              <Check className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.bulkEditTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminLibrary.bulkEditDesc", { count: selected.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("foodLibrary.category")}
              </label>
              <FlatPicker
                value={bulkCategory}
                onValueChange={setBulkCategory}
                options={CATEGORIES.map((c) => ({
                  value: c,
                  label: categoryLabel(t, c),
                }))}
                placeholder={t("adminLibrary.bulkEditFieldSkip")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("foodLibrary.brand")}
              </label>
              <Input
                value={bulkBrand}
                onChange={(e) => setBulkBrand(e.target.value)}
                placeholder={t("adminLibrary.bulkEditFieldSkip")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("foodLibrary.baseIngredientName")}
              </label>
              <Input
                value={bulkBaseName}
                onChange={(e) => setBulkBaseName(e.target.value)}
                placeholder={t("adminLibrary.bulkEditFieldSkip")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={applyBulkEdit}
              disabled={
                updateMutation.isPending ||
                (!bulkCategory && !bulkBrand && !bulkBaseName)
              }
              className="gap-1.5"
            >
              <Check className="w-4 h-4" />
              {t("adminLibrary.applyToCount", { count: selected.size })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrashDrawer<FoodItemRow>
        type="fooditem"
        open={trashOpen}
        onOpenChange={setTrashOpen}
        getTitle={(i) => i.foodName}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dishes tab
// ---------------------------------------------------------------------------

function DishesTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trashOpen, setTrashOpen] = useState(false);
  const [editing, setEditing] = useState<DishWithArchive | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "" });
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", category: "" });

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const { data, isLoading, refetch } = useListDishes({
    ownershipFilter: "global",
    searchTerm: search || undefined,
    pageNumber: page,
    pageRowCount: pageSize,
  });
  const deleteMutation = useDeleteDish();
  const updateMutation = useUpdateDish();
  const createMutation = useCreateDish();
  const { runDelete } = useBulkDeleteWithUndo("dish");

  const items = (data?.dishes ?? []) as DishWithArchive[];
  const totalCount = data?.paging?.totalRowCount ?? data?.rowCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openEdit = (item: DishWithArchive) => {
    setEditing(item);
    setEditForm({
      name: item.dishName,
      description: item.descriptionText ?? "",
      category: item.dishCategory ?? "",
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate(
      {
        dishId: editing.id,
        data: {
          dishName: editForm.name,
          descriptionText: editForm.description || undefined,
          dishCategory: editForm.category || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("adminLibrary.saveSuccess"));
          setEditing(null);
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.saveError"))),
      },
    );
  };

  const handleDeleteOne = (id: string) => runDelete([id], (i) => deleteMutation.mutateAsync(i));
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    setSelected(new Set());
    await runDelete(ids, (i) => deleteMutation.mutateAsync(i));
  };

  const openBulkEdit = () => {
    setBulkCategory("");
    setBulkEditOpen(true);
  };

  const applyBulkEdit = async () => {
    if (!bulkCategory) return;
    const ids = Array.from(selected);
    setSelected(new Set());
    setBulkEditOpen(false);
    const results = await Promise.allSettled(
      ids.map((dishId) =>
        updateMutation.mutateAsync({ dishId, data: { dishCategory: bulkCategory } }),
      ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = ids.length - succeeded;
    if (succeeded > 0) toast.success(t("adminLibrary.bulkEditSuccess", { count: succeeded }));
    if (failed > 0) toast.error(t("adminLibrary.bulkEditFailed", { count: failed }));
  };

  const openAdd = () => {
    setCreateForm({ name: "", description: "", category: "" });
    setAddOpen(true);
  };

  const handleAdd = () => {
    if (!createForm.name.trim() || !createForm.category) return;
    createMutation.mutate(
      {
        dishName: createForm.name,
        descriptionText: createForm.description || undefined,
        dishCategory: createForm.category,
        isGlobal: true,
      },
      {
        onSuccess: () => {
          toast.success(t("adminLibrary.addDishSuccess", { name: createForm.name }));
          setAddOpen(false);
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.addDishError"))),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("adminLibrary.searchDishes")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTrashOpen(true)}>
          <Trash className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          {t("adminLibrary.addDish")}
        </Button>
      </div>

      <SelectAllRow
        visibleCount={items.length}
        selectedCount={selected.size}
        onSelectAll={() => setSelected(new Set(items.map((i) => i.id)))}
        onClear={() => setSelected(new Set())}
      />

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={handleBulkDelete}
        deleteLabel={t("adminLibrary.deleteSelected")}
        onEdit={openBulkEdit}
        editLabel={t("adminLibrary.editSelected")}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("common.loading")}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <UtensilsCrossed className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t("adminLibrary.emptyDishes")}</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.dishName}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(item.totalCalories)} kcal
                {item.dishCategory ? ` · ${item.dishCategory}` : ""}
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => openEdit(item)}>
              <Pencil className="w-3.5 h-3.5" />
              {t("common.edit")}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" asChild>
              <Link to={`/dishes/${item.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                {t("adminLibrary.editComposition")}
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("adminLibrary.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("adminLibrary.deleteConfirmDesc", { name: item.dishName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteOne(item.id)}
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        shownCount={items.length}
        totalCount={totalCount}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.addDish")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("dishes.nameLabel")}
            />
            <Input
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t("dishes.descriptionLabel")}
            />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("dishes.categoryLabel")} *
              </label>
              <FlatPicker
                value={createForm.category}
                onValueChange={(v) =>
                  setCreateForm((f) => ({ ...f, category: v }))
                }
                options={DISH_CATEGORIES.map((c) => ({
                  value: c,
                  label: dishCategoryLabel(t, c),
                }))}
                placeholder={t("dishes.categoryPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                createMutation.isPending || !createForm.name.trim() || !createForm.category
              }
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.editDish")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("dishes.nameLabel")}
            />
            <Input
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t("dishes.descriptionLabel")}
            />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("dishes.categoryLabel")}
              </label>
              <FlatPicker
                value={editForm.category}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, category: v }))
                }
                options={[
                  { value: "", label: t("dishes.noCategory") },
                  ...DISH_CATEGORIES.map((c) => ({
                    value: c,
                    label: dishCategoryLabel(t, c),
                  })),
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminLibrary.editCompositionHint")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1.5">
              <Check className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.bulkEditTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminLibrary.bulkEditDesc", { count: selected.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("dishes.categoryLabel")}
            </label>
            <FlatPicker
              value={bulkCategory}
              onValueChange={setBulkCategory}
              options={DISH_CATEGORIES.map((c) => ({
                value: c,
                label: dishCategoryLabel(t, c),
              }))}
              placeholder={t("dishes.categoryPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={applyBulkEdit}
              disabled={updateMutation.isPending || !bulkCategory}
              className="gap-1.5"
            >
              <Check className="w-4 h-4" />
              {t("adminLibrary.applyToCount", { count: selected.size })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrashDrawer<DishWithArchive>
        type="dish"
        open={trashOpen}
        onOpenChange={setTrashOpen}
        getTitle={(i) => i.dishName}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset meals tab
// ---------------------------------------------------------------------------

function PresetMealsTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trashOpen, setTrashOpen] = useState(false);
  const [editing, setEditing] = useState<PresetMealWithGlobal | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "" });
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", category: "" });

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const { data, isLoading, refetch } = useListPresetMeals({
    ownershipFilter: "global",
    searchTerm: search || undefined,
    pageNumber: page,
    pageRowCount: pageSize,
  });
  const deleteMutation = useDeletePresetMeal();
  const updateMutation = useUpdatePresetMeal();
  const createMutation = useCreatePresetMeal();
  const { runDelete } = useBulkDeleteWithUndo("presetmeal");

  const items = (data?.presetMeals ?? []) as PresetMealWithGlobal[];
  const totalCount = data?.paging?.totalRowCount ?? data?.rowCount ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openEdit = (item: PresetMealWithGlobal) => {
    setEditing(item);
    setEditForm({
      name: item.templateName,
      description: item.descriptionText ?? "",
      category: item.presetCategory ?? "",
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate(
      {
        presetMealId: editing.id,
        data: {
          templateName: editForm.name,
          descriptionText: editForm.description || undefined,
          presetCategory: editForm.category || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("adminLibrary.saveSuccess"));
          setEditing(null);
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.saveError"))),
      },
    );
  };

  const handleDeleteOne = (id: string) => runDelete([id], (i) => deleteMutation.mutateAsync(i));
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    setSelected(new Set());
    await runDelete(ids, (i) => deleteMutation.mutateAsync(i));
  };

  const openBulkEdit = () => {
    setBulkCategory("");
    setBulkEditOpen(true);
  };

  const applyBulkEdit = async () => {
    if (!bulkCategory) return;
    const ids = Array.from(selected);
    setSelected(new Set());
    setBulkEditOpen(false);
    const results = await Promise.allSettled(
      ids.map((presetMealId) =>
        updateMutation.mutateAsync({
          presetMealId,
          data: { presetCategory: bulkCategory },
        }),
      ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = ids.length - succeeded;
    if (succeeded > 0) toast.success(t("adminLibrary.bulkEditSuccess", { count: succeeded }));
    if (failed > 0) toast.error(t("adminLibrary.bulkEditFailed", { count: failed }));
  };

  const openAdd = () => {
    setCreateForm({ name: "", description: "", category: "" });
    setAddOpen(true);
  };

  const handleAdd = () => {
    if (!createForm.name.trim() || !createForm.category) return;
    const payload: CreatePresetMealInputWithGlobal = {
      templateName: createForm.name,
      descriptionText: createForm.description || undefined,
      presetCategory: createForm.category,
      isGlobal: true,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("adminLibrary.addPresetMealSuccess", { name: createForm.name }));
        setAddOpen(false);
      },
      onError: (err) => toast.error(extractError(err, t("adminLibrary.addPresetMealError"))),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("adminLibrary.searchPresetMeals")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTrashOpen(true)}>
          <Trash className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          {t("adminLibrary.addPresetMeal")}
        </Button>
      </div>

      <SelectAllRow
        visibleCount={items.length}
        selectedCount={selected.size}
        onSelectAll={() => setSelected(new Set(items.map((i) => i.id)))}
        onClear={() => setSelected(new Set())}
      />

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={handleBulkDelete}
        deleteLabel={t("adminLibrary.deleteSelected")}
        onEdit={openBulkEdit}
        editLabel={t("adminLibrary.editSelected")}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("common.loading")}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <ClipboardList className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t("adminLibrary.emptyPresetMeals")}</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.templateName}</p>
              <p className="text-xs text-muted-foreground">{Math.round(item.totalCalories)} kcal</p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => openEdit(item)}>
              <Pencil className="w-3.5 h-3.5" />
              {t("common.edit")}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" asChild>
              <Link to={`/preset-meals/${item.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                {t("adminLibrary.editComposition")}
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("adminLibrary.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("adminLibrary.deleteConfirmDesc", { name: item.templateName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteOne(item.id)}
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        shownCount={items.length}
        totalCount={totalCount}
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.addPresetMeal")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("presetMeals.name")}
            />
            <Input
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t("presetMeals.description")}
            />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("dishes.categoryLabel")} *
              </label>
              <FlatPicker
                value={createForm.category}
                onValueChange={(v) =>
                  setCreateForm((f) => ({ ...f, category: v }))
                }
                options={DISH_CATEGORIES.map((c) => ({
                  value: c,
                  label: dishCategoryLabel(t, c),
                }))}
                placeholder={t("dishes.categoryPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                createMutation.isPending || !createForm.name.trim() || !createForm.category
              }
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.editPresetMeal")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("presetMeals.name")}
            />
            <Input
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t("presetMeals.description")}
            />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("dishes.categoryLabel")}
              </label>
              <FlatPicker
                value={editForm.category}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, category: v }))
                }
                options={[
                  { value: "", label: t("dishes.noCategory") },
                  ...DISH_CATEGORIES.map((c) => ({
                    value: c,
                    label: dishCategoryLabel(t, c),
                  })),
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("adminLibrary.editCompositionHint")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1.5">
              <Check className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.bulkEditTitle")}</DialogTitle>
            <DialogDescription>
              {t("adminLibrary.bulkEditDesc", { count: selected.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t("dishes.categoryLabel")}
            </label>
            <FlatPicker
              value={bulkCategory}
              onValueChange={setBulkCategory}
              options={DISH_CATEGORIES.map((c) => ({
                value: c,
                label: dishCategoryLabel(t, c),
              }))}
              placeholder={t("dishes.categoryPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={applyBulkEdit}
              disabled={updateMutation.isPending || !bulkCategory}
              className="gap-1.5"
            >
              <Check className="w-4 h-4" />
              {t("adminLibrary.applyToCount", { count: selected.size })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrashDrawer<PresetMealWithGlobal>
        type="presetmeal"
        open={trashOpen}
        onOpenChange={setTrashOpen}
        getTitle={(i) => i.templateName}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brands tab (existing rename/delete logic + added bulk-select/bulk-delete)
// ---------------------------------------------------------------------------

interface DeletedBrandEntry {
  brandName: string;
  ids: string[];
  deletedAt: string;
  wasPlaceholder?: boolean;
}

function BrandsTab() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useListBrands();
  const createMutation = useCreateBrand();
  const renameMutation = useRenameBrand();
  const deleteMutation = useDeleteBrand();
  const restoreMutation = useRestoreBrand();

  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [trashOpen, setTrashOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // Session-only "trash": brand deletion doesn't soft-delete a record (there
  // is no brand row, just a field cleared on N foodItems), so there is no
  // 14-day _archivedAt to list from the server like the other three tabs -
  // this just remembers what THIS session cleared so it can be undone.
  const [deletedBrands, setDeletedBrands] = useState<DeletedBrandEntry[]>([]);

  const allBrands = data?.brands ?? [];
  const brands = search
    ? allBrands.filter((b) =>
        b.brandName.toLowerCase().includes(search.toLowerCase()),
      )
    : allBrands;

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const totalCount = brands.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedBrands = useMemo(
    () => brands.slice((page - 1) * pageSize, page * pageSize),
    [brands, page, pageSize],
  );

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const startEdit = (brandName: string) => {
    setEditingBrand(brandName);
    setDraftName(brandName);
  };
  const cancelEdit = () => {
    setEditingBrand(null);
    setDraftName("");
  };
  const saveEdit = (oldName: string) => {
    const newName = draftName.trim();
    if (!newName || newName === oldName) {
      cancelEdit();
      return;
    }
    renameMutation.mutate(
      { oldName, newName },
      {
        onSuccess: (res) => {
          toast.success(t("adminBrands.renameSuccess", { count: res.updatedCount, name: res.newName }));
          cancelEdit();
        },
        onError: (err) => toast.error(extractError(err, t("adminBrands.renameError"))),
      },
    );
  };

  const recordDeleted = (entry: DeletedBrandEntry) => {
    setDeletedBrands((prev) => [entry, ...prev]);
  };

  const restoreBrand = (entry: DeletedBrandEntry) => {
    restoreMutation.mutate(
      {
        brandName: entry.brandName,
        ids: entry.ids,
        wasPlaceholder: entry.wasPlaceholder,
      },
      {
        onSuccess: (res) => {
          toast.success(
            t("adminLibrary.restoreBulkSuccess", { count: res.restoredCount || 1 }),
          );
          setDeletedBrands((prev) =>
            prev.filter(
              (d) =>
                !(d.brandName === entry.brandName && d.deletedAt === entry.deletedAt),
            ),
          );
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.restoreError"))),
      },
    );
  };

  const handleAdd = () => {
    const brandName = newBrandName.trim();
    if (!brandName) return;
    createMutation.mutate(
      { brandName },
      {
        onSuccess: () => {
          toast.success(t("adminLibrary.addBrandSuccess", { name: brandName }));
          setNewBrandName("");
          setAddOpen(false);
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.addBrandError"))),
      },
    );
  };

  const handleDelete = (brandName: string) => {
    deleteMutation.mutate(brandName, {
      onSuccess: (res) => {
        toast.success(t("adminBrands.deleteSuccess", { count: res.clearedCount }));
        const entry: DeletedBrandEntry = {
          brandName,
          ids: res.clearedIds,
          deletedAt: new Date().toISOString(),
          wasPlaceholder: res.wasPlaceholder,
        };
        recordDeleted(entry);
        toast(t("adminLibrary.deletedToast", { count: 1 }), {
          position: "bottom-left",
          action: { label: t("adminLibrary.undo"), onClick: () => restoreBrand(entry) },
        });
      },
      onError: (err) => toast.error(extractError(err, t("adminBrands.deleteError"))),
    });
  };

  const handleBulkDelete = async () => {
    const names = Array.from(selected);
    setSelected(new Set());
    const results = await Promise.allSettled(
      names.map((n) => deleteMutation.mutateAsync(n)),
    );
    const newEntries: DeletedBrandEntry[] = [];
    const deletedAt = new Date().toISOString();
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        newEntries.push({ brandName: names[i], ids: r.value.clearedIds, deletedAt });
      }
    });
    if (newEntries.length > 0) {
      setDeletedBrands((prev) => [...newEntries, ...prev]);
      toast.success(t("adminLibrary.brandsBulkDeleteSuccess", { count: newEntries.length }));
      toast(t("adminLibrary.deletedToast", { count: newEntries.length }), {
        position: "bottom-left",
        action: {
          label: t("adminLibrary.undo"),
          onClick: () => newEntries.forEach((entry) => restoreBrand(entry)),
        },
      });
    }
    const failCount = names.length - newEntries.length;
    if (failCount > 0) {
      toast.error(t("adminLibrary.deleteFailedToast", { count: failCount }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("adminLibrary.searchBrands")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setTrashOpen(true)}
          title={t("adminLibrary.trashTitle")}
        >
          <Trash className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          {t("adminLibrary.addBrand")}
        </Button>
      </div>

      <SelectAllRow
        visibleCount={pagedBrands.length}
        selectedCount={selected.size}
        onSelectAll={() => setSelected(new Set(pagedBrands.map((b) => b.brandName)))}
        onClear={() => setSelected(new Set())}
      />

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={handleBulkDelete}
        deleteLabel={t("adminLibrary.deleteSelected")}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("adminBrands.loading")}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {t("adminBrands.loadError")}
        </div>
      )}

      {!isLoading && !error && brands.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Tag className="w-8 h-8 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">{t("adminBrands.emptyTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">{t("adminBrands.emptyDesc")}</p>
        </div>
      )}

      {!isLoading && !error && brands.length > 0 && (
        <div className="space-y-2">
          {pagedBrands.map((b) => (
            <div key={b.brandName} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              {editingBrand === b.brandName ? (
                <>
                  <Input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit(b.brandName);
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1"
                  />
                  <Button size="sm" className="gap-1.5 shrink-0" disabled={renameMutation.isPending} onClick={() => saveEdit(b.brandName)}>
                    <Check className="w-4 h-4" aria-hidden />
                    {t("common.save")}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5 shrink-0" onClick={cancelEdit}>
                    <X className="w-4 h-4" aria-hidden />
                    {t("common.cancel")}
                  </Button>
                </>
              ) : (
                <>
                  <Checkbox checked={selected.has(b.brandName)} onCheckedChange={() => toggle(b.brandName)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{b.brandName}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {t("adminBrands.itemCount", { count: b.itemCount })}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => startEdit(b.brandName)}>
                    <Pencil className="w-4 h-4" aria-hidden />
                    {t("adminBrands.rename")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 shrink-0 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" aria-hidden />
                        {t("adminBrands.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("adminBrands.deleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("adminBrands.deleteConfirmDesc", { name: b.brandName, count: b.itemCount })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(b.brandName)}
                        >
                          {t("adminBrands.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        shownCount={pagedBrands.length}
        totalCount={totalCount}
      />

      <Sheet open={trashOpen} onOpenChange={setTrashOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {t("adminLibrary.trashTitle")}
            </SheetTitle>
          </SheetHeader>
          <p className="px-4 text-xs text-muted-foreground">
            {t("adminLibrary.brandTrashHint")}
          </p>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {deletedBrands.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("adminLibrary.trashEmpty")}
              </p>
            )}
            {deletedBrands.map((entry) => (
              <div
                key={`${entry.brandName}-${entry.deletedAt}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.brandName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("adminLibrary.deletedAt", {
                      date: new Date(entry.deletedAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 shrink-0"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreBrand(entry)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("adminLibrary.restore")}
                </Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.addBrand")}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={t("foodLibrary.newBrandPlaceholder")}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending || !newBrandName.trim()}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Categories tab (mirrors BrandsTab exactly, parameterized by entity - food/
// dish/preset categories are separate value spaces/columns, so rename/delete
// only ever touch one entity at a time; a switcher picks which)
// ---------------------------------------------------------------------------

interface DeletedCategoryEntry {
  category: string;
  ids: string[];
  deletedAt: string;
  wasPlaceholder?: boolean;
}

function CategoriesTab() {
  const { t } = useTranslation();
  const [entity, setEntity] = useState<CategoryEntity>("food");
  const { data, isLoading, error, refetch } = useListCategories(entity);
  const createMutation = useCreateCategory();
  const renameMutation = useRenameCategory();
  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [trashOpen, setTrashOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // Session-only "trash", same as BrandsTab - category deletion clears a
  // field on N rows rather than soft-deleting a record, so there's no
  // server-side _archivedAt list to restore from.
  const [deletedByEntity, setDeletedByEntity] = useState<
    Record<CategoryEntity, DeletedCategoryEntry[]>
  >({ food: [], dish: [], preset: [] });
  const deletedCategories = deletedByEntity[entity];

  const allCategories = data?.categories ?? [];
  const categories = search
    ? allCategories.filter((c) =>
        c.category.toLowerCase().includes(search.toLowerCase()),
      )
    : allCategories;

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, pageSize, entity]);

  const totalCount = categories.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedCategories = useMemo(
    () => categories.slice((page - 1) * pageSize, page * pageSize),
    [categories, page, pageSize],
  );

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setDraftName(category);
  };
  const cancelEdit = () => {
    setEditingCategory(null);
    setDraftName("");
  };
  const saveEdit = (oldName: string) => {
    const newName = draftName.trim();
    if (!newName || newName === oldName) {
      cancelEdit();
      return;
    }
    renameMutation.mutate(
      { entity, oldName, newName },
      {
        onSuccess: (res) => {
          toast.success(
            t("adminCategories.renameSuccess", {
              count: res.updatedCount,
              name: res.newName,
            }),
          );
          cancelEdit();
        },
        onError: (err) =>
          toast.error(extractError(err, t("adminCategories.renameError"))),
      },
    );
  };

  const recordDeleted = (entry: DeletedCategoryEntry) => {
    setDeletedByEntity((prev) => ({
      ...prev,
      [entity]: [entry, ...prev[entity]],
    }));
  };

  const restoreCategory = (entry: DeletedCategoryEntry) => {
    restoreMutation.mutate(
      {
        entity,
        category: entry.category,
        ids: entry.ids,
        wasPlaceholder: entry.wasPlaceholder,
      },
      {
        onSuccess: (res) => {
          toast.success(
            t("adminLibrary.restoreBulkSuccess", { count: res.restoredCount || 1 }),
          );
          setDeletedByEntity((prev) => ({
            ...prev,
            [entity]: prev[entity].filter(
              (d) =>
                !(d.category === entry.category && d.deletedAt === entry.deletedAt),
            ),
          }));
        },
        onError: (err) =>
          toast.error(extractError(err, t("adminLibrary.restoreError"))),
      },
    );
  };

  const openAdd = () => {
    setNewCategoryName("");
    setAddOpen(true);
  };

  const handleAdd = () => {
    const category = newCategoryName.trim();
    if (!category) return;
    createMutation.mutate(
      { entity, category },
      {
        onSuccess: () => {
          toast.success(t("adminLibrary.addCategorySuccess", { name: category }));
          setNewCategoryName("");
          setAddOpen(false);
        },
        onError: (err) => toast.error(extractError(err, t("adminLibrary.addCategoryError"))),
      },
    );
  };

  const handleDelete = (category: string) => {
    deleteMutation.mutate(
      { entity, category },
      {
        onSuccess: (res) => {
          toast.success(
            t("adminCategories.deleteSuccess", { count: res.clearedCount }),
          );
          const entry: DeletedCategoryEntry = {
            category,
            ids: res.clearedIds,
            deletedAt: new Date().toISOString(),
            wasPlaceholder: res.wasPlaceholder,
          };
          recordDeleted(entry);
          toast(t("adminLibrary.deletedToast", { count: 1 }), {
            position: "bottom-left",
            action: {
              label: t("adminLibrary.undo"),
              onClick: () => restoreCategory(entry),
            },
          });
        },
        onError: (err) =>
          toast.error(extractError(err, t("adminCategories.deleteError"))),
      },
    );
  };

  const handleBulkDelete = async () => {
    const names = Array.from(selected);
    setSelected(new Set());
    const results = await Promise.allSettled(
      names.map((n) => deleteMutation.mutateAsync({ entity, category: n })),
    );
    const newEntries: DeletedCategoryEntry[] = [];
    const deletedAt = new Date().toISOString();
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        newEntries.push({ category: names[i], ids: r.value.clearedIds, deletedAt });
      }
    });
    if (newEntries.length > 0) {
      setDeletedByEntity((prev) => ({
        ...prev,
        [entity]: [...newEntries, ...prev[entity]],
      }));
      toast.success(
        t("adminLibrary.brandsBulkDeleteSuccess", { count: newEntries.length }),
      );
      toast(t("adminLibrary.deletedToast", { count: newEntries.length }), {
        position: "bottom-left",
        action: {
          label: t("adminLibrary.undo"),
          onClick: () => newEntries.forEach((entry) => restoreCategory(entry)),
        },
      });
    }
    const failCount = names.length - newEntries.length;
    if (failCount > 0) {
      toast.error(t("adminLibrary.deleteFailedToast", { count: failCount }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlatPicker
          className="w-[180px]"
          value={entity}
          onValueChange={(v) => setEntity(v as CategoryEntity)}
          options={[
            { value: "food", label: t("adminCategories.entityFood") },
            { value: "dish", label: t("adminCategories.entityDish") },
            { value: "preset", label: t("adminCategories.entityPreset") },
          ]}
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("adminLibrary.searchCategories")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="w-3.5 h-3.5" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setTrashOpen(true)}
          title={t("adminLibrary.trashTitle")}
        >
          <Trash className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" />
          {t("adminLibrary.addCategory")}
        </Button>
      </div>

      <SelectAllRow
        visibleCount={pagedCategories.length}
        selectedCount={selected.size}
        onSelectAll={() => setSelected(new Set(pagedCategories.map((c) => c.category)))}
        onClear={() => setSelected(new Set())}
      />

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onDelete={handleBulkDelete}
        deleteLabel={t("adminLibrary.deleteSelected")}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("adminCategories.loading")}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {t("adminCategories.loadError")}
        </div>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Tag className="w-8 h-8 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">{t("adminCategories.emptyTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {t("adminCategories.emptyDesc")}
          </p>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <div className="space-y-2">
          {pagedCategories.map((c) => (
            <div key={c.category} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              {editingCategory === c.category ? (
                <>
                  <Input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit(c.category);
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1"
                  />
                  <Button size="sm" className="gap-1.5 shrink-0" disabled={renameMutation.isPending} onClick={() => saveEdit(c.category)}>
                    <Check className="w-4 h-4" aria-hidden />
                    {t("common.save")}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5 shrink-0" onClick={cancelEdit}>
                    <X className="w-4 h-4" aria-hidden />
                    {t("common.cancel")}
                  </Button>
                </>
              ) : (
                <>
                  <Checkbox checked={selected.has(c.category)} onCheckedChange={() => toggle(c.category)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.category}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {t("adminCategories.itemCount", { count: c.itemCount })}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => startEdit(c.category)}>
                    <Pencil className="w-4 h-4" aria-hidden />
                    {t("adminCategories.rename")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 shrink-0 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" aria-hidden />
                        {t("adminCategories.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("adminCategories.deleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("adminCategories.deleteConfirmDesc", { name: c.category, count: c.itemCount })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(c.category)}
                        >
                          {t("adminCategories.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        shownCount={pagedCategories.length}
        totalCount={totalCount}
      />

      <Sheet open={trashOpen} onOpenChange={setTrashOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {t("adminLibrary.trashTitle")}
            </SheetTitle>
          </SheetHeader>
          <p className="px-4 text-xs text-muted-foreground">
            {t("adminLibrary.categoryTrashHint")}
          </p>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {deletedCategories.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("adminLibrary.trashEmpty")}
              </p>
            )}
            {deletedCategories.map((entry) => (
              <div
                key={`${entry.category}-${entry.deletedAt}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("adminLibrary.deletedAt", {
                      date: new Date(entry.deletedAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 shrink-0"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreCategory(entry)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("adminLibrary.restore")}
                </Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminLibrary.addCategory")}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={t("dishes.categoryPlaceholder")}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending || !newCategoryName.trim()}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type LibraryTabKey = "fooditem" | "dish" | "presetmeal" | "brand" | "category";

export default function AdminLibraryPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LibraryTabKey>("fooditem");

  const tabs: { key: LibraryTabKey; label: string }[] = [
    { key: "fooditem", label: t("adminLibrary.tabFoodItems") },
    { key: "dish", label: t("adminLibrary.tabDishes") },
    { key: "presetmeal", label: t("adminLibrary.tabPresetMeals") },
    { key: "brand", label: t("adminLibrary.tabBrands") },
    { key: "category", label: t("adminLibrary.tabCategories") },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("adminLibrary.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("adminLibrary.subtitle")}</p>
      </header>

      <div className="mb-6 flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "fooditem" && <FoodItemsTab />}
      {activeTab === "dish" && <DishesTab />}
      {activeTab === "presetmeal" && <PresetMealsTab />}
      {activeTab === "brand" && <BrandsTab />}
      {activeTab === "category" && <CategoriesTab />}
    </div>
  );
}
