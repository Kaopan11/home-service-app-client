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

export const services: Service[] = [
  {
    id: 'ac-clean',
    title: 'ล้างแอร์',
    category: 'บริการด้านห้องแอร์',
    priceMin: 500,
    priceMax: 1000,
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ac-install',
    title: 'ติดตั้งแอร์',
    category: 'บริการด้านห้องแอร์',
    priceMin: 2800,
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ac-repair',
    title: 'ซ่อมแอร์',
    category: 'บริการด้านห้องแอร์',
    priceMin: 400,
    image:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'general-clean',
    title: 'ทำความสะอาดทั่วไป',
    category: 'บริการด้านทั่วไป',
    priceMin: 500,
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'washer-clean',
    title: 'ทำความสะอาดเครื่องซักผ้า',
    category: 'บริการด้านทั่วไป',
    priceMin: 500,
    image:
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'stove-clean',
    title: 'ทำความสะอาดเตาแก๊ส',
    category: 'บริการด้านห้องครัว',
    priceMin: 500,
    image:
      'https://images.unsplash.com/photo-1556912173-46e0d4d0a0a2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pipe-repair',
    title: 'ซ่อมท่อน้ำรั่ว',
    category: 'บริการด้านห้องน้ำ',
    priceMin: 500,
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'toilet-install',
    title: 'ติดตั้งโถสุขภัณฑ์',
    category: 'บริการด้านห้องน้ำ',
    priceMin: 500,
    image:
      'https://images.unsplash.com/photo-1584622781867-1237746410d2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'heater-install',
    title: 'ติดตั้งเครื่องทำน้ำอุ่น',
    category: 'บริการด้านห้องน้ำ',
    priceMin: 500,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80',
  },
]

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
