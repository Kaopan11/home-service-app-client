export type AdminServiceCategoryTone = 'general' | 'kitchen' | 'bathroom'

export type AdminServiceItem = {
  id: number
  sortOrder: number
  name: string
  categoryId: number
  categoryName: string
  categoryTone: string | null
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
