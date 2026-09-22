import { apiFetch } from '@/services/api'
import { ApiError, isApiError } from '@/types/auth'
import type { AdminServiceItem, AdminServiceListResponse, AdminServiceResponse } from '@/types/adminService'

export async function listAdminServices(): Promise<AdminServiceItem[]> {
  try {
    const response = await apiFetch<AdminServiceListResponse>('/api/admin/services')
    return response.data ?? []
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถโหลดข้อมูลบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function getAdminService(id: number): Promise<AdminServiceItem> {
  try {
    const response = await apiFetch<AdminServiceResponse>(`/api/admin/services/${id}`)
    return response.data
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถโหลดรายละเอียดบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function createAdminService(name: string, categoryId: number): Promise<AdminServiceItem> {
  try {
    const response = await apiFetch<AdminServiceResponse>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify({ name, category_id: categoryId }),
    })
    return response.data
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถเพิ่มบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function updateAdminService(id: number, name: string, categoryId: number): Promise<AdminServiceItem> {
  try {
    const response = await apiFetch<AdminServiceResponse>(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, category_id: categoryId }),
    })
    return response.data
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถแก้ไขบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function deleteAdminService(id: number): Promise<void> {
  try {
    await apiFetch<void>(`/api/admin/services/${id}`, { method: 'DELETE' })
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      throw new ApiError(404, 'ไม่พบข้อมูลบริการ')
    }
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถลบบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}
