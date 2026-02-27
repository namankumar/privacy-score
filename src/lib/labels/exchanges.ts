export const KNOWN_ENTITIES: Record<
  string,
  { label: string; entity: string; category: string }
> = {
  // Coinbase
  "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": { label: "Coinbase 1", entity: "Coinbase", category: "exchange" },
  "0x503828976d22510aad0201ac7ec88293211d23da": { label: "Coinbase 2", entity: "Coinbase", category: "exchange" },
  "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740": { label: "Coinbase 3", entity: "Coinbase", category: "exchange" },
  "0x3cd751e6b0078be393132286c442345e68ff0aaa": { label: "Coinbase 4", entity: "Coinbase", category: "exchange" },
  "0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511": { label: "Coinbase 5", entity: "Coinbase", category: "exchange" },
  "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43": { label: "Coinbase Commerce", entity: "Coinbase", category: "exchange" },

  // Binance
  "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": { label: "Binance 1", entity: "Binance", category: "exchange" },
  "0xd551234ae421e3bcba99a0da6d736074f22192ff": { label: "Binance 2", entity: "Binance", category: "exchange" },
  "0x564286362092d8e7936f0549571a803b203aaced": { label: "Binance 3", entity: "Binance", category: "exchange" },
  "0x0681d8db095565fe8a346fa0277bffde9c0edbbf": { label: "Binance 4", entity: "Binance", category: "exchange" },
  "0xfe9e8709d3215310075d67e3ed32a380ccf451c8": { label: "Binance 5", entity: "Binance", category: "exchange" },
  "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67": { label: "Binance 6", entity: "Binance", category: "exchange" },
  "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": { label: "Binance 7", entity: "Binance", category: "exchange" },
  "0xf977814e90da44bfa03b6295a0616a897441acec": { label: "Binance 8", entity: "Binance", category: "exchange" },
  "0x28c6c06298d514db089934071355e5743bf21d60": { label: "Binance 14", entity: "Binance", category: "exchange" },

  // Kraken
  "0x2910543af39aba0cd09dbb2d50200b3e800a63d2": { label: "Kraken", entity: "Kraken", category: "exchange" },
  "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13": { label: "Kraken 2", entity: "Kraken", category: "exchange" },

  // FTX (historical)
  "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2": { label: "FTX", entity: "FTX", category: "exchange" },

  // Gemini
  "0xd24400ae8bfebb18ca49be86258a3c749cf46853": { label: "Gemini", entity: "Gemini", category: "exchange" },
  "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8": { label: "Gemini 2", entity: "Gemini", category: "exchange" },

  // Privacy tools
  "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b": { label: "Tornado Cash Router", entity: "Tornado Cash", category: "privacy" },
  "0x722122df12d4e14e13ac3b6895a86e84145b6967": { label: "Tornado Cash Proxy", entity: "Tornado Cash", category: "privacy" },
  "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc": { label: "Tornado Cash 0.1 ETH", entity: "Tornado Cash", category: "privacy" },
  "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936": { label: "Tornado Cash 1 ETH", entity: "Tornado Cash", category: "privacy" },
  "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf": { label: "Tornado Cash 10 ETH", entity: "Tornado Cash", category: "privacy" },
  "0xa160cdab225685da1d56aa342ad8841c3b53f291": { label: "Tornado Cash 100 ETH", entity: "Tornado Cash", category: "privacy" },

  // Railgun
  "0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9": { label: "Railgun Router", entity: "Railgun", category: "privacy" },

  // Bridges
  "0x3ee18b2214aff97000d974cf647e7c347e8fa585": { label: "Wormhole", entity: "Wormhole", category: "bridge" },
  "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1": { label: "Optimism Bridge", entity: "Optimism", category: "bridge" },
  "0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a": { label: "Arbitrum Bridge", entity: "Arbitrum", category: "bridge" },
  "0x49048044d57e1c92a77f79988d21fa8faf74e97e": { label: "Base Bridge", entity: "Base", category: "bridge" },
  "0x2796317b0ff8538f253012862c06787adfb8ceb6": { label: "Synapse Bridge", entity: "Synapse", category: "bridge" },
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae": { label: "LI.FI Diamond", entity: "LI.FI", category: "bridge" },

  // Major DeFi
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": { label: "Uniswap V2 Router", entity: "Uniswap", category: "defi" },
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": { label: "Uniswap V3 Router", entity: "Uniswap", category: "defi" },
  "0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b": { label: "Uniswap Universal Router", entity: "Uniswap", category: "defi" },
  "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f": { label: "SushiSwap Router", entity: "SushiSwap", category: "defi" },
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff": { label: "0x Exchange Proxy", entity: "0x", category: "defi" },
  "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": { label: "Aave V2 Pool", entity: "Aave", category: "defi" },
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": { label: "Aave V3 Pool", entity: "Aave", category: "defi" },
  "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": { label: "Compound cETH", entity: "Compound", category: "defi" },

  // Governance
  "0x408ed6354d4973f66138c91495f2f2fcbd8724c3": { label: "Uniswap Governor", entity: "Uniswap", category: "governance" },
  "0xec568fffba86c094cf06b22134b23074dfe2252c": { label: "ENS Governor", entity: "ENS", category: "governance" },
};

export function lookupEntity(address: string): {
  label: string;
  entity: string;
  category: string;
} | null {
  return KNOWN_ENTITIES[address.toLowerCase()] || null;
}

export function isExchange(address: string): boolean {
  const entity = lookupEntity(address);
  return entity?.category === "exchange";
}

export function isPrivacyTool(address: string): boolean {
  const entity = lookupEntity(address);
  return entity?.category === "privacy";
}

export function isBridge(address: string): boolean {
  const entity = lookupEntity(address);
  return entity?.category === "bridge";
}
