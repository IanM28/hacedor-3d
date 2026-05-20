import type { LoginInput, RegisterInput, AuthResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export function getAuthHeaders(token?: string | null): HeadersInit {
  const base: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) base['Authorization'] = `Bearer ${token}`
  return base
}

export const authService = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<AuthResponse>
    if (!res.ok || !json.success) {
      throw new Error(typeof json.error === 'string' ? json.error : 'Error al iniciar sesión')
    }
    return json.data
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<AuthResponse>
    if (!res.ok || !json.success) {
      throw new Error(typeof json.error === 'string' ? json.error : 'Error al crear la cuenta')
    }
    return json.data
  },
}
