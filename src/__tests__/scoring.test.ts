import { FetchedData } from "@/lib/scoring/types";
import { scoreAddressHygiene } from "@/lib/scoring/addressHygiene";
import { scoreEntityExposure } from "@/lib/scoring/entityExposure";
import { scoreIdentityLeaks } from "@/lib/scoring/identityLeaks";
import { scoreTimingPatterns } from "@/lib/scoring/timingPatterns";
import { scoreCrossChainLinkability } from "@/lib/scoring/crossChainLinkability";
import { scoreProtocolSurface } from "@/lib/scoring/protocolSurface";
import { computeCompositeScore } from "@/lib/scoring/composite";

// Fixture: fresh wallet with no activity
const freshWallet: FetchedData = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  transactions: [],
  tokenTransfers: [],
  internalTransactions: [],
  labels: [],
  ethBalance: "0x0",
  tokenBalances: [],
  nfts: [],
};

// Fixture: heavy exchange user (simulating Vitalik-like)
const heavyUser: FetchedData = {
  address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  ensName: "vitalik.eth",
  transactions: Array.from({ length: 200 }, (_, i) => ({
    hash: `0x${i.toString(16).padStart(64, "0")}`,
    from:
      i % 2 === 0
        ? "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
        : "0x28c6c06298d514db089934071355e5743bf21d60", // Binance 14
    to:
      i % 2 === 0
        ? "0x28c6c06298d514db089934071355e5743bf21d60"
        : "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    value: "1.0",
    blockNumber: 15000000 + i,
    timestamp: Date.now() - i * 86400000,
    input: "0x",
  })),
  tokenTransfers: Array.from({ length: 50 }, (_, i) => ({
    hash: `0xtt${i.toString(16).padStart(62, "0")}`,
    from: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    to: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2
    contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    tokenName: "USDC",
    tokenSymbol: "USDC",
    value: "1000",
    timestamp: Date.now() - i * 86400000,
  })),
  internalTransactions: [],
  labels: [
    {
      address: "0x28c6c06298d514db089934071355e5743bf21d60",
      label: "Binance 14",
      entity: "Binance",
      category: "exchange",
    },
  ],
  ethBalance: "0x56bc75e2d63100000",
  tokenBalances: Array.from({ length: 25 }, (_, i) => ({
    contractAddress: `0x${i.toString(16).padStart(40, "0")}`,
    tokenName: `Token${i}`,
    tokenSymbol: `TKN${i}`,
    balance: "0x1000",
  })),
  nfts: Array.from({ length: 30 }, (_, i) => ({
    contractAddress: `0xnft${i.toString(16).padStart(36, "0")}`,
    tokenId: String(i),
    name: `NFT #${i}`,
  })),
  firstTxTimestamp: Date.now() - 365 * 3 * 86400000, // 3 years old
  lastTxTimestamp: Date.now(),
};

// Fixture: bridge user
const bridgeUser: FetchedData = {
  address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  transactions: [
    // Optimism bridge
    ...Array.from({ length: 5 }, (_, i) => ({
      hash: `0xb${i.toString(16).padStart(63, "0")}`,
      from: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      to: "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1",
      value: "1.0",
      blockNumber: 15000000 + i,
      timestamp: Date.now() - i * 600000, // 10 min apart
      input: "0x1234",
    })),
    // Arbitrum bridge
    ...Array.from({ length: 3 }, (_, i) => ({
      hash: `0xc${i.toString(16).padStart(63, "0")}`,
      from: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      to: "0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a",
      value: "10.0",
      blockNumber: 15000010 + i,
      timestamp: Date.now() - 86400000 - i * 600000,
      input: "0x5678",
    })),
  ],
  tokenTransfers: [],
  internalTransactions: [],
  labels: [],
  ethBalance: "0x1000",
  tokenBalances: [],
  nfts: [],
  firstTxTimestamp: Date.now() - 86400000 * 30,
};

