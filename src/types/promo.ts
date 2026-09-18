export type PromoDiscountType = 'fixed' | 'percent'

export type PromotionDto = {
  promotion_id: number
  code: string
  discount_type: PromoDiscountType
  discount_value: number
  quota_limit: number
  quota_used: number
  expires_at: string
  created_at: string
  updated_at: string
}

export type PromotionPayload = {
  code: string
  discount_type: PromoDiscountType
  discount_value: number
  quota_limit: number
  expires_at: string
}

export type PromotionApiEnvelope<T> = {
  success?: boolean
  message?: string | null
  data: T
  code?: string | null
  errors?: { field?: string; message: string }[] | null
}
