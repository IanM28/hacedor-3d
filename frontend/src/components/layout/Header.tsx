import { useState } from 'react'
import { Menu, ShoppingCart, User, X } from 'lucide-react'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Colección', href: '/catalogo' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-wide text-[var(--color-text-primary)]">
            HACEDOR 3D
          </span>
          <span className="font-mono text-[9px] tracking-widest text-[var(--color-accent)]">
            3D FACTORY
          </span>
        </a>

        <nav className="hidden items-center gap-6 sm:flex" aria-label="Navegación principal">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Carrito, 0 productos"
            className="relative rounded-md p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <ShoppingCart className="size-5" />
            <span
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-accent)] font-mono text-[10px] leading-none text-[var(--color-bg)]"
              aria-hidden
            >
              0
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
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 font-body text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
