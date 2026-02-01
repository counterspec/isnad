import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /trust/:hash - Quick trust score lookup
router.get('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { hash },
      select: {
        hash: true,
        trustScore: true,
        trustTier: true,
        auditorCount: true,
        flagged: true,
      },
    });

    if (!resource) {
      // Return unverified for unknown resources
      return res.json({
        success: true,
        hash,
        trustScore: '0',
        trustTier: 'UNVERIFIED',
        auditorCount: 0,
        flagged: false,
        exists: false,
      });
    }

    res.json({
      success: true,
      hash: resource.hash,
      trustScore: resource.trustScore.toString(),
      trustTier: resource.trustTier,
      auditorCount: resource.auditorCount,
      flagged: resource.flagged,
      exists: true,
    });
  } catch (error) {
    console.error('Error fetching trust:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
