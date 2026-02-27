"use client";

import { ScoringResult } from "@/lib/scoring/types";

interface ShareCardProps {
  result: ScoringResult;
}

export function ShareCard({ result }: ShareCardProps) {
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}?address=${result.address}`
    : "";

  const shareText = `My wallet privacy score: ${result.compositeScore}/100\n\nHow private is yours?`;

  const handleShare = () => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 flex gap-3 justify-center">
      <button
        onClick={handleShare}
        className="px-5 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </button>
      <button
        onClick={handleCopyLink}
        className="px-5 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-400 text-sm font-medium rounded-lg transition-colors"
      >
        Copy link
      </button>
    </div>
  );
}
