import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { useCreatePaymentPreference } from '../../hooks/useCreatePaymentPreference'
import { useToast } from '../../components/ui/useToast'
import { buildOrderQuery } from '../../utils/whatsapp'
import Button from '../../components/ui/Button'
import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'
import type { Order, SelectedShippingOption } from '../../types'
import type { CheckoutFormValues } from './CheckoutForm'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const subtotal = total()
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder()
  const { mutateAsync: createPreference, isPending: isCreatingPreference } =
    useCreatePaymentPreference()
  const { toast } = useToast()
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<SelectedShippingOption | null>(null)

  const isSubmitting = isCreatingOrder || isCreatingPreference

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

  async function handleSubmit(values: CheckoutFormValues, shipping: SelectedShippingOption | null) {
    if (!shipping) {
      toast.error('Seleccioná un método de envío antes de continuar.')
      return
    }

    try {
      const order = await createOrder({
        guestEmail: values.guestEmail,
        contactName: values.contactName,
        address: values.address,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
        shippingCost: shipping.price,
        shippingProvider: shipping.provider,
        shippingService: shipping.service,
        shippingPostalCode: values.postalCode,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      })

      if (values.paymentMethod === 'TRANSFER') {
        const orderTotal = subtotal + shipping.price
        const waUrl = buildOrderQuery({
          orderId: order.id,
          items,
          total: orderTotal,
          contactName: values.contactName,
        })
        const link = document.createElement('a')
        link.href = waUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        clearCart()
        setConfirmedOrder(order)
        return
      }

      // MERCADOPAGO — shipping is already included in order.total from backend
      const preference = await createPreference({
        orderId: order.id,
        guestEmail: values.guestEmail,
      })

      const redirectUrl = preference.init_point ?? preference.sandbox_init_point
      if (!redirectUrl) {
        toast.error('No se obtuvo URL de pago. Intentá de nuevo.')
        return
      }

      window.location.assign(redirectUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar el pedido'
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl tracking-wide text-[var(--color-text-primary)]">
        CHECKOUT
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <CheckoutForm
          items={items}
          onSubmit={handleSubmit}
          onShippingChange={setSelectedShipping}
          isSubmitting={isSubmitting}
        />
        <div className="lg:sticky lg:top-6 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            selectedShipping={selectedShipping}
          />
        </div>
      </div>
    </div>
  )
}
