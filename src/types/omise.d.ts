export type OmiseCardTokenParams = {
  name: string
  number: string
  expiration_month: number
  expiration_year: number
  security_code: string
}

export type OmiseToken = {
  object: 'token'
  id: string
}

export type OmiseError = {
  object: 'error'
  code: string
  message: string
}

export interface OmiseStatic {
  setPublicKey(key: string): void
  createToken(
    type: 'card',
    params: OmiseCardTokenParams,
    callback: (statusCode: number, response: OmiseToken | OmiseError) => void,
  ): void
}

declare global {
  interface Window {
    Omise?: OmiseStatic
  }
}
