import { useState, FormEvent } from "react";
import { Mail, Check, Loader2, AlertCircle } from "lucide-react";

interface WaitlistFormProps {
  onSubmit?: (email: string) => Promise<void>;
  subscriberCount?: number;
  className?: string;
}

export function WaitlistForm({
  onSubmit,
  subscriberCount,
  className = "",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className={`waitlist-form success ${className}`}>
        <div className="waitlist-success">
          <Check className="w-6 h-6" />
          <div className="waitlist-success-text">
            <div className="waitlist-success-title">You're on the list!</div>
            <div className="waitlist-success-subtitle">
              We'll notify you when Genesis drops.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`waitlist-form ${className}`}>
      <div className="waitlist-header">
        <Mail className="w-5 h-5" />
        <span className="waitlist-title">Get notified at launch</span>
      </div>
      
      {subscriberCount && subscriberCount > 0 && (
        <div className="waitlist-count">
          Join <span className="waitlist-count-number">{subscriberCount.toLocaleString()}</span> collectors waiting
        </div>
      )}

      <form onSubmit={handleSubmit} className="waitlist-form-input">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="waitlist-input"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="waitlist-submit"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Notify Me"
          )}
        </button>
      </form>

      {status === "error" && errorMessage && (
        <div className="waitlist-error">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="waitlist-privacy">
        No spam. Unsubscribe anytime.
      </div>
    </div>
  );
}
