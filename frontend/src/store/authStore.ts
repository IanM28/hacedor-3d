import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types'

interface AuthStore {
  user: AuthUser | null
  token: string | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => get().user !== null && get().token !== null,
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'hacedor-auth',
      partialize: state => ({ user: state.user, token: state.token }),
    },
  ),
)
