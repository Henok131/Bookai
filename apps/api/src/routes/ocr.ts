import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { documentService } from '../services/documentService'
import { asyncHandler, AppError } from '../middleware/errorHandler'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, DEFAULT_OCR_SERVICE_URL, DOCUMENT_STATUSES } from '../config/constants'

const router = Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype as any)) {
      cb(null, true)
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`))
    }
  },
})

// Validation schema
const ocrExtractSchema = z.object({
  filename: z.string().min(1).max(255),
  mime: z.enum(ALLOWED_FILE_TYPES as [string, ...string[]]),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
})

// POST /api/ocr/extract
router.post('/extract', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file provided', 400, 'Please upload a file using the "file" field', 'NO_FILE')
  }

  // Validate file
  const validation = ocrExtractSchema.safeParse({
    filename: req.file.originalname,
    mime: req.file.mimetype,
    size: req.file.size,
  })

  if (!validation.success) {
    throw new AppError('File validation failed', 400, validation.error.message, 'VALIDATION_ERROR')
  }

  const { filename, mime, size } = validation.data

  // Create document record
  const document = await documentService.create({
    filename,
    mime,
    size,
    status: DOCUMENT_STATUSES.PROCESSING,
  })

  // Call OCR service
  try {
    const ocrUrl = process.env.OCR_SERVICE_URL || DEFAULT_OCR_SERVICE_URL
    const ocrResponse = await fetch(`${ocrUrl}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': req.file.mimetype,
      },
      body: req.file.buffer,
    })

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text()
      await documentService.updateStatus(document.id, DOCUMENT_STATUSES.FAILED, {
        error: `OCR service error: ${ocrResponse.status}`,
        details: errorText,
      })
      throw new AppError(
        'OCR processing failed',
        ocrResponse.status,
        `OCR service returned ${ocrResponse.status}: ${errorText}`,
        'OCR_ERROR'
      )
    }

    const ocrResult = await ocrResponse.json()

    // Update document with result
    await documentService.updateStatus(document.id, DOCUMENT_STATUSES.COMPLETED, ocrResult)

    // Return response
    res.json({
      id: document.id,
      fields: ocrResult.fields || {},
      confidenceSummary: ocrResult.confidence || {},
      raw: ocrResult.raw || {},
      status: 'completed',
    })
  } catch (error) {
    // Update document status to failed
    await documentService.updateStatus(document.id, DOCUMENT_STATUSES.FAILED, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof AppError) {
      throw error
    }

    throw new AppError(
      'OCR processing failed',
      500,
      error instanceof Error ? error.message : 'Unknown error occurred',
      'OCR_ERROR'
    )
  }
}))

export default router

