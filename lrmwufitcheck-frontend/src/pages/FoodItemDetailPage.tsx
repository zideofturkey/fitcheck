import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Loader, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDeleteFoodItem,
  useGetFoodItem,
} from "@/hooks/api/use-nutritionlibrary";

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function FoodItemDetailPage() {
  const { t } = useTranslation();
  const { foodItemId } = useParams<{ foodItemId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetFoodItem(foodItemId);
  const deleteMutation = useDeleteFoodItem();

  const item = data?.foodItem;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("foodItemDetail.loading")}
      </div>
    );
  }

  if (error || !item) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("foodItemDetail.notFound")}
        </p>
        <Link
          to="/food-library"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("foodItemDetail.backToLibrary")}
        </Link>
      </Card>
    );
  }

  const proteinCals = item.proteinPer100g * 4;
  const fatCals = item.fatPer100g * 9;
  const carbsCals = item.carbohydratePer100g * 4;
  const totalCals = proteinCals + fatCals + carbsCals || 1;
  const proteinPct = Math.round((proteinCals / totalCals) * 100);
  const fatPct = Math.round((fatCals / totalCals) * 100);
  const carbsPct = Math.max(0, 100 - proteinPct - fatPct);

  const handleDelete = () => {
    if (!confirm(t("foodItemDetail.deleteConfirm"))) return;
    deleteMutation.mutate(item.id, {
      onSuccess: () => navigate("/food-library"),
    });
  };

  return (
    <main className="max-w-3xl mx-auto px-2 py-6 sm:px-6 lg:px-8 pb-24 md:pb-10">
      <nav
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        aria-label="Breadcrumb"
      >
        <Link
          to="/food-library"
          className="hover:text-foreground transition-colors"
        >
          {t("foodItemDetail.foodLibrary")}
        </Link>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="text-foreground font-medium">{item.foodName}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              to="/food-library"
              className="rounded-full p-2 hover:bg-muted transition-colors"
              aria-label={t("foodItemDetail.back")}
              title={t("foodItemDetail.back")}
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              {item.foodName}
            </h1>
            {item.creationSource === "aiAssistant" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200">
                AI
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {item.brandName || "—"} · {item.foodCategory || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 border-border"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            {t("foodItemDetail.delete")}
          </Button>
        </div>
      </div>

      <section className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-5">
          {t("foodItemDetail.nutritionValues")}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {t("foodItemDetail.per100g")}
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            [t("foodItemDetail.calories"), `${item.caloriePer100g} kcal`],
            [t("foodItemDetail.protein"), `${item.proteinPer100g.toFixed(1)} g`],
            [
              t("foodItemDetail.carbs"),
              `${item.carbohydratePer100g.toFixed(1)} g`,
            ],
            [t("foodItemDetail.fat"), `${item.fatPer100g.toFixed(1)} g`],
            [t("foodItemDetail.sugar"), `${item.sugarPer100g.toFixed(1)} g`],
            [t("foodItemDetail.fiber"), `${item.fiberPer100g.toFixed(1)} g`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-lg bg-muted/50 p-4"
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
              <span className="text-xl font-bold">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {t("foodItemDetail.macroBreakdown")}
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-chart-1" />
              <span className="text-sm font-medium">
                {t("foodItemDetail.protein")}
              </span>
            </div>
            <span className="text-sm font-semibold">{proteinPct}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-chart-4" />
              <span className="text-sm font-medium">
                {t("foodItemDetail.fat")}
              </span>
            </div>
            <span className="text-sm font-semibold">{fatPct}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-chart-2" />
              <span className="text-sm font-medium">
                {t("foodItemDetail.carbs")}
              </span>
            </div>
            <span className="text-sm font-semibold">{carbsPct}%</span>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t("foodItemDetail.details")}
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("foodItemDetail.foodName")}
            </dt>
            <dd className="text-sm font-medium">{item.foodName}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("foodItemDetail.brand")}
            </dt>
            <dd className="text-sm font-medium">{item.brandName || "—"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("foodItemDetail.category")}
            </dt>
            <dd className="text-sm font-medium">{item.foodCategory || "—"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("foodItemDetail.source")}
            </dt>
            <dd className="text-sm font-medium">
              {item.creationSource === "aiAssistant"
                ? t("foodItemDetail.aiAssistant")
                : t("foodItemDetail.manualEntry")}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("foodItemDetail.created")}
            </dt>
            <dd className="text-sm font-medium">
              {formatDate(item.createdAt)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("foodItemDetail.lastUpdated")}
            </dt>
            <dd className="text-sm font-medium">
              {formatDate(item.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
