import { useCallback, useEffect, useState } from "react";

export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_HEX = "0x2105";

type Eip1193Provider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    okxwallet?: Eip1193Provider;
    coinbaseWalletExtension?: Eip1193Provider;
    trustwallet?: Eip1193Provider;
    rabby?: Eip1193Provider;
  }
}

export type WalletState = {
  address: `0x${string}` | null;
  chainId: number | null;
  connecting: boolean;
  switching: boolean;
  error: string | null;
  availableWallets: string[];
};

export function shortAddress(addr: string | null | undefined): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Detect all available wallets
function detectWallets(): { name: string; provider: Eip1193Provider }[] {
  const wallets: { name: string; provider: Eip1193Provider }[] = [];

  // MetaMask
  if (window.ethereum?.isMetaMask) {
    wallets.push({ name: "MetaMask", provider: window.ethereum });
  }

  // OKX Wallet
  if (window.okxwallet) {
    wallets.push({ name: "OKX Wallet", provider: window.okxwallet });
  }

  // Coinbase Wallet
  if (window.coinbaseWalletExtension) {
    wallets.push({ name: "Coinbase Wallet", provider: window.coinbaseWalletExtension });
  } else if (window.ethereum?.isCoinbaseWallet) {
    wallets.push({ name: "Coinbase Wallet", provider: window.ethereum });
  }

  // Trust Wallet
  if (window.trustwallet) {
    wallets.push({ name: "Trust Wallet", provider: window.trustwallet });
  } else if (window.ethereum?.isTrust) {
    wallets.push({ name: "Trust Wallet", provider: window.ethereum });
  }

  // Rabby Wallet
  if (window.rabby) {
    wallets.push({ name: "Rabby", provider: window.rabby });
  } else if (window.ethereum?.isRabby) {
    wallets.push({ name: "Rabby", provider: window.ethereum });
  }

  // Fallback: Generic window.ethereum (for other wallets)
  if (window.ethereum && wallets.length === 0) {
    wallets.push({ name: "Browser Wallet", provider: window.ethereum });
  }

  return wallets;
}

// Get preferred provider (priority order)
function getPreferredProvider(): Eip1193Provider | null {
  // Priority: OKX > MetaMask > Rabby > Coinbase > Trust > Generic
  if (window.okxwallet) return window.okxwallet;
  if (window.ethereum?.isMetaMask) return window.ethereum;
  if (window.rabby) return window.rabby;
  if (window.ethereum?.isRabby) return window.ethereum;
  if (window.coinbaseWalletExtension) return window.coinbaseWalletExtension;
  if (window.ethereum?.isCoinbaseWallet) return window.ethereum;
  if (window.trustwallet) return window.trustwallet;
  if (window.ethereum?.isTrust) return window.ethereum;
  if (window.ethereum) return window.ethereum;
  return null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    connecting: false,
    switching: false,
    error: null,
    availableWallets: [],
  });

  useEffect(() => {
    // Detect available wallets
    const wallets = detectWallets();
    setState((s) => ({
      ...s,
      availableWallets: wallets.map((w) => w.name),
    }));

    const eth = getPreferredProvider();
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
    const eth = getPreferredProvider();
    
    if (!eth) {
      const wallets = detectWallets();
      if (wallets.length === 0) {
        setState((s) => ({
          ...s,
          error:
            "No wallet detected. Please install MetaMask, OKX Wallet, Rabby, Trust Wallet, or Coinbase Wallet.",
        }));
        return;
      }
    }

    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accs = (await eth!.request({
        method: "eth_requestAccounts",
      })) as string[];
      const cid = (await eth!.request({
        method: "eth_chainId",
      })) as string;
      setState((s) => ({
        ...s,
        address: (accs[0] as `0x${string}`) ?? null,
        chainId: parseInt(cid, 16),
        connecting: false,
        switching: false,
        error: null,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connect failed";
      setState((s) => ({ ...s, connecting: false, error: msg }));
    }
  }, []);

  const switchToBase = useCallback(async () => {
    const eth = getPreferredProvider();
    if (!eth) return;
    
    setState((s) => ({ ...s, switching: true, error: null }));
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_HEX }],
      });
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err.code === 4902 || err.code === -32603) {
        try {
          await eth.request({
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
