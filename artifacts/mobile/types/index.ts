export type GradeLevel = "A" | "B" | "C" | "D";
export type StackStatus = "running" | "trial" | "paused" | "done";
export type VerdictType = "supported" | "mixed" | "contradicted";
export type DetailLevel = "gist" | "full" | "max";
export type ToneType = "direct" | "encouraging" | "facts";
export type EvidenceFloor = "a_only" | "a_to_c" | "all";

export interface Receipt {
  id: string;
  title: string;
  cite: string;
  grade: GradeLevel;
  studyType: string;
  tags: string[];
  plainEnglish?: string;
  fundingFlag?: string;
  qualityFlags?: string[];
  whyMatters?: string;
}

export interface Answer {
  id: string;
  question: string;
  grade: GradeLevel;
  gradeLabel: string;
  headline: string;
  summary: string;
  takeaways: string[];
  receipts: Receipt[];
  contradictions: number;
  timestamp: string;
  duration: string;
  sourceCount: number;
}

export interface VerifyResult {
  id: string;
  claim: string;
  source?: string;
  interpretation?: string;
  verdict: VerdictType;
  summary: string;
  receipts: Receipt[];
  timestamp: string;
}

export interface TimelineEvent {
  title: string;
  detail: string;
  date: string;
}

export interface Protocol {
  id: string;
  name: string;
  status: StackStatus;
  startDate: string;
  evidence: GradeLevel;
  dose?: string;
  timing?: string;
  duration?: string;
  washout?: string;
  outcome?: string;
  outcomeMarker?: string;
  baseline?: string;
  baselineValue?: string;
  baselineUnit?: string;
  currentValue?: string;
  adherence?: number;
  hypothesis?: string;
  weeks?: string;
  source?: string;
  timeline: TimelineEvent[];
  readoutAvailable?: boolean;
}

export interface ContradictionItem {
  title: string;
  description: string;
  chips: string[];
}

export interface Topic {
  id: string;
  title: string;
  grade: GradeLevel;
  gradeLabel: string;
  paperCount: number;
  contradictions: number;
  lastUpdated: string;
  summary: string;
  openQuestions: string[];
  keyPapers: Receipt[];
  contradictionDetails: ContradictionItem[];
  followed?: boolean;
}

export interface CreatorClaim {
  id: string;
  quote: string;
  episode: string;
  date: string;
  verdict: VerdictType;
  contradictions: number;
  receipts: Receipt[];
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  claimCount: number;
  calibrated: number;
  mixed: number;
  unsupported: number;
  claims: CreatorClaim[];
}

export interface PublishedStack {
  id: string;
  title: string;
  author: string;
  credential: string;
  subscribers: string;
  pricePerMonth: number;
  isFree: boolean;
  gradeCore: GradeLevel;
  description: string;
  protocolCount: number;
  updatedAt: string;
  hasTrial: boolean;
  trialDays?: number;
  noSponsorship: boolean;
  groups: { name: string; count: number; items: string }[];
}

export interface UserProfile {
  email: string;
  initials: string;
  detailLevel: DetailLevel;
  tone: ToneType;
  evidenceFloor: EvidenceFloor;
  topics: string[];
  joinedAt: string;
  isPremium?: boolean;
}
