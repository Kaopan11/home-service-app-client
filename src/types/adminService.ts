export type AdminServiceCategoryTone = 'general' | 'kitchen' | 'bathroom'

export type AdminServiceOption = {
  id?: number
  name: string
  price: number
  unit: string
  displayOrder?: number
}

export type AdminServiceItem = {
  id: number
  sortOrder: number
  name: string
  categoryId: number
  categoryName: string
  categoryTone: string | null
  imageUrl?: string | null
  options?: AdminServiceOption[]
  createdAt: string
  updatedAt: string
}

export type AdminServiceListResponse = {
  message: string
  data: AdminServiceItem[]
}

export type AdminServiceResponse = {
  message: string
  data: AdminServiceItem
}

export type AdminServiceOptionInput = {
  name: string
  price: number
  unit: string
  display_order: number
}

export type SaveAdminServiceInput = {
  name: string
  categoryId: number
  imageUrl: string
  options: AdminServiceOptionInput[]
}
