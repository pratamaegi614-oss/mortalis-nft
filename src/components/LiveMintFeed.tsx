import { useEffect, useState, useRef } from "react";
import { Zap, ExternalLink } from "lucide-react";

export interface MintActivity {
  id: string;
  address: string;
  species: string;
  tokenId?: number;
  quantity: number;
  timestamp: number;
  txHash?: string;
}

interface LiveMintFeedProps {
  activities: MintActivity[];
  maxVisible?: number;
  className?: string;
  basescanUrl?: (hash: string) => string;
}

function shortAddress(addr: string): string {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function LiveMintFeed({
  activities,
  maxVisible = 5,
  className = "",
  basescanUrl,
}: LiveMintFeedProps) {
  const [visibleActivities, setVisibleActivities] = useState<MintActivity[]>([]);
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());
  const prevActivitiesRef = useRef<MintActivity[]>([]);

  useEffect(() => {
    // Detect new activities
    const prevIds = new Set(prevActivitiesRef.current.map((a) => a.id));
    const newIds = activities
      .filter((a) => !prevIds.has(a.id))
      .map((a) => a.id);

    if (newIds.length > 0) {
      setNewActivityIds(new Set(newIds));
      // Clear highlight after animation
      setTimeout(() => {
        setNewActivityIds(new Set());
      }, 2000);
    }

    prevActivitiesRef.current = activities;
    setVisibleActivities(activities.slice(0, maxVisible));
  }, [activities, maxVisible]);

  if (activities.length === 0) {
    return (
      <div className={`live-mint-feed ${className}`}>
        <div className="live-mint-feed-header">
          <Zap className="w-4 h-4" />
          <span>LIVE MINTS</span>
        </div>
        <div className="live-mint-feed-empty">
          <span>Waiting for first mint...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`live-mint-feed ${className}`}>
      <div className="live-mint-feed-header">
        <Zap className="w-4 h-4 animate-pulse" />
        <span>LIVE MINTS</span>
        <span className="live-mint-feed-count">
          {activities.length} total
        </span>
      </div>
      <div className="live-mint-feed-list">
        {visibleActivities.map((activity) => {
          const isNew = newActivityIds.has(activity.id);
          return (
            <div
              key={activity.id}
              className={`live-mint-feed-item ${isNew ? "new" : ""}`}
            >
              <div className="live-mint-feed-item-content">
                <span className="live-mint-feed-address">
                  {shortAddress(activity.address)}
                </span>
                <span className="live-mint-feed-action">minted</span>
                {activity.quantity > 1 ? (
                  <span className="live-mint-feed-quantity">
                    {activity.quantity}x
                  </span>
                ) : null}
                <span className="live-mint-feed-species">
                  {activity.species}
                </span>
                {activity.tokenId && (
                  <span className="live-mint-feed-token">
                    #{activity.tokenId}
                  </span>
                )}
              </div>
              <div className="live-mint-feed-item-meta">
                <span className="live-mint-feed-time">
                  {timeAgo(activity.timestamp)}
                </span>
                {activity.txHash && basescanUrl && (
                  <a
                    href={basescanUrl(activity.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="live-mint-feed-link"
                    title="View on Basescan"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {activities.length > maxVisible && (
        <div className="live-mint-feed-footer">
          +{activities.length - maxVisible} more mints
        </div>
      )}
    </div>
  );
}
