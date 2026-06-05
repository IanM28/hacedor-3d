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

export type FilamentLogType = 'MANUAL_ADJUSTMENT' | 'SCALE_WEIGHING' | 'PRODUCTION_CONSUMPTION'

export interface Filament {
  id: string
  brandName: string
  material: string
  colorName: string
  colorHex?: string | null
  pricePerKg: number
  isActive: boolean
  initialWeightGrams: number
  currentWeightGrams: number
  tareWeightGrams: number
  createdAt?: string
}

export interface FilamentLog {
  id: string
  filamentId: string
  productId?: string | null
  type: FilamentLogType
  gramsDelta: number
  previousWeightGrams: number
  newWeightGrams: number
  grossWeightGrams?: number | null
  tareWeightGrams?: number | null
  quantity?: number | null
  notes?: string | null
  createdAt: string
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
  initialWeightGrams?: number
  currentWeightGrams?: number
  tareWeightGrams?: number
}

export type UpdateFilamentInput = Partial<CreateFilamentInput>

export type AdjustFilamentInput =
  | { mode: 'MANUAL'; currentWeightGrams: number; notes?: string }
  | { mode: 'SCALE'; grossWeightGrams: number; notes?: string }

export interface RegisterProductionInput {
  productId: string
  quantity: number
  notes?: string
}

export interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number
  stock: number
  weight: number
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
  dimensionX?: number | null
  dimensionY?: number | null
  dimensionZ?: number | null
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
  weight?: number
  dimensionX?: number
  dimensionY?: number
  dimensionZ?: number
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
  shippingProvider?: string
  shippingService?: string
  shippingPostalCode?: string
  items: OrderItemInput[]
}

export interface ShippingQuoteItem {
  productId: string
  quantity: number
}

export interface ShippingQuoteInput {
  postalCode: string
  items: ShippingQuoteItem[]
}

export interface ShippingQuoteOption {
  id: string
  provider: string
  service: string
  price: number
  estimatedDelivery: string
}

export interface SelectedShippingOption {
  id: string
  provider: string
  service: string
  price: number
  estimatedDelivery: string
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
  shippingProvider?: string | null
  shippingService?: string | null
  shippingPostalCode?: string | null
  shippingTrackingNumber?: string | null
  shippingLabelUrl?: string | null
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
