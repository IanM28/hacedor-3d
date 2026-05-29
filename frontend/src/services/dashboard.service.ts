import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'
import type { DashboardSale, DashboardSalesPeriod, DashboardSalesPoint, DashboardStats } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
}

function authHeaders(): HeadersInit {
  return getAuthHeaders(useAuthStore.getState().token)
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/dashboard/stats`, {
      headers: authHeaders(),
    })
    const json = (await res.json()) as ApiResponse<DashboardStats>
    if (!res.ok || !json.success) throw new Error('Error al cargar métricas del dashboard')
    return json.data
  },

  async getSales(period: DashboardSalesPeriod): Promise<DashboardSalesPoint[]> {
    const res = await fetch(`${API_URL}/dashboard/sales?period=${period}`, {
      headers: authHeaders(),
    })
    const json = (await res.json()) as ApiResponse<DashboardSalesPoint[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar gráfico de ventas')
    return json.data
  },

  async getRecentSales(): Promise<DashboardSale[]> {
    const res = await fetch(`${API_URL}/dashboard/recent-sales`, {
      headers: authHeaders(),
    })
    const json = (await res.json()) as ApiResponse<DashboardSale[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar ventas recientes')
    return json.data
  },
}
