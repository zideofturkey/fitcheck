import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ManualEntrySuggestionDialogProps {
  open: boolean;
  itemName: string;
  /** "ingredient" (Malzeme Kütüphanesi/foodItem) or "dish" (Yemek Kütüphanesi/Dish). */
  kind: "ingredient" | "dish";
  isPending?: boolean;
  /** "Evet, öneride bulun" - persist to library AND create a suggestion. */
  onSuggest: () => void;
  /** "Hayır, sadece kütüphaneme ekle" - persist to library, no suggestion. */
  onKeepPrivate: () => void;
  /** The red "×" - neither persists nor suggests; the manual line stays
   * embedded-only on the dish/preset it was added to. */
  onDismiss: () => void;
}

export default function ManualEntrySuggestionDialog({
  open,
  itemName,
  kind,
  isPending,
  onSuggest,
  onKeepPrivate,
  onDismiss,
}: ManualEntrySuggestionDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <button
          type="button"
          onClick={onDismiss}
          disabled={isPending}
          aria-label={t("manualEntry.dismissAria")}
          className="absolute top-2 right-2 rounded-full p-1.5 text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <DialogHeader>
          <DialogTitle>{t("manualEntry.promptTitle")}</DialogTitle>
          <DialogDescription>
            {t(
              kind === "dish"
                ? "manualEntry.promptDescriptionDish"
                : "manualEntry.promptDescriptionIngredient",
              { name: itemName },
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onKeepPrivate}
            className="flex-1"
          >
            {t("manualEntry.keepPrivate")}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={onSuggest}
            className="flex-1"
          >
            {t("manualEntry.suggest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
