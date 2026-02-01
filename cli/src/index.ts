#!/usr/bin/env node
import { Command } from 'commander';
import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  formatUnits, 
  parseUnits,
  keccak256,
  toBytes,
  type Address,
  type Hex
} from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Contract addresses
const CONTRACTS = {
  84532: { // Base Sepolia (testnet)
    token: '0xc41c1006A1AaC093C758A2f09de16fee2561651A' as Address,
    registry: '0x5A06453257874Fd000738F28C462d17BFf8e1EA3' as Address,
    staking: '0x58983D142A388A96B7d9F970005483AA044CCAD9' as Address,
  },
  8453: { // Base Mainnet (LIVE)
    token: '0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5' as Address,
    registry: '0xb8264f3117b498ddF912EBF641B2301103D80f06' as Address,
    staking: '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca' as Address,
  },
};

// Minimal ABIs for CLI operations
const STAKING_ABI = [
  {
    name: 'getTrustScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [{ name: 'score', type: 'uint256' }],
  },
  {
    name: 'getTrustTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [{ name: 'tier', type: 'uint8' }],
  },
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'resourceHash', type: 'bytes32' },
      { name: 'amount', type: 'uint256' },
      { name: 'lockDuration', type: 'uint256' },
    ],
    outputs: [{ name: 'attestationId', type: 'bytes32' }],
  },
  {
    name: 'getResourceAttestations',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'resourceHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  {
    name: 'getAttestation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'attestationId', type: 'bytes32' }],
    outputs: [
      { name: 'auditor', type: 'address' },
      { name: 'resourceHash', type: 'bytes32' },
      { name: 'amount', type: 'uint256' },
      { name: 'lockUntil', type: 'uint256' },
      { name: 'lockDuration', type: 'uint256' },
      { name: 'slashed', type: 'bool' },
    ],
  },
] as const;

