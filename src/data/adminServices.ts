import type { AdminServiceCategoryTone, AdminServiceItem } from '@/types/adminService'

const STAMP = '2022-02-12T22:30:00.000Z'

export const MOCK_ADMIN_SERVICES: AdminServiceItem[] = [
  { id: 1, sortOrder: 1, name: 'ล้างแอร์', categoryId: 1, categoryName: 'บริการทั่วไป', categoryTone: 'general', createdAt: STAMP, updatedAt: STAMP },
  { id: 2, sortOrder: 2, name: 'ติดตั้งแอร์', categoryId: 1, categoryName: 'บริการทั่วไป', categoryTone: 'general', createdAt: STAMP, updatedAt: STAMP },
  { id: 3, sortOrder: 3, name: 'ทำความสะอาดทั่วไป', categoryId: 1, categoryName: 'บริการทั่วไป', categoryTone: 'general', createdAt: STAMP, updatedAt: STAMP },
  { id: 4, sortOrder: 4, name: 'ซ่อมแอร์', categoryId: 1, categoryName: 'บริการทั่วไป', categoryTone: 'general', createdAt: STAMP, updatedAt: STAMP },
  { id: 5, sortOrder: 5, name: 'ซ่อมเครื่องซักผ้า', categoryId: 1, categoryName: 'บริการทั่วไป', categoryTone: 'general', createdAt: STAMP, updatedAt: STAMP },
  { id: 6, sortOrder: 6, name: 'ติดตั้งเตาแก๊ส', categoryId: 2, categoryName: 'บริการห้องครัว', categoryTone: 'kitchen', createdAt: STAMP, updatedAt: STAMP },
  { id: 7, sortOrder: 7, name: 'ติดตั้งเครื่องดูดควัน', categoryId: 2, categoryName: 'บริการห้องครัว', categoryTone: 'kitchen', createdAt: STAMP, updatedAt: STAMP },
  { id: 8, sortOrder: 8, name: 'ติดตั้งชักโครก', categoryId: 3, categoryName: 'บริการห้องน้ำ', categoryTone: 'bathroom', createdAt: STAMP, updatedAt: STAMP },
  { id: 9, sortOrder: 9, name: 'ติดตั้งเครื่องทำน้ำอุ่น', categoryId: 3, categoryName: 'บริการห้องน้ำ', categoryTone: 'bathroom', createdAt: STAMP, updatedAt: STAMP },
]

export function formatAdminDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${month}/${day}/${year} ${hours}:${minutes}${period}`
}

export function serviceTagTone(item: Pick<AdminServiceItem, 'categoryName' | 'categoryTone'>): AdminServiceCategoryTone {
  if (item.categoryTone === 'kitchen' || item.categoryTone === 'bathroom' || item.categoryTone === 'general') {
    return item.categoryTone
  }
  if (item.categoryName === 'บริการห้องครัว') {
    return 'kitchen'
  }
  if (item.categoryName === 'บริการห้องน้ำ') {
    return 'bathroom'
  }
  return 'general'
}

export function filterAdminServices(list: AdminServiceItem[], query: string): AdminServiceItem[] {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return list
  }
  return list.filter(
    (item) =>
      item.name.toLowerCase().includes(needle) || item.categoryName.toLowerCase().includes(needle),
  )
}
