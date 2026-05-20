import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Colección', to: '/catalogo' },
]

const linkClass =
  'font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { toggleDrawer, itemCount } = useCartStore()
  const count = itemCount()
  const { user, isAuthenticated, logout } = useAuthStore()

  function handleLogout() {
    logout()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-wide text-[var(--color-text-primary)]">
            HACEDOR 3D
          </span>
          <span className="font-mono text-[9px] tracking-widest text-[var(--color-accent)]">
            3D FACTORY
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex" aria-label="Navegación principal">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
            onClick={toggleDrawer}
            className="relative rounded-md p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <ShoppingCart className="size-5" />
            <span
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-accent)] font-mono text-[10px] leading-none text-[var(--color-bg)]"
              aria-hidden
            >
              {count > 99 ? '99' : count}
            </span>
          </button>

          {/* User section — desktop */}
          <div ref={dropdownRef} className="relative hidden sm:block">
            {isAuthenticated() ? (
              <>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(p => !p)}
                  className="rounded-md px-2 py-1.5 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  {user?.name}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg">
                    <span className="block px-3 py-2 font-body text-xs text-[var(--color-text-muted)]">
                      Mi cuenta
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className={`rounded-md px-2 py-1.5 ${linkClass}`}>
                Iniciar sesión
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileOpen(prev => !prev)}
            className="rounded-md p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] sm:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 pb-4 sm:hidden"
          aria-label="Navegación mobile"
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 font-body text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated() ? (
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full py-3 text-left font-body text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block py-3 font-body text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
