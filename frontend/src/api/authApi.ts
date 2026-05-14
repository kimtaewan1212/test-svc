import { request } from './client'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logout(refreshToken: string): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  return res.json() as Promise<{ accessToken: string }>
}
