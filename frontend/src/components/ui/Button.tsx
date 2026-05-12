import { forwardRef, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50',
  secondary:
    'border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] hover:bg-[var(--color-surface-2)] disabled:opacity-50',
  whatsapp:
    'bg-[var(--color-whatsapp)] text-[var(--color-white)] hover:brightness-110 disabled:opacity-50',
  danger: 'bg-[var(--color-red)] text-[var(--color-white)] hover:brightness-110 disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] disabled:opacity-50',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-8 gap-1.5 px-3 text-sm',
  md: 'min-h-10 gap-2 px-4 text-sm',
  lg: 'min-h-12 gap-2 px-6 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`inline-flex max-w-full items-center justify-center rounded-md font-body font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  )
})

export default Button
