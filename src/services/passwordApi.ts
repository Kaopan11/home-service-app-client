import { apiFetch } from '@/services/api'
import { ApiError, isApiError } from '@/types/auth'
import type { ChangePasswordInput, ChangePasswordResponse, PasswordField } from '@/types/password'

export function validateChangePassword(input: ChangePasswordInput): Partial<Record<PasswordField, string>> {
  const errors: Partial<Record<PasswordField, string>> = {}
  if (!input.currentPassword) {
    errors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน'
  }
  if (!input.newPassword) {
    errors.newPassword = 'กรุณากรอกรหัสผ่านใหม่'
  } else if (input.newPassword.length < 6) {
    errors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
  } else if (input.currentPassword && input.newPassword === input.currentPassword) {
    errors.newPassword = 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน'
  }
  if (!input.confirmNewPassword) {
    errors.confirmNewPassword = 'กรุณายืนยันรหัสผ่านใหม่'
  } else if (input.newPassword && input.confirmNewPassword !== input.newPassword) {
    errors.confirmNewPassword = 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน'
  }
  return errors
}

export async function changePassword(input: ChangePasswordInput): Promise<string> {
  try {
    const response = await apiFetch<ChangePasswordResponse>('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    return response.message || 'เปลี่ยนรหัสผ่านสำเร็จ'
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }
    throw new ApiError(0, 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
  }
}
