import { encodeFunctionData, parseEther } from "viem";

const MINT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "quantity", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const MINT_PRICE_ETH = "0.001";
export const MAX_PER_TX = 10;
export const TOTAL_SUPPLY = 3333;

export const CONTRACT_ADDRESS = (
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ??
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export function isContractConfigured(): boolean {
  return (
    CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" &&
    /^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS)
  );
}

export function basescanAddressUrl(addr: string): string {
  return `https://basescan.org/address/${addr}`;
}

export function basescanTxUrl(hash: string): string {
  return `https://basescan.org/tx/${hash}`;
}

export async function mint(
  from: `0x${string}`,
  quantity: number
): Promise<`0x${string}`> {
  if (!window.ethereum) throw new Error("No wallet detected");
  if (!isContractConfigured()) {
    throw new Error(
      "Genesis hatch box drop hasn't gone live yet — contract will be revealed at launch."
    );
  }
  const data = encodeFunctionData({
    abi: MINT_ABI,
    functionName: "mint",
    args: [BigInt(quantity)],
  });
  const value = parseEther(MINT_PRICE_ETH) * BigInt(quantity);
  const hash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: CONTRACT_ADDRESS,
        value: "0x" + value.toString(16),
        data,
      },
    ],
  })) as `0x${string}`;
  return hash;
}

export function totalEthForQuantity(qty: number): string {
  const value = parseEther(MINT_PRICE_ETH) * BigInt(qty);
  const whole = value / 10n ** 18n;
  const frac = value % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : `${whole}`;
}
