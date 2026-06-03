"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/app/Context/AuthContext";
import type { Notification } from "@/app/types";
import {
  fetchNotifications as fetchNotificationsApi,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/lib/notificationsApi";

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const availabilityCheckedRef = useRef(false);

  const getErrorStatus = useCallback((err: unknown): number | undefined => {
    return typeof err === "object" && err !== null && "response" in err
      ? (err as { response?: { status?: number } }).response?.status
      : undefined;
  }, []);

  const getErrorCode = useCallback((err: unknown): string | undefined => {
    return typeof err === "object" && err !== null && "code" in err
      ? (err as { code?: string }).code
      : undefined;
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setError(null);
    setHasLoaded(false);
    setIsAvailable(true);
    availabilityCheckedRef.current = false;
  }, []);

  const handleNotificationError = useCallback((err: unknown, fallbackMessage: string) => {
    const status = getErrorStatus(err);
    const code = getErrorCode(err);
    const message =
      err instanceof Error ? err.message.toLowerCase() : "";

    if (status === 404) {
      setIsAvailable(false);
      setError(null);
      setHasLoaded(true);

      if (!availabilityCheckedRef.current) {
        console.info("Notifications endpoint is not available on the deployed backend yet.");
        availabilityCheckedRef.current = true;
      }

      return;
    }

    // When the device wakes up after a long sleep, the first polling request can
    // time out or hit a stale token before auth refresh catches up. Treat these
    // as transient so the UI recovers quietly on the next successful fetch.
    if (
      status === 401 ||
      code === "ECONNABORTED" ||
      code === "ERR_NETWORK" ||
      message.includes("timeout")
    ) {
      setError(null);
      return;
    }

    console.error(fallbackMessage, err);
    setError("Failed to load notifications.");
  }, [getErrorCode, getErrorStatus]);

  const fetchNotifications = useCallback(async () => {
    if (!user || !isAvailable) return;

    setIsLoading(true);
    try {
      const data = await fetchNotificationsApi();
      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.is_read).length);
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      handleNotificationError(err, "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [handleNotificationError, isAvailable, user]);

  const refreshUnreadCount = useCallback(async () => {
    if (!user || !isAvailable) return;

    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.unread_count);
      setError(null);
    } catch (err) {
      handleNotificationError(err, "Failed to refresh unread count");
    }
  }, [handleNotificationError, isAvailable, user]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!isAvailable) return;

      const target = notifications.find((notification) => notification.id === notificationId);
      if (!target || target.is_read) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
                read_at: notification.read_at ?? new Date().toISOString(),
              }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const updated = await markNotificationAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? updated : notification
          )
        );
        setError(null);
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 404
        ) {
          setIsAvailable(false);
          setError(null);
        } else {
          console.error("Failed to mark notification as read", err);
          setError("Failed to update notification.");
        }

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId ? target : notification
          )
        );
        setUnreadCount((prev) => prev + 1);
      }
    },
    [isAvailable, notifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0 || !isAvailable) return;

    const now = new Date().toISOString();
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.is_read
          ? notification
          : {
              ...notification,
              is_read: true,
              read_at: notification.read_at ?? now,
            }
      )
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
      setError(null);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        setIsAvailable(false);
        setError(null);
      } else {
        console.error("Failed to mark all notifications as read", err);
        setError("Failed to update notifications.");
      }

      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, [isAvailable, notifications, unreadCount, user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      clearNotifications();
      return;
    }

    void fetchNotifications();
  }, [authLoading, clearNotifications, fetchNotifications, user]);

  useEffect(() => {
    if (authLoading || !user || !isAvailable) return;

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [authLoading, fetchNotifications, isAvailable, user]);

  useEffect(() => {
    if (authLoading || !user || !isAvailable) return;

    const handleResume = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications();
      }
    };

    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);

    return () => {
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [authLoading, fetchNotifications, isAvailable, user]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isConnected: Boolean(user) && isAvailable && hasLoaded && !error,
      isLoading,
      error,
      fetchNotifications,
      refreshUnreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [
      error,
      fetchNotifications,
      hasLoaded,
      isAvailable,
      isLoading,
      markAllAsRead,
      markAsRead,
      notifications,
      refreshUnreadCount,
      unreadCount,
      user,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
};
