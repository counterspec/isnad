import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /resources/:hash - Get resource by hash
router.get('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { hash },
      include: {
        attestations: {
          where: { slashed: false },
          orderBy: { amount: 'desc' },
          take: 10,
        },
        flags: {
          where: { status: 'PENDING' },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      success: true,
      resource: {
        hash: resource.hash,
        name: resource.name,
        url: resource.url,
        contentType: resource.contentType,
        trustScore: resource.trustScore.toString(),
        trustTier: resource.trustTier,
        auditorCount: resource.auditorCount,
        flagged: resource.flagged,
        flagCount: resource.flagCount,
        inscribedAt: resource.inscribedAt,
        inscribedBy: resource.inscribedBy,
        attestations: resource.attestations.map(a => ({
          auditor: a.auditor,
          amount: a.amount.toString(),
          lockDuration: a.lockDuration,
          lockUntil: a.lockUntil,
          multiplier: a.multiplier,
        })),
        pendingFlags: resource.flags.length,
      },
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /resources/:hash/attestations - Get all attestations for resource
router.get('/:hash/attestations', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const { includeSlashed } = req.query;

    const attestations = await prisma.attestation.findMany({
      where: {
        resourceHash: hash,
        ...(includeSlashed !== 'true' && { slashed: false }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      attestations: attestations.map(a => ({
        id: a.id,
        auditor: a.auditor,
        amount: a.amount.toString(),
        lockDuration: a.lockDuration,
        lockUntil: a.lockUntil,
        multiplier: a.multiplier,
        slashed: a.slashed,
        slashedAt: a.slashedAt,
        txHash: a.txHash,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching attestations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
