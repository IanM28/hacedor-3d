import type { NextFunction, Request, Response } from 'express'
import { authService } from '../services/auth.service'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.register(req.body as RegisterInput)
    res.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.login(req.body as LoginInput)
    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
}
