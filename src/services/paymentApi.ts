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
  if (!token || typeof token !== 'string') {
    throw new Error('ไม่สามารถตรวจสอบบัตรได้ กรุณาลองใหม่อีกครั้ง')
  }

  if (typeof amountBaht !== 'number' || !isFinite(amountBaht)) {
    throw new Error('จำนวนเงินไม่ถูกต้อง')
  }

  if (amountBaht < 1) {
    throw new Error('จำนวนเงินต้องไม่ต่ำกว่า 1 บาท')
  }

  const amount = Math.round(amountBaht * 100) / 100

  const response = await apiFetch<ChargeApiResponse>('/api/charges', {
    method: 'POST',
    body: JSON.stringify({ token, amount, description }),
  })

  if (!response || !response.data) {
    throw new Error('ไม่สามารถประมวลผลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง')
  }

  return response.data
}
