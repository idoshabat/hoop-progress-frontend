'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/Context/LanguageContext';
import type { Notification } from '@/app/types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: number) => Promise<void> | void;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'WORKOUT_ASSIGNED':
      return '📋';
    case 'WORKOUT_COMPLETED':
      return '✅';
    case 'SESSION_ADDED':
      return '🏀';
    case 'CONNECTION_ACCEPTED':
      return '👥';
    case 'CONNECTION_REQUESTED':
      return '🤝';
    default:
      return '📢';
  }
};

const getNotificationLink = (notification: Notification) => {
  switch (notification.notification_type) {
    case 'WORKOUT_ASSIGNED':
    case 'WORKOUT_COMPLETED':
    case 'SESSION_ADDED':
      return `/workouts/${notification.related_workout}`;
    case 'CONNECTION_ACCEPTED':
    case 'CONNECTION_REQUESTED':
      return '/my-coaches';
    default:
      return '#';
  }
};

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onClose,
}: NotificationDropdownProps) {
  const { isHebrew } = useLanguage();

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    await onMarkAsRead(notificationId);
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay to close dropdown on outside click */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleOutsideClick}
      />

      {/* Dropdown Panel */}
      <div
        className={`absolute mt-2 z-50 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-2xl w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] ${
          isHebrew ? "left-0" : "right-0"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  <Link
                    href={getNotificationLink(notification)}
                    onClick={onClose}
                    className="block flex-1 min-w-0"
                  >
                    <p className="font-semibold text-gray-900 text-sm">
                      {notification.title}
                    </p>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(notification.created_at)}
                    </p>
                  </Link>

                  {!notification.is_read && (
                    <button
                      onClick={(e) => void handleMarkAsRead(e, notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-xl font-bold flex-shrink-0"
                      title="Mark as read"
                    >
                      ●
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer - View All Link */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 p-3 text-center bg-gray-50">
            <Link
              href="/notifications"
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
