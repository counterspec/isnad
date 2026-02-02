import { CodeBlock } from '@/components/CodeBlock';

export default function ApiPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">API Reference</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        REST API for querying trust scores, resources, and auditor data.
      </p>

      <div className="card bg-[var(--bg-subtle)] mb-8">
        <p className="font-mono text-sm">Base URL: <strong>https://api.isnad.md</strong></p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Endpoints
      </h2>

      <Endpoint 
        method="GET"
        path="/api/v1/stats"
        description="Get protocol-wide statistics"
        response={[
          '{',
          '  "success": true,',
          '  "stats": {',
          '    "resources": 142,',
          '    "attestations": 1847,',
          '    "auditors": 38,',
          '    "totalStaked": "4250000000000000000000000"',
          '  }',
          '}',
        ]}
      />

      <Endpoint 
        method="GET"
        path="/api/v1/trust/:hash"
        description="Get trust score and attestations for a resource"
        response={[
          '{',
          '  "success": true,',
          '  "resource": { "hash": "0x...", "type": "SKILL", ... },',
          '  "trustScore": "2500000000000000000000",',
          '  "trustTier": "VERIFIED",',
          '  "attestations": [',
          '    { "auditor": "0x...", "amount": "1000...", "lockUntil": ... }',
          '  ]',
          '}',
        ]}
      />

      <Endpoint 
        method="GET"
        path="/api/v1/resources"
        description="List inscribed resources"
        params={[
          { name: 'type', description: 'Filter by type (SKILL, CONFIG, etc.)' },
          { name: 'limit', description: 'Max results (default 20)' },
          { name: 'offset', description: 'Pagination offset' },
        ]}
        response={[
          '{',
          '  "success": true,',
          '  "resources": [',
          '    { "hash": "0x...", "type": "SKILL", "name": "weather", ... }',
          '  ]',
          '}',
        ]}
      />

      <Endpoint 
        method="GET"
        path="/api/v1/auditors"
        description="Get auditor leaderboard"
        params={[
          { name: 'limit', description: 'Max results (default 10)' },
        ]}
        response={[
          '{',
          '  "success": true,',
          '  "auditors": [',
          '    {',
          '      "address": "0x...",',
          '      "totalStaked": "45000000000000000000000",',
          '      "attestationCount": 127,',
          '      "accuracy": 99.2',
          '    }',
          '  ]',
          '}',
        ]}
      />

      <Endpoint 
        method="GET"
        path="/health"
        description="Health check endpoint"
        response={[
          '{ "status": "ok", "timestamp": "2024-..." }',
        ]}
      />

      <h2 className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Error Responses
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        All errors return a consistent format:
      </p>
      <CodeBlock 
        lines={[
          '{',
          '  "success": false,',
          '  "error": "Resource not found"',
          '}',
        ]}
      />

      <h2 className="text-2xl font-bold mt-12 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Rate Limits
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
        <li>100 requests per minute per IP</li>
        <li>Responses are cached for 30 seconds</li>
        <li>For higher limits, contact us about API keys</li>
      </ul>
    </article>
  );
}

function Endpoint({ method, path, description, params, response }: {
  method: string;
  path: string;
  description: string;
  params?: { name: string; description: string }[];
  response: string[];
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="bg-black text-white px-2 py-0.5 text-xs font-mono">{method}</span>
        <code className="font-mono text-sm">{path}</code>
      </div>
      <p className="text-[var(--text-secondary)] mb-3">{description}</p>
      {params && (
        <div className="mb-3">
          <p className="text-sm font-semibold mb-1">Query Parameters:</p>
          <ul className="text-sm text-[var(--text-secondary)]">
            {params.map(p => (
              <li key={p.name}><code>{p.name}</code> — {p.description}</li>
            ))}
          </ul>
        </div>
      )}
      <CodeBlock lines={response} />
    </div>
  );
}
