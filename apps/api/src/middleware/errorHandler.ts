import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export interface ApiError {
  error: string
  hint?: string
  code?: string
}

export class AppError extends Error {
  statusCode: number
  hint?: string
  code?: string

  constructor(message: string, statusCode: number = 500, hint?: string, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.hint = hint
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      hint: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
      code: 'VALIDATION_ERROR',
    })
    return
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      hint: err.hint,
      code: err.code,
    })
    return
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      error: 'Database operation failed',
      hint: 'Please check your request and try again',
      code: 'DATABASE_ERROR',
    })
    return
  }

  // Handle unknown errors
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    hint: process.env.NODE_ENV === 'development' ? err.message : undefined,
    code: 'INTERNAL_ERROR',
  })
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

