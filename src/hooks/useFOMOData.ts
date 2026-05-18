import { useState, useEffect, useCallback } from "react";
import type { MintActivity } from "../components/LiveMintFeed";

interface FOMOData {
  // Countdown
  launchDate: Date;
  isLaunched: boolean;

  // Progress
  totalMinted: number;
  totalSupply: number;
  speciesBreakdown: {
    name: string;
    minted: number;
    total: number;
    color: string;
  }[];

  // Live Feed
  recentMints: MintActivity[];

  // Stats
  viewingCount: number;
  mintingCount: number;
  recentMintsCount: number;

  // Waitlist
  subscriberCount: number;
}

// Mock data generator - replace with real contract calls
function generateMockMintActivity(): MintActivity {
  const species = ["Voidling", "Mossling", "Shardling", "Wisp"];
  const randomSpecies = species[Math.floor(Math.random() * species.length)];
  const randomAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
  const randomQuantity = Math.floor(Math.random() * 3) + 1;

  return {
    id: `${Date.now()}-${Math.random()}`,
    address: randomAddress,
    species: randomSpecies,
    tokenId: Math.floor(Math.random() * 3333) + 1,
    quantity: randomQuantity,
    timestamp: Date.now(),
    txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
  };
}

export function useFOMOData(): FOMOData {
  // Set your launch date here
  const LAUNCH_DATE = new Date("2026-05-25T12:00:00Z"); // Change this!

  const [totalMinted, setTotalMinted] = useState(2847); // Mock data
  const [recentMints, setRecentMints] = useState<MintActivity[]>([]);
  const [viewingCount, setViewingCount] = useState(847);
  const [subscriberCount, setSubscriberCount] = useState(1247);

  // Species breakdown - update these based on your contract
  const speciesBreakdown = [
    {
      name: "Voidling",
      minted: 812,
      total: 1000,
      color: "var(--mort-orchid)",
    },
    {
      name: "Mossling",
      minted: 1000,
      total: 1000,
      color: "var(--mort-green)",
    },
    {
      name: "Shardling",
      minted: 287,
      total: 500,
      color: "var(--mort-blue)",
    },
    {
      name: "Wisp",
      minted: 748,
      total: 833,
      color: "var(--mort-orange)",
    },
  ];

  const isLaunched = new Date() >= LAUNCH_DATE;

  // Simulate live mint feed (replace with real contract events)
  useEffect(() => {
    if (!isLaunched) return;

    // Add initial mock mints
    const initialMints = Array.from({ length: 5 }, () =>
      generateMockMintActivity()
    );
    setRecentMints(initialMints);

    // Simulate new mints every 10-30 seconds
    const interval = setInterval(() => {
      const newMint = generateMockMintActivity();
      setRecentMints((prev) => [newMint, ...prev].slice(0, 20));
      setTotalMinted((prev) => prev + newMint.quantity);
    }, Math.random() * 20000 + 10000);

    return () => clearInterval(interval);
  }, [isLaunched]);

  // Simulate viewing count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount((prev) => {
        const variance = Math.floor(Math.random() * 40) - 20;
        return Math.max(100, prev + variance);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate recent mints count (last hour)
  const recentMintsCount = recentMints.filter(
    (mint) => Date.now() - mint.timestamp < 3600000
  ).length;

  // Calculate currently minting count (last 2 minutes)
  const mintingCount = recentMints.filter(
    (mint) => Date.now() - mint.timestamp < 120000
  ).length;

  return {
    launchDate: LAUNCH_DATE,
    isLaunched,
    totalMinted,
    totalSupply: 3333,
    speciesBreakdown,
    recentMints,
    viewingCount,
    mintingCount,
    recentMintsCount,
    subscriberCount,
  };
}

// Hook for waitlist submission
export function useWaitlist() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEmail = useCallback(async (email: string) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with your actual API endpoint
      // Example: await fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) })
      
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log("Waitlist email submitted:", email);
      
      // You can integrate with:
      // - Mailchimp API
      // - ConvertKit
      // - Your own backend
      // - Google Sheets API
      // - Airtable API
      
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitEmail, isSubmitting };
}
