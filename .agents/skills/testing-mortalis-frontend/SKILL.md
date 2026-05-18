---
name: testing-mortalis-frontend
description: Test the Mortalis frontend landing page, NFT/generative section, hatch box, element modifiers, and decay UI end-to-end.
---

# Mortalis Frontend Testing

Use this skill when verifying Mortalis landing-page or NFT presentation changes.

## Devin Secrets Needed

- None for local UI testing.
- If testing a deployed Vercel preview is required and it is auth-gated, ask the user for the appropriate Vercel/team access instead of treating that as an app failure.

## Setup

1. From the repo root, start the frontend:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
2. Open Chrome to `http://localhost:5173/`.
3. If recording UI testing, maximize Chrome before recording.

## Core Assertions

- Hero renders with `MORTALIS`, primary nav, and supply `0 / 3,333`.
- NFT section renders four base species: `Voidling`, `Mossling`, `Shardling`, and `Wisp`.
- Species distributions match: Voidling 30%, Mossling 30%, Shardling 15%, Wisp 25%.
- The generative trait-system reference board loads without broken images.
- Trait layer structure includes Background, Species Base, Element Overlay, Eyes, Head Trait, Body Trait, Accessory, Aura, Mutation, and Decay State.
- Mutation and compatibility UI renders with the expected rows from the project spec.
- Hatch box and mint widget render with quantity controls, `0.001 ETH / BOX`, total price, and wallet CTA.
- Element modifiers render Fire, Water, Earth, Air, and Void.
- Decay stages render HEALTHY, WEAK, DYING, SKELETAL, and BURNED.

## Evidence

- Capture screenshots for hero/supply, species cards, trait-system board, trait/mutation/compatibility details, hatch box, and decay stages.
- Include a screen recording when using browser/desktop interactions.
- If browser console inspection tooling cannot attach, explicitly report that limitation and rely on visible runtime state plus build/lint checks.
