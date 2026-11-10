# privacy-score

Paste an Ethereum address or ENS name to see a privacy score, the signals behind it, and an explanation of what those signals mean. This is a prototype for making wallet exposure easier to inspect, not a guarantee of anonymity.

The score follows explicit rules applied to the data returned by its providers. It describes those signals rather than guaranteeing a wallet’s privacy.

## Why this exists

A wallet owner should be able to see what their public activity reveals. This prototype puts the scoring rules and their limits next to the result, rather than treating a number as the whole answer.

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
npm ci
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

## Current limits

The fixed rules only cover the data the providers return. The model writes the explanation; it does not independently investigate the wallet. Other chains and adaptive investigation are not implemented by this pipeline.

Running a scan contacts external providers and may incur charges. Use a public test address first. This documentation edit did not verify live provider responses or rerun the test suite.

## Provenance and reuse

This prototype was developed during work at Provable.
