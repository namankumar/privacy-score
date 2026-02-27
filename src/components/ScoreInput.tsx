"use client";

import { useState } from "react";

interface ScoreInputProps {
  onSubmit: (address: string) => void;
  isLoading: boolean;
}

export function ScoreInput({ onSubmit, isLoading }: ScoreInputProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();

    if (!trimmed) {
      setError("Enter an Ethereum address or ENS name");
      return;
    }

    // Basic validation
    const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    const isENS = trimmed.endsWith(".eth") || trimmed.includes(".");

    if (!isEthAddress && !isENS) {
      setError("Invalid Ethereum address or ENS name");
      return;
    }

    setError("");
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (error) setError("");
          }}
          placeholder="0x... or vitalik.eth"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Scanning..." : "Score"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-400 text-sm">{error}</p>
      )}
    </form>
  );
}
