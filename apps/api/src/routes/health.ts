import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const domain = process.env.DOMAIN || 'bookai.asenaytech.com'
  
  // Check database connection
  let dbStatus = 'unknown'
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch {
    dbStatus = 'disconnected'
  }

  res.json({
    ok: true,
    service: 'api',
    domain,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  })
})

export default router

