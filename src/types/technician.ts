import type { AdminRole } from '@/types/auth'

export type TechnicianServiceOption = {
  id: number
  name: string
}

export type TechnicianProfile = {
  id: number
  email: string
  fullName: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  address: string | null
  avatarUrl: string | null
  role: AdminRole
  latitude: number | null
  longitude: number | null
  available: boolean
  acceptedServiceIds: number[]
  services: TechnicianServiceOption[]
}

export type TechnicianLocation = {
  address: string
  latitude: number
  longitude: number
}

export type TechnicianRequest = {
  id: number
  serviceName: string
  customerName: string
  address: string
  latitude: number | null
  longitude: number | null
  status: string
  createdAt: string
}

export type UpdateTechnicianProfileRequest = {
  firstName: string
  lastName: string
  phone: string
  address: string
  latitude: number | null
  longitude: number | null
  available: boolean
  serviceIds: number[]
}

