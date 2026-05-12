export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  cbu?: string
  isActive: boolean
}

export interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  isActive: boolean
  isFeatured: boolean
  category: Category
  supplier: Supplier
  supplierCost?: number
  markupPercent?: number
  createdAt?: string
}

export interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  code?: string
}
