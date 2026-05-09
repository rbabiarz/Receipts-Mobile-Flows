import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  Answer,
  Creator,
  DetailLevel,
  EvidenceFloor,
  GradeLevel,
  Protocol,
  PublishedStack,
  Receipt,
  StackStatus,
  TimelineEvent,
  ToneType,
  Topic,
  UserProfile,
  VerifyResult,
} from "@/types";

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: "r1",
    title: "Taurine deficiency drives aging",
    cite: "Singh · Science · 2023 · Mouse · n=250",
    grade: "D",
    studyType: "Animal",
    tags: ["Animal", "Replicated"],
    plainEnglish:
      "Mice with lower taurine aged faster; supplementing taurine extended lifespan by ~10%. Strong mechanistic signal but mouse data.",
    qualityFlags: ["Replicated", "High-impact journal"],
    whyMatters: "Landmark paper that sparked public interest in taurine.",
  },
  {
    id: "r2",
    title: "Taurine + cardiometabolic risk",
    cite: "Guan · Adv Nutr · 2024 · Meta · 12 RCTs",
    grade: "B",
    studyType: "Meta-analysis",
    tags: ["B · Meta", "Heterogeneity"],
    plainEnglish:
      "Meta of 12 RCTs found modest reductions in systolic BP (~3 mmHg) and triglycerides. Heterogeneity was high.",
    qualityFlags: ["Preregistered", "No COI"],
    whyMatters: "Best available human evidence; results modest.",
  },
  {
    id: "r3",
    title: "Endothelial function in prehypertensives",
    cite: "Sun · Hypertens Res · 2016 · RCT · n=120",
    grade: "B",
    studyType: "RCT",
    tags: ["B · RCT"],
    plainEnglish:
      "120 prehypertensive adults took 1.6 g/day taurine for 12 weeks. Endothelial function improved vs placebo.",
    qualityFlags: ["Double-blind", "Adequate power"],
    whyMatters: "Good quality RCT with meaningful endpoint.",
  },
];

