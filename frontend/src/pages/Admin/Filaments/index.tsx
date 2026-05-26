import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/useToast'
import {
  useCreateFilament,
  useDeleteFilament,
  useFilaments,
  useUpdateFilament,
} from '../../../hooks/useFilaments'
import type { Filament } from '../../../types'

const schema = z.object({
  brandName: z.string().min(2, 'Mínimo 2 caracteres'),
  material: z.string().min(1, 'Requerido'),
  colorName: z.string().min(1, 'Requerido'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hex inválido')
    .optional()
    .or(z.literal('')),
  pricePerKg: z.coerce.number().positive('Debe ser positivo'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'Resina', 'Otro']

function FilamentForm({
  filament,
  onSubmit,
  isSubmitting,
}: {
  filament?: Filament
  onSubmit: (data: FormValues) => void
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: filament
      ? {
          brandName: filament.brandName,
          material: filament.material,
          colorName: filament.colorName,
          colorHex: filament.colorHex ?? '',
          pricePerKg: filament.pricePerKg,
          isActive: filament.isActive,
        }
      : { isActive: true },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Marca" placeholder="Hellbot" error={errors.brandName?.message} {...register('brandName')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">Material</label>
          <select
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            {...register('material')}
          >
            <option value="">Seleccioná...</option>
            {MATERIALS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.material && (
            <p className="text-xs text-[var(--color-red)]">{errors.material.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Color" placeholder="Azul" error={errors.colorName?.message} {...register('colorName')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            Color HEX <span className="text-[var(--color-text-muted)] font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="#1A2BC3"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] font-mono"
            {...register('colorHex')}
          />
          {errors.colorHex && (
            <p className="text-xs text-[var(--color-red)]">{errors.colorHex.message}</p>
          )}
        </div>
      </div>

      <Input
        label="Precio por kg (ARS)"
        type="number"
        step="1"
        min="0"
        error={errors.pricePerKg?.message}
        {...register('pricePerKg')}
      />

      <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
        <input type="checkbox" className="accent-[var(--color-accent)]" {...register('isActive')} />
        Activo
      </label>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {filament ? 'Guardar cambios' : 'Crear filamento'}
        </Button>
      </div>
    </form>
  )
}

export default function AdminFilaments() {
  const { data: filaments = [], isLoading } = useFilaments()
  const createMutation = useCreateFilament()
  const updateMutation = useUpdateFilament()
  const deleteMutation = useDeleteFilament()
  const { toast } = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Filament | null>(null)

  async function handleCreate(values: FormValues) {
    try {
      await createMutation.mutateAsync({
        brandName: values.brandName,
        material: values.material,
        colorName: values.colorName,
        colorHex: values.colorHex || undefined,
        pricePerKg: values.pricePerKg,
        isActive: values.isActive,
      })
      setCreateOpen(false)
      toast.success('Filamento creado.')
    } catch {
      toast.error('Error al crear filamento.')
    }
  }

  async function handleUpdate(values: FormValues) {
    if (!editing) return
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          brandName: values.brandName,
          material: values.material,
          colorName: values.colorName,
          colorHex: values.colorHex || undefined,
          pricePerKg: values.pricePerKg,
          isActive: values.isActive,
        },
      })
      setEditing(null)
      toast.success('Filamento actualizado.')
    } catch {
      toast.error('Error al actualizar filamento.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Desactivar este filamento?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Filamento desactivado.')
    } catch {
      toast.error('Error al desactivar filamento.')
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
            FILAMENTOS
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {filaments.length} materiales registrados
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={16} />}>
          Nuevo filamento
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-md bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : filaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Sin filamentos registrados.</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Agregá materiales para usarlos en productos y la calculadora.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filaments.map(f => (
            <div
              key={f.id}
              className={`rounded-md border bg-[var(--color-surface)] p-4 transition-colors ${
                f.isActive
                  ? 'border-[var(--color-border)]'
                  : 'border-[var(--color-border)] opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {f.colorHex && (
                    <span
                      className="size-4 flex-shrink-0 rounded-full border border-[var(--color-border)]"
                      style={{ backgroundColor: f.colorHex }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {f.colorName}
                    </p>
                    <p className="font-mono text-xs text-[var(--color-accent)]">{f.material}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditing(f)}
                    aria-label="Editar"
                    className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    aria-label="Desactivar"
                    className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-red)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">{f.brandName}</span>
                <span className="font-mono text-xs text-[var(--color-text-primary)]">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0,
                  }).format(f.pricePerKg)}
                  /kg
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo filamento"
      >
        <FilamentForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Editar filamento"
      >
        {editing && (
          <FilamentForm
            filament={editing}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
