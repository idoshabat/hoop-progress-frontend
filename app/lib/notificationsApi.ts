import api from "./axios";
import type { Notification } from "@/app/types";

/**
 * Fetch all notifications for the current user
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await api.get("notifications/");
  return res.data;
};

/**
 * Get unread notification count
 */
export const fetchUnreadCount = async (): Promise<{ unread_count: number }> => {
  const res = await api.get("notifications/unread_count/");
  return res.data;
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  const res = await api.post(`notifications/${notificationId}/mark_as_read/`);
  return res.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ marked_as_read: number }> => {
  const res = await api.post("notifications/mark_all_as_read/");
  return res.data;
};

/**
 * Delete a specific notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`notifications/${notificationId}/delete_notification/`);
};

/**
 * Delete all notifications for the user
 */
export const deleteAllNotifications = async (): Promise<{ deleted: number }> => {
  const res = await api.delete("notifications/delete_all/");
  return res.data;
};
