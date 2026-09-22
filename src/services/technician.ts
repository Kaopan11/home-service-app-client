import { apiFetch } from '@/services/api'
import type {
  TechnicianLocation,
  TechnicianProfile,
  TechnicianRequest,
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

export async function listWaitingRequests(): Promise<TechnicianRequest[]> {
  const response = await apiFetch<Envelope<TechnicianRequest[]>>('/api/technician/requests')
  return response.data
}

export async function acceptRequest(id: number): Promise<TechnicianRequest> {
  const response = await apiFetch<Envelope<TechnicianRequest>>(`/api/technician/requests/${id}/accept`, {
    method: 'POST',
  })
  return response.data
}

export async function declineRequest(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/technician/requests/${id}/decline`, {
    method: 'POST',
  })
}
