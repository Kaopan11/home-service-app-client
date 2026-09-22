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

export type ServiceOptionDto = {
  id: number
  name: string
  unit: string
  price: number
}

export type ServiceDetailDto = {
  id: number
  name: string
  categoryName: string
  image: string
  options: ServiceOptionDto[]
}

export type ServiceDetailResponse = {
  message: string
  data: ServiceDetailDto
}

export function getServiceById(id: string | number) {
  return apiFetch<ServiceDetailResponse>(`/api/services/${id}`)
}