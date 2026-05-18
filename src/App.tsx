import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Ghost,
  Bug,
  Bell,
  ShoppingBag,
  Heart,
  Hourglass,
  Skull,
  Sprout,
  Lock,
  Shield,
  Sparkles,
  Twitter,
  Github,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  Loader2,
  AlertTriangle,
  Minus,
  Plus,
  Menu,
  X,
} from "lucide-react";
import "./App.css";
import mortalisLogo from "./sprites/mortalis-logo.jpg";
import hatchboxImg from "./sprites/hatchbox.png";
import voidlingImg from "./sprites/characters/voidling.gif";
import mosslingImg from "./sprites/characters/mossling.gif";
import shardlingImg from "./sprites/characters/shardling.gif";
import wispImg from "./sprites/characters/wisp.gif";
import { BASE_CHAIN_ID, shortAddress, useWallet } from "./lib/wallet";
import {
  CONTRACT_ADDRESS,
  MAX_PER_TX,
  MINT_PRICE_ETH,
  TOTAL_SUPPLY,
  basescanAddressUrl,
  basescanTxUrl,
  isContractConfigured,
  mint as sendMint,
  totalEthForQuantity,
} from "./lib/mint";

type Species = {
  key: string;
  name: string;
  title: string;
  affinity: string;
  tagline: string;
  lore: string;
  compatible: string[];
  incompatible: string[];
  frameClass: string;
  rarity: string;
  accent: string;
  glow: string;
  portrait: string;
};

const SPECIES: Species[] = [
  {
    key: "voidling",
    name: "Voidling",
    title: "Shadow of the Digital Void",
    affinity: "Void",
    tagline: "The more it is forgotten, the more it fades away.",
    lore: "A shadow creature from the digital void with glowing eyes, a shadow cloak, glitch particles, and a void aura.",
    compatible: ["Horns", "Glitch marks", "Void aura", "Corrupted accessories"],
    incompatible: ["Flowers", "Vines", "Nature growth"],
    frameClass: "pixel-frame-purple",
    rarity: "Genesis · 30%",
    accent: "var(--mort-orchid)",
    glow: "rgba(198, 109, 222, 0.35)",
    portrait: voidlingImg,
  },
  {
    key: "mossling",
    name: "Mossling",
    title: "Living Moss Guardian",
    affinity: "Earth",
    tagline: "If left untended, it dries into dead wood.",
    lore: "A living moss creature with a round organic body, moss texture, forest details, flowers, roots, mushrooms, and spores.",
    compatible: ["Mushroom", "Branches", "Flowers", "Roots", "Spores"],
    incompatible: ["Fire crown", "Lava cracks", "Heavy glitch"],
    frameClass: "pixel-frame-green",
    rarity: "Genesis · 30%",
    accent: "var(--mort-green)",
    glow: "rgba(90, 154, 71, 0.35)",
    portrait: mosslingImg,
  },
  {
    key: "shardling",
    name: "Shardling",
    title: "Crystal Memory Fragment",
    affinity: "Arcane",
    tagline: "Cracks slowly when left in loneliness.",
    lore: "A crystal creature formed from memory fragments with crystal spikes, an arcane glow, a mineral body, and floating shards.",
    compatible: ["Crystal growth", "Arcane marks", "Cracks", "Floating shards"],
    incompatible: ["Vines", "Flowers", "Smoke body"],
    frameClass: "pixel-frame-blue",
    rarity: "Genesis · 15%",
    accent: "#64d7f3",
    glow: "rgba(100, 215, 243, 0.3)",
    portrait: shardlingImg,
  },
  {
    key: "wisp",
    name: "Wisp",
    title: "Burning Soul Spirit",
    affinity: "Fire / Soul",
    tagline: "Extinguishes if it is not fed.",
    lore: "A small fire spirit with a ghost body, floating flame, ember particles, a smoke halo, cursed candles, and soul marks.",
    compatible: ["Flame crown", "Smoke halo", "Cursed candles", "Soul marks"],
    incompatible: ["Mushrooms", "Bark skin", "Crystal spikes"],
    frameClass: "pixel-frame-orange",
    rarity: "Genesis · 25%",
    accent: "var(--mort-orange-deep)",
    glow: "rgba(217, 72, 59, 0.35)",
    portrait: wispImg,
  },
];

