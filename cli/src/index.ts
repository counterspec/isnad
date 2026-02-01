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

// Contract addresses per network
const CONTRACTS = {
  mainnet: {
    chainId: 8453,
    token: '0x73F6d2BBef125b3A5F91Fe23c722f3C321f007E5' as Address,
    registry: '0xb8264f3117b498ddF912EBF641B2301103D80f06' as Address,
    staking: '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca' as Address,
    oracle: '0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd' as Address,
    rewardPool: '0x790b0766e9e2db7c59526b247851D16bB493a95B' as Address,
  },
  sepolia: {
    chainId: 84532,
    token: '0x07d921D275aD82e71aE42f2B603CF2926329c1Ce' as Address,
    registry: '0x916FFb3eB82616220b81b99f70c3B7679B9D62ca' as Address,
    staking: '0xf02c3A5FED3c460628b5781E3c304Dd8206E85bd' as Address,
    oracle: '0x790b0766e9e2db7c59526b247851D16bB493a95B' as Address,
    rewardPool: '0x3Ef44fb908C86865A9315277f9AFc6b65A87e702' as Address,
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
  {
    name: 'faucet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

const TIER_NAMES = ['UNVERIFIED', 'COMMUNITY', 'VERIFIED', 'TRUSTED'];

type NetworkName = 'mainnet' | 'sepolia';

function resolveNetwork(opts: { network?: string; testnet?: boolean }): NetworkName {
  if (opts.testnet) return 'sepolia';
  if (opts.network === 'sepolia' || opts.network === 'testnet') return 'sepolia';
  if (opts.network === 'mainnet' || opts.network === 'base') return 'mainnet';
  // Check env var
  if (process.env.ISNAD_TESTNET === 'true' || process.env.ISNAD_NETWORK === 'sepolia') {
    return 'sepolia';
  }
  return 'mainnet'; // Default to mainnet
}

function getChain(network: NetworkName) {
  return network === 'mainnet' ? base : baseSepolia;
}

function getContracts(network: NetworkName) {
  return CONTRACTS[network];
}

const program = new Command();

program
  .name('isnad')
  .description('CLI for ISNAD protocol - trust layer for AI agents')
  .version('0.2.0')
  .option('-n, --network <network>', 'Network: mainnet (default) or sepolia')
  .option('-t, --testnet', 'Use testnet (Base Sepolia) - shorthand for --network sepolia');

// Networks command - list available networks
program
  .command('networks')
  .description('List available networks and contract addresses')
  .action(() => {
    console.log('\n🌐 ISNAD Networks\n');
    
    for (const [name, config] of Object.entries(CONTRACTS)) {
      console.log(`${name === 'mainnet' ? '🟢' : '🟡'} ${name.toUpperCase()} (Chain ID: ${config.chainId})`);
      console.log(`   Token:      ${config.token}`);
      console.log(`   Registry:   ${config.registry}`);
      console.log(`   Staking:    ${config.staking}`);
      console.log(`   Oracle:     ${config.oracle}`);
      console.log(`   RewardPool: ${config.rewardPool}`);
      console.log('');
    }
    
    console.log('Usage:');
    console.log('  isnad check <hash>              # Uses mainnet (default)');
    console.log('  isnad --testnet check <hash>    # Uses Base Sepolia');
    console.log('  isnad -n sepolia check <hash>   # Same as above');
    console.log('  ISNAD_TESTNET=true isnad check  # Via environment');
  });

// Check command - query trust score
program
  .command('check <hash>')
  .description('Check trust score for a resource hash')
  .action(async (hash: string) => {
    const options = program.opts();
    const network = resolveNetwork(options);
    const chain = getChain(network);
    const contracts = getContracts(network);

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
      console.log(`Network:  ${chain.name} (${network})`);
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
      console.log('\n// JSON output:');
      console.log(JSON.stringify({
        network,
        chainId: contracts.chainId,
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
    const network = resolveNetwork(options);
    const chain = getChain(network);
    const contracts = getContracts(network);

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

    console.log(`\n🔒 Staking on ${network.toUpperCase()}`);

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
      console.log(`Network:     ${network}`);
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

// Faucet command - get testnet tokens (sepolia only)
program
  .command('faucet')
  .description('Get testnet ISNAD tokens (Base Sepolia only)')
  .option('-k, --key <privateKey>', 'Private key (or set ISNAD_PRIVATE_KEY env)')
  .action(async (cmdOptions) => {
    const privateKey = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
    if (!privateKey) {
      console.error('Error: Private key required. Use --key or set ISNAD_PRIVATE_KEY env');
      process.exit(1);
    }

    const contracts = CONTRACTS.sepolia;
    const account = privateKeyToAccount(privateKey as Hex);

    console.log('\n🚰 ISNAD Testnet Faucet');
    console.log(`Requesting tokens for: ${account.address}`);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    try {
      const hash = await walletClient.writeContract({
        address: contracts.token,
        abi: TOKEN_ABI,
        functionName: 'faucet',
        args: [],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // Check new balance
      const balance = await publicClient.readContract({
        address: contracts.token,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      });

      console.log('\n✅ Faucet successful!');
      console.log(`New balance: ${formatUnits(balance, 18)} tISNAD`);

    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Hash command - compute hash for content
program
  .command('hash')
  .description('Compute content hash for a file or string')
  .option('-f, --file <path>', 'File path to hash')
  .option('-s, --string <text>', 'String to hash')
  .action(async (cmdOptions) => {
    let content: Uint8Array;
    
    if (cmdOptions.file) {
      const fs = await import('fs');
      content = fs.readFileSync(cmdOptions.file);
      console.log(`File: ${cmdOptions.file}`);
    } else if (cmdOptions.string) {
      content = toBytes(cmdOptions.string);
    } else {
      console.error('Error: Provide --file or --string');
      process.exit(1);
    }

    const hash = keccak256(content);
    console.log(`Hash: ${hash}`);
  });

// Balance command - check token balance
program
  .command('balance [address]')
  .description('Check ISNAD token balance')
  .option('-k, --key <privateKey>', 'Private key to derive address from')
  .action(async (address: string | undefined, cmdOptions) => {
    const options = program.opts();
    const network = resolveNetwork(options);
    const chain = getChain(network);
    const contracts = getContracts(network);

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

      console.log(`Network: ${network}`);
      console.log(`Address: ${targetAddress}`);
      console.log(`Balance: ${formatUnits(balance, 18)} ${network === 'sepolia' ? 'tISNAD' : 'ISNAD'}`);

    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
