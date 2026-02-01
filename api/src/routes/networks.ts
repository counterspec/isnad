/**
 * Networks endpoint - list available networks and their configuration
 */

import { Router } from 'express';
import { NETWORKS, DEFAULT_NETWORK } from '../chain/networks';

const router = Router();

/**
 * GET /api/v1/networks
 * List all available networks and their contracts
 */
router.get('/', (req, res) => {
  const networks: Record<string, any> = {};
  
  for (const [name, config] of Object.entries(NETWORKS)) {
    networks[name] = {
      chainId: config.chainId,
      name: config.displayName,
      status: 'active',
      contracts: config.contracts,
      explorer: config.explorer,
    };
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      default: DEFAULT_NETWORK,
      networks,
    },
  });
});

export default router;
