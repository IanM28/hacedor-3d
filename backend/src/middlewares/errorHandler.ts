import type { NextFunction, Request, Response } from 'express'

interface HttpError extends Error {
  statusCode?: number
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const httpError = error as HttpError
  const statusCode = typeof httpError?.statusCode === 'number' ? httpError.statusCode : 500
  const message = httpError?.message || 'Error interno'

  res.status(statusCode).json({ success: false, error: message })
}

