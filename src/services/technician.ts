import { apiFetch } from '@/services/api'
import type {
  TechnicianLocation,
  TechnicianProfile,
  UpdateTechnicianProfileRequest,
} from '@/types/technician'

type Envelope<T> = {
  message: string
  data: T
}

export async function getTechnicianProfile(): Promise<TechnicianProfile> {
  const response = await apiFetch<Envelope<TechnicianProfile>>('/api/technician/account')
  return response.data
}

export async function updateTechnicianProfile(
  payload: UpdateTechnicianProfileRequest,
): Promise<TechnicianProfile> {
  const response = await apiFetch<Envelope<TechnicianProfile>>('/api/technician/account', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function refreshTechnicianLocation(
  latitude: number,
  longitude: number,
): Promise<TechnicianLocation> {
  const response = await apiFetch<Envelope<TechnicianLocation>>('/api/technician/account/location', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  })
  return response.data
}

export async function getWaitingAcceptCount(): Promise<number> {
  const response = await apiFetch<Envelope<{ count: number }>>('/api/technician/requests/pending-count')
  return response.data.count
}
