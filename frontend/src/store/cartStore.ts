import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        if (product.stock === 0) return
        const qty = Math.min(quantity, product.stock)
        set(state => {
          const existing = state.items.find(i => i.productId === product.id)
          const newItems: CartItem[] = existing
            ? state.items.map(i =>
                i.productId === product.id
                  ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
                  : i,
              )
            : [
                ...state.items,
                {
                  productId: product.id,
                  code: product.code,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] ?? '',
                  quantity: qty,
                  stock: product.stock,
                },
              ]
          return { items: newItems, isOpen: true }
        })
      },

      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(i => i.productId !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set(state => ({ isOpen: !state.isOpen })),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'hacedor-cart',
      partialize: state => ({ items: state.items }),
    },
  ),
)
