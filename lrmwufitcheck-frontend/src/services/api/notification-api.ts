/**
 * Custom service for lrmwufitcheck-notification's in-app notification list -
 * see lrmwufitcheck-notification/src/routes/notification.route.js.
 * Not a Mindbricks Manager - plain REST endpoints with their own response
 * shape ({ data, meta } rather than the { status: "OK" } envelope).
 */
import { notificationApi } from "@/lib/service-client";

export type AppNotificationType = "approved" | "rejected" | "feature";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string | null;
  isSeen: boolean;
  metadata: (Record<string, unknown> & { type?: AppNotificationType }) | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const notificationService = {
  /** GET /notifications */
  list: async (
    page = 1,
    limit = 10,
  ): Promise<NotificationListResponse> => {
    return notificationApi.get<NotificationListResponse>("notifications", {
      params: { page, limit },
    });
  },

  /** POST /notifications/seen */
  markSeen: async (notificationIds: string[]): Promise<void> => {
    await notificationApi.post("notifications/seen", { notificationIds });
  },

  /** DELETE /notifications/:notificationId */
  remove: async (notificationId: string): Promise<void> => {
    await notificationApi.delete(`notifications/${notificationId}`);
  },
};

export default notificationService;
