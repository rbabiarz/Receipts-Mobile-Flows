# Receipts

A health research agent for longevity-curious adults. Ask any health question, get a graded (A–D) answer backed by primary literature, verify influencer claims, and track your personal supplement and protocol stack.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with expo-router file-based routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Fonts: @expo-google-fonts/inter (400/500/600/700)
- State: React Context + AsyncStorage persistence

## Where things live

- `artifacts/mobile/` — Expo app (the Receipts mobile app)
- `artifacts/mobile/app/` — expo-router screens
- `artifacts/mobile/app/(tabs)/` — 5-tab layout: ask, verify, topics, stack, you
- `artifacts/mobile/context/AppContext.tsx` — global state + all mock data
- `artifacts/mobile/types/index.ts` — all TypeScript types
- `artifacts/mobile/constants/colors.ts` — Receipts design tokens
- `artifacts/mobile/components/` — shared UI components
- `artifacts/api-server/` — Express API server

## Architecture decisions

- Contract-first: OpenAPI spec drives codegen for React Query hooks and Zod schemas
- File-based routing: expo-router with nested Stack navigators per tab
- AsyncStorage for local persistence; mock data pre-loaded in AppContext
- NativeTabs (iOS 26 liquid glass) with ClassicTabs fallback via `isLiquidGlassAvailable()`
- All screens use `useSafeAreaInsets()` — no hardcoded insets
- No emojis, no uuid package

## Product

11 flows implemented:
1. **Ask** — health question input with trending suggestions, safety triage redirect, answer with graded receipts, add-to-stack flow
2. **Verify** — fact-check a claim (URL/paste), checking animation, verdict with receipts
3. **Topics** — evidence-graded topic browser with contradiction tracking, follow/unfollow
4. **Influencers** — claim tracker for health podcasters, calibration bar per creator
5. **Published Stacks** — curated protocol stacks from credentialed authors, subscribe flow
6. **Stack** — personal protocol tracker with adherence bars, status (running/trial/paused/done)
7. **n=1 Readout** — outcome interpretation for Stack protocols (tab inside protocol detail)
8. **Onboarding** — 4-step email/preferences/topics/detail flow
9. **Account/You** — personalization, source library toggles, data export
10. **Safety Triage** — full-screen modal for flagged queries
11. **Premium Upgrade** — paywall modal; Voice — voice settings modal

## Design system

Ink: #000 | Canvas: #fff | Lilac: #c5b0f4 | Lime: #dceeb1 | Cream: #f4ecd6 | Mint: #c8e6cd | Coral: #f3c9b6 | Pink: #efd4d4 | Navy: #1f1d3d

## User preferences

- No emojis in code or UI
- Use `useSafeAreaInsets()` for all padding
- All font references use `Inter_400Regular` / `Inter_500Medium` / `Inter_600SemiBold` / `Inter_700Bold`
- Design tokens from `constants/colors.ts`

## Gotchas

- Tab bar on web: 84px height + 34px extra bottom padding
- `(tabs)/index.tsx` is a redirect-only file to `/(tabs)/ask` — do not add content here
- Mock data lives in AppContext.tsx — single source of truth for all screens
- `isLiquidGlassAvailable()` gates iOS 26 native tab UI

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific patterns
