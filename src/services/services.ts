import { apiFetch } from '@/services/api'

export type ServiceListResponse = {
  message: string
  data: {
    id: number
    name: string
    categoryName: string
    sortOrder: number
  }[]
}

export function getServices(): Promise<ServiceListResponse> {
  return apiFetch<ServiceListResponse>('/api/services')
}