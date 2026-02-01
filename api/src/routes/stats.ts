import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { wrapResponse, wrapError } from '../middleware/network';

const router = Router();
const prisma = new PrismaClient();

// GET /stats - Protocol stats
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test DB connection first
    await prisma.$connect();
    
    const [
      resourceCount,
      attestationCount,
      auditorCount,
      syncState,
    ] = await Promise.all([
      prisma.resource.count(),
      prisma.attestation.count(),
      prisma.auditor.count(),
      prisma.syncState.findUnique({ where: { id: 'main' } }),
    ]);

    const totalStaked = await prisma.attestation.aggregate({
      where: { slashed: false },
      _sum: { amount: true },
    });

    const tierCounts = await prisma.resource.groupBy({
      by: ['trustTier'],
      _count: true,
    });

    res.json(wrapResponse(req, {
      totalResources: resourceCount,
      totalAttestations: attestationCount,
      totalAuditors: auditorCount,
      totalStaked: (totalStaked._sum.amount || 0n).toString(),
      resourcesByTier: Object.fromEntries(tierCounts.map(t => [t.trustTier, t._count])),
      lastSyncedBlock: syncState?.lastBlock.toString() || '0',
      lastSyncedAt: syncState?.lastSyncedAt,
      contracts: req.network.contracts,
    }));
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json(wrapError(req, 'INTERNAL_ERROR', error.message, 500));
  }
});

export default router;
