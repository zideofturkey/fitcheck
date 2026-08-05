// EditMealPage — wired to useGetMealLog + useUpdateMealLog
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarClock,
  Calendar,
  Clock,
  Tag,
  UtensilsCrossed,
  ChevronDown,
  BookOpen,
  Layers,
  PenLine,
  Sparkles,
  StickyNote,
  Flame,
  ListChecks,
  X,
  Check,
} from "lucide-react";
import {
  useGetMealLog,
  useListMealLines,
  useUpdateMealLog,
} from "@/hooks/api/use-mealtracker";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";

const SOURCE_CONFIG: Record<
  string,
  { icon: typeof BookOpen; labelKey: string }
> = {
  foodLibrary: { icon: BookOpen, labelKey: "editMeal.foodLibrary" },
  presetTemplate: { icon: Layers, labelKey: "editMeal.presetTemplate" },
  manualEntry: { icon: PenLine, labelKey: "editMeal.manualEntry" },
  aiAssistant: { icon: Sparkles, labelKey: "editMeal.aiAssistant" },
};

export default function EditMealPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetMealLog(id);
  const { data: linesData } = useListMealLines(
    id ? { mealLogId: id } : undefined,
  );
  const updateMutation = useUpdateMealLog();
  const meal = data?.mealLog;
  const lines = linesData?.mealLines ?? [];

  const [mealDate, setMealDate] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [slotName, setSlotName] = useState("");
  const [noteText, setNoteText] = useState("");
  const [totalCalories, setTotalCalories] = useState("");
  const [totalProtein, setTotalProtein] = useState("");
  const [totalCarbohydrates, setTotalCarbohydrates] = useState("");
  const [totalFat, setTotalFat] = useState("");
  const [totalSugar, setTotalSugar] = useState("");
  const [totalFiber, setTotalFiber] = useState("");

  useEffect(() => {
    if (meal) {
      // meal.mealDate comes back as a full ISO timestamp (e.g.
      // "2026-08-01T00:00:00.000Z") since the column is DATE, not DATEONLY -
      // the native <input type="date"> only accepts a bare "YYYY-MM-DD" and
      // silently renders blank otherwise.
      setMealDate(meal.mealDate?.slice(0, 10) ?? "");
      setMealTime(meal.mealTime);
      setSlotName(meal.slotName);
      setNoteText(meal.noteText ?? "");
      setTotalCalories(String(meal.totalCalories));
      setTotalProtein(String(meal.totalProtein));
      setTotalCarbohydrates(String(meal.totalCarbohydrates));
      setTotalFat(String(meal.totalFat));
      setTotalSugar(String(meal.totalSugar));
      setTotalFiber(String(meal.totalFiber));
    }
  }, [meal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    // mealDate isn't in the generated UpdateMealLogInput type (the update
    // endpoint didn't support changing the date until now) - building the
    // payload as its own variable, rather than an inline object literal,
    // means TS's excess-property check doesn't fire at the call site (same
    // pattern as the dish baseName field elsewhere in this codebase).
    const updateData = {
      mealDate,
      mealTime,
      slotName,
      noteText: noteText || undefined,
      totalCalories: Number(totalCalories) || 0,
      totalProtein: Number(totalProtein) || 0,
      totalCarbohydrates: Number(totalCarbohydrates) || 0,
      totalFat: Number(totalFat) || 0,
      totalSugar: Number(totalSugar) || 0,
      totalFiber: Number(totalFiber) || 0,
    };
    updateMutation.mutate(
      { mealLogId: id, data: updateData },
      { onSuccess: () => navigate(`/meals/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        {t("editMeal.loading")}
      </div>
    );
  }

  if (!meal) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t("editMeal.notFound")}
        </p>
        <Link
          to="/meals"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          {t("editMeal.backToHistory")}
        </Link>
      </Card>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12 lg:px-0">
      {/* Page Header */}
      <header className="mb-8 space-y-1">
        <Link
          to={`/meals/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("editMeal.backToMeal")}</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("editMeal.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("editMeal.subtitle")}
        </p>
      </header>

      {/* Edit Form */}
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Date & Time Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("editMeal.dateTime")}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date */}
            <div className="space-y-2">
              <label
                htmlFor="mealDate"
                className="block text-sm font-medium text-foreground"
              >
                {t("editMeal.mealDate")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  id="mealDate"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label
                htmlFor="mealTime"
                className="block text-sm font-medium text-foreground"
              >
                {t("editMeal.mealTime")}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  id="mealTime"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Slot & Source Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("editMeal.slotSource")}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Slot Name */}
            <div className="space-y-2">
              <label
                htmlFor="slotName"
                className="block text-sm font-medium text-foreground"
              >
                {t("editMeal.mealSlot")}
              </label>
              <div className="relative">
                <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  id="slotName"
                  value={slotName}
                  onChange={(e) => setSlotName(e.target.value)}
                  className="w-full h-10 pl-10 pr-8 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors appearance-none"
                >
                  <option value="breakfast">{t("editMeal.breakfast")}</option>
                  <option value="lunch">{t("editMeal.lunch")}</option>
                  <option value="dinner">{t("editMeal.dinner")}</option>
                  <option value="snack">{t("editMeal.snack")}</option>
                  <option value="custom">{t("editMeal.custom")}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Source (read-only badge) */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-foreground">
                {t("editMeal.logSource")}
              </span>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-muted/50">
                {(() => {
                  const config =
                    SOURCE_CONFIG[meal.logSource] ?? SOURCE_CONFIG.foodLibrary;
                  const SourceIcon = config.icon;
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                      <SourceIcon className="w-3 h-3" />
                      {t(config.labelKey)}
                    </span>
                  );
                })()}
                <span className="text-xs text-muted-foreground">
                  {t("editMeal.readOnly")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <StickyNote className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("editMeal.notes")}</h2>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="noteText"
              className="block text-sm font-medium text-foreground"
            >
              {t("editMeal.mealNotesOptional")}
            </label>
            <textarea
              id="noteText"
              rows={3}
              placeholder={t("editMeal.notesPlaceholder")}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {noteText.length} {t("editMeal.characters")}
            </p>
          </div>
        </section>

        {/* Nutrition Totals Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-chart-4" />
            <h2 className="text-lg font-semibold">
              {t("editMeal.nutritionTotals")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            {t("editMeal.nutritionTotalsHint")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calories */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalCalories"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{t("editMeal.calories")}</span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </label>
              <input
                type="number"
                id="totalCalories"
                value={totalCalories === "0" ? "" : totalCalories}
                onChange={(e) => setTotalCalories(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors font-mono"
              />
            </div>

            {/* Protein */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalProtein"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{t("editMeal.protein")}</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalProtein"
                value={totalProtein === "0" ? "" : totalProtein}
                onChange={(e) => setTotalProtein(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors font-mono"
              />
            </div>

            {/* Carbohydrates */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalCarbohydrates"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{t("editMeal.carbs")}</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalCarbohydrates"
                value={totalCarbohydrates === "0" ? "" : totalCarbohydrates}
                onChange={(e) => setTotalCarbohydrates(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors font-mono"
              />
            </div>

            {/* Fat */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalFat"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{t("editMeal.fat")}</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalFat"
                value={totalFat === "0" ? "" : totalFat}
                onChange={(e) => setTotalFat(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors font-mono"
              />
            </div>

            {/* Sugar */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalSugar"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{t("editMeal.sugar")}</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalSugar"
                value={totalSugar === "0" ? "" : totalSugar}
                onChange={(e) => setTotalSugar(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors font-mono"
              />
            </div>

            {/* Fiber */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalFiber"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>{t("editMeal.fiber")}</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalFiber"
                value={totalFiber === "0" ? "" : totalFiber}
                onChange={(e) => setTotalFiber(e.target.value)}
                placeholder="0"
                step="0.1"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors font-mono"
              />
            </div>
          </div>
        </section>

        {/* Meal Lines (read-only summary in edit view) */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {t("editMeal.foodItems")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            {t("editMeal.foodItemsHint")}
          </p>

          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between px-4 py-3 bg-background"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {line.itemName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {line.consumedGrams} g
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">
                    {line.itemCalories} kcal
                  </p>
                  <p className="text-xs text-muted-foreground">
                    P: {line.itemProtein}g · C: {line.itemCarbohydrates}g · F:{" "}
                    {line.itemFat}g
                  </p>
                </div>
              </div>
            ))}
            {lines.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t("editMeal.noItemsFound")}
              </div>
            )}
          </div>
          <Link
            to={`/meals/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("editMeal.editItemsLink")}</span>
          </Link>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <Link
            to={`/meals/${id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
            {t("editMeal.cancel")}
          </Link>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-8 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            {t("editMeal.saveChanges")}
          </button>
        </div>
      </form>
    </main>
  );
}
