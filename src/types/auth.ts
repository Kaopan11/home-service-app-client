export type AdminRole = 'ADMIN' | 'USER' | 'TECHNICIAN'

export type LoginRequest = {
  email: string
  password: string
}

export type AdminUser = {
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
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  tokenType: string
}

export type FacebookLoginRequest = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type RegisterRequest = {
  fullName: string
  phone: string
  email: string
  password: string
  accepted: boolean
}

export type LoginResponse = {
  message: string
  data: {
    user: AdminUser
    session: AuthSession | null
  }
}

export type UserProfileResponse = {
  message: string
  data: AdminUser
}

export type ApiFieldError = {
  field: string
  message: string
}

export class ApiError extends Error {
  status: number
  code?: string
  errors?: ApiFieldError[]

  constructor(status: number, message: string, code?: string, errors?: ApiFieldError[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
