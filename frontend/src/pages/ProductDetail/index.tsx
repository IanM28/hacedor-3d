import { Link, useParams } from 'react-router-dom'
import { useProduct } from '../../hooks/useProduct'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6">
      <div className="mb-8 h-3 w-48 rounded-sm bg-[var(--color-surface-2)]" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-md bg-[var(--color-surface-2)]" />
        <div className="flex flex-col gap-4">
          <div className="h-3 w-20 rounded-sm bg-[var(--color-surface-2)]" />
          <div className="h-10 w-2/3 rounded-sm bg-[var(--color-surface-2)]" />
          <div className="h-6 w-1/3 rounded-sm bg-[var(--color-surface-2)]" />
          <div className="mt-2 h-24 w-full rounded-sm bg-[var(--color-surface-2)]" />
          <div className="mt-4 h-10 w-full rounded-md bg-[var(--color-surface-2)]" />
          <div className="h-10 w-full rounded-md bg-[var(--color-surface-2)]" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError } = useProduct(id)

  if (isLoading) return <DetailSkeleton />

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="font-body text-[var(--color-text-primary)]">
          {isError ? 'Producto no encontrado.' : 'Producto no disponible.'}
        </p>
        <Link
          to="/catalogo"
          className="mt-4 inline-block font-body text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          ← Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav
        className="mb-8 flex flex-wrap items-center gap-1.5 font-mono text-xs text-[var(--color-text-muted)]"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="transition-colors hover:text-[var(--color-text-secondary)]">
          Inicio
        </Link>
        <span>/</span>
        <Link to="/catalogo" className="transition-colors hover:text-[var(--color-text-secondary)]">
          Colección
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} code={product.code} />
        <ProductInfo product={product} />
      </div>
    </div>
  )
}
