import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />
  return <>{children}</>
}
