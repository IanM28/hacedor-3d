import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Truck } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useShippingQuote } from '../../hooks/useShippingQuote'
import type { CartItem, SelectedShippingOption, ShippingQuoteOption } from '../../types'

const schema = z.object({
  contactName: z.string().min(2, 'Mínimo 2 caracteres'),
  guestEmail: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Mínimo 8 caracteres'),
  address: z.string().min(5, 'Mínimo 5 caracteres'),
  postalCode: z.string().min(4, 'CP inválido').max(8, 'CP inválido'),
  paymentMethod: z.enum(['TRANSFER', 'MERCADOPAGO']),
})

export type CheckoutFormValues = z.infer<typeof schema>

interface CheckoutFormProps {
  items: CartItem[]
  onSubmit: (data: CheckoutFormValues, shipping: SelectedShippingOption | null) => void
  onShippingChange?: (shipping: SelectedShippingOption | null) => void
  isSubmitting: boolean
}

const radioBase = 'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors'
const radioSelected = 'border-[var(--color-accent)] bg-[var(--color-surface)]'
const radioIdle = 'border-[var(--color-border)] bg-[var(--color-surface-2)]'

function ShippingOptionCard({
  option,
  selected,
  onSelect,
}: {
  option: ShippingQuoteOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        radioBase,
        selected ? radioSelected : radioIdle,
        'w-full text-left',
      ].join(' ')}
    >
      <div
        className={[
          'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors',
          selected
            ? 'border-[var(--color-accent)]'
            : 'border-[var(--color-border-light)]',
        ].join(' ')}
      >
        {selected && (
          <div className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-[var(--color-text-primary)]">
          {option.provider} — {option.service}
        </p>
        <p className="font-mono text-xs text-[var(--color-text-secondary)]">
          {option.estimatedDelivery}
        </p>
      </div>
      <span className="shrink-0 font-mono text-sm text-[var(--color-accent)]">
        ${option.price.toLocaleString('es-AR')}
      </span>
    </button>
  )
}

export default function CheckoutForm({ items, onSubmit, onShippingChange, isSubmitting }: CheckoutFormProps) {
  const [quotedPostalCode, setQuotedPostalCode] = useState('')
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<SelectedShippingOption | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)

  const { mutate: quoteShipping, isPending: isQuoting } = useShippingQuote()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'TRANSFER' },
  })

  const paymentMethod = watch('paymentMethod')
  const postalCode = watch('postalCode') ?? ''
  const isMercadoPago = paymentMethod === 'MERCADOPAGO'

  function handleQuoteShipping() {
    const cp = postalCode.trim()
    if (cp.length < 4) return

    setShippingError(null)
    setSelectedShipping(null)
    onShippingChange?.(null)

    quoteShipping(
      {
        postalCode: cp,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      },
      {
        onSuccess: ({ options }) => {
          setShippingOptions(options)
          setQuotedPostalCode(cp)
          if (options.length === 0) {
            setShippingError('Sin opciones de envío disponibles para ese código postal.')
          }
        },
        onError: err => {
          setShippingError(err.message)
          setShippingOptions([])
        },
      },
    )
  }

  function handleFormSubmit(values: CheckoutFormValues) {
    if (!selectedShipping) {
      setShippingError('Seleccioná un método de envío antes de continuar.')
      return
    }
    onSubmit(values, selectedShipping)
  }

  const postalCodeChanged = postalCode.trim() !== quotedPostalCode

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-5">
      <h2 className="font-display text-2xl tracking-wide text-[var(--color-text-primary)]">
        DATOS DE CONTACTO
      </h2>

      <Input
        label="Nombre completo"
        autoComplete="name"
        error={errors.contactName?.message}
        {...register('contactName')}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.guestEmail?.message}
        {...register('guestEmail')}
      />
      <Input
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label="Dirección de entrega"
        autoComplete="street-address"
        error={errors.address?.message}
        {...register('address')}
      />

      {/* Shipping section */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide text-[var(--color-text-primary)]">
          ENVÍO
        </h2>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Código postal"
              autoComplete="postal-code"
              placeholder="ej: 8400"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>
          <button
            type="button"
            onClick={handleQuoteShipping}
            disabled={isQuoting || postalCode.trim().length < 4}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed mb-[1px]"
          >
            {isQuoting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Truck size={14} />
            )}
            {postalCodeChanged && quotedPostalCode ? 'Recotizar' : 'Cotizar'}
          </button>
        </div>

        {shippingError && (
          <p className="text-xs text-[var(--color-red)]">{shippingError}</p>
        )}

        {shippingOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-[var(--color-text-primary)]">
              Opciones de envío
            </p>
            {shippingOptions.map(option => (
              <ShippingOptionCard
                key={option.id}
                option={option}
                selected={selectedShipping?.id === option.id}
                onSelect={() => {
                  setSelectedShipping(option)
                  onShippingChange?.(option)
                  setShippingError(null)
                }}
              />
            ))}
          </div>
        )}

        {!selectedShipping && shippingOptions.length === 0 && !shippingError && (
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            Ingresá tu código postal para ver opciones de envío.
          </p>
        )}
      </div>

      {/* Payment method */}
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl tracking-wide text-[var(--color-text-primary)]">
          PAGO
        </h2>

        <label className={`${radioBase} ${paymentMethod === 'TRANSFER' ? radioSelected : radioIdle}`}>
          <input
            type="radio"
            value="TRANSFER"
            {...register('paymentMethod')}
            className="mt-0.5 accent-[var(--color-accent)]"
          />
          <div>
            <p className="font-body text-sm text-[var(--color-text-primary)]">
              Transferencia / WhatsApp
            </p>
            <p className="font-mono text-xs text-[var(--color-text-secondary)]">
              Coordinamos el pago por WhatsApp
            </p>
          </div>
        </label>

        <label className={`${radioBase} ${isMercadoPago ? radioSelected : radioIdle}`}>
          <input
            type="radio"
            value="MERCADOPAGO"
            {...register('paymentMethod')}
            className="mt-0.5 accent-[var(--color-accent)]"
          />
          <div>
            <p className="font-body text-sm text-[var(--color-text-primary)]">MercadoPago</p>
            <p className="font-mono text-xs text-[var(--color-text-secondary)]">
              Tarjeta, débito o saldo MP
            </p>
          </div>
        </label>
      </div>

      <Button
        type="submit"
        variant={isMercadoPago ? 'primary' : 'whatsapp'}
        isLoading={isSubmitting}
        className="w-full"
      >
        {isMercadoPago ? 'Pagar con MercadoPago' : 'Confirmar pedido por WhatsApp'}
      </Button>
    </form>
  )
}
