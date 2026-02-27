import { CategoryScore, FetchedData, Signal } from "./types";

// Weight: 10%
export function scoreTimingPatterns(data: FetchedData): CategoryScore {
  const signals: Signal[] = [];
  const remediation: string[] = [];
  let score = 100;

  const txs = data.transactions.filter((t) => t.timestamp > 0);
  if (txs.length < 5) {
    return {
      name: "Timing Patterns",
      slug: "timing-patterns",
      score: 90,
      weight: 0.1,
      signals: [
        {
          label: "Insufficient data",
          severity: "low",
          detail: "Not enough transactions to analyze timing patterns.",
        },
      ],
      remediation: [],
    };
  }

  // 1. Hour-of-day distribution — reveals timezone
  const hourCounts = new Array(24).fill(0);
  for (const tx of txs) {
    const hour = new Date(tx.timestamp).getUTCHours();
    hourCounts[hour]++;
  }

  const totalTxs = txs.length;
  const maxHourPct = Math.max(...hourCounts) / totalTxs;
  const activeHours = hourCounts.filter((c) => c > 0).length;

  // Find quiet period (likely sleeping hours = timezone signal)
  let longestQuietStreak = 0;
  let currentStreak = 0;
  // Double the array to handle wraparound
  const doubled = [...hourCounts, ...hourCounts];
  for (const count of doubled) {
    if (count === 0) {
      currentStreak++;
      longestQuietStreak = Math.max(longestQuietStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  // Cap at 24 (can't be more than a full day)
  longestQuietStreak = Math.min(longestQuietStreak, 24);

  if (longestQuietStreak >= 6) {
    score -= 20;
    signals.push({
      label: "Timezone fingerprint",
      severity: "high",
      detail: `${longestQuietStreak}-hour quiet period detected. This reveals your approximate timezone.`,
    });
    remediation.push("Schedule some transactions during your off-hours, or use delayed/scheduled transactions.");
  } else if (longestQuietStreak >= 4) {
    score -= 10;
    signals.push({
      label: "Partial timezone signal",
      severity: "medium",
      detail: `${longestQuietStreak}-hour quiet period suggests a timezone range.`,
    });
  }

  // 2. Day-of-week patterns
  const dayCounts = new Array(7).fill(0);
  for (const tx of txs) {
    const day = new Date(tx.timestamp).getUTCDay();
    dayCounts[day]++;
  }
  const weekdayAvg =
    dayCounts.slice(1, 6).reduce((s, c) => s + c, 0) / 5;
  const weekendAvg = (dayCounts[0] + dayCounts[6]) / 2;

  if (weekdayAvg > 0 && weekendAvg / weekdayAvg < 0.3) {
    score -= 5;
    signals.push({
      label: "Weekday-heavy pattern",
      severity: "low",
      detail: "Significantly more weekday activity. Suggests a work schedule.",
    });
  }

  // 3. Regular intervals — automated/habitual behavior
  const intervals: number[] = [];
  const sorted = txs.sort((a, b) => a.timestamp - b.timestamp);
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i].timestamp - sorted[i - 1].timestamp);
  }

  if (intervals.length > 5) {
    const mean = intervals.reduce((s, i) => s + i, 0) / intervals.length;
    const variance =
      intervals.reduce((s, i) => s + (i - mean) ** 2, 0) / intervals.length;
    const cv = Math.sqrt(variance) / mean; // coefficient of variation

    if (cv < 0.3 && mean < 86400000 * 7) {
      // Low variance, regular pattern
      score -= 15;
      signals.push({
        label: "Regular transaction intervals",
        severity: "high",
        detail: `Transactions occur at predictable intervals (~${formatInterval(mean)}). This is a strong behavioral fingerprint.`,
      });
      remediation.push("Vary your transaction timing. Avoid automated transactions at fixed intervals.");
    } else if (cv < 0.5) {
      score -= 5;
      signals.push({
        label: "Somewhat regular timing",
        severity: "low",
        detail: "Transaction intervals show some regularity.",
      });
    }
  }

  // 4. Activity concentration
  if (maxHourPct > 0.3) {
    score -= 5;
    signals.push({
      label: "Concentrated activity",
      severity: "low",
      detail: `${Math.round(maxHourPct * 100)}% of transactions occur in a single hour of the day.`,
    });
  }

  return {
    name: "Timing Patterns",
    slug: "timing-patterns",
    score: Math.max(0, Math.min(100, score)),
    weight: 0.1,
    signals,
    remediation,
  };
}

function formatInterval(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / 60000)} minutes`;
  if (hours < 48) return `${Math.round(hours)} hours`;
  return `${Math.round(hours / 24)} days`;
}
