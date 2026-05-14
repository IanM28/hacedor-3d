import type { CreateOrderInput, Order } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
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
}
