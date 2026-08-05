import { useState } from "react";
import { Bell, CircleCheck, XCircle, Sparkles, Info, X, Loader } from "lucide-react";
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
  useDeleteNotification,
} from "@/hooks/api/use-notification";
import type { AppNotificationType } from "@/services/api/notification-api";

const TYPE_ICON: Record<
  AppNotificationType,
  { Icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  approved: { Icon: CircleCheck, className: "text-green-600 bg-green-100" },
  rejected: { Icon: XCircle, className: "text-destructive bg-destructive/10" },
  feature: { Icon: Sparkles, className: "text-foreground bg-muted" },
};

function NotificationTypeIcon({ type }: { type?: AppNotificationType }) {
  const entry = type ? TYPE_ICON[type] : undefined;
  const Icon = entry?.Icon ?? Info;
  const className = entry?.className ?? "text-muted-foreground bg-muted";
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${className}`}
      aria-hidden="true"
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data } = useListNotifications();
  const markSeenMutation = useMarkNotificationsSeen();
  const deleteMutation = useDeleteNotification();

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
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-80 gap-0 overflow-hidden rounded-xl p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3.5 py-3">
          <p className="text-sm font-semibold text-foreground">
            {t("notifications.title")}
          </p>
          {unseenCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {t("notifications.unseenCount", { count: unseenCount })}
            </span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3.5 py-8 text-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </p>
          ) : (
            notifications.map((n) => {
              const type = n.metadata?.type;
              const isDeleting =
                deleteMutation.isPending &&
                deleteMutation.variables === n.id;
              return (
                <div
                  key={n.id}
                  className={`group relative flex gap-2.5 border-b border-border px-3.5 py-3 last:border-b-0 transition-colors hover:bg-muted/40 ${
                    n.isSeen ? "" : "bg-primary/5"
                  }`}
                >
                  <NotificationTypeIcon type={type} />
                  <div className="min-w-0 flex-1 pr-6">
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
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
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(n.id)}
                    disabled={isDeleting}
                    className="tap-target-expand absolute right-2.5 top-3 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
                    aria-label={t("notifications.delete")}
                    title={t("notifications.delete")}
                  >
                    {isDeleting ? (
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
