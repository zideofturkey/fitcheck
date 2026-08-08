import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/**
 * Selection toolbar shown above a library list once one or more items are
 * checked - lets the user apply a shared value (category, brand, ...) to
 * every selected item at once. `fields` renders the actual editable
 * controls (Selects); this component only owns the confirm/apply/clear
 * chrome, so it can be reused across FoodLibraryPage/DishesPage/
 * PresetMealsPage even though each has a different set of bulk-editable
 * fields.
 */
export default function BulkEditBar({
  selectedCount,
  onClear,
  fields,
  onApply,
  isApplying,
  canApply,
}: {
  selectedCount: number;
  onClear: () => void;
  fields: ReactNode;
  onApply: () => void;
  isApplying: boolean;
  canApply: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-wrap items-end gap-3">
        <span className="shrink-0 text-sm font-medium text-foreground">
          {t("bulkEdit.selectedCount", { count: selectedCount })}
        </span>
        {fields}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onClear}>
          <X className="mr-1 size-3.5" aria-hidden="true" />
          {t("bulkEdit.clear")}
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={!canApply || isApplying}>
              {t("bulkEdit.apply")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("bulkEdit.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("bulkEdit.confirmDesc", { count: selectedCount })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  onApply();
                }}
              >
                {t("bulkEdit.apply")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