const TRAIT_LAYERS = [
  "Background",
  "Species Base",
  "Element Overlay",
  "Eyes",
  "Head Trait",
  "Body Trait",
  "Accessory",
  "Aura",
  "Mutation",
  "Decay State",
];

const BACKGROUNDS = ["Graveyard", "Abyss", "Forest", "Ruins", "Moon Shrine", "Forgotten Cave"];
const EYES = ["Glow", "Hollow", "Spiral", "X Eyes", "Triple Eyes", "Flame Eyes"];
const HEAD_TRAITS = ["Horns", "Crown", "Mushroom", "Halo", "Crystal Growth", "Bone Mask"];
const BODY_TRAITS = ["Scars", "Cracks", "Rot Marks", "Corruption", "Chains", "Runes"];
const ACCESSORIES = ["Necklace", "Lantern", "Soul Orb", "Bell", "Skull Charm"];
const AURAS = ["Flame", "Poison", "Arcane", "Void", "Lightning", "Mist"];
const MUTATIONS = ["Corrupted Mossling", "Black Flame Wisp", "Void Crystal Shardling", "Hollow Voidling"];

const COMPATIBILITY_ROWS = [
  { trait: "Mushroom", voidling: "×", mossling: "✓", shardling: "×", wisp: "×" },
  { trait: "Crystal Horn", voidling: "×", mossling: "×", shardling: "✓", wisp: "×" },
  { trait: "Flame Halo", voidling: "×", mossling: "×", shardling: "×", wisp: "✓" },
  { trait: "Void Glitch", voidling: "✓", mossling: "Rare", shardling: "Rare", wisp: "Rare" },
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
    desc: "Mint a sealed egg to receive a pet with randomized stats, species, element, layered traits, mutation chance, and rarity rolled on-chain.",
    Icon: ShoppingBag,
  },
  {
    num: "02",
    title: "FEED",
    desc: "Send ETH or tokens to feed your pet and reset the decay timer before its visuals start to weaken.",
    Icon: Heart,
  },
  {
    num: "03",
    title: "DECAY",
    desc: "Skip a feed and your pet drifts through the stages: HEALTHY → WEAK → DYING → SKELETAL.",
    Icon: Hourglass,
  },
  {
    num: "04",
    title: "DEATH & BURN",
    desc: "After the grace period without a feed, the pet can be executed and burned permanently. Supply drops and there is no remint.",
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
  { name: "HEALTHY", desc: "Bright colors, active particles, clean visuals.", Icon: Sprout, color: "var(--mort-green)" },
  { name: "WEAK", desc: "Faded colors, slower effects, light cracks.", Icon: Hourglass, color: "var(--mort-gold)" },
  { name: "DYING", desc: "Glitch effects, broken particles, corrupted visuals.", Icon: Bell, color: "var(--mort-orange-deep)", faded: true },
  { name: "SKELETAL", desc: "Exposed bones, dying aura, low opacity.", Icon: Skull, color: "#9ca3af", faded: true },
  { name: "BURNED", desc: "Permanently removed from supply and archived.", Icon: Flame, color: "var(--mort-red)", faded: true },
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

type NavItem = { label: string; target: string };

const NAV_ITEMS: NavItem[] = [
  { label: "NFTs", target: "characters" },
  { label: "Box", target: "box" },
  { label: "How", target: "how" },
  { label: "Roadmap", target: "roadmap" },
];

function NavLink({
  label,
  target,
  active,
  onClick,
}: {
  label: string;
  target: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={`#${target}`}
      className={`nav-link${active ? " is-active" : ""}`}
      onClick={onClick}
    >
      {label}
    </a>
  );
}

function useHeaderScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return progress;
}

function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div
      className="scroll-progress"
      aria-hidden="true"
      style={{ ["--scroll-progress" as string]: `${progress}%` }}
    />
  );
}

