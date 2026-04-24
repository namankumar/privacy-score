# privacy-score

Privacy Score tells you what your wallet reveals — before someone else figures it out. Paste an Ethereum mainnet address, get a privacy score from 0 to 100, a breakdown by category, and a plain-English explanation of what's exposed and how to fix it.

## How it works

Six scoring categories, each computed independently and weighted into a composite score:

| Category | What it checks |
|---|---|
| Address hygiene | Reuse patterns, round-amount sends, change address behavior |
| Entity exposure | Interactions with labeled exchanges, custodians, known entities |
| Identity leaks | ENS names, NFT mints, on-chain governance votes, doxxing events |
| Timing patterns | Predictable transaction timing, timezone inference |
| Cross-chain linkability | Bridge usage that links identities across chains |
| Protocol surface | DeFi interactions, approval patterns, mixer/privacy tool usage |

After scoring, Claude generates a 2-3 paragraph plain-English explanation specific to that wallet: an analysis of what that address's actual behavior reveals.

## Stack

- **Next.js 16:** App Router, API routes
- **viem:** Ethereum data fetching and ENS resolution
- **Anthropic SDK:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) for AI explanation
- **Vercel OG:** shareable score cards
- **Tailwind CSS v4**

## Run locally

```bash
npm install
```

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=your_key
ETHERSCAN_API_KEY=your_key    # free at etherscan.io
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

One-click deploy to Vercel. Set `ANTHROPIC_API_KEY` and `ETHERSCAN_API_KEY` in environment variables.

## Rate limiting

20 scans per IP per 24 hours (in-memory). Swap for Redis in production.

## Tests

```bash
npm test
```

## What's next

Right now scoring is deterministic: fixed data fetches, fixed weights, Claude only writes the explanation. The next version makes Claude the investigator. It gets the address and a set of tools, decides what to look up based on what it finds, and returns a score with reasoning. Adaptive depth instead of a fixed pipeline.

**Chain expansion.** The scoring categories are chain-agnostic; the data layer isn't. EVM chains (Base, Arbitrum, Polygon) are a low-lift extension — swap the Alchemy endpoint and update the known-entity address list. Solana is a larger effort: the data layer (Helius/Solana RPC, SPL token accounts), scoring logic (program ID lookups instead of calldata analysis), and entity database all need Solana-specific implementations.
