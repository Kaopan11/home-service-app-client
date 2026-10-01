import type { AdminServiceCategoryTone, AdminServiceItem } from '@/types/adminService'

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