const REGISTRY_ABI = [
  {
    name: 'getResource',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'contentHash', type: 'bytes32' }],
    outputs: [
      { name: 'inscribed', type: 'bool' },
      { name: 'resourceAuthor', type: 'address' },
      { name: 'inscribedBlock', type: 'uint256' },
      { name: 'successor', type: 'bytes32' },
    ],
  },
  {
    name: 'inscribe',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'contentHash', type: 'bytes32' },
      { name: 'resourceType', type: 'uint8' },
      { name: 'metadata', type: 'string' },
      { name: 'content', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

const TOKEN_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const TIER_NAMES = ['UNVERIFIED', 'COMMUNITY', 'VERIFIED', 'TRUSTED'];

function getChain(network: string) {
  return network === 'mainnet' ? base : baseSepolia;
}

function getContracts(network: string) {
  return network === 'mainnet' ? CONTRACTS[8453] : CONTRACTS[84532];
}

const program = new Command();

program
  .name('isnad')
  .description('CLI for ISNAD protocol - trust layer for AI agents')
  .version('0.1.0')
  .option('-n, --network <network>', 'Network to use (sepolia, mainnet)', 'sepolia');

// Check command - query trust score
program
  .command('check <hash>')
  .description('Check trust score for a resource hash')
  .action(async (hash: string) => {
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);

    const client = createPublicClient({
      chain,
      transport: http(),
    });

    const resourceHash = hash.startsWith('0x') ? hash as Hex : `0x${hash}` as Hex;

    try {
      // Get trust score
      const score = await client.readContract({
        address: contracts.staking,
        abi: STAKING_ABI,
        functionName: 'getTrustScore',
        args: [resourceHash],
      });

      // Get trust tier
      const tier = await client.readContract({
        address: contracts.staking,
        abi: STAKING_ABI,
        functionName: 'getTrustTier',
        args: [resourceHash],
      });

      // Get attestation count
      const attestations = await client.readContract({
        address: contracts.staking,
        abi: STAKING_ABI,
        functionName: 'getResourceAttestations',
        args: [resourceHash],
      });

      // Get registry info
      const [inscribed, author, block] = await client.readContract({
        address: contracts.registry,
        abi: REGISTRY_ABI,
        functionName: 'getResource',
        args: [resourceHash],
      });

      console.log('\n📊 ISNAD Trust Report');
      console.log('═'.repeat(40));
      console.log(`Resource: ${resourceHash}`);
      console.log(`Network:  ${chain.name}`);
      console.log('─'.repeat(40));
      console.log(`Status:   ${inscribed ? '✓ Inscribed' : '✗ Not found'}`);
      if (inscribed) {
        console.log(`Author:   ${author}`);
        console.log(`Block:    ${block}`);
      }
      console.log('─'.repeat(40));
      console.log(`Trust Score: ${formatUnits(score, 18)} ISNAD`);
      console.log(`Trust Tier:  ${TIER_NAMES[tier] || 'UNKNOWN'}`);
      console.log(`Auditors:    ${attestations.length}`);
      console.log('═'.repeat(40));
      
      // Output machine-readable JSON for agents
      console.log('\n// JSON for agents:');
      console.log(JSON.stringify({
        hash: resourceHash,
        inscribed,
        author: inscribed ? author : null,
        trustScore: formatUnits(score, 18),
        trustTier: TIER_NAMES[tier],
        auditorCount: attestations.length,
      }, null, 2));

    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Stake command - stake tokens on a resource
program
  .command('stake <hash> <amount>')
  .description('Stake ISNAD tokens on a resource')
  .option('-l, --lock <days>', 'Lock duration in days (7, 30, or 90)', '30')
  .option('-k, --key <privateKey>', 'Private key (or set ISNAD_PRIVATE_KEY env)')
  .action(async (hash: string, amount: string, cmdOptions) => {
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);

    const privateKey = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Error: Private key required. Use --key or set ISNAD_PRIVATE_KEY env');
      process.exit(1);
    }

    const account = privateKeyToAccount(privateKey as Hex);
    const lockDays = parseInt(cmdOptions.lock);
    const lockSeconds = lockDays * 24 * 60 * 60;
    const amountWei = parseUnits(amount, 18);
    const resourceHash = hash.startsWith('0x') ? hash as Hex : `0x${hash}` as Hex;

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });

    try {
      // Check allowance
      const allowance = await publicClient.readContract({
        address: contracts.token,
        abi: TOKEN_ABI,
        functionName: 'allowance',
        args: [account.address, contracts.staking],
      });

      // Approve if needed
      if (allowance < amountWei) {
        console.log('Approving tokens...');
        const approveHash = await walletClient.writeContract({
          address: contracts.token,
          abi: TOKEN_ABI,
          functionName: 'approve',
          args: [contracts.staking, amountWei],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log('Approved ✓');
      }

      // Stake
      console.log(`Staking ${amount} ISNAD for ${lockDays} days...`);
      const stakeHash = await walletClient.writeContract({
        address: contracts.staking,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [resourceHash, amountWei, BigInt(lockSeconds)],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: stakeHash });

      console.log('\n✅ Stake successful!');
      console.log(`Transaction: ${receipt.transactionHash}`);
      console.log(`Resource:    ${resourceHash}`);
      console.log(`Amount:      ${amount} ISNAD`);
      console.log(`Lock:        ${lockDays} days`);
      console.log(`Auditor:     ${account.address}`);

    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Inscribe command - inscribe a resource
program
  .command('inscribe <file>')
  .description('Inscribe a file as an ISNAD resource')
  .option('-t, --type <type>', 'Resource type (raw, agent, prompt, tool, workflow, training, model)', 'raw')
  .option('-m, --metadata <json>', 'JSON metadata string')
  .option('-k, --key <privateKey>', 'Private key (or set ISNAD_PRIVATE_KEY env)')
  .action(async (file: string, cmdOptions) => {
    const fs = await import('fs');
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);

    const privateKey = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Error: Private key required. Use --key or set ISNAD_PRIVATE_KEY env');
      process.exit(1);
    }

    const typeMap: Record<string, number> = {
      raw: 0, agent: 1, prompt: 2, tool: 3, workflow: 4, training: 5, model: 6
    };
    const resourceType = typeMap[cmdOptions.type] ?? 0;

    const content = fs.readFileSync(file);
    const contentHash = keccak256(content); // Note: should use SHA-256 for real
    const metadata = cmdOptions.metadata || JSON.stringify({ file: file });

    const account = privateKeyToAccount(privateKey as Hex);

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    try {
      console.log(`Inscribing ${file}...`);
      console.log(`Content hash: ${contentHash}`);
      console.log(`Type: ${cmdOptions.type} (${resourceType})`);

      const hash = await walletClient.writeContract({
        address: contracts.registry,
        abi: REGISTRY_ABI,
        functionName: 'inscribe',
        args: [contentHash, resourceType, metadata, `0x${content.toString('hex')}`],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      console.log('\n✅ Inscription successful!');
      console.log(`Transaction:  ${receipt.transactionHash}`);
      console.log(`Content Hash: ${contentHash}`);
      console.log(`Author:       ${account.address}`);

    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Hash command - compute hash for content
program
  .command('hash <input>')
  .description('Compute content hash for a file or string')
  .option('-f, --file', 'Treat input as a file path')
  .action(async (input: string, cmdOptions) => {
    let content: Uint8Array;
    
    if (cmdOptions.file) {
      const fs = await import('fs');
      content = fs.readFileSync(input);
    } else {
      content = toBytes(input);
    }

    const hash = keccak256(content);
    console.log(hash);
  });

// Balance command - check token balance
program
  .command('balance [address]')
  .description('Check ISNAD token balance')
  .option('-k, --key <privateKey>', 'Private key to derive address from')
  .action(async (address: string | undefined, cmdOptions) => {
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);

    let targetAddress: Address;
    
    if (address) {
      targetAddress = address as Address;
    } else if (cmdOptions.key || process.env.ISNAD_PRIVATE_KEY) {
      const pk = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
      const account = privateKeyToAccount(pk as Hex);
      targetAddress = account.address;
    } else {
      console.error('Error: Address or private key required');
      process.exit(1);
    }

    const client = createPublicClient({
      chain,
      transport: http(),
    });

    try {
      const balance = await client.readContract({
        address: contracts.token,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: [targetAddress],
      });

      console.log(`Address: ${targetAddress}`);
      console.log(`Balance: ${formatUnits(balance, 18)} ISNAD`);

    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
