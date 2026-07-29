import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader, Pencil, RefreshCw, Tag, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  useDeleteBrand,
  useListBrands,
  useRenameBrand,
} from "@/hooks/api/use-brand-admin";

function extractError(err: unknown, fallback: string) {
  return (err as { message?: string })?.message ?? fallback;
}

export default function AdminBrandsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useListBrands();
  const renameMutation = useRenameBrand();
  const deleteMutation = useDeleteBrand();

  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const brands = data?.brands ?? [];

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
          toast.success(
            t("adminBrands.renameSuccess", {
              count: res.updatedCount,
              name: res.newName,
            }),
          );
          cancelEdit();
        },
        onError: (err) => {
          toast.error(extractError(err, t("adminBrands.renameError")));
        },
      },
    );
  };

  const handleDelete = (brandName: string) => {
    deleteMutation.mutate(brandName, {
      onSuccess: (res) => {
        toast.success(
          t("adminBrands.deleteSuccess", { count: res.clearedCount }),
        );
      },
      onError: (err) => {
        toast.error(extractError(err, t("adminBrands.deleteError")));
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("adminBrands.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminBrands.subtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden />
          {t("adminBrands.refresh")}
        </Button>
      </header>

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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Tag className="w-8 h-8 text-muted-foreground" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold">{t("adminBrands.emptyTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {t("adminBrands.emptyDesc")}
          </p>
        </div>
      )}

      {!isLoading && !error && brands.length > 0 && (
        <div className="space-y-2">
          {brands.map((b) => (
            <div
              key={b.brandName}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
            >
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
                  <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    disabled={renameMutation.isPending}
                    onClick={() => saveEdit(b.brandName)}
                  >
                    <Check className="w-4 h-4" aria-hidden />
                    {t("common.save")}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5 shrink-0"
                    onClick={cancelEdit}
                  >
                    <X className="w-4 h-4" aria-hidden />
                    {t("common.cancel")}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {b.brandName}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {t("adminBrands.itemCount", { count: b.itemCount })}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={() => startEdit(b.brandName)}
                  >
                    <Pencil className="w-4 h-4" aria-hidden />
                    {t("adminBrands.rename")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                        {t("adminBrands.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("adminBrands.deleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("adminBrands.deleteConfirmDesc", {
                            name: b.brandName,
                            count: b.itemCount,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("common.cancel")}
                        </AlertDialogCancel>
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
    </div>
  );
}
