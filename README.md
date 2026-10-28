# privacy-score

Privacy Score is an Ethereum-mainnet prototype for inspecting on-chain signals associated with a wallet address. Paste an address or ENS name to get a 0–100 heuristic score, a category breakdown, and a plain-English explanation of the signals the scorer found.

The score follows explicit rules applied to the data returned by its providers. It describes those signals rather than guaranteeing a wallet’s privacy.

## Why this exists

Much blockchain analytics work is optimized for investigation. This prototype explores the inverse: giving a wallet owner a transparent view of a defined set of on-chain signals and the rules used to score them.

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

The score is computed before model use. Claude then turns the scoring output into a 2–3 paragraph explanation; it does not choose the score or inspect additional chain data.

### Coverage and limits

- Ethereum mainnet only.
- The data layer requests a bounded history: up to 500 inbound and 500 outbound external transfers, 200 inbound and 200 outbound ERC-20 transfers, 100 internal transfers, 50 NFTs, and metadata for up to 20 non-zero token balances.
- Entity labeling combines a small static list with Etherscan contract-source lookups for up to 30 counterparties. An unrecognized address is not evidence that it is unrelated or private.
- Results depend on Alchemy and Etherscan responses. Missing, delayed, or provider-specific data can change the output.

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
ALCHEMY_API_KEY=your_key
ETHERSCAN_API_KEY=your_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The credentials are used by server-side route handlers. Do not expose them in browser code or commit `.env.local`.

## Deploy

Deploy to a Next.js-compatible host. Set `ANTHROPIC_API_KEY`, `ALCHEMY_API_KEY`, and `ETHERSCAN_API_KEY` as server-side environment variables.

## Rate limiting

The route uses a process-local limit of 20 scans per IP per 24 hours. It is not a shared or durable limit, so it can reset across instances or deployments. Use a shared store before treating it as production rate limiting.

## Tests

```bash
npm test
```

## What's next

Right now scoring is deterministic: fixed data fetches, fixed weights, Claude only writes the explanation. The next version makes Claude the investigator. It gets the address and a set of tools, decides what to look up based on what it finds, and returns a score with reasoning. Adaptive depth instead of a fixed pipeline.

**Chain expansion.** The scoring categories are chain-agnostic; the data layer isn't. EVM chains (Base, Arbitrum, Polygon) are a low-lift extension — swap the Alchemy endpoint and update the known-entity address list. Solana is a larger effort: the data layer (Helius/Solana RPC, SPL token accounts), scoring logic (program ID lookups instead of calldata analysis), and entity database all need Solana-specific implementations.

## Provenance and reuse

This prototype was developed during work at Provable.
