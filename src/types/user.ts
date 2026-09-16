export interface UserAddress {
  address: string
  subdistrict: string
  district: string
  province: string
}

export interface UserProfile extends UserAddress {
  id?: number
  email: string
  displayName: string
  firstName: string
  lastName: string
  phone: string
  avatarUrl: string
  role?: string
}

export interface UpdateUserProfileRequest {
  email?: string
  displayName?: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  subdistrict?: string
  district?: string
  province?: string
  avatarUrl?: string
}

export interface UserProfileApiResponse {
  message: string
  data: UserProfile
}
