export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="aspect-square rounded-t-md bg-[var(--color-surface-2)]" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-16 rounded-sm bg-[var(--color-surface-2)]" />
        <div className="h-4 w-3/4 rounded-sm bg-[var(--color-surface-2)]" />
        <div className="h-3 w-1/3 rounded-sm bg-[var(--color-surface-2)]" />
        <div className="mt-2 h-8 w-full rounded-md bg-[var(--color-surface-2)]" />
        <div className="h-8 w-full rounded-md bg-[var(--color-surface-2)]" />
      </div>
    </div>
  )
}
