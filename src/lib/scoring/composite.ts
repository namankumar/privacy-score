import { CategoryScore, FetchedData, ScoringResult } from "./types";
import { scoreAddressHygiene } from "./addressHygiene";
import { scoreEntityExposure } from "./entityExposure";
import { scoreIdentityLeaks } from "./identityLeaks";
import { scoreTimingPatterns } from "./timingPatterns";
import { scoreCrossChainLinkability } from "./crossChainLinkability";
import { scoreProtocolSurface } from "./protocolSurface";

export function computeCompositeScore(data: FetchedData): Omit<ScoringResult, "explanation"> {
  const categories: CategoryScore[] = [
    scoreAddressHygiene(data),
    scoreEntityExposure(data),
    scoreIdentityLeaks(data),
    scoreTimingPatterns(data),
    scoreCrossChainLinkability(data),
    scoreProtocolSurface(data),
  ];

  // Weighted average
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = categories.reduce(
    (sum, c) => sum + c.score * c.weight,
    0
  );
  const compositeScore = Math.round(
    Math.max(0, Math.min(100, weightedSum / totalWeight))
  );

  // Aggregate remediation (deduplicated)
  const allRemediation = new Set<string>();
  for (const cat of categories) {
    for (const r of cat.remediation) {
      allRemediation.add(r);
    }
  }

  return {
    address: data.address,
    ensName: data.ensName,
    compositeScore,
    categories,
    remediation: Array.from(allRemediation),
    timestamp: Date.now(),
  };
}