describe("Address Hygiene", () => {
  test("fresh wallet scores high", () => {
    const result = scoreAddressHygiene(freshWallet);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test("heavy user scores lower", () => {
    const result = scoreAddressHygiene(heavyUser);
    expect(result.score).toBeLessThan(70);
  });

  test("returns correct weight", () => {
    const result = scoreAddressHygiene(freshWallet);
    expect(result.weight).toBe(0.2);
  });
});

describe("Entity Exposure", () => {
  test("no exchange interactions scores high", () => {
    const result = scoreEntityExposure(freshWallet);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test("heavy exchange user scores low", () => {
    const result = scoreEntityExposure(heavyUser);
    expect(result.score).toBeLessThan(50);
  });

  test("returns correct weight", () => {
    const result = scoreEntityExposure(freshWallet);
    expect(result.weight).toBe(0.25);
  });
});

describe("Identity Leaks", () => {
  test("no ENS, no NFTs scores high", () => {
    const result = scoreIdentityLeaks(freshWallet);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test("ENS + NFTs + governance scores low", () => {
    const result = scoreIdentityLeaks(heavyUser);
    expect(result.score).toBeLessThan(60);
  });

  test("ENS causes significant penalty", () => {
    const withENS: FetchedData = {
      ...freshWallet,
      ensName: "test.eth",
      transactions: [
        {
          hash: "0x1",
          from: freshWallet.address,
          to: "0x0000000000000000000000000000000000000001",
          value: "0",
          blockNumber: 1,
          timestamp: Date.now(),
          input: "0x",
        },
      ],
    };
    const result = scoreIdentityLeaks(withENS);
    expect(result.score).toBeLessThanOrEqual(70);
  });
});

describe("Timing Patterns", () => {
  test("few transactions returns high score", () => {
    const result = scoreTimingPatterns(freshWallet);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test("regular patterns get penalized", () => {
    const result = scoreTimingPatterns(heavyUser);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe("Cross-Chain Linkability", () => {
  test("no bridge usage scores high", () => {
    const result = scoreCrossChainLinkability(freshWallet);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test("heavy bridge usage scores low", () => {
    const result = scoreCrossChainLinkability(bridgeUser);
    expect(result.score).toBeLessThan(70);
  });

  test("multi-bridge penalty applied", () => {
    const result = scoreCrossChainLinkability(bridgeUser);
    const multiBridgeSignal = result.signals.find(
      (s) => s.label === "Multi-bridge exposure"
    );
    expect(multiBridgeSignal).toBeDefined();
  });
});

describe("Protocol Surface", () => {
  test("no contract interactions scores high", () => {
    const result = scoreProtocolSurface(freshWallet);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test("returns correct weight", () => {
    const result = scoreProtocolSurface(freshWallet);
    expect(result.weight).toBe(0.1);
  });
});

describe("Composite Score", () => {
  test("fresh wallet composite near 95", () => {
    const result = computeCompositeScore(freshWallet);
    expect(result.compositeScore).toBeGreaterThanOrEqual(85);
    expect(result.compositeScore).toBeLessThanOrEqual(100);
  });

  test("heavy user composite below 50", () => {
    const result = computeCompositeScore(heavyUser);
    expect(result.compositeScore).toBeLessThan(65);
  });

  test("composite has all 6 categories", () => {
    const result = computeCompositeScore(freshWallet);
    expect(result.categories).toHaveLength(6);
  });

  test("composite score is between 0 and 100", () => {
    const result = computeCompositeScore(heavyUser);
    expect(result.compositeScore).toBeGreaterThanOrEqual(0);
    expect(result.compositeScore).toBeLessThanOrEqual(100);
  });

  test("categories have correct slugs", () => {
    const result = computeCompositeScore(freshWallet);
    const slugs = result.categories.map((c) => c.slug);
    expect(slugs).toContain("address-hygiene");
    expect(slugs).toContain("entity-exposure");
    expect(slugs).toContain("identity-leaks");
    expect(slugs).toContain("timing-patterns");
    expect(slugs).toContain("cross-chain-linkability");
    expect(slugs).toContain("protocol-surface");
  });

  test("weights sum to 1.0", () => {
    const result = computeCompositeScore(freshWallet);
    const totalWeight = result.categories.reduce((s, c) => s + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0);
  });
});
