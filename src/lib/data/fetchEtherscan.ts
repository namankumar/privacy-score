import { AddressLabel } from "../scoring/types";

const ETHERSCAN_BASE = "https://api.etherscan.io/api";

function getApiKey(): string {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) throw new Error("ETHERSCAN_API_KEY not set");
  return key;
}

async function etherscanGet(
  params: Record<string, string>
): Promise<unknown> {
  const url = new URL(ETHERSCAN_BASE);
  url.searchParams.set("apikey", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  return json;
}

export async function fetchAddressLabels(
  counterparties: string[]
): Promise<AddressLabel[]> {
  // Etherscan doesn't have a bulk label API, so we check against known labels
  // and use the contract verification endpoint for contract addresses
  const labels: AddressLabel[] = [];

  // Check first 30 unique addresses for contract verification
  const unique = [...new Set(counterparties)].slice(0, 30);

  await Promise.all(
    unique.map(async (addr) => {
      try {
        const result = (await etherscanGet({
          module: "contract",
          action: "getsourcecode",
          address: addr,
        })) as {
          result: Array<{ ContractName: string; ABI: string }>;
        };

        if (
          result.result?.[0]?.ContractName &&
          result.result[0].ABI !== "Contract source code not verified"
        ) {
          labels.push({
            address: addr.toLowerCase(),
            label: result.result[0].ContractName,
            category: "contract",
          });
        }
      } catch {
        // Skip failures
      }
    })
  );

  return labels;
}

export async function fetchContractVerification(
  address: string
): Promise<boolean> {
  const result = (await etherscanGet({
    module: "contract",
    action: "getsourcecode",
    address,
  })) as {
    result: Array<{ ABI: string }>;
  };

  return (
    result.result?.[0]?.ABI !== "Contract source code not verified" &&
    result.result?.[0]?.ABI !== ""
  );
}

export async function fetchAccountTxCount(
  address: string
): Promise<number> {
  const result = (await etherscanGet({
    module: "proxy",
    action: "eth_getTransactionCount",
    address,
    tag: "latest",
  })) as { result: string };

  return parseInt(result.result, 16);
}
