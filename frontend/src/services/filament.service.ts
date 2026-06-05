import type { AdjustFilamentInput, CreateFilamentInput, Filament, UpdateFilamentInput } from '../types'
import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
}

function authHeaders(): HeadersInit {
  return getAuthHeaders(useAuthStore.getState().token)
}

export const filamentService = {
  async findAll(): Promise<Filament[]> {
    const res = await fetch(`${API_URL}/filaments`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Error al cargar filamentos')
    const json = (await res.json()) as ApiResponse<Filament[]>
    if (!json.success) throw new Error('Error al cargar filamentos')
    return json.data
  },

  async create(data: CreateFilamentInput): Promise<Filament> {
    const res = await fetch(`${API_URL}/filaments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Filament>
    if (!res.ok || !json.success) throw new Error('Error al crear filamento')
    return json.data
  },

  async update(id: string, data: UpdateFilamentInput): Promise<Filament> {
    const res = await fetch(`${API_URL}/filaments/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Filament>
    if (!res.ok || !json.success) throw new Error('Error al actualizar filamento')
    return json.data
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/filaments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Error al eliminar filamento')
  },

  async adjust(id: string, data: AdjustFilamentInput): Promise<Filament> {
    const res = await fetch(`${API_URL}/filaments/${id}/adjust`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Filament> & { message?: string }
    if (!res.ok || !json.success) {
      throw new Error(json.message ?? 'Error al ajustar inventario')
    }
    return json.data
  },
}
