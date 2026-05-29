import type {
  AdminOrderDetail,
  AdminOrderFilters,
  CreateOrderInput,
  Order,
  OrderStatus,
  PaginatedAdminOrders,
} from '../types'
import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

function authHeaders(): HeadersInit {
  return getAuthHeaders(useAuthStore.getState().token)
}

export const orderService = {
  async create(data: CreateOrderInput): Promise<Order> {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = (await res.json()) as ApiResponse<Order>

    if (!res.ok || !json.success) {
      const message = typeof json.error === 'string' ? json.error : 'Error al crear el pedido'
      throw new Error(message)
    }

    return json.data
  },

  async findAllAdmin(filters: AdminOrderFilters = {}): Promise<PaginatedAdminOrders> {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const qs = params.toString()
    const res = await fetch(`${API_URL}/orders/admin${qs ? `?${qs}` : ''}`, {
      headers: authHeaders(),
    })

    const json = (await res.json()) as ApiResponse<PaginatedAdminOrders>
    if (!res.ok || !json.success) {
      throw new Error(typeof json.error === 'string' ? json.error : 'Error al cargar pedidos')
    }

    return json.data
  },

  async findAdminById(id: string): Promise<AdminOrderDetail> {
    const res = await fetch(`${API_URL}/orders/admin/${id}`, {
      headers: authHeaders(),
    })

    const json = (await res.json()) as ApiResponse<AdminOrderDetail>
    if (!res.ok || !json.success) {
      throw new Error(typeof json.error === 'string' ? json.error : 'Error al cargar el pedido')
    }

    return json.data
  },

  async updateAdminStatus(id: string, status: OrderStatus): Promise<AdminOrderDetail> {
    const res = await fetch(`${API_URL}/orders/admin/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    })

    const json = (await res.json()) as ApiResponse<AdminOrderDetail>
    if (!res.ok || !json.success) {
      const msg =
        typeof json.error === 'string'
          ? json.error
          : (json.error as { _errors?: string[] } | undefined)?._errors?.[0] ??
            'Error al actualizar el estado'
      throw new Error(msg)
    }

    return json.data
  },
}