const MOCK_TOPICS: Topic[] = [
  {
    id: "rapamycin",
    title: "Rapamycin and healthspan",
    grade: "C",
    gradeLabel: "Suggestive",
    paperCount: 24,
    contradictions: 3,
    lastUpdated: "2026-04-22",
    summary:
      "Strong mechanistic + animal data. Human safety data from transplant patients. Zero completed human longevity RCTs. Three are running (PEARL, RAP-ZONE, MILES).",
    openQuestions: [
      "Optimal intermittent dose schedule in healthy adults.",
      "Long-term immune effects of weekly dosing.",
      "Whether mouse lifespan effects scale to humans.",
    ],
    keyPapers: [
      {
        id: "rap1",
        title: "Rapamycin extends lifespan in genetically heterogeneous mice",
        cite: "Harrison · Nature · 2009 · ITP",
        grade: "D",
        studyType: "Animal",
        tags: ["D · Animal", "Replicated 4×"],
      },
      {
        id: "rap2",
        title: "PEARL trial — interim safety in healthy older adults",
        cite: "Mannick · Aging Cell · 2024 · RCT · n=120",
        grade: "B",
        studyType: "RCT",
        tags: ["B · RCT"],
      },
    ],
    contradictionDetails: [
      {
        title: "Disagreement 1 · Mouse-to-human translation",
        description:
          "Austad & Hoffman (2024) argue mouse lifespan effects rarely scale; Kaeberlein (2023) argues mTOR mechanism is conserved.",
        chips: ["2 reviews", "Open question"],
      },
      {
        title: "Disagreement 2 · Optimal dosing",
        description:
          "Weekly 5 mg (Mannick) vs daily low-dose (Blagosklonny). RCT data favors weekly; mechanistic argument favors daily.",
        chips: ["Mixed", "RCT incoming"],
      },
      {
        title: "Disagreement 3 · Immune effects",
        description:
          "Some studies show immune enhancement at low dose; others show suppression at standard transplant dose. Dose-dependent.",
        chips: ["Resolved by dose"],
      },
    ],
  },
  {
    id: "creatine",
    title: "Creatine for cognitive performance",
    grade: "A",
    gradeLabel: "Strong",
    paperCount: 18,
    contradictions: 0,
    lastUpdated: "2026-03-30",
    summary:
      "Multiple RCTs show cognitive benefits, especially under sleep deprivation and in vegetarians. 3–5 g/day is well-tolerated. Mechanism well-understood.",
    openQuestions: [
      "Optimal loading vs maintenance dose.",
      "Whether timing (pre/post workout) matters for cognition.",
    ],
    keyPapers: [
      {
        id: "cr1",
        title: "Creatine and working memory in healthy adults",
        cite: "Rae · Psychopharmacology · 2003 · RCT · n=45",
        grade: "B",
        studyType: "RCT",
        tags: ["B · RCT"],
      },
    ],
    contradictionDetails: [],
  },
  {
    id: "cgm",
    title: "Continuous glucose monitoring in non-diabetics",
    grade: "C",
    gradeLabel: "Suggestive",
    paperCount: 31,
    contradictions: 5,
    lastUpdated: "2026-04-01",
    summary:
      "CGM generates data but no RCT has shown meaningful behavior change or outcome improvement in metabolically healthy adults.",
    openQuestions: [
      "Whether real-time feedback changes eating behavior long-term.",
      "Clinical reference ranges for non-diabetic normal variation.",
    ],
    keyPapers: [],
    contradictionDetails: [
      {
        title: "Disagreement 1 · Behavior change",
        description:
          "CGM advocates claim real-time feedback improves diet. JAMA 2026 RCT found no significant change.",
        chips: ["Mixed", "RCT published"],
      },
    ],
  },
  {
    id: "nmn",
    title: "NMN and NAD+ precursors",
    grade: "D",
    gradeLabel: "Hype watch",
    paperCount: 22,
    contradictions: 2,
    lastUpdated: "2026-02-18",
    summary:
      "NAD+ declines with age — fact. That supplementing NMN meaningfully raises NAD+ in the right tissues and translates to longevity — not established in humans.",
    openQuestions: [
      "Bioavailability and tissue distribution.",
      "Whether elevated NAD+ causally extends human healthspan.",
    ],
    keyPapers: [],
    contradictionDetails: [],
  },
  {
    id: "zone2",
    title: "Zone 2 vs HIIT for VO₂max",
    grade: "A",
    gradeLabel: "Strong",
    paperCount: 29,
    contradictions: 1,
    lastUpdated: "2026-04-15",
    summary:
      "Both improve VO₂max; polarized training (80% zone 2 + 20% HIIT) appears superior to either alone. Strong evidence base.",
    openQuestions: [
      "Optimal ratio of zone 2 to HIIT.",
      "Whether benefits differ by age or fitness baseline.",
    ],
    keyPapers: [],
    contradictionDetails: [],
  },
];

const MOCK_CREATORS: Creator[] = [
  {
    id: "huberman",
    name: "Andrew Huberman",
    handle: "hubermanlab",
    platform: "Podcast",
    claimCount: 312,
    calibrated: 48,
    mixed: 142,
    unsupported: 122,
    claims: [
      {
        id: "h1",
        quote: "I think taurine is one of the most underrated longevity tools we have.",
        episode: "Huberman Lab #198 · 1:14:32",
        date: "2026-03-12",
        verdict: "mixed",
        contradictions: 2,
        receipts: MOCK_RECEIPTS,
      },
      {
        id: "h2",
        quote: "NSDR can substitute for sleep loss.",
        episode: "Lab #205",
        date: "2026-04-08",
        verdict: "contradicted",
        contradictions: 3,
        receipts: [],
      },
      {
        id: "h3",
        quote: "Cold exposure increases dopamine.",
        episode: "Lab #196",
        date: "2026-02-26",
        verdict: "supported",
        contradictions: 0,
        receipts: [],
      },
    ],
  },
  {
    id: "patrick",
    name: "Rhonda Patrick",
    handle: "foundmyfitness",
    platform: "Podcast",
    claimCount: 218,
    calibrated: 156,
    mixed: 52,
    unsupported: 10,
    claims: [
      {
        id: "p1",
        quote: "Mouse data is striking but human data is preliminary — wait for RCTs.",
        episode: "FoundMyFitness Ep 87",
        date: "2026-01-18",
        verdict: "supported",
        contradictions: 0,
        receipts: [],
      },
    ],
  },
  {
    id: "johnson",
    name: "Bryan Johnson",
    handle: "bryanjohnson_",
    platform: "Social",
    claimCount: 89,
    calibrated: 61,
    mixed: 24,
    unsupported: 4,
    claims: [
      {
        id: "j1",
        quote: "In my Blueprint stack at 2 g/day. Modest effects.",
        episode: "Twitter · 2026-04-02",
        date: "2026-04-02",
        verdict: "supported",
        contradictions: 0,
        receipts: [],
      },
    ],
  },
];

