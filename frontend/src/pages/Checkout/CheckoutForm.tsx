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
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'TRANSFER' },
  })

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

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--color-accent)] bg-[var(--color-surface)] p-3">
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

        <label className="flex cursor-not-allowed items-start gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 opacity-50">
          <input type="radio" disabled className="mt-0.5 accent-[var(--color-accent)]" />
          <div>
            <p className="font-body text-sm text-[var(--color-text-secondary)]">MercadoPago</p>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              Disponible en la siguiente iteración
            </p>
          </div>
        </label>
      </div>

      <Button type="submit" variant="whatsapp" isLoading={isSubmitting} className="w-full">
        Confirmar pedido por WhatsApp
      </Button>
    </form>
  )
}
