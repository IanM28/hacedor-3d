import type { CreateProductInput, Product, ProductFilters, UpdateProductInput } from '../types'
import { useAuthStore } from '../store/authStore'
import { getAuthHeaders } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: unknown
}

function buildParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  if (filters.featured !== undefined) params.set('featured', String(filters.featured))
  if (filters.code) params.set('code', filters.code)
  return params
}

function authHeaders(): HeadersInit {
  return getAuthHeaders(useAuthStore.getState().token)
}

export const productService = {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const params = filters ? buildParams(filters) : new URLSearchParams()
    const query = params.toString()
    const url = query ? `${API_URL}/products?${query}` : `${API_URL}/products`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Error al cargar productos')

    const json = (await res.json()) as ApiResponse<Product[]>
    if (!json.success) throw new Error('Error al cargar productos')

    return json.data
  },

  async findById(id: string): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${id}`)
    if (!res.ok) throw new Error('Producto no encontrado')

    const json = (await res.json()) as ApiResponse<Product>
    if (!json.success) throw new Error('Producto no encontrado')

    return json.data
  },

  async findAllAdmin(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products?includeInactive=true`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Error al cargar productos')

    const json = (await res.json()) as ApiResponse<Product[]>
    if (!json.success) throw new Error('Error al cargar productos')

    return json.data
  },

  async create(data: CreateProductInput): Promise<Product> {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Product>
    if (!res.ok || !json.success) {
      const msg = typeof json.error === 'string' ? json.error : 'Error al crear producto'
      throw new Error(msg)
    }
    return json.data
  },

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    const json = (await res.json()) as ApiResponse<Product>
    if (!res.ok || !json.success) {
      const err = json.error
      let msg = 'Error al actualizar producto'
      if (typeof err === 'string') {
        msg = err
      } else if (err && typeof err === 'object') {
        const flat = err as { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
        const fieldMsgs = Object.values(flat.fieldErrors ?? {}).flat()
        const formMsgs = flat.formErrors ?? []
        const all = [...formMsgs, ...fieldMsgs]
        if (all.length > 0) msg = all.join(' · ')
      }
      throw new Error(msg)
    }
    return json.data
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Error al eliminar producto')
  },
}
