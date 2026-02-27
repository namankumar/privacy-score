import {
  fetchTransactionHistory,
  fetchTokenTransfers,
  fetchInternalTransactions,
  fetchEthBalance,
  fetchTokenBalances,
  fetchNFTs,
} from "./fetchTransactions";
import { fetchAddressLabels } from "./fetchEtherscan";
import { resolveENS } from "./resolveENS";
import { lookupEntity } from "../labels/exchanges";
import { FetchedData, AddressLabel } from "../scoring/types";

export async function fetchAllData(input: string): Promise<FetchedData> {
  // Resolve address/ENS
  const { address, ensName } = await resolveENS(input);

  // Fetch everything in parallel
  const [transactions, tokenTransfers, internalTransactions, ethBalance, tokenBalances, nfts] =
    await Promise.all([
      fetchTransactionHistory(address),
      fetchTokenTransfers(address),
      fetchInternalTransactions(address),
      fetchEthBalance(address),
      fetchTokenBalances(address),
      fetchNFTs(address).catch(() => []),
    ]);

  // Collect unique counterparties for label lookup
  const counterparties = new Set<string>();
  for (const tx of transactions) {
    if (tx.to) counterparties.add(tx.to);
    counterparties.add(tx.from);
  }

  // Merge static labels with Etherscan labels
  const labels: AddressLabel[] = [];
  for (const addr of counterparties) {
    const staticLabel = lookupEntity(addr);
    if (staticLabel) {
      labels.push({ address: addr, ...staticLabel });
    }
  }

  // Fetch Etherscan labels for unlabeled addresses (top 30)
  const unlabeled = Array.from(counterparties).filter(
    (a) => !lookupEntity(a)
  );
  const etherscanLabels = await fetchAddressLabels(unlabeled).catch(() => []);
  labels.push(...etherscanLabels);

  // Compute first/last tx timestamps
  const allTimestamps = transactions
    .map((t) => t.timestamp)
    .filter((t) => t > 0);
  const firstTxTimestamp = allTimestamps.length
    ? Math.min(...allTimestamps)
    : undefined;
  const lastTxTimestamp = allTimestamps.length
    ? Math.max(...allTimestamps)
    : undefined;

  return {
    address,
    ensName,
    transactions,
    tokenTransfers,
    internalTransactions,
    labels,
    ethBalance,
    tokenBalances,
    nfts,
    firstTxTimestamp,
    lastTxTimestamp,
  };
}
