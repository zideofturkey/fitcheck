import { formatMacro } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader,
  Pencil,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useDeleteBrand,
  useListBrands,
  useRenameBrand,
  useRestoreBrand,
} from "@/hooks/api/use-brand-admin";
import {
  useDeleteFoodItem,
  useDeletePresetMeal,
  useListFoodItems,
  useListPresetMeals,
  useUpdateFoodItem,
  useUpdatePresetMeal,
} from "@/hooks/api/use-nutritionlibrary";
import { useDeleteDish, useListDishes, useUpdateDish } from "@/hooks/api/use-dish";
import { useBulkDeleteWithUndo } from "@/hooks/use-bulk-delete-with-undo";
import TrashDrawer from "@/components/admin-library/TrashDrawer";
import type { FoodItemWithBaseName } from "@/types/food-item-extensions";
import type { Dish } from "@/services/api/dish-api";
import type { NutritionlibraryPresetMeal } from "@/types/api";

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
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t("adminLibrary.rowsPerPage", { count: n })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  deleteLabel: string;
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

function FoodItemsTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trashOpen, setTrashOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItemRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editForm, setEditForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    sugar: "",
    fiber: "",
  });

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
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate(
      {
        foodItemId: editing.id,
        data: {
          foodName: editForm.name,
          caloriePer100g: Number(editForm.calories) || 0,
          proteinPer100g: Number(editForm.protein) || 0,
          carbohydratePer100g: Number(editForm.carbs) || 0,
          fatPer100g: Number(editForm.fat) || 0,
          sugarPer100g: Number(editForm.sugar) || 0,
          fiberPer100g: Number(editForm.fiber) || 0,
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
  const [editForm, setEditForm] = useState({ name: "", description: "" });

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
    setEditForm({ name: item.dishName, description: item.descriptionText ?? "" });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate(
      {
        dishId: editing.id,
        data: { dishName: editForm.name, descriptionText: editForm.description || undefined },
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
  const [editForm, setEditForm] = useState({ name: "", description: "" });

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
    setEditForm({ name: item.templateName, description: item.descriptionText ?? "" });
  };

  const saveEdit = () => {
    if (!editing) return;
    updateMutation.mutate(
      {
        presetMealId: editing.id,
        data: { templateName: editForm.name, descriptionText: editForm.description || undefined },
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
}

function BrandsTab() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useListBrands();
  const renameMutation = useRenameBrand();
  const deleteMutation = useDeleteBrand();
  const restoreMutation = useRestoreBrand();

  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [trashOpen, setTrashOpen] = useState(false);
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
      { brandName: entry.brandName, ids: entry.ids },
      {
        onSuccess: (res) => {
          toast.success(
            t("adminLibrary.restoreBulkSuccess", { count: res.restoredCount }),
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

  const handleDelete = (brandName: string) => {
    deleteMutation.mutate(brandName, {
      onSuccess: (res) => {
        toast.success(t("adminBrands.deleteSuccess", { count: res.clearedCount }));
        const entry: DeletedBrandEntry = {
          brandName,
          ids: res.clearedIds,
          deletedAt: new Date().toISOString(),
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type LibraryTabKey = "fooditem" | "dish" | "presetmeal" | "brand";

export default function AdminLibraryPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LibraryTabKey>("fooditem");

  const tabs: { key: LibraryTabKey; label: string }[] = [
    { key: "fooditem", label: t("adminLibrary.tabFoodItems") },
    { key: "dish", label: t("adminLibrary.tabDishes") },
    { key: "presetmeal", label: t("adminLibrary.tabPresetMeals") },
    { key: "brand", label: t("adminLibrary.tabBrands") },
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
    </div>
  );
}
