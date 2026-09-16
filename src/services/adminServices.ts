import { MOCK_ADMIN_SERVICES } from '@/data/adminServices'
import { apiFetch } from '@/services/api'
import type { AdminServiceItem, AdminServiceListResponse } from '@/types/adminService'

export async function listAdminServices(): Promise<AdminServiceItem[]> {
  try {
    const response = await apiFetch<AdminServiceListResponse>('/api/admin/services')
    return response.data
  } catch {
    return MOCK_ADMIN_SERVICES
  }
}

export async function deleteAdminService(id: number): Promise<void> {
  await apiFetch<void>(`/api/admin/services/${id}`, { method: 'DELETE' })
}
