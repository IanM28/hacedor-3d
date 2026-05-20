import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useLogin } from '../../hooks/useLogin'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/ui/useToast'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutateAsync, isPending } = useLogin()
  const { login, isAuthenticated } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (isAuthenticated()) return <Navigate to="/" replace />

  async function handleLogin(values: FormValues) {
    try {
      const data = await mutateAsync(values)
      login(data.user, data.token)
      toast.success('Sesión iniciada.')
      navigate('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="mb-6 font-display text-3xl tracking-wide text-[var(--color-text-primary)]">
          INICIAR SESIÓN
        </h1>
        <form onSubmit={handleSubmit(handleLogin)} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" variant="primary" isLoading={isPending} className="mt-2 w-full">
            Iniciar sesión
          </Button>
        </form>
        <p className="mt-5 font-body text-sm text-[var(--color-text-secondary)]">
          ¿No tenés cuenta?{' '}
          <Link
            to="/registro"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
