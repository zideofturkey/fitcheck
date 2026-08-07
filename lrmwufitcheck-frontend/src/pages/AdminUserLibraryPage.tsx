import { formatMacro } from "@/lib/format";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Globe, Layers, Loader, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/api/use-auth";
import {
  useAdminUserLibrary,
  usePromoteToGlobal,
} from "@/hooks/api/use-admin-user-library";
import type { AdminLibraryItem } from "@/services/api/admin-user-library-api";
import type { SuggestionEntityType } from "@/services/api/suggestion-api";

type EntityFilter = SuggestionEntityType | null;

function AdminUserLibraryPage() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { data: user } = useUser(userId);
  const { data, isLoading, error } = useAdminUserLibrary(userId ?? "");
  const promoteMutation = usePromoteToGlobal(userId ?? "");
  const [filter, setFilter] = useState<EntityFilter>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const filteredItems = filter ? items.filter((i) => i.entityType === filter) : items;

  const ENTITY_LABELS: Record<SuggestionEntityType, string> = {
    foodItem: t("adminUserLibrary.foodItems"),
    dish: t("adminUserLibrary.dishes"),
    presetMeal: t("adminUserLibrary.presetMeals"),
  };

  const itemName = (item: AdminLibraryItem) =>
    item.foodName ?? item.dishName ?? item.templateName ?? "—";

  const handlePromote = (item: AdminLibraryItem) => {
    setPromotingId(item.id);
    promoteMutation.mutate(
      { entityType: item.entityType, id: item.id },
      { onSettled: () => setPromotingId(null) },
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={`/admin/users/${userId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        {t("adminUserLibrary.backToUser")}
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("adminUserLibrary.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.fullname ?? userId}
          {user?.email ? ` · ${user.email}` : ""}
        </p>
      </header>

      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filter === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-3.5 h-3.5" aria-hidden />
          {t("adminUserLibrary.all")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("foodItem")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filter === "foodItem"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("adminUserLibrary.foodItems")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("dish")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filter === "dish"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("adminUserLibrary.dishes")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("presetMeal")}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filter === "presetMeal"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("adminUserLibrary.presetMeals")}
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("adminUserLibrary.loading")}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {t("adminUserLibrary.loadError")}
        </div>
      )}

      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold">{t("adminUserLibrary.emptyTitle")}</h3>
        </div>
      )}

      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {ENTITY_LABELS[item.entityType]}
                  </Badge>
                  {item.isGlobal && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Globe className="w-3 h-3" aria-hidden />
                      {t("adminUserLibrary.alreadyGlobal")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{itemName(item)}</p>
                {item.entityType === "foodItem" ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("adminSuggestions.per100g")}: {formatMacro(item.caloriePer100g)} {t("common.kcal")} · P{" "}
                    {formatMacro(item.proteinPer100g)}g · K {formatMacro(item.carbohydratePer100g)}g · Y {formatMacro(item.fatPer100g)}g
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("adminSuggestions.totals")}: {formatMacro(item.totalCalories)} {t("common.kcal")} · P{" "}
                    {formatMacro(item.totalProtein)}g · K {formatMacro(item.totalCarbohydrates)}g · Y {formatMacro(item.totalFat)}g
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              {!item.isGlobal && (
                <div className="shrink-0">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={promotingId === item.id && promoteMutation.isPending}
                    onClick={() => handlePromote(item)}
                    title={t("adminUserLibrary.promoteAction")}
                  >
                    <Globe className="w-4 h-4" aria-hidden />
                    {promotingId === item.id && promoteMutation.isPending
                      ? t("adminUserLibrary.promoting")
                      : t("adminUserLibrary.promoteAction")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminUserLibraryPage;
