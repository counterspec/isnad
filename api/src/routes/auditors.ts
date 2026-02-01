import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /auditors/:address - Get auditor profile
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const auditor = await prisma.auditor.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!auditor) {
      return res.status(404).json({ error: 'Auditor not found' });
    }

    // Get recent attestations
    const recentAttestations = await prisma.attestation.findMany({
      where: { auditor: address.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        resource: {
          select: { hash: true, name: true, trustTier: true },
        },
      },
    });

    res.json({
      success: true,
      auditor: {
        address: auditor.address,
        totalStaked: auditor.totalStaked.toString(),
        activeStakes: auditor.activeStakes,
        totalAudits: auditor.totalAudits,
        slashCount: auditor.slashCount,
        accuracy: auditor.accuracy,
        reputation: auditor.reputation.toString(),
        firstSeen: auditor.firstSeen,
        lastActive: auditor.lastActive,
      },
      recentAttestations: recentAttestations.map(a => ({
        resourceHash: a.resourceHash,
        resourceName: a.resource.name,
        resourceTier: a.resource.trustTier,
        amount: a.amount.toString(),
        slashed: a.slashed,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching auditor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auditors - Leaderboard
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', sortBy = 'totalStaked' } = req.query;

    const auditors = await prisma.auditor.findMany({
      orderBy: { [sortBy as string]: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      auditors: auditors.map((a, i) => ({
        rank: i + 1,
        address: a.address,
        totalStaked: a.totalStaked.toString(),
        activeStakes: a.activeStakes,
        totalAudits: a.totalAudits,
        accuracy: a.accuracy,
        reputation: a.reputation.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