const MOCK_PUBLISHED_STACKS: PublishedStack[] = [
  {
    id: "lena",
    title: "Lena's Longevity Stack",
    author: "Dr. Lena",
    credential: "Integrative-medicine MD, Toronto",
    subscribers: "14k",
    pricePerMonth: 8,
    isFree: false,
    gradeCore: "A",
    description:
      "Integrative-medicine MD. Evidence-graded protocols across longevity, hormones, metabolic. Updated monthly.",
    protocolCount: 12,
    updatedAt: "2026-04-30",
    hasTrial: true,
    trialDays: 14,
    noSponsorship: true,
    groups: [
      {
        name: "Cardio prevention core",
        count: 5,
        items: "ApoB targeting · Lp(a) workup · zone 2 · omega-3 · sleep",
      },
      {
        name: "Metabolic baseline",
        count: 3,
        items: "HbA1c · resistance training · time-restricted feeding",
      },
      {
        name: "Hormonal optimization",
        count: 4,
        items: "Thyroid panel · perimenopause · vit D · iron",
      },
    ],
  },
  {
    id: "yuki",
    title: "The Researcher's Stack",
    author: "Dr. Yuki Sato",
    credential: "Sleep + circadian researcher",
    subscribers: "2.1k",
    pricePerMonth: 0,
    isFree: true,
    gradeCore: "A",
    description: "Sleep, circadian rhythm, and recovery protocols backed by primary literature.",
    protocolCount: 8,
    updatedAt: "2026-04-10",
    hasTrial: false,
    noSponsorship: true,
    groups: [],
  },
  {
    id: "reilly",
    title: "Endurance Performance",
    author: "Coach M. Reilly",
    credential: "Athletic coach",
    subscribers: "6.8k",
    pricePerMonth: 5,
    isFree: false,
    gradeCore: "B",
    description: "Evidence-backed protocols for endurance athletes. Zone 2, VO₂max, recovery.",
    protocolCount: 10,
    updatedAt: "2026-03-28",
    hasTrial: false,
    noSponsorship: true,
    groups: [],
  },
];

