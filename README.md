# Receipts — Mobile Flows Case Study

**Platform:** iOS / Android  
**Version:** v0.2  
**Screens:** 44 across 11 flows  
**Status:** Interactive HTML mock-up

---

## What Is Receipts?

Receipts is a research agent for longevity-curious adults. Users ask any health or supplement question and get a graded answer grounded in peer-reviewed literature — not influencer opinion, not blog posts, not supplement-brand whitepapers.

The core promise: **show me the receipts.** Every answer links to the primary source. Citations are never paywalled.

The product is an educational tool, not medical advice. It earns no revenue from supplements.

---

## The Problem It Solves

The longevity and biohacking space is flooded with confident health claims. Influencers cite studies selectively. Supplement brands fund their own research. Podcasts amplify mouse studies as if they were human trials.

Receipts gives users a fast path from "I'm skeptical" to "I have the papers." It grades evidence on a transparent rubric, surfaces contradictions the original source omitted, and never tells users what to do — only what the literature says.

---

## Core Design Principles

- **No parametric guesses.** Answers are grounded in retrieved sources only — the agent does not fill gaps with training-data knowledge.
- **Contradictions are features.** Where the literature disagrees, Receipts shows the disagreement rather than picking a side.
- **Citations are never paywalled.** Free or premium, the user always sees the source.
- **Acute symptoms exit the literature loop.** A triage layer intercepts symptom queries and routes to clinical resources before the research agent runs.
- **No supplement revenue, ever.** The business model is a single subscription tier. No placement fees, no sponsored content, no affiliate links.
- **Data portability as a trust signal.** One-tap export, one-tap deletion, and a Direct Data API so users can ground their own LLMs on their personal stack.

---

## Evidence Grading Rubric

| Grade | Label | What it means |
|-------|-------|---------------|
| A | Strong | Multiple independent RCTs or meta-analyses with low heterogeneity |
| B | Moderate | Single well-powered RCT or high-quality systematic review |
| C | Suggestive | Mechanistic data, small RCTs, or high heterogeneity |
| D | Weak / Hype watch | Animal data only, industry-funded only, or theoretical |

---

## Trusted Source Allowlist

Receipts only retrieves from an editorially curated set of sources. Quarterly review, public changelog.

**In scope:**
- Peer-reviewed journals — PubMed, NEJM, Lancet, JAMA, BMJ, Nature, Science
- Systematic reviews — Cochrane Library, Campbell Collaboration
- Consensus bodies — USPSTF, AHA, ADA, KDIGO, Endocrine Society, NIH ODS, ACOG, WHO
- Preprints — bioRxiv, medRxiv (always labeled, never sole source for A–B grade)

**Excluded:**
- Blogs, podcasts, supplement-brand whitepapers, the open web

---

## User Flows

### Flow A — Ask the Research Agent *(core loop)*
Marcus asks a longevity question on a Saturday morning. The Atlas-pattern reasoning loop decomposes the question, retrieves papers, evaluates quality, checks contradictions, and synthesizes a plain-English answer graded A–D. He adds the protocol to his Stack as a 12-week trial.

**Screens:** Home / Ask → Composing → Reasoning loop (transparent) → Graded answer → Add to Stack

---

### Flow B — Verify a Claim *(acquisition wedge)*
Priya sees an Instagram post she finds suspicious. She pastes the claim into Receipts, which parses it, shows its interpretation in plain English, searches the allowlist, and returns a verdict — Supported, Mixed, or Contradicted — in under 20 seconds.

**Screens:** Verify entry → Parsing → Verdict (Mixed) → Receipt detail

---

### Flow C — Stack and the n=1 Readout *(engagement loop)*
Marcus's berberine trial hits week 12. He gets a re-test reminder, uploads his fresh InsightBlood panel, and sees a before/after readout. The copy is deliberate: *"Your number went down. Whether the berberine caused it is a different question."* Confounders are surfaced honestly. A contradiction alert notifies him when new evidence pushes back on a protocol he started — even one he started that same day.

**Screens:** Stack list → Protocol detail → n=1 readout → Contradiction alert

---

### Flow D — Onboarding *(first-run)*
Five screens from app open to first answer. The trust frame is set before anything is asked of the user: source allowlist shown, privacy commitment made, no-supplement-revenue disclosed.

**Screens:** Splash → Email + passkey → Topics → Detail level → First question

