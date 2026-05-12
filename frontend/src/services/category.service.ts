import type { Category } from '../types'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const categoryService = {
  async findAll(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/categories`)
    if (!res.ok) throw new Error('Error al cargar categorías')

    const json = (await res.json()) as ApiResponse<Category[]>
    if (!json.success) throw new Error('Error al cargar categorías')

    return json.data
  },
}
