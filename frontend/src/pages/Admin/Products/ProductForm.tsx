import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { useCategories } from '../../../hooks/useCategories'
import { useSuppliers } from '../../../hooks/useSuppliers'
import type { CreateProductInput, Product, UpdateProductInput } from '../../../types'

// z.coerce.number() handles string→number conversion from HTML inputs
const optNum = z.coerce.number().min(0).optional()

const schema = z.object({
  code: z.string().regex(/^[A-Z]+-\d{2}$/, 'Formato: AERO-01'),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().min(5, 'Mínimo 5 caracteres'),
  price: z.coerce.number().positive('Precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'Stock mínimo 0'),
  categoryId: z.string().uuid('Seleccioná una categoría'),
  supplierId: z.string().uuid('Seleccioná un proveedor'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  supplierCost: optNum,
  markupPercent: optNum,
  printHours: optNum,
  filamentGrams: optNum,
  profitMultiplier: optNum,
})

type FormValues = z.infer<typeof schema>

const COSTS = {
  filamentKgPrice: 20000,
  kwhPrice: 140,
  printerW: 120,
  usefulH: 4320,
  partsPrice: 15000,
  errorMargin: 0.3,
  tithe: 0.1,
  defaultMultiplier: 8,
} as const

function calcPreview(v: Partial<FormValues>) {
  // treat 0 as "not set" for print fields
  const h = v.printHours && v.printHours > 0 ? v.printHours : undefined
  const g = v.filamentGrams && v.filamentGrams > 0 ? v.filamentGrams : undefined
  const m = v.profitMultiplier && v.profitMultiplier > 0 ? v.profitMultiplier : COSTS.defaultMultiplier
  const sc = v.supplierCost ?? 0
  const p = v.price ?? 0

  if (!h || !g) {
    const net = p - sc
    return { cost: sc, suggested: sc * m, net, tithe: net * COSTS.tithe, estimated: true }
  }
  const mat = g * (COSTS.filamentKgPrice / 1000)
  const elec = h * (COSTS.printerW / 1000) * COSTS.kwhPrice
  const wear = h * (COSTS.partsPrice / COSTS.usefulH)
  const err = (mat + elec + wear) * COSTS.errorMargin
  const cost = mat + elec + wear + err
  const net = p - cost
  return { cost, suggested: cost * m, net, tithe: net * COSTS.tithe, estimated: false }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)

// Convert 0 optional numbers to undefined so API/Prisma treats them as "not set"
const cleanOpt = (v: number | undefined) => (v === 0 || v === undefined ? undefined : v)

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput | UpdateProductInput) => void
  isSubmitting: boolean
}

export default function ProductForm({ product, onSubmit, isSubmitting }: ProductFormProps) {
  const { data: categories = [] } = useCategories()
  const { data: suppliers = [] } = useSuppliers()
  // Images managed outside RHF schema to avoid type complexity
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [imageUrl, setImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          code: product.code,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.category.id,
          supplierId: product.supplier.id,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          supplierCost: product.supplierCost ?? undefined,
          markupPercent: product.markupPercent ?? undefined,
          printHours: product.printHours ?? undefined,
          filamentGrams: product.filamentGrams ?? undefined,
          profitMultiplier: product.profitMultiplier ?? undefined,
        }
      : { isActive: true, isFeatured: false, stock: 0 },
  })

  const watched = watch()
  const preview = useMemo(() => calcPreview(watched), [watched])
  const showPreview = (watched.printHours ?? 0) > 0 || (watched.filamentGrams ?? 0) > 0 || (watched.supplierCost ?? 0) > 0

  const addImage = () => {
    const url = imageUrl.trim()
    if (!url) return
    setImages(prev => [...prev, url])
    setImageUrl('')
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleFormSubmit = (values: FormValues) => {
    const payload: CreateProductInput = {
      ...values,
      images,
      supplierCost: cleanOpt(values.supplierCost),
      markupPercent: cleanOpt(values.markupPercent),
      printHours: cleanOpt(values.printHours),
      filamentGrams: cleanOpt(values.filamentGrams),
      profitMultiplier: cleanOpt(values.profitMultiplier),
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Código"
          placeholder="AERO-01"
          helperText="Formato: AERO-01, STN-02"
          error={errors.code?.message}
          disabled={!!product}
          {...register('code')}
        />
        <Input label="Nombre" error={errors.name?.message} {...register('name')} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
          Descripción
        </label>
        <textarea
          rows={2}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-[var(--color-red)]">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Precio (ARS)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
        <Input label="Stock" type="number" step="1" error={errors.stock?.message} {...register('stock')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">Categoría</label>
          <select
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            {...register('categoryId')}
          >
            <option value="">Seleccioná...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-[var(--color-red)]">{errors.categoryId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">Proveedor</label>
          <select
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            {...register('supplierId')}
          >
            <option value="">Seleccioná...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="text-xs text-[var(--color-red)]">{errors.supplierId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Costo proveedor" type="number" step="0.01" {...register('supplierCost')} />
        <Input label="Markup %" type="number" step="0.1" {...register('markupPercent')} />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
          <input type="checkbox" className="accent-[var(--color-accent)]" {...register('isActive')} />
          Activo
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-primary)]">
          <input type="checkbox" className="accent-[var(--color-accent)]" {...register('isFeatured')} />
          Destacado
        </label>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">Imágenes</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://..."
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addImage()
              }
            }}
            className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
          />
          <Button type="button" size="sm" variant="secondary" onClick={addImage} leftIcon={<Plus size={14} />}>
            Agregar
          </Button>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div
                key={i}
                className="relative w-16 h-16 rounded border border-[var(--color-border)] overflow-hidden"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Quitar imagen"
                  className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculadora 3D */}
      <div className="rounded-md border border-[var(--color-border-light)] bg-[var(--color-surface-2)] p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-accent)]">
          Calculadora 3D
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Hs. impresión" type="number" step="0.1" min="0" {...register('printHours')} />
          <Input label="Gs. filamento" type="number" step="0.1" min="0" {...register('filamentGrams')} />
          <Input label="Multiplicador" type="number" step="0.1" min="0" placeholder="8" {...register('profitMultiplier')} />
        </div>
        {showPreview && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
            <span className="text-[var(--color-text-secondary)]">Costo fabricación:</span>
            <span className="font-mono text-[var(--color-text-primary)]">{fmt(preview.cost)}</span>
            <span className="text-[var(--color-text-secondary)]">Precio sugerido:</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-[var(--color-accent)]">{fmt(preview.suggested)}</span>
              <button
                type="button"
                onClick={() => setValue('price', Math.round(preview.suggested))}
                className="text-[10px] underline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Usar
              </button>
            </span>
            <span className="text-[var(--color-text-secondary)]">Ganancia neta:</span>
            <span className="font-mono text-[var(--color-text-primary)]">{fmt(preview.net)}</span>
            <span className="text-[var(--color-text-secondary)]">Diezmo:</span>
            <span className="font-mono text-[var(--color-text-primary)]">{fmt(preview.tithe)}</span>
            {preview.estimated && (
              <span className="col-span-2 text-[10px] text-orange-400 mt-0.5">
                Estimado — sin datos de impresión completos
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
