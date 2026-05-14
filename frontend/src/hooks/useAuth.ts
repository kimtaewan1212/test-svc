import { useMutation } from '@tanstack/react-query'
import { login, register, logout } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import type { LoginRequest, RegisterRequest } from '../types/auth'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => setAuth(res.accessToken, res.refreshToken, res.user),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (res) => setAuth(res.accessToken, res.refreshToken, res.user),
  })
}

export function useLogout() {
  const { refreshToken, clearAuth } = useAuthStore()
  return useMutation({
    mutationFn: () => logout(refreshToken ?? ''),
    onSuccess: () => clearAuth(),
  })
}
