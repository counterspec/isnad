import { NextRequest, NextResponse } from 'next/server';

// Markdown content for agent consumption (Accept: text/markdown)
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

## Links

- [Trust Checker](/check) — Check any resource's trust score
- [Auditor Leaderboard](/leaderboard) — Top auditors by stake
- [Documentation](/docs) — Full protocol docs
- [About](/about) — Etymology and mission
`,

  '/check': `# ISNAD Trust Checker

Check any resource's trust score before use.

## Usage

Enter a resource inscription hash, URL, or package name to check its trust score and attestation history.

## API Endpoint

\`\`\`
GET /api/resources/{hash}
Accept: application/json
\`\`\`
`,

  '/leaderboard': `# ISNAD Auditor Leaderboard

Top auditors ranked by total $ISNAD staked.

## Becoming an Auditor

1. Acquire $ISNAD tokens
2. Review resources for security issues
3. Stake tokens on resources you've verified as safe
`,

  '/docs': `# ISNAD Documentation

## Getting Started

- [Quick Start](/docs/quickstart) — Check your first resource in 2 minutes
- [API Reference](/docs/api) — Endpoints for trust lookups
- [Trust Tiers](/docs/tiers) — Understanding trust levels

## For Auditors

- [Becoming an Auditor](/docs/auditors) — Requirements and onboarding
- [Staking Guide](/docs/staking) — How to stake and earn
- [Slashing](/docs/slashing) — What triggers a burn

## Technical

- [Smart Contracts](/docs/contracts) — On-chain architecture
- [Integration Guide](/docs/integration) — Add trust checks to your agent

## LLM-Ready Docs

Add \`.md\` to any docs URL to get raw markdown:
- /docs/quickstart → HTML
- /docs/quickstart.md → Markdown

Or use \`Accept: text/markdown\` header.
`,

  '/about': `# About ISNAD

## The Name

**Isnad** (إسناد) comes from the Islamic scholarly tradition — the chain of transmission used to authenticate hadith. A hadith is only as trustworthy as its chain of narrators.

We apply this ancient wisdom to modern AI provenance. A resource is only as trustworthy as its chain of auditors.

## The Problem

AI agents increasingly rely on shared resources from untrusted sources. A compromised resource can:
- Read API keys and credentials
- Exfiltrate private data
- Execute arbitrary commands

## The Solution

$ISNAD introduces a decentralized trust layer:
- **Inscriptions:** Resources stored permanently on Base L2
- **Attestations:** Auditors stake tokens to vouch for safety
- **Slashing:** Malicious resources burn stakes
- **Yield:** Clean resources earn rewards
`,
};

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const { pathname } = request.nextUrl;

  // NEW: Handle /docs/*.md requests - serve raw markdown files
  if (pathname.startsWith('/docs/') && pathname.endsWith('.md')) {
    const slug = pathname.replace('/docs/', '').replace('.md', '');
    const url = request.nextUrl.clone();
    url.pathname = `/api/docs/${slug}.md`;
    return NextResponse.rewrite(url);
  }

  // EXISTING: Check if client wants markdown via Accept header
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/check', '/leaderboard', '/docs', '/docs/:path*', '/about'],
};
