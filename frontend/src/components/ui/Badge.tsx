import type { HTMLAttributes } from 'react'

export type BadgeVariant = 'accent' | 'danger' | 'muted'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClass: Record<BadgeVariant, string> = {
  accent: 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]',
  danger: 'bg-[var(--color-red)]/20 text-[var(--color-red)]',
  muted: 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]',
}

export default function Badge({
  variant = 'accent',
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${variantClass[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
