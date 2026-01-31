import { NextRequest, NextResponse } from 'next/server';

// Markdown content for agent consumption
const markdownContent: Record<string, string> = {
  '/': `# $ISNAD — The Trust Layer for AI

**A Proof-of-Stake Attestation Protocol for the Agent Internet**

## What is ISNAD?

ISNAD is a decentralized trust layer where auditors stake tokens to attest to resource safety. Malicious resources burn stakes; clean resources earn yield. Everything inscribed permanently on Base L2.

## Resource Types

| Type | Description |
|------|-------------|
| SKILL | Executable code packages, tools, API integrations |
| CONFIG | Agent configurations, gateway settings |
| PROMPT | System prompts, personas, behavioral instructions |
| MEMORY | Knowledge bases, context files, RAG documents |
| MODEL | Fine-tunes, LoRAs, model adapters |
| API | External service attestations |

## How it works

1. **Resources are inscribed** on Base L2 with content and metadata
2. **Auditors review and stake** $ISNAD tokens to attest to safety
3. **Stakes are locked** for 30-180 days
4. **If issues are detected** → staked tokens are slashed
5. **If resource remains clean** → auditors earn yield
6. **Consumers check trust scores** before using

## Why it works

- **Skin in the game:** Auditors risk real value. False attestations have consequences.
- **Self-selecting expertise:** Only confident auditors stake. Market filters for competence.
- **Permanently verifiable:** Resources and attestations live on-chain forever.
- **Attack resistant:** Sybil attacks require capital. Collusion burns all colluders.

## On-Chain Inscriptions

Resources are inscribed directly on Base L2 calldata (~$0.01/KB):
- Permanent storage, no IPFS pinning needed
- Censorship-resistant, no external dependencies
- Content-addressable via transaction hash

## Links

- [Trust Checker](/check) — Check any resource's trust score
- [Auditor Leaderboard](/leaderboard) — Top auditors by stake
- [Documentation](/docs) — Full protocol docs
- [About](/about) — Etymology and mission

---

*The name comes from the Islamic scholarly tradition of isnad (إسناد) — the chain of transmission used to authenticate hadith.*
`,

  '/check': `# ISNAD Trust Checker

Check any resource's trust score before use.

## Usage

Enter a resource inscription hash, URL, or package name to check its trust score and attestation history.

## Supported Resource Types

- SKILL — executable code packages
- CONFIG — agent configurations
- PROMPT — system prompts, personas
- MEMORY — knowledge bases, context
- MODEL — fine-tunes, adapters
- API — endpoint attestations

## API Endpoint

\`\`\`
GET /api/resources/{hash}
Accept: application/json

Response:
{
  "type": "SKILL",
  "name": "weather-skill",
  "version": "1.2.0",
  "inscription": "base:0x1234...",
  "trustScore": 1250,
  "trustTier": "VERIFIED",
  "auditorCount": 3,
  "attestations": [...]
}
\`\`\`

## Trust Tiers

| Tier | Stake Required | Auditors | Time Clean |
|------|----------------|----------|------------|
| UNVERIFIED | 0 | 0 | — |
| REVIEWED | ≥100 $ISNAD | 1+ | — |
| VERIFIED | ≥1,000 $ISNAD | 2+ | 14 days |
| TRUSTED | ≥10,000 $ISNAD | 3+ | 60 days |
| CERTIFIED | ≥50,000 $ISNAD | 5+ | 180 days |

---

[Back to home](/) | [Documentation](/docs)
`,

  '/leaderboard': `# ISNAD Auditor Leaderboard

Top auditors ranked by total $ISNAD staked.

## Metrics

- **Total Staked** — Sum of all active stakes
- **Attestations** — Number of resources attested
- **Accuracy** — Percentage without burns
- **Burns** — Number of times stake was slashed

## Becoming an Auditor

Anyone can become an auditor by:
1. Acquiring $ISNAD tokens
2. Reviewing resources for security issues
3. Staking tokens on resources you've verified as safe

Higher stakes + longer lock periods = more yield.

## Lock Periods & Yield

| Lock Period | Base APY |
|-------------|----------|
| 30 days | 5% |
| 90 days | 8% |
| 180 days | 12% |

---

[Back to home](/) | [Documentation](/docs)
`,

  '/docs': `# ISNAD Documentation

## Getting Started

- [Introduction](/docs/intro) — What is $ISNAD and why it matters
- [Quick Start](/docs/quickstart) — Check your first resource in 2 minutes
- [Trust Tiers](/docs/tiers) — Understanding VERIFIED, AUDITED, UNVERIFIED
- [Resource Types](/docs/types) — SKILL, CONFIG, PROMPT, MEMORY, MODEL, API

## Inscriptions

- [Inscription Format](/docs/inscriptions) — On-chain resource storage
- [Chunked Inscriptions](/docs/chunks) — Large resource handling
- [Indexer Protocol](/docs/indexer) — Running an indexer node

## For Auditors

- [Becoming an Auditor](/docs/auditors) — Requirements and onboarding
- [Staking Guide](/docs/staking) — How to stake, lock periods, and yield
- [Detection & Slashing](/docs/slashing) — What triggers a burn

## Technical

- [Smart Contracts](/docs/contracts) — On-chain architecture (Base)
- [API Reference](/docs/api) — Endpoints for trust lookups
- [Integration Guide](/docs/integration) — Add trust checks to your agent

## Resources

- [Whitepaper](https://github.com/counterspec/isnad/blob/main/WHITEPAPER.md)
- [GitHub](https://github.com/counterspec/isnad)

---

[Back to home](/)
`,

  '/about': `# About ISNAD

## The Name

**Isnad** (إسناد) comes from the Islamic scholarly tradition — the chain of transmission used to authenticate hadith (sayings of the Prophet). A hadith is only as trustworthy as its chain of narrators.

We apply this ancient wisdom to modern AI provenance. A resource is only as trustworthy as its chain of auditors.

## The Problem

AI agents increasingly rely on shared resources—skills, configs, prompts, memory—from untrusted sources. A compromised resource can:
- Read API keys and credentials
- Exfiltrate private data
- Execute arbitrary commands
- Manipulate agent behavior

Current mitigations (manual review, central approval, reputation scores) don't scale.

## The Solution

$ISNAD introduces a decentralized trust layer:
- **Inscriptions:** Resources stored permanently on Base L2
- **Attestations:** Auditors stake tokens to vouch for safety
- **Slashing:** Malicious resources burn stakes
- **Yield:** Clean resources earn rewards

Market-priced trust signal without central authority.

## On-Chain Everything

Unlike IPFS-based approaches, ISNAD inscribes resources directly on Base L2 calldata:
- ~$0.01 per KB to inscribe
- Permanent, censorship-resistant storage
- No pinning services, no external dependencies
- Content and attestations together on-chain

## Resource Types

ISNAD supports attestation for any AI resource:
- SKILL — code packages
- CONFIG — agent settings
- PROMPT — system prompts
- MEMORY — knowledge bases
- MODEL — fine-tunes
- API — endpoint attestations

Future types added via governance.

## Links

- [GitHub](https://github.com/counterspec/isnad)
- [Twitter/X](https://twitter.com/isnad_protocol)

---

[Back to home](/) | [Documentation](/docs)
`,
};

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const pathname = request.nextUrl.pathname;

  // Check if client wants markdown
  if (acceptHeader.includes('text/markdown')) {
    const content = markdownContent[pathname];
    
    if (content) {
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'X-Content-Source': 'isnad-markdown',
        },
      });
    }
  }

  // Continue to normal page rendering
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/check', '/leaderboard', '/docs', '/about'],
};
