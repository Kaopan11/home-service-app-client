import { cloneSeedPromos } from '@/data/adminPromos'
import { apiFetch } from '@/services/api'
import { ApiError, isApiError } from '@/types/auth'
import type { PromoDiscountType, PromotionApiEnvelope, PromotionDto, PromotionPayload } from '@/types/promo'

const STORAGE_KEY = 'home-service.admin-promos'
const NOT_FOUND_MESSAGE = 'ไม่พบข้อมูล Promotion Code'

type RawPromo = Partial<PromotionDto> & {
  id?: number
  type?: string
  discountType?: string
  discountValue?: number
  quotaLimit?: number
  quotaUsed?: number
  expiresAt?: string
  createdAt?: string
  updatedAt?: string
}

let mockMode: boolean | null = null
let mockItems = loadMockItems()

function loadMockItems(): PromotionDto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as RawPromo[]
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map(normalizePromo)
      }
    }
  } catch {
    /* keep seed */
  }
  return cloneSeedPromos()
}

function persistMock(items: PromotionDto[]): void {
  mockItems = items
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function isUnavailable(error: unknown): boolean {
  return isApiError(error) && (error.status === 0 || error.status === 404 || error.status === 501)
}

function unwrap<T>(response: PromotionApiEnvelope<T>, fallback: string): T {
  if (response?.success === false) {
    throw new ApiError(400, response.message || fallback, response.code ?? undefined)
  }
  if (response?.data == null) {
    throw new ApiError(400, fallback)
  }
  return response.data
}

function normalizeType(value: unknown): PromoDiscountType {
  return String(value).toLowerCase() === 'percent' ? 'percent' : 'fixed'
}

function normalizePromo(raw: RawPromo): PromotionDto {
  return {
    promotion_id: Number(raw.promotion_id ?? raw.id),
    code: String(raw.code ?? ''),
    discount_type: normalizeType(raw.discount_type ?? raw.type ?? raw.discountType),
    discount_value: Number(raw.discount_value ?? raw.discountValue ?? 0),
    quota_limit: Number(raw.quota_limit ?? raw.quotaLimit ?? 0),
    quota_used: Number(raw.quota_used ?? raw.quotaUsed ?? 0),
    expires_at: String(raw.expires_at ?? raw.expiresAt ?? ''),
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
  }
}

function mapPromoError(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback
  }
  if (error.code === 'PROMO_CODE_EXISTS') {
    return error.message || 'Promotion Code นี้มีอยู่แล้ว'
  }
  if (error.status === 404) {
    return NOT_FOUND_MESSAGE
  }
  if (error.errors?.length) {
    return error.errors[0].message || fallback
  }
  return error.message || fallback
}

function wrapError(error: unknown, fallback: string): ApiError {
  return new ApiError(
    isApiError(error) ? error.status : 0,
    mapPromoError(error, fallback),
    isApiError(error) ? error.code : undefined,
    isApiError(error) ? error.errors : undefined,
  )
}

function assertUniqueCode(code: string, ignoreId?: number): void {
  const exists = mockItems.some(
    (item) => item.code.toLowerCase() === code.toLowerCase() && item.promotion_id !== ignoreId,
  )
  if (exists) {
    throw new ApiError(409, 'Promotion Code นี้มีอยู่แล้ว', 'PROMO_CODE_EXISTS')
  }
}

function mockList(): PromotionDto[] {
  return mockItems.map((item) => ({ ...item }))
}

function mockGet(id: number): PromotionDto {
  const item = mockItems.find((row) => row.promotion_id === id)
  if (!item) {
    throw new ApiError(404, NOT_FOUND_MESSAGE)
  }
  return { ...item }
}

function mockCreate(payload: PromotionPayload): PromotionDto {
  assertUniqueCode(payload.code)
  const now = new Date().toISOString()
  const item: PromotionDto = {
    promotion_id: Math.max(0, ...mockItems.map((row) => row.promotion_id)) + 1,
    code: payload.code,
    discount_type: payload.discount_type,
    discount_value: payload.discount_value,
    quota_limit: payload.quota_limit,
    quota_used: 0,
    expires_at: payload.expires_at,
    created_at: now,
    updated_at: now,
  }
  persistMock([item, ...mockItems])
  return { ...item }
}

