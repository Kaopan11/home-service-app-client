import { services, type Service } from '@/data/services'

export type ServiceOption = {
  id: string
  name: string
  unit: string
  price: number
}

export type ServiceDetail = {
  serviceId: string
  title: string
  category: string
  image: string
  options: ServiceOption[]
}

const DETAILS: Record<string, ServiceDetail> = {
  'ac-clean': {
    serviceId: 'ac-clean',
    title: 'ล้างแอร์',
    category: 'บริการด้านห้องแอร์',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'ac-clean-1', name: '9,000 - 18,000 BTU, แบบติดผนัง', unit: 'เครื่อง', price: 800 },
      { id: 'ac-clean-2', name: '9,000 - 18,000 BTU, แบบติดผนัง', unit: 'เครื่อง', price: 800 },
      { id: 'ac-clean-3', name: '9,000 - 18,000 BTU, แบบติดผนัง', unit: 'เครื่อง', price: 800 },
      { id: 'ac-clean-4', name: '9,000 - 18,000 BTU, แบบติดผนัง', unit: 'เครื่อง', price: 800 },
    ],
  },
  'ac-install': {
    serviceId: 'ac-install',
    title: 'ติดตั้งแอร์',
    category: 'บริการด้านห้องแอร์',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'ac-install-1', name: '9,000 - 12,000 BTU, แบบติดผนัง', unit: 'ชิ้น', price: 2800 },
      { id: 'ac-install-2', name: '13,000 - 18,000 BTU, แบบติดผนัง', unit: 'ชิ้น', price: 3500 },
      { id: 'ac-install-3', name: '19,000 - 24,000 BTU, แบบติดผนัง', unit: 'ชิ้น', price: 4200 },
    ],
  },
  'ac-repair': {
    serviceId: 'ac-repair',
    title: 'ซ่อมแอร์',
    category: 'บริการด้านห้องแอร์',
    image:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'ac-repair-1', name: 'ตรวจเช็คระบบแอร์', unit: 'ชิ้น', price: 400 },
      { id: 'ac-repair-2', name: 'ซ่อมแอร์ไม่เย็น', unit: 'ชิ้น', price: 800 },
      { id: 'ac-repair-3', name: 'เติมน้ำยาแอร์', unit: 'ชิ้น', price: 600 },
    ],
  },
  'general-clean': {
    serviceId: 'general-clean',
    title: 'ทำความสะอาดทั่วไป',
    category: 'บริการด้านทั่วไป',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'general-clean-1', name: 'ทำความสะอาด 1 ห้อง', unit: 'ชิ้น', price: 500 },
      { id: 'general-clean-2', name: 'ทำความสะอาด 2-3 ห้อง', unit: 'ชิ้น', price: 800 },
      { id: 'general-clean-3', name: 'ทำความสะอาดทั้งหลัง', unit: 'ชิ้น', price: 1000 },
    ],
  },
  'washer-clean': {
    serviceId: 'washer-clean',
    title: 'ซ่อมเครื่องซักผ้า',
    category: 'บริการด้านทั่วไป',
    image:
      'https://plus.unsplash.com/premium_photo-1661342406124-740ae7a0dd0e?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'washer-clean-1', name: 'ตรวจเช็คเครื่องซักผ้า', unit: 'ชิ้น', price: 500 },
      { id: 'washer-clean-2', name: 'ซ่อมเครื่องซักผ้าไม่หมุน', unit: 'ชิ้น', price: 800 },
    ],
  },
  'stove-clean': {
    serviceId: 'stove-clean',
    title: 'ทำความสะอาดเตาแก๊ส',
    category: 'บริการด้านห้องครัว',
    image:
      'https://images.unsplash.com/photo-1556912173-46e0d4d0a0a2?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'stove-clean-1', name: 'ทำความสะอาดเตาแก๊ส 2 หัว', unit: 'ชิ้น', price: 500 },
      { id: 'stove-clean-2', name: 'ทำความสะอาดเตาแก๊ส 4 หัว', unit: 'ชิ้น', price: 700 },
    ],
  },
  'pipe-repair': {
    serviceId: 'pipe-repair',
    title: 'ซ่อมท่อน้ำรั่ว',
    category: 'บริการด้านห้องน้ำ',
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'pipe-repair-1', name: 'ซ่อมท่อน้ำรั่ว จุดเดียว', unit: 'ชิ้น', price: 500 },
      { id: 'pipe-repair-2', name: 'ซ่อมท่อน้ำรั่ว หลายจุด', unit: 'ชิ้น', price: 900 },
    ],
  },
  'toilet-install': {
    serviceId: 'toilet-install',
    title: 'ติดตั้งโถสุขภัณฑ์',
    category: 'บริการด้านห้องน้ำ',
    image:
      'https://images.unsplash.com/photo-1584622781867-1237746410d2?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'toilet-install-1', name: 'ติดตั้งโถสุขภัณฑ์นั่งราบ', unit: 'ชิ้น', price: 500 },
      { id: 'toilet-install-2', name: 'ติดตั้งโถสุขภัณฑ์พร้อมอุปกรณ์', unit: 'ชิ้น', price: 900 },
    ],
  },
  'heater-install': {
    serviceId: 'heater-install',
    title: 'ติดตั้งเครื่องทำน้ำอุ่น',
    category: 'บริการด้านห้องน้ำ',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1440&q=80',
    options: [
      { id: 'heater-install-1', name: 'ติดตั้งเครื่องทำน้ำอุ่น 3500W', unit: 'ชิ้น', price: 500 },
      { id: 'heater-install-2', name: 'ติดตั้งเครื่องทำน้ำอุ่น 6000W', unit: 'ชิ้น', price: 800 },
    ],
  },
}

function detailFromService(service: Service): ServiceDetail {
  return {
    serviceId: service.id,
    title: service.title,
    category: service.category,
    image: service.image,
    options: [
      {
        id: `${service.id}-default`,
        name: service.title,
        unit: 'ชิ้น',
        price: service.priceMin,
      },
    ],
  }
}

export function getServiceDetail(id: string): ServiceDetail | undefined {
  if (DETAILS[id]) return DETAILS[id]
  const service = services.find((item) => item.id === id)
  return service ? detailFromService(service) : undefined
}

export function formatBaht(value: number): string {
  return `${value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ฿`
}
