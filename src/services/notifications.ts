import { apiFetch } from '@/services/api'
import type { NotificationItem, NotificationListResponse, UnreadCountResponse } from '@/types/notification'

export async function listNotifications(): Promise<NotificationItem[]> {
  const response = await apiFetch<NotificationListResponse>('/api/notifications')
  return (response.data ?? []).map(mapNotification)
}

function mapNotification(item: NotificationItem): NotificationItem {
  const raw = item as NotificationItem & { job_id?: number | null; created_at?: string }
  return {
    ...item,
    jobId: item.jobId ?? raw.job_id ?? null,
    createdAt: item.createdAt ?? raw.created_at ?? '',
  }
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiFetch<UnreadCountResponse>('/api/notifications/unread-count')
  return response.data ?? 0
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiFetch<void>(`/api/notifications/${id}/read`, { method: 'PATCH' })
}
