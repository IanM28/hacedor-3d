import type { NextFunction, Request, Response } from 'express'
import { extractUploadResult } from '../services/upload.service'

export const uploadProductImageHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se recibió ningún archivo' })
    }
    const result = extractUploadResult(req.file)
    return res.status(201).json({ success: true, data: { url: result.url } })
  } catch (error) {
    next(error)
  }
}
