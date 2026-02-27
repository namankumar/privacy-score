"use client";

import { ScoringResult } from "@/lib/scoring/types";

interface ScoreDisplayProps {
  result: ScoringResult;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-orange-400";
  return "text-red-400";
}

function getScoreBorderColor(score: number): string {
  if (score >= 80) return "border-emerald-400";
  if (score >= 60) return "border-green-400";
  if (score >= 40) return "border-yellow-400";
  if (score >= 20) return "border-orange-400";
  return "border-red-400";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Poor";
  return "Critical";
}

function getScoreGlow(score: number): string {
  if (score >= 80) return "shadow-emerald-400/30";
  if (score >= 60) return "shadow-green-400/30";
  if (score >= 40) return "shadow-yellow-400/30";
  if (score >= 20) return "shadow-orange-400/30";
  return "shadow-red-400/30";
}

export function ScoreDisplay({ result }: ScoreDisplayProps) {
  const displayAddress = result.ensName
    ? result.ensName
    : `${result.address.slice(0, 6)}...${result.address.slice(-4)}`;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Score circle */}
      <div className="flex flex-col items-center mb-10">
        <div
          className={`w-36 h-36 rounded-full border-4 ${getScoreBorderColor(
            result.compositeScore
          )} flex flex-col items-center justify-center shadow-lg ${getScoreGlow(
            result.compositeScore
          )}`}
        >
          <span
            className={`text-5xl font-bold ${getScoreColor(
              result.compositeScore
            )}`}
          >
            {result.compositeScore}
          </span>
          <span className="text-xs text-zinc-400 mt-1">/ 100</span>
        </div>
        <p
          className={`mt-3 text-lg font-medium ${getScoreColor(
            result.compositeScore
          )}`}
        >
          {getScoreLabel(result.compositeScore)}
        </p>
        <p className="text-zinc-500 text-sm font-mono mt-1">{displayAddress}</p>
      </div>
    </div>
  );
}
