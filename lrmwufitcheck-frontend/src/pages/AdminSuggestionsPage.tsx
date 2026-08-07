import { formatMacro } from "@/lib/format";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Lightbulb,
  Loader,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApproveSuggestion,
  useListSuggestions,
  useRejectSuggestion,
} from "@/hooks/api/use-suggestion";
import { useUser } from "@/hooks/api/use-auth";

function AdminSuggestionsPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdFilter = searchParams.get("userId") ?? undefined;
  const { data: filteredUser } = useUser(userIdFilter);
  const { data, isLoading, error, refetch } = useListSuggestions(
    statusFilter,
    userIdFilter,
  );
  const approveMutation = useApproveSuggestion();
  const rejectMutation = useRejectSuggestion();

  const ENTITY_LABELS: Record<string, string> = {
    foodItem: t("adminSuggestions.entityFoodItem"),
    dish: t("adminSuggestions.entityDish"),
    presetMeal: t("adminSuggestions.entityPresetMeal"),
  };

  const suggestions = data?.suggestions ?? [];

  const statusBadgeVariant = (status: string) => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("adminSuggestions.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adminSuggestions.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                {t("adminSuggestions.pending")}
              </SelectItem>
              <SelectItem value="approved">
                {t("adminSuggestions.approved")}
              </SelectItem>
              <SelectItem value="rejected">
                {t("adminSuggestions.rejected")}
              </SelectItem>
              <SelectItem value="all">{t("adminSuggestions.all")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden />
            {t("adminSuggestions.refresh")}
          </Button>
        </div>
      </header>

      {userIdFilter && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            {t("adminSuggestions.filteredByUser")}
          </span>
          <span className="font-semibold text-foreground">
            {filteredUser?.fullname ?? userIdFilter}
          </span>
          <button
            type="button"
            title={t("adminSuggestions.clearFilter")}
            aria-label={t("adminSuggestions.clearFilter")}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("userId");
              setSearchParams(next);
            }}
          >
            <X className="w-4 h-4 text-muted-foreground" aria-hidden />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          {t("adminSuggestions.loading")}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {t("adminSuggestions.loadError")}
        </div>
      )}

      {!isLoading && !error && suggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lightbulb className="w-8 h-8 text-muted-foreground" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold">
            {t("adminSuggestions.emptyTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {statusFilter === "pending"
              ? t("adminSuggestions.emptyPending")
              : t("adminSuggestions.emptyOther")}
          </p>
        </div>
      )}

      {!isLoading && !error && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {ENTITY_LABELS[s.entityType] ?? s.entityType}
                  </Badge>
                  <Badge
                    variant={
                      statusBadgeVariant(s.status) as
                        | "default"
                        | "secondary"
                        | "destructive"
                        | "outline"
                    }
                    className="text-xs"
                  >
                    {s.status}
                  </Badge>
                </div>

                {s.sourceDetail ? (
                  <div className="mt-1">
                    <p className="text-sm font-semibold text-foreground">
                      {s.sourceDetail.foodName ??
                        s.sourceDetail.dishName ??
                        s.sourceDetail.templateName}
                    </p>
                    {s.entityType === "foodItem" ? (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("adminSuggestions.per100g")}: {formatMacro(s.sourceDetail.caloriePer100g)}{" "}
                        {t("common.kcal")} · P {formatMacro(s.sourceDetail.proteinPer100g)}g · K{" "}
                        {formatMacro(s.sourceDetail.carbohydratePer100g)}g · Y{" "}
                        {formatMacro(s.sourceDetail.fatPer100g)}g · Ş {formatMacro(s.sourceDetail.sugarPer100g)}g ·
                        L {formatMacro(s.sourceDetail.fiberPer100g)}g
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("adminSuggestions.totals")}: {formatMacro(s.sourceDetail.totalCalories)}{" "}
                          {t("common.kcal")} · P {formatMacro(s.sourceDetail.totalProtein)}g · K{" "}
                          {formatMacro(s.sourceDetail.totalCarbohydrates)}g · Y{" "}
                          {formatMacro(s.sourceDetail.totalFat)}g
                          {s.sourceDetail.totalGramWeight != null &&
                            ` · ${s.sourceDetail.totalGramWeight}g`}
                        </p>
                        {s.sourceDetail.lines && s.sourceDetail.lines.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                            {s.sourceDetail.lines.map((line, idx) => (
                              <li key={idx} className="truncate">
                                • {line.lineFoodName} ({line.gramAmount}g) —{" "}
                                {formatMacro(line.lineCalories)} {t("common.kcal")}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-mono text-muted-foreground truncate mt-1">
                    {t("adminSuggestions.recordId")}: {s.sourceRecordId}{" "}
                    <span className="italic">
                      ({t("adminSuggestions.recordDeleted")})
                    </span>
                  </p>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  {t("adminSuggestions.suggestedBy")} {s.userId}
                  {s.createdAt &&
                    ` · ${new Date(s.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              {s.status === "pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate({ id: s.id })}
                  >
                    <XCircle className="w-4 h-4" aria-hidden />
                    {t("adminSuggestions.reject")}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate({ id: s.id })}
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden />
                    {t("adminSuggestions.approve")}
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

export default AdminSuggestionsPage;
