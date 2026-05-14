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

export interface CartItem {
  productId: string
  code: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

export interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  code?: string
}

export type PaymentMethod = 'TRANSFER' | 'MERCADOPAGO' | 'CASH'
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItemInput {
  productId: string
  quantity: number
}

export interface CreateOrderInput {
  guestEmail?: string
  contactName: string
  address: string
  phone: string
  paymentMethod: PaymentMethod
  shippingCost?: number
  items: OrderItemInput[]
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product?: Product
}

export interface Order {
  id: string
  userId?: string | null
  guestEmail?: string | null
  status: OrderStatus
  total: number
  shippingCost: number
  contactName: string
  address: string
  phone: string
  paymentMethod: PaymentMethod
  mpPaymentId?: string | null
  mpPreferenceId?: string | null
  createdAt: string
  items: OrderItem[]
}
