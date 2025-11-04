import { prisma } from '../lib/prisma.js'
import type { Document } from '@prisma/client'

export interface CreateDocumentInput {
  filename: string
  mime: string
  size: number
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  result?: any
}

export interface DocumentWithResult extends Document {
  result: any
}

export class DocumentService {
  async create(input: CreateDocumentInput): Promise<Document> {
    return prisma.document.create({
      data: {
        filename: input.filename,
        mime: input.mime,
        size: input.size,
        status: input.status || 'pending',
        result: input.result || null,
      },
    })
  }

  async findById(id: string): Promise<DocumentWithResult | null> {
    return prisma.document.findUnique({
      where: { id },
    })
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    result?: any
  ): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data: {
        status,
        result: result || undefined,
        updatedAt: new Date(),
      },
    })
  }

  async listRecent(limit: number = 10): Promise<Document[]> {
    return prisma.document.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const documentService = new DocumentService()

