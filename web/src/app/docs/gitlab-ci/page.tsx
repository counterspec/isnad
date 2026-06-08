import { CodeBlock } from '@/components/CodeBlock';

export default function GitLabCIPage() {
  return (
    <article>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">GitLab CI Integration</h1>
      <p className="text-lg text-[var(--text-secondary)] mb-8">
        Run ISNAD scanner checks in GitLab merge request pipelines and keep JSON evidence as a build artifact.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Template
      </h2>
      <p className="text-[var(--text-secondary)] mb-4">
        Copy <code>examples/gitlab/.gitlab-ci.yml</code> into your GitLab repository root and configure the target globs.
      </p>
      <CodeBlock
        lines={[
          'variables:',
          '  ISNAD_SCAN_TARGETS: "skills/**/*.js prompts/**/*.md configs/**/*.json"',
          '  ISNAD_SCAN_OUTPUT: "isnad-scan-results.json"',
          '  ISNAD_SCAN_FAIL_FAST: "false"',
        ]}
      />

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Pipeline Behavior
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-6">
        <li>Runs on merge requests and the default branch.</li>
        <li>Installs <code>@isnad/scanner</code> in a Node 20 Alpine image.</li>
        <li>Writes scanner JSON to <code>ISNAD_SCAN_OUTPUT</code>.</li>
        <li>Publishes the JSON file as an artifact and GitLab SAST report input.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--border-dim)]">
        Example Include
      </h2>
      <CodeBlock
        lines={[
          'include:',
          '  - local: examples/gitlab/.gitlab-ci.yml',
          '',
          'variables:',
          '  ISNAD_SCAN_TARGETS: "agent-skills/**/*.js system-prompts/**/*.md"',
          '  ISNAD_SCAN_OUTPUT: "gl-isnad-scan.json"',
        ]}
      />
    </article>
  );
}

