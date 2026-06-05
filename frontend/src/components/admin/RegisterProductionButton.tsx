import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Factory } from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { useToast } from '../ui/useToast'
import { useRegisterProduction } from '../../hooks/useRegisterProduction'
import type { Product } from '../../types'

const schema = z.object({
  quantity: z.coerce.number().int().min(1, 'Mínimo 1 unidad'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface RegisterProductionButtonProps {
  product: Product
}

export function RegisterProductionButton({ product }: RegisterProductionButtonProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const mutation = useRegisterProduction()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  })

  const quantity = watch('quantity')

  const hasRecipe = (product.filamentUsages?.length ?? 0) > 0

  async function onSubmit(values: FormValues) {
    try {
      await mutation.mutateAsync({ productId: product.id, quantity: values.quantity, notes: values.notes })
      toast.success('Fabricación registrada.')
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar fabricación.')
    }
  }

  function handleOpen() {
    reset({ quantity: 1 })
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Registrar fabricación de ${product.code}`}
        title="Registrar fabricación"
        className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <Factory size={15} />
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Fabricación — ${product.code}`}
      >
        <div className="space-y-5">
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{product.name}</p>
            <p className="mt-0.5 font-mono text-xs text-[var(--color-accent)]">{product.code}</p>
          </div>

          {!hasRecipe ? (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Este producto no tiene receta de materiales asignada.
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Editá el producto y asigná los filamentos que utiliza para poder registrar fabricación.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Unidades fabricadas"
                type="number"
                min="1"
                step="1"
                error={errors.quantity?.message}
                {...register('quantity')}
              />

              {product.filamentUsages && product.filamentUsages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
                    Consumo estimado
                  </p>
                  <div className="space-y-1.5">
                    {product.filamentUsages.map(usage => {
                      const totalRequired = usage.grams * (Number(quantity) || 0)
                      const hasEnough = usage.filament.currentWeightGrams >= totalRequired

                      return (
                        <div
                          key={usage.id}
                          className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
                            hasEnough
                              ? 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                              : 'border-[var(--color-red)] bg-[var(--color-surface-2)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: usage.filament.colorHex ?? '#6B7280' }}
                            />
                            <span className="text-[var(--color-text-secondary)]">
                              {usage.filament.colorName} — {usage.filament.brandName} {usage.filament.material}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-right">
                            <span className={`font-mono ${hasEnough ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-red)]'}`}>
                              {totalRequired}g
                            </span>
                            {!hasEnough && (
                              <span className="text-[var(--color-text-muted)]">
                                (disponible: {Math.round(usage.filament.currentWeightGrams)}g)
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <Input
                label="Notas (opcional)"
                placeholder="Lote, observaciones..."
                {...register('notes')}
              />

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" isLoading={mutation.isPending}>
                  Registrar fabricación
                </Button>
              </div>
            </form>
          )}

          {!hasRecipe && (
            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
