import type { Category } from '../../types'

interface CatalogFiltersProps {
  categories: Category[]
  selectedCategory?: string
  featuredOnly: boolean
  onCategoryChange: (slug?: string) => void
  onFeaturedChange: (value: boolean) => void
}

export default function CatalogFilters({
  categories,
  selectedCategory,
  featuredOnly,
  onCategoryChange,
  onFeaturedChange,
}: CatalogFiltersProps) {
  const activeBtn =
    'bg-[var(--color-accent)] text-[var(--color-bg)] font-medium'
  const idleBtn =
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'

  return (
    <aside className="w-full lg:w-44 lg:shrink-0">
      <p className="font-mono text-[10px] tracking-widest text-[var(--color-text-muted)]">
        FILTROS
      </p>

      <div className="mt-3 flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
        <button
          type="button"
          onClick={() => onCategoryChange(undefined)}
          className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${!selectedCategory ? activeBtn : idleBtn}`}
        >
          Todos
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.slug)}
            className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${selectedCategory === cat.slug ? activeBtn : idleBtn}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-2 font-body text-sm text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={featuredOnly}
          onChange={e => onFeaturedChange(e.target.checked)}
          className="accent-[var(--color-accent)]"
          aria-label="Mostrar solo destacados"
        />
        Solo destacados
      </label>
    </aside>
  )
}
