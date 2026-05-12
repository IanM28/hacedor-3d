import ProductCard from '../../components/features/ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'
import type { Product } from '../../types'

interface ProductGridProps {
  products?: Product[]
  isLoading: boolean
  isError: boolean
  search: string
}

export default function ProductGrid({ products, isLoading, isError, search: _search }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading && Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}

      {!isLoading && isError && (
        <p className="col-span-full font-body text-sm text-[var(--color-text-secondary)]">
          No se pudieron cargar los productos.
        </p>
      )}

      {!isLoading && !isError && products?.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <p className="font-body text-[var(--color-text-primary)]">Sin resultados</p>
          <p className="mt-1 font-body text-sm text-[var(--color-text-secondary)]">
            Probá cambiar los filtros o la búsqueda.
          </p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        products?.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
