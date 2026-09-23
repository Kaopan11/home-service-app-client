export type OmiseCardParams = {
  name: string
  number: string
  expirationMonth: number
  expirationYear: number
  securityCode: string
}

let publicKeySet = false

function getOmise() {
  if (!window.Omise) {
    throw new Error('โหลด Omise.js ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  }
  if (!publicKeySet) {
    const key = import.meta.env.VITE_OMISE_PUBLIC_KEY
    if (!key) {
      throw new Error('ไม่พบ Omise public key (VITE_OMISE_PUBLIC_KEY)')
    }
    window.Omise.setPublicKey(key)
    publicKeySet = true
  }
  return window.Omise
}

export function createCardToken(card: OmiseCardParams): Promise<string> {
  const omise = getOmise()
  return new Promise((resolve, reject) => {
    omise.createToken(
      'card',
      {
        name: card.name,
        number: card.number,
        expiration_month: card.expirationMonth,
        expiration_year: card.expirationYear,
        security_code: card.securityCode,
      },
      (statusCode, response) => {
        if (statusCode === 200 && response.object === 'token') {
          resolve(response.id)
          return
        }
        const message = response.object === 'error' ? response.message : 'ไม่สามารถตรวจสอบบัตรได้'
        reject(new Error(message))
      },
    )
  })
}
