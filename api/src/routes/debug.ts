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

// GET /debug/test-stake - Test processing a single stake event
router.get('/test-stake', async (req: Request, res: Response) => {
  try {
    const { createPublicClient, http, parseAbiItem } = await import('viem');
    const { base } = await import('viem/chains');
    
    const client = createPublicClient({
      chain: base,
      transport: http(process.env.RPC_URL || 'https://mainnet.base.org'),
    });

    // Get the first Staked event
    const logs = await client.getLogs({
      address: process.env.ISNAD_STAKING_ADDRESS as `0x${string}`,
      event: parseAbiItem('event Staked(bytes32 indexed attestationId, address indexed auditor, bytes32 indexed resourceHash, uint256 amount, uint256 lockUntil, uint256 lockDuration)'),
      fromBlock: BigInt(41580704),
      toBlock: BigInt(41580720),
    });

    if (logs.length === 0) {
      return res.json({ success: false, error: 'No Staked events found' });
    }

    const log = logs[0];
    const { attestationId, auditor, resourceHash, amount, lockUntil, lockDuration } = log.args as any;

    // Helper to extract number from viem value (may be bigint or object)
    const toNumber = (val: any): number => {
      if (typeof val === 'bigint') return Number(val);
      if (typeof val === 'number') return val;
      if (typeof val === 'object' && val !== null && 'value' in val) return Number(val.value);
      return Number(val);
    };
    
    // Helper to extract BigInt
    const extractBigInt = (val: any): bigint => {
      if (typeof val === 'bigint') return val;
      if (typeof val === 'object' && val !== null && 'value' in val) return BigInt(val.value);
      return BigInt(String(val));
    };

    const hash = resourceHash as string;
    const uniqueId = `${log.transactionHash}-${log.logIndex}`;
    const lockSeconds = toNumber(lockDuration);
    const lockDays = Math.round(lockSeconds / 86400);
    const lockUntilTimestamp = toNumber(lockUntil);
    const lockUntilDate = new Date(lockUntilTimestamp * 1000);
    
    const amountVal = extractBigInt(amount);
    const blockVal = extractBigInt(log.blockNumber);

    // Upsert resource first
    await prisma.resource.upsert({
      where: { hash },
      create: { hash },
      update: {},
    });
    
    await prisma.attestation.upsert({
      where: { id: uniqueId },
      create: {
        id: uniqueId,
        resourceHash: hash,
        auditor: auditor as string,
        amount: amountVal,
        lockDuration: lockDays,
        lockUntil: lockUntilDate,
        multiplier: 1.0,
        txHash: log.transactionHash,
        blockNumber: blockVal,
      },
      update: {},
    });

    res.json({
      success: true,
      message: 'Stake processed successfully',
      uniqueId,
      amount: (amount as bigint).toString(),
      blockNumber: (log.blockNumber as bigint).toString(),
    });
  } catch (e: any) {
    res.status(500).json({ 
      success: false, 
      error: e.message,
      stack: e.stack,
    });
  }
});

export default router;
