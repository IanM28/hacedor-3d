import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma/client'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema'

const BCRYPT_ROUNDS = 10

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw httpError('JWT_SECRET no configurado', 500)
  return secret
}

export function generateToken(userId: string, role: 'CLIENT' | 'ADMIN'): string {
  return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: '7d' })
}

interface SafeUser {
  id: string
  email: string
  name: string
  lastName: string
  role: 'CLIENT' | 'ADMIN'
  isActive: boolean
  createdAt: Date
}

function sanitizeUser(user: {
  id: string
  email: string
  name: string
  lastName: string
  role: 'CLIENT' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  password: string
}): SafeUser {
  const { password: _password, ...safe } = user
  return safe
}

export const authService = {
  async register({ email, password, name, lastName }: RegisterInput) {
    const normalizedEmail = email.toLowerCase()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      throw httpError('Ya existe una cuenta con ese email', 409)
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        lastName,
      },
    })

    const token = generateToken(user.id, user.role)
    return { user: sanitizeUser(user), token }
  },

  async login({ email, password }: LoginInput) {
    const normalizedEmail = email.toLowerCase()

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, isActive: true },
    })

    if (!user) {
      throw httpError('Credenciales inválidas', 401)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw httpError('Credenciales inválidas', 401)
    }

    const token = generateToken(user.id, user.role)
    return { user: sanitizeUser(user), token }
  },
}
