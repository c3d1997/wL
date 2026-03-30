import { PrismaClient } from '@prisma/client'

/**
 * Singleton PrismaClient 實例
 * 避免在開發環境熱重載時建立過多連線
 */
const prisma = new PrismaClient()

export default prisma
