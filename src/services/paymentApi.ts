import { apiFetch } from '@/services/api'

export type ChargeResult = {
  id: string
  status: string
  paid: boolean
  amount: number
  currency: string
}

type ChargeApiResponse = {
  message: string
  data: ChargeResult
}

export async function createCharge(
  token: string,
  amountBaht: number,
  description?: string,
): Promise<ChargeResult> {
  const response = await apiFetch<ChargeApiResponse>('/api/charges', {
    method: 'POST',
    body: JSON.stringify({ token, amount: amountBaht, description }),
  })
  return response.data
}
