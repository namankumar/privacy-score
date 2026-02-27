"use client";

import { useState, useEffect } from "react";

const STEPS = [
  "Resolving address",
  "Fetching transactions",
  "Analyzing token transfers",
  "Checking entity exposure",
  "Scanning identity leaks",
  "Analyzing timing patterns",
  "Checking cross-chain links",
  "Computing privacy score",
  "Generating AI explanation",
];

export function LoadingProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              i <= currentStep ? "opacity-100" : "opacity-30"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {i < currentStep ? (
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : i === currentStep ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              )}
            </div>
            <span
              className={`text-sm ${
                i === currentStep
                  ? "text-white font-medium"
                  : i < currentStep
                  ? "text-zinc-400"
                  : "text-zinc-600"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
