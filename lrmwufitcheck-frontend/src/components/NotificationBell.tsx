import { useState } from "react";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useListNotifications,
  useMarkNotificationsSeen,
} from "@/hooks/api/use-notification";

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data } = useListNotifications();
  const markSeenMutation = useMarkNotificationsSeen();

  const notifications = data?.data ?? [];
  const unseenIds = notifications.filter((n) => !n.isSeen).map((n) => n.id);
  const unseenCount = unseenIds.length;
  const locale = i18n.language?.startsWith("tr") ? tr : enUS;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unseenIds.length > 0) {
      markSeenMutation.mutate(unseenIds);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="tap-target-expand relative p-2 rounded-full hover:bg-muted transition-colors"
          aria-label={t("notifications.title")}
          title={t("notifications.title")}
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unseenCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold text-foreground">
            {t("notifications.title")}
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b border-border px-3 py-2.5 last:border-b-0 ${
                  n.isSeen ? "" : "bg-primary/5"
                }`}
              >
                <p className="text-sm font-medium text-foreground">
                  {n.title}
                </p>
                {n.body && (
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {n.body}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                    locale,
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
