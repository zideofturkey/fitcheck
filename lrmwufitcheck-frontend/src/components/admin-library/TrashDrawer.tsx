import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader, RotateCcw, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  useListLibraryTrash,
  useRestoreLibraryItem,
} from "@/hooks/api/use-admin-library-trash";
import type { TrashObjectType } from "@/services/api/admin-library-trash-api";

interface TrashDrawerProps<T extends { id: string; _archivedAt?: string }> {
  type: TrashObjectType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getTitle: (item: T) => string;
}

function formatArchivedAt(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function TrashDrawer<
  T extends { id: string; _archivedAt?: string },
>({ type, open, onOpenChange, getTitle }: TrashDrawerProps<T>) {
  const { t } = useTranslation();
  const { data, isLoading } = useListLibraryTrash<T>(type, open);
  const restoreMutation = useRestoreLibraryItem(type);

  const items = data ?? [];

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id, {
      onSuccess: () => toast.success(t("adminLibrary.restoreSuccess")),
      onError: () => toast.error(t("adminLibrary.restoreError")),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            {t("adminLibrary.trashTitle")}
          </SheetTitle>
        </SheetHeader>
        <p className="px-4 text-xs text-muted-foreground">
          {t("adminLibrary.trashHint")}
        </p>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader className="w-4 h-4 animate-spin mr-2" />
              {t("common.loading")}
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("adminLibrary.trashEmpty")}
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {getTitle(item)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("adminLibrary.deletedAt", {
                    date: formatArchivedAt(item._archivedAt),
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 shrink-0"
                disabled={restoreMutation.isPending}
                onClick={() => handleRestore(item.id)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t("adminLibrary.restore")}
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
