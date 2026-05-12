import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from '../../components/features/ProductCard'
import ProductCardSkeleton from '../Catalog/ProductCardSkeleton'

export default function FeaturedPreview() {
  const { data: products, isLoading, isError } = useProducts({ featured: true })
  const featured = products?.slice(0, 3)

  return (
    <section className="bg-[var(--color-bg)] px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl tracking-wide text-[var(--color-text-primary)] sm:text-5xl">
              PIEZAS DESTACADAS
            </h2>
            <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">
              Diseño industrial. Fabricación aditiva.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="font-body text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Ver colección →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}

          {!isLoading && isError && (
            <p className="col-span-full font-body text-sm text-[var(--color-text-secondary)]">
              No se pudieron cargar los productos.
            </p>
          )}

          {!isLoading && !isError && featured?.length === 0 && (
            <p className="col-span-full font-body text-sm text-[var(--color-text-secondary)]">
              Sin piezas destacadas por ahora.
            </p>
          )}

          {!isLoading &&
            !isError &&
            featured?.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}
