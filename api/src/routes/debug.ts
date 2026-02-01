import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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

// GET /debug/sync - Get current sync state
router.get('/sync', async (req: Request, res: Response) => {
  try {
    const syncState = await prisma.syncState.findUnique({ where: { id: 'main' } });
    res.json({
      success: true,
      syncState: syncState ? {
        lastBlock: syncState.lastBlock.toString(),
        lastSyncedAt: syncState.lastSyncedAt,
      } : null,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /debug/sync/reset - Reset sync state to a specific block
router.post('/sync/reset', async (req: Request, res: Response) => {
  try {
    const { block } = req.body;
    if (!block || isNaN(Number(block))) {
      return res.status(400).json({ success: false, error: 'Block number required' });
    }

    const targetBlock = BigInt(block);
    
    await prisma.syncState.upsert({
      where: { id: 'main' },
      update: { lastBlock: targetBlock, lastSyncedAt: new Date() },
      create: { id: 'main', lastBlock: targetBlock },
    });

    res.json({
      success: true,
      message: `Sync state reset to block ${targetBlock}. Indexer will resume from block ${targetBlock + 1n}.`,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
