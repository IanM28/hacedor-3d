import { useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg"
        onMouseDown={e => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          className="font-display text-xl tracking-wide text-[var(--color-text-primary)]"
        >
          {title}
        </h2>
        <div className="mt-4 font-body text-[var(--color-text-primary)]">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
