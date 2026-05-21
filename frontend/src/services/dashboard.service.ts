import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'
import type { DashboardSale, DashboardStats } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const token = useAuthStore.getState().token
    const res = await fetch(`${API_URL}/dashboard/stats`, {
      headers: getAuthHeaders(token),
    })
    const json = (await res.json()) as ApiResponse<DashboardStats>
    if (!res.ok || !json.success) throw new Error('Error al cargar métricas del dashboard')
    return json.data
  },

  async getSales(): Promise<DashboardSale[]> {
    const token = useAuthStore.getState().token
    const res = await fetch(`${API_URL}/dashboard/sales`, {
      headers: getAuthHeaders(token),
    })
    const json = (await res.json()) as ApiResponse<DashboardSale[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar ventas recientes')
    return json.data
  },
}
