import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart2,
  Calculator,
  FlaskConical,
  Menu,
  Package,
  ShoppingBag,
  Tag,
  X,
} from 'lucide-react'
import AdminRoute from '../../components/layout/AdminRoute'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: BarChart2, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package, end: false },
  { to: '/admin/categorias', label: 'Categorías', icon: Tag, end: false },
  { to: '/admin/filamentos', label: 'Filamentos', icon: FlaskConical, end: false },
  { to: '/admin/calculadora', label: 'Calculadora', icon: Calculator, end: false },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, end: false },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
        <span className="font-heading text-2xl tracking-widest text-[var(--color-text-primary)]">
          ADMIN
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] md:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] border-l-2 border-[var(--color-accent)] pl-[10px]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <NavLink
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
          Volver a la tienda
        </NavLink>
      </div>
    </div>
  )
}

function AdminLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <Menu size={22} />
        </button>
        <span className="font-heading text-xl tracking-widest">ADMIN</span>
      </header>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full w-60 z-50 bg-[var(--color-surface)] border-r border-[var(--color-border)]',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminRoute>
      <AdminLayoutInner />
    </AdminRoute>
  )
}
