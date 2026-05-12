import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItemData {
  id: string
  type: ToastType
  message: string
}

export interface ToastProps {
  toasts: ToastItemData[]
  onDismiss: (id: string) => void
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="size-4 shrink-0 text-[var(--color-accent)]" aria-hidden />,
  error: <XCircle className="size-4 shrink-0 text-[var(--color-red)]" aria-hidden />,
  info: <Info className="size-4 shrink-0 text-[var(--color-text-secondary)]" aria-hidden />,
}

const barClass: Record<ToastType, string> = {
  success: 'bg-[var(--color-accent)]',
  error: 'bg-[var(--color-red)]',
  info: 'bg-[var(--color-border-light)]',
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
          >
            <div className={`h-0.5 w-full ${barClass[t.type]}`} aria-hidden />
            <div className="flex items-start gap-3 p-3">
              {icons[t.type]}
              <p className="min-w-0 flex-1 font-body text-sm text-[var(--color-text-primary)]">
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="shrink-0 rounded px-1 font-body text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
