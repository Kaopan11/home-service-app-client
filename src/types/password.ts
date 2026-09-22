export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export type PasswordField = keyof ChangePasswordInput

export type ChangePasswordResponse = {
  data: null
  message: string
}
