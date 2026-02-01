# Staking Guide

Step-by-step guide to staking $ISNAD tokens and creating attestations.

## Prerequisites

- $ISNAD tokens in your wallet
- ETH on Base for gas fees
- Wallet connected (MetaMask, Coinbase Wallet, WalletConnect)

## Step 1: Find a Resource

Use the [Trust Checker](https://isnad.md/check) to find resources:

1. Enter a resource identifier:
   - Content hash (0x...)
   - Skill URL (clawhub.com/author/skill)
   - Package name
   
2. Review the current trust status:
   - Trust tier
   - Existing attestations
   - Total staked

**Tip:** Look for resources with low or no stake that you're confident are safe. These offer the best risk/reward for early attestors.

## Step 2: Review the Code

**This is the most important step.** Before staking:

### Check for Red Flags
- [ ] Unauthorized network requests
- [ ] Credential access or exfiltration
- [ ] Obfuscated or minified code
- [ ] Unexpected file system access
- [ ] Privileged command execution
- [ ] Suspicious dependencies

### Verify Claims
- [ ] Metadata matches actual behavior
- [ ] Declared permissions are accurate
- [ ] Version history is clean
- [ ] Author reputation (if applicable)

### Test If Possible
- [ ] Run in sandboxed environment
- [ ] Monitor network traffic
- [ ] Check file system changes
- [ ] Verify output correctness

## Step 3: Connect Wallet

1. Go to https://isnad.md/stake
2. Click "Connect" in the header
3. Choose your wallet provider
4. Confirm connection

Your wallet should be on Base Sepolia (testnet) or Base mainnet.

## Step 4: Approve Token Spend

Before staking, you must approve the staking contract to spend your tokens:

1. Enter your desired stake amount
2. Click "Approve"
3. Confirm the transaction in your wallet
4. Wait for confirmation

**Note:** This is a one-time approval per amount. If you want to stake more later, you may need to approve again.

## Step 5: Create Attestation

1. Enter the resource hash (or search for it)
2. Set your stake amount
3. Choose lock duration:
   - 7 days (1.0x multiplier)
   - 30 days (1.0x multiplier)
   - 60 days (1.25x multiplier)
   - 90 days (1.5x multiplier)
4. Review the summary:
   - Amount to stake
   - Lock duration
   - Unlock date
5. Click "Create Attestation"
6. Confirm in your wallet
7. Wait for confirmation

## Step 6: Monitor Your Position

After staking:

### View Your Attestations
- Go to the Stake page while connected
- See all your active attestations
- Track unlock dates and status

### Watch for Flags
If a resource you've staked on gets flagged:
- You may be asked to provide evidence
- Monitor the jury process
- Appeal if you believe the verdict is wrong

## Step 7: Unstake (After Lock Expires)

Once your lock period ends:

1. Go to your attestations list
2. Find the unlocked attestation
3. Click "Unstake"
4. Confirm in your wallet
5. Receive your stake + any earned yield

## Staking Limits

| Limit | Value |
|-------|-------|
| Minimum stake | 10 $ISNAD |
| Maximum per attestation | 10,000 $ISNAD |
| Max total stake per auditor | 100,000 $ISNAD |
| Concentration cap | No single auditor >33% of resource's stake |

## Lock Duration Options

| Duration | Multiplier | Use Case |
|----------|------------|----------|
| 7 days | 1.0x | Testing, short-term |
| 30 days | 1.0x | Standard attestations |
| 60 days | 1.25x | Higher yield, more confidence |
| 90 days | 1.5x | Long-term, maximum yield |

## Troubleshooting

### Transaction Failed
- Check you have enough ETH for gas
- Ensure token approval is sufficient
- Try increasing gas limit

### Stake Not Appearing
- Wait for transaction confirmation
- Refresh the page
- Check your attestations list

### Can't Unstake
- Verify lock period has expired
- Check if resource was slashed
- Ensure you're connected with the right wallet

## Gas Costs (Approximate)

| Action | Gas (Base) |
|--------|------------|
| Approve | ~50,000 |
| Stake | ~150,000 |
| Unstake | ~100,000 |

At typical Base gas prices, expect <$0.01 per transaction.

## Next Steps

- [View the Leaderboard](https://isnad.md/leaderboard) — See top auditors
- [Read about Slashing](./jury.md) — Understand the risks
- [API Reference](./api.md) — Build integrations
