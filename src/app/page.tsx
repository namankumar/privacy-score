"use client";

import { useState } from "react";
import { ScoringResult } from "@/lib/scoring/types";
import { ScoreInput } from "@/components/ScoreInput";
import { LoadingProgress } from "@/components/LoadingProgress";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { CategoryBar } from "@/components/CategoryBar";
import { RemediationList } from "@/components/RemediationList";
import { ShareCard } from "@/components/ShareCard";

type AppState = "idle" | "loading" | "results" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (address: string) => {
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to score address");
      }

      setResult(data);
      setState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4">
      {/* Header */}
      <div className="mt-20 mb-8 text-center">
        {state === "idle" && (
          <>
            <h1 className="text-4xl font-bold text-white mb-3">
              Privacy Score
            </h1>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">
              How private is your wallet? Paste an Ethereum address, get a
              0-100 score with breakdown and fixes.
            </p>
          </>
        )}
        {state === "loading" && (
          <h1 className="text-2xl font-bold text-white">
            Analyzing wallet...
          </h1>
        )}
        {state === "results" && (
          <button
            onClick={handleReset}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Scan another address
          </button>
        )}
        {state === "error" && (
          <h1 className="text-2xl font-bold text-white">
            Something went wrong
          </h1>
        )}
      </div>

      {/* Input — always visible except during loading */}
      {state !== "loading" && (
        <ScoreInput onSubmit={handleSubmit} isLoading={false} />
      )}

      {/* Loading state */}
      {state === "loading" && <LoadingProgress />}

      {/* Error state */}
      {state === "error" && (
        <div className="mt-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {state === "results" && result && (
        <div className="w-full max-w-2xl mx-auto pb-20">
          <ScoreDisplay result={result} />

          {/* Category breakdown */}
          <div className="space-y-2 mt-2">
            {result.categories.map((cat) => (
              <CategoryBar key={cat.slug} category={cat} />
            ))}
          </div>

          {/* AI Explanation */}
          <div className="mt-8 p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">
              AI Analysis
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {result.explanation}
            </p>
          </div>

          <RemediationList items={result.remediation} />
          <ShareCard result={result} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto py-6 text-center">
        <p className="text-zinc-600 text-xs">
          Privacy Score analyzes public on-chain data. No wallet connection
          required. No data stored.
        </p>
      </div>
    </main>
  );
}
