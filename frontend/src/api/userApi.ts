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
  const body: Record<string, string | undefined> = {}
  if (data.name !== undefined) body.name = data.name
  if (data.currentPassword !== undefined) body.currentPassword = data.currentPassword
  if (data.newPassword !== undefined) body.password = data.newPassword
  return request<UserInfo>('/users/me', { method: 'PATCH', body: JSON.stringify(body) })
}

export function deleteMe(): Promise<void> {
  return request<void>('/users/me', { method: 'DELETE' })
}
