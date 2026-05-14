import { request } from './client'
import type { UserInfo } from '../types/auth'

interface UpdateMeRequest {
  name?: string
  currentPassword?: string
  newPassword?: string
}

export function getMe(): Promise<UserInfo> {
  return request<UserInfo>('/users/me')
}

export function updateMe(data: UpdateMeRequest): Promise<UserInfo> {
  return request<UserInfo>('/users/me', { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteMe(): Promise<void> {
  return request<void>('/users/me', { method: 'DELETE' })
}
