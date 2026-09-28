import rows from './geography.json'

type GeographyRow = {
  provinceNameTh: string
  districtNameTh: string
  subdistrictNameTh: string
  postalCode: number
}

type DistrictNode = {
  subdistricts: string[]
  postalCodes: Map<string, string>
}

const byProvince = new Map<string, Map<string, DistrictNode>>()

for (const row of rows as GeographyRow[]) {
  let districts = byProvince.get(row.provinceNameTh)
  if (!districts) {
    districts = new Map()
    byProvince.set(row.provinceNameTh, districts)
  }

  let district = districts.get(row.districtNameTh)
  if (!district) {
    district = { subdistricts: [], postalCodes: new Map() }
    districts.set(row.districtNameTh, district)
  }

  if (!district.postalCodes.has(row.subdistrictNameTh)) {
    district.subdistricts.push(row.subdistrictNameTh)
    district.postalCodes.set(row.subdistrictNameTh, String(row.postalCode).padStart(5, '0'))
  }
}

export function getProvinces(): string[] {
  return [...byProvince.keys()]
}

export function getDistricts(provinceName: string): string[] {
  const districts = byProvince.get(provinceName)
  return districts ? [...districts.keys()] : []
}

export function getSubdistricts(provinceName: string, districtName: string): string[] {
  return byProvince.get(provinceName)?.get(districtName)?.subdistricts ?? []
}

export function getPostalCode(province: string, district: string, subdistrict: string): string {
  if (!province || !district || !subdistrict) return ''
  return byProvince.get(province)?.get(district)?.postalCodes.get(subdistrict) ?? ''
}
