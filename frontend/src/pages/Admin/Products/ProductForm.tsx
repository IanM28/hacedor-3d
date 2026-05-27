import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/useToast'
import { useAdminCategories } from '../../../hooks/useCategories'
import { useFilaments } from '../../../hooks/useFilaments'
import { uploadService } from '../../../services/upload.service'
import Calculator3D, { type MaterialRow } from '../../../components/admin/Calculator3D'
import type { Category, CreateProductInput, Product, UpdateProductInput } from '../../../types'

const optNum = z.coerce.number().min(0).optional()

const schema = z.object({
  code: z.string().trim().min(2, 'Mínimo 2 caracteres'),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().min(5, 'Mínimo 5 caracteres'),
  price: z.coerce.number().positive('Precio debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'Stock mínimo 0'),
  categoryId: z.string().uuid('Seleccioná una categoría'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  printHours: optNum,
  profitMultiplier: optNum,
})

type FormValues = z.infer<typeof schema>

const cleanOpt = (v: number | undefined) => (v === 0 || v === undefined ? undefined : v)

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput | UpdateProductInput) => void
  isSubmitting: boolean
}

interface CategorySelectProps {
  categories: Category[]
  value: string
  onChange: (id: string) => void
  hasError: boolean
}

function CategorySelect({ categories, value, onChange, hasError }: CategorySelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = categories.find(c => c.id === value)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={[
          'w-full flex items-center gap-2 rounded-md border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition-colors text-left',
          hasError
            ? 'border-[var(--color-red)]'
            : open
              ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-accent)]',
        ].join(' ')}
      >
        <span
          className="size-3.5 rounded-full border border-white/20 flex-shrink-0"
          style={{ backgroundColor: selected?.colorHex ?? '#6B7280' }}
        />
        <span className="truncate flex-1">
          {selected ? selected.name : 'Seleccioná una categoría...'}
        </span>
        <span className="text-[var(--color-text-muted)] text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded border border-[var(--color-border-light)] bg-[var(--color-surface-2)] shadow-lg">
          {categories.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">Sin categorías disponibles.</p>
          ) : (
            categories.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false) }}
                className={[
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--color-surface)]',
                  c.id === value ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]',
                  !c.isActive ? 'opacity-50' : '',
                ].join(' ')}
              >
                <span
                  className="size-3.5 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: c.colorHex ?? '#6B7280' }}
                />
                <span className="truncate">{c.name}</span>
                {!c.isActive && (
                  <span className="ml-auto text-xs text-[var(--color-text-muted)] flex-shrink-0">inactiva</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function ProductForm({ product, onSubmit, isSubmitting }: ProductFormProps) {
  const { data: categories = [] } = useAdminCategories()
  const { data: filaments = [] } = useFilaments()
  const { toast } = useToast()

  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialMaterialRows: MaterialRow[] =
    product?.filamentUsages?.map(u => ({ filamentId: u.filamentId, grams: u.grams })) ?? []
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>(initialMaterialRows)

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
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          printHours: product.printHours ?? undefined,
          profitMultiplier: product.profitMultiplier ?? undefined,
        }
      : { isActive: true, isFeatured: false, stock: 0 },
  })

  const currentPrice = watch('price')
  const currentPrintHours = watch('printHours') ?? 0
  const currentMultiplier = watch('profitMultiplier') ?? 0

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagen demasiado grande. Máximo 5 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploadError(null)
    setUploading(true)
    try {
      const url = await uploadService.uploadProductImage(file)
      setImages(prev => [...prev, url])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al subir imagen. Verificá Cloudinary.'
      setUploadError(message)
      toast.error(message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  function handleFormSubmit(values: FormValues) {
    const payload: CreateProductInput = {
      ...values,
      images,
      printHours: cleanOpt(values.printHours),
      profitMultiplier: cleanOpt(values.profitMultiplier),
      filamentUsages: materialRows.filter(r => r.filamentId && r.grams > 0),
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Código"
          placeholder="AERO-01, MOD-03, TLR-1A..."
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
        <Input
          label="Precio (ARS)"
          type="number"
          step="0.01"
          error={errors.price?.message}
          {...register('price')}
        />
        <Input
          label="Stock"
          type="number"
          step="1"
          error={errors.stock?.message}
          {...register('stock')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text-primary)]">Categoría</label>
        <CategorySelect
          categories={categories}
          value={watch('categoryId') ?? ''}
          onChange={id => setValue('categoryId', id, { shouldValidate: true })}
          hasError={!!errors.categoryId}
        />
        {errors.categoryId && (
          <p className="text-xs text-[var(--color-red)]">{errors.categoryId.message}</p>
        )}
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={14} />
                Subir imagen
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-xs text-[var(--color-text-muted)]">JPG, PNG o WebP · máx. 5 MB</span>
        </div>
        {uploadError && (
          <p className="text-xs text-[var(--color-red)]">{uploadError}</p>
        )}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div
                key={i}
                className="relative w-16 h-16 rounded border border-[var(--color-border)] overflow-hidden bg-zinc-900"
              >
                <img src={url} alt="" className="w-full h-full object-contain" />
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

      {/* 3D Calculator with multi-material */}
      <Calculator3D
        filaments={filaments}
        initialPrintHours={currentPrintHours}
        initialMultiplier={currentMultiplier}
        initialSalePrice={currentPrice}
        initialMaterialRows={materialRows}
        onSuggestedPrice={price => setValue('price', price, { shouldValidate: true })}
        onPrintHoursChange={h => setValue('printHours', h, { shouldValidate: true })}
        onMultiplierChange={m => setValue('profitMultiplier', m, { shouldValidate: true })}
        onMaterialRowsChange={setMaterialRows}
      />

      {/* Material rows synced from Calculator */}
      {materialRows.length > 0 && (
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
            Materiales asignados
          </p>
          {materialRows.map((row, idx) => {
            const f = filaments.find(x => x.id === row.filamentId)
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-3 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: f?.colorHex ?? '#6B7280' }}
                  />
                  <span className="truncate text-[var(--color-text-secondary)]">
                    {f ? `${f.colorName} — ${f.brandName} (${f.material})` : row.filamentId}
                  </span>
                </div>
                <span className="font-mono text-[var(--color-text-primary)] flex-shrink-0 ml-2">{row.grams}g</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
