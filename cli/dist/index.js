#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const accounts_1 = require("viem/accounts");
// Contract addresses (Base Sepolia - update after deployment)
const CONTRACTS = {
    84532: {
        token: '0x0000000000000000000000000000000000000000',
        registry: '0x0000000000000000000000000000000000000000',
        staking: '0x0000000000000000000000000000000000000000',
    },
    8453: {
        token: '0x0000000000000000000000000000000000000000',
        registry: '0x0000000000000000000000000000000000000000',
        staking: '0x0000000000000000000000000000000000000000',
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
];
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
];
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
];
const TIER_NAMES = ['UNVERIFIED', 'COMMUNITY', 'VERIFIED', 'TRUSTED'];
function getChain(network) {
    return network === 'mainnet' ? chains_1.base : chains_1.baseSepolia;
}
function getContracts(network) {
    return network === 'mainnet' ? CONTRACTS[8453] : CONTRACTS[84532];
}
const program = new commander_1.Command();
program
    .name('isnad')
    .description('CLI for ISNAD protocol - trust layer for AI agents')
    .version('0.1.0')
    .option('-n, --network <network>', 'Network to use (sepolia, mainnet)', 'sepolia');
// Check command - query trust score
program
    .command('check <hash>')
    .description('Check trust score for a resource hash')
    .action(async (hash) => {
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);
    const client = (0, viem_1.createPublicClient)({
        chain,
        transport: (0, viem_1.http)(),
    });
    const resourceHash = hash.startsWith('0x') ? hash : `0x${hash}`;
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
        console.log(`Trust Score: ${(0, viem_1.formatUnits)(score, 18)} ISNAD`);
        console.log(`Trust Tier:  ${TIER_NAMES[tier] || 'UNKNOWN'}`);
        console.log(`Auditors:    ${attestations.length}`);
        console.log('═'.repeat(40));
        // Output machine-readable JSON for agents
        console.log('\n// JSON for agents:');
        console.log(JSON.stringify({
            hash: resourceHash,
            inscribed,
            author: inscribed ? author : null,
            trustScore: (0, viem_1.formatUnits)(score, 18),
            trustTier: TIER_NAMES[tier],
            auditorCount: attestations.length,
        }, null, 2));
    }
    catch (error) {
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
    .action(async (hash, amount, cmdOptions) => {
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);
    const privateKey = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
    if (!privateKey) {
        console.error('Error: Private key required. Use --key or set ISNAD_PRIVATE_KEY env');
        process.exit(1);
    }
    const account = (0, accounts_1.privateKeyToAccount)(privateKey);
    const lockDays = parseInt(cmdOptions.lock);
    const lockSeconds = lockDays * 24 * 60 * 60;
    const amountWei = (0, viem_1.parseUnits)(amount, 18);
    const resourceHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    const publicClient = (0, viem_1.createPublicClient)({
        chain,
        transport: (0, viem_1.http)(),
    });
    const walletClient = (0, viem_1.createWalletClient)({
        account,
        chain,
        transport: (0, viem_1.http)(),
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
    }
    catch (error) {
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
    .action(async (file, cmdOptions) => {
    const fs = await import('fs');
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);
    const privateKey = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
    if (!privateKey) {
        console.error('Error: Private key required. Use --key or set ISNAD_PRIVATE_KEY env');
        process.exit(1);
    }
    const typeMap = {
        raw: 0, agent: 1, prompt: 2, tool: 3, workflow: 4, training: 5, model: 6
    };
    const resourceType = typeMap[cmdOptions.type] ?? 0;
    const content = fs.readFileSync(file);
    const contentHash = (0, viem_1.keccak256)(content); // Note: should use SHA-256 for real
    const metadata = cmdOptions.metadata || JSON.stringify({ file: file });
    const account = (0, accounts_1.privateKeyToAccount)(privateKey);
    const walletClient = (0, viem_1.createWalletClient)({
        account,
        chain,
        transport: (0, viem_1.http)(),
    });
    const publicClient = (0, viem_1.createPublicClient)({
        chain,
        transport: (0, viem_1.http)(),
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
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
});
// Hash command - compute hash for content
program
    .command('hash <input>')
    .description('Compute content hash for a file or string')
    .option('-f, --file', 'Treat input as a file path')
    .action(async (input, cmdOptions) => {
    let content;
    if (cmdOptions.file) {
        const fs = await import('fs');
        content = fs.readFileSync(input);
    }
    else {
        content = (0, viem_1.toBytes)(input);
    }
    const hash = (0, viem_1.keccak256)(content);
    console.log(hash);
});
// Balance command - check token balance
program
    .command('balance [address]')
    .description('Check ISNAD token balance')
    .option('-k, --key <privateKey>', 'Private key to derive address from')
    .action(async (address, cmdOptions) => {
    const options = program.opts();
    const chain = getChain(options.network);
    const contracts = getContracts(options.network);
    let targetAddress;
    if (address) {
        targetAddress = address;
    }
    else if (cmdOptions.key || process.env.ISNAD_PRIVATE_KEY) {
        const pk = cmdOptions.key || process.env.ISNAD_PRIVATE_KEY;
        const account = (0, accounts_1.privateKeyToAccount)(pk);
        targetAddress = account.address;
    }
    else {
        console.error('Error: Address or private key required');
        process.exit(1);
    }
    const client = (0, viem_1.createPublicClient)({
        chain,
        transport: (0, viem_1.http)(),
    });
    try {
        const balance = await client.readContract({
            address: contracts.token,
            abi: TOKEN_ABI,
            functionName: 'balanceOf',
            args: [targetAddress],
        });
        console.log(`Address: ${targetAddress}`);
        console.log(`Balance: ${(0, viem_1.formatUnits)(balance, 18)} ISNAD`);
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
});
program.parse();
