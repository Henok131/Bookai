import { Router } from 'express'
import { documentService } from '../services/documentService.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

// Get document by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  if (!id || typeof id !== 'string') {
    throw new AppError('Invalid document ID', 400, 'Document ID must be a valid UUID', 'INVALID_ID')
  }

  const document = await documentService.findById(id)

  if (!document) {
    throw new AppError('Document not found', 404, `No document found with ID: ${id}`, 'NOT_FOUND')
  }

  res.json({
    id: document.id,
    filename: document.filename,
    mime: document.mime,
    size: document.size,
    status: document.status,
    result: document.result,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  })
}))

// List recent documents
router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100)

  const documents = await documentService.listRecent(limit)

  res.json({
    documents: documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      mime: doc.mime,
      size: doc.size,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
    count: documents.length,
  })
}))

export default router

