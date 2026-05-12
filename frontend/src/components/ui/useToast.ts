import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Toast from './Toast'
import type { ToastItemData, ToastType } from './Toast'

interface ToastContextValue {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const handle = timers.current.get(id)
    if (handle) clearTimeout(handle)
    timers.current.delete(id)
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      timers.current.clear()
    },
    [],
  )

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts(prev => [...prev, { id, type, message }])
      const handle = setTimeout(() => dismiss(id), 3000)
      timers.current.set(id, handle)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: {
        success: m => push('success', m),
        error: m => push('error', m),
        info: m => push('info', m),
      },
    }),
    [push],
  )

  return createElement(
    ToastContext.Provider,
    { value },
    children,
    createElement(Toast, { toasts, onDismiss: dismiss }),
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