---

### Flow E — Topic Pages *(browse surface)*
Curated topic pages with stable URLs — state of evidence, key papers, contradiction map, open questions, last-reviewed date. The slower, deeper surface vs. Ask. Users follow topics to drive their weekly digest.

**Screens:** Topics index → Topic detail → Contradiction map → Following + digest preview

---

### Flow F — Influencer-to-Evidence Map *(HW-3)*
An index of public protocols from named creators with each claim linked to its evidence chain. The framing rule: **we rate claims, not creators.** No editorial commentary on the person. Timestamps and episode numbers cited. A "Calibrated" chip rewards creators whose framing matches the underlying evidence.

**Screens:** Creators index → Creator profile → Claim detail → Compare creators on a topic

---

### Flow G — Published Stacks *(HW-4)*
Practitioner-influencers maintain a private stack, then publish it read-only to subscribers — with every protocol's evidence chain attached. Receipts takes 0% on the first $8/month per author and 10% above that; earnings are public on the author profile. Comments are off in v1. Author mode enforces the rule: every claim must link to at least one allowlist source before publish.

**Screens:** Discover Stacks → Stack page → Subscribe confirm → Author compose mode

---

### Flow H — Acute-Concern Triage *(safety architecture)*
A pattern-matching layer above the research agent. Acute-symptom language ("chest pain when I exercise") fires before the literature agent runs. Crisis resources appear first — 911, telehealth, clinician directory. Pre-visit prep is offered second. Acute-symptom queries are not stored. False positives accepted; false negatives are not. Release-blocker feature.

**Screens:** Question typed → Triage interrupt (coral full-bleed) → Resources detail

---

### Flow I — Account, Personalization, Data Export *(the "You" tab)*
Personalization covers detail level (Gist / Full / Max), tone, evidence floor, and notification cadence — none of which can suppress citations. Source library is exposed with the quarterly changelog. The Direct Data API lets users grant their own LLM read-only scoped access to their Stack. One-tap export (JSON + Markdown). One-tap deletion with a signed receipt issued to email.

**Screens:** You tab → Personalization panel → Source library → Data & export → Delete confirm

---

### Flow J — Premium Upgrade *(commercial)*
The free-to-premium prompt fires only on a value-relevant ceiling — daily Verify limit hit — never on a safety surface. One tier, one price ($60/year), no add-ons. The "stays free, always" list is shown on the same screen as the upgrade offer.

**Screens:** Free-tier ceiling → Pricing → Confirmation (mint full-bleed)

---

### Flow K — Voice Surface *(HW-8)*
"Hey Receipts, what's the evidence on…" — the same Atlas reasoning loop with TTS readout. Audio transcribed locally on-device (iOS 26+); saved only on user tap. Hands-free for the run, the kitchen, the school pickup. Receipts are visible on screen while the answer plays so the user can drill in.

**Screens:** Voice idle → Listening → Voice answer with playback bar

---

## Design System

Shared with InsightBlood. Defined in `DESIGN.md`.

**Palette:**
- `canvas: #ffffff` / `ink: #000000` — default surface and text
- `surface-soft: #f7f7f5` — secondary surface
- `block-lime: #dceeb1` — protocol / direct data API hero
- `block-lilac: #c5b0f4` — answer hero / voice orb / premium
- `block-cream: #f4ecd6` — mixed verdict / free-tier ceiling
- `block-mint: #c8e6cd` — supported verdict / n=1 readout / confirmation
- `block-coral: #f3c9b6` — contradicted verdict / acute triage / contradiction alert
- `block-pink: #efd4d4` — published stacks / creator surfaces

**Typography:** Inter variable font throughout. JetBrains Mono for all labels, metadata, and grade chips.

**Rules:**
- All CTAs are pill-shaped
- One color block per viewport
- Icons via Lucide (`<i data-lucide="name">`) — no custom SVG
- Phone frames: 320 × 640 at 1× density
- Flesch-Kincaid readability ≤ 9 enforced at every detail level

---

## What Stays Free

Search and Ask, all 200 curated topic pages, 5 Verifies/day, Stack with up to 5 active protocols, contradiction alerts on Stack protocols.

**Citations. Always. Forever.**

---

## File

`receipts-mobile-flows.html` — self-contained single file. Open directly in any browser, no server or build step required.
