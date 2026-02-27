import { CategoryScore, FetchedData, Signal } from "./types";
import { lookupEntity } from "../labels/exchanges";

// Weight: 20%
export function scoreIdentityLeaks(data: FetchedData): CategoryScore {
  const signals: Signal[] = [];
  const remediation: string[] = [];
  let score = 100;

  // 1. ENS ownership — publicly links a human-readable name to the address
  if (data.ensName) {
    score -= 30;
    signals.push({
      label: "ENS name registered",
      severity: "critical",
      detail: `${data.ensName} resolves to this address. Anyone can look it up.`,
    });
    remediation.push("Use a separate wallet for ENS. Never register ENS on a wallet you want private.");
  }

  // 2. NFT holdings — minting is a public, often social action
  if (data.nfts.length > 0) {
    if (data.nfts.length > 20) {
      score -= 20;
      signals.push({
        label: "Large NFT collection",
        severity: "high",
        detail: `${data.nfts.length} NFTs. Collections create a unique fingerprint and are often tied to social identity.`,
      });
    } else if (data.nfts.length > 5) {
      score -= 10;
      signals.push({
        label: "NFT holdings",
        severity: "medium",
        detail: `${data.nfts.length} NFTs held. Each mint is a public action that narrows identity.`,
      });
    } else {
      score -= 5;
      signals.push({
        label: "Few NFTs",
        severity: "low",
        detail: `${data.nfts.length} NFT(s) held.`,
      });
    }
    remediation.push("Mint and hold NFTs in a separate public wallet. Don't cross-fund from private wallets.");
  }

  // 3. Governance votes — extremely identifying
  let governanceInteractions = 0;
  for (const tx of data.transactions) {
    const entity = lookupEntity(tx.to);
    if (entity?.category === "governance") {
      governanceInteractions++;
    }
  }

  if (governanceInteractions > 0) {
    score -= 20;
    signals.push({
      label: "Governance participation",
      severity: "high",
      detail: `${governanceInteractions} governance transaction(s). Votes are public and often discussed on forums with real identities.`,
    });
    remediation.push("Use a dedicated governance wallet. Delegate voting power if possible.");
  }

  // 4. Token diversity as fingerprint
  if (data.tokenBalances.length > 15) {
    score -= 10;
    signals.push({
      label: "Diverse token portfolio",
      severity: "medium",
      detail: `${data.tokenBalances.length} different tokens. Unique portfolio composition acts as a fingerprint.`,
    });
  } else if (data.tokenBalances.length > 5) {
    score -= 5;
    signals.push({
      label: "Some token diversity",
      severity: "low",
      detail: `${data.tokenBalances.length} different tokens held.`,
    });
  }

  if (data.transactions.length === 0 && !data.ensName && data.nfts.length === 0) {
    score = 95;
    signals.push({
      label: "No identity leaks",
      severity: "low",
      detail: "No ENS, NFTs, or governance activity detected.",
    });
  }

  return {
    name: "Identity Leaks",
    slug: "identity-leaks",
    score: Math.max(0, Math.min(100, score)),
    weight: 0.2,
    signals,
    remediation,
  };
}
