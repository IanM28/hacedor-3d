import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from '../types'
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

export const supplierService = {
  async findAll(): Promise<Supplier[]> {
    const res = await fetch(`${API_URL}/suppliers`, {
      headers: authHeaders(),
    })
    const json = (await res.json()) as ApiResponse<Supplier[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar proveedores')
    return json.data
  },

  async findAllAdmin(): Promise<Supplier[]> {
    const res = await fetch(`${API_URL}/suppliers?includeInactive=true`, {
      headers: authHeaders(),
    })
    const json = (await res.json()) as ApiResponse<Supplier[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar proveedores')
    return json.data
  },

  async create(data: CreateSupplierInput): Promise<Supplier> {
    const res = await fetch(`${API_URL}/suppliers`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Supplier>
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? 'Error al crear proveedor')
    }
    return json.data
  },

  async update(id: string, data: UpdateSupplierInput): Promise<Supplier> {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Supplier>
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? 'Error al actualizar proveedor')
    }
    return json.data
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/suppliers/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Error al eliminar proveedor')
  },
}
