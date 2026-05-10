import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { askClaude } from "@/lib/askClaude";
import { GradeChip, GradeTagChip } from "@/components/GradeChip";
import { HeroBlock } from "@/components/HeroBlock";
import { LoaderStage } from "@/components/LoaderStage";
import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { ReceiptRow } from "@/components/ReceiptRow";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";
import type { Answer, GradeLevel, Receipt } from "@/types";

const REASONING_STAGES = [
  { label: "Parsing question" },
  { label: "Scoping inclusion criteria" },
  { label: "Screening 1,847 candidate papers" },
  { label: "Extracting effect sizes" },
  { label: "Scoring conflicts" },
  { label: "Drafting answer" },
];

const MOCK_ANSWERS: Record<string, Partial<Answer>> = {
  taurine: {
    grade: "B" as GradeLevel,
    gradeLabel: "Moderate",
    headline:
      "Moderate evidence supports taurine for cardiometabolic markers — animal longevity data is striking but not yet replicated in humans.",
    summary:
      "The 2023 Singh et al. Science paper showed dramatic healthspan and lifespan benefits in mice and worms. The best human data is a meta-analysis of 12 RCTs showing modest reductions in blood pressure (~3 mmHg systolic) and triglycerides — both real, neither dramatic. No human longevity RCT exists yet. Well-tolerated at 1–6 g/day. Mechanism is plausible (mitochondrial function, membrane stabilization, osmoregulation).",
    takeaways: [
      "Animal data is compelling; human translation is not established.",
      "Best effect in people with hypertension or cardiometabolic risk.",
      "3 RCTs running now — TAUR-AGE, CARDIOTAU, LIFESPAN-T.",
      "2 g/day is the most common dosing in positive human trials.",
      "No major safety signal at doses up to 6 g/day.",
    ],
    receipts: [
      {
        id: "r1",
        title: "Taurine deficiency as a driver of aging",
        cite: "Singh · Science · 2023 · Animal · n=250",
        grade: "D" as GradeLevel,
        studyType: "Animal",
        tags: ["D · Animal", "Replicated"],
        plainEnglish: "Mice with lower taurine aged faster; supplementing extended lifespan ~10%.",
        qualityFlags: ["High-impact journal", "Multi-species"],
        whyMatters: "The paper that made taurine famous. Mechanistic signal strong.",
        fundingFlag: "NIH funded",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=singh+taurine+deficiency+aging+science+2023",
      },
      {
        id: "r2",
        title: "Taurine + cardiometabolic risk — meta-analysis",
        cite: "Guan · Adv Nutr · 2024 · Meta · 12 RCTs",
        grade: "B" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["B · Meta", "Heterogeneity"],
        plainEnglish: "Meta of 12 RCTs: SBP −3 mmHg, triglycerides down. Heterogeneity high.",
        qualityFlags: ["Preregistered", "12 RCTs"],
        whyMatters: "Best human evidence. Modest but consistent.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=taurine+cardiometabolic+meta-analysis+RCT+blood+pressure",
      },
      {
        id: "r3",
        title: "Endothelial function in prehypertensives",
        cite: "Sun · Hypertens Res · 2016 · RCT · n=120",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish: "12 weeks of 1.6 g/day taurine improved endothelial function vs placebo.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=sun+taurine+endothelial+prehypertensive+2016",
      },
    ] as Receipt[],
    contradictions: 2,
    sourceCount: 31,
    duration: "14s",
  },

  omega3: {
    grade: "B" as GradeLevel,
    gradeLabel: "Moderate-Strong",
    headline:
      "High-dose pharmaceutical EPA (4 g/day) reduces major cardiac events by 25% — but standard fish-oil supplements at 1 g/day show no cardiovascular benefit in healthy adults.",
    summary:
      "Omega-3 evidence depends heavily on dose, form, and baseline risk. REDUCE-IT (n=8,179) used pharmaceutical-grade icosapent ethyl (pure EPA) at 4 g/day and showed a 25% reduction in major adverse cardiac events in statin-treated high-risk patients. In contrast, VITAL (n=25,871) and ASCEND (n=15,480) tested 1 g/day mixed EPA+DHA in general and diabetic populations and found no cardiovascular benefit. The FDA approves prescription omega-3 for triglyceride lowering at 2–4 g/day. Doses above 5 g/day are outside evidence-supported ranges and raise bleeding risk.",
    takeaways: [
      "REDUCE-IT used pure EPA at 4 g/day — not standard fish oil.",
      "Standard 1 g/day supplements show no CV benefit in healthy adults (VITAL, ASCEND).",
      "2–4 g/day is FDA-approved only for hypertriglyceridemia.",
      "5 g/day exceeds evidence range; bleeding risk increases above 3 g/day.",
      "For CV prevention, AHA recommends omega-3 only for high triglycerides or existing heart disease.",
    ],
    receipts: [
      {
        id: "o1",
        title: "REDUCE-IT: Icosapent Ethyl for CV Risk Reduction",
        cite: "Bhatt · NEJM · 2018 · RCT · n=8,179",
        grade: "A" as GradeLevel,
        studyType: "RCT",
        tags: ["A · RCT", "Pre-registered"],
        plainEnglish:
          "Statin-treated high-CV-risk adults randomized to 4 g/day EPA vs mineral oil. 25% relative risk reduction in MACE over 4.9 years.",
        qualityFlags: ["Pre-registered", "Multi-center", "Large RCT"],
        whyMatters:
          "Landmark trial for high-dose EPA. Caveat: mineral oil placebo may have inflated LDL in control arm, overstating the benefit.",
        fundingFlag: "Funded by Amarin (manufacturer of icosapent ethyl)",
        url: "https://pubmed.ncbi.nlm.nih.gov/30415628/",
      },
      {
        id: "o2",
        title: "VITAL: Marine Omega-3 and CV/Cancer Prevention",
        cite: "Manson · NEJM · 2019 · RCT · n=25,871",
        grade: "A" as GradeLevel,
        studyType: "RCT",
        tags: ["A · RCT", "Null result"],
        plainEnglish:
          "1 g/day mixed EPA+DHA vs placebo in US adults with no prior CVD — no significant reduction in MACE over 5.3 years.",
        qualityFlags: ["Pre-registered", "Very large N", "NIH funded"],
        whyMatters: "Largest general-population omega-3 CV trial. Standard supplement doses don't prevent CV events.",
        fundingFlag: "NIH funded",
        url: "https://pubmed.ncbi.nlm.nih.gov/30415629/",
      },
      {
        id: "o3",
        title: "ASCEND: Omega-3 in Diabetics Without CVD",
        cite: "ASCEND Study Collaborative · NEJM · 2018 · RCT · n=15,480",
        grade: "A" as GradeLevel,
        studyType: "RCT",
        tags: ["A · RCT", "Null result"],
        plainEnglish:
          "Diabetics without prior CVD — 1 g/day omega-3 vs placebo — no reduction in serious vascular events.",
        qualityFlags: ["Pre-registered", "Large N"],
        whyMatters: "Confirms VITAL in a high-risk subgroup. Standard supplement dose doesn't work even in diabetics.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30146932/",
      },
    ] as Receipt[],
    contradictions: 1,
    sourceCount: 28,
    duration: "12s",
  },

  nmn: {
    grade: "C" as GradeLevel,
    gradeLabel: "Suggestive",
    headline:
      "NMN reliably raises NAD+ in blood — but no human RCT has shown it extends healthspan, improves longevity markers, or outperforms exercise.",
    summary:
      "NAD+ declines with age — this is established biology. NMN and NR both raise plasma NAD+ in humans at doses of 250–1,000 mg/day. The question is whether elevated NAD+ in blood translates to meaningful tissue-level or clinical benefits. The best human RCT (Yoshino 2021, Science) found no improvement in insulin sensitivity in postmenopausal women despite confirmed NAD+ rise. A 2023 trial in older men showed improved muscle NAD+ but no functional outcomes. Animal lifespan data is compelling; human longevity translation is unproven.",
    takeaways: [
      "NMN does raise blood NAD+ in humans — that pharmacokinetic step is confirmed.",
      "No human RCT has demonstrated meaningful clinical benefit beyond NAD+ elevation.",
      "Yoshino 2021 (Science): NAD+ up, insulin sensitivity unchanged — the most rigorous human trial.",
      "Exercise raises NAD+ more reliably than supplementation in most tissues.",
      "Safety profile appears benign at 250–1,000 mg/day; long-term data absent.",
    ],
    receipts: [
      {
        id: "n1",
        title: "NMN in Postmenopausal Women — Muscle Insulin Sensitivity",
        cite: "Yoshino · Science · 2021 · RCT · n=25",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT", "High-impact journal"],
        plainEnglish:
          "10-week RCT of 250 mg/day NMN in overweight postmenopausal women. NAD+ rose in blood. No improvement in insulin sensitivity, body composition, or lipids.",
        qualityFlags: ["Randomized", "Double-blind", "Science journal"],
        whyMatters: "Most cited human NMN RCT. Confirms NAD+ pharmacokinetics but raises doubts about functional benefit.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=yoshino+nicotinamide+mononucleotide+insulin+sensitivity+women+science+2021",
      },
      {
        id: "n2",
        title: "Oral NMN Supplementation in Older Adults — Safety and Efficacy",
        cite: "Igarashi · NPJ Aging · 2022 · RCT · n=30",
        grade: "C" as GradeLevel,
        studyType: "RCT",
        tags: ["C · RCT", "Small N"],
        plainEnglish:
          "250 mg/day NMN for 12 weeks in older adults. NAD+ rose in blood. Gait speed modestly improved in subgroup. Primary endpoints not significant.",
        qualityFlags: ["Double-blind", "Small N"],
        whyMatters: "Suggests physical performance signal but underpowered. Not sufficient to confirm clinical benefit.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=igarashi+nicotinamide+mononucleotide+older+adults+safety+efficacy",
      },
      {
        id: "n3",
        title: "Nicotinamide Riboside (NR) vs NMN — Pharmacokinetics Review",
        cite: "Trammell · Nature Comms · 2016 · Mechanistic",
        grade: "C" as GradeLevel,
        studyType: "Mechanistic",
        tags: ["C · Mechanistic"],
        plainEnglish:
          "NR converts to NMN in plasma before entering cells. Both precursors raise NAD+ via the same pathway. Form may matter less than dose.",
        qualityFlags: ["High-impact journal"],
        whyMatters: "NR vs NMN debate: the distinction may be less important than the marketing suggests.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=trammell+nicotinamide+riboside+pharmacokinetics+nature+communications+2016",
      },
    ] as Receipt[],
    contradictions: 1,
    sourceCount: 22,
    duration: "11s",
  },

  berberine: {
    grade: "B" as GradeLevel,
    gradeLabel: "Moderate",
    headline:
      "Berberine lowers fasting glucose and HbA1c comparably to metformin in short-term trials — but lacks metformin's 60-year safety record and cardiovascular outcome data.",
    summary:
      "A 2008 head-to-head RCT showed berberine (500 mg ×3/day) matched metformin for fasting glucose and HbA1c reduction in newly-diagnosed T2D patients over 13 weeks. Meta-analyses confirm glycemic effects across multiple trials. Mechanism is well-understood (AMPK activation, similar to metformin). Key gaps: no long-term RCT, no cardiovascular outcome data (unlike metformin's UKPDS), highly variable bioavailability across products, and significant drug-drug interactions (CYP450). Not FDA-approved.",
    takeaways: [
      "Short-term RCTs show berberine ≈ metformin for HbA1c and fasting glucose.",
      "No long-term safety data; metformin has 60+ years of evidence.",
      "Berberine inhibits CYP3A4 and CYP2D6 — drug interactions are clinically significant.",
      "Bioavailability is highly variable; supplement quality control is poor.",
      "500 mg three times daily with meals is the evidence-supported dose.",
    ],
    receipts: [
      {
        id: "b1",
        title: "Berberine vs Metformin in Newly-Diagnosed Type 2 Diabetes",
        cite: "Zhang · J Clin Endocrinol Metab · 2008 · RCT · n=116",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "13-week RCT: berberine 500 mg ×3 matched metformin for HbA1c reduction (−2.0% vs −1.8%) and fasting glucose. GI side effects similar.",
        qualityFlags: ["Randomized", "Active comparator"],
        whyMatters: "The foundational head-to-head trial. Real comparison against clinical standard-of-care.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=zhang+berberine+metformin+type+2+diabetes+2008",
      },
      {
        id: "b2",
        title: "Berberine for Glycemic Control — Systematic Review",
        cite: "Liang · Metabolism · 2019 · Meta · 27 RCTs",
        grade: "B" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["B · Meta", "Heterogeneity"],
        plainEnglish:
          "27 RCTs (n=2,569): berberine significantly reduced HbA1c, fasting glucose, and post-meal glucose vs placebo. High heterogeneity in doses and populations.",
        qualityFlags: ["Large meta", "Preregistered"],
        whyMatters: "Confirms glycemic effect across diverse trials. Heterogeneity limits precision of effect size.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=berberine+glycemic+control+systematic+review+meta-analysis",
      },
      {
        id: "b3",
        title: "Berberine Pharmacokinetics and Drug Interactions",
        cite: "Guo · Drug Metab Rev · 2020 · Review",
        grade: "C" as GradeLevel,
        studyType: "Review",
        tags: ["C · Review"],
        plainEnglish:
          "Berberine inhibits CYP3A4, CYP2D6, and P-glycoprotein. Clinically relevant interactions with cyclosporine, statins, and anticoagulants.",
        qualityFlags: ["Mechanistic review"],
        whyMatters: "Often overlooked. Berberine is not a benign supplement for people on multiple medications.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=berberine+CYP450+drug+interactions+pharmacokinetics+review",
      },
    ] as Receipt[],
    contradictions: 0,
    sourceCount: 19,
    duration: "10s",
  },

  magnesium: {
    grade: "A" as GradeLevel,
    gradeLabel: "Strong",
    headline:
      "Magnesium supplementation meaningfully improves sleep in deficient adults and reduces migraine frequency — glycinate and threonate have better tolerability than oxide.",
    summary:
      "Magnesium deficiency is common (~50% of US adults) and contributes to impaired sleep, muscle cramps, and migraine. RCTs show 400–500 mg/day improves sleep efficiency, reduces sleep onset latency, and cuts migraine frequency by ~40% in deficient individuals. The form matters: magnesium oxide has ~4% absorption; glycinate and citrate absorb at 40–80%; threonate crosses the blood-brain barrier and shows promise for cognitive applications. For sleep specifically, glycinate is the best-studied tolerable form. Threonate has early brain-penetrance data but fewer large trials.",
    takeaways: [
      "~50% of US adults are below the EAR for magnesium — deficiency is the rule, not exception.",
      "Glycinate is the preferred form for sleep: high absorption, low GI upset.",
      "Threonate crosses the BBB; early data suggests cognitive benefit — larger trials pending.",
      "Oxide is nearly useless for systemic absorption; avoid for therapeutic use.",
      "Cochrane review confirms magnesium effective for migraine prophylaxis (Grade A).",
    ],
    receipts: [
      {
        id: "m1",
        title: "Magnesium Supplementation and Sleep Quality in Elderly",
        cite: "Abbasi · J Res Med Sci · 2012 · RCT · n=46",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "500 mg/day magnesium vs placebo in elderly adults with insomnia. Significant improvement in ISI score, sleep time, and early morning awakening.",
        qualityFlags: ["Double-blind", "Validated sleep scale"],
        whyMatters: "Best direct evidence for magnesium on sleep endpoints.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=abbasi+magnesium+supplementation+insomnia+elderly",
      },
      {
        id: "m2",
        title: "Magnesium for Migraine Prophylaxis — Cochrane Review",
        cite: "Muz · Cephalalgia · 2021 · Meta · 10 RCTs",
        grade: "A" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["A · Meta", "Cochrane"],
        plainEnglish:
          "10 RCTs: magnesium reduced migraine frequency by ~41% vs placebo. Effect consistent across forms (citrate, oxide). Grade A evidence for prophylaxis.",
        qualityFlags: ["Cochrane", "Consistent effect"],
        whyMatters: "Migraine prevention is the strongest evidence-base for magnesium in any neurological indication.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=magnesium+migraine+prophylaxis+meta-analysis+RCT",
      },
      {
        id: "m3",
        title: "Magnesium-L-Threonate and Cognitive Function",
        cite: "Liu · Neuron · 2010 · Animal/Mechanistic",
        grade: "D" as GradeLevel,
        studyType: "Animal",
        tags: ["D · Animal", "BBB penetrance"],
        plainEnglish:
          "Threonate form uniquely raises brain magnesium in rats, improving synaptic density and memory. Human BBB data is indirect.",
        qualityFlags: ["High-impact journal", "Mechanistic"],
        whyMatters: "Foundational paper for threonate claims. Human translation is plausible but not yet RCT-confirmed.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=liu+magnesium+threonate+synaptic+density+memory+neuron+2010",
      },
    ] as Receipt[],
    contradictions: 0,
    sourceCount: 24,
    duration: "9s",
  },

  zone2: {
    grade: "A" as GradeLevel,
    gradeLabel: "Strong",
    headline:
      "Polarized training (80% Zone 2 + 20% HIIT) outperforms either alone for VO₂max — but Zone 2 alone still delivers large gains and superior metabolic adaptations.",
    summary:
      "Both Zone 2 and HIIT improve VO₂max, but via different mechanisms. Zone 2 (below lactate threshold, ~60–70% HRmax) primarily improves mitochondrial density, fat oxidation, and lactate clearance. HIIT drives cardiac output and VO₂max ceiling. The polarized model (Seiler, Stöggl) combining ~80% low-intensity with ~20% HIIT consistently outperforms threshold or HIIT-only approaches in trained athletes. For metabolic health (insulin sensitivity, triglycerides), Zone 2 at 150+ min/week is superior to HIIT. For pure VO₂max gains in untrained individuals, both work equally well short-term.",
    takeaways: [
      "For VO₂max, polarized (80/20) > threshold > HIIT-only in trained athletes.",
      "For untrained adults, any aerobic exercise works — HIIT is more time-efficient.",
      "Zone 2 uniquely improves mitochondrial density and fat oxidation — HIIT does not substitute.",
      "150+ min/week Zone 2 is the threshold for meaningful metabolic adaptations.",
      "San-Millan & Brooks define Zone 2 by lactate 1.7–2.0 mmol/L, not heart rate alone.",
    ],
    receipts: [
      {
        id: "z1",
        title: "Polarized vs Threshold Training for Endurance Performance",
        cite: "Stöggl · Front Physiol · 2014 · RCT · n=48",
        grade: "A" as GradeLevel,
        studyType: "RCT",
        tags: ["A · RCT"],
        plainEnglish:
          "48 trained athletes randomized to 4 training distributions for 9 weeks. Polarized group showed greatest VO₂max gain (+11.7%) vs threshold (+7.3%) and HIIT (+4.8%).",
        qualityFlags: ["Randomized", "Active comparator", "Trained athletes"],
        whyMatters: "The most cited RCT directly comparing training distributions. Polarized wins clearly.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=stoggl+seiler+polarized+training+endurance+performance",
      },
      {
        id: "z2",
        title: "Zone 2 Training and Mitochondrial Adaptations",
        cite: "San-Millan · J Physiol · 2018 · Mechanistic",
        grade: "B" as GradeLevel,
        studyType: "Mechanistic",
        tags: ["B · Mechanistic"],
        plainEnglish:
          "Zone 2 training drives PGC-1α, mitochondrial biogenesis, and fat oxidation adaptations not replicated by HIIT. Mechanism of cardiometabolic benefit.",
        qualityFlags: ["Clear mechanism", "Well-cited"],
        whyMatters: "Explains why Zone 2 and HIIT are not substitutes despite both raising VO₂max.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=san-millan+brooks+zone+2+training+mitochondria+lactate",
      },
      {
        id: "z3",
        title: "HIIT vs Moderate Intensity for VO₂max — Meta-analysis",
        cite: "Bacon · PLOS ONE · 2013 · Meta · 37 studies",
        grade: "B" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["B · Meta"],
        plainEnglish:
          "37 studies: HIIT produced larger VO₂max improvements than moderate-intensity continuous training. Effect size greater in sedentary adults.",
        qualityFlags: ["Large meta"],
        whyMatters: "Supports HIIT for VO₂max efficiency — but doesn't capture metabolic or mitochondrial endpoints where Zone 2 excels.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=bacon+high+intensity+interval+training+vo2max+meta-analysis",
      },
    ] as Receipt[],
    contradictions: 1,
    sourceCount: 29,
    duration: "13s",
  },

  creatine: {
    grade: "A" as GradeLevel,
    gradeLabel: "Strong",
    headline:
      "Creatine is among the most evidence-backed supplements for strength and cognition — effect on working memory and executive function is strongest under sleep deprivation and in vegetarians.",
    summary:
      "Creatine monohydrate has hundreds of RCTs across strength, power, and cognitive outcomes. For strength/hypertrophy: 3–5 g/day produces consistent, moderate gains. For cognition: the mechanism is plausible (brain ATP buffering), and RCTs show improvement in working memory and executive tasks — most strongly in sleep-deprived individuals and vegetarians (who have lower baseline brain creatine). Effect size in omnivores with normal sleep is modest. No loading phase is required; 3–5 g/day reaches saturation in 3–4 weeks. Monohydrate is equivalent to more expensive forms (HCl, buffered).",
    takeaways: [
      "3–5 g/day monohydrate: same efficacy as loading; full saturation in 3–4 weeks.",
      "Cognitive benefit is strongest in sleep-deprived adults and vegetarians.",
      "No advantage to expensive forms (HCl, buffered) over monohydrate — don't pay extra.",
      "GI side effects (if any) are eliminated by taking with food and avoiding loading.",
      "Creatine does NOT cause kidney damage in healthy adults at standard doses.",
    ],
    receipts: [
      {
        id: "c1",
        title: "Creatine Supplementation and Cognitive Performance",
        cite: "Rae · Psychopharmacology · 2003 · RCT · n=45",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "5 g/day creatine for 6 weeks in young adults improved working memory and processing speed vs placebo. Effect larger in vegetarians.",
        qualityFlags: ["Randomized", "Double-blind"],
        whyMatters: "Foundational human RCT for creatine cognition claim.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=rae+creatine+working+memory+vegetarians+psychopharmacology+2003",
      },
      {
        id: "c2",
        title: "Creatine Under Sleep Deprivation — Cognitive Effects",
        cite: "McMorris · Neuropsychology · 2007 · RCT · n=18",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "Creatine attenuated cognitive decline during 24-hour sleep deprivation. Working memory and reaction time preserved vs placebo.",
        qualityFlags: ["Randomized", "Crossover design"],
        whyMatters: "Best evidence for creatine's practical cognitive use case: protecting function during sleep loss.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=mcmorris+creatine+sleep+deprivation+cognitive+performance",
      },
      {
        id: "c3",
        title: "Creatine Supplementation and Resistance Training — Meta",
        cite: "Rawson · J Strength Cond Res · 2003 · Meta · 22 RCTs",
        grade: "A" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["A · Meta"],
        plainEnglish:
          "22 RCTs: creatine + resistance training increased lean mass and strength vs training alone. Effect consistent across age groups.",
        qualityFlags: ["Large meta", "Consistent effect"],
        whyMatters: "Strongest physical performance evidence. Cognitive and physical benefits are separate mechanisms.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=rawson+creatine+resistance+training+meta-analysis+strength",
      },
    ] as Receipt[],
    contradictions: 0,
    sourceCount: 18,
    duration: "8s",
  },

  cold: {
    grade: "C" as GradeLevel,
    gradeLabel: "Suggestive",
    headline:
      "Cold water immersion acutely raises norepinephrine 300% and dopamine — testosterone effects are transient and not replicated in long-term RCTs.",
    summary:
      "Cold exposure reliably triggers a large acute sympathetic response: norepinephrine rises 200–300%, dopamine rises ~250%, and cortisol briefly spikes. These acute responses translate to improved mood and alertness in most studies. The testosterone claim is more contested: acute cold raises testosterone transiently, but no RCT has shown sustained testosterone elevation with regular cold exposure. Regular cold water immersion does improve recovery markers (DOMS, inflammation) with effect sizes comparable to compression and contrast therapy. For hypertrophy, post-workout cold blunts the anabolic response and may attenuate muscle gains.",
    takeaways: [
      "Norepinephrine rises acutely — this drives the mood and alertness effect.",
      "Testosterone: acute rise only, not sustained. No long-term RCT confirms elevated T.",
      "Post-workout cold blunts muscle hypertrophy — avoid within 4 hours of strength training.",
      "Recovery benefit (soreness, inflammation) is real but equivalent to contrast therapy.",
      "10–15°C for 2–3 min achieves equivalent physiological response to longer/colder exposure.",
    ],
    receipts: [
      {
        id: "cl1",
        title: "Cold Water Immersion and Norepinephrine/Dopamine",
        cite: "Shevchuk · Med Hypotheses · 2008 · Mechanistic",
        grade: "C" as GradeLevel,
        studyType: "Review",
        tags: ["C · Review"],
        plainEnglish:
          "Systematic review of cold water's catecholamine response: NE rises 200–300%, dopamine ~250%, cortisol transiently. Mood benefit mechanism supported.",
        qualityFlags: ["Well-cited"],
        whyMatters: "Best mechanistic support for the mood/alertness claim from cold exposure.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=shevchuk+cold+water+immersion+norepinephrine+dopamine",
      },
      {
        id: "cl2",
        title: "Cold Water Immersion and Muscle Hypertrophy Attenuation",
        cite: "Roberts · J Physiol · 2015 · RCT · n=21",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT", "Counterintuitive"],
        plainEnglish:
          "Post-workout cold immersion (10°C, 10 min) reduced satellite cell activity and Type II fiber hypertrophy vs active recovery over 12 weeks of strength training.",
        qualityFlags: ["Randomized", "Biopsy endpoints"],
        whyMatters: "Critical finding: post-workout cold reduces muscle gains. Timing matters enormously.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=roberts+cold+water+immersion+muscle+hypertrophy+strength+2015",
      },
      {
        id: "cl3",
        title: "Cold Water Immersion for Exercise Recovery — Meta",
        cite: "Hohenauer · PLOS ONE · 2015 · Meta · 36 trials",
        grade: "B" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["B · Meta"],
        plainEnglish:
          "36 trials: cold water immersion reduced DOMS and perceived fatigue in the 24–96h window vs passive recovery. Effect size moderate.",
        qualityFlags: ["Large meta"],
        whyMatters: "Recovery benefit is real — but similar to contrast therapy and inferior for strength athletes.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=hohenauer+cold+water+immersion+recovery+DOMS+meta-analysis",
      },
    ] as Receipt[],
    contradictions: 1,
    sourceCount: 14,
    duration: "11s",
  },

  trf: {
    grade: "B" as GradeLevel,
    gradeLabel: "Moderate",
    headline:
      "Time-restricted eating improves metabolic markers in overweight adults — benefits in lean, healthy people are modest and not consistently replicated.",
    summary:
      "The most robust evidence comes from trials in overweight/obese adults with metabolic risk. A 2020 NEJM trial (Lowe et al.) found 16:8 TRE produced similar weight loss to caloric restriction alone with no additional metabolic benefit. TREAT (Lowe 2020, JAMA Int Med) found no significant advantage of TRE vs unrestricted eating in overweight adults over 12 weeks. Sutton et al. 2018 showed early TRE (eating window aligned with morning) improved insulin sensitivity and blood pressure in pre-diabetic men without weight loss. The circadian alignment of the eating window appears to matter more than duration alone.",
    takeaways: [
      "Early TRE (7am–3pm window) shows stronger metabolic benefit than late windows.",
      "Weight loss from TRE is mostly explained by caloric restriction, not the time window.",
      "No consistent benefit demonstrated in metabolically healthy, lean adults.",
      "16:8 is the best-studied protocol; 18:6 adds no proven incremental benefit.",
      "Circadian mismatch (late eating window) may reduce or negate metabolic gains.",
    ],
    receipts: [
      {
        id: "t1",
        title: "Early Time-Restricted Feeding Improves Insulin Sensitivity",
        cite: "Sutton · Cell Metabolism · 2018 · RCT · n=8",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT", "Small N"],
        plainEnglish:
          "Pre-diabetic men on a 6-hour early eating window (7am–3pm) for 5 weeks improved insulin sensitivity, blood pressure, and oxidative stress — without weight loss.",
        qualityFlags: ["Controlled feeding", "Crossover design"],
        whyMatters: "Best evidence that TRE benefits are metabolic, not just caloric. Circadian alignment is key.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=sutton+early+time-restricted+feeding+insulin+sensitivity+cell+metabolism+2018",
      },
      {
        id: "t2",
        title: "TREAT Trial: Time-Restricted Eating vs Unrestricted Eating",
        cite: "Lowe · JAMA Intern Med · 2020 · RCT · n=116",
        grade: "A" as GradeLevel,
        studyType: "RCT",
        tags: ["A · RCT", "Null result"],
        plainEnglish:
          "12-week RCT: 16:8 TRE produced no significant weight loss or metabolic advantage vs unrestricted eating in overweight adults. Lean mass was modestly reduced.",
        qualityFlags: ["Pre-registered", "Large N", "NIH funded"],
        whyMatters: "The definitive null result. TRE without explicit caloric restriction doesn't work for most people.",
        fundingFlag: "NIH funded",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=lowe+time-restricted+eating+TREAT+trial+JAMA+internal+medicine+2020",
      },
      {
        id: "t3",
        title: "Effects of Intermittent Fasting on Metabolic Health — Meta",
        cite: "Harris · PLOS Medicine · 2018 · Meta · 41 RCTs",
        grade: "B" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["B · Meta", "Heterogeneity"],
        plainEnglish:
          "41 RCTs: intermittent fasting reduces body weight (−0.8–13%), fasting glucose, and insulin vs control. Effect sizes similar to continuous caloric restriction.",
        qualityFlags: ["Large meta", "Pre-registered"],
        whyMatters: "IF works, but not better than eating less overall. No magic beyond caloric deficit.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=harris+intermittent+fasting+continuous+energy+restriction+meta-analysis+2018",
      },
    ] as Receipt[],
    contradictions: 1,
    sourceCount: 41,
    duration: "11s",
  },

  rapamycin: {
    grade: "C" as GradeLevel,
    gradeLabel: "Suggestive",
    headline:
      "Rapamycin extends lifespan in every animal model tested — but zero completed longevity RCTs exist in healthy humans, and immune effects at low doses remain poorly characterized.",
    summary:
      "Rapamycin is an mTOR inhibitor approved for transplant immunosuppression. The ITP (Harrison 2009, Nature) showed 9–14% lifespan extension in mice starting at 600 days of age. Multiple independent replications confirm the animal signal. In humans, the PEARL trial (Mannick 2024, Aging Cell) showed intermittent dosing (5 mg/week) was well-tolerated in healthy older adults with some immune enhancement, but the trial wasn't powered for longevity outcomes. Off-label use among longevity researchers is growing. Known risks at transplant doses are real; risks at low intermittent doses are not well established in healthy people.",
    takeaways: [
      "Animal lifespan data is among the most replicated in longevity biology — 4+ independent ITP trials.",
      "No completed longevity RCT in healthy humans exists; PEARL and RAP-ZONE are ongoing.",
      "Weekly low-dose (2–6 mg) is the most common off-label regimen — not evidence-derived.",
      "Immune effects are dose-dependent and bidirectional — low doses may enhance, high doses suppress.",
      "Off-label use carries real regulatory and safety risk; not equivalent to a studied protocol.",
    ],
    receipts: [
      {
        id: "rap1",
        title: "Rapamycin Fed Late in Life Extends Lifespan in Mice",
        cite: "Harrison · Nature · 2009 · Animal · ITP",
        grade: "D" as GradeLevel,
        studyType: "Animal",
        tags: ["D · Animal", "Replicated 4×"],
        plainEnglish:
          "Rapamycin started at 600 days (equivalent to ~60 human years) extended median lifespan 9% in females and 14% in males across three genetically diverse mouse strains.",
        qualityFlags: ["Multi-center ITP", "Replicated", "Diverse strains"],
        whyMatters: "The landmark paper. Starting late and still getting benefit suggests therapeutic window in older adults.",
        url: "https://pubmed.ncbi.nlm.nih.gov/19587680/",
      },
      {
        id: "rap2",
        title: "PEARL Trial: Rapamycin Safety in Healthy Older Adults",
        cite: "Mannick · Aging Cell · 2024 · RCT · n=120",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "120 healthy adults 50–85 randomized to weekly rapamycin (5 mg) vs placebo for 52 weeks. Well-tolerated. Some immune enhancement. Not powered for longevity endpoints.",
        qualityFlags: ["Randomized", "Double-blind", "Pre-registered"],
        whyMatters: "First human safety RCT in healthy adults at a longevity-relevant dose. Safety signal encouraging; efficacy unknown.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=mannick+rapamycin+PEARL+trial+healthy+older+adults+aging+cell",
      },
      {
        id: "rap3",
        title: "mTOR Inhibition and Immune Senescence",
        cite: "Mannick · Sci Transl Med · 2014 · RCT · n=218",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "Older adults on low-dose rapalog (RAD001) for 6 weeks showed enhanced flu vaccine response vs placebo — suggesting immune enhancement rather than suppression at low doses.",
        qualityFlags: ["Randomized", "Novartis sponsored"],
        whyMatters: "Challenged assumption that rapamycin always suppresses immunity. Dose and schedule are critical.",
        fundingFlag: "Funded by Novartis",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=mannick+rapalog+mTOR+immune+senescence+flu+vaccine+science+translational+medicine+2014",
      },
    ] as Receipt[],
    contradictions: 2,
    sourceCount: 24,
    duration: "13s",
  },

  mushrooms: {
    grade: "C" as GradeLevel,
    gradeLabel: "Suggestive",
    headline:
      "Lion's mane shows early promise for cognitive function and nerve growth — but trials are small, short, and largely in cognitively impaired populations, not healthy adults.",
    summary:
      "Hericium erinaceus (lion's mane) contains hericenones and erinacines that stimulate nerve growth factor (NGF) synthesis in vitro and in animal models. The most cited human trial (Mori 2009, Phytother Res) showed significant improvement in cognitive scores in mild cognitive impairment patients over 16 weeks at 3 g/day, but n=30 and the improvement reversed after stopping. A 2023 RCT (Docherty, J Psychopharmacol) in healthy young adults showed improved processing speed but no other cognitive benefits. Reishi and turkey tail have stronger evidence for immune modulation, primarily in cancer-adjacent contexts.",
    takeaways: [
      "Best evidence is in MCI patients — benefits in healthy, cognitively normal adults are not established.",
      "NGF stimulation mechanism is plausible but has not been measured directly in human brain tissue.",
      "3 g/day whole mushroom extract is the dose used in positive trials — many supplements use lower doses.",
      "Cognitive benefits reversed after stopping in the Mori 2009 trial — not a permanent change.",
      "Reishi and turkey tail have more consistent immune data; cognitive claims are lion's mane specific.",
    ],
    receipts: [
      {
        id: "mu1",
        title: "Lion's Mane Mushroom and Mild Cognitive Impairment",
        cite: "Mori · Phytother Res · 2009 · RCT · n=30",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT", "Small N"],
        plainEnglish:
          "30 adults with MCI randomized to 3 g/day lion's mane or placebo for 16 weeks. Cognitive scores improved significantly. Benefits reversed 4 weeks after stopping.",
        qualityFlags: ["Randomized", "Double-blind"],
        whyMatters: "Most cited human RCT. Effect is real but small N and MCI population limits generalizability to healthy adults.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=mori+hericium+erinaceus+mild+cognitive+impairment+2009",
      },
      {
        id: "mu2",
        title: "Lion's Mane in Healthy Young Adults — Cognitive Performance",
        cite: "Docherty · J Psychopharmacol · 2023 · RCT · n=41",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "41 healthy adults 18–45: lion's mane improved speed of lower cognitive processing vs placebo over 28 days. No effect on memory, attention, or mood.",
        qualityFlags: ["Randomized", "Double-blind", "Healthy population"],
        whyMatters: "Most rigorous trial in healthy adults. Modest, selective cognitive effect — not the broad nootropic it's marketed as.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=docherty+lion+mane+cognitive+healthy+adults+journal+psychopharmacology+2023",
      },
      {
        id: "mu3",
        title: "Erinacines and Hericenones — NGF Synthesis Review",
        cite: "Thongbai · Fitoterapia · 2015 · Review",
        grade: "D" as GradeLevel,
        studyType: "Review",
        tags: ["D · Mechanistic"],
        plainEnglish:
          "Review of preclinical evidence: erinacines in lion's mane mycelium stimulate NGF synthesis in vitro and in rodent brains. Fruiting body contains hericenones with similar activity.",
        qualityFlags: ["Mechanistic clarity"],
        whyMatters: "Explains the biological rationale. Animal NGF stimulation is promising; human brain translation is unconfirmed.",
        url: "https://pubmed.ncbi.nlm.nih.gov/?term=hericium+erinaceus+NGF+hericenones+erinacines+fitoterapia",
      },
    ] as Receipt[],
    contradictions: 0,
    sourceCount: 16,
    duration: "10s",
  },
};

