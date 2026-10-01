import type { PromoDiscountType, PromotionPayload } from '@/types/promo'

export function formatPromoType(type: PromoDiscountType): string {
  return type === 'percent' ? 'Percent' : 'Fixed'
}

export function formatPromoDiscount(type: PromoDiscountType, value: number): string {
  const amount = Number(value).toFixed(2)
  return type === 'percent' ? `-${amount}%` : `-${amount}฿`
}

export function formatPromoQuota(used: number, limit: number, withUnit = false): string {
  const text = `${used}/${limit}`
  return withUnit ? `${text} ครั้ง` : text
}

export function parsePromoNumber(value: string): number | null {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }
  return parsed
}

export function combinePromoExpiry(date: Date | null, time: string | null): string | null {
  if (!date || !time) {
    return null
  }
  const [hourPart, minutePart] = time.split(':')
  const hours = Number(hourPart)
  const minutes = Number(minutePart)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null
  }
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  const year = next.getFullYear()
  const month = String(next.getMonth() + 1).padStart(2, '0')
  const day = String(next.getDate()).padStart(2, '0')
  const hh = String(next.getHours()).padStart(2, '0')
  const mm = String(next.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hh}:${mm}:00`
}

export function splitPromoExpiry(iso: string): { date: Date; time: string } {
  const date = new Date(iso)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return { date, time: `${hours}:${minutes}` }
}

export type PromoFormState = {
  code: string
  discountType: PromoDiscountType
  fixedValue: string
  percentValue: string
  quota: string
  expiryDate: Date | null
  expiryTime: string | null
}

export function buildPromoPayload(form: PromoFormState): { error: string } | { payload: PromotionPayload } {
  const code = form.code.trim().toUpperCase()
  if (!code) {
    return { error: 'กรุณากรอก Promotion Code' }
  }

  const amount = parsePromoNumber(form.discountType === 'percent' ? form.percentValue : form.fixedValue)
  if (amount == null || amount <= 0) {
    return { error: 'กรุณากรอกส่วนลดให้มากกว่า 0' }
  }
  if (form.discountType === 'percent' && amount > 100) {
    return { error: 'ส่วนลดแบบ Percent ต้องไม่เกิน 100%' }
  }

  const quotaLimit = parsePromoNumber(form.quota)
  if (quotaLimit == null || quotaLimit <= 0 || !Number.isInteger(quotaLimit)) {
    return { error: 'กรุณากรอกโควต้าการใช้เป็นจำนวนเต็มที่มากกว่า 0' }
  }

  const expiresAt = combinePromoExpiry(form.expiryDate, form.expiryTime)
  if (!expiresAt) {
    return { error: 'กรุณาเลือกวันและเวลาหมดอายุ' }
  }

  return {
    payload: {
      code,
      discount_type: form.discountType,
      discount_value: amount,
      quota_limit: quotaLimit,
      expires_at: expiresAt,
    },
  }
}
