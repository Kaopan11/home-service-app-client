import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_USER_PROFILE,
  fetchUserProfile,
  formatAddressSummary,
  readCachedUserProfile,
  updateUserProfile,
} from '@/services/userService'
import type { UpdateUserProfileRequest, UserAddress, UserProfile } from '@/types/user'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile>(readCachedUserProfile())
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const address = computed<UserAddress>(() => ({
    address: profile.value.address,
    subdistrict: profile.value.subdistrict,
    district: profile.value.district,
    province: profile.value.province,
  }))

  const fullAddressSummary = computed<string>(() => {
    return formatAddressSummary(address.value)
  })

  async function loadProfile(): Promise<UserProfile> {
    isLoading.value = true
    error.value = null
    try {
      const data = await fetchUserProfile()
      profile.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้'
      return profile.value
    } finally {
      isLoading.value = false
    }
  }

  async function saveProfile(payload: UpdateUserProfileRequest): Promise<UserProfile> {
    isSaving.value = true
    error.value = null
    try {
      const updated = await updateUserProfile(payload)
      profile.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  function resetProfile(): void {
    profile.value = { ...DEFAULT_USER_PROFILE }
  }

  return {
    profile,
    address,
    fullAddressSummary,
    isLoading,
    isSaving,
    error,
    loadProfile,
    saveProfile,
    resetProfile,
  }
})
