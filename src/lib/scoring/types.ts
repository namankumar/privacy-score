export interface Signal {
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  detail: string;
}

export interface CategoryScore {
  name: string;
  slug: string;
  score: number; // 0-100, higher = more private
  weight: number;
  signals: Signal[];
  remediation: string[];
}

export interface ScoringResult {
  address: string;
  ensName?: string;
  compositeScore: number;
  categories: CategoryScore[];
  explanation: string;
  remediation: string[];
  timestamp: number;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  input: string;
  isError?: boolean;
  methodId?: string;
}

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  value: string;
  timestamp: number;
}

export interface InternalTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: string;
}

export interface AddressLabel {
  address: string;
  label: string;
  entity?: string;
  category?: string;
}

export interface FetchedData {
  address: string;
  ensName?: string;
  transactions: TransactionData[];
  tokenTransfers: TokenTransfer[];
  internalTransactions: InternalTransaction[];
  labels: AddressLabel[];
  ethBalance: string;
  tokenBalances: Array<{
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    balance: string;
  }>;
  nfts: Array<{
    contractAddress: string;
    tokenId: string;
    name?: string;
  }>;
  firstTxTimestamp?: number;
  lastTxTimestamp?: number;
}
