import type { Category } from '../../types'

interface CatalogFiltersProps {
  categories: Category[]
  selectedCategory?: string
  featuredOnly: boolean
  onCategoryChange: (slug?: string) => void
  onFeaturedChange: (value: boolean) => void
}

const chip =
  'shrink-0 rounded-md border px-3 py-1.5 font-body text-sm transition-colors'
const activeChip =
  'border-[var(--color-accent)] bg-[var(--color-accent)] font-medium text-[var(--color-on-accent)]'
const idleChip =
  'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text-primary)]'

export default function CatalogFilters({
  categories,
  selectedCategory,
  featuredOnly,
  onCategoryChange,
  onFeaturedChange,
}: CatalogFiltersProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex w-max gap-2" role="toolbar" aria-label="Filtros de colección">
        <button
          type="button"
          onClick={() => onCategoryChange(undefined)}
          className={`${chip} ${!selectedCategory ? activeChip : idleChip}`}
          aria-pressed={!selectedCategory}
        >
          Todos
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.slug)}
            className={`${chip} ${selectedCategory === cat.slug ? activeChip : idleChip}`}
            aria-pressed={selectedCategory === cat.slug}
          >
            {cat.name}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onFeaturedChange(!featuredOnly)}
          className={`${chip} ${featuredOnly ? activeChip : idleChip}`}
          aria-pressed={featuredOnly}
        >
          Destacados
        </button>
      </div>
    </div>
  )
}
