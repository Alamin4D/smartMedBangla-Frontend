"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AppNotification } from "@/types";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (page: number, unread: boolean) => ["notifications", "list", page, unread] as const,
  count: ["notifications", "count"] as const,
};

export const useNotifications = (page: number, unread = false) =>
  useQuery({
    queryKey: notificationKeys.list(page, unread),
    queryFn: async () => {
      const res = await api.get<{ items: AppNotification[]; unread: number }>("/notifications", {
        page,
        limit: 15,
        unread: unread ? "true" : undefined,
      });
      return { ...res.data, meta: res.meta };
    },
    placeholderData: (prev) => prev,
  });

export const useUnreadCount = (enabled = true) =>
  useQuery({
    queryKey: notificationKeys.count,
    queryFn: async () => (await api.get<{ count: number }>("/notifications/unread-count")).data.count,
    refetchInterval: 30_000,
    enabled,
  });

function useNotificationMutation<T>(fn: (input: T) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export const useMarkRead = () => useNotificationMutation((id: string) => api.patch(`/notifications/${id}/read`));
export const useMarkAllRead = () => useNotificationMutation(() => api.patch("/notifications/read-all"));
export const useDeleteNotification = () => useNotificationMutation((id: string) => api.delete(`/notifications/${id}`));
