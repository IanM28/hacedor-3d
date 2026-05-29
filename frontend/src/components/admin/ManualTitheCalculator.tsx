import { useState, useMemo } from 'react'
import { Search, X, Plus, Minus } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import type { Product } from '../../types'

interface LineItem {
  product: Product
  quantity: number
}

const formatARS = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)

export function ManualTitheCalculator() {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { data: products = [] } = useProducts({ search: search.length >= 2 ? search : undefined })

  const filtered = useMemo(() => {
    const addedIds = new Set(items.map(i => i.product.id))
    return products.filter(p => p.isActive && !addedIds.has(p.id))
  }, [products, items])

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items],
  )
  const tithe = subtotal * 0.1

  const addProduct = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
    setSearch('')
    setDropdownOpen(false)
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    )
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.product.id !== id))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setDropdownOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-3 py-2">
          <Search size={14} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder="Buscar producto por nombre o código..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          {search && (
            <button onClick={() => { setSearch(''); setDropdownOpen(false) }}>
              <X size={13} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>

        {dropdownOpen && filtered.length > 0 && (
          <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-xl max-h-48 overflow-y-auto">
            {filtered.slice(0, 12).map(product => (
              <li key={product.id}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--color-surface-2)] transition-colors"
                  onMouseDown={() => addProduct(product)}
                >
                  <span className="font-mono text-[10px] text-[var(--color-accent)] shrink-0">
                    {product.code}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)] truncate flex-1">
                    {product.name}
                  </span>
                  <span className="font-mono text-xs text-[var(--color-text-secondary)] shrink-0">
                    {formatARS(product.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Line items */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-[var(--color-accent)]">{item.product.code}</p>
                <p className="text-sm text-[var(--color-text-primary)] truncate">{item.product.name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="font-mono text-sm text-[var(--color-text-primary)] w-7 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <Plus size={10} />
                </button>
              </div>
              <span className="font-mono text-sm text-[var(--color-text-primary)] w-28 text-right shrink-0">
                {formatARS(item.product.price * item.quantity)}
              </span>
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-red)] transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}

          {/* Totals */}
          <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Subtotal del lote</span>
              <span className="font-mono text-[var(--color-text-primary)]">{formatARS(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                Diezmo (10%)
              </span>
              <span className="font-mono text-lg font-medium text-[var(--color-accent)]">
                {formatARS(tithe)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-[var(--color-text-muted)] py-6">
          Buscá y seleccioná productos para calcular el diezmo manual del lote.
        </p>
      )}
    </div>
  )
}
