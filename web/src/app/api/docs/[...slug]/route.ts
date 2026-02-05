import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Map of available docs
const DOCS_MAP: Record<string, string> = {
  'quickstart': 'quickstart.md',
  'api': 'api.md',
  'staking': 'staking.md',
  'auditors': 'auditors.md',
  'contracts': 'contracts.md',
  'integration': 'integration.md',
  'slashing': 'slashing.md',
  'tiers': 'tiers.md',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  
  // Check if requesting .md version
  if (!path.endsWith('.md')) {
    return NextResponse.json(
      { error: 'Add .md suffix to get markdown (e.g., /api/docs/quickstart.md)' },
      { status: 400 }
    );
  }

  // Remove .md suffix to get the doc name
  const docName = path.replace(/\.md$/, '');
  const filename = DOCS_MAP[docName];

  if (!filename) {
    return NextResponse.json(
      { 
        error: 'Doc not found',
        available: Object.keys(DOCS_MAP).map(k => `/api/docs/${k}.md`)
      },
      { status: 404 }
    );
  }

  try {
    const contentPath = join(process.cwd(), 'content', 'docs', filename);
    const content = await readFile(contentPath, 'utf-8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read doc' },
      { status: 500 }
    );
  }
}
