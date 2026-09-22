export type NotificationItem = {
  id: number
  type: 'JOB_CREATED' | 'JOB_ACCEPTED' | 'JOB_COMPLETED' | 'JOB_CANCELLED'
  title: string
  body: string
  jobId: number | null
  read: boolean
  createdAt: string
}

export type NotificationListResponse = {
  message: string
  data: NotificationItem[]
}

export type UnreadCountResponse = {
  message: string
  data: number
}
