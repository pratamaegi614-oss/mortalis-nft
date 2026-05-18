import { useState, useEffect } from "react";
import { Check, X, Loader2, AlertCircle } from "lucide-react";

interface WhitelistMintBoxProps {
  userAddress?: `0x${string}` | null;
  isWhitelisted: boolean;
  hasClaimedWL: boolean;
  wlSupplyRemaining: number;
  wlSupplyTotal: number;
  publicSupplyRemaining: number;
  publicSupplyTotal: number;
  onMintWL: () => Promise<void>;
  onMintPublic: (quantity: number) => Promise<void>;
  className?: string;
}

export function WhitelistMintBox({
  userAddress,
  isWhitelisted,
  hasClaimedWL,
  wlSupplyRemaining,
  wlSupplyTotal,
  publicSupplyRemaining,
  publicSupplyTotal,
  onMintWL,
  onMintPublic,
  className = "",
}: WhitelistMintBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canMintWL = isWhitelisted && !hasClaimedWL && wlSupplyRemaining > 0;
  const wlSoldOut = wlSupplyRemaining === 0;
  const publicSoldOut = publicSupplyRemaining === 0;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleMintWL = async () => {
    setError(null);
    setMinting(true);
    try {
      await onMintWL();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setMinting(false);
    }
  };

  const handleMintPublic = async () => {
    setError(null);
    setMinting(true);
    try {
      await onMintPublic(quantity);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mint failed");
    } finally {
      setMinting(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  if (!userAddress) {
    return (
      <div className={`whitelist-mint-box ${className}`}>
        <div className="whitelist-mint-box-content">
          <div className="whitelist-mint-box-icon">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="whitelist-mint-box-title">Connect Wallet to Mint</div>
          <div className="whitelist-mint-box-subtitle">
            Connect your wallet to check whitelist status and mint
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`whitelist-mint-box success ${className}`}>
        <div className="whitelist-mint-box-content">
          <div className="whitelist-mint-box-icon">
            <Check className="w-12 h-12" />
          </div>
          <div className="whitelist-mint-box-title">Mint Successful!</div>
          <div className="whitelist-mint-box-subtitle">
            Your MORTALIS NFT{quantity > 1 ? "s" : ""} will appear in your wallet shortly
          </div>
        </div>
      </div>
    );
  }

  // Whitelist Mint UI
  if (canMintWL) {
    return (
      <div className={`whitelist-mint-box wl-active ${className}`}>
        <div className="whitelist-mint-box-header">
          <div className="whitelist-mint-box-badge wl">
            <Check className="w-4 h-4" />
            <span>YOU'RE WHITELISTED!</span>
          </div>
        </div>

        <div className="whitelist-mint-box-content">
          <div className="whitelist-mint-box-title">Mint 1 FREE NFT</div>
          <div className="whitelist-mint-box-price">
            <span className="price-value">0 ETH</span>
            <span className="price-label">Whitelist Price</span>
          </div>

          <div className="whitelist-mint-box-supply">
            <div className="supply-label">WL Supply Remaining:</div>
            <div className="supply-value">
              {wlSupplyRemaining.toLocaleString()} / {wlSupplyTotal.toLocaleString()}
            </div>
            <div className="supply-bar">
              <div
                className="supply-bar-fill wl"
                style={{
                  width: `${((wlSupplyTotal - wlSupplyRemaining) / wlSupplyTotal) * 100}%`,
                }}
              />
            </div>
          </div>

          {error && (
            <div className="whitelist-mint-box-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleMintWL}
            disabled={minting || wlSoldOut}
            className="whitelist-mint-button wl"
          >
            {minting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Minting...</span>
              </>
            ) : wlSoldOut ? (
              "WL Sold Out"
            ) : (
              "MINT FREE"
            )}
          </button>

          <div className="whitelist-mint-box-note">
            Limited to 1 free mint per whitelisted wallet
          </div>
        </div>
      </div>
    );
  }

  // Already Claimed WL
  if (isWhitelisted && hasClaimedWL) {
    return (
      <div className={`whitelist-mint-box wl-claimed ${className}`}>
        <div className="whitelist-mint-box-header">
          <div className="whitelist-mint-box-badge claimed">
            <Check className="w-4 h-4" />
            <span>WL CLAIMED</span>
          </div>
        </div>

        <div className="whitelist-mint-box-content">
          <div className="whitelist-mint-box-title">You minted your free NFT!</div>
          <div className="whitelist-mint-box-subtitle">
            Want more? Use public mint below
          </div>

          <div className="whitelist-mint-box-divider" />

          {/* Public Mint Section */}
          <div className="whitelist-mint-box-title">Public Mint</div>
          <div className="whitelist-mint-box-price">
            <span className="price-value">0.001 ETH</span>
            <span className="price-label">per NFT</span>
          </div>

          <div className="whitelist-mint-box-quantity">
            <button onClick={decrementQuantity} disabled={quantity <= 1}>
              -
            </button>
            <span>{quantity}</span>
            <button onClick={incrementQuantity} disabled={quantity >= 10}>
              +
            </button>
          </div>

          <div className="whitelist-mint-box-supply">
            <div className="supply-label">Public Supply:</div>
            <div className="supply-value">
              {publicSupplyRemaining.toLocaleString()} / {publicSupplyTotal.toLocaleString()}
            </div>
          </div>

          {error && (
            <div className="whitelist-mint-box-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleMintPublic}
            disabled={minting || publicSoldOut}
            className="whitelist-mint-button public"
          >
            {minting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Minting...</span>
              </>
            ) : publicSoldOut ? (
              "Sold Out"
            ) : (
              `MINT ${quantity} FOR ${(0.001 * quantity).toFixed(4)} ETH`
            )}
          </button>
        </div>
      </div>
    );
  }

  // Public Mint UI (Not Whitelisted)
  return (
    <div className={`whitelist-mint-box public-only ${className}`}>
      <div className="whitelist-mint-box-header">
        <div className="whitelist-mint-box-badge not-wl">
          <X className="w-4 h-4" />
          <span>NOT WHITELISTED</span>
        </div>
      </div>

      <div className="whitelist-mint-box-content">
        <div className="whitelist-mint-box-title">Public Mint</div>
        <div className="whitelist-mint-box-price">
          <span className="price-value">0.001 ETH</span>
          <span className="price-label">per NFT</span>
        </div>

        <div className="whitelist-mint-box-quantity">
          <button onClick={decrementQuantity} disabled={quantity <= 1}>
            -
          </button>
          <span>{quantity}</span>
          <button onClick={incrementQuantity} disabled={quantity >= 10}>
            +
          </button>
        </div>

        <div className="whitelist-mint-box-total">
          Total: {(0.001 * quantity).toFixed(4)} ETH
        </div>

        <div className="whitelist-mint-box-supply">
          <div className="supply-label">Public Supply:</div>
          <div className="supply-value">
            {publicSupplyRemaining.toLocaleString()} / {publicSupplyTotal.toLocaleString()}
          </div>
          <div className="supply-bar">
            <div
              className="supply-bar-fill public"
              style={{
                width: `${((publicSupplyTotal - publicSupplyRemaining) / publicSupplyTotal) * 100}%`,
              }}
            />
          </div>
        </div>

        {!wlSoldOut && (
          <div className="whitelist-mint-box-info">
            <AlertCircle className="w-4 h-4" />
            <span>
              {wlSupplyRemaining} FREE whitelist mints still available for eligible wallets
            </span>
          </div>
        )}

        {error && (
          <div className="whitelist-mint-box-error">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleMintPublic}
          disabled={minting || publicSoldOut}
          className="whitelist-mint-button public"
        >
          {minting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Minting...</span>
            </>
          ) : publicSoldOut ? (
            "Sold Out"
          ) : (
            `MINT NOW`
          )}
        </button>

        <div className="whitelist-mint-box-note">Max 10 per transaction</div>
      </div>
    </div>
  );
}
