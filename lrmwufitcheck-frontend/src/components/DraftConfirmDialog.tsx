import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DraftConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  description?: string;
  onKeep: () => void;
  onDiscard: () => void;
}

// Themed replacement for window.confirm() on the "close before finishing"
// flow (Dish/PresetMeal/FoodItem creation). Tamam = keep as draft (bold,
// safe default), Vazgeç = discard (thin, red, destructive).
export default function DraftConfirmDialog({
  open,
  onOpenChange,
  itemName,
  description,
  onKeep,
  onDiscard,
}: DraftConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Taslak Olarak Kaydedilsin mi?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                <strong>&quot;{itemName}&quot;</strong> için girdiğiniz
                bilgiler henüz tamamlanmadı. Taslak olarak saklayabilir ya da
                vazgeçebilirsiniz.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onDiscard}
            className="font-normal text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            Vazgeç
          </AlertDialogCancel>
          <AlertDialogAction onClick={onKeep} className="font-bold">
            Tamam
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
