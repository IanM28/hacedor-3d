import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  contactName: z.string().min(2, 'Mínimo 2 caracteres'),
  guestEmail: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Mínimo 8 caracteres'),
  address: z.string().min(5, 'Mínimo 5 caracteres'),
  paymentMethod: z.enum(['TRANSFER', 'MERCADOPAGO']),
})

export type CheckoutFormValues = z.infer<typeof schema>

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormValues) => void
  isSubmitting: boolean
}

export default function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
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
  const isMercadoPago = paymentMethod === 'MERCADOPAGO'

  const radioBase =
    'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors'
  const radioSelected = 'border-[var(--color-accent)] bg-[var(--color-surface)]'
  const radioIdle = 'border-[var(--color-border)] bg-[var(--color-surface-2)]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
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

      <div className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-[var(--color-text-primary)]">
          Método de pago
        </span>

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
