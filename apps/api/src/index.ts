import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFound'
import { handleUploadError } from './middleware/uploadError'
import { validateEnvironment } from './middleware/validateEnv'
import healthRouter from './routes/health'
import documentsRouter from './routes/documents'
import ocrRouter from './routes/ocr'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Routes
app.use('/health', healthRouter)
app.use('/documents', documentsRouter)
app.use('/ocr', ocrRouter)

// 404 handler
app.use(notFoundHandler)

// Upload error handler (before general error handler)
app.use(handleUploadError)

// Error handler (must be last)
app.use(errorHandler)

// Validate environment before starting
validateEnvironment()

// Start server
const port = Number(process.env.PORT || 8080)
const domain = process.env.DOMAIN || 'bookai.asenaytech.com'

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ API listening on ${port}`)
  console.log(`📡 Domain: ${domain}`)
  console.log(`🔗 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configured'}`)
})
