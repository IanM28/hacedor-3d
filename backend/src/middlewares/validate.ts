import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

type ValidateTarget = 'body' | 'query'

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return function validateMiddleware(req: Request, res: Response, next: NextFunction) {
    const source = target === 'query' ? req.query : req.body
    const parsed = schema.safeParse(source)

    if (parsed.success) {
      if (target === 'query') {
        req.query = parsed.data as Record<string, string>
      } else {
        req.body = parsed.data
      }
      return next()
    }

    return res.status(400).json({
      success: false,
      error: parsed.error.flatten(),
    })
  }
}
