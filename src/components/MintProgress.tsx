import { useMemo } from "react";
import { Flame, AlertTriangle } from "lucide-react";

interface SpeciesProgress {
  name: string;
  minted: number;
  total: number;
  color: string;
  icon?: string;
}

interface MintProgressProps {
  totalMinted: number;
  totalSupply: number;
  speciesBreakdown?: SpeciesProgress[];
  className?: string;
}

export function MintProgress({
  totalMinted,
  totalSupply,
  speciesBreakdown,
  className = "",
}: MintProgressProps) {
  const percentage = useMemo(() => {
    return Math.min(100, Math.round((totalMinted / totalSupply) * 100));
  }, [totalMinted, totalSupply]);

  const remaining = totalSupply - totalMinted;
  const isLowSupply = remaining < totalSupply * 0.2; // Less than 20%
  const isCritical = remaining < totalSupply * 0.1; // Less than 10%

  return (
    <div className={`mint-progress ${className}`}>
      {/* Overall Progress */}
      <div className="mint-progress-header">
        <div className="mint-progress-stats">
          <span className="mint-progress-count">
            {totalMinted.toLocaleString()} / {totalSupply.toLocaleString()}
          </span>
          <span className="mint-progress-label">MINTED</span>
          <span className="mint-progress-percentage">({percentage}%)</span>
        </div>
        {isLowSupply && (
          <div className={`mint-progress-alert ${isCritical ? "critical" : ""}`}>
            {isCritical ? (
              <>
                <Flame className="w-4 h-4" />
                <span>ONLY {remaining} LEFT!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>RUNNING LOW: {remaining} remaining</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mint-progress-bar-container">
        <div className="mint-progress-bar-bg">
          <div
            className="mint-progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Species Breakdown */}
      {speciesBreakdown && speciesBreakdown.length > 0 && (
        <div className="mint-progress-species">
          <div className="mint-progress-species-label">PER SPECIES:</div>
          <div className="mint-progress-species-grid">
            {speciesBreakdown.map((species) => {
              const speciesPercentage = Math.round(
                (species.minted / species.total) * 100
              );
              const isSoldOut = species.minted >= species.total;

              return (
                <div
                  key={species.name}
                  className={`mint-progress-species-item ${isSoldOut ? "sold-out" : ""}`}
                >
                  <div className="mint-progress-species-header">
                    <span className="mint-progress-species-name">
                      {species.name.toUpperCase()}
                    </span>
                    {isSoldOut && (
                      <span className="mint-progress-sold-out-badge">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                  <div className="mint-progress-species-bar-container">
                    <div className="mint-progress-species-bar-bg">
                      <div
                        className="mint-progress-species-bar-fill"
                        style={{
                          width: `${speciesPercentage}%`,
                          backgroundColor: species.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mint-progress-species-stats">
                    <span>
                      {species.minted.toLocaleString()} / {species.total.toLocaleString()}
                    </span>
                    <span className="mint-progress-species-percentage">
                      {speciesPercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
