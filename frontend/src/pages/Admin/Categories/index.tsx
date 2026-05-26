import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit2, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import AlertDialog from '../../../components/ui/AlertDialog'
import { useToast } from '../../../components/ui/useToast'
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../../hooks/useCategories'
import type { Category } from '../../../types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hex inválido')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function CategoryForm({
  category,
  onSubmit,
  isSubmitting,
}: {
  category?: Category
  onSubmit: (data: FormValues) => void
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          name: category.name,
          colorHex: category.colorHex ?? '#4A7C59',
          isActive: category.isActive,
        }
      : { colorHex: '#4A7C59', isActive: true },
  })

  const colorHex = watch('colorHex') ?? '#4A7C59'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Ej: Aeroespacial"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-primary)]">
          Color HEX{' '}
          <span className="text-[var(--color-text-muted)] font-normal">(opcional)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorHex || '#4A7C59'}
            onChange={e => setValue('colorHex', e.target.value, { shouldValidate: true })}
            title="Seleccionar color"
            className="h-9 w-10 cursor-pointer rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 outline-none hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm"
          />
          <input
            type="text"
            placeholder="#4A7C59"
            value={colorHex}
            onChange={e => setValue('colorHex', e.target.value, { shouldValidate: true })}
            className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] font-mono"
          />
        </div>
        {errors.colorHex && (
          <p className="text-xs text-[var(--color-red)]">{errors.colorHex.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
        <input type="checkbox" className="accent-[var(--color-accent)]" {...register('isActive')} />
        Activa
      </label>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {category ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useAdminCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const { toast } = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  async function handleCreate(values: FormValues) {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        colorHex: values.colorHex || undefined,
        isActive: values.isActive,
      })
      setCreateOpen(false)
      toast.success('Categoría creada.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear categoría.')
    }
  }

  async function handleUpdate(values: FormValues) {
    if (!editing) return
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          name: values.name,
          colorHex: values.colorHex || undefined,
          isActive: values.isActive,
        },
      })
      setEditing(null)
      toast.success('Categoría actualizada.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar categoría.')
    }
  }

  async function handleToggleActive(cat: Category) {
    try {
      await updateMutation.mutateAsync({
        id: cat.id,
        data: { isActive: !cat.isActive },
      })
      toast.success(cat.isActive ? 'Categoría desactivada.' : 'Categoría activada.')
    } catch {
      toast.error('Error al cambiar estado.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
      toast.success('Categoría desactivada.')
    } catch {
      toast.error('Error al desactivar categoría.')
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
            CATEGORÍAS
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {categories.length} categorías registradas
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={16} />}>
          Nueva categoría
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Sin categorías registradas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Color
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr
                  key={cat.id}
                  className={[
                    'border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-2)]',
                    i % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-surface)]',
                    !cat.isActive ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-block size-5 rounded border border-[var(--color-border)]"
                      style={{ backgroundColor: cat.colorHex ?? '#4A7C59' }}
                      title={cat.colorHex ?? '#4A7C59'}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-accent)]">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                        cat.isActive
                          ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
                      ].join(' ')}
                    >
                      {cat.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        aria-label={cat.isActive ? 'Desactivar' : 'Activar'}
                        title={cat.isActive ? 'Desactivar' : 'Activar'}
                        className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {cat.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(cat)}
                        aria-label="Editar"
                        className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(cat)}
                        aria-label="Eliminar"
                        className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-red)] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nueva categoría">
        <CategoryForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
      </Modal>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Editar categoría"
      >
        {editing && (
          <CategoryForm
            category={editing}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>

      <AlertDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Desactivar categoría"
        description={`¿Desactivar "${deleting?.name}"? La categoría quedará oculta pero sus productos se conservan.`}
        confirmLabel="Desactivar"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
