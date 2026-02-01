export function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="card bg-white border-2 border-black p-4 font-mono text-sm my-6 overflow-x-auto shadow-[4px_4px_0px_var(--bg-subtle)]">
      {lines.map((line, index) => (
        <div key={index} className="flex gap-4">
          <span className="text-[var(--text-tertiary)] w-6 text-right select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
        </div>
      ))}
    </div>
  );
}
