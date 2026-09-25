/**
 * Format ISO date string into Thai format matching Figma:
 * Example: "25/04/2563 เวลา 13.00 น."
 */
export function formatThaiDateTime(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return '-'
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (Number.isNaN(date.getTime())) return String(isoOrDate)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear() + 543 // Buddhist Era
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} เวลา ${hours}.${minutes} น.`
}

/**
 * Format currency to Thai Baht with comma separators:
 * Example: "1,550.00 ฿"
 */
export function formatThaiCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return '0.00 ฿'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(num)) return '0.00 ฿'

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted} ฿`
}
