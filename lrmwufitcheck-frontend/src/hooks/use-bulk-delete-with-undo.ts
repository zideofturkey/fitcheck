import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  useRestoreLibraryItem,
  useRestoreLibraryItemsBulk,
} from "@/hooks/api/use-admin-library-trash";
import type { TrashObjectType } from "@/services/api/admin-library-trash-api";

/**
 * Wraps single/bulk delete for a global-library entity type with a
 * bottom-left "undo" toast. The underlying delete is a real soft-delete
 * (isActive:false, see deleteXById.js), so undo just restores the same ids
 * via the admin trash endpoints rather than re-creating anything.
 */
export function useBulkDeleteWithUndo(type: TrashObjectType) {
  const { t } = useTranslation();
  const restoreOne = useRestoreLibraryItem(type);
  const restoreBulk = useRestoreLibraryItemsBulk(type);

  const runDelete = async (
    ids: string[],
    deleteOne: (id: string) => Promise<unknown>,
  ) => {
    const results = await Promise.allSettled(ids.map((id) => deleteOne(id)));
    const deletedIds = ids.filter((_, i) => results[i].status === "fulfilled");
    const failedCount = ids.length - deletedIds.length;

    if (deletedIds.length > 0) {
      toast(
        t("adminLibrary.deletedToast", { count: deletedIds.length }),
        {
          position: "bottom-left",
          action: {
            label: t("adminLibrary.undo"),
            onClick: () => {
              if (deletedIds.length === 1) {
                restoreOne.mutate(deletedIds[0], {
                  onSuccess: () =>
                    toast.success(t("adminLibrary.restoreSuccess")),
                  onError: () => toast.error(t("adminLibrary.restoreError")),
                });
              } else {
                restoreBulk.mutate(deletedIds, {
                  onSuccess: (res) =>
                    toast.success(
                      t("adminLibrary.restoreBulkSuccess", {
                        count: res.restoredCount,
                      }),
                    ),
                  onError: () => toast.error(t("adminLibrary.restoreError")),
                });
              }
            },
          },
        },
      );
    }
    if (failedCount > 0) {
      toast.error(t("adminLibrary.deleteFailedToast", { count: failedCount }));
    }

    return deletedIds;
  };

  return { runDelete };
}
