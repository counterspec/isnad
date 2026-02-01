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
    const stakedLogs = await client.getLogs({
      address: ADDRESSES.staking,
      event: parseAbiItem('event Staked(address indexed auditor, bytes32 indexed resourceHash, uint256 amount, uint256 lockDuration, uint256 stakeId)'),
      fromBlock,
      toBlock,
    });

    for (const log of stakedLogs) {
      await this.handleStakedEvent(log);
    }

    // Get Slashed events
    const slashedLogs = await client.getLogs({
      address: ADDRESSES.staking,
      event: parseAbiItem('event Slashed(uint256 indexed stakeId, bytes32 indexed resourceHash, uint256 amount, string reason)'),
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
      event: parseAbiItem('event ResourceInscribed(bytes32 indexed resourceHash, address indexed inscriber, string contentType, string uri)'),
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      await this.handleResourceInscribed(log);
    }
  }

  private async handleStakedEvent(log: any) {
    const { auditor, resourceHash, amount, lockDuration, stakeId } = log.args;
    const hash = resourceHash as string;
    const lockDays = Number(lockDuration) / 86400; // Convert seconds to days
    const multiplier = LOCK_MULTIPLIERS[lockDays] || 1.0;
    const lockUntil = new Date(Date.now() + Number(lockDuration) * 1000);

    console.log(`  ✅ Stake: ${auditor.slice(0, 8)}... on ${hash.slice(0, 10)}... (${amount} wei)`);

    // Upsert resource
    await prisma.resource.upsert({
      where: { hash },
      create: { hash },
      update: {},
    });

    // Create attestation
    await prisma.attestation.create({
      data: {
        resourceHash: hash,
        auditor,
        amount: BigInt(amount.toString()),
        lockDuration: lockDays,
        lockUntil,
        multiplier,
        txHash: log.transactionHash,
        blockNumber: BigInt(log.blockNumber.toString()),
      },
    });

    // Update resource trust score
    await this.updateResourceTrust(hash);

    // Update auditor stats
    await this.updateAuditorStats(auditor);
  }

  private async handleSlashedEvent(log: any) {
    const { stakeId, resourceHash, amount, reason } = log.args;
    const hash = resourceHash as string;

    console.log(`  🔥 Slash: ${hash.slice(0, 10)}... (${amount} wei) - ${reason}`);

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
    const { resourceHash, inscriber, contentType, uri } = log.args;
    const hash = resourceHash as string;

    console.log(`  📝 Inscribed: ${hash.slice(0, 10)}... by ${inscriber.slice(0, 8)}...`);

    await prisma.resource.upsert({
      where: { hash },
      create: {
        hash,
        url: uri,
        contentType,
        inscribedBy: inscriber,
        inscribedAt: new Date(),
        inscriptionTx: log.transactionHash,
      },
      update: {
        url: uri,
        contentType,
        inscribedBy: inscriber,
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
