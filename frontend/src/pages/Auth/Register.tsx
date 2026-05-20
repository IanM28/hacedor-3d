import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useRegister } from '../../hooks/useRegister'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/ui/useToast'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    lastName: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

type FormValues = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutateAsync, isPending } = useRegister()
  const { login, isAuthenticated } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (isAuthenticated()) return <Navigate to="/" replace />

  async function handleRegister({ confirmPassword: _cp, ...values }: FormValues) {
    try {
      const data = await mutateAsync(values)
      login(data.user, data.token)
      toast.success('Cuenta creada.')
      navigate('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear la cuenta'
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="mb-6 font-display text-3xl tracking-wide text-[var(--color-text-primary)]">
          CREAR CUENTA
        </h1>
        <form onSubmit={handleSubmit(handleRegister)} noValidate className="flex flex-col gap-4">
          <Input
            label="Nombre"
            autoComplete="given-name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Apellido"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" variant="primary" isLoading={isPending} className="mt-2 w-full">
            Crear cuenta
          </Button>
        </form>
        <p className="mt-5 font-body text-sm text-[var(--color-text-secondary)]">
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
