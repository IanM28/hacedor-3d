import type { Supplier } from '../types'
import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const supplierService = {
  async findAll(): Promise<Supplier[]> {
    const token = useAuthStore.getState().token
    const res = await fetch(`${API_URL}/suppliers`, {
      headers: getAuthHeaders(token),
    })
    const json = (await res.json()) as ApiResponse<Supplier[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar proveedores')
    return json.data
  },
}
