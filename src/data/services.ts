export type Service = {
  id: string
  title: string
  category: string
  priceMin: number
  priceMax?: number
  image: string
}

export const SERVICE_CATEGORIES = [
  'บริการด้านห้องแอร์',
  'บริการด้านทั่วไป',
  'บริการด้านห้องครัว',
  'บริการด้านห้องน้ำ',
] as const

export type ServiceFilters = {
  query: string
  category: string
  priceMin: number
  priceMax: number
  sort: string
}

export function filterServices(list: Service[], filters: ServiceFilters): Service[] {
  const query = filters.query.trim().toLowerCase()

  const filtered = list.filter((service) => {
    const matchesQuery =
      query.length === 0 ||
      service.title.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    const matchesCategory = filters.category === 'all' || service.category === filters.category
    const priceHigh = service.priceMax ?? service.priceMin
    const matchesPrice = service.priceMin <= filters.priceMax && priceHigh >= filters.priceMin

    return matchesQuery && matchesCategory && matchesPrice
  })

  const sorted = [...filtered]
  switch (filters.sort) {
    case 'popular':
      sorted.sort((a, b) => b.priceMin - a.priceMin)
      break
    case 'name-asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'th'))
      break
    case 'name-desc':
      sorted.sort((a, b) => b.title.localeCompare(a.title, 'th'))
      break
    default:
      break
  }

  return sorted
}

export function formatServicePrice(priceMin: number, priceMax?: number): string {
  const baht = (value: number) =>
    value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  if (priceMax != null && priceMax !== priceMin) {
    return `ค่าบริการประมาณ ${baht(priceMin)} - ${baht(priceMax)} ฿`
  }

  return `ค่าบริการประมาณ ${baht(priceMin)} ฿`
}
