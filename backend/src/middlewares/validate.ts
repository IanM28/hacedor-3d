import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

export function validate(schema: ZodSchema) {
  return function validateMiddleware(req: Request, res: Response, next: NextFunction) {
    const parsed = schema.safeParse(req.body)
    if (parsed.success) {
      req.body = parsed.data
      return next()
    }

    return res.status(400).json({
      success: false,
      error: parsed.error.flatten(),
    })
  }
}

