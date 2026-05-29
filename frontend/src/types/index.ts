export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  colorHex?: string | null
  isActive: boolean
}

export interface Supplier {
  id: string
  name: string
  contactUrl?: string | null
  isActive: boolean
}

export interface CreateCategoryInput {
  name: string
  colorHex?: string
  isActive?: boolean
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export interface CreateSupplierInput {
  name: string
  contactUrl?: string
  isActive?: boolean
}

export type UpdateSupplierInput = Partial<CreateSupplierInput>

export interface Filament {
  id: string
  brandName: string
  material: string
  colorName: string
  colorHex?: string | null
  pricePerKg: number
  isActive: boolean
  createdAt?: string
}

export interface ProductFilamentUsage {
  id: string
  productId: string
  filamentId: string
  grams: number
  filament: Filament
}

export interface CreateFilamentInput {
  brandName: string
  material: string
  colorName: string
  colorHex?: string
  pricePerKg: number
  isActive?: boolean
}

export type UpdateFilamentInput = Partial<CreateFilamentInput>

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
  supplier?: Supplier | null
  supplierCost?: number
  markupPercent?: number
  printHours?: number | null
  filamentGrams?: number | null
  profitMultiplier?: number | null
  filamentUsages?: ProductFilamentUsage[]
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

export interface FilamentUsageInput {
  filamentId: string
  grams: number
}

export interface CreateProductInput {
  code: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  isActive?: boolean
  isFeatured?: boolean
  categoryId: string
  supplierId?: string
  supplierCost?: number
  markupPercent?: number
  printHours?: number
  filamentGrams?: number
  profitMultiplier?: number
  filamentUsages?: FilamentUsageInput[]
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  code?: string
}

export type Role = 'CLIENT' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  name: string
  lastName: string
  role: Role
  isActive: boolean
  createdAt?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  lastName: string
}

export type PaymentMethod = 'TRANSFER' | 'MERCADOPAGO' | 'CASH'
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
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

export interface DashboardStats {
  totalSales: number
  monthlyOrders: number
  activeProducts: number
  lowStockProducts: number
  generalTithe: number
}

export type DashboardSalesPeriod = '7d' | '30d' | '1y'

export interface DashboardSalesPoint {
  label: string
  date: string
  total: number
  orders: number
}

export interface DashboardSaleUser {
  id: string
  email: string
  name: string
  lastName: string
}

export interface DashboardSale {
  id: string
  guestEmail: string | null
  contactName: string
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  createdAt: string
  user: DashboardSaleUser | null
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

export interface AdminOrderUser {
  id: string
  email: string
  name: string
  lastName: string
}

export interface AdminOrderProduct {
  id: string
  code: string
  name: string
  images: string[]
  price: number
  category?: { id: string; name: string }
}

export interface AdminOrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product: AdminOrderProduct
}

export interface AdminOrderListItem {
  id: string
  contactName: string
  guestEmail: string | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  total: number
  shippingCost: number
  createdAt: string
  user: AdminOrderUser | null
  items: AdminOrderItem[]
}

export interface AdminOrderDetail extends AdminOrderListItem {
  address: string
  phone: string
  mpPaymentId: string | null
  mpPreferenceId: string | null
}

export interface AdminOrdersMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedAdminOrders {
  items: AdminOrderListItem[]
  meta: AdminOrdersMeta
}

export interface AdminOrderFilters {
  status?: OrderStatus
  page?: number
  limit?: number
}
