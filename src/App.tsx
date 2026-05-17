import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Droplet,
  Mountain,
  Wind,
  Ghost,
  Bug,
  Bell,
  ShoppingBag,
  Heart,
  Hourglass,
  Skull,
  Egg,
  Sprout,
  Lock,
  Shield,
  Sparkles,
  Twitter,
  Github,
  ChevronRight,
} from "lucide-react";
import "./App.css";
import slimeImg from "./sprites/slime.png";
import wispImg from "./sprites/wisp.png";
import skitterImg from "./sprites/skitter.png";
import mosslingImg from "./sprites/mossling.png";
import hatchboxImg from "./sprites/hatchbox.png";

type Species = {
  key: string;
  name: string;
  title: string;
  sprite: string;
  tagline: string;
  lore: string;
  vitality: number;
  appetite: number;
  charm: number;
  frameClass: string;
  glowClass: string;
  bobClass: string;
  rarity: string;
  accent: string;
};

const SPECIES: Species[] = [
  {
    key: "slime",
    name: "Slime",
    title: "The Eternal",
    sprite: slimeImg,
    tagline: "Liquid. Sluggish. Unbreakable.",
    lore: "The most primitive form. Slow, but the most resilient — it bounces back as long as a single drop survives.",
    vitality: 65,
    appetite: 35,
    charm: 50,
    frameClass: "pixel-frame-green",
    glowClass: "animate-pulseGlow",
    bobClass: "animate-bob",
    rarity: "Common · 40%",
    accent: "var(--mort-green)",
  },
  {
    key: "wisp",
    name: "Wisp",
    title: "The Drifting",
    sprite: wispImg,
    tagline: "A soul that forgot its way home.",
    lore: "Fragile existence. Flickering glow. Yet the most coveted on the secondary market.",
    vitality: 40,
    appetite: 50,
    charm: 70,
    frameClass: "pixel-frame-purple",
    glowClass: "animate-pulseGlow",
    bobClass: "animate-bobSlow",
    rarity: "Uncommon · 25%",
    accent: "var(--mort-orchid)",
  },
  {
    key: "skitter",
    name: "Skitter",
    title: "The Hungry",
    sprite: skitterImg,
    tagline: "Always hungry. Always restless.",
    lore: "An insectoid scavenger. Fast, aggressive, demands the most feedings — its keeper must show up.",
    vitality: 45,
    appetite: 75,
    charm: 30,
    frameClass: "pixel-frame-orange",
    glowClass: "animate-pulseGlow",
    bobClass: "animate-bob",
    rarity: "Rare · 20%",
    accent: "var(--mort-orange-deep)",
  },
  {
    key: "mossling",
    name: "Mossling",
    title: "The Rooted",
    sprite: mosslingImg,
    tagline: "Slow to grow. Hard to kill.",
    lore: "A walking shrub. The highest Vitality of any species — sometimes it outlives its keeper.",
    vitality: 75,
    appetite: 60,
    charm: 55,
    frameClass: "pixel-frame-gold",
    glowClass: "",
    bobClass: "animate-bobSlow",
    rarity: "Epic · 15%",
    accent: "var(--mort-gold)",
  },
];

type Element = {
  name: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
};

const ELEMENTS: Element[] = [
  { name: "Fire", desc: "+30% decay, reward 1.2×", Icon: Flame, color: "var(--mort-orange-deep)" },
  { name: "Water", desc: "-20% decay, feed 1.5×", Icon: Droplet, color: "#6ca5d4" },
  { name: "Earth", desc: "Balanced. Vanilla.", Icon: Mountain, color: "var(--mort-gold)" },
  { name: "Air", desc: "Feed 0.7×, reward 0.8×", Icon: Wind, color: "var(--mort-green)" },
  { name: "Void", desc: "Dramatic. Reward 1.5×", Icon: Ghost, color: "var(--mort-orchid)" },
];

type Mechanic = {
  num: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
};

