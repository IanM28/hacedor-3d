import { Link, useSearchParams } from 'react-router-dom'

export default function CheckoutPending() {
  const [params] = useSearchParams()
  const paymentId = params.get('payment_id')

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-3">
        <p className="font-display text-5xl tracking-wide text-[var(--color-text-primary)]">
          PAGO PENDIENTE
        </p>
        <p className="font-body text-[var(--color-text-secondary)]">
          MercadoPago está procesando la operación.
        </p>
        <p className="font-body text-sm text-[var(--color-text-muted)]">
          Recibirás una confirmación cuando el pago sea acreditado.
        </p>
        {paymentId && (
          <p className="font-mono text-sm text-[var(--color-accent)]">
            Referencia: {paymentId}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <Link
          to="/"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-body text-sm text-[var(--color-bg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Volver al inicio
        </Link>
        <Link
          to="/catalogo"
          className="rounded-md border border-[var(--color-border)] px-5 py-2.5 font-body text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-light)] hover:bg-[var(--color-surface-2)]"
        >
          Ver colección
        </Link>
      </div>
    </div>
  )
}
