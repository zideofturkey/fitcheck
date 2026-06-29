// EditMealPage — wired to useGetMealLog + useUpdateMealLog
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Calendar,
  Clock,
  Tag,
  UtensilsCrossed,
  ChevronDown,
  BookOpen,
  StickyNote,
  Flame,
  ListChecks,
  Drumstick,
  Wheat,
  Leaf,
  X,
  Check,
} from "lucide-react";
import { useGetMealLog, useUpdateMealLog } from "@/hooks/api/use-mealtracker";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function EditMealPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetMealLog(id);
  const updateMutation = useUpdateMealLog();
  const meal = data?.mealLog;

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
      setMealDate(meal.mealDate);
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
    updateMutation.mutate(
      {
        mealLogId: id,
        data: {
          mealTime,
          slotName,
          noteText: noteText || undefined,
          totalCalories: Number(totalCalories) || 0,
          totalProtein: Number(totalProtein) || 0,
          totalCarbohydrates: Number(totalCarbohydrates) || 0,
          totalFat: Number(totalFat) || 0,
          totalSugar: Number(totalSugar) || 0,
          totalFiber: Number(totalFiber) || 0,
        },
      },
      { onSuccess: () => navigate(`/meals/${id}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        Yükleniyor…
      </div>
    );
  }

  if (!meal) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Öğün bulunamadı.</p>
        <Link
          to="/meals"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Öğün geçmişine dön
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
          <span>Back to meal</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Meal</h1>
        <p className="text-sm text-muted-foreground">
          Update meal details, times, notes, and nutrition totals.
        </p>
      </header>

      {/* Edit Form */}
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Date & Time Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Date & Time</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date */}
            <div className="space-y-2">
              <label
                htmlFor="mealDate"
                className="block text-sm font-medium text-foreground"
              >
                Meal Date
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
                Meal Time
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
            <h2 className="text-lg font-semibold">Meal Slot & Source</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Slot Name */}
            <div className="space-y-2">
              <label
                htmlFor="slotName"
                className="block text-sm font-medium text-foreground"
              >
                Meal Slot
              </label>
              <div className="relative">
                <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  id="slotName"
                  value={slotName}
                  onChange={(e) => setSlotName(e.target.value)}
                  className="w-full h-10 pl-10 pr-8 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors appearance-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="custom">Custom…</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Source (read-only badge) */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-foreground">
                Log Source
              </span>
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-muted/50">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                  <BookOpen className="w-3 h-3" />
                  Food Library
                </span>
                <span className="text-xs text-muted-foreground">
                  (read-only)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <StickyNote className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Notes</h2>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="noteText"
              className="block text-sm font-medium text-foreground"
            >
              Meal Notes (optional)
            </label>
            <textarea
              id="noteText"
              rows={3}
              placeholder="e.g., homemade, felt great afterwards…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {noteText.length} characters
            </p>
          </div>
        </section>

        {/* Nutrition Totals Section */}
        <section className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-chart-4" />
            <h2 className="text-lg font-semibold">Nutrition Totals</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            Edit the meal-level totals manually. Individual food item lines are
            updated on the meal detail page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calories */}
            <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
              <label
                htmlFor="totalCalories"
                className="flex items-center justify-between text-sm font-medium text-foreground"
              >
                <span>Calories</span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </label>
              <input
                type="number"
                id="totalCalories"
                value={totalCalories}
                onChange={(e) => setTotalCalories(e.target.value)}
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
                <span>Protein</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalProtein"
                value={totalProtein}
                onChange={(e) => setTotalProtein(e.target.value)}
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
                <span>Carbs</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalCarbohydrates"
                value={totalCarbohydrates}
                onChange={(e) => setTotalCarbohydrates(e.target.value)}
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
                <span>Fat</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalFat"
                value={totalFat}
                onChange={(e) => setTotalFat(e.target.value)}
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
                <span>Sugar</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalSugar"
                value={totalSugar}
                onChange={(e) => setTotalSugar(e.target.value)}
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
                <span>Fiber</span>
                <span className="text-xs text-muted-foreground">g</span>
              </label>
              <input
                type="number"
                id="totalFiber"
                value={totalFiber}
                onChange={(e) => setTotalFiber(e.target.value)}
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
            <h2 className="text-lg font-semibold">Food Items</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            These line items are edited individually on the meal detail page.
          </p>

          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {/* Line Item 1 */}
            <div className="flex items-center justify-between px-4 py-3 bg-background">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                  <Drumstick className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    Grilled Chicken Breast
                  </p>
                  <p className="text-xs text-muted-foreground">200 g</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">310 kcal</p>
                <p className="text-xs text-muted-foreground">
                  P: 52g · C: 0g · F: 7g
                </p>
              </div>
            </div>
            {/* Line Item 2 */}
            <div className="flex items-center justify-between px-4 py-3 bg-background">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                  <Wheat className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    Brown Rice (cooked)
                  </p>
                  <p className="text-xs text-muted-foreground">150 g</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">240 kcal</p>
                <p className="text-xs text-muted-foreground">
                  P: 4g · C: 54g · F: 2g
                </p>
              </div>
            </div>
            {/* Line Item 3 */}
            <div className="flex items-center justify-between px-4 py-3 bg-background">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    Steamed Vegetables Mix
                  </p>
                  <p className="text-xs text-muted-foreground">100 g</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold">70 kcal</p>
                <p className="text-xs text-muted-foreground">
                  P: 3g · C: 4g · F: 0.5g
                </p>
              </div>
            </div>
          </div>
          <Link
            to={`/meals/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit individual items on meal detail</span>
          </Link>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <Link
            to={`/meals/${id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-8 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}