const DEFAULT_STACK: Protocol[] = [
  {
    id: "creatine",
    name: "Creatine 5 g/day",
    status: "running",
    startDate: "2026-02-04",
    evidence: "A",
    dose: "5 g",
    timing: "Post-workout",
    outcome: "cognition + grip",
    outcomeMarker: "Cognition + Grip strength",
    hypothesis: "Improve working memory and strength",
    weeks: "ongoing",
    source: "PubMed",
    adherence: 96,
    timeline: [
      { title: "Started creatine", detail: "5 g/day post-workout", date: "Feb 04" },
      { title: "6-week check", detail: "Strength +8% on pull-ups", date: "Mar 18" },
    ],
  },
  {
    id: "zone2",
    name: "Zone 2, 180 min/wk",
    status: "running",
    startDate: "2025-11-10",
    evidence: "A",
    outcome: "VO₂max + HbA1c",
    outcomeMarker: "VO₂max",
    hypothesis: "Improve aerobic base and metabolic health",
    weeks: "ongoing",
    source: "Inigo San-Millan research",
    adherence: 88,
    timeline: [
      { title: "Started Zone 2 block", detail: "180 min/week target", date: "Nov 10" },
      { title: "VO₂max re-test", detail: "+2.1 mL/kg/min improvement", date: "Feb 14" },
    ],
  },
  {
    id: "berberine",
    name: "Berberine 500 mg ×3",
    status: "trial",
    startDate: "2026-02-12",
    evidence: "C",
    dose: "500 mg",
    timing: "×3 with meals",
    duration: "12 weeks",
    washout: "4 weeks",
    outcome: "Lower fasting glucose",
    outcomeMarker: "Fasting glucose",
    baseline: "Baseline",
    baselineValue: "98",
    baselineUnit: "mg/dL",
    currentValue: "91",
    hypothesis: "Reduce fasting glucose via AMPK pathway",
    weeks: "12-week trial",
    source: "InsightBlood",
    adherence: 89,
    readoutAvailable: true,
    timeline: [
      { title: "Started berberine", detail: "500 mg ×3, with meals", date: "Feb 12" },
      { title: "Adherence dip — travel", detail: "4 days missed", date: "Mar 18" },
      { title: "Mid-trial check-in", detail: "Subjective energy: same", date: "Apr 04" },
      { title: "Re-test prompt", detail: "Upload your week-12 panel", date: "Today" },
    ],
  },
  {
    id: "cold",
    name: "Cold plunge 3 ×/wk",
    status: "paused",
    startDate: "2026-01-15",
    evidence: "C",
    outcome: "Recovery + mood",
    outcomeMarker: "Subjective recovery",
    hypothesis: "Improve recovery and mood via norepinephrine",
    weeks: "paused",
    source: "PubMed",
    adherence: 72,
    timeline: [
      { title: "Started cold plunge", detail: "3×/week, 2 min at 10°C", date: "Jan 15" },
      { title: "Paused", detail: "No clear effect after 10 weeks", date: "Apr 22" },
    ],
  },
  {
    id: "taurine",
    name: "Taurine 2 g/day",
    status: "trial",
    startDate: "2026-05-08",
    evidence: "C",
    dose: "2 g",
    timing: "AM, w/ food",
    duration: "12 weeks",
    washout: "4 weeks",
    outcome: "SBP + ApoB",
    outcomeMarker: "Systolic BP + ApoB",
    hypothesis: "Reduce BP and improve lipid profile",
    weeks: "12-week trial",
    source: "InsightBlood",
    adherence: 100,
    timeline: [
      { title: "Started taurine", detail: "2 g/day with breakfast", date: "Today" },
    ],
  },
];

const DEFAULT_VERIFY_HISTORY: VerifyResult[] = [
  {
    id: "v1",
    claim: '"Mouth-taping improves sleep quality"',
    verdict: "mixed",
    source: "Instagram",
    interpretation:
      "Nasal breathing via mouth-taping improves sleep quality metrics in adults.",
    summary:
      "One small pilot study supports it. No large RCT. Mechanism plausible (nasal breathing). Safety concerns for certain conditions.",
    receipts: [],
    timestamp: "2 days ago",
  },
  {
    id: "v2",
    claim: '"Magnesium glycinate prevents migraine"',
    verdict: "supported",
    source: "Podcast",
    interpretation:
      "Magnesium supplementation reduces migraine frequency in adults with migraines.",
    summary:
      "Multiple RCTs and a Cochrane review support magnesium (any form) for migraine prophylaxis. Effect size moderate.",
    receipts: [],
    timestamp: "5 days ago",
  },
];

