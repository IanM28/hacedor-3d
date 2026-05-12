import type { Product, ProductFilters } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
}

function buildParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  if (filters.featured !== undefined) params.set('featured', String(filters.featured))
  if (filters.code) params.set('code', filters.code)
  return params
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
}
