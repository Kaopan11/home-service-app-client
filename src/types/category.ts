export type CategoryDto = {
  category_id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CategoryApiEnvelope<T> = {
  success: boolean
  message?: string | null
  data: T
  code?: string | null
  errors?: { message: string }[] | null
}
