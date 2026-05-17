import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Skull, Flame, Droplets, Wind, Mountain, Sparkles } from "lucide-react";
import "./App.css";

/* ---------- pixel sprite primitives ---------- */

type PixelMap = string[];

/**
 * Render a chunky pixel sprite from a string grid.
 * Each character maps to a hex color (or transparent for `.`).
 */
function PixelSprite({
  grid,
  palette,
  size = 6,
  className = "",
}: {
  grid: PixelMap;
  palette: Record<string, string>;
  size?: number;
  className?: string;
}) {
  const cols = grid[0]?.length ?? 0;
  const rows = grid.length;
  return (
    <svg
      className={`pixel-img ${className}`}
      width={cols * size}
      height={rows * size}
      viewBox={`0 0 ${cols * size} ${rows * size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {grid.flatMap((row, y) =>
        row.split("").map((ch, x) => {
          const fill = palette[ch];
          if (!fill) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * size}
              y={y * size}
              width={size}
              height={size}
              fill={fill}
            />
          );
        }),
      )}
    </svg>
  );
}

/* ---------- pet sprites ---------- */

const SLIME_GRID: PixelMap = [
  "................",
  "................",
  "......AAAA......",
  "....AABBBBAA....",
  "...ABBBBBBBBA...",
  "..ABBCCBBBBCBA..",
  "..ABBCCBBBBCBA..",
  "..ABBBBBBBBBBA..",
  "..ABBBBBBBBBBA..",
  "...ABBBBBBBBA...",
  "....AAAAAAAA....",
  ".....DDDDDD.....",
  "................",
];
const SLIME_PALETTE = {
  A: "#1f5a16",
  B: "#79e07a",
  C: "#0c0a09",
  D: "#22332a",
};

const SPIRIT_GRID: PixelMap = [
  "................",
  ".......AA.......",
  "......ABBA......",
  ".....ABBBBA.....",
  "....ABBBBBBA....",
  "...ABBCCBBCCBA..",
  "...ABBCCBBCCBA..",
  "...ABBBBBBBBBA..",
  "...ABBBBBBBBBA..",
  "...ABBBBBBBBBA..",
  "...A.BABABA.BA..",
  "....A.A.A.A.A...",
  "................",
];
const SPIRIT_PALETTE = {
  A: "#3a4e75",
  B: "#cfe5ff",
  C: "#0c0a09",
};

const BUG_GRID: PixelMap = [
  "................",
  "...A........A...",
  "...AA......AA...",
  "....ABBBBBBA....",
  "...ABCBBBBCBA...",
  "..ABBBBBBBBBBA..",
  ".ABBBBBBBBBBBBA.",
  ".ABBBDDDDDDBBBA.",
  ".ABBBBBBBBBBBBA.",
  "..ABBBBBBBBBBA..",
  "...ABBBBBBBBA...",
  "....A........A..",
  "................",
];
const BUG_PALETTE = {
  A: "#7a3a1a",
  B: "#d97a4d",
  C: "#0c0a09",
  D: "#2a1a0c",
};

const VINE_GRID: PixelMap = [
  "................",
  "....AA....AA....",
  "...ABBA..ABBA...",
  "..ABBBBAABBBBA..",
  "..ABBCBBBBCBBA..",
  "..ABBBBBBBBBBA..",
  "..ABBBBBBBBBBA..",
  "...ABBBBBBBBA...",
  "....AABBBBAA....",
  ".....A.AA.A.....",
  ".....A.AA.A.....",
  "....AA....AA....",
  "................",
];
const VINE_PALETTE = {
  A: "#2b5e1a",
  B: "#b8d36a",
  C: "#0c0a09",
};

const EGG_GRID: PixelMap = [
  "................",
  "......AAAA......",
  ".....ABBBBA.....",
  "....ABBCCBBA....",
  "...ABBCBBCBBA...",
  "..ABBBBBBBBBBA..",
  "..ABBBCCBBCBBA..",
  "..ABBBBBBBBBBA..",
  "..ABBCBBBBCBBA..",
  "...ABBBBBBBBA...",
  "....AABBBBAA....",
  ".....AAAAAA.....",
  "................",
];
const EGG_PALETTE = {
  A: "#6b4d22",
  B: "#f3d27a",
  C: "#c89b3a",
};

const TOMBSTONE_GRID: PixelMap = [
  "................",
  "................",
  "....AAAAAAAA....",
  "...ABBBBBBBBA...",
  "..ABBCCBBCCBBA..",
  "..ABBBBBBBBBBA..",
  "..ABBBBBBBBBBA..",
  "..ABBCCCCCCBBA..",
  "..ABBBBBBBBBBA..",
  "..ABBBBBBBBBBA..",
  "..ABBBBBBBBBBA..",
  ".AAAAAAAAAAAAAA.",
  "................",
];
const TOMBSTONE_PALETTE = {
  A: "#3a3a3a",
  B: "#8a8a8a",
  C: "#0c0a09",
};

const SKELETON_GRID: PixelMap = [
  "................",
  "......AAAA......",
  ".....ABBBBA.....",
  "....ABCBBCBA....",
  "....ABBBBBBA....",
  "....AABBBBAA....",
  ".....AAAAAA.....",
  "....A.AAAA.A....",
  "...AAAA..AAAA...",
  ".....A....A.....",
  ".....A....A.....",
  "....AA....AA....",
  "................",
];
const SKELETON_PALETTE = {
  A: "#d9d2c5",
  B: "#f5f0e6",
  C: "#0c0a09",
};

/* ---------- data ---------- */

type Stat = { label: string; value: number };

type Species = {
  key: string;
  name: string;
  tagline: string;
  desc: string;
  stats: { vitality: number; appetite: number; charm: number };
  frameClass: string;
  glowClass: string;
  bobClass: string;
  Sprite: () => JSX.Element;
};

const SPECIES: Species[] = [
  {
    key: "slime",
    name: "Slime",
    tagline: "Bouncy. Glowing. Happy idle.",
    desc:
      "The most primitive form. Slow, but the most resilient — it bounces back as long as a single drop survives.",
    stats: { vitality: 75, appetite: 60, charm: 55 },
    frameClass: "pixel-frame-green",
    glowClass: "sprite-glow",
    bobClass: "anim-bob",
    Sprite: () => <PixelSprite grid={SLIME_GRID} palette={SLIME_PALETTE} />,
  },
  {
    key: "spirit",
    name: "Spirit",
    tagline: "Fragile existence. Flickering glow.",
    desc:
      "A soul that forgot its way home. The most coveted on the secondary market — and the hardest to keep alive.",
    stats: { vitality: 40, appetite: 50, charm: 70 },
    frameClass: "pixel-frame-soul",
    glowClass: "sprite-glow-soul",
    bobClass: "anim-float",
    Sprite: () => <PixelSprite grid={SPIRIT_GRID} palette={SPIRIT_PALETTE} />,
  },
  {
    key: "bug",
    name: "Bug",
    tagline: "Always hungry. Always restless.",
    desc:
      "An insectoid scavenger. Fast, aggressive, demands the most feedings — its keeper must show up.",
    stats: { vitality: 45, appetite: 75, charm: 30 },
    frameClass: "pixel-frame-bug",
    glowClass: "sprite-glow-bug",
    bobClass: "anim-bob-fast",
    Sprite: () => <PixelSprite grid={BUG_GRID} palette={BUG_PALETTE} />,
  },
  {
    key: "vine",
    name: "Vine",
    tagline: "Slow to grow. Hard to kill.",
    desc:
      "A walking shrub. The highest Vitality of any species — sometimes it outlives its keeper.",
    stats: { vitality: 90, appetite: 40, charm: 50 },
    frameClass: "pixel-frame-green",
    glowClass: "sprite-glow-vine",
    bobClass: "anim-sway",
    Sprite: () => <PixelSprite grid={VINE_GRID} palette={VINE_PALETTE} />,
  },
];

type Element = {
  key: string;
  name: string;
  blurb: string;
  feed: string;
  reward: string;
  Icon: typeof Flame;
  color: string;
};

const ELEMENTS: Element[] = [
  {
    key: "ember",
    name: "Ember",
    blurb: "Dramatic. Reward 1.5×",
    feed: "Feed 0.6×",
    reward: "Reward 1.5×",
    Icon: Flame,
    color: "#e36b3a",
  },
  {
    key: "tide",
    name: "Tide",
    blurb: "Liquid. Sluggish. Unbreakable.",
    feed: "Feed 1.2×",
    reward: "Reward 0.9×",
    Icon: Droplets,
    color: "#5fb3d9",
  },
  {
    key: "loam",
    name: "Loam",
    blurb: "Balanced. Vanilla.",
    feed: "Feed 1.0×",
    reward: "Reward 1.0×",
    Icon: Mountain,
    color: "#a37a4a",
  },
  {
    key: "gale",
    name: "Gale",
    blurb: "Always restless. Hard to pin down.",
    feed: "Feed 0.9×",
    reward: "Reward 1.1×",
    Icon: Wind,
    color: "#c5d6c0",
  },
  {
    key: "void",
    name: "Void",
    blurb: "Feed 0.7×, reward 0.8×",
    feed: "Feed 0.7×",
    reward: "Reward 0.8×",
    Icon: Sparkles,
    color: "#b58af0",
  },
];

type Stage = {
  key: string;
  name: string;
  desc: string;
  days: string;
  className: string;
  Sprite: () => JSX.Element;
  bobClass: string;
  glowClass: string;
};

const STAGES: Stage[] = [
  {
    key: "egg",
    name: "Egg",
    desc: "The egg cracks. First eyes open.",
    days: "Day 0",
    className: "stage-healthy",
    Sprite: () => <PixelSprite grid={EGG_GRID} palette={EGG_PALETTE} />,
    bobClass: "anim-bob",
    glowClass: "sprite-glow-vine",
  },
  {
    key: "healthy",
    name: "Healthy",
    desc: "Bouncy. Glowing. Happy idle.",
    days: "0–7 days fed",
    className: "stage-healthy",
    Sprite: () => <PixelSprite grid={SLIME_GRID} palette={SLIME_PALETTE} />,
    bobClass: "anim-bob",
    glowClass: "sprite-glow",
  },
  {
    key: "weak",
    name: "Weak",
    desc: "Colors fade. Movement slows.",
    days: "7–14 days",
    className: "stage-weak",
    Sprite: () => (
      <PixelSprite
        grid={SLIME_GRID}
        palette={{ A: "#3d4a2a", B: "#7d8a5a", C: "#0c0a09", D: "#1a1a14" }}
      />
    ),
    bobClass: "anim-bob",
    glowClass: "",
  },
  {
    key: "dying",
    name: "Dying",
    desc: "Glitched visuals. Flickering.",
    days: "14–28 days",
    className: "stage-dying",
    Sprite: () => (
      <PixelSprite
        grid={SLIME_GRID}
        palette={{ A: "#5a2a14", B: "#c97a3a", C: "#0c0a09", D: "#2a1208" }}
      />
    ),
    bobClass: "anim-flicker",
    glowClass: "sprite-glow-bug",
  },
  {
    key: "skeletal",
    name: "Skeletal",
    desc: "Down to the bones. Final warning.",
    days: "28+ days",
    className: "stage-skeletal",
    Sprite: () => <PixelSprite grid={SKELETON_GRID} palette={SKELETON_PALETTE} />,
    bobClass: "anim-flicker",
    glowClass: "",
  },
  {
    key: "dead",
    name: "Tombstone",
    desc: "Permanently burned from the chain.",
    days: "After executeDeath()",
    className: "stage-dead",
    Sprite: () => <PixelSprite grid={TOMBSTONE_GRID} palette={TOMBSTONE_PALETTE} />,
    bobClass: "",
    glowClass: "",
  },
];

type Phase = {
  key: string;
  title: string;
  subtitle: string;
  items: string[];
  status: "shipping" | "next" | "later";
};

const PHASES: Phase[] = [
  {
    key: "p1",
    title: "Phase 1 — Foundation",
    subtitle: "Testnet & contracts.",
    status: "shipping",
    items: [
      "Smart contract: mint, feed, decay, and executeDeath",
      "Foundry test suite covering time-based edge cases",
      "Frontend skeleton: landing, mint, pet detail",
      "Deploy to Base Sepolia testnet",
    ],
  },
  {
    key: "p2",
    title: "Phase 2 — Polish",
    subtitle: "Reveal & audit.",
    status: "next",
    items: [
      "Decay transition animations (Framer Motion)",
      "Internal audit + Slither pass",
      "Indexer setup (Ponder / Goldsky)",
      "Twitter + Discord community seed",
    ],
  },
  {
    key: "p3",
    title: "Phase 3 — Launch",
    subtitle: "Genesis drop.",
    status: "later",
    items: [
      "Deploy to Base Mainnet",
      "OG whitelist mint — 500 free slots",
      "Public mint opens at 0.005 ETH",
      "Leaderboard, Graveyard, and My Pets pages",
    ],
  },
  {
    key: "p4",
    title: "Phase 4 — V2",
    subtitle: "Mechanics & rituals.",
    status: "later",
    items: [
      "Breed mechanic (Mendel-style genetics)",
      "Email + Telegram bot notifications",
      "Phylactery — a death-protection item",
      "Mobile PWA + native push notifications",
    ],
  },
];

type FaqItem = { q: string; a: string };

const FAQ: FaqItem[] = [
  {
    q: "Can it be revived?",
    a: 'No. Burned means burned. But in V2, a "Phylactery" item will let you store a single death — a one-time second chance, minted as its own NFT.',
  },
  {
    q: "Why deflationary?",
    a: "Some NFTs are forever. These aren't. After 28 days without a feed, anyone can call executeDeath() and claim a bounty. The NFT is wiped from supply — permanently. Only a tombstone remains.",
  },
  {
    q: "Worried you'll forget?",
    a: "Email reminders, Discord, and a Telegram bot are coming. But ultimately, attention is the price of admission — that's the whole point.",
  },
  {
    q: "How is decay enforced?",
    a: "Decay is deterministic and lives entirely on-chain. No server. No admin. block.timestamp is the absolute judge.",
  },
  {
    q: "When does the reveal happen?",
    a: "Auto-reveals on-chain once sold out — or T-72 hours after mint, whichever comes first.",
  },
];

/* ---------- helpers ---------- */

function StatRow({ stat }: { stat: Stat }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-pixel text-[9px] w-14 text-bone/70" style={{ color: "rgba(245,240,230,0.7)" }}>
        {stat.label}
      </span>
      <div className="stat-track flex-1">
        <div className="stat-fill" style={{ width: `${stat.value}%` }} />
      </div>
      <span className="font-pixel text-[9px] w-8 text-right">{stat.value}</span>
    </div>
  );
}

/* ---------- countdown ---------- */

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

function Countdown() {
  const target = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 28);
    d.setUTCHours(18, 0, 0, 0);
    return d;
  }, []);
  const { days, hours, mins, secs } = useCountdown(target);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex gap-2 sm:gap-3 font-pixel">
      {[
        { label: "D", v: pad(days) },
        { label: "H", v: pad(hours) },
        { label: "M", v: pad(mins) },
        { label: "S", v: pad(secs) },
      ].map((u) => (
        <div
          key={u.label}
          className="pixel-frame px-3 py-2 flex flex-col items-center min-w-[58px]"
        >
          <span className="text-[18px] sm:text-[22px] text-bone leading-none">
            {u.v}
          </span>
          <span className="text-[8px] mt-1 opacity-60">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- FAQ row ---------- */

function FaqRow({ item, defaultOpen = false }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pixel-frame">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-pixel text-[11px] sm:text-[12px]">{item.q}</span>
        <ChevronDown
          size={18}
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1 font-vt text-[18px] sm:text-[20px] leading-snug text-bone/80">
          {item.a}
        </div>
      )}
    </div>
  );
}

/* ---------- main ---------- */

function App() {
  const [feed, setFeed] = useState(82);
  const [pulse, setPulse] = useState(false);

  function handleFeed() {
    setFeed((v) => Math.min(100, v + 6));
    setPulse(true);
    setTimeout(() => setPulse(false), 180);
  }

  // Slow decay simulation
  useEffect(() => {
    const id = setInterval(() => setFeed((v) => Math.max(0, v - 1)), 3500);
    return () => clearInterval(id);
  }, []);

  const stage =
    feed > 70 ? "Healthy" : feed > 45 ? "Weak" : feed > 20 ? "Dying" : "Skeletal";
  const stageClass =
    feed > 70
      ? "stage-healthy"
      : feed > 45
        ? "stage-weak"
        : feed > 20
          ? "stage-dying"
          : "stage-skeletal";

  return (
    <div className="min-h-screen relative scanlines text-bone">
      {/* Top tape */}
      <div className="tape">
        <div className="tape-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              <span>MORTALIS — Feed it, or forget it.</span>
              <span className="tape-sep">◆</span>
              <span>Deflationary · On-Chain · 2026</span>
              <span className="tape-sep">◆</span>
              <span>Sealed hatch boxes drop soon</span>
              <span className="tape-sep">◆</span>
              <span>Some NFTs are forever. These aren't.</span>
              <span className="tape-sep">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <header className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <div className="pixel-frame pixel-frame-green w-9 h-9 flex items-center justify-center">
            <Skull size={18} color="#87c66b" />
          </div>
          <span className="font-pixel text-[14px] tracking-widest">MORTALIS</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 font-pixel text-[10px] opacity-80">
          <a href="#species" className="hover:opacity-100">Species</a>
          <a href="#elements" className="hover:opacity-100">Elements</a>
          <a href="#lifecycle" className="hover:opacity-100">Lifecycle</a>
          <a href="#roadmap" className="hover:opacity-100">Roadmap</a>
          <a href="#faq" className="hover:opacity-100">FAQ</a>
        </nav>
        <button className="pixel-btn pixel-btn-ghost" type="button">
          Connect Wallet
        </button>
      </header>

      {/* Hero */}
      <section id="top" className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-pixel text-[10px] mb-5 text-moss" style={{ color: "#87c66b" }}>
              Deflationary · On-Chain · 2026
            </div>
            <h1 className="font-pixel text-[26px] sm:text-[40px] lg:text-[52px] leading-[1.15]">
              Feed it,
              <br />
              <span style={{ color: "#87c66b" }}>or forget it.</span>
            </h1>
            <p className="mt-6 font-vt text-[20px] sm:text-[22px] max-w-xl text-bone/80 leading-snug">
              MORTALIS is a collection of pixel-art pets that vanish from the blockchain if you forget to feed them.
              No servers. No admins. Only <span className="font-pixel text-[12px] text-bone">block.timestamp</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <button className="pixel-btn" type="button">Open Hatch Order</button>
              <button className="pixel-btn pixel-btn-ghost" type="button">Read the Docs</button>
            </div>

            <div className="mt-10">
              <div className="font-pixel text-[10px] opacity-60 mb-2">Genesis drop in</div>
              <Countdown />
            </div>
          </div>

          {/* Live demo pet card */}
          <div className="pixel-frame pixel-frame-green p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="font-pixel text-[10px] opacity-70">PET #0001</div>
              <div className={`font-pixel text-[10px] ${stageClass}`}>{stage.toUpperCase()}</div>
            </div>

            <div className="flex flex-col items-center py-6">
              <div
                className={`anim-bob sprite-glow ${pulse ? "scale-105" : ""}`}
                style={{ transition: "transform 120ms steps(2, end)" }}
              >
                <PixelSprite grid={SLIME_GRID} palette={SLIME_PALETTE} size={9} />
              </div>
              <div className="font-pixel text-[12px] mt-4">Slime — Loam</div>
              <div className="font-vt text-[18px] opacity-70 mt-1">
                Bouncy. Glowing. Happy idle.
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-[9px] opacity-70">Hunger meter</span>
                <span className="font-pixel text-[9px]">{feed}%</span>
              </div>
              <div className="stat-track">
                <div className="stat-fill" style={{ width: `${feed}%` }} />
              </div>
              <div className="flex gap-3 mt-5">
                <button className="pixel-btn flex-1" type="button" onClick={handleFeed}>
                  Feed (1 berry)
                </button>
                <button className="pixel-btn pixel-btn-ghost" type="button">
                  View pet
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* Hatch box section */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="font-pixel text-[10px] text-moss mb-3" style={{ color: "#87c66b" }}>
              01 · Mystery hatch box
            </div>
            <h2 className="font-pixel text-[20px] sm:text-[26px] leading-snug">
              Buy a sealed hatch box. Roll your fate on-chain.
            </h2>
            <p className="font-vt text-[20px] mt-5 text-bone/80 max-w-xl leading-snug">
              Every mint arrives as a sealed hatch box. Species, element, stats, and traits stay hidden until the
              Genesis drop sells out — then the reveal goes live for everyone at once.
            </p>
            <ul className="mt-6 space-y-3 font-vt text-[19px]">
              <li className="flex gap-3"><span style={{ color: "#87c66b" }}>▸</span> Auto-reveals on-chain once sold out — or T-72 hours after mint, whichever comes first.</li>
              <li className="flex gap-3"><span style={{ color: "#87c66b" }}>▸</span> Rare traits: Albino · Twin · Cursed · Legendary holo shimmer.</li>
              <li className="flex gap-3"><span style={{ color: "#87c66b" }}>▸</span> Four species, five elements, hundreds of stat combinations.</li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="pixel-frame pixel-frame-shell p-10 sm:p-14">
              <div className="anim-bob sprite-glow-vine">
                <PixelSprite grid={EGG_GRID} palette={EGG_PALETTE} size={12} />
              </div>
              <div className="text-center mt-6 font-pixel text-[10px] opacity-70">
                SEALED · DO NOT SHAKE
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* Species */}
      <section id="species" className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <div className="font-pixel text-[10px] text-moss" style={{ color: "#87c66b" }}>02 · Meet the Mortals</div>
          <h2 className="font-pixel text-[20px] sm:text-[28px] mt-3">Four species. One brutal economy.</h2>
          <p className="font-vt text-[19px] opacity-80 max-w-2xl mx-auto mt-4">
            Every pet is rolled on-chain with unique stats and one of five elements. Each combination shifts the survival meta.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIES.map((s) => (
            <div key={s.key} className={`pixel-frame ${s.frameClass} p-5 flex flex-col`}>
              <div className="flex items-center justify-center h-32">
                <div className={`${s.bobClass} ${s.glowClass}`}>
                  <s.Sprite />
                </div>
              </div>
              <div className="mt-3 font-pixel text-[12px]">{s.name}</div>
              <div className="font-vt text-[17px] opacity-70 leading-snug">{s.tagline}</div>
              <p className="font-vt text-[17px] mt-3 text-bone/80 leading-snug min-h-[80px]">
                {s.desc}
              </p>
              <div className="mt-4 space-y-2">
                <StatRow stat={{ label: "VITALITY", value: s.stats.vitality }} />
                <StatRow stat={{ label: "APPETITE", value: s.stats.appetite }} />
                <StatRow stat={{ label: "CHARM", value: s.stats.charm }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* Elements */}
      <section id="elements" className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <div className="font-pixel text-[10px] text-moss" style={{ color: "#87c66b" }}>03 · Species × Elements</div>
          <h2 className="font-pixel text-[20px] sm:text-[28px] mt-3">Five elements. Different rules of survival.</h2>
          <p className="font-vt text-[19px] opacity-80 max-w-2xl mx-auto mt-4">
            Element modifies appetite and reward. Pair the right element with the right species and you stretch your feed window — pick wrong and the clock ticks faster.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {ELEMENTS.map((e) => (
            <div key={e.key} className="pixel-frame p-5 flex flex-col items-center text-center">
              <div
                className="pixel-frame w-14 h-14 flex items-center justify-center mb-3"
                style={{ boxShadow: `inset 0 0 0 2px ${e.color}, 0 0 0 2px #0c0a09, 0 4px 0 0 #0c0a09` }}
              >
                <e.Icon size={22} color={e.color} />
              </div>
              <div className="font-pixel text-[12px]">{e.name}</div>
              <div className="font-vt text-[17px] opacity-70 leading-snug mt-1">{e.blurb}</div>
              <div className="mt-4 flex gap-2 flex-wrap justify-center">
                <span className="font-pixel text-[9px] px-2 py-1" style={{ background: "#1c1714" }}>{e.feed}</span>
                <span className="font-pixel text-[9px] px-2 py-1" style={{ background: "#1c1714" }}>{e.reward}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* Lifecycle */}
      <section id="lifecycle" className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <div className="font-pixel text-[10px] text-moss" style={{ color: "#87c66b" }}>04 · Lifecycle</div>
          <h2 className="font-pixel text-[20px] sm:text-[28px] mt-3">From hatch to memorial.</h2>
          <p className="font-vt text-[19px] opacity-80 max-w-2xl mx-auto mt-4">
            Every pet must be fed within a 28-day window (modulated by Vitality and Element). Miss it, and the stage decays automatically:
            HEALTHY → WEAK → DYING → SKELETAL.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {STAGES.map((st) => (
            <div key={st.key} className="pixel-frame p-4 flex flex-col items-center text-center">
              <div className="h-24 flex items-center justify-center">
                <div className={`${st.bobClass} ${st.glowClass}`}>
                  <st.Sprite />
                </div>
              </div>
              <div className={`font-pixel text-[11px] mt-3 ${st.className}`}>{st.name}</div>
              <div className="font-vt text-[16px] opacity-70 mt-1 leading-snug min-h-[56px]">
                {st.desc}
              </div>
              <div className="font-pixel text-[8px] mt-3 opacity-50">{st.days}</div>
            </div>
          ))}
        </div>

        <div className="pixel-frame mt-10 p-6 sm:p-7 flex flex-col sm:flex-row gap-6 items-center">
          <div className="anim-bob sprite-glow-bug">
            <PixelSprite
              grid={SLIME_GRID}
              palette={{ A: "#5a2a14", B: "#c97a3a", C: "#0c0a09", D: "#2a1208" }}
              size={6}
            />
          </div>
          <div className="flex-1">
            <div className="font-pixel text-[12px] stage-dying">After 28 days without a feed</div>
            <p className="font-vt text-[19px] mt-2 text-bone/85 leading-snug">
              Anyone can call <span className="font-pixel text-[11px]">executeDeath()</span> and claim a bounty. The NFT is wiped from supply — permanently. Only a tombstone remains.
            </p>
          </div>
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* Why deflationary */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-pixel text-[10px] text-moss" style={{ color: "#87c66b" }}>05 · Why deflationary?</div>
            <h2 className="font-pixel text-[22px] sm:text-[28px] mt-3 leading-snug">
              Some NFTs are forever. These aren't.
            </h2>
            <p className="font-vt text-[20px] mt-5 text-bone/85 leading-snug">
              Decay is deterministic and lives entirely on-chain. No server. No admin. <span className="font-pixel text-[12px]">block.timestamp</span> is the absolute judge. Every surviving pet is proof its owner showed up.
            </p>
            <p className="font-vt text-[20px] mt-4 text-bone/70 leading-snug">
              Supply shrinks every day. Holders compound. Attention is the price of admission — that's the whole point.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="pixel-frame p-5">
              <div className="font-pixel text-[10px] opacity-70">Genesis supply</div>
              <div className="font-pixel text-[22px] mt-2">5,000</div>
              <div className="font-vt text-[17px] opacity-60 mt-1">Sealed hatch boxes</div>
            </div>
            <div className="pixel-frame p-5">
              <div className="font-pixel text-[10px] opacity-70">Feed window</div>
              <div className="font-pixel text-[22px] mt-2">28d</div>
              <div className="font-vt text-[17px] opacity-60 mt-1">Modulated by Vitality</div>
            </div>
            <div className="pixel-frame p-5">
              <div className="font-pixel text-[10px] opacity-70">Mint price</div>
              <div className="font-pixel text-[22px] mt-2">0.005 ETH</div>
              <div className="font-vt text-[17px] opacity-60 mt-1">500 OG slots free</div>
            </div>
            <div className="pixel-frame p-5">
              <div className="font-pixel text-[10px] opacity-70">Chain</div>
              <div className="font-pixel text-[22px] mt-2">Base</div>
              <div className="font-vt text-[17px] opacity-60 mt-1">Mainnet · L2</div>
            </div>
          </div>
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* Roadmap */}
      <section id="roadmap" className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <div className="font-pixel text-[10px] text-moss" style={{ color: "#87c66b" }}>06 · Roadmap</div>
          <h2 className="font-pixel text-[20px] sm:text-[28px] mt-3">Four phases. Honest. No fluff.</h2>
          <p className="font-vt text-[19px] opacity-80 max-w-2xl mx-auto mt-4">
            From testnet to mainnet to V2.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {PHASES.map((p) => (
            <div key={p.key} className="pixel-frame p-6">
              <div className="flex items-center justify-between">
                <div className="font-pixel text-[12px]">{p.title}</div>
                <span
                  className="font-pixel text-[8px] px-2 py-1"
                  style={{
                    background:
                      p.status === "shipping"
                        ? "#3b8f2b"
                        : p.status === "next"
                          ? "#1c1714"
                          : "transparent",
                    color: p.status === "shipping" ? "#0c0a09" : "#f5f0e6",
                    boxShadow: p.status === "later" ? "inset 0 0 0 2px #2a221c" : undefined,
                  }}
                >
                  {p.status === "shipping" ? "Shipping" : p.status === "next" ? "Up next" : "Later"}
                </span>
              </div>
              <div className="font-vt text-[18px] opacity-70 mt-1">{p.subtitle}</div>
              <ul className="mt-5 space-y-3 font-vt text-[18px]">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span style={{ color: "#87c66b" }}>▸</span>
                    <span className="text-bone/85 leading-snug">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <hr className="pixel-hr" />

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-10">
          <div className="font-pixel text-[10px] text-moss" style={{ color: "#87c66b" }}>07 · FAQ</div>
          <h2 className="font-pixel text-[20px] sm:text-[28px] mt-3">Plain answers.</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map((item, idx) => (
            <FaqRow key={item.q} item={item} defaultOpen={idx === 0} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="pixel-frame pixel-frame-green p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="anim-bob sprite-glow">
            <PixelSprite grid={SLIME_GRID} palette={SLIME_PALETTE} size={7} />
          </div>
          <div className="flex-1">
            <div className="font-pixel text-[14px] sm:text-[16px]">Feed it. Or forget it.</div>
            <div className="font-vt text-[19px] opacity-80 mt-1">
              Get your hatch box at the Genesis drop. Then keep something alive.
            </div>
          </div>
          <div className="flex gap-3">
            <button className="pixel-btn" type="button">Open Hatch Order</button>
            <button className="pixel-btn pixel-btn-ghost" type="button">Join Discord</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bone/10" style={{ borderColor: "rgba(245,240,230,0.08)" }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="pixel-frame pixel-frame-green w-8 h-8 flex items-center justify-center">
              <Skull size={16} color="#87c66b" />
            </div>
            <span className="font-pixel text-[11px]">MORTALIS</span>
            <span className="font-vt text-[16px] opacity-50">© 2026</span>
          </div>
          <div className="font-vt text-[16px] opacity-60 text-center">
            Some NFTs are forever. These aren't. Feed it, or forget it.
          </div>
          <div className="flex gap-5 font-pixel text-[10px] opacity-70">
            <a href="#" className="hover:opacity-100">Twitter</a>
            <a href="#" className="hover:opacity-100">Discord</a>
            <a href="#" className="hover:opacity-100">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
