"use client";

interface RemediationListProps {
  items: string[];
}

export function RemediationList({ items }: RemediationListProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h3 className="text-lg font-medium text-white mb-3">How to improve</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg"
          >
            <span className="text-indigo-400 mt-0.5 shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <p className="text-sm text-zinc-300">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