function HeroEmbers() {
  const embers = useMemo(() => {
    const palette = [
      "var(--mort-orange)",
      "var(--mort-orange-deep)",
      "var(--mort-orchid)",
      "var(--mort-gold)",
      "var(--mort-bone)",
    ];
    const sizes = ["ember-sm", "ember", "ember-lg"];
    return Array.from({ length: 18 }, (_, i) => {
      const seed = i * 37;
      return {
        left: `${(seed * 13) % 100}%`,
        bottom: `${-((seed * 7) % 25)}%`,
        duration: 7 + ((seed * 11) % 9),
        delay: -((seed * 5) % 11),
        color: palette[i % palette.length],
        size: sizes[i % sizes.length],
      };
    });
  }, []);
  return (
    <div className="hero-embers" aria-hidden="true">
      {embers.map((e, i) => (
        <span
          key={i}
          className={e.size}
          style={{
            left: e.left,
            bottom: e.bottom,
            background: e.color,
            boxShadow: `0 0 6px ${e.color}`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function TermTip({
  term,
  children,
  style,
}: {
  term: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span className="term-tip" tabIndex={0} style={style}>
      {children}
      <span className="term-tip-bubble" role="tooltip">
        {term}
      </span>
    </span>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
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

const SECTION_IDS = ["top", "characters", "box", "how", "roadmap"];

function App() {
  const wallet = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalEth = useMemo(() => totalEthForQuantity(quantity), [quantity]);
  const onBase = wallet.chainId === BASE_CHAIN_ID;
  const contractConfigured = isContractConfigured();
  const scrolled = useHeaderScrolled();
  const activeSection = useActiveSection(SECTION_IDS);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  const handleMint = async () => {
    setTxError(null);
    if (!wallet.address) {
      await wallet.connect();
      return;
    }
    if (!onBase) {
      await wallet.switchToBase();
      return;
    }
    setTxPending(true);
    try {
      const hash = await sendMint(wallet.address, quantity);
      setTxHash(hash);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Mint failed";
      setTxError(msg);
    } finally {
      setTxPending(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--mort-bg)", color: "var(--mort-bone)" }}>
      <ScrollProgress />

      {/* Top scrolling tape */}
      <Tape />

      {/* Header */}
      <header className={`site-header sticky top-0 z-40${scrolled ? " is-scrolled" : ""}`}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 group">
            <span className="mortalis-logo-mark mortalis-logo-mark--sm">
              <img
                src={mortalisLogo}
                alt="MORTALIS sigil"
                className="pixel-img w-full h-full"
              />
            </span>
            <span
              className="font-display tracking-widest"
              style={{ fontSize: 13, color: "var(--mort-bone)" }}
            >
              MORTALIS
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.target}
                label={item.label}
                target={item.target}
                active={activeSection === item.target}
              />
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {wallet.address ? (
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: "var(--mort-surface)",
                  border: `2px solid ${onBase ? "var(--mort-green)" : "var(--mort-orange-deep)"}`,
                }}
              >
                <span
                  className="inline-block w-2 h-2"
                  style={{
                    background: onBase
                      ? "var(--mort-green)"
                      : "var(--mort-orange-deep)",
                    boxShadow: onBase
                      ? "0 0 6px var(--mort-green)"
                      : "0 0 6px var(--mort-orange-deep)",
                  }}
                />
                <span
                  className="font-display"
                  style={{ fontSize: 9, color: "var(--mort-bone)" }}
                >
                  {shortAddress(wallet.address)}
                </span>
              </div>
            ) : (
              <button
                onClick={() => wallet.connect()}
                disabled={wallet.connecting}
                className="pixel-btn hidden sm:inline-block"
                style={{ fontSize: 10 }}
              >
                {wallet.connecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              className="mobile-nav-toggle md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={`mobile-nav-panel${mobileNavOpen ? " is-open" : ""}`}
        aria-hidden={!mobileNavOpen}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <span
            className="font-display tracking-widest"
            style={{ fontSize: 13, color: "var(--mort-bone)" }}
          >
            MORTALIS
          </span>
          <button
            type="button"
            onClick={closeMobileNav}
            aria-label="Close menu"
            className="mobile-nav-toggle"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="mobile-nav-list" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.target}
              href={`#${item.target}`}
              onClick={closeMobileNav}
              className={activeSection === item.target ? "is-active" : ""}
            >
              {item.label}
            </a>
          ))}
        </nav>
        {!wallet.address ? (
          <button
            onClick={() => {
              closeMobileNav();
              wallet.connect();
            }}
            disabled={wallet.connecting}
            className="pixel-btn mt-6 self-start"
            style={{ fontSize: 11 }}
          >
            {wallet.connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        ) : null}
      </div>

      {/* HERO */}
      <section
        id="top"
        className="relative bg-pixel-grid scanlines overflow-hidden"
        style={{ borderBottom: "2px solid var(--mort-line)" }}
      >
        <HeroEmbers />
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
                <TermTip
                  term="Solidity's block timestamp — the UNIX time of the current block, set by the Base sequencer. No off-chain server controls it."
                  style={{ color: "var(--mort-bone)" }}
                >
                  block.timestamp
                </TermTip>{" "}
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

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {SPECIES.map((s, idx) => (
                  <div
                    key={s.key}
                    className={`${s.frameClass} p-3 flex flex-col items-center gap-3`}
                    style={{ transform: idx % 2 === 0 ? "translateY(0)" : "translateY(16px)" }}
                  >
                    <div
                      className="character-portrait w-full aspect-square"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${s.accent}, 0 0 24px ${s.glow}`,
                      }}
                    >
                      <img
                        src={s.portrait}
                        alt={`${s.name} pixel art`}
                        className="pixel-img w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span
                      className="font-display"
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

      {/* Mint Progress / Contract panel */}
      <section
        style={{
          background: "var(--mort-surface)",
          borderBottom: "2px solid var(--mort-line)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Network */}
            <div className="flex flex-col gap-2">
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                // NETWORK
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 animate-pulseGlow"
                  style={{
                    background: "var(--mort-green)",
                    boxShadow: "0 0 8px var(--mort-green)",
                  }}
                />
                <span
                  className="font-display"
                  style={{ fontSize: 13, color: "var(--mort-bone)" }}
                >
                  Base
                </span>
              </div>
              <span
                className="font-pixel"
                style={{ fontSize: 15, color: "var(--mort-ash)" }}
              >
                Chain ID 8453 · Mainnet
              </span>
            </div>

            {/* Contract */}
            <div className="flex flex-col gap-2">
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                // CONTRACT
              </span>
              <div className="flex items-center gap-2">
                <code
                  className="font-display"
                  style={{ fontSize: 11, color: "var(--mort-bone)" }}
                >
                  {contractConfigured ? shortAddress(CONTRACT_ADDRESS) : "0x000…000"}
                </code>
                {contractConfigured ? (
                  <>
                    <button
                      onClick={() => handleCopy(CONTRACT_ADDRESS)}
                      aria-label="Copy contract address"
                      style={{ color: "var(--mort-ash)" }}
                    >
                      {copied ? (
                        <Check size={14} color="var(--mort-green)" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <a
                      href={basescanAddressUrl(CONTRACT_ADDRESS)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="View on BaseScan"
                      style={{ color: "var(--mort-orchid)" }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                ) : null}
              </div>
              <span
                className="font-pixel"
                style={{ fontSize: 15, color: "var(--mort-ash)" }}
              >
                {contractConfigured ? "ERC-721 · Verified" : "Reveals at Genesis drop"}
              </span>
            </div>

            {/* Supply */}
            <div className="flex flex-col gap-2">
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                // SUPPLY
              </span>
              <div
                className="font-display"
                style={{ fontSize: 13, color: "var(--mort-bone)" }}
              >
                0 / {TOTAL_SUPPLY.toLocaleString()}
              </div>
              <div
                className="w-full"
                style={{
                  height: 8,
                  background: "var(--mort-bg)",
                  border: "1px solid var(--mort-line)",
                }}
              >
                <div
                  style={{
                    width: "0%",
                    height: "100%",
                    background: "var(--mort-orange-deep)",
                  }}
                />
              </div>
            </div>

            {/* Mint price */}
            <div className="flex flex-col gap-2">
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                // MINT PRICE
              </span>
              <div
                className="font-display"
                style={{ fontSize: 13, color: "var(--mort-bone)" }}
              >
                {MINT_PRICE_ETH} ETH
              </div>
              <span
                className="font-pixel"
                style={{ fontSize: 15, color: "var(--mort-ash)" }}
              >
                Max {MAX_PER_TX} / tx · Public
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-6"
            style={{ borderTop: "1px dashed var(--mort-line)" }}
          >
            <div className="flex items-center gap-2">
              <Shield size={12} color="var(--mort-green)" />
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                Ownership renounced
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={12} color="var(--mort-orchid)" />
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                100% on-chain logic
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={12} color="var(--mort-orange)" />
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                Provably fair reveal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={12} color="var(--mort-orange-deep)" />
              <span
                className="font-display"
                style={{ fontSize: 9, color: "var(--mort-ash)" }}
              >
                Deflationary supply
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER I — Generative NFT System */}
      <section id="characters" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <div className="mb-12">
              <p
                className="font-display mb-3"
                style={{ fontSize: 11, color: "var(--mort-orange-deep)" }}
              >
                // CHAPTER I · GENERATIVE LAYERED NFT
              </p>
              <h2
                className="font-display mb-4"
                style={{ fontSize: 24, color: "var(--mort-bone)" }}
              >
                4 Species Base Characters
              </h2>
              <p
                className="font-pixel max-w-3xl leading-snug"
                style={{ fontSize: 20, color: "var(--mort-ash)" }}
              >
                MORTALIS is built from a combination of modular layers and compatibility logic: species,
                element overlay, eyes, head, body, accessory, aura, mutation, and decay state.
                Genesis supply is fixed at {TOTAL_SUPPLY.toLocaleString()} unique NFTs.
              </p>
              <div className="pixel-rule mt-6 w-32" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {SPECIES.map((s, idx) => (
              <article key={s.key} className={`${s.frameClass} p-6 flex flex-col gap-4`}>
                <div
                  className="character-portrait w-full aspect-square"
                  style={{
                    boxShadow: `inset 0 0 0 2px ${s.accent}, 0 0 28px ${s.glow}`,
                  }}
                >
                  <img
                    src={s.portrait}
                    alt={`${s.name} pixel art`}
                    className="pixel-img w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <p
                    className="font-display"
                    style={{ fontSize: 9, color: "var(--mort-ash)" }}
                  >
                    {idx + 1}. {s.rarity} · Element Affinity: {s.affinity}
                  </p>
                  <h3
                    className="font-display mt-2"
                    style={{ fontSize: 14, color: "var(--mort-bone)" }}
                  >
                    {s.name}
                  </h3>
                  <p
                    className="font-display mt-1"
                    style={{ fontSize: 9, color: s.accent }}
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
                <div className="space-y-3 mt-auto">
                  <div>
                    <p className="font-display mb-2" style={{ fontSize: 8, color: s.accent }}>
                      Compatible traits
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {s.compatible.map((trait) => (
                        <span key={trait} className="trait-chip">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className="font-display mb-2"
                      style={{ fontSize: 8, color: "var(--mort-orange-deep)" }}
                    >
                      Incompatible
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {s.incompatible.map((trait) => (
                        <span key={trait} className="trait-chip trait-chip-danger">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
            <div className="pixel-frame p-6">
              <p
                className="font-display mb-5"
                style={{ fontSize: 12, color: "var(--mort-orchid)" }}
              >
                Trait Layer Structure
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {TRAIT_LAYERS.map((layer) => (
                  <div key={layer} className="trait-layer-card">
                    <span>{layer}</span>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ["Background", BACKGROUNDS],
                  ["Eyes", EYES],
                  ["Head", HEAD_TRAITS],
                  ["Body", BODY_TRAITS],
                  ["Accessory", ACCESSORIES],
                  ["Aura", AURAS],
                ].map(([title, items]) => (
                  <div key={title as string}>
                    <h4
                      className="font-display mb-2"
                      style={{ fontSize: 9, color: "var(--mort-bone)" }}
                    >
                      {title as string}
                    </h4>
                    <p
                      className="font-pixel leading-tight"
                      style={{ fontSize: 16, color: "var(--mort-ash)" }}
                    >
                      {(items as string[]).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pixel-frame p-6">
              <p
                className="font-display mb-5"
                style={{ fontSize: 12, color: "var(--mort-gold)" }}
              >
                Mutation System
              </p>
              <p
                className="font-pixel leading-snug mb-4"
                style={{ fontSize: 18, color: "var(--mort-ash)" }}
              >
                A small portion of NFTs unlock additional trait pools. Mutations are ultra rare
                and still follow the compatibility rules.
              </p>
              <div className="flex flex-col gap-2">
                {MUTATIONS.map((mutation) => (
                  <span key={mutation} className="trait-chip trait-chip-mutation">
                    {mutation}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pixel-frame p-6 overflow-x-auto">
            <p
              className="font-display mb-5"
              style={{ fontSize: 12, color: "var(--mort-orchid)" }}
            >
              Compatibility Logic
            </p>
            <table className="compat-table w-full">
              <thead>
                <tr>
                  <th>Trait</th>
                  <th>Voidling</th>
                  <th>Mossling</th>
                  <th>Shardling</th>
                  <th>Wisp</th>
                </tr>
              </thead>
              <tbody>
                {COMPATIBILITY_ROWS.map((row) => (
                  <tr key={row.trait}>
                    <td>{row.trait}</td>
                    <td>{row.voidling}</td>
                    <td>{row.mossling}</td>
                    <td>{row.shardling}</td>
                    <td>{row.wisp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  loading="lazy"
                  decoding="async"
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
                Every mint arrives as a sealed hatch box. Species, element overlay, eyes,
                head trait, body trait, accessory, aura, mutation, and decay state stay hidden
                until the reveal goes live for everyone at once.
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
                    <TermTip term="Post-merge randomness from the beacon chain, exposed to contracts as block.prevrandao. Cannot be predicted or rewritten by anyone after the block is sealed.">
                      <code style={{ color: "var(--mort-orange)" }}>block.prevrandao</code>
                    </TermTip>{" "}
                    +{" "}
                    <TermTip term="The unique on-chain ID assigned to each NFT at mint. Mixed with block.prevrandao to derive your hatch box outcome.">
                      <code style={{ color: "var(--mort-orange)" }}>tokenId</code>
                    </TermTip>
                    . No admin can rewrite the outcome.
                  </span>
                </li>
                <li className="flex items-start gap-3 font-pixel" style={{ fontSize: 18 }}>
                  <Sparkles size={16} color="var(--mort-orange)" className="mt-1 shrink-0" />
                  <span style={{ color: "var(--mort-bone)" }}>
                    Mutation chance unlocks ultra-rare pools: Corrupted Mossling · Black Flame Wisp · Void Crystal Shardling · Hollow Voidling.
                  </span>
                </li>
              </ul>

              {/* MINT WIDGET */}
              <div
                className="pixel-frame-orange p-5 mt-2"
                style={{ background: "rgba(13, 6, 23, 0.7)" }}
              >
                {txHash ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Check size={18} color="var(--mort-green)" />
                      <span
                        className="font-display"
                        style={{ fontSize: 12, color: "var(--mort-green)" }}
                      >
                        Mint sent
                      </span>
                    </div>
                    <p
                      className="font-pixel leading-snug"
                      style={{ fontSize: 17, color: "var(--mort-ash)" }}
                    >
                      Your hatch box{quantity > 1 ? "es are" : " is"} on the way. Waiting
                      for confirmation on Base.
                    </p>
                    <a
                      href={basescanTxUrl(txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-display"
                      style={{ fontSize: 10, color: "var(--mort-orchid)" }}
                    >
                      <span>{shortAddress(txHash)}</span>
                      <ExternalLink size={12} />
                      <span style={{ color: "var(--mort-ash)" }}>View on BaseScan</span>
                    </a>
                    <button
                      onClick={() => {
                        setTxHash(null);
                        setTxError(null);
                      }}
                      className="pixel-btn pixel-btn-ghost mt-1"
                      style={{ fontSize: 10, alignSelf: "flex-start" }}
                    >
                      Mint Again
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="font-display"
                        style={{ fontSize: 10, color: "var(--mort-ash)" }}
                      >
                        // HATCH ORDER
                      </span>
                      <span
                        className="font-display"
                        style={{ fontSize: 10, color: "var(--mort-orange-deep)" }}
                      >
                        {MINT_PRICE_ETH} ETH / BOX
                      </span>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span
                        className="font-display"
                        style={{ fontSize: 10, color: "var(--mort-bone)" }}
                      >
                        Quantity
                      </span>
                      <div
                        className="flex items-center"
                        style={{
                          background: "var(--mort-bg)",
                          border: "2px solid var(--mort-line)",
                        }}
                      >
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1 || txPending}
                          aria-label="Decrease quantity"
                          className="flex items-center justify-center"
                          style={{
                            width: 36,
                            height: 36,
                            color: "var(--mort-bone)",
                            opacity: quantity <= 1 ? 0.4 : 1,
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className="font-display flex items-center justify-center"
                          style={{
                            width: 44,
                            fontSize: 14,
                            color: "var(--mort-bone)",
                            borderLeft: "2px solid var(--mort-line)",
                            borderRight: "2px solid var(--mort-line)",
                            height: 36,
                          }}
                        >
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity((q) => Math.min(MAX_PER_TX, q + 1))
                          }
                          disabled={quantity >= MAX_PER_TX || txPending}
                          aria-label="Increase quantity"
                          className="flex items-center justify-center"
                          style={{
                            width: 36,
                            height: 36,
                            color: "var(--mort-bone)",
                            opacity: quantity >= MAX_PER_TX ? 0.4 : 1,
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div
                      className="flex items-center justify-between mb-5 pb-4"
                      style={{ borderBottom: "1px dashed var(--mort-line)" }}
                    >
                      <span
                        className="font-display"
                        style={{ fontSize: 10, color: "var(--mort-ash)" }}
                      >
                        Total
                      </span>
                      <span
                        className="font-display"
                        style={{ fontSize: 14, color: "var(--mort-bone)" }}
                      >
                        {totalEth} ETH
                      </span>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={handleMint}
                      disabled={txPending || wallet.connecting || wallet.switching}
                      className="pixel-btn w-full flex items-center justify-center gap-2"
                      style={{ fontSize: 11 }}
                    >
                      {txPending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Minting…</span>
                        </>
                      ) : !wallet.address ? (
                        <>
                          <Wallet size={14} />
                          <span>
                            {wallet.connecting ? "Connecting…" : "Connect Wallet to Mint"}
                          </span>
                        </>
                      ) : !onBase ? (
                        <>
                          <AlertTriangle size={14} />
                          <span>{wallet.switching ? "Switching…" : "Switch to Base"}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Mint Now</span>
                        </>
                      )}
                    </button>

                    {/* Trust badges */}
                    <div className="mint-trust-row">
                      <span>
                        <Shield size={10} color="var(--mort-orchid)" />
                        No admin keys
                      </span>
                      <span>
                        <Sparkles size={10} color="var(--mort-orange)" />
                        On-chain reveal
                      </span>
                      <span>
                        <Lock size={10} color="var(--mort-gold)" />
                        Ownership renounced
                      </span>
                    </div>

                    {/* Status / error line */}
                    <div className="mt-3 min-h-[18px]">
                      {wallet.error ? (
                        <p
                          className="font-pixel flex items-start gap-2"
                          style={{ fontSize: 15, color: "var(--mort-orange-deep)" }}
                        >
                          <AlertTriangle
                            size={12}
                            color="var(--mort-orange-deep)"
                            className="mt-1 shrink-0"
                          />
                          <span>{wallet.error}</span>
                        </p>
                      ) : txError ? (
                        <p
                          className="font-pixel flex items-start gap-2"
                          style={{ fontSize: 15, color: "var(--mort-orange-deep)" }}
                        >
                          <AlertTriangle
                            size={12}
                            color="var(--mort-orange-deep)"
                            className="mt-1 shrink-0"
                          />
                          <span>{txError}</span>
                        </p>
                      ) : !wallet.address ? (
                        <p
                          className="font-pixel"
                          style={{ fontSize: 15, color: "var(--mort-ash)" }}
                        >
                          Connect a wallet to claim a sealed hatch box on Base.
                        </p>
                      ) : !onBase ? (
                        <p
                          className="font-pixel"
                          style={{ fontSize: 15, color: "var(--mort-orange)" }}
                        >
                          Wrong network detected — switch to Base mainnet to mint.
                        </p>
                      ) : !contractConfigured ? (
                        <p
                          className="font-pixel"
                          style={{ fontSize: 15, color: "var(--mort-orange)" }}
                        >
                          Genesis drop opens soon — mint goes live the moment the
                          contract is announced.
                        </p>
                      ) : (
                        <p
                          className="font-pixel"
                          style={{ fontSize: 15, color: "var(--mort-ash)" }}
                        >
                          You'll sign one transaction. Gas paid in ETH on Base.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
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
          <Reveal>
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
          </Reveal>

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
              Decay stages — visual evolution
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
          <Reveal>
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
          </Reveal>

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
              <span className="mortalis-logo-mark mortalis-logo-mark--sm">
                <img
                  src={mortalisLogo}
                  alt="MORTALIS sigil"
                  className="pixel-img w-full h-full"
                />
              </span>
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
