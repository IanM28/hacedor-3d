import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types'
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

export const categoryService = {
  async findAll(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/categories`)
    if (!res.ok) throw new Error('Error al cargar categorías')
    const json = (await res.json()) as ApiResponse<Category[]>
    if (!json.success) throw new Error('Error al cargar categorías')
    return json.data
  },

  async findAllAdmin(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/categories?includeInactive=true`, {
      headers: authHeaders(),
    })
    const json = (await res.json()) as ApiResponse<Category[]>
    if (!res.ok || !json.success) throw new Error('Error al cargar categorías')
    return json.data
  },

  async create(data: CreateCategoryInput): Promise<Category> {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Category>
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? 'Error al crear categoría')
    }
    return json.data
  },

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Category>
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? 'Error al actualizar categoría')
    }
    return json.data
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Error al eliminar categoría')
  },
}