function mockUpdate(id: number, payload: PromotionPayload): PromotionDto {
  const index = mockItems.findIndex((row) => row.promotion_id === id)
  if (index < 0) {
    throw new ApiError(404, NOT_FOUND_MESSAGE)
  }
  assertUniqueCode(payload.code, id)
  const current = mockItems[index]
  const next: PromotionDto = {
    ...current,
    ...payload,
    quota_used: Math.min(current.quota_used, payload.quota_limit),
    updated_at: new Date().toISOString(),
  }
  const items = [...mockItems]
  items[index] = next
  persistMock(items)
  return { ...next }
}

function mockDelete(id: number): void {
  const exists = mockItems.some((row) => row.promotion_id === id)
  if (!exists) {
    throw new ApiError(404, NOT_FOUND_MESSAGE)
  }
  persistMock(mockItems.filter((row) => row.promotion_id !== id))
}

export async function listPromotions(): Promise<PromotionDto[]> {
  if (mockMode) {
    return mockList()
  }
  try {
    const response = await apiFetch<PromotionApiEnvelope<RawPromo[]>>('/api/admin/promotions')
    const data = unwrap(response, 'ไม่สามารถโหลดข้อมูล Promotion Code ได้')
    mockMode = false
    return data.map(normalizePromo)
  } catch (error) {
    if (isUnavailable(error)) {
      mockMode = true
      return mockList()
    }
    throw wrapError(error, 'ไม่สามารถโหลดข้อมูล Promotion Code ได้')
  }
}

export async function getPromotion(id: number): Promise<PromotionDto> {
  if (mockMode) {
    return mockGet(id)
  }
  try {
    const response = await apiFetch<PromotionApiEnvelope<RawPromo>>(`/api/admin/promotions/${id}`)
    return normalizePromo(unwrap(response, 'ไม่สามารถโหลดรายละเอียด Promotion Code ได้'))
  } catch (error) {
    if (isUnavailable(error)) {
      mockMode = true
      return mockGet(id)
    }
    throw wrapError(error, 'ไม่สามารถโหลดรายละเอียด Promotion Code ได้')
  }
}

export async function createPromotion(payload: PromotionPayload): Promise<PromotionDto> {
  if (mockMode) {
    return mockCreate(payload)
  }
  try {
    const response = await apiFetch<PromotionApiEnvelope<RawPromo>>('/api/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return normalizePromo(unwrap(response, 'ไม่สามารถสร้าง Promotion Code ได้'))
  } catch (error) {
    if (isUnavailable(error)) {
      mockMode = true
      return mockCreate(payload)
    }
    throw wrapError(error, 'ไม่สามารถสร้าง Promotion Code ได้')
  }
}

export async function updatePromotion(id: number, payload: PromotionPayload): Promise<PromotionDto> {
  if (mockMode) {
    return mockUpdate(id, payload)
  }
  try {
    const response = await apiFetch<PromotionApiEnvelope<RawPromo>>(`/api/admin/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return normalizePromo(unwrap(response, 'ไม่สามารถแก้ไข Promotion Code ได้'))
  } catch (error) {
    if (isUnavailable(error)) {
      mockMode = true
      return mockUpdate(id, payload)
    }
    throw wrapError(error, 'ไม่สามารถแก้ไข Promotion Code ได้')
  }
}

export async function deletePromotion(id: number): Promise<void> {
  if (mockMode) {
    mockDelete(id)
    return
  }
  try {
    await apiFetch<PromotionApiEnvelope<null>>(`/api/admin/promotions/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    if (isUnavailable(error)) {
      mockMode = true
      mockDelete(id)
      return
    }
    throw wrapError(error, 'ไม่สามารถลบ Promotion Code ได้')
  }
}
