import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { useToast } from '../../components/ui/useToast'
import { buildOrderQuery } from '../../utils/whatsapp'
import Button from '../../components/ui/Button'
import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'
import type { Order } from '../../types'
import type { CheckoutFormValues } from './CheckoutForm'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const orderTotal = total()
  const { mutateAsync, isPending } = useCreateOrder()
  const { toast } = useToast()
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  if (confirmedOrder) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex flex-col gap-3">
          <p className="font-display text-4xl tracking-wide text-[var(--color-text-primary)]">
            PEDIDO CREADO
          </p>
          <p className="font-body text-[var(--color-text-secondary)]">
            Te contactamos para coordinar el pago.
          </p>
          <p className="font-mono text-sm text-[var(--color-accent)]">
            ID: #{confirmedOrder.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-body text-[var(--color-text-secondary)]">Tu carrito está vacío.</p>
        <Link
          to="/catalogo"
          className="font-body text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          Ver colección →
        </Link>
      </div>
    )
  }

  async function handleSubmit(values: CheckoutFormValues) {
    try {
      const order = await mutateAsync({
        guestEmail: values.guestEmail,
        contactName: values.contactName,
        address: values.address,
        phone: values.phone,
        paymentMethod: 'TRANSFER',
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      })

      const waUrl = buildOrderQuery({
        orderId: order.id,
        items,
        total: orderTotal,
        contactName: values.contactName,
      })
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      clearCart()
      setConfirmedOrder(order)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear el pedido'
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl tracking-wide text-[var(--color-text-primary)]">
        CHECKOUT
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <CheckoutForm onSubmit={handleSubmit} isSubmitting={isPending} />
        <OrderSummary items={items} total={orderTotal} />
      </div>
    </div>
  )
}
