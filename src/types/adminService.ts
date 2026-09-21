export type AdminServiceCategoryTone = 'general' | 'kitchen' | 'bathroom'

export type AdminServiceItem = {
  id: number
  sortOrder: number
  name: string
  categoryName: string
  categoryTone: string | null
  createdAt: string
  updatedAt: string
}

export type AdminServiceListResponse = {
  message: string
  data: AdminServiceItem[]
}