interface AppState {
  hasOnboarded: boolean;
  user: UserProfile;
  myStack: Protocol[];
  savedAnswers: Answer[];
  verifyHistory: VerifyResult[];
  followedTopics: string[];
  topics: Topic[];
  creators: Creator[];
  publishedStacks: PublishedStack[];
  setHasOnboarded: (v: boolean) => Promise<void>;
  setUser: (u: Partial<UserProfile>) => Promise<void>;
  addProtocol: (p: Protocol) => Promise<void>;
  updateProtocol: (id: string, updates: Partial<Protocol>) => Promise<void>;
  removeProtocol: (id: string) => Promise<void>;
  addAnswer: (a: Answer) => Promise<void>;
  addVerify: (v: VerifyResult) => Promise<void>;
  toggleFollowTopic: (id: string) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const DEFAULT_USER: UserProfile = {
  email: "marcus@example.com",
  initials: "MR",
  detailLevel: "full",
  tone: "direct",
  evidenceFloor: "a_to_c",
  topics: ["Longevity", "Sleep", "Cognition", "Metabolic", "Supplements"],
  joinedAt: "2026-01-01",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasOnboarded, setOnboardedState] = useState(false);
  const [user, setUserState] = useState<UserProfile>(DEFAULT_USER);
  const [myStack, setMyStack] = useState<Protocol[]>(DEFAULT_STACK);
  const [savedAnswers, setSavedAnswers] = useState<Answer[]>([]);
  const [verifyHistory, setVerifyHistory] =
    useState<VerifyResult[]>(DEFAULT_VERIFY_HISTORY);
  const [followedTopics, setFollowedTopics] = useState<string[]>([
    "rapamycin",
    "creatine",
  ]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        const [
          onboarded,
          userStr,
          stackStr,
          answersStr,
          verifyStr,
          topicsStr,
        ] = await Promise.all([
          AsyncStorage.getItem("onboarded"),
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("myStack"),
          AsyncStorage.getItem("savedAnswers"),
          AsyncStorage.getItem("verifyHistory"),
          AsyncStorage.getItem("followedTopics"),
        ]);
        if (onboarded) setOnboardedState(true);
        if (userStr) setUserState(JSON.parse(userStr) as UserProfile);
        if (stackStr) setMyStack(JSON.parse(stackStr) as Protocol[]);
        if (answersStr) setSavedAnswers(JSON.parse(answersStr) as Answer[]);
        if (verifyStr) setVerifyHistory(JSON.parse(verifyStr) as VerifyResult[]);
        if (topicsStr) setFollowedTopics(JSON.parse(topicsStr) as string[]);
      } catch (e) {
        // ignore
      }
      setLoaded(true);
    }
    loadState();
  }, []);

  const setHasOnboarded = useCallback(async (v: boolean) => {
    setOnboardedState(v);
    await AsyncStorage.setItem("onboarded", v ? "1" : "");
  }, []);

  const setUser = useCallback(async (updates: Partial<UserProfile>) => {
    setUserState((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const addProtocol = useCallback(async (p: Protocol) => {
    setMyStack((prev) => {
      const next = [p, ...prev];
      AsyncStorage.setItem("myStack", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProtocol = useCallback(
    async (id: string, updates: Partial<Protocol>) => {
      setMyStack((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
        AsyncStorage.setItem("myStack", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeProtocol = useCallback(async (id: string) => {
    setMyStack((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem("myStack", JSON.stringify(next));
      return next;
    });
  }, []);

  const addAnswer = useCallback(async (a: Answer) => {
    setSavedAnswers((prev) => {
      const next = [a, ...prev];
      AsyncStorage.setItem("savedAnswers", JSON.stringify(next));
      return next;
    });
  }, []);

  const addVerify = useCallback(async (v: VerifyResult) => {
    setVerifyHistory((prev) => {
      const next = [v, ...prev];
      AsyncStorage.setItem("verifyHistory", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFollowTopic = useCallback(async (id: string) => {
    setFollowedTopics((prev) => {
      const next = prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id];
      AsyncStorage.setItem("followedTopics", JSON.stringify(next));
      return next;
    });
  }, []);

  const upgradeToPremium = useCallback(async () => {
    setUserState((prev) => {
      const next = { ...prev, isPremium: true };
      AsyncStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        hasOnboarded,
        user,
        myStack,
        savedAnswers,
        verifyHistory,
        followedTopics,
        topics: MOCK_TOPICS,
        creators: MOCK_CREATORS,
        publishedStacks: MOCK_PUBLISHED_STACKS,
        setHasOnboarded,
        setUser,
        addProtocol,
        updateProtocol,
        removeProtocol,
        addAnswer,
        addVerify,
        toggleFollowTopic,
        upgradeToPremium,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
