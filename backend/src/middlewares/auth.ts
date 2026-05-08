import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  role: 'CLIENT' | 'ADMIN'
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader) return null

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw Object.assign(new Error('JWT_SECRET no configurado'), { statusCode: 500 })
  return secret
}

function verifyToken(token: string): JwtPayload {
  const secret = getJwtSecret()
  const payload = jwt.verify(token, secret) as JwtPayload

  if (!payload?.userId || !payload?.role)
    throw Object.assign(new Error('Token inválido'), { statusCode: 401 })

  return payload
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req)
    if (!token) throw Object.assign(new Error('No autorizado'), { statusCode: 401 })

    req.user = verifyToken(token)
    next()
  } catch (error) {
    next(error)
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req)
    if (!token) return next()

    req.user = verifyToken(token)
    next()
  } catch (_error) {
    next()
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user) throw Object.assign(new Error('No autorizado'), { statusCode: 401 })
    if (req.user.role !== 'ADMIN')
      throw Object.assign(new Error('No tenés permisos'), { statusCode: 403 })

    next()
  } catch (error) {
    next(error)
  }
}

