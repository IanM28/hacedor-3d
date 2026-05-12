import { useEffect, useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import Input from '../../components/ui/Input'
import QuickView from '../../components/features/QuickView'
import CatalogFilters from './CatalogFilters'
import ProductGrid from './ProductGrid'
import type { Product } from '../../types'

export default function Catalog() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: categories = [] } = useCategories()
  const { data: products, isLoading, isError } = useProducts({
    category: selectedCategory,
    search: debouncedSearch || undefined,
    featured: featuredOnly || undefined,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl tracking-wide text-[var(--color-text-primary)] sm:text-6xl">
        COLECCIÓN
      </h1>
      <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">
        Piezas de diseño tecnológico. Fabricadas en Bariloche.
      </p>

      <div className="mt-8">
        <Input
          placeholder="Buscar por nombre o código…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Buscar productos"
        />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-12">
        <CatalogFilters
          categories={categories}
          selectedCategory={selectedCategory}
          featuredOnly={featuredOnly}
          onCategoryChange={setSelectedCategory}
          onFeaturedChange={setFeaturedOnly}
        />

        <div className="min-w-0 flex-1">
          {!isLoading && !isError && (
            <p className="mb-4 font-mono text-xs text-[var(--color-text-secondary)]">
              {products?.length ?? 0} resultado{products?.length !== 1 ? 's' : ''}
            </p>
          )}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            isError={isError}
            search={debouncedSearch}
            onQuickView={setQuickViewProduct}
          />
        </div>
      </div>

      <QuickView
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