const MECHANICS: Mechanic[] = [
  {
    num: "01",
    title: "MINT",
    desc: "Buy a sealed hatch box at the genesis drop. Species, element, and stats are rolled on-chain — you won't know what hatches until the box cracks open.",
    Icon: ShoppingBag,
  },
  {
    num: "02",
    title: "FEED",
    desc: "Every pet must be fed within a 28-day window (modulated by Vitality and Element). Miss it, and the stage decays automatically: HEALTHY → WEAK → DYING → SKELETAL.",
    Icon: Heart,
  },
  {
    num: "03",
    title: "DECAY",
    desc: "Decay is deterministic and lives entirely on-chain. No server. No admin. block.timestamp is the absolute judge.",
    Icon: Hourglass,
  },
  {
    num: "04",
    title: "BURN",
    desc: "After 28 days without a feed, anyone can call executeDeath() and claim a bounty. The NFT is wiped from supply — permanently. Only a tombstone remains.",
    Icon: Skull,
  },
];

type Stage = {
  name: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
  faded?: boolean;
};

const STAGES: Stage[] = [
  { name: "HATCH", desc: "The egg cracks. First eyes open.", Icon: Egg, color: "var(--mort-orchid)" },
  { name: "HEALTHY", desc: "Bouncy. Glowing. Happy idle.", Icon: Sprout, color: "var(--mort-green)" },
  { name: "WEAK", desc: "Colors fade. Movement slows.", Icon: Hourglass, color: "var(--mort-gold)" },
  { name: "DYING", desc: "Glitched visuals. Flickering.", Icon: Bell, color: "var(--mort-orange-deep)", faded: true },
  { name: "SKELETAL", desc: "Down to the bones. Final warning.", Icon: Skull, color: "#9ca3af", faded: true },
  { name: "BURNED", desc: "Permanently burned from the chain.", Icon: Flame, color: "var(--mort-red)", faded: true },
];

type Phase = {
  num: string;
  name: string;
  when: string;
  items: string[];
};

const PHASES: Phase[] = [
  {
    num: "01",
    name: "Phase 1 — MVP",
    when: "Week 1-2",
    items: [
      "Smart contract: mint, feed, decay, and executeDeath",
      "Foundry test suite covering time-based edge cases",
      "Frontend skeleton: landing, mint, pet detail",
      "Deploy to Base Sepolia testnet",
    ],
  },
  {
    num: "02",
    name: "Phase 2 — Polish",
    when: "Week 3",
    items: [
      "Decay transition animations (Framer Motion)",
      "Leaderboard, Graveyard, and My Pets pages",
      "Email + Telegram bot notifications",
      "Indexer setup (Ponder / Goldsky)",
      "Internal audit + Slither pass",
    ],
  },
  {
    num: "03",
    name: "Phase 3 — Launch",
    when: "Week 4",
    items: [
      "Deploy to Base Mainnet",
      "OG whitelist mint — 500 free slots",
      "Public mint opens at 0.001 ETH",
      "Twitter + Discord community seed",
    ],
  },
  {
    num: "04",
    name: "Phase 4 — V2",
    when: "Month 2+",
    items: [
      "Breed mechanic (Mendel-style genetics)",
      "Phylactery — a death-protection item",
      "$REAPER token (if the community demands it)",
      "Mobile PWA + native push notifications",
    ],
  },
];

type Faq = {
  q: string;
  a: string;
  Icon: LucideIcon;
  color: string;
};

const FAQ: Faq[] = [
  {
    q: "Why deflationary?",
    a: "Because real scarcity beats a label that just says \"rare.\" Every surviving pet is proof its owner showed up.",
    Icon: Bug,
    color: "var(--mort-orange-deep)",
  },
  {
    q: "Can it be revived?",
    a: "No. Burned means burned. But in V2, a \"Phylactery\" item can lock in a 30-day protection before death lands.",
    Icon: Ghost,
    color: "var(--mort-orchid)",
  },
  {
    q: "Worried you'll forget?",
    a: "Email reminders, Discord, and a Telegram bot are coming. But ultimately, attention is the price of admission — that's the whole point.",
    Icon: Bell,
    color: "var(--mort-green)",
  },
];

function NavLink({ label, target }: { label: string; target: string }) {
  return (
    <a
      href={`#${target}`}
      className="font-display hover:opacity-80 transition-opacity"
      style={{ fontSize: 10, color: "var(--mort-bone)" }}
    >
      {label}
    </a>
  );
}

function StatBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex justify-between font-display"
        style={{ fontSize: 9, color: "var(--mort-bone)" }}
      >
        <span>{label}</span>
        <span style={{ color: "var(--mort-orchid)" }}>{value}</span>
      </div>
      <div className="hpbar w-full">
        <div className="hpbar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Tape() {
  const items = [
    "MORTALIS — FEED IT, OR FORGET IT.",
    "DEFLATIONARY · ON-CHAIN · 2026",
    "SEALED HATCH BOXES DROP SOON",
    "SOME NFTS ARE FOREVER. THESE AREN'T.",
  ];
  const row = (
    <span>
      {items.map((t, i) => (
        <span key={i}>
          <span>{t}</span>
          <span className="tape-sep">·</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="tape">
      <div className="tape-track">
        {row}
        {row}
      </div>
    </div>
  );
}

function App() {
  const [petsAlive, setPetsAlive] = useState(4996);
  const [petsBurned, setPetsBurned] = useState(4);

  useEffect(() => {
    const id = setInterval(() => {
      setPetsAlive((p) => Math.max(4250, p - (Math.random() < 0.5 ? 1 : 0)));
      setPetsBurned((p) => Math.min(750, p + (Math.random() < 0.5 ? 1 : 0)));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--mort-bg)", color: "var(--mort-bone)" }}>
      {/* Top scrolling tape */}
      <Tape />

      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{ background: "var(--mort-bg)", borderBottom: "2px solid var(--mort-line)" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <img
              src={slimeImg}
              alt=""
              className="pixel-img w-8 h-8 animate-bob"
              aria-hidden
            />
            <span
              className="font-display tracking-widest"
              style={{ fontSize: 13, color: "var(--mort-bone)" }}
            >
              MORTALIS
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink label="Pets" target="characters" />
            <NavLink label="Box" target="box" />
            <NavLink label="How" target="how" />
            <NavLink label="Roadmap" target="roadmap" />
          </nav>
          <a href="#box" className="pixel-btn" style={{ fontSize: 10 }}>
            Enter Hatchery
          </a>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="relative bg-pixel-grid scanlines overflow-hidden"
        style={{ borderBottom: "2px solid var(--mort-line)" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-2"
                style={{
                  background: "var(--mort-surface)",
                  border: "2px solid var(--mort-orange-deep)",
                }}
              >
                <Flame size={14} color="var(--mort-orange)" />
                <span
                  className="font-display"
                  style={{ fontSize: 9, color: "var(--mort-bone)" }}
                >
                  Deflationary · On-Chain · 2026
                </span>
              </div>

              <h1 className="wordmark mb-4">
                MORT<span className="tri">△</span>LIS
              </h1>

              <p
                className="font-pixel mb-3"
                style={{ fontSize: 26, color: "var(--mort-orchid)" }}
              >
                "Feed it, or forget it."
              </p>

              <p
                className="font-pixel mb-8 max-w-md leading-snug"
                style={{ fontSize: 19, color: "var(--mort-ash)" }}
              >
                A collection of pixel-art pets that vanish{" "}
                <span style={{ color: "var(--mort-orange)" }}>permanently</span>{" "}
                from the blockchain if you forget to feed them. No servers. No admins. Only{" "}
                <span style={{ color: "var(--mort-bone)" }}>block.timestamp</span>{" "}
                decides who lives.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#box" className="pixel-btn">
                  Hatch a Pet
                </a>
                <a href="#how" className="pixel-btn pixel-btn-ghost">
                  See Mechanics
                </a>
              </div>
            </div>

            {/* 2x2 species grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {SPECIES.map((s, idx) => (
                  <div
                    key={s.key}
                    className={`${s.frameClass} p-4 flex flex-col items-center`}
                    style={{ transform: idx % 2 === 0 ? "translateY(0)" : "translateY(16px)" }}
                  >
                    <img
                      src={s.sprite}
                      alt={s.name}
                      className={`pixel-img w-24 h-24 ${s.bobClass} ${s.glowClass} sprite-glow`}
                    />
                    <span
                      className="font-display mt-3"
                      style={{ fontSize: 10, color: "var(--mort-bone)" }}
                    >
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
              <span
                className="particle absolute top-2 left-0 w-2 h-2"
                style={{ background: "var(--mort-orchid)" }}
              />
              <span
                className="particle absolute top-1/2 right-2 w-2 h-2"
                style={{ background: "var(--mort-orange)", animationDelay: "1s" }}
              />
              <span
                className="particle absolute bottom-4 left-1/3 w-2 h-2"
                style={{ background: "var(--mort-bone)", animationDelay: "2s" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section
        style={{ background: "var(--mort-surface)", borderBottom: "2px solid var(--mort-line)" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div
              className="font-display animate-flicker"
              style={{ fontSize: 22, color: "var(--mort-green)" }}
            >
              {petsAlive.toLocaleString()}
            </div>
            <div
              className="font-display mt-2"
              style={{ fontSize: 9, color: "var(--mort-ash)" }}
            >
              Pets Alive
            </div>
          </div>
          <div>
            <div
              className="font-display"
              style={{ fontSize: 22, color: "var(--mort-orange-deep)" }}
            >
              {petsBurned.toLocaleString()}
            </div>
            <div
              className="font-display mt-2"
              style={{ fontSize: 9, color: "var(--mort-ash)" }}
            >
              Pets Burned
            </div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 22, color: "var(--mort-bone)" }}>
              28d
            </div>
            <div
              className="font-display mt-2"
              style={{ fontSize: 9, color: "var(--mort-ash)" }}
            >
              Max Hunger
            </div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 22, color: "var(--mort-orchid)" }}>
              4 × 5
            </div>
            <div
              className="font-display mt-2"
              style={{ fontSize: 9, color: "var(--mort-ash)" }}
            >
              Species × Elements
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER I — Meet the Mortals */}
      <section id="characters" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12">
            <p
              className="font-display mb-3"
              style={{ fontSize: 11, color: "var(--mort-orange-deep)" }}
            >
              // CHAPTER I
            </p>
            <h2
              className="font-display mb-4"
              style={{ fontSize: 24, color: "var(--mort-bone)" }}
            >
              Meet the Mortals
            </h2>
            <p
              className="font-pixel max-w-2xl leading-snug"
              style={{ fontSize: 20, color: "var(--mort-ash)" }}
            >
              Four species ship in the Genesis drop. Every pet is rolled on-chain with unique
              stats and one of five elements. Each combination shifts the survival meta.
            </p>
            <div className="pixel-rule mt-6 w-32" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPECIES.map((s) => (
              <article
                key={s.key}
                className={`${s.frameClass} p-6 flex flex-col gap-4`}
              >
                <div
                  className="flex items-center justify-center p-6"
                  style={{
                    background: "var(--mort-bg)",
                    border: "1px solid var(--mort-line)",
                  }}
                >
                  <img
                    src={s.sprite}
                    alt={s.name}
                    className={`pixel-img w-28 h-28 ${s.bobClass} ${s.glowClass} sprite-glow`}
                  />
                </div>
                <div>
                  <p
                    className="font-display"
                    style={{ fontSize: 9, color: "var(--mort-ash)" }}
                  >
                    {s.rarity}
                  </p>
                  <h3
                    className="font-display mt-2"
                    style={{ fontSize: 14, color: "var(--mort-bone)" }}
                  >
                    {s.name}
                  </h3>
                  <p
                    className="font-display mt-1"
                    style={{ fontSize: 9, color: "var(--mort-orchid)" }}
                  >
                    {s.title}
                  </p>
                </div>
                <p
                  className="font-pixel leading-snug"
                  style={{ fontSize: 19, color: "var(--mort-bone)" }}
                >
                  {s.tagline}
                </p>
                <p
                  className="font-pixel leading-snug"
                  style={{ fontSize: 17, color: "var(--mort-ash)" }}
                >
                  {s.lore}
                </p>
                <div className="flex flex-col gap-3 mt-2">
                  <StatBar label="Vitality" value={s.vitality} />
                  <StatBar label="Appetite" value={s.appetite} />
                  <StatBar label="Charm" value={s.charm} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HATCH BOX */}
      <section
        id="box"
        className="relative scanlines overflow-hidden"
        style={{
          background: "var(--mort-surface)",
          borderTop: "2px solid var(--mort-line)",
          borderBottom: "2px solid var(--mort-line)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="pixel-frame-gold p-8 relative">
                <img
                  src={hatchboxImg}
                  alt="Mystery hatch box"
                  className="pixel-img w-56 h-56 md:w-64 md:h-64 animate-bobSlow"
                />
                <span
                  className="particle absolute top-2 left-2 w-2 h-2"
                  style={{ background: "var(--mort-orchid)" }}
                />
                <span
                  className="particle absolute top-8 right-4 w-2 h-2"
                  style={{ background: "var(--mort-gold)", animationDelay: "0.8s" }}
                />
                <span
                  className="particle absolute bottom-6 left-6 w-2 h-2"
                  style={{ background: "var(--mort-bone)", animationDelay: "1.6s" }}
                />
                <span
                  className="particle absolute bottom-2 right-2 w-2 h-2"
                  style={{ background: "var(--mort-orchid)", animationDelay: "2.4s" }}
                />
              </div>
            </div>

            <div>
              <p
                className="font-display mb-3 flex items-center gap-3"
                style={{ fontSize: 11, color: "var(--mort-gold)" }}
              >
                <span>// HATCH BOX</span>
                <Lock size={12} />
                <span style={{ color: "var(--mort-orange-deep)" }}>· LOCKED</span>
              </p>
              <h2
                className="font-display mb-4"
                style={{ fontSize: 24, color: "var(--mort-bone)" }}
              >
                What's Inside?
              </h2>
              <p
                className="font-pixel mb-6 leading-snug"
                style={{ fontSize: 20, color: "var(--mort-ash)" }}
              >
                Every mint arrives as a sealed hatch box. Species, element, stats, and traits
                stay hidden until the Genesis drop sells out — then the reveal goes live for
                everyone at once.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 font-pixel" style={{ fontSize: 18 }}>
                  <Lock size={16} color="var(--mort-gold)" className="mt-1 shrink-0" />
                  <span style={{ color: "var(--mort-bone)" }}>
                    Auto-reveals on-chain once sold out — or T-72 hours after mint, whichever
                    comes first.
                  </span>
                </li>
                <li className="flex items-start gap-3 font-pixel" style={{ fontSize: 18 }}>
                  <Shield size={16} color="var(--mort-orchid)" className="mt-1 shrink-0" />
                  <span style={{ color: "var(--mort-bone)" }}>
                    Provably fair:{" "}
                    <code style={{ color: "var(--mort-orange)" }}>block.prevrandao</code> +
                    tokenId. No admin can rewrite the outcome.
                  </span>
                </li>
                <li className="flex items-start gap-3 font-pixel" style={{ fontSize: 18 }}>
                  <Sparkles size={16} color="var(--mort-orange)" className="mt-1 shrink-0" />
                  <span style={{ color: "var(--mort-bone)" }}>
                    Rare traits: Albino · Twin · Cursed · Legendary holo shimmer.
                  </span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-3 items-center">
                <a href="#how" className="pixel-btn">
                  Open Hatch Order
                </a>
                <span
                  className="font-display"
                  style={{ fontSize: 10, color: "var(--mort-ash)" }}
                >
                  · 0.001 ETH · Base ·
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIVE ELEMENTS */}
      <section style={{ background: "var(--mort-bg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p
            className="font-display mb-8"
            style={{ fontSize: 11, color: "var(--mort-orchid)" }}
          >
            // FIVE ELEMENTS · GAMEPLAY MODIFIERS
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {ELEMENTS.map((e) => (
              <div
                key={e.name}
                className="pixel-frame p-5 flex flex-col items-center text-center gap-2"
              >
                <e.Icon size={22} color={e.color} />
                <h4
                  className="font-display mt-1"
                  style={{ fontSize: 12, color: "var(--mort-bone)" }}
                >
                  {e.name}
                </h4>
                <p
                  className="font-pixel leading-snug"
                  style={{ fontSize: 15, color: "var(--mort-ash)" }}
                >
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER II — How It Works */}
      <section
        id="how"
        style={{
          background: "var(--mort-surface)",
          borderTop: "2px solid var(--mort-line)",
          borderBottom: "2px solid var(--mort-line)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12">
            <p
              className="font-display mb-3"
              style={{ fontSize: 11, color: "var(--mort-orange-deep)" }}
            >
              // CHAPTER II
            </p>
            <h2
              className="font-display mb-4"
              style={{ fontSize: 24, color: "var(--mort-bone)" }}
            >
              How It Works
            </h2>
            <p
              className="font-pixel max-w-2xl leading-snug"
              style={{ fontSize: 20, color: "var(--mort-ash)" }}
            >
              Your pet is a digital lifeform. Here's its journey from egg to memorial:
            </p>
            <div className="pixel-rule mt-6 w-32" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-14">
            {MECHANICS.map((m) => (
              <div key={m.num} className="pixel-frame p-6 flex items-start gap-5">
                <div
                  className="shrink-0 flex flex-col items-center"
                  style={{ width: 56 }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--mort-bg)",
                      border: "2px solid var(--mort-orange-deep)",
                    }}
                  >
                    <m.Icon size={22} color="var(--mort-orange)" />
                  </div>
                  <span
                    className="font-display mt-2"
                    style={{ fontSize: 9, color: "var(--mort-ash)" }}
                  >
                    {m.num}
                  </span>
                </div>
                <div>
                  <h3
                    className="font-display mb-3"
                    style={{ fontSize: 14, color: "var(--mort-bone)" }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="font-pixel leading-snug"
                    style={{ fontSize: 18, color: "var(--mort-ash)" }}
                  >
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Lifecycle row */}
          <div>
            <p
              className="font-display mb-6"
              style={{ fontSize: 12, color: "var(--mort-orchid)" }}
            >
              Lifecycle — from hatch to memorial
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {STAGES.map((st) => (
                <div
                  key={st.name}
                  className="pixel-frame p-4 flex flex-col items-center text-center gap-2"
                  style={{ opacity: st.faded ? 0.6 : 1 }}
                >
                  <st.Icon size={20} color={st.color} />
                  <h5
                    className="font-display"
                    style={{ fontSize: 10, color: "var(--mort-bone)" }}
                  >
                    {st.name}
                  </h5>
                  <p
                    className="font-pixel leading-tight"
                    style={{ fontSize: 14, color: "var(--mort-ash)" }}
                  >
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER III — Roadmap */}
      <section id="roadmap" style={{ background: "var(--mort-bg)" }}>
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12">
            <p
              className="font-display mb-3"
              style={{ fontSize: 11, color: "var(--mort-orange-deep)" }}
            >
              // CHAPTER III
            </p>
            <h2
              className="font-display mb-4"
              style={{ fontSize: 24, color: "var(--mort-bone)" }}
            >
              Roadmap
            </h2>
            <p
              className="font-pixel max-w-2xl leading-snug"
              style={{ fontSize: 20, color: "var(--mort-ash)" }}
            >
              Four execution phases from testnet to mainnet to V2. Honest. No fluff.
            </p>
            <div className="pixel-rule mt-6 w-32" />
          </div>

          <div className="space-y-6">
            {PHASES.map((p) => (
              <div key={p.num} className="pixel-frame p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h3
                    className="font-display"
                    style={{ fontSize: 14, color: "var(--mort-bone)" }}
                  >
                    <span style={{ color: "var(--mort-gold)" }}>[{p.num}]</span>{" "}
                    {p.name}
                  </h3>
                  <span
                    className="font-display"
                    style={{ fontSize: 10, color: "var(--mort-ash)" }}
                  >
                    {p.when}
                  </span>
                </div>
                <ul className="space-y-2">
                  {p.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 font-pixel"
                      style={{ fontSize: 18, color: "var(--mort-bone)" }}
                    >
                      <ChevronRight
                        size={16}
                        color="var(--mort-orchid)"
                        className="mt-1 shrink-0"
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          background: "var(--mort-bg)",
          borderTop: "2px solid var(--mort-line)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {FAQ.map((f) => (
              <div key={f.q} className="pixel-frame p-6 flex flex-col gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    border: `2px solid ${f.color}`,
                  }}
                >
                  <f.Icon size={18} color={f.color} />
                </div>
                <h4
                  className="font-display"
                  style={{ fontSize: 13, color: "var(--mort-bone)" }}
                >
                  {f.q}
                </h4>
                <p
                  className="font-pixel leading-snug"
                  style={{ fontSize: 17, color: "var(--mort-ash)" }}
                >
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "var(--mort-surface)",
          borderTop: "2px solid var(--mort-line)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img src={slimeImg} alt="" className="pixel-img w-8 h-8 animate-bob" />
              <div>
                <p
                  className="font-display"
                  style={{ fontSize: 12, color: "var(--mort-bone)" }}
                >
                  MORTALIS
                </p>
                <p
                  className="font-pixel"
                  style={{ fontSize: 16, color: "var(--mort-ash)" }}
                >
                  Some NFTs are forever. These aren't.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                aria-label="Twitter"
                style={{ color: "var(--mort-bone)" }}
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                style={{ color: "var(--mort-bone)" }}
              >
                <Github size={20} />
              </a>
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                v0.1 · draft
              </span>
            </div>
          </div>
          <div className="pixel-rule w-full" />
          <p
            className="font-display text-center"
            style={{ fontSize: 9, color: "var(--mort-ash)" }}
          >
            © 2026 MORTALIS · Built on Base · No promises, only{" "}
            <span style={{ color: "var(--mort-orange)" }}>block.timestamp</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
