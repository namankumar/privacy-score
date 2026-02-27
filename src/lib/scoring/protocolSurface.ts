import { CategoryScore, FetchedData, Signal } from "./types";
import { lookupEntity, isPrivacyTool } from "../labels/exchanges";

// Weight: 10%
export function scoreProtocolSurface(data: FetchedData): CategoryScore {
  const signals: Signal[] = [];
  const remediation: string[] = [];
  let score = 100;

  const allTxs = [...data.transactions];

  // 1. Token approvals — each approval expands attack/tracking surface
  // Approximate by counting unique contract interactions
  const contractInteractions = new Set<string>();
  const defiProtocols = new Set<string>();

  for (const tx of allTxs) {
    if (tx.input && tx.input !== "0x" && tx.input.length > 10) {
      contractInteractions.add(tx.to?.toLowerCase());

      const entity = lookupEntity(tx.to);
      if (entity?.category === "defi") {
        defiProtocols.add(entity.entity);
      }
    }
  }

  // Also count token transfer contracts
  for (const tt of data.tokenTransfers) {
    contractInteractions.add(tt.contractAddress.toLowerCase());
  }

  if (contractInteractions.size > 30) {
    score -= 25;
    signals.push({
      label: "Wide protocol surface",
      severity: "high",
      detail: `Interacted with ${contractInteractions.size} contracts. Each is an exposure point.`,
    });
    remediation.push("Consolidate DeFi activity to fewer protocols. Revoke unused approvals at revoke.cash.");
  } else if (contractInteractions.size > 10) {
    score -= 10;
    signals.push({
      label: "Moderate protocol surface",
      severity: "medium",
      detail: `${contractInteractions.size} contract interactions detected.`,
    });
  }

  // 2. DeFi diversity — more protocols = more fingerprint
  if (defiProtocols.size > 5) {
    score -= 10;
    signals.push({
      label: "Diverse DeFi usage",
      severity: "medium",
      detail: `Active across ${defiProtocols.size} DeFi protocols (${Array.from(defiProtocols).join(", ")}).`,
    });
  }

  // 3. Privacy tool usage — positive signal
  let privacyToolUsage = 0;
  for (const tx of allTxs) {
    if (isPrivacyTool(tx.to) || isPrivacyTool(tx.from)) {
      privacyToolUsage++;
    }
  }

  if (privacyToolUsage > 0) {
    score += 15; // Bonus for using privacy tools
    signals.push({
      label: "Privacy tool usage",
      severity: "low",
      detail: `${privacyToolUsage} interaction(s) with privacy protocols. This improves your privacy posture.`,
    });
  }

  // 4. Token approval breadth via token balances
  if (data.tokenBalances.length > 20) {
    score -= 10;
    signals.push({
      label: "Many token approvals likely",
      severity: "medium",
      detail: `${data.tokenBalances.length} different tokens. Each probably has outstanding approvals.`,
    });
    remediation.push("Audit and revoke token approvals periodically.");
  }

  if (allTxs.length === 0) {
    score = 95;
    signals.push({
      label: "No protocol exposure",
      severity: "low",
      detail: "No contract interactions detected.",
    });
  }

  return {
    name: "Protocol Surface",
    slug: "protocol-surface",
    score: Math.max(0, Math.min(100, score)),
    weight: 0.1,
    signals,
    remediation,
  };
}
