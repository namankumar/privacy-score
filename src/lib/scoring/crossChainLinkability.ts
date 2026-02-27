import { CategoryScore, FetchedData, Signal } from "./types";
import { lookupEntity, isBridge } from "../labels/exchanges";

// Weight: 15%
export function scoreCrossChainLinkability(data: FetchedData): CategoryScore {
  const signals: Signal[] = [];
  const remediation: string[] = [];
  let score = 100;

  const allTxs = [...data.transactions];

  // 1. Bridge usage
  const bridgeInteractions = new Map<string, number>();
  let totalBridgeTxs = 0;

  for (const tx of allTxs) {
    for (const addr of [tx.from, tx.to]) {
      if (!addr) continue;
      if (isBridge(addr)) {
        const entity = lookupEntity(addr);
        if (entity) {
          bridgeInteractions.set(
            entity.entity,
            (bridgeInteractions.get(entity.entity) || 0) + 1
          );
          totalBridgeTxs++;
        }
      }
    }
  }

  if (totalBridgeTxs > 0) {
    const bridges = Array.from(bridgeInteractions.keys());

    if (totalBridgeTxs > 10) {
      score -= 35;
      signals.push({
        label: "Heavy bridge usage",
        severity: "critical",
        detail: `${totalBridgeTxs} bridge transactions across ${bridges.join(", ")}. Bridges create strong cross-chain links.`,
      });
    } else if (totalBridgeTxs > 3) {
      score -= 20;
      signals.push({
        label: "Moderate bridge usage",
        severity: "high",
        detail: `${totalBridgeTxs} bridge transaction(s) via ${bridges.join(", ")}.`,
      });
    } else {
      score -= 10;
      signals.push({
        label: "Some bridge usage",
        severity: "medium",
        detail: `${totalBridgeTxs} bridge transaction(s) detected.`,
      });
    }

    remediation.push("Use different source wallets for each bridge destination. Never bridge from your main wallet directly.");

    // Multiple bridges = cross-chain identity graph
    if (bridges.length >= 2) {
      score -= 10;
      signals.push({
        label: "Multi-bridge exposure",
        severity: "high",
        detail: `Used ${bridges.length} different bridges. Each creates independent cross-chain correlation data.`,
      });
    }
  }

  // 2. Amount-based correlation risk
  // Look for round-number transactions that are easy to correlate across chains
  let roundAmountTxs = 0;
  for (const tx of allTxs) {
    const value = parseFloat(tx.value);
    if (value > 0) {
      // Check if it's a round number (e.g., 1.0, 0.5, 10.0)
      const isRound = value === Math.round(value * 2) / 2;
      if (isRound && value >= 0.1) roundAmountTxs++;
    }
  }

  if (roundAmountTxs > 5) {
    score -= 10;
    signals.push({
      label: "Round-number transactions",
      severity: "medium",
      detail: `${roundAmountTxs} transactions with round amounts. These are easily correlated across chains and mixers.`,
    });
    remediation.push("Add random noise to transaction amounts. Never bridge or transfer exact round numbers.");
  }

  // 3. Timing correlation risk for bridge txs
  // If bridge transactions happen close to each other, they're linkable
  const bridgeTxTimestamps: number[] = [];
  for (const tx of allTxs) {
    if (isBridge(tx.to) || isBridge(tx.from)) {
      bridgeTxTimestamps.push(tx.timestamp);
    }
  }

  if (bridgeTxTimestamps.length >= 2) {
    bridgeTxTimestamps.sort((a, b) => a - b);
    let closePairs = 0;
    for (let i = 1; i < bridgeTxTimestamps.length; i++) {
      if (bridgeTxTimestamps[i] - bridgeTxTimestamps[i - 1] < 600000) {
        // Within 10 minutes
        closePairs++;
      }
    }

    if (closePairs > 0) {
      score -= 10;
      signals.push({
        label: "Rapid bridge sequences",
        severity: "high",
        detail: `${closePairs} bridge transaction pair(s) within 10 minutes. Timing makes cross-chain linking trivial.`,
      });
      remediation.push("Add time delays between bridge transactions. Wait hours or days, not minutes.");
    }
  }

  if (allTxs.length === 0) {
    score = 95;
    signals.push({
      label: "No cross-chain activity",
      severity: "low",
      detail: "No bridge or cross-chain transactions detected.",
    });
  }

  return {
    name: "Cross-Chain Linkability",
    slug: "cross-chain-linkability",
    score: Math.max(0, Math.min(100, score)),
    weight: 0.15,
    signals,
    remediation,
  };
}
