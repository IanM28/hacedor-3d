import { forwardRef, useId, type ReactNode } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = '', id, ...rest },
  ref,
) {
  const uid = useId()
  const inputId = id ?? (typeof rest.name === 'string' && rest.name ? rest.name : uid)
  const errorId = `${uid}-error`
  const helperId = `${uid}-helper`
  const describedBy =
    [error ? errorId : null, helperText && !error ? helperId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="flex w-full max-w-full flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="font-body text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-md border bg-[var(--color-surface)] px-3 py-2 font-body text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-[var(--color-red)]' : 'border-[var(--color-border)]'} ${className}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="font-body text-xs text-[var(--color-red)]" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="font-body text-xs text-[var(--color-text-secondary)]">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default Input
