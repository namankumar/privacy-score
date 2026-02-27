"use client";

import { useState } from "react";
import { CategoryScore } from "@/lib/scoring/types";

interface CategoryBarProps {
  category: CategoryScore;
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-green-400";
  if (score >= 40) return "bg-yellow-400";
  if (score >= 20) return "bg-orange-400";
  return "bg-red-400";
}

function getSeverityBadge(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

export function CategoryBar({ category }: CategoryBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">
              {category.name}
            </span>
            <span className="text-sm text-zinc-400 font-mono">
              {category.score}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getBarColor(
                category.score
              )} category-bar-fill`}
              style={
                { "--bar-width": `${category.score}%`, width: `${category.score}%` } as React.CSSProperties
              }
            />
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
          {category.signals.length > 0 && (
            <div className="mt-3 space-y-2">
              {category.signals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${getSeverityBadge(
                      signal.severity
                    )} shrink-0 mt-0.5`}
                  >
                    {signal.severity}
                  </span>
                  <div>
                    <span className="text-sm text-zinc-300 font-medium">
                      {signal.label}
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {signal.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {category.remediation.length > 0 && (
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-500 mb-1 font-medium">Fix:</p>
              {category.remediation.map((r, i) => (
                <p key={i} className="text-xs text-zinc-400 ml-2">
                  {r}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
