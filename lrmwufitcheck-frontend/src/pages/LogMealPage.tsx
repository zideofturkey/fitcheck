import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Moon,
  Apple,
  Sandwich,
  Salad,
  ChevronDown,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateMealLog } from "@/hooks/api/use-mealtracker";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodItemEntry {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  source: "library" | "manual";
}

type WizardStep = 1 | 2 | 3;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function LogMealPage() {
  const navigate = useNavigate();
  const createMutation = useCreateMealLog();
  const [step, setStep] = useState<WizardStep>(1);
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState(nowTime());
  const [mealSlot, setMealSlot] = useState<MealSlot>("lunch");
  const [customSlotName, setCustomSlotName] = useState("");
  const [notes, setNotes] = useState("");
  const [foodItems, setFoodItems] = useState<FoodItemEntry[]>([]);

  const slotOptions: {
    value: MealSlot;
    icon: React.ElementType;
    label: string;
  }[] = [
    { value: "breakfast", icon: Sunrise, label: "Breakfast" },
    { value: "lunch", icon: Sun, label: "Lunch" },
    { value: "dinner", icon: Moon, label: "Dinner" },
    { value: "snack", icon: Apple, label: "Snack" },
  ];

  const updateFoodItem = (
    id: string,
    field: keyof FoodItemEntry,
    value: string | number,
  ) => {
    setFoodItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const removeFoodItem = (id: string) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addFoodItem = () => {
    const newId = String(Date.now());
    setFoodItems((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        grams: 100,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
        source: "manual",
      },
    ]);
  };

  const totals = foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      sugar: acc.sugar + item.sugar,
      fiber: acc.fiber + item.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slotName = customSlotName || mealSlot;
    createMutation.mutate(
      {
        mealDate: date,
        mealTime: time,
        slotName,
        logSource: foodItems.every((f) => f.source === "library")
          ? "foodLibrary"
          : "manualEntry",
        noteText: notes || undefined,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbohydrates: totals.carbs,
        totalFat: totals.fat,
        totalSugar: totals.sugar,
        totalFiber: totals.fiber,
        lines: foodItems.map((f) => ({
          itemName: f.name,
          consumedGrams: f.grams,
          itemCalories: f.calories,
          itemProtein: f.protein,
          itemCarbohydrates: f.carbs,
          itemFat: f.fat,
          itemSugar: f.sugar,
          itemFiber: f.fiber,
          lineSource: f.source === "library" ? "foodLibrary" : "manualEntry",
        })),
      },
      {
        onSuccess: (res) => {
          const id = res.mealLog?.id;
          navigate(id ? `/meals/${id}` : "/meals");
        },
      },
    );
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { num: 1, icon: Calendar, label: "Date & Time" },
        { num: 2, icon: Clock, label: "Meal Slot" },
        { num: 3, icon: Sandwich, label: "Food Items" },
      ].map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <span
              className={`text-xs font-medium ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div
              className={`w-10 h-0.5 ${step > s.num ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const formContent = (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Log a Meal
        </h1>
        <p className="text-sm text-muted-foreground">
          Record what you ate — step by step.
        </p>
      </header>

      {stepIndicator}

      {/* STEP 1: Date & Time */}
      {step === 1 && (
        <form
          className="mt-10 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                When did you eat?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card px-3 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card px-3 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                Next: Meal Slot <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </form>
      )}

      {/* STEP 2: Meal Slot */}
      {step === 2 && (
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Which meal is this?
              </h2>
            </div>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
              {slotOptions.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setMealSlot(slot.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mealSlot === slot.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <span className="flex items-center gap-1.5">
                    <slot.icon className="w-4 h-4" />
                    {slot.label}
                  </span>
                </button>
              ))}
            </div>
            <div
              className={`space-y-2 ${mealSlot === "snack" ? "" : "hidden"}`}
            >
              <label className="block text-sm font-medium text-foreground">
                Custom Slot Name
              </label>
              <input
                type="text"
                value={customSlotName}
                onChange={(e) => setCustomSlotName(e.target.value)}
                placeholder="e.g. Post-workout shake"
                className="w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button type="submit">
                Next: Add Foods <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </form>
      )}

      {/* STEP 3: Food Items */}
      {step === 3 && (
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                3
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                What did you eat?
              </h2>
            </div>
            <div className="space-y-4">
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${item.source === "library" ? "bg-accent/30" : "bg-chart-3/20"}`}
                      >
                        {item.source === "library" ? (
                          <Sandwich className="w-5 h-5 text-accent-foreground" />
                        ) : (
                          <Salad className="w-5 h-5 text-chart-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateFoodItem(item.id, "name", e.target.value)
                          }
                          placeholder="Food name"
                          className="w-full bg-transparent border-none text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.source === "library"
                            ? "From food library"
                            : "Manual entry"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFoodItem(item.id)}
                      className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">
                      Amount
                    </label>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={item.grams}
                        min={1}
                        onChange={(e) =>
                          updateFoodItem(
                            item.id,
                            "grams",
                            Number(e.target.value),
                          )
                        }
                        className="w-full rounded-lg border border-input bg-card px-3 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        grams
                      </span>
                    </div>
                  </div>
                  <details className="group">
                    <summary className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none">
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      Nutrition snapshot (auto-calculated)
                    </summary>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: "Calories",
                          field: "calories" as const,
                          step: 1,
                        },
                        {
                          label: "Protein (g)",
                          field: "protein" as const,
                          step: 0.1,
                        },
                        {
                          label: "Carbs (g)",
                          field: "carbs" as const,
                          step: 0.1,
                        },
                        { label: "Fat (g)", field: "fat" as const, step: 0.1 },
                        {
                          label: "Sugar (g)",
                          field: "sugar" as const,
                          step: 0.1,
                        },
                        {
                          label: "Fiber (g)",
                          field: "fiber" as const,
                          step: 0.1,
                        },
                      ].map(({ label, field, step: s }) => (
                        <div key={field} className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            {label}
                          </label>
                          <input
                            type="number"
                            value={item[field]}
                            step={s}
                            onChange={(e) =>
                              updateFoodItem(
                                item.id,
                                field,
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded-md border border-input bg-muted/50 px-2.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow"
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
              <button
                type="button"
                onClick={addFoodItem}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                Add Another Food Item
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this meal..."
                className="w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-shadow resize-none"
              />
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Meal Totals
              </h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
                {[
                  { label: "Calories", value: totals.calories, unit: "" },
                  {
                    label: "Protein",
                    value: totals.protein.toFixed(1),
                    unit: "g",
                  },
                  { label: "Carbs", value: totals.carbs, unit: "g" },
                  { label: "Fat", value: totals.fat.toFixed(1), unit: "g" },
                  { label: "Sugar", value: totals.sugar, unit: "g" },
                  { label: "Fiber", value: totals.fiber.toFixed(1), unit: "g" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold text-foreground">
                      {value}
                      <span className="text-xs font-normal text-muted-foreground">
                        {unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button type="submit" className="shadow-md hover:shadow-lg">
                <Check className="w-4 h-4" />
                Log Meal
              </Button>
            </div>
          </section>
        </form>
      )}
    </div>
  );

  return (
    <>
      <div className="md:hidden flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto native-scroll pb-24 safe-bottom">
          <div className="pb-8 relative">
            <div
              className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            </div>
            {formContent}
          </div>
        </main>
      </div>

      <div className="hidden md:flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="pb-8 relative">
              <div
                className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
                aria-hidden="true"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
              </div>
              {formContent}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* Inline SVG-backed icon components — lucide-react doesn't export all needed icons */
function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
function BarChart2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}
function SaladIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 21h10" />
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
function UtensilsCrossedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 2v4a2 2 0 0 1-2 2h0a2 2 0 0 0-2 2v2" />
      <path d="M20 2v5a2 2 0 0 1-2 2h0a2 2 0 0 0-2 2v3" />
      <path d="m22 22-5-5" />
      <path d="M3 2v15a3 3 0 0 0 3 3h6" />
      <path d="M3 7h14" />
      <path d="M7 2v20" />
    </svg>
  );
}
function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5" />
      <path d="m22 17-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17" />
    </svg>
  );
}
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export default LogMealPage;
