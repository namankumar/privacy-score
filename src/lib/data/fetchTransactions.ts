import {
  TransactionData,
  TokenTransfer,
  InternalTransaction,
} from "../scoring/types";

const ALCHEMY_BASE = "https://eth-mainnet.g.alchemy.com/v2";

function getAlchemyUrl(): string {
  const key = process.env.ALCHEMY_API_KEY;
  if (!key) throw new Error("ALCHEMY_API_KEY not set");
  return `${ALCHEMY_BASE}/${key}`;
}

async function alchemyRpc(method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(getAlchemyUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`Alchemy error: ${json.error.message}`);
  return json.result;
}

export async function fetchTransactionHistory(
  address: string
): Promise<TransactionData[]> {
  const result = (await alchemyRpc("alchemy_getAssetTransfers", [
    {
      fromAddress: address,
      category: ["external"],
      order: "desc",
      maxCount: "0x1F4", // 500
      withMetadata: true,
    },
  ])) as { transfers: Array<Record<string, unknown>> };

  const outbound = (result?.transfers || []).map(mapAlchemyTransfer);

  const inboundResult = (await alchemyRpc("alchemy_getAssetTransfers", [
    {
      toAddress: address,
      category: ["external"],
      order: "desc",
      maxCount: "0x1F4",
      withMetadata: true,
    },
  ])) as { transfers: Array<Record<string, unknown>> };

  const inbound = (inboundResult?.transfers || []).map(mapAlchemyTransfer);

  return [...outbound, ...inbound].sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

export async function fetchTokenTransfers(
  address: string
): Promise<TokenTransfer[]> {
  const result = (await alchemyRpc("alchemy_getAssetTransfers", [
    {
      fromAddress: address,
      category: ["erc20"],
      order: "desc",
      maxCount: "0xC8", // 200
      withMetadata: true,
    },
  ])) as { transfers: Array<Record<string, unknown>> };

  const outbound = (result?.transfers || []).map(mapAlchemyTokenTransfer);

  const inboundResult = (await alchemyRpc("alchemy_getAssetTransfers", [
    {
      toAddress: address,
      category: ["erc20"],
      order: "desc",
      maxCount: "0xC8",
      withMetadata: true,
    },
  ])) as { transfers: Array<Record<string, unknown>> };

  const inbound = (inboundResult?.transfers || []).map(
    mapAlchemyTokenTransfer
  );

  return [...outbound, ...inbound].sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

export async function fetchInternalTransactions(
  address: string
): Promise<InternalTransaction[]> {
  const result = (await alchemyRpc("alchemy_getAssetTransfers", [
    {
      fromAddress: address,
      category: ["internal"],
      order: "desc",
      maxCount: "0x64", // 100
      withMetadata: true,
    },
  ])) as { transfers: Array<Record<string, unknown>> };

  return (result?.transfers || []).map((t: Record<string, unknown>) => ({
    hash: t.hash as string,
    from: (t.from as string).toLowerCase(),
    to: ((t.to as string) || "").toLowerCase(),
    value: String(t.value || "0"),
    timestamp: new Date(
      (t.metadata as Record<string, string>)?.blockTimestamp || 0
    ).getTime(),
    type: "internal",
  }));
}

export async function fetchEthBalance(address: string): Promise<string> {
  const result = (await alchemyRpc("eth_getBalance", [
    address,
    "latest",
  ])) as string;
  return result;
}

export async function fetchTokenBalances(
  address: string
): Promise<
  Array<{
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    balance: string;
  }>
> {
  const result = (await alchemyRpc("alchemy_getTokenBalances", [
    address,
  ])) as {
    tokenBalances: Array<{
      contractAddress: string;
      tokenBalance: string;
    }>;
  };

  const nonZero = (result?.tokenBalances || []).filter(
    (t) => t.tokenBalance !== "0x0" && t.tokenBalance !== "0x"
  );

  // Get metadata for tokens with balances (limit to first 20)
  const tokens = await Promise.all(
    nonZero.slice(0, 20).map(async (t) => {
      try {
        const meta = (await alchemyRpc("alchemy_getTokenMetadata", [
          t.contractAddress,
        ])) as { name: string; symbol: string };
        return {
          contractAddress: t.contractAddress.toLowerCase(),
          tokenName: meta?.name || "Unknown",
          tokenSymbol: meta?.symbol || "???",
          balance: t.tokenBalance,
        };
      } catch {
        return {
          contractAddress: t.contractAddress.toLowerCase(),
          tokenName: "Unknown",
          tokenSymbol: "???",
          balance: t.tokenBalance,
        };
      }
    })
  );

  return tokens;
}

export async function fetchNFTs(
  address: string
): Promise<Array<{ contractAddress: string; tokenId: string; name?: string }>> {
  const result = (await alchemyRpc("alchemy_getNFTs" as string, [
    { owner: address, pageSize: 50 },
  ])) as { ownedNfts: Array<Record<string, unknown>> };

  return (result?.ownedNfts || []).map((nft: Record<string, unknown>) => ({
    contractAddress: ((nft.contract as Record<string, string>)?.address || "").toLowerCase(),
    tokenId: (nft.id as Record<string, string>)?.tokenId || "0",
    name: (nft.title as string) || undefined,
  }));
}

function mapAlchemyTransfer(t: Record<string, unknown>): TransactionData {
  return {
    hash: t.hash as string,
    from: (t.from as string).toLowerCase(),
    to: ((t.to as string) || "").toLowerCase(),
    value: String(t.value || "0"),
    blockNumber: parseInt(t.blockNum as string, 16),
    timestamp: new Date(
      (t.metadata as Record<string, string>)?.blockTimestamp || 0
    ).getTime(),
    input: "0x",
  };
}

function mapAlchemyTokenTransfer(
  t: Record<string, unknown>
): TokenTransfer {
  return {
    hash: t.hash as string,
    from: (t.from as string).toLowerCase(),
    to: ((t.to as string) || "").toLowerCase(),
    contractAddress: ((t.rawContract as Record<string, string>)?.address || "").toLowerCase(),
    tokenName: (t.asset as string) || "Unknown",
    tokenSymbol: (t.asset as string) || "???",
    value: String(t.value || "0"),
    timestamp: new Date(
      (t.metadata as Record<string, string>)?.blockTimestamp || 0
    ).getTime(),
  };
}
