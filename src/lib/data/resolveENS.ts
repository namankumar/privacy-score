import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";

function getClient() {
  const key = process.env.ALCHEMY_API_KEY;
  if (!key) throw new Error("ALCHEMY_API_KEY not set");
  return createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${key}`),
  });
}

export async function resolveENS(
  addressOrName: string
): Promise<{ address: string; ensName?: string }> {
  const client = getClient();

  if (isAddress(addressOrName)) {
    const ensName = await client
      .getEnsName({ address: addressOrName as `0x${string}` })
      .catch(() => null);
    return {
      address: addressOrName.toLowerCase(),
      ensName: ensName || undefined,
    };
  }

  if (addressOrName.endsWith(".eth") || addressOrName.includes(".")) {
    const address = await client.getEnsAddress({
      name: addressOrName,
    });
    if (!address) throw new Error(`Could not resolve ENS name: ${addressOrName}`);
    return {
      address: address.toLowerCase(),
      ensName: addressOrName,
    };
  }

  throw new Error("Invalid address or ENS name");
}
