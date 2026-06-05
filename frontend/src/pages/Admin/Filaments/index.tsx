import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit2, Plus, Scale, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/useToast'
import {
  useAdjustFilament,
  useCreateFilament,
  useDeleteFilament,
  useFilaments,
  useUpdateFilament,
} from '../../../hooks/useFilaments'
import type { AdjustFilamentInput, Filament } from '../../../types'

const filamentSchema = z.object({
  brandName: z.string().min(2, 'Mínimo 2 caracteres'),
  material: z.string().min(1, 'Requerido'),
  colorName: z.string().min(1, 'Requerido'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hex inválido')
    .optional()
    .or(z.literal('')),
  pricePerKg: z.coerce.number().positive('Debe ser positivo'),
  initialWeightGrams: z.coerce.number().min(0, 'No puede ser negativo'),
  currentWeightGrams: z.coerce.number().min(0, 'No puede ser negativo'),
  tareWeightGrams: z.coerce.number().min(0, 'No puede ser negativo'),
  isActive: z.boolean(),
})

type FilamentFormValues = z.infer<typeof filamentSchema>

const adjustSchema = z.object({
  currentWeightGrams: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  grossWeightGrams: z.coerce.number().min(0, 'No puede ser negativo').optional(),
  notes: z.string().optional(),
})

type AdjustFormValues = z.infer<typeof adjustSchema>

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'Resina', 'Otro']

function FilamentForm({
  filament,
  onSubmit,
  isSubmitting,
}: {
  filament?: Filament
  onSubmit: (data: FilamentFormValues) => void
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FilamentFormValues>({
    resolver: zodResolver(filamentSchema),
    defaultValues: filament
      ? {
          brandName: filament.brandName,
          material: filament.material,
          colorName: filament.colorName,
          colorHex: filament.colorHex ?? '',
          pricePerKg: filament.pricePerKg,
          initialWeightGrams: filament.initialWeightGrams,
          currentWeightGrams: filament.currentWeightGrams,
          tareWeightGrams: filament.tareWeightGrams,
          isActive: filament.isActive,
        }
      : {
          isActive: true,
          initialWeightGrams: 1000,
          currentWeightGrams: 1000,
          tareWeightGrams: 0,
        },
  })

  const colorHex = watch('colorHex') ?? ''

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
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorHex || '#1a1a1a'}
              onChange={e => setValue('colorHex', e.target.value, { shouldValidate: true })}
              title="Seleccionar color"
              className="h-9 w-10 cursor-pointer rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 outline-none hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm"
            />
            <input
              type="text"
              placeholder="#1A2BC3"
              value={colorHex}
              onChange={e => setValue('colorHex', e.target.value, { shouldValidate: true })}
              className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] font-mono"
            />
          </div>
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

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Peso inicial (g)"
          type="number"
          step="1"
          min="0"
          error={errors.initialWeightGrams?.message}
          {...register('initialWeightGrams')}
        />
        <Input
          label="Peso actual (g)"
          type="number"
          step="1"
          min="0"
          error={errors.currentWeightGrams?.message}
          {...register('currentWeightGrams')}
        />
        <Input
          label="Tara bobina (g)"
          type="number"
          step="1"
          min="0"
          error={errors.tareWeightGrams?.message}
          {...register('tareWeightGrams')}
        />
      </div>

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

