import { Link } from 'react-router-dom'

export default function CheckoutFailure() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-3">
        <p className="font-display text-5xl tracking-wide text-[var(--color-text-primary)]">
          PAGO NO COMPLETADO
        </p>
        <p className="font-body text-[var(--color-text-secondary)]">
          El pago no fue confirmado por MercadoPago. El pedido no fue procesado.
        </p>
        <p className="font-body text-sm text-[var(--color-text-muted)]">
          Podés reintentar o elegir otro método de pago.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <Link
          to="/checkout"
          className="rounded-md bg-[var(--color-accent)] px-5 py-2.5 font-body text-sm text-[var(--color-bg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Reintentar
        </Link>
        <Link
          to="/"
          className="rounded-md border border-[var(--color-border)] px-5 py-2.5 font-body text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-light)] hover:bg-[var(--color-surface-2)]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
