import { CategoryScore, FetchedData, Signal } from "./types";

// Weight: 20%
export function scoreAddressHygiene(data: FetchedData): CategoryScore {
  const signals: Signal[] = [];
  const remediation: string[] = [];
  let score = 100;

  const txs = data.transactions;

  // 1. Wallet age — older wallets have more exposure surface
  if (data.firstTxTimestamp) {
    const ageMonths =
      (Date.now() - data.firstTxTimestamp) / (1000 * 60 * 60 * 24 * 30);
    if (ageMonths > 36) {
      score -= 15;
      signals.push({
        label: "Old wallet",
        severity: "medium",
        detail: `Wallet is ${Math.round(ageMonths)} months old. Longer history = more linkable data.`,
      });
      remediation.push("Rotate to a fresh wallet for new activity. Keep this one for legacy positions only.");
    } else if (ageMonths > 12) {
      score -= 5;
      signals.push({
        label: "Moderate age",
        severity: "low",
        detail: `Wallet is ${Math.round(ageMonths)} months old.`,
      });
    }
  }

  // 2. Address reuse — how many unique counterparties vs total txs
  if (txs.length > 0) {
    const counterparties = new Set<string>();
    for (const tx of txs) {
      if (tx.from.toLowerCase() !== data.address.toLowerCase()) counterparties.add(tx.from.toLowerCase());
      if (tx.to && tx.to.toLowerCase() !== data.address.toLowerCase()) counterparties.add(tx.to.toLowerCase());
    }

    const reuseRatio = txs.length / Math.max(counterparties.size, 1);
    if (reuseRatio > 5) {
      score -= 20;
      signals.push({
        label: "Heavy address reuse",
        severity: "high",
        detail: `${txs.length} transactions with only ${counterparties.size} unique counterparties. Repeated interactions make linking trivial.`,
      });
      remediation.push("Use intermediary wallets for repeated interactions with the same address.");
    } else if (reuseRatio > 2.5) {
      score -= 10;
      signals.push({
        label: "Moderate address reuse",
        severity: "medium",
        detail: `Reuse ratio of ${reuseRatio.toFixed(1)}x across ${counterparties.size} counterparties.`,
      });
    }

    // 3. Single-address dominance
    const counterpartyCounts: Record<string, number> = {};
    for (const tx of txs) {
      const other =
        tx.from.toLowerCase() === data.address.toLowerCase()
          ? tx.to.toLowerCase()
          : tx.from.toLowerCase();
      if (other) counterpartyCounts[other] = (counterpartyCounts[other] || 0) + 1;
    }

    const sorted = Object.entries(counterpartyCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topRatio = sorted[0][1] / txs.length;
      if (topRatio > 0.4) {
        score -= 10;
        signals.push({
          label: "Dominant counterparty",
          severity: "medium",
          detail: `${Math.round(topRatio * 100)}% of transactions involve a single address.`,
        });
      }
    }
  } else {
    // No transactions — fresh wallet, very private
    score = 95;
    signals.push({
      label: "No transaction history",
      severity: "low",
      detail: "Fresh wallet with no on-chain footprint.",
    });
  }

  // 4. Transaction volume — more txs = more data points
  if (txs.length > 500) {
    score -= 15;
    signals.push({
      label: "High transaction volume",
      severity: "high",
      detail: `${txs.length} transactions create a rich pattern for chain analysis.`,
    });
    remediation.push("Spread activity across multiple wallets to reduce per-address signal density.");
  } else if (txs.length > 100) {
    score -= 5;
    signals.push({
      label: "Moderate transaction volume",
      severity: "low",
      detail: `${txs.length} transactions on record.`,
    });
  }

  return {
    name: "Address Hygiene",
    slug: "address-hygiene",
    score: Math.max(0, Math.min(100, score)),
    weight: 0.2,
    signals,
    remediation,
  };
}
