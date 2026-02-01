import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { wrapResponse, wrapError } from '../middleware/network';

const router = Router();
const prisma = new PrismaClient();

// GET /trust/:hash - Quick trust score lookup
router.get('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    
    // Note: Currently using same DB for all networks
    // Future: separate DBs or network-prefixed tables
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
      return res.json(wrapResponse(req, {
        resourceHash: hash,
        trustScore: '0',
        trustScoreWei: '0',
        trustTier: 'UNVERIFIED',
        auditorCount: 0,
        flagged: false,
        exists: false,
      }));
    }

    res.json(wrapResponse(req, {
      resourceHash: resource.hash,
      trustScore: resource.trustScore.toString(),
      trustScoreWei: resource.trustScore.toString(),
      trustTier: resource.trustTier,
      auditorCount: resource.auditorCount,
      flagged: resource.flagged,
      exists: true,
    }));
  } catch (error) {
    console.error('Error fetching trust:', error);
    res.status(500).json(wrapError(req, 'INTERNAL_ERROR', 'Internal server error', 500));
  }
});

export default router;
