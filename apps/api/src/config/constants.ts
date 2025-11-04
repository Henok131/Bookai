// Application constants - avoid magic strings/numbers

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
] as const

export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export const DOCUMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const DEFAULT_OCR_SERVICE_URL = 'http://ocr:8000'

export const DEFAULT_PORT = 8080

