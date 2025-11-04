import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { AppError } from './errorHandler.js'

export function handleUploadError(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'File too large',
        hint: 'Maximum file size is 20MB',
        code: 'FILE_TOO_LARGE',
      })
      return
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        error: 'Too many files',
        hint: 'Please upload only one file',
        code: 'TOO_MANY_FILES',
      })
      return
    }
    res.status(400).json({
      error: 'File upload error',
      hint: err.message,
      code: 'UPLOAD_ERROR',
    })
    return
  }

  if (err.message.includes('File type not allowed')) {
    res.status(400).json({
      error: 'File type not allowed',
      hint: err.message,
      code: 'INVALID_FILE_TYPE',
    })
    return
  }

  next(err)
}

