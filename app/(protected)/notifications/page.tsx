'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/app/hooks/useNotifications';
import Link from 'next/link';
import EmptyState from '@/app/Components/EmptyState';
import type { Notification } from '@/app/types';

export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    fetchNotifications,
    markAllAsRead,
    isLoading,
  } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();
      setLoading(false);
    };

    void loadNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {notifications.some((notification) => !notification.is_read) && (
            <button
              onClick={() => void markAllAsRead()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading && !loading ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Refreshing notifications...
          </div>
        ) : null}

        {notifications.length === 0 ? (
          <EmptyState
            eyebrow="Activity Feed"
            icon="📭"
            title="No notifications yet"
            description="You&apos;ll see notifications here when coaches assign workouts, players complete sessions, or connection requests happen."
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-6 transition-all ${
                  !notification.is_read ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {notification.title}
                        </h3>
                        <p className="text-gray-700 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => void handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}

                        <Link
                          href={getNotificationLink(notification)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
