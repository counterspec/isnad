/**
 * ISNAD Scanner Service - Continuous monitoring
 */

import { createPublicClient, http, type Address, type Log } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { analyzeContent, formatResult } from './analyzer.js';
import { submitFlag, type OracleConfig } from './oracle.js';
import 'dotenv/config';

// Registry contract ABI for watching inscriptions
const REGISTRY_ABI = [
  {
    type: 'event',
    name: 'ResourceInscribed',
    inputs: [
      { name: 'resourceHash', type: 'bytes32', indexed: true },
      { name: 'author', type: 'address', indexed: true },
      { name: 'resourceType', type: 'uint8', indexed: false },
      { name: 'contentHash', type: 'bytes32', indexed: false }
    ]
  }
] as const;

interface ServiceConfig {
  privateKey: string;
  registryAddress: Address;
  oracleAddress: Address;
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
  autoFlag: boolean;
  minConfidence: number;
  pollInterval: number;
}

const DEFAULT_CONFIG: Partial<ServiceConfig> = {
  network: 'testnet',
  autoFlag: false,
  minConfidence: 0.7,
  pollInterval: 30000 // 30 seconds
};

/**
 * Fetch resource content from chain (simplified - real impl would parse calldata)
 */
async function fetchResourceContent(
  resourceHash: string,
  _rpcUrl: string
): Promise<string | null> {
  // In a real implementation, this would:
  // 1. Find the inscription transaction by resourceHash
  // 2. Parse the calldata to extract content
  // 3. Decompress if needed
  // For now, return null (would need API integration)
  console.log(`[TODO] Fetch content for ${resourceHash}`);
  return null;
}

/**
 * Process a new resource inscription
 */
async function processResource(
  resourceHash: string,
  content: string,
  config: ServiceConfig
): Promise<void> {
  console.log(`\n📝 Processing resource: ${resourceHash.substring(0, 16)}...`);
  
  const result = analyzeContent(content, resourceHash);
  console.log(formatResult(result));

  // Check if flagging is warranted
  const shouldFlag = 
    (result.riskLevel === 'critical' || result.riskLevel === 'high') &&
    result.confidence >= config.minConfidence;

  if (shouldFlag) {
    console.log(`⚠️  High risk detected (confidence: ${(result.confidence * 100).toFixed(0)}%)`);
    
    if (config.autoFlag) {
      console.log('🚩 Auto-flagging enabled, submitting...');
      try {
        const oracleConfig: OracleConfig = {
          privateKey: config.privateKey,
          oracleAddress: config.oracleAddress,
          network: config.network
        };
        const submission = await submitFlag(oracleConfig, result);
        console.log(`✓ Flag submitted: ${submission.txHash}`);
      } catch (error) {
        console.error('Failed to submit flag:', error);
      }
    } else {
      console.log('🔔 Manual review required (auto-flag disabled)');
    }
  } else if (result.riskLevel !== 'clean') {
    console.log(`ℹ️  Medium/low risk - monitoring only`);
  } else {
    console.log(`✅ Resource appears safe`);
  }
}

/**
 * Start the scanner service
 */
export async function startService(userConfig: Partial<ServiceConfig>): Promise<void> {
  const config = { ...DEFAULT_CONFIG, ...userConfig } as ServiceConfig;
  
  if (!config.privateKey) {
    throw new Error('privateKey is required');
  }
  if (!config.registryAddress) {
    throw new Error('registryAddress is required');
  }
  if (!config.oracleAddress) {
    throw new Error('oracleAddress is required');
  }

  const chain = config.network === 'mainnet' ? base : baseSepolia;
  const rpcUrl = config.rpcUrl || (config.network === 'mainnet' 
    ? 'https://mainnet.base.org'
    : 'https://sepolia.base.org');

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl)
  });

  console.log('🔍 ISNAD Scanner Service Starting...');
  console.log(`   Network:      ${config.network}`);
  console.log(`   Registry:     ${config.registryAddress}`);
  console.log(`   Oracle:       ${config.oracleAddress}`);
  console.log(`   Auto-flag:    ${config.autoFlag}`);
  console.log(`   Min conf:     ${config.minConfidence * 100}%`);
  console.log(`   Poll interval: ${config.pollInterval / 1000}s`);
  console.log('');

  // Watch for new inscriptions
  let lastBlock = await client.getBlockNumber();
  console.log(`📦 Starting from block ${lastBlock}`);

  const poll = async () => {
    try {
      const currentBlock = await client.getBlockNumber();
      
      if (currentBlock > lastBlock) {
        // Get logs for new blocks
        const logs = await client.getLogs({
          address: config.registryAddress,
          event: {
            type: 'event',
            name: 'ResourceInscribed',
            inputs: [
              { name: 'resourceHash', type: 'bytes32', indexed: true },
              { name: 'author', type: 'address', indexed: true },
              { name: 'resourceType', type: 'uint8', indexed: false },
              { name: 'contentHash', type: 'bytes32', indexed: false }
            ]
          },
          fromBlock: lastBlock + 1n,
          toBlock: currentBlock
        });

        if (logs.length > 0) {
          console.log(`\n📨 Found ${logs.length} new inscription(s) in blocks ${lastBlock + 1n}-${currentBlock}`);
          
          for (const log of logs) {
            const resourceHash = log.topics[1];
            if (resourceHash) {
              const content = await fetchResourceContent(resourceHash, rpcUrl);
              if (content) {
                await processResource(resourceHash, content, config);
              } else {
                console.log(`⏭️  Skipping ${resourceHash.substring(0, 16)}... (content not available)`);
              }
            }
          }
        }

        lastBlock = currentBlock;
      }
    } catch (error) {
      console.error('Poll error:', error);
    }
  };

  // Initial poll
  await poll();

  // Continuous polling
  setInterval(poll, config.pollInterval);
  
  console.log('\n👀 Watching for new inscriptions... (Ctrl+C to stop)\n');
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: Partial<ServiceConfig> = {
    privateKey: process.env.ISNAD_PRIVATE_KEY,
    registryAddress: (process.env.ISNAD_REGISTRY_ADDRESS || '0x8340783A495BB4E5f2DF28eD3D3ABcD254aA1C93') as Address,
    oracleAddress: (process.env.ISNAD_ORACLE_ADDRESS || '0x4f1968413640bA2087Db65d4c37912d7CD598982') as Address,
    network: (process.env.ISNAD_NETWORK || 'testnet') as 'testnet' | 'mainnet',
    autoFlag: process.env.ISNAD_AUTO_FLAG === 'true',
    minConfidence: parseFloat(process.env.ISNAD_MIN_CONFIDENCE || '0.7')
  };

  startService(config).catch(console.error);
}
