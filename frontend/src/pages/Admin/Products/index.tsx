import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Minus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useAdminProducts } from '../../../hooks/useProducts'
import { productService } from '../../../services/product.service'
import { useToast } from '../../../components/ui/useToast'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import ProductForm from './ProductForm'
import { RegisterProductionButton } from '../../../components/admin/RegisterProductionButton'
import type { CreateProductInput, Product, UpdateProductInput } from '../../../types'

function StockCell({
  product,
  onUpdate,
  isPending,
}: {
  product: Product
  onUpdate: (id: string, stock: number) => void
  isPending: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={product.stock === 0 || isPending}
        onClick={() => onUpdate(product.id, product.stock - 1)}
        aria-label="Reducir stock"
        className="flex size-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 transition-colors"
      >
        <Minus size={11} />
      </button>
      <span
        className={`w-7 text-center font-mono text-sm transition-opacity ${
          isPending ? 'opacity-40' : 'text-[var(--color-text-primary)]'
        }`}
      >
        {product.stock}
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onUpdate(product.id, product.stock + 1)}
        aria-label="Aumentar stock"
        className="flex size-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 transition-colors"
      >
        <Plus size={11} />
      </button>
    </div>
  )
}

const PAGE_SIZE = 10

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: products = [], isLoading, error } = useAdminProducts()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter(
      p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    )
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productService.create(data),
    onSuccess: () => {
      toast.success('Producto creado.')
      setShowCreate(false)
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productService.update(id, data),
    onSuccess: () => {
      toast.success('Producto actualizado.')
      setEditProduct(null)
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      toast.success('Producto eliminado.')
      setDeleteTarget(null)
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      productService.update(id, { stock }),
    onSuccess: () => invalidate(),
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productService.update(id, { isActive }),
    onSuccess: () => {
      toast.success('Estado actualizado.')
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-[var(--color-surface)] rounded animate-pulse" />
        <div className="h-64 bg-[var(--color-surface)] rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl tracking-widest text-[var(--color-text-primary)]">
          PRODUCTOS
        </h1>
        <Button
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreate(true)}
        >
          Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['', 'Código', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', ''].map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(product => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <td className="px-4 py-3 w-12">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded border border-[var(--color-border)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)]" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-accent)] whitespace-nowrap">
                    {product.code}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)] max-w-[200px] truncate">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)] whitespace-nowrap">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StockCell
                      product={product}
                      onUpdate={(id, stock) => stockMutation.mutate({ id, stock })}
                      isPending={
                        stockMutation.isPending &&
                        stockMutation.variables?.id === product.id
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? 'accent' : 'muted'}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <RegisterProductionButton product={product} />
                      <button
                        onClick={() => setEditProduct(product)}
                        aria-label={`Editar ${product.code}`}
                        className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() =>
                          toggleMutation.mutate({
                            id: product.id,
                            isActive: !product.isActive,
                          })
                        }
                        disabled={
                          toggleMutation.isPending &&
                          toggleMutation.variables?.id === product.id
                        }
                        aria-label={product.isActive ? `Desactivar ${product.code}` : `Activar ${product.code}`}
                        className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-40 transition-colors"
                      >
                        {product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Eliminar ${product.code}`}
                        className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-red)] hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {filtered.length} productos · página {page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-40 transition-colors"
                aria-label="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo producto">
        <ProductForm
          onSubmit={data => createMutation.mutate(data as CreateProductInput)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title={`Editar ${editProduct?.code ?? ''}`}
      >
        {editProduct && (
          <ProductForm
            product={editProduct}
            onSubmit={data => updateMutation.mutate({ id: editProduct.id, data: data as UpdateProductInput })}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar producto"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              ¿Estás seguro de que deseas eliminar{' '}
              <span className="font-mono text-[var(--color-accent)]">{deleteTarget.code}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
