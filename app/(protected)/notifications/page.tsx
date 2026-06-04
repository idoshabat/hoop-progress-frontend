'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import EmptyState from '@/app/Components/EmptyState';
import PageHero from '@/app/Components/PageHero';
import SearchToolbar from '@/app/Components/SearchToolbar';
import SectionSurface from '@/app/Components/SectionSurface';
import StatCard from '@/app/Components/StatCard';
import { useLanguage } from '@/app/Context/LanguageContext';
import { useNotifications } from '@/app/hooks/useNotifications';
import type { Notification } from '@/app/types';

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

function getNotificationLink(notification: Notification) {
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
}

function getNotificationTone(type: string) {
  switch (type) {
    case 'WORKOUT_ASSIGNED':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    case 'WORKOUT_COMPLETED':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    case 'SESSION_ADDED':
      return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
    case 'CONNECTION_ACCEPTED':
    case 'CONNECTION_REQUESTED':
      return 'bg-violet-500/10 text-violet-300 border-violet-500/20';
    default:
      return 'bg-zinc-800 text-stone-300 border-zinc-700';
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
  if (diffMins < 60) return isHebrew ? `לפני ${diffMins} דק׳` : `${diffMins} minutes ago`;
  if (diffHours < 24) return isHebrew ? `לפני ${diffHours} שעות` : `${diffHours} hours ago`;
  if (diffDays < 7) return isHebrew ? `לפני ${diffDays} ימים` : `${diffDays} days ago`;

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { isHebrew, language } = useLanguage();
  const {
    notifications,
    markAsRead,
    fetchNotifications,
    markAllAsRead,
    isLoading,
  } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  const text = useMemo(
    () =>
      isHebrew
        ? {
            title: 'התראות',
            subtitle: 'כל הפעילות החשובה שלך מרוכזת כאן: אימונים, סשנים, חיבורים ועדכונים.',
            eyebrow: 'מרכז הפעילות',
            badge: 'Inbox',
            unread: 'לא נקראו',
            total: 'סה"כ התראות',
            read: 'נקראו',
            markAll: 'סמן הכול כנקרא',
            markOne: 'סמן כנקרא',
            view: 'פתח',
            searchPlaceholder: 'חפש התראה לפי כותרת או תוכן',
            allStatuses: 'הכול',
            unreadOnly: 'לא נקראו',
            readOnly: 'נקראו',
            refreshing: 'מרענן התראות...',
            loading: 'טוען התראות...',
            emptyEyebrow: 'פיד פעילות',
            emptyTitle: 'עדיין אין התראות',
            emptyDescription:
              'כאן יופיעו עדכונים כשמאמנים יקצו אימונים, שחקנים ישלימו סשנים או כשיהיו בקשות חיבור.',
          }
        : {
            title: 'Notifications',
            subtitle: 'All of your important activity lives here: workouts, sessions, connections, and updates.',
            eyebrow: 'Activity Center',
            badge: 'Inbox',
            unread: 'Unread',
            total: 'Total Notifications',
            read: 'Read',
            markAll: 'Mark all as read',
            markOne: 'Mark as read',
            view: 'Open',
            searchPlaceholder: 'Search notifications by title or message',
            allStatuses: 'All',
            unreadOnly: 'Unread',
            readOnly: 'Read',
            refreshing: 'Refreshing notifications...',
            loading: 'Loading notifications...',
            emptyEyebrow: 'Activity Feed',
            emptyTitle: 'No notifications yet',
            emptyDescription:
              "You'll see updates here when coaches assign workouts, players complete sessions, or connection requests happen.",
          },
    [isHebrew]
  );

  useEffect(() => {
    const loadNotifications = async () => {
      await fetchNotifications();
      setLoading(false);
    };

    void loadNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const readCount = notifications.length - unreadCount;
  const locale = language === 'he' ? 'he-IL' : 'en-US';
  const filteredNotifications = notifications.filter((notification) => {
    const matchesQuery = `${notification.title} ${notification.message}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unread' && !notification.is_read) ||
      (statusFilter === 'read' && notification.is_read);

    return matchesQuery && matchesStatus;
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageHero
          eyebrow={text.eyebrow}
          title={text.title}
          description={text.subtitle}
          badge={text.badge}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={text.total} value="..." />
            <StatCard label={text.unread} value="..." accent />
            <StatCard label={text.read} value="..." />
          </div>
        </PageHero>
        <div className="mt-8 rounded-[1.75rem] border border-zinc-800 bg-zinc-950/70 px-6 py-14 text-center shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500" />
          <p className="mt-4 text-stone-400">{text.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <PageHero
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.subtitle}
        badge={text.badge}
        action={
          unreadCount > 0 ? (
            <button
              onClick={() => void markAllAsRead()}
              className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-zinc-950 shadow-[0_12px_30px_rgba(245,158,11,0.2)] transition hover:bg-amber-400"
            >
              {text.markAll}
            </button>
          ) : null
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label={text.total} value={notifications.length} />
          <StatCard label={text.unread} value={unreadCount} accent />
          <StatCard label={text.read} value={readCount} />
        </div>
      </PageHero>

      {isLoading ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-200">
          {text.refreshing}
        </div>
      ) : null}

      <SectionSurface
        title={text.title}
        description={isHebrew ? 'מעקב כרונולוגי ונוח אחרי כל מה שקורה בחשבון שלך.' : 'A cleaner chronological view of everything happening on your account.'}
      >
        <div className="space-y-5">
        <SearchToolbar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          placeholder={text.searchPlaceholder}
        >
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-950 text-stone-300'
            }`}
          >
            {text.allStatuses}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === 'unread'
                ? 'bg-amber-500 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-950 text-stone-300'
            }`}
          >
            {text.unreadOnly}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === 'read'
                ? 'bg-amber-500 text-zinc-950'
                : 'border border-zinc-700 bg-zinc-950 text-stone-300'
            }`}
          >
            {text.readOnly}
          </button>
        </SearchToolbar>

        {filteredNotifications.length === 0 ? (
          <EmptyState
            eyebrow={text.emptyEyebrow}
            icon="📭"
            title={text.emptyTitle}
            description={text.emptyDescription}
          />
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[1.5rem] border p-5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition ${
                  notification.is_read
                    ? 'border-zinc-800 bg-zinc-950/70'
                    : 'border-amber-500/25 bg-linear-to-br from-amber-500/8 to-zinc-950'
                }`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-3xl shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-stone-100">
                            {notification.title}
                          </h3>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getNotificationTone(
                              notification.notification_type
                            )}`}
                          >
                            {notification.notification_type.replaceAll('_', ' ')}
                          </span>
                          {!notification.is_read ? (
                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                              {text.unread}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 max-w-3xl leading-7 text-stone-300">
                          {notification.message}
                        </p>
                        <p className="mt-3 text-sm text-stone-500">
                          {formatTime(notification.created_at, locale, isHebrew)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.is_read ? (
                          <button
                            onClick={() => void markAsRead(notification.id)}
                            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-zinc-600 hover:text-stone-100"
                          >
                            {text.markOne}
                          </button>
                        ) : null}

                        <Link
                          href={getNotificationLink(notification)}
                          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
                        >
                          {text.view}
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
      </SectionSurface>
    </div>
  );
}
