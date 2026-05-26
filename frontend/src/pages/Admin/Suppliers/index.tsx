import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit2, ExternalLink, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import AlertDialog from '../../../components/ui/AlertDialog'
import { useToast } from '../../../components/ui/useToast'
import {
  useAdminSuppliers,
  useCreateSupplier,
  useDeleteSupplier,
  useUpdateSupplier,
} from '../../../hooks/useSuppliers'
import type { Supplier } from '../../../types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  contactUrl: z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function SupplierForm({
  supplier,
  onSubmit,
  isSubmitting,
}: {
  supplier?: Supplier
  onSubmit: (data: FormValues) => void
  isSubmitting: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: supplier
      ? {
          name: supplier.name,
          contactUrl: supplier.contactUrl ?? '',
          isActive: supplier.isActive,
        }
      : { contactUrl: '', isActive: true },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Ej: Hellbot Argentina"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="URL de contacto"
        placeholder="https://proveedor.com o https://wa.me/..."
        helperText="Opcional — sitio web, WhatsApp o cualquier URL de contacto"
        error={errors.contactUrl?.message}
        {...register('contactUrl')}
      />

      <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
        <input type="checkbox" className="accent-[var(--color-accent)]" {...register('isActive')} />
        Activo
      </label>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {supplier ? 'Guardar cambios' : 'Crear proveedor'}
        </Button>
      </div>
    </form>
  )
}

export default function AdminSuppliers() {
  const { data: suppliers = [], isLoading } = useAdminSuppliers()
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const deleteMutation = useDeleteSupplier()
  const { toast } = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleting, setDeleting] = useState<Supplier | null>(null)

  async function handleCreate(values: FormValues) {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        contactUrl: values.contactUrl || undefined,
        isActive: values.isActive,
      })
      setCreateOpen(false)
      toast.success('Proveedor creado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear proveedor.')
    }
  }

  async function handleUpdate(values: FormValues) {
    if (!editing) return
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          name: values.name,
          contactUrl: values.contactUrl || undefined,
          isActive: values.isActive,
        },
      })
      setEditing(null)
      toast.success('Proveedor actualizado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar proveedor.')
    }
  }

  async function handleToggleActive(sup: Supplier) {
    try {
      await updateMutation.mutateAsync({
        id: sup.id,
        data: { isActive: !sup.isActive },
      })
      toast.success(sup.isActive ? 'Proveedor desactivado.' : 'Proveedor activado.')
    } catch {
      toast.error('Error al cambiar estado.')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
      toast.success('Proveedor desactivado.')
    } catch {
      toast.error('Error al desactivar proveedor.')
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
            PROVEEDORES
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {suppliers.length} proveedores registrados
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={16} />}>
          Nuevo proveedor
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Sin proveedores registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)]">
                  Contacto
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
              {suppliers.map((sup, i) => (
                <tr
                  key={sup.id}
                  className={[
                    'border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-2)]',
                    i % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-surface)]',
                    !sup.isActive ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {sup.name}
                  </td>
                  <td className="px-4 py-3">
                    {sup.contactUrl ? (
                      <a
                        href={sup.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-accent)] hover:underline"
                      >
                        {sup.contactUrl.length > 40
                          ? `${sup.contactUrl.slice(0, 40)}…`
                          : sup.contactUrl}
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
                        sup.isActive
                          ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
                      ].join(' ')}
                    >
                      {sup.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(sup)}
                        aria-label={sup.isActive ? 'Desactivar' : 'Activar'}
                        title={sup.isActive ? 'Desactivar' : 'Activar'}
                        className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {sup.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(sup)}
                        aria-label="Editar"
                        className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(sup)}
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

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo proveedor">
        <SupplierForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar proveedor">
        {editing && (
          <SupplierForm
            supplier={editing}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>

      <AlertDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Desactivar proveedor"
        description={`¿Desactivar "${deleting?.name}"? El proveedor quedará oculto pero sus productos no se modifican.`}
        confirmLabel="Desactivar"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
