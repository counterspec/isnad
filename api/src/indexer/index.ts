import { PrismaClient } from '@prisma/client';
import * as provider from '../chain/provider';
import { ADDRESSES, STAKING_ABI, REGISTRY_ABI } from '../chain/contracts';
import { parseAbiItem, decodeEventLog, Log } from 'viem';

// Cast to any to avoid viem type conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client: any = provider.client;
const chain = provider.chain;

const prisma = new PrismaClient();

const TRUST_TIERS = {
  0: 'UNVERIFIED',
  1: 'COMMUNITY',
  2: 'VERIFIED',
  3: 'TRUSTED',
};

const LOCK_MULTIPLIERS: Record<number, number> = {
  7: 1.0,
  30: 1.5,
  90: 2.0,
};

export class Indexer {
  private isRunning = false;
  private pollInterval = 5000; // 5 seconds

  async start() {
    console.log('🔍 Starting ISNAD indexer...');
    console.log(`   Chain: ${chain.name} (${chain.id})`);
    console.log(`   Staking: ${ADDRESSES.staking}`);
    console.log(`   Registry: ${ADDRESSES.registry}`);
    
    this.isRunning = true;
    
    // Get or create sync state
    let syncState = await prisma.syncState.findUnique({ where: { id: 'main' } });
    if (!syncState) {
      const currentBlock = await client.getBlockNumber();
      syncState = await prisma.syncState.create({
        data: { id: 'main', lastBlock: currentBlock - 1000n }, // Start 1000 blocks back
      });
    }
    
    console.log(`   Starting from block: ${syncState.lastBlock}`);
    
    // Main loop
    while (this.isRunning) {
      try {
        await this.sync();
      } catch (error) {
        console.error('Sync error:', error);
      }
      await this.sleep(this.pollInterval);
    }
  }

  async stop() {
    this.isRunning = false;
  }

  private async sync() {
    const syncState = await prisma.syncState.findUnique({ where: { id: 'main' } });
    if (!syncState) return;

    const currentBlock = await client.getBlockNumber();
    const fromBlock = syncState.lastBlock + 1n;
    
    if (fromBlock > currentBlock) return;

    // Batch in chunks of 2000 blocks
    const toBlock = fromBlock + 2000n > currentBlock ? currentBlock : fromBlock + 2000n;
    
    console.log(`📦 Syncing blocks ${fromBlock} to ${toBlock}...`);

    // Fetch staking events
    if (ADDRESSES.staking && ADDRESSES.staking !== '0x0000000000000000000000000000000000000000') {
      await this.processStakingEvents(fromBlock, toBlock);
    }

    // Fetch registry events
    if (ADDRESSES.registry && ADDRESSES.registry !== '0x0000000000000000000000000000000000000000') {
      await this.processRegistryEvents(fromBlock, toBlock);
    }

    // Update sync state
    await prisma.syncState.update({
      where: { id: 'main' },
      data: { lastBlock: toBlock, lastSyncedAt: new Date() },
    });
  }

  private async processStakingEvents(fromBlock: bigint, toBlock: bigint) {
    // Get Staked events
    // Contract: Staked(bytes32 indexed attestationId, address indexed auditor, bytes32 indexed resourceHash, uint256 amount, uint256 lockUntil, uint256 lockDuration)
    const stakedLogs = await client.getLogs({
      address: ADDRESSES.staking,
      event: parseAbiItem('event Staked(bytes32 indexed attestationId, address indexed auditor, bytes32 indexed resourceHash, uint256 amount, uint256 lockUntil, uint256 lockDuration)'),
      fromBlock,
      toBlock,
    });

    for (const log of stakedLogs) {
      await this.handleStakedEvent(log);
    }

    // Get Slashed events
    // Contract: Slashed(bytes32 indexed attestationId, address indexed auditor, bytes32 indexed resourceHash, uint256 amount)
    const slashedLogs = await client.getLogs({
      address: ADDRESSES.staking,
      event: parseAbiItem('event Slashed(bytes32 indexed attestationId, address indexed auditor, bytes32 indexed resourceHash, uint256 amount)'),
      fromBlock,
      toBlock,
    });

    for (const log of slashedLogs) {
      await this.handleSlashedEvent(log);
    }
  }

