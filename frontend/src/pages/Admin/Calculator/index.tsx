import { useFilaments } from '../../../hooks/useFilaments'
import Calculator3D from '../../../components/admin/Calculator3D'

export default function AdminCalculator() {
  const { data: filaments = [], isLoading } = useFilaments()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
          CALCULADORA 3D
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Calculá costos de fabricación con materiales reales.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-md bg-[var(--color-surface)]" />
      ) : (
        <div className="max-w-xl">
          <Calculator3D filaments={filaments} />
        </div>
      )}
    </div>
  )
}
