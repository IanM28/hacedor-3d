import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ShoppingCart, User, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Colección', to: '/catalogo' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleDrawer, itemCount } = useCartStore()
  const count = itemCount()

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
            <Link
              key={link.to}
              to={link.to}
              className="font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
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

          <button
            type="button"
            aria-label="Cuenta de usuario"
            className="hidden rounded-md p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] sm:block"
          >
            <User className="size-5" />
          </button>

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
        </nav>
      )}
    </header>
  )
}
