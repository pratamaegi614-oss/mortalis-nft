import { useCallback, useEffect, useState } from "react";

export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_HEX = "0x2105";

type Eip1193Provider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export type WalletState = {
  address: `0x${string}` | null;
  chainId: number | null;
  connecting: boolean;
  switching: boolean;
  error: string | null;
};

export function shortAddress(addr: string | null | undefined): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    connecting: false,
    switching: false,
    error: null,
  });

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;

    let cancelled = false;

    (async () => {
      try {
        const accs = (await eth.request({ method: "eth_accounts" })) as string[];
        if (cancelled) return;
        if (accs.length > 0) {
          const cid = (await eth.request({ method: "eth_chainId" })) as string;
          if (cancelled) return;
          setState((s) => ({
            ...s,
            address: accs[0] as `0x${string}`,
            chainId: parseInt(cid, 16),
          }));
        }
      } catch {
        /* noop */
      }
    })();

    const onAccounts = (...args: unknown[]) => {
      const accs = args[0] as string[];
      setState((s) => ({
        ...s,
        address: (accs[0] as `0x${string}`) ?? null,
      }));
    };
    const onChain = (...args: unknown[]) => {
      const cid = args[0] as string;
      setState((s) => ({ ...s, chainId: parseInt(cid, 16) }));
    };

    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      cancelled = true;
      eth.removeListener("accountsChanged", onAccounts);
      eth.removeListener("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((s) => ({
        ...s,
        error:
          "No wallet detected. Install MetaMask or another EIP-1193 wallet to continue.",
      }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accs = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const cid = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;
      setState({
        address: (accs[0] as `0x${string}`) ?? null,
        chainId: parseInt(cid, 16),
        connecting: false,
        switching: false,
        error: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connect failed";
      setState((s) => ({ ...s, connecting: false, error: msg }));
    }
  }, []);

  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;
    setState((s) => ({ ...s, switching: true, error: null }));
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_HEX }],
      });
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err.code === 4902 || err.code === -32603) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_CHAIN_HEX,
                chainName: "Base",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } catch (addErr) {
          const msg =
            addErr instanceof Error ? addErr.message : "Failed to add Base network";
          setState((s) => ({ ...s, switching: false, error: msg }));
          return;
        }
      } else {
        const msg = e instanceof Error ? e.message : "Failed to switch network";
        setState((s) => ({ ...s, switching: false, error: msg }));
        return;
      }
    }
    setState((s) => ({ ...s, switching: false }));
  }, []);

  return { ...state, connect, switchToBase };
}
