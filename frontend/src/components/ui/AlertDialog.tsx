import { useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isLoading?: boolean
  children?: ReactNode
}

export default function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  isLoading = false,
}: AlertDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-desc"
        className="w-full max-w-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg"
        onMouseDown={e => e.stopPropagation()}
      >
        <h2
          id="alert-title"
          className="font-display text-lg tracking-wide text-[var(--color-text-primary)]"
        >
          {title}
        </h2>
        <p id="alert-desc" className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <Button
            type="button"
            onClick={onConfirm}
            isLoading={isLoading}
            className={
              isDestructive
                ? 'bg-[var(--color-red)] text-white hover:opacity-90'
                : undefined
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
