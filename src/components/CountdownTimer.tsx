import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isComplete: false,
  };
}

export function CountdownTimer({
  targetDate,
  onComplete,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(targetDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isComplete && onComplete) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (timeLeft.isComplete) {
    return (
      <div className={`countdown-timer countdown-complete ${className}`}>
        <div className="countdown-label">
          <Clock className="w-4 h-4" />
          <span>GENESIS DROP IS LIVE!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`countdown-timer ${className}`}>
      <div className="countdown-label">
        <Clock className="w-4 h-4" />
        <span>GENESIS DROP IN:</span>
      </div>
      <div className="countdown-digits">
        <div className="countdown-unit">
          <div className="countdown-value">{String(timeLeft.days).padStart(2, "0")}</div>
          <div className="countdown-unit-label">DAYS</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">{String(timeLeft.hours).padStart(2, "0")}</div>
          <div className="countdown-unit-label">HRS</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">{String(timeLeft.minutes).padStart(2, "0")}</div>
          <div className="countdown-unit-label">MIN</div>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-unit">
          <div className="countdown-value">{String(timeLeft.seconds).padStart(2, "0")}</div>
          <div className="countdown-unit-label">SEC</div>
        </div>
      </div>
      <div className="countdown-date">
        {targetDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })}
      </div>
    </div>
  );
}