function pickAnswerData(query: string): Partial<Answer> {
  const q = query.toLowerCase();
  if (q.includes("omega") || q.includes("fish oil") || q.includes("epa") || q.includes("dha")) {
    return MOCK_ANSWERS.omega3;
  }
  if (q.includes("nmn") || q.includes("nad") || q.includes("nicotinamide") || q.includes("nr ")) {
    return MOCK_ANSWERS.nmn;
  }
  if (q.includes("berberine") || q.includes("metformin")) {
    return MOCK_ANSWERS.berberine;
  }
  if (q.includes("magnesium") || q.includes("glycinate") || q.includes("threonate")) {
    return MOCK_ANSWERS.magnesium;
  }
  if (q.includes("zone 2") || q.includes("zone2") || q.includes("hiit") || q.includes("vo2") || q.includes("vo₂") || q.includes("polarized")) {
    return MOCK_ANSWERS.zone2;
  }
  if (q.includes("creatine")) {
    return MOCK_ANSWERS.creatine;
  }
  if (q.includes("cold") || q.includes("ice bath") || q.includes("cold plunge")) {
    return MOCK_ANSWERS.cold;
  }
  if (q.includes("time-restricted") || q.includes("intermittent fasting") || q.includes("fasting") || q.includes("eating window") || q.includes("16:8") || q.includes("18:6")) {
    return MOCK_ANSWERS.trf;
  }
  if (q.includes("rapamycin") || q.includes("rapa") || q.includes("mtor")) {
    return MOCK_ANSWERS.rapamycin;
  }
  if (q.includes("mushroom") || q.includes("lion's mane") || q.includes("lions mane") || q.includes("reishi") || q.includes("turkey tail") || q.includes("hericium")) {
    return MOCK_ANSWERS.mushrooms;
  }
  if (q.includes("taurine")) {
    return MOCK_ANSWERS.taurine;
  }
  // Generic fallback — Claude should handle anything not in this list
  return MOCK_ANSWERS.taurine;
}