function AdjustModal({
  filament,
  onClose,
}: {
  filament: Filament
  onClose: () => void
}) {
  const adjustMutation = useAdjustFilament()
  const { toast } = useToast()

  const [mode, setMode] = useState<'MANUAL' | 'SCALE'>('MANUAL')
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { currentWeightGrams: filament.currentWeightGrams },
  })

  const grossValue = watch('grossWeightGrams')
  const netPreview =
    mode === 'SCALE' && grossValue !== undefined
      ? Math.max(0, Number(grossValue) - filament.tareWeightGrams)
      : null

  async function onSubmit(values: AdjustFormValues) {
    try {
      let payload: AdjustFilamentInput
      if (mode === 'MANUAL') {
        const grams = values.currentWeightGrams
        if (grams === undefined) return
        payload = { mode: 'MANUAL', currentWeightGrams: grams, notes: values.notes }
      } else {
        const gross = values.grossWeightGrams
        if (gross === undefined) return
        payload = { mode: 'SCALE', grossWeightGrams: gross, notes: values.notes }
      }
      await adjustMutation.mutateAsync({ id: filament.id, data: payload })
      toast.success('Inventario actualizado.')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al ajustar inventario.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('MANUAL')}
          className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
            mode === 'MANUAL'
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-text-primary)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)]'
          }`}
        >
          Ajuste manual
        </button>
        <button
          type="button"
          onClick={() => setMode('SCALE')}
          className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
            mode === 'SCALE'
              ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-text-primary)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)]'
          }`}
        >
          Peso en balanza
        </button>
      </div>

      {mode === 'MANUAL' ? (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Ingresá el peso neto de plástico restante en la bobina.
          </p>
          <Input
            label="Gramos netos restantes"
            type="number"
            step="1"
            min="0"
            error={errors.currentWeightGrams?.message}
            {...register('currentWeightGrams')}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Pesá la bobina completa en la balanza e ingresá el peso bruto.
            Tara registrada: <span className="font-mono text-[var(--color-text-primary)]">{filament.tareWeightGrams}g</span>
          </p>
          <Input
            label="Peso bruto en balanza (g)"
            type="number"
            step="1"
            min="0"
            error={errors.grossWeightGrams?.message}
            {...register('grossWeightGrams')}
          />
          {netPreview !== null && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Plástico neto ={' '}
                <span className="font-mono text-[var(--color-text-primary)]">
                  {netPreview}g
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <Input
        label="Notas (opcional)"
        placeholder="Motivo del ajuste"
        {...register('notes')}
      />

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" isLoading={adjustMutation.isPending}>
          Confirmar ajuste
        </Button>
      </div>
    </form>
  )
}

function FilamentProgressBar({ filament }: { filament: Filament }) {
  const pct = filament.initialWeightGrams > 0
    ? Math.min(100, Math.max(0, (filament.currentWeightGrams / filament.initialWeightGrams) * 100))
    : 0
  const isLow = pct < 15

  return (
    <div className="mt-3 space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: isLow ? 'var(--color-red)' : (filament.colorHex ?? 'var(--color-accent)'),
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={`font-mono text-xs ${isLow ? 'text-[var(--color-red)]' : 'text-[var(--color-text-secondary)]'}`}>
          {Math.round(filament.currentWeightGrams)}g / {Math.round(filament.initialWeightGrams)}g
        </span>
        <span className={`font-mono text-xs ${isLow ? 'text-[var(--color-red)]' : 'text-[var(--color-text-muted)]'}`}>
          {Math.round(pct)}%
          {isLow && ' · Stock bajo'}
        </span>
      </div>
    </div>
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
  const [adjusting, setAdjusting] = useState<Filament | null>(null)

  async function handleCreate(values: FilamentFormValues) {
    try {
      await createMutation.mutateAsync({
        brandName: values.brandName,
        material: values.material,
        colorName: values.colorName,
        colorHex: values.colorHex || undefined,
        pricePerKg: values.pricePerKg,
        initialWeightGrams: values.initialWeightGrams,
        currentWeightGrams: values.currentWeightGrams,
        tareWeightGrams: values.tareWeightGrams,
        isActive: values.isActive,
      })
      setCreateOpen(false)
      toast.success('Filamento creado.')
    } catch {
      toast.error('Error al crear filamento.')
    }
  }

  async function handleUpdate(values: FilamentFormValues) {
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
          initialWeightGrams: values.initialWeightGrams,
          currentWeightGrams: values.currentWeightGrams,
          tareWeightGrams: values.tareWeightGrams,
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
            <div key={i} className="h-32 animate-pulse rounded-md bg-[var(--color-surface)]" />
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
                  <span
                    className="size-4 flex-shrink-0 rounded-full border border-[var(--color-border)]"
                    style={{ backgroundColor: f.colorHex ?? '#6B7280' }}
                  />
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
                    onClick={() => setAdjusting(f)}
                    aria-label="Ajustar inventario"
                    title="Ajustar inventario"
                    className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <Scale size={14} />
                  </button>
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

              <div className="mt-2 flex items-center justify-between">
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

              <FilamentProgressBar filament={f} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo filamento">
        <FilamentForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar filamento">
        {editing && (
          <FilamentForm filament={editing} onSubmit={handleUpdate} isSubmitting={updateMutation.isPending} />
        )}
      </Modal>

      <Modal
        isOpen={!!adjusting}
        onClose={() => setAdjusting(null)}
        title={adjusting ? `Ajustar — ${adjusting.colorName} (${adjusting.brandName})` : 'Ajustar inventario'}
      >
        {adjusting && (
          <AdjustModal filament={adjusting} onClose={() => setAdjusting(null)} />
        )}
      </Modal>
    </div>
  )
}
