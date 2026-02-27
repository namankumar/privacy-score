import { CategoryScore, FetchedData, Signal } from "./types";
import { lookupEntity, isExchange } from "../labels/exchanges";

// Weight: 25%
export function scoreEntityExposure(data: FetchedData): CategoryScore {
  const signals: Signal[] = [];
  const remediation: string[] = [];
  let score = 100;

  const txs = [...data.transactions, ...data.tokenTransfers.map(t => ({
    from: t.from,
    to: t.to,
    hash: t.hash,
    value: t.value,
    timestamp: t.timestamp,
    blockNumber: 0,
    input: "0x",
  }))];

  // 1. Exchange interactions
  const exchangeInteractions = new Map<string, number>();
  let exchangeTxCount = 0;

  for (const tx of txs) {
    for (const addr of [tx.from, tx.to]) {
      if (!addr) continue;
      if (isExchange(addr)) {
        const entity = lookupEntity(addr);
        if (entity) {
          exchangeInteractions.set(
            entity.entity,
            (exchangeInteractions.get(entity.entity) || 0) + 1
          );
          exchangeTxCount++;
        }
      }
    }
  }

  if (exchangeInteractions.size > 0) {
    const entities = Array.from(exchangeInteractions.entries());
    const totalExchangeTxs = entities.reduce((sum, [, count]) => sum + count, 0);

    // Direct exchange deposits/withdrawals = KYC linkage
    if (totalExchangeTxs > 20) {
      score -= 40;
      signals.push({
        label: "Heavy exchange usage",
        severity: "critical",
        detail: `${totalExchangeTxs} transactions with ${entities.map(([e]) => e).join(", ")}. Each is a KYC-linked touchpoint.`,
      });
    } else if (totalExchangeTxs > 5) {
      score -= 25;
      signals.push({
        label: "Moderate exchange exposure",
        severity: "high",
        detail: `${totalExchangeTxs} transactions across ${entities.length} exchange(s).`,
      });
    } else {
      score -= 10;
      signals.push({
        label: "Some exchange exposure",
        severity: "medium",
        detail: `${totalExchangeTxs} exchange transaction(s) detected.`,
      });
    }

    remediation.push("Use intermediary wallets between exchanges and your main wallet. Never deposit/withdraw directly.");

    // Multiple exchanges = wider identity spread
    if (exchangeInteractions.size >= 3) {
      score -= 10;
      signals.push({
        label: "Multi-exchange exposure",
        severity: "high",
        detail: `Activity across ${exchangeInteractions.size} different exchanges. Identity is spread across multiple KYC databases.`,
      });
    }
  }

  // 2. Check labeled counterparties from fetched data
  const labeledEntities = new Set<string>();
  for (const label of data.labels) {
    if (label.entity && label.category !== "contract") {
      labeledEntities.add(label.entity);
    }
  }

  if (labeledEntities.size > 5) {
    score -= 10;
    signals.push({
      label: "Wide entity exposure",
      severity: "medium",
      detail: `Interacted with ${labeledEntities.size} identified entities on-chain.`,
    });
  }

  // 3. Direct deposits to exchange (worst pattern)
  let directDeposits = 0;
  for (const tx of data.transactions) {
    if (
      tx.from.toLowerCase() === data.address.toLowerCase() &&
      isExchange(tx.to)
    ) {
      directDeposits++;
    }
  }

  if (directDeposits > 10) {
    score -= 15;
    signals.push({
      label: "Frequent direct deposits",
      severity: "critical",
      detail: `${directDeposits} direct deposits to exchanges. This is the strongest identity signal on-chain.`,
    });
    remediation.push("Route funds through an intermediary wallet or privacy tool before depositing to an exchange.");
  }

  if (txs.length === 0) {
    score = 95;
    signals.push({
      label: "No entity exposure",
      severity: "low",
      detail: "No transactions with known entities.",
    });
  }

  return {
    name: "Entity Exposure",
    slug: "entity-exposure",
    score: Math.max(0, Math.min(100, score)),
    weight: 0.25,
    signals,
    remediation,
  };
}