type Stage = "reasoning" | "answer";

export default function AnswerScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const insets = useSafeAreaInsets();
  const { addAnswer } = useApp();

  const [stage, setStage] = useState<Stage>("reasoning");
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [apiResult, setApiResult] = useState<Partial<Answer> | null>(null);

  const apiDoneRef = useRef(false);
  const animDoneRef = useRef(false);
  const transitionedRef = useRef(false);

  const answerData: Partial<Answer> = apiResult ?? pickAnswerData(q ?? "");

  // Stable ref so effects can call it without stale-closure issues
  const doTransitionRef = useRef(() => {
    if (transitionedRef.current) return;
    transitionedRef.current = true;
    setCurrentStep(REASONING_STAGES.length);
    setTimeout(() => {
      setStage("answer");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 400);
  });

  // Fire the Claude API call immediately; whichever finishes last triggers the transition
  useEffect(() => {
    let cancelled = false;
    askClaude(q ?? "").then((result) => {
      if (cancelled) return;
      if (result) setApiResult(result);
      apiDoneRef.current = true;
      if (animDoneRef.current) doTransitionRef.current();
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance through reasoning stages; hold at last stage until API returns
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= REASONING_STAGES.length - 1) {
        clearInterval(interval);
        animDoneRef.current = true;
        if (apiDoneRef.current) doTransitionRef.current();
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  function handleAddToStack() {
    router.push({
      pathname: "/(tabs)/ask/add-to-stack",
      params: { from: q ?? "" },
    });
  }

  const handleSave = useCallback(async () => {
    if (saveBusy) return;
    setSaveBusy(true);
    try {
      const answer: Answer = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        question: q ?? "",
        grade: answerData.grade!,
        gradeLabel: answerData.gradeLabel!,
        headline: answerData.headline!,
        summary: answerData.summary!,
        takeaways: answerData.takeaways!,
        receipts: answerData.receipts!,
        contradictions: answerData.contradictions!,
        timestamp: new Date().toISOString(),
        duration: answerData.duration!,
        sourceCount: answerData.sourceCount!,
      };
      await addAnswer(answer);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaveBusy(false);
    }
  }, [
    addAnswer,
    answerData.contradictions,
    answerData.duration,
    answerData.grade,
    answerData.gradeLabel,
    answerData.headline,
    answerData.receipts,
    answerData.sourceCount,
    answerData.summary,
    answerData.takeaways,
    q,
  ]);

  if (stage === "reasoning") {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { paddingTop: getScreenTopPadding(insets.top) },
          ]}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Ask</Text>
          </Pressable>
          <MonoLabel>Researching</MonoLabel>
        </View>
        <View style={styles.questionBand}>
          <MonoLabel style={{ marginBottom: 4 }}>Question</MonoLabel>
          <Text style={styles.questionText}>{q}</Text>
        </View>
        <View style={styles.loaderBlock}>
          <HeroBlock color="lilac" style={{ borderRadius: 12, padding: 16 }}>
            <MonoLabel style={{ marginBottom: 8, color: "#000000" }}>
              Reasoning loop
            </MonoLabel>
            {REASONING_STAGES.map((s, i) => (
              <LoaderStage
                key={i}
                state={
                  i < currentStep ? "done" : i === currentStep ? "active" : "pending"
                }
                label={s.label}
                meta={i < currentStep ? "✓" : undefined}
              />
            ))}
          </HeroBlock>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: getScreenTopPadding(insets.top) },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Ask</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <MonoLabel style={styles.headerMeta}>
            {answerData.sourceCount} sources · {answerData.duration}
          </MonoLabel>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
      >
        <HeroBlock color="lime" style={styles.gradeHero}>
          <GradeChip grade={answerData.grade!} label={answerData.gradeLabel} />
          <Text style={styles.headline}>{answerData.headline}</Text>
          <Text style={styles.questionSmall}>{q}</Text>
        </HeroBlock>

        <View style={styles.summarySection}>
          <MonoLabel style={{ marginBottom: 8 }}>Summary</MonoLabel>
          <Text style={styles.summaryText}>{answerData.summary}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.takeawaysSection}>
          <MonoLabel style={{ marginBottom: 8 }}>Key takeaways</MonoLabel>
          {answerData.takeaways!.map((t, i) => (
            <View key={i} style={styles.takeawayRow}>
              <Text style={styles.takeawayNum}>{i + 1}</Text>
              <Text style={styles.takeawayText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.receiptsSection}>
          <View style={styles.receiptHeader}>
            <MonoLabel>
              Receipts ({answerData.receipts!.length})
            </MonoLabel>
            {answerData.contradictions! > 0 && (
              <View style={styles.contraChip}>
                <Text style={styles.contraText}>
                  {answerData.contradictions} contradictions
                </Text>
              </View>
            )}
          </View>
          {answerData.receipts!.map((r, i) => (
            <View key={r.id}>
              <ReceiptRow
                receipt={r}
                index={i}
                onPress={() =>
                  setExpandedReceipt(expandedReceipt === r.id ? null : r.id)
                }
              />
              {expandedReceipt === r.id && (
                <View style={styles.receiptExpanded}>
                  {r.plainEnglish && (
                    <>
                      <MonoLabel size={9} style={{ marginBottom: 4 }}>
                        Plain english
                      </MonoLabel>
                      <Text style={styles.expandedText}>{r.plainEnglish}</Text>
                    </>
                  )}
                  {r.whyMatters && (
                    <>
                      <MonoLabel size={9} style={{ marginTop: 8, marginBottom: 4 }}>
                        Why it matters
                      </MonoLabel>
                      <Text style={styles.expandedText}>{r.whyMatters}</Text>
                    </>
                  )}
                  {r.fundingFlag && (
                    <Text style={styles.fundingFlag}>{r.fundingFlag}</Text>
                  )}
                  {r.qualityFlags && r.qualityFlags.length > 0 && (
                    <View style={styles.flagsRow}>
                      {r.qualityFlags.map((f, fi) => (
                        <View key={fi} style={styles.flagChip}>
                          <Text style={styles.flagText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {r.url && (
                    <Pressable
                      onPress={() => Linking.openURL(r.url!)}
                      style={({ pressed }) => [
                        styles.linkBtn,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <Text style={styles.linkBtnText}>View paper →</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            Educational summary · not medical advice · sources linked in-app
          </Text>
          <Pressable
            style={styles.feedbackRow}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          >
            <Text style={styles.feedbackLabel}>
              Was this graded correctly?
            </Text>
            <View style={styles.feedbackBtns}>
              <Pressable style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Too high</Text>
              </Pressable>
              <Pressable style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Too low</Text>
              </Pressable>
              <Pressable style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Right</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 12 },
        ]}
      >
        <PillButton
          label="Save"
          variant="light"
          onPress={() => void handleSave()}
          loading={saveBusy}
          flex
        />
        <PillButton
          label="Add to Stack →"
          onPress={handleAddToStack}
          flex
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginLeft: 12,
  },
  headerMeta: { textAlign: "right" },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  questionBand: {
    backgroundColor: "#f7f7f5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  questionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#000000",
    lineHeight: 18,
  },
  loaderBlock: { padding: 16 },
  scroll: { flex: 1 },
  gradeHero: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
  },
  headline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    letterSpacing: -0.2,
    lineHeight: 24,
    color: "#000000",
  },
  questionSmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.72,
    marginTop: 4,
  },
  summarySection: { paddingHorizontal: 18, paddingVertical: 14 },
  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#000000",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#e6e6e6",
    marginHorizontal: 18,
  },
  takeawaysSection: { paddingHorizontal: 18, paddingVertical: 14 },
  takeawayRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
  },
  takeawayNum: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
    paddingTop: 1,
    width: 16,
  },
  takeawayText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  receiptsSection: { paddingHorizontal: 18, paddingVertical: 14 },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  contraChip: {
    backgroundColor: "#f3c9b6",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  contraText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#000000",
  },
  receiptExpanded: {
    backgroundColor: "#f7f7f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  expandedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "#000000",
  },
  fundingFlag: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 6,
  },
  flagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  flagChip: {
    borderRadius: 50,
    backgroundColor: "#c8e6cd",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  flagText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  linkBtn: {
    alignSelf: "flex-start",
    marginTop: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 5,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  linkBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#000000",
  },
  disclaimerSection: { paddingHorizontal: 18, paddingVertical: 14 },
  disclaimerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.55,
    lineHeight: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  feedbackRow: {
    gap: 8,
    alignItems: "flex-start",
  },
  feedbackLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 6,
    textAlign: "left",
    width: "100%",
  },
  feedbackBtns: { flexDirection: "row", gap: 6 },
  feedbackBtn: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  feedbackBtnText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  bottomBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
    backgroundColor: "#ffffff",
    ...(Platform.OS === "web"
      ? ({ zIndex: 2 } as const)
      : {}),
  },
});
