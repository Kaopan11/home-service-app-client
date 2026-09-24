import { apiFetch } from '@/services/api'
import { ApiError, isApiError } from '@/types/auth'
import type {
  AdminServiceItem,
  AdminServiceListResponse,
  AdminServiceResponse,
  SaveAdminServiceInput,
} from '@/types/adminService'

export async function listAdminServices(): Promise<AdminServiceItem[]> {
  try {
    const response = await apiFetch<AdminServiceListResponse>('/api/admin/services')
    return (response.data ?? []).map(mapAdminService)
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถโหลดข้อมูลบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function reorderAdminServices(ids: number[]): Promise<AdminServiceItem[]> {
  try {
    const response = await apiFetch<AdminServiceListResponse>('/api/admin/services', {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    })
    return (response.data ?? []).map(mapAdminService)
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถเรียงลำดับบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function getAdminService(id: number): Promise<AdminServiceItem> {
  try {
    const response = await apiFetch<AdminServiceResponse>(`/api/admin/services/${id}`)
    return mapAdminService(response.data)
  } catch (error) {
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถโหลดรายละเอียดบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}

export async function createAdminService(input: SaveAdminServiceInput): Promise<AdminServiceItem> {
  try {
    const response = await apiFetch<AdminServiceResponse>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        category_id: input.categoryId,
        image_url: input.imageUrl,
        options: input.options,
      }),
    })
    return response.data
  } catch (error) {
    throw mapSaveError(error, 'ไม่สามารถเพิ่มบริการได้')
  }
}

export async function updateAdminService(id: number, input: SaveAdminServiceInput): Promise<AdminServiceItem> {
  try {
    const response = await apiFetch<AdminServiceResponse>(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        category_id: input.categoryId,
        image_url: input.imageUrl,
        options: input.options,
      }),
    })
    return response.data
  } catch (error) {
    throw mapSaveError(error, 'ไม่สามารถแก้ไขบริการได้')
  }
}

function mapAdminService(data: AdminServiceItem): AdminServiceItem {
  const raw = data as AdminServiceItem & {
    category_id?: number
    sort_order?: number
    image_url?: string | null
    created_at?: string
    updated_at?: string
  }
  return {
    ...data,
    categoryId: data.categoryId ?? raw.category_id,
    sortOrder: data.sortOrder ?? raw.sort_order,
    imageUrl: data.imageUrl ?? raw.image_url ?? '',
    createdAt: data.createdAt ?? raw.created_at,
    updatedAt: data.updatedAt ?? raw.updated_at,
    options: [...(data.options ?? [])]
      .map((option) => ({
        ...option,
        displayOrder:
          option.displayOrder ??
          (option as AdminServiceOption & { display_order?: number }).display_order,
      }))
      .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0)),
  }
}

function mapSaveError(error: unknown, fallback: string): ApiError {
  if (isApiError(error) && /at least one service option/i.test(error.message)) {
    return new ApiError(error.status, 'กรุณากรอกรายการบริการย่อยอย่างน้อย 1 รายการ')
  }
  if (isApiError(error) && (error.status === 413 || error.status === 400) && /image|too large|exceed/i.test(error.message)) {
    return new ApiError(error.status, 'บันทึกรูปไม่สำเร็จ ลองใช้ไฟล์ PNG/JPG ที่เล็กกว่า 5MB')
  }
  if (isApiError(error) && (error.status === 413 || /too long for type character varying/i.test(error.message))) {
    return new ApiError(error.status, 'บันทึกรูปไม่สำเร็จ เพราะขนาดข้อมูลใหญ่เกินที่ระบบรับได้')
  }
  return new ApiError(
    isApiError(error) ? error.status : 0,
    isApiError(error) ? error.message : fallback,
    isApiError(error) ? error.code : undefined,
  )
}

export async function deleteAdminService(id: number): Promise<void> {
  try {
    await apiFetch<void>(`/api/admin/services/${id}`, { method: 'DELETE' })
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      throw new ApiError(404, 'ไม่พบข้อมูลบริการ')
    }
    if (isApiError(error) && (error.status === 409 || error.status === 500)) {
      throw new ApiError(
        error.status,
        'ไม่สามารถลบบริการได้ เพราะมีงานหรือช่างที่ยังอ้างอิงบริการนี้',
      )
    }
    throw new ApiError(
      isApiError(error) ? error.status : 0,
      isApiError(error) ? error.message : 'ไม่สามารถลบบริการได้',
      isApiError(error) ? error.code : undefined,
    )
  }
}
