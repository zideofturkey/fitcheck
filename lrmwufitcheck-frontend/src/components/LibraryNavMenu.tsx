import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, UtensilsCrossed, ClipboardList } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PopoverBackdrop from "@/components/PopoverBackdrop";

const LIBRARY_ROUTES = ["/food-library", "/dishes", "/preset-meals"];

const OPTIONS = [
  { to: "/food-library", icon: BookOpen, labelKey: "nav.foodLibrary" },
  { to: "/dishes", icon: UtensilsCrossed, labelKey: "nav.dishes" },
  { to: "/preset-meals", icon: ClipboardList, labelKey: "nav.presetMeals" },
];

/**
 * Mobile bottom-nav "Kütüphane" tab - instead of jumping straight to
 * /food-library, pops a small menu (Radix Popover, same primitive as
 * NotificationBell) offering the three library destinations, since Yemek
 * Kütüphanesi (dishes) and Hazır Öğünler (preset meals) were otherwise only
 * reachable via the desktop sidebar on mobile.
 */
export default function LibraryNavMenu({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = LIBRARY_ROUTES.some((r) => location.pathname === r);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverBackdrop open={open} />
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] transition-colors ${
            isActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={t("nav.library")}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">
            {t("nav.library")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={12}
        className="w-56 gap-1 overflow-hidden rounded-xl p-1.5 shadow-2xl"
      >
        {OPTIONS.map((opt) => {
          const active = location.pathname === opt.to;
          return (
            <button
              key={opt.to}
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(opt.to);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <opt.icon className="h-4 w-4 shrink-0" />
              {t(opt.labelKey)}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
