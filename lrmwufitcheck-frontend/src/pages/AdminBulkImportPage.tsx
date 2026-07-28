import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  Loader,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBulkImport } from "@/hooks/api/use-bulk-import";
import type { BulkImportRow } from "@/services/api/bulk-import-api";

const SAMPLE = `[
  {
    "type": "ingredient",
    "foodName": "Yogurt - Brand A",
    "baseName": "Yogurt",
    "brand": "Brand A",
    "caloriePer100g": 61,
    "proteinPer100g": 3.5,
    "carbohydratePer100g": 4.7,
    "fatPer100g": 3.3,
    "sugarPer100g": 4.7,
    "fiberPer100g": 0,
    "foodCategory": "Dairy"
  },
  {
    "type": "dish",
    "dishName": "Chicken Rice Bowl",
    "descriptionText": "A simple bowl",
    "ingredients": [
      { "foodName": "Chicken Breast", "gramAmount": 150 },
      { "foodName": "White Rice", "gramAmount": 200 }
    ]
  },
  {
    "type": "meal_template",
    "presetName": "Breakfast Combo",
    "items": [
      { "dishName": "Chicken Rice Bowl", "gramAmount": 250 },
      { "foodName": "Egg", "gramAmount": 100 }
    ]
  }
]`;

function AdminBulkImportPage() {
  const { t } = useTranslation();
  const [rawInput, setRawInput] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const importMutation = useBulkImport();

  const handleImport = () => {
    setParseError(null);
    let rows: BulkImportRow[];
    try {
      const parsed = JSON.parse(rawInput);
      if (!Array.isArray(parsed)) {
        throw new Error(t("adminBulkImport.mustBeArray"));
      }
      rows = parsed;
    } catch (e) {
      setParseError(
        e instanceof Error ? e.message : t("adminBulkImport.invalidJson"),
      );
      return;
    }
    if (rows.length === 0) {
      setParseError(t("adminBulkImport.emptyRows"));
      return;
    }
    importMutation.mutate(rows);
  };

  const summary = importMutation.data?.summary;
  const results = importMutation.data?.results ?? [];

  const statusBadge = (status: string) => {
    if (status === "success")
      return (
        <Badge className="gap-1 bg-chart-2/20 text-chart-2 border-0">
          <CheckCircle2 className="w-3 h-3" /> {t("adminBulkImport.success")}
        </Badge>
      );
    if (status === "partial")
      return (
        <Badge className="gap-1 bg-chart-4/20 text-chart-4 border-0">
          <AlertCircle className="w-3 h-3" /> {t("adminBulkImport.partial")}
        </Badge>
      );
    return (
      <Badge className="gap-1 bg-destructive/20 text-destructive border-0">
        <XCircle className="w-3 h-3" /> {t("adminBulkImport.error")}
      </Badge>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("adminBulkImport.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("adminBulkImport.subtitle")}{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">type</code>{" "}
          {t("adminBulkImport.typeLabel")}{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {t("adminBulkImport.typeIngredient")}
          </code>
          ,{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {t("adminBulkImport.typeDish")}
          </code>
          ,{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {t("adminBulkImport.typeMealTemplate")}
          </code>
        </p>
      </header>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            {t("adminBulkImport.rowsLabel")}
          </label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => setRawInput(SAMPLE)}
          >
            {t("adminBulkImport.insertExample")}
          </button>
        </div>
        <textarea
          rows={16}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
          className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-y"
        />
        {parseError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{parseError}</p>
          </div>
        )}
        {importMutation.isError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              {(importMutation.error as { message?: string })?.message ??
                t("adminBulkImport.importFailed")}
            </p>
          </div>
        )}
        <Button
          type="button"
          className="gap-2"
          disabled={importMutation.isPending || !rawInput.trim()}
          onClick={handleImport}
        >
          {importMutation.isPending ? (
            <>
              <Loader className="size-4 animate-spin" />{" "}
              {t("adminBulkImport.importing")}
            </>
          ) : (
            <>
              <Upload className="size-4" /> {t("adminBulkImport.import")}
            </>
          )}
        </Button>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              {t("adminBulkImport.total")}
            </p>
            <p className="text-xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              {t("adminBulkImport.success")}
            </p>
            <p className="text-xl font-semibold text-chart-2">
              {summary.success}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              {t("adminBulkImport.partial")}
            </p>
            <p className="text-xl font-semibold text-chart-4">
              {summary.partial}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              {t("adminBulkImport.error")}
            </p>
            <p className="text-xl font-semibold text-destructive">
              {summary.error}
            </p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-muted/50">
            <span className="col-span-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("adminBulkImport.row")}
            </span>
            <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("adminBulkImport.type")}
            </span>
            <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("adminBulkImport.status")}
            </span>
            <span className="col-span-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("adminBulkImport.detail")}
            </span>
          </div>
          <div className="divide-y divide-border">
            {results.map((r) => (
              <div
                key={r.row}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 items-center"
              >
                <div className="sm:col-span-1 text-sm text-muted-foreground">
                  #{r.row}
                </div>
                <div className="sm:col-span-2 text-sm">{r.type}</div>
                <div className="sm:col-span-2">{statusBadge(r.status)}</div>
                <div className="sm:col-span-7 text-sm text-muted-foreground truncate">
                  {r.message ||
                    (r.createdId
                      ? `${t("adminBulkImport.created")}: ${r.createdId}`
                      : "—")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBulkImportPage;
