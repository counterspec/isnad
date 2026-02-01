/**
 * Network middleware - extracts network from query params and wraps responses
 */

import { Request, Response, NextFunction } from 'express';
import { getNetwork, NetworkConfig, DEFAULT_NETWORK } from '../chain/networks';

// Extend Express Request to include network
declare global {
  namespace Express {
    interface Request {
      network: NetworkConfig;
    }
  }
}

/**
 * Middleware to extract network from query parameter
 * Sets req.network for use in route handlers
 */
export function networkMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const networkParam = req.query.network as string | undefined;
    req.network = getNetwork(networkParam);
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      network: DEFAULT_NETWORK,
      chainId: 8453,
      timestamp: new Date().toISOString(),
      error: {
        code: 'INVALID_NETWORK',
        message: error.message,
      },
    });
  }
}

/**
 * Helper to wrap successful responses with network context
 */
export function wrapResponse(req: Request, data: any) {
  return {
    success: true,
    network: req.network.name,
    chainId: req.network.chainId,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Helper to wrap error responses with network context
 */
export function wrapError(req: Request, code: string, message: string, status: number = 400) {
  return {
    success: false,
    network: req.network?.name || DEFAULT_NETWORK,
    chainId: req.network?.chainId || 8453,
    timestamp: new Date().toISOString(),
    error: {
      code,
      message,
    },
  };
}
