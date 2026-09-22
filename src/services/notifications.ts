import { apiFetch } from '@/services/api'
import type { NotificationItem, NotificationListResponse, UnreadCountResponse } from '@/types/notification'

export async function listNotifications(): Promise<NotificationItem[]> {
  const response = await apiFetch<NotificationListResponse>('/api/notifications')
  return response.data ?? []
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiFetch<UnreadCountResponse>('/api/notifications/unread-count')
  return response.data ?? 0
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiFetch<void>(`/api/notifications/${id}/read`, { method: 'PATCH' })
}
