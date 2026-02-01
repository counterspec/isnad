import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /stats - Protocol stats
router.get('/', async (req: Request, res: Response) => {
  try {
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

    res.json({
      success: true,
      stats: {
        resources: resourceCount,
        attestations: attestationCount,
        auditors: auditorCount,
        totalStaked: (totalStaked._sum.amount || 0n).toString(),
        tiers: Object.fromEntries(tierCounts.map(t => [t.trustTier, t._count])),
        lastSyncedBlock: syncState?.lastBlock.toString() || '0',
        lastSyncedAt: syncState?.lastSyncedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
