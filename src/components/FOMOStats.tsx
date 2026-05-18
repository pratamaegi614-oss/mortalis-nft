import { useEffect, useState } from "react";
import { Eye, TrendingUp, Flame } from "lucide-react";

interface FOMOStatsProps {
  viewingCount?: number;
  mintingCount?: number;
  recentMintsCount?: number;
  timeWindow?: string;
  className?: string;
}

export function FOMOStats({
  viewingCount,
  mintingCount,
  recentMintsCount,
  timeWindow = "last hour",
  className = "",
}: FOMOStatsProps) {
  const [animatedViewing, setAnimatedViewing] = useState(viewingCount || 0);

  // Simulate viewing count fluctuation for realism
  useEffect(() => {
    if (!viewingCount) return;

    const interval = setInterval(() => {
      const variance = Math.floor(Math.random() * 20) - 10; // ±10
      const newCount = Math.max(0, viewingCount + variance);
      setAnimatedViewing(newCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [viewingCount]);

  const hasStats = viewingCount || mintingCount || recentMintsCount;

  if (!hasStats) return null;

  return (
    <div className={`fomo-stats ${className}`}>
      {viewingCount && (
        <div className="fomo-stat-item">
          <Eye className="w-4 h-4" />
          <span className="fomo-stat-value">{animatedViewing}</span>
          <span className="fomo-stat-label">viewing now</span>
        </div>
      )}

      {mintingCount && mintingCount > 0 && (
        <div className="fomo-stat-item highlight">
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="fomo-stat-value">{mintingCount}</span>
          <span className="fomo-stat-label">minting now</span>
        </div>
      )}

      {recentMintsCount && recentMintsCount > 0 && (
        <div className="fomo-stat-item">
          <TrendingUp className="w-4 h-4" />
          <span className="fomo-stat-value">{recentMintsCount}</span>
          <span className="fomo-stat-label">minted in {timeWindow}</span>
        </div>
      )}
    </div>
  );
}

interface MintVelocityProps {
  recentMintsCount: number;
  timeWindow: string;
  remaining: number;
  className?: string;
}

export function MintVelocity({
  recentMintsCount,
  timeWindow,
  remaining,
  className = "",
}: MintVelocityProps) {
  const isFast = recentMintsCount > 50;
  const isCritical = remaining < 500;

  if (recentMintsCount === 0) return null;

  return (
    <div className={`mint-velocity ${isFast ? "fast" : ""} ${className}`}>
      <div className="mint-velocity-content">
        {isFast ? (
          <>
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="mint-velocity-label">MINTING FAST:</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-5 h-5" />
            <span className="mint-velocity-label">MINT ACTIVITY:</span>
          </>
        )}
        <span className="mint-velocity-value">
          {recentMintsCount} minted in {timeWindow}
        </span>
      </div>
      {isCritical && (
        <div className="mint-velocity-warning">
          <Flame className="w-4 h-4" />
          <span>Only {remaining} left!</span>
        </div>
      )}
    </div>
  );
}