  private async processRegistryEvents(fromBlock: bigint, toBlock: bigint) {
    const logs = await client.getLogs({
      address: ADDRESSES.registry,
      event: parseAbiItem('event ResourceInscribed(bytes32 indexed contentHash, uint8 indexed resourceType, address indexed author, uint256 blockNumber, string metadata)'),
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      await this.handleResourceInscribed(log);
    }
  }

  private async handleStakedEvent(log: any) {
    try {
      const { attestationId, auditor, resourceHash, amount, lockUntil: lockUntilTimestamp, lockDuration } = log.args;
      const hash = resourceHash as string;
      const attId = attestationId as string;
      const lockSeconds = Number(lockDuration);
      const lockDays = Math.round(lockSeconds / 86400); // Convert seconds to days (rounded)
      const multiplier = LOCK_MULTIPLIERS[lockDays] || 1.0;
      const lockUntil = new Date(Number(lockUntilTimestamp) * 1000);

      console.log(`  ✅ Stake: ${auditor.slice(0, 8)}... on ${hash.slice(0, 10)}... (${amount} wei, ${lockDays}d lock)`);

    // Upsert resource
    await prisma.resource.upsert({
      where: { hash },
      create: { hash },
      update: {},
    });

    // Upsert attestation (use txHash as unique id to avoid duplicates on re-sync)
    const uniqueId = `${log.transactionHash}-${log.logIndex}`;
    
    // Convert viem BigInt to fresh BigInt (fixes Prisma serialization issue)
    const amountVal = BigInt((amount as bigint).toString());
    const blockVal = BigInt((log.blockNumber as bigint).toString());
    
    await prisma.attestation.upsert({
      where: { id: uniqueId },
      create: {
        id: uniqueId,
        resourceHash: hash,
        auditor,
        amount: amountVal,
        lockDuration: lockDays,
        lockUntil,
        multiplier,
        txHash: log.transactionHash,
        blockNumber: blockVal,
      },
      update: {}, // Don't update if exists
    });

    // Update resource trust score
    await this.updateResourceTrust(hash);

    // Update auditor stats
    await this.updateAuditorStats(auditor);
    } catch (error) {
      console.error('Error handling Staked event:', error);
      console.error('Log:', JSON.stringify(log, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      throw error; // Re-throw to stop indexer
    }
  }

  private async handleSlashedEvent(log: any) {
    const { attestationId, auditor, resourceHash, amount } = log.args;
    const hash = resourceHash as string;

    console.log(`  🔥 Slash: ${hash.slice(0, 10)}... by ${auditor.slice(0, 8)}... (${amount} wei)`);

    // Mark attestations as slashed
    await prisma.attestation.updateMany({
      where: { resourceHash: hash, slashed: false },
      data: { slashed: true, slashedAt: new Date(), slashTx: log.transactionHash },
    });

    // Update resource
    await prisma.resource.update({
      where: { hash },
      data: { flagged: true },
    });

    await this.updateResourceTrust(hash);
  }

  private async handleResourceInscribed(log: any) {
    const { contentHash, resourceType, author, blockNumber, metadata } = log.args;
    const hash = contentHash as string;

    console.log(`  📝 Inscribed: ${hash.slice(0, 10)}... by ${author.slice(0, 8)}... (type ${resourceType})`);

    // Parse metadata if it's JSON, otherwise use as-is
    let url = '';
    let parsedContentType = '';
    try {
      const meta = JSON.parse(metadata);
      url = meta.url || meta.uri || '';
      parsedContentType = meta.contentType || meta.type || '';
    } catch {
      // metadata might be a simple string
      url = metadata;
    }

    await prisma.resource.upsert({
      where: { hash },
      create: {
        hash,
        url,
        contentType: parsedContentType,
        inscribedBy: author,
        inscribedAt: new Date(),
        inscriptionTx: log.transactionHash,
      },
      update: {
        url,
        contentType: parsedContentType,
        inscribedBy: author,
        inscribedAt: new Date(),
        inscriptionTx: log.transactionHash,
      },
    });
  }

  private async updateResourceTrust(hash: string) {
    const attestations = await prisma.attestation.findMany({
      where: { resourceHash: hash, slashed: false },
    });

    const totalWeighted = attestations.reduce(
      (sum, a) => sum + Number(a.amount) * a.multiplier,
      0
    );
    const auditorCount = new Set(attestations.map(a => a.auditor)).size;

    // Determine tier
    let tier = 'UNVERIFIED';
    const score = totalWeighted / 1e18; // Convert from wei
    if (score >= 10000) tier = 'TRUSTED';
    else if (score >= 1000) tier = 'VERIFIED';
    else if (score >= 100) tier = 'COMMUNITY';

    await prisma.resource.update({
      where: { hash },
      data: {
        trustScore: BigInt(Math.floor(totalWeighted)),
        trustTier: tier,
        auditorCount,
      },
    });
  }

  private async updateAuditorStats(address: string) {
    const attestations = await prisma.attestation.findMany({
      where: { auditor: address },
    });

    const activeStakes = attestations.filter(a => !a.slashed && a.lockUntil > new Date()).length;
    const totalStaked = attestations
      .filter(a => !a.slashed)
      .reduce((sum, a) => sum + a.amount, 0n);
    const slashCount = attestations.filter(a => a.slashed).length;
    const accuracy = attestations.length > 0 
      ? ((attestations.length - slashCount) / attestations.length) * 100 
      : 100;

    await prisma.auditor.upsert({
      where: { address },
      create: {
        address,
        totalStaked,
        activeStakes,
        totalAudits: attestations.length,
        slashCount,
        accuracy,
        lastActive: new Date(),
      },
      update: {
        totalStaked,
        activeStakes,
        totalAudits: attestations.length,
        slashCount,
        accuracy,
        lastActive: new Date(),
      },
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const indexer = new Indexer();
