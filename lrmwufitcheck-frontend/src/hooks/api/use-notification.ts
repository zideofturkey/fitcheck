import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification-api";
import { useAuth } from "@/context/AuthContext";

export const notificationKeys = {
  all: () => ["notification"] as const,
  list: () => [...notificationKeys.all(), "list"] as const,
};

export const useListNotifications = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationService.list(1, 20),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
};

export const useMarkNotificationsSeen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      notificationService.markSeen(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.remove(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};
