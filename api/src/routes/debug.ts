import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// GET /debug - Check environment and DB connection
router.get('/', async (req: Request, res: Response) => {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
  
  let dbStatus = 'unknown';
  let dbError = null;
  
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    await prisma.$disconnect();
  } catch (e: any) {
    dbStatus = 'failed';
    dbError = e.message;
  }
  
  res.json({
    env: {
      DATABASE_URL: maskedUrl,
      RPC_URL: process.env.RPC_URL || 'NOT SET',
      CHAIN_ID: process.env.CHAIN_ID || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    },
    db: {
      status: dbStatus,
      error: dbError,
    },
    contracts: {
      token: process.env.ISNAD_TOKEN_ADDRESS || 'NOT SET',
      registry: process.env.ISNAD_REGISTRY_ADDRESS || 'NOT SET',
      staking: process.env.ISNAD_STAKING_ADDRESS || 'NOT SET',
    }
  });
});

export default router;
