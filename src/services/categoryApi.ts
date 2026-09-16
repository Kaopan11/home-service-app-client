import { apiFetch } from '@/services/api'
import { ApiError, isApiError } from '@/types/auth'
import type { CategoryApiEnvelope, CategoryDto } from '@/types/category'

const INACTIVE_MESSAGE = 'Category ดังกล่าวอยู่ในสถานะ Inactive โปรดแก้ไขผ่านทาง Database'
const NOT_FOUND_MESSAGE = 'ไม่พบข้อมูลหมวดหมู่'

function unwrap<T>(response: CategoryApiEnvelope<T>, fallback: string): T {
  if (!response?.success) {
    throw new ApiError(400, response?.message || fallback, response?.code ?? undefined)
  }
  return response.data
}

export function mapCategoryError(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback
  }
  if (error.code === 'CATEGORY_INACTIVE') {
    return INACTIVE_MESSAGE
  }
  if (error.code === 'CATEGORY_NAME_EXISTS') {
    return error.message || 'ชื่อหมวดหมู่นี้มีอยู่แล้ว'
  }
  if (error.status === 404) {
    return NOT_FOUND_MESSAGE
  }
  if (error.errors?.length) {
    return error.errors[0].message || fallback
  }
  return error.message || fallback
}

export async function listCategories(): Promise<CategoryDto[]> {
  try {
    const response = await apiFetch<CategoryApiEnvelope<CategoryDto[]>>('/api/admin/categories')
    const data = unwrap(response, 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้')
    return data.filter((item) => item.is_active)
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      mapCategoryError(error, 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้'),
      isApiError(error) ? error.code : undefined,
      isApiError(error) ? error.errors : undefined,
    )
  }
}

export async function getCategory(id: number): Promise<CategoryDto> {
  try {
    const response = await apiFetch<CategoryApiEnvelope<CategoryDto>>(`/api/admin/categories/${id}`)
    const data = unwrap(response, 'ไม่สามารถโหลดรายละเอียดหมวดหมู่ได้')
    if (!data.is_active) {
      throw new ApiError(409, INACTIVE_MESSAGE, 'CATEGORY_INACTIVE')
    }
    return data
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      mapCategoryError(error, 'ไม่สามารถโหลดรายละเอียดหมวดหมู่ได้'),
      isApiError(error) ? error.code : undefined,
      isApiError(error) ? error.errors : undefined,
    )
  }
}

export async function createCategory(name: string): Promise<CategoryDto> {
  try {
    const response = await apiFetch<CategoryApiEnvelope<CategoryDto>>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    return unwrap(response, 'ไม่สามารถสร้างหมวดหมู่ได้')
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      mapCategoryError(error, 'ไม่สามารถสร้างหมวดหมู่ได้'),
      isApiError(error) ? error.code : undefined,
      isApiError(error) ? error.errors : undefined,
    )
  }
}

export async function updateCategory(id: number, name: string): Promise<CategoryDto> {
  try {
    const response = await apiFetch<CategoryApiEnvelope<CategoryDto>>(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
    return unwrap(response, 'ไม่สามารถแก้ไขหมวดหมู่ได้')
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      mapCategoryError(error, 'ไม่สามารถแก้ไขหมวดหมู่ได้'),
      isApiError(error) ? error.code : undefined,
      isApiError(error) ? error.errors : undefined,
    )
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    await apiFetch<CategoryApiEnvelope<null>>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      mapCategoryError(error, 'ไม่สามารถลบหมวดหมู่ได้'),
      isApiError(error) ? error.code : undefined,
      isApiError(error) ? error.errors : undefined,
    )
  }
}
