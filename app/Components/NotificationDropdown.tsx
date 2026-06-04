'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/Context/AuthContext';
import { useLanguage } from '@/app/Context/LanguageContext';
import type { Notification } from '@/app/types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: number) => Promise<void> | void;
  onClose: () => void;
}

function getNotificationIcon(type: string) {
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
}

function getNotificationLink(notification: Notification, role?: 'PLAYER' | 'COACH') {
  switch (notification.notification_type) {
    case 'WORKOUT_ASSIGNED':
    case 'WORKOUT_COMPLETED':
    case 'SESSION_ADDED':
      return `/workouts/${notification.related_workout}`;
    case 'CONNECTION_ACCEPTED':
      if (notification.related_user_username) {
        const targetRole = role === 'COACH' ? 'player' : 'coach';
        return `/profile-lookup?role=${targetRole}&username=${encodeURIComponent(notification.related_user_username)}`;
      }
      return role === 'COACH' ? '/coach-dashboard/manage' : '/my-coaches/manage';
    case 'CONNECTION_REQUESTED':
      return role === 'COACH' ? '/coach-dashboard/manage' : '/my-coaches/manage';
    default:
      return '#';
  }
}

function formatTime(dateString: string, locale: string, isHebrew: boolean): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return isHebrew ? 'כרגע' : 'just now';
  if (diffMins < 60) return isHebrew ? `לפני ${diffMins} דק׳` : `${diffMins}m ago`;
  if (diffHours < 24) return isHebrew ? `לפני ${diffHours} שעות` : `${diffHours}h ago`;
  if (diffDays < 7) return isHebrew ? `לפני ${diffDays} ימים` : `${diffDays}d ago`;

  return date.toLocaleDateString(locale);
}

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onClose,
}: NotificationDropdownProps) {
  const { user } = useAuth();
  const { isHebrew, language } = useLanguage();

  const text = useMemo(
    () =>
      isHebrew
        ? {
            title: 'התראות',
            empty: 'אין התראות עדיין',
            unread: 'חדש',
            markRead: 'סמן כנקרא',
            viewAll: 'לכל ההתראות',
          }
        : {
            title: 'Notifications',
            empty: 'No notifications yet',
            unread: 'New',
            markRead: 'Mark as read',
            viewAll: 'View all notifications',
          },
    [isHebrew]
  );

  const locale = language === 'he' ? 'he-IL' : 'en-US';

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
      <div className="fixed inset-0 z-40" onClick={handleOutsideClick} />

      <div
        className={`absolute z-50 mt-2 w-[min(24rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950 shadow-[0_24px_60px_rgba(0,0,0,0.45)] ${
          isHebrew ? 'left-0' : 'right-0'
        }`}
      >
        <div className="border-b border-zinc-800 bg-linear-to-r from-zinc-950 to-zinc-900 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-stone-100">{text.title}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-amber-300/70">
                {notifications.length} items
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-zinc-700 px-3 py-1 text-stone-400 transition hover:text-stone-200"
            >
              ✕
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="px-6 py-10 text-center text-stone-500">{text.empty}</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-b border-zinc-800/80 px-4 py-4 transition hover:bg-zinc-900/70 ${
                  notification.is_read ? 'bg-transparent' : 'bg-amber-500/6'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-2xl">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  <Link
                    href={getNotificationLink(notification, user?.role)}
                    onClick={onClose}
                    className="block min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-stone-100">{notification.title}</p>
                      {!notification.is_read ? (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                          {text.unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-400">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-stone-500">
                      {formatTime(notification.created_at, locale, isHebrew)}
                    </p>
                  </Link>

                  {!notification.is_read ? (
                    <button
                      onClick={(e) => void handleMarkAsRead(e, notification.id)}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-stone-300 transition hover:text-stone-100"
                      title={text.markRead}
                    >
                      {text.markRead}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 ? (
          <div className="border-t border-zinc-800 bg-zinc-900/80 p-3 text-center">
            <Link
              href="/notifications"
              onClick={onClose}
              className="text-sm font-medium text-amber-300 transition hover:text-amber-200"
            >
              {text.viewAll}
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
