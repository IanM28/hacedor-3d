import type { RegisterProductionInput } from '../types'
import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface ProductionResult {
  productId: string
  quantity: number
  consumptions: number
}

function authHeaders(): HeadersInit {
  return getAuthHeaders(useAuthStore.getState().token)
}

export const productionService = {
  async register(data: RegisterProductionInput): Promise<ProductionResult> {
    const res = await fetch(`${API_URL}/production/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<ProductionResult>
    if (!res.ok || !json.success) {
      throw new Error(json.message ?? 'Error al registrar fabricación')
    }
    return json.data
  },
}
