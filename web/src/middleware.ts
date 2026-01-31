import { NextRequest, NextResponse } from 'next/server';

// Markdown content for agent consumption
const markdownContent: Record<string, string> = {
  '/': `# $ISNAD — The Trust Layer for AI Agents

**A Proof-of-Stake Audit Protocol for the Agent Internet**

## What is ISNAD?

ISNAD is a decentralized trust layer where auditors stake tokens to vouch for code safety. Malicious code burns stakes; clean code earns yield.

## How it works

1. **Auditors review skills** and stake $ISNAD tokens to vouch for safety
2. **Stakes are locked** for 30-180 days
3. **If malware is detected** → staked tokens are slashed
4. **If skill remains clean** → auditors earn yield
5. **Users check trust scores** before installing

## Why it works

- **Skin in the game:** Auditors risk real value. False vouches have consequences.
- **Self-selecting expertise:** Only confident auditors stake. Market filters for competence.
- **Scalable trust:** No central authority. Trust emerges from economic incentives.
- **Attack resistant:** Sybil attacks require capital. Collusion burns all colluders.

## Links

- [Trust Checker](/check) — Check any skill's trust score
- [Auditor Leaderboard](/leaderboard) — Top auditors by stake
- [Documentation](/docs) — Full protocol docs
- [About](/about) — Etymology and mission

---

*The name comes from the Islamic scholarly tradition of isnad (إسناد) — the chain of transmission used to authenticate hadith.*
`,

  '/check': `# ISNAD Trust Checker

Check any skill's trust score before installation.

## Usage

Enter a skill URL, package name, or hash to check its trust score and audit history.

## API Endpoint

\`\`\`
GET /api/skills/{hash}
Accept: application/json

Response:
{
  "name": "skill-name",
  "author": "author",
  "version": "1.0.0",
  "hash": "0x...",
  "trustScore": 1250,
  "trustTier": "VERIFIED",
  "auditorCount": 3,
  "audits": [...]
}
\`\`\`

## Trust Tiers

- **VERIFIED** (1000+ $ISNAD staked) — High confidence
- **AUDITED** (100-999 $ISNAD staked) — Moderate confidence  
- **UNVERIFIED** (0-99 $ISNAD staked) — Low confidence
- **FLAGGED** — Active security concerns

---

[Back to home](/) | [Documentation](/docs)
`,

  '/leaderboard': `# ISNAD Auditor Leaderboard

Top auditors ranked by total $ISNAD staked.

## Metrics

- **Total Staked** — Sum of all active stakes
- **Audits** — Number of skills audited
- **Accuracy** — Percentage of audits without burns
- **Burns** — Number of times stake was slashed

## Becoming an Auditor

Anyone can become an auditor by:
1. Acquiring $ISNAD tokens
2. Reviewing skill code for security issues
3. Staking tokens on skills you've verified as safe

Higher stakes + longer lock periods = more yield.

---

[Back to home](/) | [Documentation](/docs)
`,

  '/docs': `# ISNAD Documentation

## Getting Started

- [Introduction](/docs/intro) — What is $ISNAD and why it matters
- [Quick Start](/docs/quickstart) — Check your first skill in 2 minutes
- [Trust Tiers](/docs/tiers) — Understanding VERIFIED, AUDITED, and UNVERIFIED

## For Auditors

- [Becoming an Auditor](/docs/auditors) — Requirements and onboarding
- [Staking Guide](/docs/staking) — How to stake, lock periods, and yield
- [Detection & Slashing](/docs/slashing) — What triggers a burn

## Technical

- [Smart Contracts](/docs/contracts) — On-chain architecture
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

We apply this ancient wisdom to modern code provenance. A skill is only as trustworthy as its chain of auditors.

## The Problem

AI agents increasingly rely on shared skills from untrusted sources. A malicious skill can:
- Read API keys and credentials
- Exfiltrate private data
- Execute arbitrary commands
- Impersonate the agent

Current mitigations (manual review, central approval, reputation scores) don't scale.

## The Solution

$ISNAD introduces a decentralized trust layer:
- Auditors stake tokens to vouch for code safety
- Malicious code burns stakes
- Clean code earns yield
- Market-priced trust signal without central authority

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
