import { useProducts } from '../../hooks/useProducts'

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="h-3 w-16 rounded-sm bg-[var(--color-surface-2)]" />
      <div className="mt-3 h-4 w-3/4 rounded-sm bg-[var(--color-surface-2)]" />
      <div className="mt-2 h-3 w-1/3 rounded-sm bg-[var(--color-surface-2)]" />
    </div>
  )
}

export default function FeaturedPreview() {
  const { data: products, isLoading, isError } = useProducts({ featured: true })

  return (
    <section className="bg-[var(--color-bg)] px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl tracking-wide text-[var(--color-text-primary)] sm:text-5xl">
          PIEZAS DESTACADAS
        </h2>
        <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">
          Diseño industrial. Fabricación aditiva.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {isError && (
            <p className="col-span-full font-body text-sm text-[var(--color-text-secondary)]">
              No se pudieron cargar los productos.
            </p>
          )}

          {!isLoading && !isError && products?.length === 0 && (
            <p className="col-span-full font-body text-sm text-[var(--color-text-secondary)]">
              Sin piezas destacadas por ahora.
            </p>
          )}

          {!isLoading &&
            !isError &&
            products?.map(product => (
              <a
                key={product.id}
                href={`/productos/${product.id}`}
                className="group rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)]"
              >
                <span className="font-mono text-xs text-[var(--color-accent)]">
                  {product.code}
                </span>
                <p className="mt-2 font-body text-[var(--color-text-primary)]">{product.name}</p>
                <p className="mt-1 font-mono text-sm text-[var(--color-text-secondary)]">
                  ${product.price.toLocaleString('es-AR')}
                </p>
              </a>
            ))}
        </div>
      </div>
    </section>
  )
}
