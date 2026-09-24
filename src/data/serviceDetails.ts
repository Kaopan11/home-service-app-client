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

export function formatBaht(value: number): string {
  return `${value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ฿`
}
