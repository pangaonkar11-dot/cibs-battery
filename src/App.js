import React, { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════
// ║  CIBS UNIFIED BATTERY — VISTA + VALID  v1.0                   ║
// ║  Central Institute of Behavioural Sciences, Nagpur            ║
// ║  Dr Shailesh V. Pangaonkar · Dr Deepali S. Pangaonkar        ║
// ══════════════════════════════════════════════════════════════════

// ── APPS SCRIPT BACKEND URL ───────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxCR0_X2xe7ojq38W3XVt-3VAp3JISfH9DLwTolOi61TZcYAOOZhtD9oIJoMmZqU8rk/exec";

// ── UID GENERATOR — unique fingerprint per subject ────────────────
async function generateUID(name, dob, mobile) {
  const raw = (name + dob + mobile).toLowerCase().trim();
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,"0")).join("").slice(0,32);
}

// ── SUBMIT TO GOOGLE SHEETS ───────────────────────────────────────
async function submitToSheet(payload) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log("CIBS submission result:", result);
    return result;
  } catch (error) {
    console.error("CIBS submission error:", error);
    return { status: "error", message: error.toString() };
  }
}

// ── DEVICE & SOURCE DETECTORS ─────────────────────────────────────
function getDevice() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}
function getSource() {
  const params = new URLSearchParams(window.location.search);
  return params.get("src") || "public";
}
function getMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") || "public";
}


// ══════════════════════════════════════════════════════════════════
// ║  CIBS UNIFIED BATTERY — VISTA + VALID  v1.0                   ║
// ║  Central Institute of Behavioural Sciences, Nagpur            ║
// ║  Dr Shailesh V. Pangaonkar · Dr Deepali S. Pangaonkar        ║
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// ║  VISTA — DATA CONSTANTS & CLASSIFICATION HELPERS              ║
// ══════════════════════════════════════════════════════════════════
const SHAPES = [
  {code:1,name:"Circle"},{code:2,name:"Triangle"},{code:3,name:"Square"},
  {code:4,name:"Rhombus"},{code:5,name:"Pentagon"},{code:6,name:"Hexagon"},{code:7,name:"Octagon"},
];
const COLORS = [
  {code:1,name:"Red",hex:"#EF4444"},{code:2,name:"Orange",hex:"#F97316"},
  {code:3,name:"Yellow",hex:"#EAB308"},{code:4,name:"Green",hex:"#22C55E"},
  {code:5,name:"Blue",hex:"#3B82F6"},{code:6,name:"Indigo",hex:"#6366F1"},
  {code:7,name:"Violet",hex:"#A855F7"},
];
const SMILEYS = [
  {code:1,name:"Very Happy",emoji:"😄"},{code:2,name:"Happy",emoji:"🙂"},
  {code:3,name:"Calm",emoji:"😐"},{code:4,name:"Worried",emoji:"😟"},
  {code:5,name:"Sad",emoji:"😢"},{code:6,name:"Angry",emoji:"😠"},
  {code:7,name:"Scared",emoji:"😨"},
];

// ══════════════════════════════════════════════════════════════════════════════
//  PSYCHOMETRIC REFERENCE TABLES
// ══════════════════════════════════════════════════════════════════════════════
const SHAPE_DATA = {
  1:{name:"Circle",  complexity:3, geometry:"Curvilinear",  cogStyle:"Holistic-Integrative",   BFopen:5, BFcons:3, BFextra:5, BFagree:6, BFneuro:3},
  2:{name:"Triangle",complexity:4, geometry:"Angular-Sharp",cogStyle:"Analytical-Sequential",  BFopen:5, BFcons:5, BFextra:4, BFagree:3, BFneuro:4},
  3:{name:"Square",  complexity:2, geometry:"Rectilinear",  cogStyle:"Practical-Systematic",   BFopen:2, BFcons:7, BFextra:3, BFagree:5, BFneuro:3},
  4:{name:"Rhombus", complexity:5, geometry:"Angular-Fluid",cogStyle:"Adaptive-Creative",      BFopen:6, BFcons:4, BFextra:5, BFagree:4, BFneuro:3},
  5:{name:"Pentagon",complexity:6, geometry:"Complex-Angular",cogStyle:"Divergent-Exploratory",BFopen:7, BFcons:3, BFextra:4, BFagree:4, BFneuro:4},
  6:{name:"Hexagon", complexity:6, geometry:"Symmetric-Complex",cogStyle:"Systemic-Precise",   BFopen:5, BFcons:7, BFextra:3, BFagree:5, BFneuro:2},
  7:{name:"Octagon", complexity:5, geometry:"Complex-Symmetric",cogStyle:"Tenacious-Enduring", BFopen:4, BFcons:6, BFextra:3, BFagree:4, BFneuro:3},
};
const COLOR_DATA = {
  1:{name:"Red",   temp:"hot",      arousal:7, valence:4, BFextra:7, BFneuro:6, physArousal:"High",   socialWarm:6},
  2:{name:"Orange",temp:"warm",     arousal:6, valence:6, BFextra:6, BFneuro:4, physArousal:"Elevated",socialWarm:7},
  3:{name:"Yellow",temp:"warm",     arousal:5, valence:7, BFextra:5, BFneuro:3, physArousal:"Moderate",socialWarm:6},
  4:{name:"Green", temp:"cool",     arousal:4, valence:6, BFextra:4, BFneuro:2, physArousal:"Moderate",socialWarm:5},
  5:{name:"Blue",  temp:"cool",     arousal:3, valence:6, BFextra:3, BFneuro:2, physArousal:"Low",    socialWarm:4},
  6:{name:"Indigo",temp:"dark-cool",arousal:3, valence:4, BFextra:2, BFneuro:4, physArousal:"Low",    socialWarm:3},
  7:{name:"Violet",temp:"dark-cool",arousal:4, valence:4, BFextra:2, BFneuro:5, physArousal:"Low",    socialWarm:3},
};
const SHADE_DATA = {
  1:{label:"Shade 1 (Lightest)", rawEmo:95, mentalBurden:5,  emotOpen:95, ruminScore:5},
  2:{label:"Shade 2 (Light)",    rawEmo:82, mentalBurden:15, emotOpen:82, ruminScore:12},
  3:{label:"Shade 3",            rawEmo:70, mentalBurden:28, emotOpen:68, ruminScore:22},
  4:{label:"Shade 4 (Medium)",   rawEmo:55, mentalBurden:44, emotOpen:52, ruminScore:38},
  5:{label:"Shade 5",            rawEmo:40, mentalBurden:58, emotOpen:36, ruminScore:55},
  6:{label:"Shade 6 (Dark)",     rawEmo:28, mentalBurden:73, emotOpen:22, ruminScore:70},
  7:{label:"Shade 7 (Darkest)",  rawEmo:15, mentalBurden:88, emotOpen:10, ruminScore:85},
};
const SMILEY_DATA = {
  1:{name:"Very Happy",valence:95,arousal:72,negAffect:5,  anx:3,  dep:3,  anger:3,  fear:3},
  2:{name:"Happy",     valence:80,arousal:58,negAffect:15, anx:10, dep:10, anger:8,  fear:8},
  3:{name:"Calm",      valence:65,arousal:32,negAffect:28, anx:20, dep:18, anger:12, fear:15},
  4:{name:"Worried",   valence:35,arousal:62,negAffect:58, anx:65, dep:38, anger:30, fear:55},
  5:{name:"Sad",       valence:20,arousal:22,negAffect:75, anx:35, dep:78, anger:22, fear:40},
  6:{name:"Angry",     valence:15,arousal:88,negAffect:80, anx:42, dep:35, anger:88, fear:35},
  7:{name:"Scared",    valence:10,arousal:72,negAffect:85, anx:88, dep:55, anger:30, fear:88},
};

// ══════════════════════════════════════════════════════════════════════════════
//  CLASSIFICATION HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function iqBand(cq) {
  if(cq>=130)return{band:"Very Superior",          percentile:"≥98th",  desc:"Intellectual functioning in the very superior range"};
  if(cq>=120)return{band:"Superior",               percentile:"91–97th",desc:"Intellectual functioning in the superior range"};
  if(cq>=110)return{band:"High Average",            percentile:"75–90th",desc:"Intellectual functioning in the high average range"};
  if(cq>=90) return{band:"Average",                 percentile:"25–74th",desc:"Intellectual functioning in the average range"};
  if(cq>=80) return{band:"Low Average",             percentile:"9–24th", desc:"Intellectual functioning in the low average range"};
  if(cq>=70) return{band:"Borderline",              percentile:"2–8th",  desc:"Intellectual functioning in the borderline range"};
  return              {band:"Intellectually Limited",percentile:"<2nd",   desc:"Intellectual functioning in the limited range"};
}
function eqBand(eq) {
  if(eq>=115)return{band:"Well Above Average",percentile:"≥84th",desc:"Emotional intelligence markedly above normative expectations"};
  if(eq>=100)return{band:"Above Average",     percentile:"50–83rd",desc:"Emotional intelligence above the normative mean"};
  if(eq>=85) return{band:"Average",            percentile:"16–49th",desc:"Emotional intelligence within the normative range"};
  if(eq>=70) return{band:"Below Average",      percentile:"2–15th", desc:"Emotional intelligence below the normative mean"};
  return             {band:"Well Below Average",percentile:"<2nd",   desc:"Emotional intelligence markedly below normative expectations"};
}
function phqAnalog(score) {
  if(score<=10)return{level:"None to Minimal",    severity:0, desc:"No clinically significant depressive or distress symptoms indicated"};
  if(score<=25)return{level:"Mild",               severity:1, desc:"Mild emotional distress; monitor and provide psychoeducation"};
  if(score<=50)return{level:"Moderate",           severity:2, desc:"Moderate distress warranting structured supportive intervention"};
  if(score<=75)return{level:"Moderately Severe",  severity:3, desc:"Moderately severe distress; clinical intervention recommended"};
  return              {level:"Severe",             severity:4, desc:"Severe distress indicators; urgent clinical evaluation indicated"};
}
function riskLevel(score) {
  if(score<=15)return{level:"Not Indicated",color:"#16a34a",bg:"#f0fdf4",border:"#86efac",flag:0};
  if(score<=35)return{level:"Low",          color:"#65a30d",bg:"#f7fee7",border:"#bef264",flag:1};
  if(score<=55)return{level:"Moderate",     color:"#d97706",bg:"#fffbeb",border:"#fcd34d",flag:2};
  if(score<=75)return{level:"Elevated",     color:"#ea580c",bg:"#fff7ed",border:"#fdba74",flag:3};
  return               {level:"High",        color:"#dc2626",bg:"#fef2f2",border:"#fca5a5",flag:4};
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLINICAL ALGORITHM ENGINE
// ══════════════════════════════════════════════════════════════════════════════
function computeClinical(sSeq, cSeq, shSeq, smSeq) {
  const W = [7,6,5,4,3,2,1];
  const s0=sSeq[0], c0=cSeq[0], sh0=shSeq[0], sm0=smSeq[0];
  const SD=SHADE_DATA, CD=COLOR_DATA, SMD=SMILEY_DATA, SHD=SHAPE_DATA;

  // ── DOMAIN 1: COGNITIVE FUNCTION ────────────────────────────────────────────
  // Weighted complexity across all 7 positions
  let wtd=0, maxWtd=0;
  sSeq.forEach((code,i)=>{wtd+=SHD[code].complexity*W[i]; maxWtd+=7*W[i];});
  const rawCog = (wtd/maxWtd)*100;
  // Scale to CQ (55–145), mean≈100, SD≈15
  const CQ = Math.round(55 + (rawCog/100)*90);
  const iq = iqBand(CQ);
  // Cognitive Flexibility Index: difference between most-liked and least-liked shape complexity
  const cogFlex = Math.abs(SHD[sSeq[0]].complexity - SHD[sSeq[6]].complexity);
  const flexLabel = cogFlex>=4?"High":cogFlex>=2?"Moderate":"Restricted";
  // Processing Orientation: colour temperature bias
  const isWarm = ["hot","warm"].includes(CD[c0].temp);
  const isDarkCool = CD[c0].temp==="dark-cool";
  const procOrient = isWarm?"Action-Oriented / Externally Motivated":isDarkCool?"Reflective / Internally Motivated":"Balanced Processing Orientation";
  // D position (middle = index 3 in 0-based)
  const midComplexity = SHD[sSeq[3]].complexity;
  const midLabel = midComplexity>=5?"High-Complexity Neutral Baseline":midComplexity>=4?"Mid-Range Baseline":"Low-Complexity Neutral Baseline";
  const d1 = { CQ, iqBand:iq, primaryStyle:SHD[s0].cogStyle, secondaryStyle:SHD[sSeq[1]].cogStyle,
    flexIndex:cogFlex, flexLabel, procOrient, rawCog:Math.round(rawCog),
    topShape:SHD[sSeq[0]], secondShape:SHD[sSeq[1]], midShape:SHD[sSeq[3]], botShape:SHD[sSeq[6]],
    midLabel, colorInfluence: CD[c0].name };

  // ── DOMAIN 2: PERSONALITY (DSM-5 + Big Five) ────────────────────────────────
  // Big Five raw scores (1-7 scale, weighted across shape+color+shade)
  const shapeW=0.6, colorW=0.4;
  let BF = {O:0, C:0, E:0, A:0, N:0};
  // Weighted contribution from each shape position
  sSeq.forEach((code,i)=>{
    const sh=SHD[code]; const w=W[i]/28;
    BF.O += sh.BFopen   * w * shapeW;
    BF.C += sh.BFcons   * w * shapeW;
    BF.E += sh.BFextra  * w * shapeW;
    BF.A += sh.BFagree  * w * shapeW;
    BF.N += sh.BFneuro  * w * shapeW;
  });
  // Color modifier
  const col=CD[c0];
  BF.E += col.BFextra  / 7 * colorW;
  BF.N += col.BFneuro  / 7 * colorW;
  // Shade modifies Neuroticism
  BF.N += (SD[sh0].mentalBurden/100) * 0.3;
  BF.N = Math.min(BF.N, 1.0);
  // Convert to T-scores (mean 50, SD 10): raw 0-1 → T = 30+raw*40
  const BFt = {};
  ["O","C","E","A","N"].forEach(k=>{ BFt[k] = Math.round(30 + BF[k]*40); });
  // DSM-5 Cluster determination
  const isAngular=[2,4,5].includes(s0), isRounded=s0===1, isSymm=[3,6].includes(s0);
  let dsmCluster, dsmFeatures, dsmDesc, dsmClinical;
  const hN=BFt.N>=55, hE=BFt.E>=55, lE=BFt.E<45, hO=BFt.O>=55, hC=BFt.C>=55, lC=BFt.C<45;
  if(isDarkCool && (isAngular||s0===7) && lE) {
    dsmCluster="Cluster A Alignment";
    dsmFeatures="Schizoid / Schizotypal features";
    dsmDesc="Tendency towards social withdrawal, restricted emotional expression, preference for solitary activity, possible unconventional thinking patterns.";
    dsmClinical="Assess for flat affect, anhedonia, social isolation. Rule out prodromal schizophrenia spectrum in younger subjects.";
  } else if(isWarm && isAngular && (hN||BFt.E>=58)) {
    dsmCluster="Cluster B Alignment";
    dsmFeatures="Borderline / Histrionic / Narcissistic features";
    dsmDesc="Tendency towards emotional intensity, impulsivity, attention-seeking behaviour, affective instability, and difficulties with interpersonal boundaries.";
    dsmClinical="Assess for impulsivity, affective dysregulation, identity instability. Screen for trauma history. Monitor for externalising behaviours.";
  } else if(!isWarm && (isRounded||isSymm) && hN) {
    dsmCluster="Cluster C Alignment";
    dsmFeatures="Avoidant / Dependent / OCPD features";
    dsmDesc="Tendency towards anxiety-based inhibition, rigid rule adherence, excessive need for reassurance, fear of criticism, or marked difficulty with autonomous decision-making.";
    dsmClinical="Assess for generalised anxiety, social anxiety features, perfectionism. Consider impact on daily functioning and interpersonal relationships.";
  } else {
    dsmCluster="No Significant Cluster Alignment";
    dsmFeatures="Adaptive personality organisation";
    dsmDesc="No clinically significant personality cluster alignment indicated. Subject demonstrates balanced adaptive traits with context-appropriate behavioural flexibility.";
    dsmClinical="No specific personality-based clinical concerns indicated at this time. Supportive monitoring sufficient.";
  }
  const bfDesc = {
    O: BFt.O>=55?"Elevated — high intellectual curiosity, openness to experience, creative ideation":BFt.O<45?"Reduced — preference for conventional, familiar, concrete approaches":"Within average range",
    C: BFt.C>=55?"Elevated — high self-discipline, organisation, goal-directedness":BFt.C<45?"Reduced — may present with impulsivity, difficulty sustaining effort":"Within average range",
    E: BFt.E>=55?"Elevated — socially outgoing, high energy, assertive interaction style":BFt.E<45?"Reduced — reserved, socially selective, prefers limited stimulation":"Within average range",
    A: BFt.A>=55?"Elevated — cooperative, prosocial, trusting, conflict-avoidant":BFt.A<45?"Reduced — competitive, sceptical, challenging of authority":"Within average range",
    N: BFt.N>=55?"Elevated — marked emotional reactivity, vulnerability to distress, mood variability":BFt.N<45?"Reduced — emotionally stable, resilient, low distress susceptibility":"Within average range",
  };
  const d2 = { BFt, bfDesc, dsmCluster, dsmFeatures, dsmDesc, dsmClinical };

  // ── DOMAIN 3: EMOTIONAL INTELLIGENCE & STABILITY ───────────────────────────
  // EQ raw from shade (primary signal), smiley valence, shape EQ modifier
  const shadeEmo = SD[sh0].rawEmo;                         // 0-100
  const smVal    = SMD[sm0].valence;                       // 0-100
  const shEQmod  = isRounded?10:isAngular?-8:isSymm?4:2;
  const cEQmod   = ["cool"].includes(CD[c0].temp)?8:isDarkCool?0:isWarm?-4:0;
  const rawEQ    = Math.min(100,Math.max(0,shadeEmo*0.5 + smVal*0.3 + shEQmod + cEQmod));
  // Scale to EQ Standard Score (mean 100, SD 15): rawEQ 0-100 → SS 55-145
  const EQSS     = Math.round(55 + (rawEQ/100)*90);
  const eqB      = eqBand(EQSS);
  // Sub-scales (scaled 0-100)
  const selfAwareness  = Math.min(100,Math.round(SD[sh0].emotOpen * 0.7 + smVal * 0.3));
  const emoRegulation  = Math.min(100,Math.round(shadeEmo * 0.6 + (100-SMD[sm0].negAffect) * 0.4));
  const emoResilience  = Math.min(100,Math.round(rawCog*0.3 + shadeEmo*0.4 + (100-SD[sh0].ruminScore)*0.3));
  // Emotional Stability Index (0-100)
  const ESI = Math.round((selfAwareness+emoRegulation+emoResilience)/3);
  // Predominant affective state
  const affState = SMD[sm0].name;
  const affValence = smVal>=70?"Positive":smVal>=45?"Neutral-Mixed":smVal>=25?"Negative-Mild":"Negative-Significant";
  const d3 = { EQSS, eqBand:eqB, rawEQ:Math.round(rawEQ), ESI,
    selfAwareness, emoRegulation, emoResilience,
    shadePrimary: SD[sh0], affState, affValence,
    ruminScore:SD[sh0].ruminScore };

  // ── DOMAIN 4: HEALTH INDICATORS ─────────────────────────────────────────────
  // Mental Health Index — distress composite (0=no distress, 100=severe)
  const distressRaw = Math.round(
    SMD[sm0].negAffect * 0.35 +
    SD[sh0].mentalBurden * 0.35 +
    SMD[sm0].dep * 0.15 +
    SMD[sm0].anx * 0.15
  );
  const MHI = 100 - distressRaw;  // invert: high MHI = better mental health
  const phqA = phqAnalog(distressRaw);
  // Anxiety index
  const anxIdx = Math.round(SMD[sm0].anx*0.6 + SD[sh0].ruminScore*0.4);
  const anxLevel = anxIdx>=70?"Elevated":anxIdx>=45?"Moderate":anxIdx>=25?"Mild":"Minimal";
  // Depression index
  const depIdx = Math.round(SMD[sm0].dep*0.6 + SD[sh0].mentalBurden*0.4);
  const depLevel = depIdx>=70?"Elevated":depIdx>=45?"Moderate":depIdx>=25?"Mild":"Minimal";
  // Physical Health — autonomic arousal from colour
  const physArousal = CD[c0].physArousal;
  const physScore   = Math.round(100 - (CD[c0].arousal-1)*12 + (isRounded?5:isAngular?-4:0));
  const physNorm    = Math.min(95,Math.max(25,physScore));
  // Social Functioning Index
  const socRaw = Math.round(
    CD[c0].socialWarm/7*50 +
    (isRounded?50:isAngular?30:40) +
    SMD[sm0].valence*0.15
  );
  const SFI = Math.min(95, Math.max(20, socRaw));
  const sfLevel = SFI>=70?"Adequate – Social engagement indicators within functional range":
                  SFI>=50?"Moderate – Some social withdrawal or interpersonal difficulty indicated":
                           "Limited – Significant social isolation or interpersonal dysfunction indicated";
  const overallWBI = Math.round((MHI + physNorm + SFI)/3);
  const d4 = { MHI, distressRaw, phqAnalog:phqA, anxIdx, anxLevel, depIdx, depLevel,
    physArousal, physNorm, SFI, sfLevel, overallWBI };

  // ── DOMAIN 5: RISK FACTOR PROFILE ───────────────────────────────────────────
  // Suicidal Ideation Risk
  const SIR_raw = Math.round(
    SD[sh0].ruminScore  * 0.3 +
    SMD[sm0].dep        * 0.25 +
    SD[sh0].mentalBurden* 0.25 +
    (isDarkCool ? 15:0) +
    (sm0>=5 ? SMD[sm0].fear*0.2 : 0)
  );
  const SIR = riskLevel(SIR_raw);
  const SIR_indicators = [];
  if(sh0>=6)      SIR_indicators.push("Dark shade preference — elevated emotional burden indicator");
  if(sm0>=5)      SIR_indicators.push(`Primary affect "${SMD[sm0].name}" — high negative valence indicator`);
  if(isDarkCool)  SIR_indicators.push("Dark-cool colour preference — social withdrawal / introspective withdrawal indicator");
  if(s0===2&&sm0>=4) SIR_indicators.push("Angular primary shape with negative affect — heightened stress reactivity");
  if(SIR_indicators.length===0) SIR_indicators.push("No significant visual indicators for elevated risk");

  // Substance Use Risk
  const SUR_raw = Math.round(
    SMD[sm0].negAffect * 0.25 +
    SD[sh0].mentalBurden * 0.20 +
    CD[c0].arousal/7*35 +
    (isAngular ? 15:0) +
    (isWarm && sm0>=4 ? 15:0)
  );
  const SUR = riskLevel(SUR_raw);
  const SUR_indicators = [];
  if(isWarm && CD[c0].arousal>=6) SUR_indicators.push("High-arousal warm colour — sensation-seeking tendency indicator");
  if(isAngular && sm0>=4)         SUR_indicators.push("Angular shape with negative affect — impulsivity–distress pairing");
  if(SD[sh0].mentalBurden>=60)    SUR_indicators.push("Elevated emotional burden — risk of maladaptive coping");
  if(SUR_indicators.length===0)   SUR_indicators.push("No significant visual indicators for elevated risk");

  // Conduct / Delinquency Risk
  const CDR_raw = Math.round(
    SMD[sm0].anger * 0.30 +
    SMD[sm0].negAffect * 0.20 +
    CD[c0].arousal/7*25 +
    (isAngular&&isWarm ? 20:0) +
    (sm0===6 ? 20:0)
  );
  const CDR = riskLevel(CDR_raw);
  const CDR_indicators = [];
  if(sm0===6)             CDR_indicators.push("Primary affect — Anger — high aggression indicator");
  if(isAngular && isWarm) CDR_indicators.push("Angular shape + warm colour — dominance-aggression pairing");
  if(CD[c0].arousal>=6)  CDR_indicators.push("High physiological arousal colour — low frustration tolerance indicator");
  if(CDR_indicators.length===0) CDR_indicators.push("No significant visual indicators for elevated risk");

  // Combined Risk Index
  const maxFlag = Math.max(SIR.flag, SUR.flag, CDR.flag);
  const CRI = maxFlag===0?"Minimal":maxFlag===1?"Low — Monitor":maxFlag===2?"Moderate — Intervention Indicated":maxFlag===3?"Significant — Priority Referral":"Urgent — Immediate Evaluation Required";
  const CRI_color = maxFlag<=1?"#16a34a":maxFlag===2?"#d97706":maxFlag===3?"#ea580c":"#dc2626";
  const d5 = { SIR, SIR_raw, SIR_indicators, SUR, SUR_raw, SUR_indicators, CDR, CDR_raw, CDR_indicators, CRI, CRI_color, maxFlag };

  return { d1, d2, d3, d4, d5,
    meta:{ shapeSeq:sSeq, colorSeq:cSeq, shadeSeq:shSeq, smileySeq:smSeq,
           shapeCode:sSeq.join(""), colorCode:cSeq.join(""), shadeCode:shSeq.join(""), smileyCode:smSeq.join(""),
           firstShape:SHAPE_DATA[s0].name, firstColor:COLOR_DATA[c0].name,
           firstShade:SHADE_DATA[sh0].label, firstSmiley:SMILEY_DATA[sm0].name }};
}

// ── VISTA: Clinical Algorithm & AI Report Generator ──────────────

// ══════════════════════════════════════════════════════════════════════════════
//  CLAUDE API — CLINICAL REPORT WRITER
// ══════════════════════════════════════════════════════════════════════════════
async function vistaGenerateReport(clinical, participant) {
  const {d1,d2,d3,d4,d5,meta} = clinical;
  const subj = participant.name || "The subject";
  const age  = participant.age ? `aged ${participant.age}` : "";
  const gen  = participant.gender==="Male"||participant.gender==="M" ? "He" :
               participant.gender==="Female"||participant.gender==="F" ? "She" : "They";
  const gen2 = participant.gender==="Male"||participant.gender==="M" ? "his" :
               participant.gender==="Female"||participant.gender==="F" ? "her" : "their";

  // ── Domain 1: Cognitive ──────────────────────────────────────────
  const nd1 = `${subj}${age?" ("+age+")":""} obtained a SCST-CQ score of ${d1.CQ}, placing ${gen2} intellectual functioning in the ${d1.iqBand.band} range at the ${d1.iqBand.percentile} percentile. ${d1.iqBand.desc}. The primary cognitive style elicited is ${d1.primaryStyle}, with a secondary orientation towards ${d1.secondaryStyle}, and a processing orientation characterised as ${d1.procOrient}. Cognitive flexibility, as indexed by the differential complexity between most-preferred (${d1.topShape.name}) and least-preferred (${d1.botShape.name}) stimuli, is rated as ${d1.flexLabel} (raw gap = ${d1.flexIndex}). The neutral baseline shape (${d1.midShape.name}, Position D) is consistent with a ${d1.midLabel}.`;

  // ── Domain 2: Personality ────────────────────────────────────────
  const nd2 = `Personality organisation on the SCST yields a pattern consistent with ${d2.dsmCluster} (${d2.dsmFeatures}). ${d2.dsmDesc} NEO-PI analog Big Five T-scores are as follows: Openness T=${d2.BFt.O} (${d2.bfDesc.O}); Conscientiousness T=${d2.BFt.C} (${d2.bfDesc.C}); Extraversion T=${d2.BFt.E} (${d2.bfDesc.E}); Agreeableness T=${d2.BFt.A} (${d2.bfDesc.A}); Neuroticism T=${d2.BFt.N} (${d2.bfDesc.N}). Clinical note: ${d2.dsmClinical}`;

  // ── Domain 3: EQ / Emotional Stability ──────────────────────────
  const nd3 = `The subject's SCST-EQ Standard Score of ${d3.EQSS} situates ${gen2} emotional intelligence in the ${d3.eqBand.band} range (${d3.eqBand.percentile} percentile). ${d3.eqBand.desc}. The Emotional Stability Index (ESI) is ${d3.ESI}/100, with sub-scale scores of Self-Awareness ${d3.selfAwareness}/100, Emotional Regulation ${d3.emoRegulation}/100, and Resilience ${d3.emoResilience}/100. Primary shade selection (${meta.firstShade}) yields an Emotional Burden Index of ${d3.shadePrimary.mentalBurden}/100 and a Rumination Index of ${d3.ruminScore}/100, indicating ${d3.shadePrimary.mentalBurden>=60?"a clinically significant emotional burden requiring targeted intervention":"emotional burden within manageable parameters"}. The predominant affective state elicited is ${d3.affState} with a ${d3.affValence} valence profile.`;

  // ── Domain 4: Health ─────────────────────────────────────────────
  const nd4 = `The Mental Health Index (MHI) is ${d4.MHI}/100 with a PHQ-9 analogue distress classification of ${d4.phqAnalog.level}. ${d4.phqAnalog.desc}. Anxiety indicators are rated ${d4.anxLevel} (index ${d4.anxIdx}/100) and depressive indicators are rated ${d4.depLevel} (index ${d4.depIdx}/100). Physical health autonomic arousal is characterised as ${d4.physArousal} with a Physical Health Index of ${d4.physNorm}/100. Social Functioning Index (SFI) is ${d4.SFI}/100 — ${d4.sfLevel}. The Overall Wellbeing Composite is ${d4.overallWBI}/100.`;

  // ── Domain 5: Risk ───────────────────────────────────────────────
  const nd5 = `Risk factor profiling on the SCST yields the following indices. Suicidal Ideation Risk (Columbia CSSRS analogue) is rated ${d5.SIR.level} (raw index ${d5.SIR_raw}/100); indicators: ${d5.SIR_indicators.join("; ")}. Substance Use Risk is rated ${d5.SUR.level} (raw index ${d5.SUR_raw}/100); indicators: ${d5.SUR_indicators.join("; ")}. Conduct/Delinquency Risk is rated ${d5.CDR.level} (raw index ${d5.CDR_raw}/100); indicators: ${d5.CDR_indicators.join("; ")}. The Combined Risk Index is ${d5.CRI}. All elevated risk indicators must be confirmed through structured clinical interview and validated primary scales before any intervention decision.`;

  // ── Integrated Impression ────────────────────────────────────────
  const impression = `${subj}${age?" ("+age+")":""} presents on the SCST with a ${d1.iqBand.band} cognitive profile (CQ=${d1.CQ}), a ${d2.dsmCluster} personality organisation pattern, and an Emotional Intelligence Standard Score of ${d3.EQSS} (${d3.eqBand.band} range). The overall wellbeing composite of ${d4.overallWBI}/100 with a distress classification of ${d4.phqAnalog.level} warrants ${d4.overallWBI<50?"immediate clinical attention":"routine clinical monitoring"}. The Combined Risk Index is ${d5.CRI}, necessitating ${d5.maxFlag>=3?"urgent structured clinical evaluation":"clinical vigilance and scheduled follow-up"}.`;

  // ── Recommendations ──────────────────────────────────────────────
  const recs = [
    `1. Administer gold-standard cognitive battery (Wechsler/NIMHANS) to corroborate SCST-CQ estimate of ${d1.CQ} (${d1.iqBand.band} band).`,
    `2. Conduct structured personality assessment (NEO-PI-3 or PID-5) to verify ${d2.dsmCluster} pattern identified on SCST.`,
    `3. Administer validated emotional assessment (EQ-i 2.0 or MSCEIT) to corroborate SCST-EQ score of ${d3.EQSS}.`,
    `4. Apply PHQ-9 and GAD-7 to formally quantify distress indicators (current SCST classification: ${d4.phqAnalog.level}).`,
    d5.SIR.flag>=2 ? `5. PRIORITY: Administer Columbia C-SSRS in full; SIR rated ${d5.SIR.level} on SCST — structured safety assessment mandatory.` :
                    `5. Complete Columbia C-SSRS at next clinical contact; current SCST SIR indicator is ${d5.SIR.level}.`,
    `6. Review social support network and physical health indicators (SFI=${d4.SFI}/100, PHI=${d4.physNorm}/100).`,
    `7. Schedule follow-up SCST reassessment after any significant therapeutic intervention or major life event.`,
  ].join("\n");

  return { d1:nd1, d2:nd2, d3:nd3, d4:nd4, d5:nd5, impression, recommendations:recs };
}


// ── VISTA: Shade Generator + SVG Components ──────────────────────
function generateShades(hex) {
  try {
    const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;
    if(max!==min){const d=max-min;s=(max+min)>1?d/(2-max-min):d/(max+min);
      if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}
    const hd=Math.round(h*360),sp=Math.round(Math.max(s,0.5)*100);
    return [88,76,63,50,38,26,14].map((lp,i)=>({code:i+1,hex:`hsl(${hd},${sp}%,${lp}%)`}));
  } catch{return Array.from({length:7},(_,i)=>({code:i+1,hex:`hsl(0,0%,${88-11*i}%)`}));}
}

// ══════════════════════════════════════════════════════════════════════════════
//  SVG SHAPES
// ══════════════════════════════════════════════════════════════════════════════
function ShapeSVG({code,fill="#1e40af",size=48}){
  const s=size,c=s/2,r=s/2-2;
  const poly=n=>Array.from({length:n},(_,i)=>{const a=(i*2*Math.PI/n)-Math.PI/2;return`${c+r*Math.cos(a)},${c+r*Math.sin(a)}`;}).join(" ");
  return(<svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:"block"}}>
    {code===1&&<circle cx={c} cy={c} r={r} fill={fill}/>}
    {code===2&&<polygon points={poly(3)} fill={fill}/>}
    {code===3&&<rect x={2} y={2} width={s-4} height={s-4} fill={fill}/>}
    {code===4&&<polygon points={`${c},2 ${s-2},${c} ${c},${s-2} 2,${c}`} fill={fill}/>}
    {code===5&&<polygon points={poly(5)} fill={fill}/>}
    {code===6&&<polygon points={poly(6)} fill={fill}/>}
    {code===7&&<polygon points={poly(8)} fill={fill}/>}
  </svg>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  STATIC CIRCLE (TEST UI)
// ══════════════════════════════════════════════════════════════════════════════
function StaticCircle({items,onSelect,renderItem}){
  const[ready,setReady]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setReady(true),80);return()=>clearTimeout(t);},[]);
  const n=items.length;
  const vw=typeof window!=="undefined"?Math.min(window.innerWidth,520):400;
  const radius=Math.min(130,Math.max(90,vw*0.24));
  const itemSize=Math.min(70,Math.max(54,radius*0.52));
  const cs=radius*2+itemSize+10,cx=cs/2;
  return(<div style={{position:"relative",width:cs,height:cs,maxWidth:"100%",margin:"0 auto",flexShrink:0}}>
    <svg style={{position:"absolute",top:0,left:0,pointerEvents:"none"}} width={cs} height={cs}>
      <circle cx={cx} cy={cx} r={radius} fill="none" stroke="rgba(30,64,175,0.12)" strokeWidth={1.5} strokeDasharray="5 5"/>
    </svg>
    {items.map((item,idx)=>{
      const angle=(idx/n)*2*Math.PI-Math.PI/2;
      const tx=cx+radius*Math.cos(angle)-itemSize/2,ty=cx+radius*Math.sin(angle)-itemSize/2;
      return(<div key={item.code} onClick={()=>onSelect(item)}
        style={{position:"absolute",width:itemSize,height:itemSize,top:ready?ty:cx-itemSize/2,left:ready?tx:cx-itemSize/2,opacity:ready?1:0,
          transition:`top 0.5s cubic-bezier(0.34,1.4,0.64,1) ${idx*50}ms,left 0.5s cubic-bezier(0.34,1.4,0.64,1) ${idx*50}ms,opacity 0.3s ease ${idx*50}ms,transform 0.18s ease`,
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:"white",borderRadius:"50%",
          boxShadow:"0 3px 14px rgba(0,0,0,0.1),0 0 0 1.5px rgba(30,64,175,0.15)",userSelect:"none",touchAction:"manipulation",zIndex:2}}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)";e.currentTarget.style.boxShadow="0 6px 22px rgba(30,64,175,0.25),0 0 0 2.5px rgba(30,64,175,0.45)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.1),0 0 0 1.5px rgba(30,64,175,0.15)";}}
      >{renderItem(item,Math.round(itemSize*0.55))}</div>);
    })}
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SELECTION STAGE
// ══════════════════════════════════════════════════════════════════════════════
function SelectionStage({stageKey,title,instr,items,renderItem,onComplete,accentColor}){
  const[remaining,setRemaining]=useState([...items]);
  const[selected,setSelected]=useState([]);
  const ac=accentColor||"#1e40af";
  const pick=item=>{
    const ns=[...selected,item],nr=remaining.filter(i=>i.code!==item.code);
    setSelected(ns);setRemaining(nr);
    if(nr.length===0)setTimeout(()=>onComplete(ns.map(i=>i.code)),500);
  };
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,width:"100%"}}>
    <div style={{textAlign:"center",padding:"0 8px"}}>
      <div style={{display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:ac,background:`${ac}12`,borderRadius:100,padding:"4px 14px",marginBottom:6}}>{title}</div>
      <div style={{fontSize:14,color:"#374151",fontWeight:500,lineHeight:1.5}}>{instr}</div>
    </div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
      {Array.from({length:7},(_,i)=>(
        <div key={i} style={{width:28,height:28,borderRadius:"50%",background:i<selected.length?ac:"rgba(30,64,175,0.05)",color:i<selected.length?"white":`${ac}70`,border:i<selected.length?`2px solid ${ac}`:`1.5px dashed ${ac}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
          {i<selected.length?"✓":i+1}
        </div>
      ))}
    </div>
    {remaining.length>0
      ?<StaticCircle key={`${stageKey}-${remaining.length}`} items={remaining} onSelect={pick} renderItem={(item,sz)=>renderItem(item,sz)}/>
      :<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>✅</div>
    }
    {selected.length>0&&(
      <div style={{width:"100%",maxWidth:400,background:"rgba(30,64,175,0.02)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(30,64,175,0.08)"}}>
        <div style={{fontSize:9,fontWeight:700,color:ac,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Selection order — Position 1 (most liked) → 7 (least liked)</div>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          {selected.map((item,idx)=>(
            <div key={item.code} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"white",border:`2px solid ${idx===0?ac:`${ac}28`}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{renderItem(item,19)}</div>
              <span style={{fontSize:8,color:"#9CA3AF",fontWeight:700}}>{idx+1}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  REPORT COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── VISTA: Report Atom Components ────────────────────────────────
function Divider(){return <div style={{borderTop:"1px solid #e5e7eb",margin:"16px 0"}}/>;}
function SectionTitle({children,color="#1e3a5f"}){
  return(<div style={{background:color,color:"white",padding:"7px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14,marginLeft:-20,marginRight:-20}}>
    {children}
  </div>);
}
function ScoreRow({label,value,band,percentile,color="#1e3a5f"}){
  return(<div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6,flexWrap:"wrap"}}>
    <span style={{fontSize:11,color:"#6b7280",minWidth:180,flexShrink:0}}>{label}</span>
    <span style={{fontSize:16,fontWeight:800,color,fontFamily:"'Courier New',monospace",minWidth:50}}>{value}</span>
    {band&&<span style={{fontSize:11,fontWeight:700,color,background:`${color}12`,borderRadius:5,padding:"2px 8px"}}>{band}</span>}
    {percentile&&<span style={{fontSize:10,color:"#9ca3af",fontStyle:"italic"}}>{percentile} percentile</span>}
  </div>);
}
function SubScoreBar({label,value,max=100,color}){
  return(<div style={{marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
      <span style={{color:"#374151",fontWeight:500}}>{label}</span>
      <span style={{fontWeight:700,color,fontFamily:"'Courier New',monospace"}}>{value}</span>
    </div>
    <div style={{background:"#f3f4f6",borderRadius:3,height:6,overflow:"hidden"}}>
      <div style={{width:`${(value/max)*100}%`,height:"100%",background:color,borderRadius:3}}/>
    </div>
  </div>);
}
function RiskBadge({level,color,bg,border,raw,label}){
  return(<div style={{background:bg,border:`1px solid ${border}`,borderRadius:8,padding:"10px 13px",marginBottom:8}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <span style={{fontSize:11,fontWeight:700,color:"#374151"}}>{label}</span>
      <span style={{fontSize:12,fontWeight:800,color,fontFamily:"'Courier New',monospace"}}>{level}</span>
    </div>
    <div style={{background:"#f9fafb",borderRadius:4,height:5,overflow:"hidden"}}>
      <div style={{width:`${raw}%`,height:"100%",background:color,borderRadius:4}}/>
    </div>
    <div style={{fontSize:9,color:"#9ca3af",marginTop:3,textAlign:"right"}}>Index: {raw}/100</div>
  </div>);
}
function InterpPara({children}){
  return(<p style={{fontSize:12.5,color:"#1f2937",lineHeight:1.9,margin:"10px 0",fontFamily:"Georgia, serif",fontWeight:400}}>{children}</p>);
}
function BFrow({label,abbr,score}){
  const hi=score>=55,lo=score<45;
  const col=hi?"#1e3a5f":lo?"#dc2626":"#6b7280";
  const bg=hi?"#eff6ff":lo?"#fef2f2":"#f9fafb";
  return(<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
    <span style={{fontSize:10,fontWeight:700,color:"#6b7280",width:24,textAlign:"right"}}>{abbr}</span>
    <span style={{fontSize:11,color:"#374151",flex:1}}>{label}</span>
    <div style={{background:"#f3f4f6",borderRadius:3,height:6,width:80,flexShrink:0,overflow:"hidden"}}>
      <div style={{width:`${(score-30)/40*100}%`,height:"100%",background:col,borderRadius:3}}/>
    </div>
    <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"'Courier New',monospace",width:28,textAlign:"right",background:bg,borderRadius:4,padding:"1px 4px"}}>{score}</span>
  </div>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLINICAL REPORT RENDERER
// ══════════════════════════════════════════════════════════════════════════════

// ── VISTA: Clinical Report Component ─────────────────────────────
function VistaClinicalReport({clinical,narratives,participant,reportId,examiner}){
  const {d1,d2,d3,d4,d5,meta} = clinical;
  const today = new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});
  const S = {fontFamily:"'Georgia',serif",color:"#1f2937"};
  const CARD={background:"white",borderRadius:0,padding:"20px",marginBottom:0,boxSizing:"border-box"};
  return(
    <div id="report-root" style={{...S,maxWidth:760,margin:"0 auto",background:"white",fontSize:13}}>

      {/* ── PAGE 1: HEADER ── */}
      <div style={{background:"#1e3a5f",color:"white",padding:"20px 24px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"#93c5fd",marginBottom:4}}>Shape · Colour · Shade · Smiley Test</div>
            <div style={{fontSize:20,fontWeight:700,fontFamily:"'Georgia',serif",lineHeight:1.3}}>Clinical Psychometric Evaluation</div>
            <div style={{fontSize:11,color:"#bfdbfe",marginTop:2,fontStyle:"italic"}}>Non-Verbal Projective Assessment · Five-Domain Profile</div>
          </div>
          <div style={{textAlign:"right",fontSize:11,color:"#93c5fd",lineHeight:1.9}}>
            <div style={{fontFamily:"monospace",fontSize:13,color:"white",fontWeight:700}}>Report ID: {reportId}</div>
            <div>Assessment Date: {today}</div>
            <div>Instrument: SCST v1.0</div>
          </div>
        </div>
      </div>

      {/* ── SUBJECT & EXAMINER BLOCK ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"2px solid #1e3a5f",fontSize:12}}>
        <div style={{padding:"12px 16px",borderRight:"1px solid #e5e7eb"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Subject Details</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <tbody>
              {[["Name / ID:", participant.name||"—"],["Age:",participant.age||"—"],["Gender:",participant.gender==="M"?"Male":participant.gender==="F"?"Female":participant.gender||"—"],["Education:",participant.edu||"—"]].map(([l,v])=>(
                <tr key={l}><td style={{color:"#6b7280",paddingBottom:3,paddingRight:10,verticalAlign:"top",whiteSpace:"nowrap"}}>{l}</td><td style={{fontWeight:600,color:"#111827"}}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 16px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>Examiner / Referral</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <tbody>
              {[["Clinician:",examiner||"—"],["Setting:",participant.setting||"—"],["Language:",participant.language||"—"],["Purpose:",participant.purpose||"Screening"]].map(([l,v])=>(
                <tr key={l}><td style={{color:"#6b7280",paddingBottom:3,paddingRight:10,verticalAlign:"top",whiteSpace:"nowrap"}}>{l}</td><td style={{fontWeight:600,color:"#111827"}}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SCST CODE BLOCK ── */}
      <div style={{background:"#f8fafc",borderBottom:"2px solid #1e3a5f",padding:"12px 16px"}}>
        <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:9}}>SCST Response Codes</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[["I — Shape Code",meta.shapeCode,"#1e3a5f",meta.firstShape],["II — Colour Code",meta.colorCode,"#b45309",meta.firstColor],["III — Shade Code",meta.shadeCode,"#6d28d9",meta.firstShade.replace("Shade ","Sh.")],["IV — Smiley Code",meta.smileyCode,"#be185d",meta.firstSmiley]].map(([l,v,c,first])=>(
            <div key={l} style={{background:"white",border:`1px solid ${c}25`,borderRadius:6,padding:"9px 10px"}}>
              <div style={{fontSize:8,fontWeight:700,color:c,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{l}</div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:18,fontWeight:800,color:c,letterSpacing:"0.15em"}}>{v}</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:3}}>Primary: {first}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"0 20px 20px"}}>

        {/* ── DOMAIN 1: COGNITIVE ── */}
        <div style={{marginTop:20}}>
          <SectionTitle color="#1e3a5f">Domain I — Cognitive Function &amp; Intellectual Level</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
            <div>
              <ScoreRow label="SCST-CQ (Cognitive Quotient)" value={d1.CQ} band={d1.iqBand.band} percentile={d1.iqBand.percentile} color="#1e3a5f"/>
              <div style={{fontSize:11,color:"#6b7280",marginTop:2,marginBottom:10,fontStyle:"italic"}}>{d1.iqBand.desc}</div>
              <ScoreRow label="Raw Cognitive Score" value={`${d1.rawCog}/100`} color="#374151"/>
              <ScoreRow label="Cognitive Flexibility Index" value={d1.flexLabel} color="#374151"/>
            </div>
            <div style={{background:"#f8fafc",borderRadius:8,padding:"12px",border:"1px solid #e5e7eb"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Cognitive Style Profile</div>
              <div style={{marginBottom:6}}><span style={{fontSize:10,color:"#6b7280"}}>Primary Style:</span><br/><span style={{fontSize:12,fontWeight:700,color:"#1e3a5f"}}>{d1.primaryStyle}</span></div>
              <div style={{marginBottom:6}}><span style={{fontSize:10,color:"#6b7280"}}>Secondary Style:</span><br/><span style={{fontSize:12,fontWeight:600,color:"#374151"}}>{d1.secondaryStyle}</span></div>
              <div style={{marginBottom:4}}><span style={{fontSize:10,color:"#6b7280"}}>Processing Orientation:</span><br/><span style={{fontSize:11,color:"#374151"}}>{d1.procOrient}</span></div>
            </div>
          </div>
          <div style={{background:"#f0f4f8",borderRadius:6,padding:"10px 12px",marginBottom:12,border:"1px solid #cbd5e1"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>Shape Sequence Indicators (Position Analysis)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,fontSize:11}}>
              {[["Position A (Most preferred)",d1.topShape.name,d1.topShape.cogStyle],["Position B (2nd)",d1.secondShape.name,d1.secondShape.cogStyle],["Position D (Mid / Neutral)",d1.midShape.name,d1.midLabel],["Position G (Least preferred)",d1.botShape.name,d1.botShape.cogStyle]].map(([pos,name,desc])=>(
                <div key={pos} style={{background:"white",borderRadius:5,padding:"7px 8px",border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:8,color:"#9ca3af",marginBottom:2}}>{pos}</div>
                  <div style={{fontWeight:700,color:"#1e3a5f",fontSize:12}}>{name}</div>
                  <div style={{fontSize:9,color:"#64748b",lineHeight:1.4}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          {narratives.d1&&<InterpPara>{narratives.d1}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 2: PERSONALITY ── */}
        <div>
          <SectionTitle color="#1e5f2e">Domain II — Personality Organisation</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
            <div>
              <div style={{background:d2.dsmCluster.includes("No Significant")?"#f0fdf4":d2.dsmCluster.includes("A")?"#eff6ff":d2.dsmCluster.includes("B")?"#fff7ed":"#faf5ff",border:`1px solid ${d2.dsmCluster.includes("No Significant")?"#86efac":d2.dsmCluster.includes("A")?"#93c5fd":d2.dsmCluster.includes("B")?"#fdba74":"#d8b4fe"}`,borderRadius:8,padding:"12px",marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>DSM-5 Personality Cluster Alignment</div>
                <div style={{fontSize:14,fontWeight:800,color:"#1e3a5f",marginBottom:3}}>{d2.dsmCluster}</div>
                <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>{d2.dsmFeatures}</div>
                <div style={{fontSize:11,color:"#374151",lineHeight:1.7}}>{d2.dsmDesc}</div>
              </div>
              <div style={{background:"#fef9c3",borderRadius:6,padding:"9px 11px",border:"1px solid #fde047",fontSize:11,color:"#713f12",lineHeight:1.7}}>
                <strong>Clinical Note:</strong> {d2.dsmClinical}
              </div>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>NEO-PI Analog — Big Five Dimensional Profile (T-scores, M=50, SD=10)</div>
              {[["Openness to Experience","O",d2.BFt.O],["Conscientiousness","C",d2.BFt.C],["Extraversion","E",d2.BFt.E],["Agreeableness","A",d2.BFt.A],["Neuroticism","N",d2.BFt.N]].map(([l,a,sc])=>(
                <BFrow key={a} label={l} abbr={a} score={sc}/>
              ))}
              <div style={{fontSize:9,color:"#9ca3af",marginTop:6,textAlign:"right",fontStyle:"italic"}}>T&lt;45 = Low · T 45–55 = Average · T&gt;55 = High</div>
            </div>
          </div>
          {narratives.d2&&<InterpPara>{narratives.d2}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 3: EQ / EMOTIONAL STABILITY ── */}
        <div>
          <SectionTitle color="#78350f">Domain III — Emotional Intelligence &amp; Affective Stability</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
            <div>
              <ScoreRow label="SCST-EQ Standard Score" value={d3.EQSS} band={d3.eqBand.band} percentile={d3.eqBand.percentile} color="#78350f"/>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:10,fontStyle:"italic"}}>{d3.eqBand.desc}</div>
              <ScoreRow label="Emotional Stability Index (ESI)" value={`${d3.ESI}/100`} color="#374151"/>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:10}}>Ref: Bar-On EQ-i 2.0 normative framework (SS M=100, SD=15)</div>
              <div style={{background:"#fefce8",borderRadius:6,padding:"9px 11px",border:"1px solid #fde047",fontSize:11}}>
                <div style={{fontWeight:700,color:"#713f12",marginBottom:3}}>Primary Affect State: {d3.affState}</div>
                <div style={{color:"#92400e"}}>Valence Category: <strong>{d3.affValence}</strong></div>
                <div style={{color:"#92400e",marginTop:2}}>Shade Selection: {meta.firstShade}</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>EQ Sub-Scale Scores (0–100)</div>
              <SubScoreBar label="Emotional Self-Awareness" value={d3.selfAwareness} color="#d97706"/>
              <SubScoreBar label="Emotional Regulation" value={d3.emoRegulation} color="#d97706"/>
              <SubScoreBar label="Emotional Resilience" value={d3.emoResilience} color="#d97706"/>
              <Divider/>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Shade-Derived Indices</div>
              <SubScoreBar label="Emotional Burden Index" value={d3.shadePrimary.mentalBurden} color="#b45309"/>
              <SubScoreBar label="Rumination Index" value={d3.ruminScore} color="#b45309"/>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:4,fontStyle:"italic"}}>Higher values indicate elevated burden/rumination</div>
            </div>
          </div>
          {narratives.d3&&<InterpPara>{narratives.d3}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 4: HEALTH ── */}
        <div>
          <SectionTitle color="#831843">Domain IV — Health Indicators (Mental · Physical · Social)</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
            {/* Mental */}
            <div style={{background:"#fdf2f8",borderRadius:8,padding:"12px",border:"1px solid #fbcfe8"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#9d174d",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Mental Health</div>
              <ScoreRow label="MHI Score" value={`${d4.MHI}/100`} color="#9d174d"/>
              <div style={{fontSize:11,fontWeight:700,color:d4.phqAnalog.severity>=3?"#dc2626":d4.phqAnalog.severity>=2?"#d97706":"#16a34a",background:d4.phqAnalog.severity>=3?"#fef2f2":d4.phqAnalog.severity>=2?"#fffbeb":"#f0fdf4",borderRadius:5,padding:"4px 8px",marginBottom:8,textAlign:"center"}}>{d4.phqAnalog.level}</div>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>(PHQ-9 analog)</div>
              <SubScoreBar label={`Anxiety — ${d4.anxLevel}`} value={d4.anxIdx} color="#db2777"/>
              <SubScoreBar label={`Depression — ${d4.depLevel}`} value={d4.depIdx} color="#be185d"/>
            </div>
            {/* Physical */}
            <div style={{background:"#fff1f2",borderRadius:8,padding:"12px",border:"1px solid #fecdd3"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#9f1239",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Physical Health</div>
              <ScoreRow label="PHI Score" value={`${d4.physNorm}/100`} color="#9f1239"/>
              <div style={{fontSize:11,fontWeight:700,color:"#9f1239",marginBottom:8}}>Autonomic Arousal: {d4.physArousal}</div>
              <div style={{fontSize:10,color:"#6b7280",lineHeight:1.7}}>Colour-derived physiological arousal indicator. Elevated arousal (warm/intense colours) may reflect heightened sympathetic activation or psychosomatic stress response.</div>
            </div>
            {/* Social */}
            <div style={{background:"#fdf4ff",borderRadius:8,padding:"12px",border:"1px solid #e9d5ff"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6b21a8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Social Functioning</div>
              <ScoreRow label="SFI Score" value={`${d4.SFI}/100`} color="#6b21a8"/>
              <div style={{fontSize:11,color:"#374151",lineHeight:1.6,marginTop:4}}>{d4.sfLevel}</div>
              <div style={{fontSize:9,color:"#9ca3af",marginTop:6,fontStyle:"italic"}}>(UCLA Loneliness Scale / SSQ analog)</div>
            </div>
          </div>
          <div style={{background:"#1e3a5f",color:"white",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
            <div>
              <div style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#93c5fd",marginBottom:3}}>Overall Wellbeing Composite</div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:28,fontWeight:800,color:"white"}}>{d4.overallWBI}<span style={{fontSize:13,color:"#93c5fd",fontWeight:400}}> /100</span></div>
            </div>
            <div style={{flex:1,fontSize:11,color:"#bfdbfe",lineHeight:1.7}}>{d4.phqAnalog.desc}</div>
          </div>
          {narratives.d4&&<InterpPara>{narratives.d4}</InterpPara>}
        </div>

        <Divider/>

        {/* ── DOMAIN 5: RISK ── */}
        <div>
          <SectionTitle color="#7c1d1d">Domain V — Risk Factor Profile</SectionTitle>
          <div style={{background:"#fef2f2",borderRadius:8,padding:"11px 14px",marginBottom:14,border:`2px solid ${d5.CRI_color}40`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase"}}>Combined Risk Index</div>
              <div style={{fontSize:14,fontWeight:800,color:d5.CRI_color}}>{d5.CRI}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:0}}>
            <RiskBadge label="1. Suicidal Ideation Risk (Columbia CSSRS Analog)" level={d5.SIR.level} color={d5.SIR.color} bg={d5.SIR.bg} border={d5.SIR.border} raw={d5.SIR_raw}/>
            <div style={{fontSize:11,color:"#374151",marginBottom:12,lineHeight:1.7,paddingLeft:4}}>
              {d5.SIR_indicators.map((ind,i)=><div key={i} style={{marginBottom:2}}>• {ind}</div>)}
            </div>
            <RiskBadge label="2. Substance Use Risk" level={d5.SUR.level} color={d5.SUR.color} bg={d5.SUR.bg} border={d5.SUR.border} raw={d5.SUR_raw}/>
            <div style={{fontSize:11,color:"#374151",marginBottom:12,lineHeight:1.7,paddingLeft:4}}>
              {d5.SUR_indicators.map((ind,i)=><div key={i} style={{marginBottom:2}}>• {ind}</div>)}
            </div>
            <RiskBadge label="3. Conduct / Delinquency Risk" level={d5.CDR.level} color={d5.CDR.color} bg={d5.CDR.bg} border={d5.CDR.border} raw={d5.CDR_raw}/>
            <div style={{fontSize:11,color:"#374151",marginBottom:12,lineHeight:1.7,paddingLeft:4}}>
              {d5.CDR_indicators.map((ind,i)=><div key={i} style={{marginBottom:2}}>• {ind}</div>)}
            </div>
          </div>
          <div style={{background:"#fef9c3",borderRadius:6,padding:"10px 12px",border:"1px solid #fde047",fontSize:11,color:"#713f12",lineHeight:1.7,marginBottom:12}}>
            <strong>⚠ IMPORTANT:</strong> Domain V scores reflect emotional and behavioural state correlates derived from visual-projective responses. These are screening indicators only and do not constitute clinical diagnosis or predictive assessment. All elevated indicators must be confirmed through structured clinical interview, validated scales (C-SSRS, AUDIT, SDQ), and direct clinical assessment before any intervention decision.
          </div>
          {narratives.d5&&<InterpPara>{narratives.d5}</InterpPara>}
        </div>

        <Divider/>

        {/* ── CLINICAL IMPRESSION ── */}
        {narratives.impression&&(
          <div>
            <SectionTitle color="#1e3a5f">Clinical Impression — Integrated Summary</SectionTitle>
            <InterpPara>{narratives.impression}</InterpPara>
            <Divider/>
          </div>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {narratives.recommendations&&(
          <div>
            <SectionTitle color="#1e5f2e">Clinical Recommendations</SectionTitle>
            <div style={{fontSize:12,color:"#1f2937",lineHeight:2,fontFamily:"Georgia,serif"}}>
              {narratives.recommendations.split("\n").filter(l=>l.trim()).map((line,i)=>(
                <div key={i} style={{marginBottom:4,paddingLeft:4}}>{line}</div>
              ))}
            </div>
            <Divider/>
          </div>
        )}

        {/* ── LIMITATIONS ── */}
        <div style={{background:"#f8fafc",borderRadius:8,padding:"14px 16px",border:"1px solid #e2e8f0",marginBottom:16}}>
          <div style={{fontSize:9,fontWeight:700,color:"#6b7280",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:9}}>Test Limitations &amp; Caveats</div>
          <div style={{fontSize:11,color:"#374151",lineHeight:1.85}}>
            {["The SCST is a non-verbal projective screening instrument under active validation. Scores are not standardised against a normative population at this stage of development.",
              "All domain classifications are theoretical-empirical approximations based on peer-reviewed colour, shape, and affect research. They are not equivalent to scores obtained from validated psychometric batteries.",
              "This report is intended to assist a qualified clinician's formulation — not to replace clinical judgement or replace gold-standard instruments (Wechsler, NEO-PI-3, EQ-i 2.0, C-SSRS, PHQ-9, AUDIT).",
              "Cross-cultural and contextual factors may influence projective responses. The evaluating clinician must interpret results within the subject's cultural, linguistic, and socioeconomic context.",
              "Re-assessment is recommended after any significant life event, therapeutic intervention, or when results appear inconsistent with clinical presentation."
            ].map((t,i)=><div key={i} style={{marginBottom:5,display:"flex",gap:6}}><span style={{flexShrink:0,color:"#9ca3af"}}>{i+1}.</span><span>{t}</span></div>)}
          </div>
        </div>

        {/* ── SIGNATURE BLOCK ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:10}}>
          {["Evaluating Clinician / Examiner","Supervising Clinician (if applicable)"].map(label=>(
            <div key={label}>
              <div style={{borderTop:"1.5px solid #1e3a5f",paddingTop:8}}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:2}}>{label}</div>
                <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:100}}>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:12}}>Signature</div>
                    <div style={{borderBottom:"1px dotted #cbd5e1",marginBottom:4}}/>
                  </div>
                  <div style={{flex:1,minWidth:80}}>
                    <div style={{fontSize:9,color:"#9ca3af",marginBottom:12}}>Date</div>
                    <div style={{borderBottom:"1px dotted #cbd5e1",marginBottom:4}}/>
                  </div>
                </div>
                <div style={{fontSize:9,color:"#9ca3af",marginTop:4}}>Name &amp; Designation: __________________________</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:16,borderTop:"1px solid #e5e7eb",paddingTop:10,display:"flex",justifyContent:"space-between",fontSize:9,color:"#9ca3af"}}>
          <span>SCST Clinical Report · {reportId} · {today}</span>
          <span>CONFIDENTIAL — For clinical use only</span>
        </div>
      </div>
    </div>
  );
}

// ── VISTA: Global Styles ─────────────────────────────────────────
const VISTA_G=`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  body{font-family:'DM Sans',sans-serif;background:#e8ecf0;margin:0}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  button:active{transform:scale(0.97)}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#1e3a5f!important;box-shadow:0 0 0 3px rgba(30,58,95,0.1)!important}
  @media print{
    body{background:white!important}
    #no-print{display:none!important}
    #report-root{max-width:100%!important;margin:0!important;box-shadow:none!important}
  }
`;
const ROOT={minHeight:"100vh",background:"#e8ecf0",fontFamily:"'DM Sans',sans-serif",padding:"16px 8px 80px"};
const CARD={background:"white",borderRadius:12,padding:"18px 16px",maxWidth:540,width:"100%",margin:"0 auto",boxShadow:"0 2px 16px rgba(0,0,0,0.08)"};
const LBL={display:"block",fontSize:10,fontWeight:700,color:"#1e3a5f",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4};
const INP={width:"100%",padding:"10px 12px",border:"1.5px solid #cbd5e1",borderRadius:8,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",background:"#fafafa",color:"#0f172a"};
const BTN={display:"block",width:"100%",padding:"14px",background:"#1e3a5f",color:"white",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.01em"};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP

// ══════════════════════════════════════════════════════════════════
// ║  VALID — SVG ATOMS + RAVENS CAT ITEM POOL + INSTRUMENTS       ║
// ══════════════════════════════════════════════════════════════════
const RvCircle = ({cx,cy,r=20,fill="none",stroke="#374151",sw=2.5}) =>
  <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw}/>;
const RvRect = ({cx,cy,s=38,fill="none",stroke="#374151",sw=2.5}) =>
  <rect x={cx-s/2} y={cy-s/2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={sw}/>;
const RvTri = ({cx,cy,s=22,fill="none",stroke="#374151",sw=2.5}) =>
  <polygon points={`${cx},${cy-s} ${cx-s*0.87},${cy+s*0.5} ${cx+s*0.87},${cy+s*0.5}`}
    fill={fill} stroke={stroke} strokeWidth={sw}/>;
const RvDiam = ({cx,cy,s=21,fill="none",stroke="#374151",sw=2.5}) =>
  <polygon points={`${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`}
    fill={fill} stroke={stroke} strokeWidth={sw}/>;
const RvDot = ({cx,cy,r=7,fill="#374151"}) => <circle cx={cx} cy={cy} r={r} fill={fill}/>;
const RvArrow = ({cx,cy,dir="right",size=16,color="#374151"}) => {
  const s=size, h=s*0.45;
  const pts = {
    right:`${cx-s},${cy-h} ${cx+s*0.3},${cy-h} ${cx+s*0.3},${cy-s} ${cx+s},${cy} ${cx+s*0.3},${cy+s} ${cx+s*0.3},${cy+h} ${cx-s},${cy+h}`,
    down: `${cx-h},${cy-s} ${cx+h},${cy-s} ${cx+h},${cy+s*0.3} ${cx+s},${cy+s*0.3} ${cx},${cy+s} ${cx-s},${cy+s*0.3} ${cx-h},${cy+s*0.3}`,
    left: `${cx+s},${cy-h} ${cx-s*0.3},${cy-h} ${cx-s*0.3},${cy-s} ${cx-s},${cy} ${cx-s*0.3},${cy+s} ${cx-s*0.3},${cy+h} ${cx+s},${cy+h}`,
    up:   `${cx-h},${cy+s} ${cx+h},${cy+s} ${cx+h},${cy-s*0.3} ${cx+s},${cy-s*0.3} ${cx},${cy-s} ${cx-s},${cy-s*0.3} ${cx-h},${cy-s*0.3}`,
  }[dir];
  return <polygon points={pts} fill={color}/>;
};
const RvQMark = ({cx,cy,fsz=26}) =>
  <text x={cx} y={cy+9} textAnchor="middle" fontSize={fsz} fontWeight="900" fill="#94A3B8">?</text>;
const RvGrid = ({rows,cols,cs=70}) => <>
  {Array.from({length:cols+1},(_,i)=><line key={`v${i}`} x1={i*cs} y1={0} x2={i*cs} y2={rows*cs} stroke="#CBD5E1" strokeWidth={1.5}/>)}
  {Array.from({length:rows+1},(_,i)=><line key={`h${i}`} x1={0} y1={i*cs} x2={cols*cs} y2={i*cs} stroke="#CBD5E1" strokeWidth={1.5}/>)}
</>;
// Regular n-sided polygon (vertex at top)
const RvPoly = ({cx,cy,r=20,n,fill="none",stroke="#374151",sw=2.5}) => {
  const pts = Array.from({length:n},(_,i)=>{
    const a = -Math.PI/2 + (2*Math.PI*i)/n;
    return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw}/>;
};
// Dots arranged in a compact grid
const RvDots = ({cx,cy,n,r=5}) => {
  const layouts = {
    1:[[0,0]],
    2:[[-8,0],[8,0]],
    3:[[-9,5],[0,-8],[9,5]],
    4:[[-8,-8],[8,-8],[-8,8],[8,8]],
    5:[[0,-10],[10,-3],[6,9],[-6,9],[-10,-3]],
    6:[[-10,-7],[0,-7],[10,-7],[-10,7],[0,7],[10,7]],
    7:[[-10,-9],[0,-9],[10,-9],[-10,0],[10,0],[-5,9],[5,9]],
    8:[[-12,-7],[-4,-7],[4,-7],[12,-7],[-12,7],[-4,7],[4,7],[12,7]],
    9:[[-11,-11],[0,-11],[11,-11],[-11,0],[0,0],[11,0],[-11,11],[0,11],[11,11]],
    12:[[-13,-10],[-4,-10],[4,-10],[13,-10],[-13,-2],[-4,-2],[4,-2],[13,-2],[-13,7],[-4,7],[4,7],[13,7]],
  };
  return <>{(layouts[n]||[]).map(([dx,dy],i)=><circle key={i} cx={cx+dx} cy={cy+dy} r={r} fill="#374151"/>)}</>;
};

// ── CAT Item Pools organised by IQ Band ───────────────────────────────────────
// Band 1 (IQ 70–85)   — 6 items — advance rule: 4/6 correct — Mental Age ~7–9
// Band 2 (IQ 85–100)  — 6 items — advance rule: 4/6 correct — Mental Age ~9–12
// Band 3 (IQ 100–115) — 6 items — advance rule: 4/6 correct — Mental Age ~12–15
// Band 4 (IQ 115–130) — 4 items — terminal band            — Mental Age 15+
const RAVENS_CAT = {
  1: [
    // B1-Q1: Shape cycle ○□△ repeating across each row — 3×3 matrix
    { id:1, title:"Shape Pattern", instruction:"Which shape belongs in the empty box?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[[0,0,'c'],[0,1,'s'],[0,2,'t'],[1,0,'c'],[1,1,'s'],[1,2,'t'],[2,0,'c'],[2,1,'s']].map(([r,c,tp],i)=>{
            const x=c*70+35,y=r*70+35;
            return tp==='c'?<RvCircle key={i} cx={x} cy={y}/>:tp==='s'?<RvRect key={i} cx={x} cy={y}/>:<RvTri key={i} cx={x} cy={y}/>;
          })}
          <RvQMark cx={175} cy={175}/>
        </svg>),
      options:[
        {label:"Triangle", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={19}/></svg>},
        {label:"Circle",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={19}/></svg>},
        {label:"Square",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvRect cx={28} cy={28} s={36}/></svg>},
        {label:"Diamond",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDiam cx={28} cy={28} s={19}/></svg>},
      ]},

    // B1-Q2: Size series — circles shrinking left to right in 1×4
    { id:2, title:"Size Series", instruction:"Which circle comes next in the sequence?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <RvCircle cx={35} cy={35} r={26}/><RvCircle cx={105} cy={35} r={19}/>
          <RvCircle cx={175} cy={35} r={12}/><RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"Tiny",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={6}/></svg>},
        {label:"Large",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={24}/></svg>},
        {label:"Medium", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={17}/></svg>},
        {label:"Small",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={11}/></svg>},
      ]},

    // B1-Q3: Fill alternation — filled ● empty ○ filled ● ? = empty ○
    { id:3, title:"Fill Pattern", instruction:"Which circle comes next in the sequence?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <circle cx={35}  cy={35} r={22} fill="#374151"/>
          <RvCircle cx={105} cy={35} r={22}/>
          <circle cx={175} cy={35} r={22} fill="#374151"/>
          <RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"Empty ○",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={22}/></svg>},
        {label:"Filled ●", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><circle cx={28} cy={28} r={22} fill="#374151"/></svg>},
        {label:"Square",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvRect cx={28} cy={28} s={36}/></svg>},
        {label:"Triangle", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={20}/></svg>},
      ]},

    // B1-Q4: Dot count series 1→2→3→? = 4 dots
    { id:4, title:"Dot Count", instruction:"How many dots come next?", ans:1,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <circle cx={35} cy={35} r={7} fill="#374151"/>
          <RvDots cx={105} cy={35} n={2} r={7}/>
          <RvDots cx={175} cy={35} n={3} r={7}/>
          <RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"2 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={2} r={7}/></svg>},
        {label:"4 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={4} r={8}/></svg>},
        {label:"6 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={6} r={8}/></svg>},
        {label:"5 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={5} r={8}/></svg>},
      ]},

    // B1-Q5: Arrow direction cycle → ↓ ← ? = ↑
    { id:5, title:"Arrow Direction", instruction:"Which arrow direction comes next?", ans:2,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <RvArrow cx={35}  cy={35} dir="right" size={16}/>
          <RvArrow cx={105} cy={35} dir="down"  size={16}/>
          <RvArrow cx={175} cy={35} dir="left"  size={16}/>
          <RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"Right →", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="right" size={16}/></svg>},
        {label:"Down ↓",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="down"  size={16}/></svg>},
        {label:"Up ↑",    render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="up"    size={16}/></svg>},
        {label:"Left ←",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="left"  size={16}/></svg>},
      ]},

    // B1-Q6: Same shape repeats across each row — 3×3 (△row, ○row, □row) — missing: □
    { id:6, title:"Row Rule", instruction:"Which shape completes the bottom row?", ans:2,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          <RvTri cx={35} cy={35} s={20}/><RvTri cx={105} cy={35} s={20}/><RvTri cx={175} cy={35} s={20}/>
          <RvCircle cx={35} cy={105} r={20}/><RvCircle cx={105} cy={105} r={20}/><RvCircle cx={175} cy={105} r={20}/>
          <RvRect cx={35} cy={175} s={38}/><RvRect cx={105} cy={175} s={38}/>
          <RvQMark cx={175} cy={175}/>
        </svg>),
      options:[
        {label:"Triangle", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={20}/></svg>},
        {label:"Circle",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={20}/></svg>},
        {label:"Square",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvRect cx={28} cy={28} s={38}/></svg>},
        {label:"Diamond",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDiam cx={28} cy={28} s={20}/></svg>},
      ]},
  ],

  2: [
    // B2-Q1: Dot doubling 1→2→4→? = 8
    { id:7, title:"Dot Count", instruction:"How many dots fill the next box?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <RvDot cx={35} cy={35}/>
          <RvDot cx={91} cy={22}/><RvDot cx={119} cy={48}/>
          <RvDot cx={155} cy={22}/><RvDot cx={175} cy={22}/><RvDot cx={155} cy={48}/><RvDot cx={175} cy={48}/>
          <RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"8 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={8} r={4.5}/></svg>},
        {label:"3 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={3} r={5}/></svg>},
        {label:"5 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={5} r={5}/></svg>},
        {label:"6 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={6} r={4.5}/></svg>},
      ]},

    // B2-Q2: Arrow rotation 90° clockwise: → ↓ ← ? = ↑
    { id:8, title:"Arrow Direction", instruction:"Which arrow direction comes next?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <RvArrow cx={35} cy={35} dir="right" size={15}/>
          <RvArrow cx={105} cy={35} dir="down"  size={15}/>
          <RvArrow cx={175} cy={35} dir="left"  size={15}/>
          <RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"Up",    render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="up"    size={14}/></svg>},
        {label:"Right", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="right" size={14}/></svg>},
        {label:"Down",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="down"  size={14}/></svg>},
        {label:"Left",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="left"  size={14}/></svg>},
      ]},

    // B2-Q3: Checkerboard alternating fill — bottom-right cell missing
    { id:9, title:"Grid Pattern", instruction:"Which tile completes the checkerboard?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1]].map(([r,c])=>(
            (r+c)%2===0
              ?<rect key={`${r}${c}`} x={c*70+8} y={r*70+8} width={54} height={54} fill="#374151" rx={5}/>
              :<rect key={`${r}${c}`} x={c*70+8} y={r*70+8} width={54} height={54} fill="none" stroke="#CBD5E1" strokeWidth={2} rx={5}/>
          ))}
          <RvQMark cx={175} cy={175}/>
        </svg>),
      options:[
        {label:"Filled",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={6} y={6} width={44} height={44} fill="#374151" rx={5}/></svg>},
        {label:"Empty",    render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={6} y={6} width={44} height={44} fill="none" stroke="#CBD5E1" strokeWidth={2.5} rx={5}/></svg>},
        {label:"Triangle", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={19} fill="#374151" stroke="none" sw={0}/></svg>},
        {label:"Circle",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><circle cx={28} cy={28} r={22} fill="#374151"/></svg>},
      ]},

    // B2-Q4: Count increases per column (1→2→3 shapes per col), shape changes per row
    { id:10, title:"Count Pattern", instruction:"How many squares complete the bottom row?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          <RvTri cx={35} cy={35} s={17} fill="#374151" stroke="none" sw={0}/>
          <RvTri cx={93} cy={35} s={14} fill="#374151" stroke="none" sw={0}/><RvTri cx={117} cy={35} s={14} fill="#374151" stroke="none" sw={0}/>
          <RvTri cx={150} cy={35} s={12} fill="#374151" stroke="none" sw={0}/><RvTri cx={170} cy={35} s={12} fill="#374151" stroke="none" sw={0}/><RvTri cx={190} cy={35} s={12} fill="#374151" stroke="none" sw={0}/>
          <RvDot cx={35} cy={105} r={15}/>
          <RvDot cx={93} cy={105} r={11}/><RvDot cx={117} cy={105} r={11}/>
          <RvDot cx={150} cy={105} r={10}/><RvDot cx={170} cy={105} r={10}/><RvDot cx={190} cy={105} r={10}/>
          <rect x={13} y={153} width={44} height={44} fill="none" stroke="#374151" strokeWidth={2.5}/>
          <rect x={79} y={158} width={32} height={32} fill="none" stroke="#374151" strokeWidth={2.5}/>
          <rect x={113} y={158} width={32} height={32} fill="none" stroke="#374151" strokeWidth={2.5}/>
          <RvQMark cx={175} cy={175}/>
        </svg>),
      options:[
        {label:"Three □", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
            <rect x={3}  y={18} width={15} height={15} fill="none" stroke="#374151" strokeWidth={2}/>
            <rect x={21} y={18} width={15} height={15} fill="none" stroke="#374151" strokeWidth={2}/>
            <rect x={39} y={18} width={15} height={15} fill="none" stroke="#374151" strokeWidth={2}/>
          </svg>},
        {label:"One □",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={14} y={14} width={28} height={28} fill="none" stroke="#374151" strokeWidth={2.5}/></svg>},
        {label:"Four □",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
            {[3,17,31,45].map(x=><rect key={x} x={x} y={20} width={11} height={11} fill="none" stroke="#374151" strokeWidth={2}/>)}
          </svg>},
        {label:"Two □",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
            <rect x={9}  y={18} width={16} height={16} fill="none" stroke="#374151" strokeWidth={2}/>
            <rect x={32} y={18} width={16} height={16} fill="none" stroke="#374151" strokeWidth={2}/>
          </svg>},
      ]},

    // B2-Q5: Two attributes — large/small × filled/empty in 1×4
    // large-filled, small-filled, large-empty, ? = small-empty
    { id:11, title:"Size & Fill", instruction:"Which tile fits the pattern?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 280 70" width={280} height={70} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={1} cols={4} cs={70}/>
          <rect x={11} y={11} width={48} height={48} fill="#374151" rx={5}/>
          <rect x={90} y={26} width={30} height={30} fill="#374151" rx={4}/>
          <rect x={151} y={11} width={48} height={48} fill="none" stroke="#374151" strokeWidth={2.5} rx={5}/>
          <RvQMark cx={245} cy={35}/>
        </svg>),
      options:[
        {label:"Small □", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={13} y={13} width={30} height={30} fill="none" stroke="#374151" strokeWidth={2.5} rx={4}/></svg>},
        {label:"Large □", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={3} y={3} width={50} height={50} fill="none" stroke="#374151" strokeWidth={2.5} rx={5}/></svg>},
        {label:"Small ■", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={13} y={13} width={30} height={30} fill="#374151" rx={4}/></svg>},
        {label:"Large ■", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={3} y={3} width={50} height={50} fill="#374151" rx={5}/></svg>},
      ]},

    // B2-Q6: Shape per column (○□△) × shade per row (dark→grey→outline) — 3×3
    // Missing: (row2, col2) = outline triangle
    { id:12, title:"Shape & Shade", instruction:"Which shape belongs in the empty box?", ans:0,
      renderStimulus:()=>{
        const fills=["#374151","#94A3B8",null];
        return (
          <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
            <RvGrid rows={3} cols={3}/>
            {[0,1,2].flatMap(r=>[0,1,2].map(c=>{
              if(r===2&&c===2) return <RvQMark key="q" cx={175} cy={175}/>;
              const cx=35+c*70, cy=35+r*70;
              const fill=fills[r];
              if(c===0) return <circle key={`${r}${c}`} cx={cx} cy={cy} r={22} fill={fill||"none"} stroke={fill?null:"#374151"} strokeWidth={fill?0:2.5}/>;
              if(c===1) return <rect key={`${r}${c}`} x={cx-20} y={cy-20} width={40} height={40} fill={fill||"none"} stroke={fill?null:"#374151"} strokeWidth={fill?0:2.5} rx={3}/>;
              return <RvTri key={`${r}${c}`} cx={cx} cy={cy} s={22} fill={fill||"none"} stroke={fill?null:"#374151"} sw={fill?0:2.5}/>;
            }))}
          </svg>
        );
      },
      options:[
        {label:"Empty △",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={22}/></svg>},
        {label:"Filled △", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={22} fill="#374151" stroke="none" sw={0}/></svg>},
        {label:"Grey △",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={22} fill="#94A3B8" stroke="none" sw={0}/></svg>},
        {label:"Empty ○",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={22}/></svg>},
      ]},
  ],

  3: [
    // B3-Q1: Two rules — shape changes per row AND size shrinks per column
    { id:13, title:"Size & Shape", instruction:"Which shape belongs in the empty box?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          <RvCircle cx={35} cy={35} r={27}/><RvCircle cx={105} cy={35} r={20}/><RvCircle cx={175} cy={35} r={12}/>
          <RvRect cx={35} cy={105} s={50}/><RvRect cx={105} cy={105} s={38}/><RvRect cx={175} cy={105} s={23}/>
          <RvTri cx={35} cy={175} s={27}/><RvTri cx={105} cy={175} s={20}/>
          <RvQMark cx={175} cy={175}/>
        </svg>),
      options:[
        {label:"Small △", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={12}/></svg>},
        {label:"Large △", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvTri cx={28} cy={28} s={24}/></svg>},
        {label:"Small ○", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={12}/></svg>},
        {label:"Large ○", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvCircle cx={28} cy={28} r={24}/></svg>},
      ]},

    // B3-Q2: Shade gradient dark→grey→light repeats in every row — 3×3
    { id:14, title:"Shade Pattern", instruction:"Which shade belongs in the empty box?", ans:0,
      renderStimulus:()=>{
        const shades=["#1F2937","#94A3B8","#F1F5F9"];
        return(
          <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
            <RvGrid rows={3} cols={3}/>
            {[0,1,2].flatMap(r=>shades.map((fill,c)=>{
              if(r===2&&c===2) return null;
              return <rect key={`${r}${c}`} x={c*70+8} y={r*70+8} width={54} height={54} fill={fill} rx={6}/>;
            }))}
            <RvQMark cx={175} cy={175}/>
          </svg>);
      },
      options:[
        {label:"Light",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={5} y={5} width={46} height={46} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={1.5} rx={6}/></svg>},
        {label:"Dark",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={5} y={5} width={46} height={46} fill="#1F2937" rx={6}/></svg>},
        {label:"Medium", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={5} y={5} width={46} height={46} fill="#94A3B8" rx={6}/></svg>},
        {label:"Black",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><rect x={5} y={5} width={46} height={46} fill="#000" rx={6}/></svg>},
      ]},

    // B3-Q3: Two rules — arrow direction changes per row AND size decreases per column
    { id:15, title:"Direction & Size", instruction:"Which arrow completes the pattern?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          <RvArrow cx={35}  cy={35}  dir="right" size={20}/>
          <RvArrow cx={105} cy={35}  dir="right" size={14}/>
          <RvArrow cx={175} cy={35}  dir="right" size={8}/>
          <RvArrow cx={35}  cy={105} dir="down" size={20}/>
          <RvArrow cx={105} cy={105} dir="down" size={14}/>
          <RvArrow cx={175} cy={105} dir="down" size={8}/>
          <RvArrow cx={35}  cy={175} dir="left" size={20}/>
          <RvArrow cx={105} cy={175} dir="left" size={14}/>
          <RvQMark cx={175} cy={175}/>
        </svg>),
      options:[
        {label:"Small ←",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="left"  size={8}/></svg>},
        {label:"Large ←",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="left"  size={20}/></svg>},
        {label:"Small →",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="right" size={8}/></svg>},
        {label:"Med ↓",    render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="down"  size={14}/></svg>},
      ]},

    // B3-Q4: Two rules — shape type per row (○□△) × count per column (1,2,3) — 3×3
    // Missing: (row2,col2) = 3 triangles
    { id:16, title:"Shape & Count", instruction:"What fills the missing cell?", ans:0,
      renderStimulus:()=>{
        const S=['c','s','t'];
        const draw=(sh,cx,cy,sz,key)=>{
          if(sh==='c') return <circle key={key} cx={cx} cy={cy} r={sz} fill="#374151"/>;
          if(sh==='s') return <rect key={key} x={cx-sz} y={cy-sz} width={sz*2} height={sz*2} fill="#374151" rx={2}/>;
          return <RvTri key={key} cx={cx} cy={cy} s={sz+3} fill="#374151" stroke="none" sw={0}/>;
        };
        return (
          <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
            <RvGrid rows={3} cols={3}/>
            {[0,1,2].flatMap(r=>[0,1,2].flatMap(c=>{
              if(r===2&&c===2) return [<RvQMark key="q" cx={175} cy={175}/>];
              const cx=35+c*70, cy=35+r*70, cnt=c+1;
              const sz=cnt===1?17:cnt===2?13:10;
              if(cnt===1) return [draw(S[r],cx,cy,sz,`${r}${c}0`)];
              if(cnt===2) return [draw(S[r],cx-13,cy,sz,`${r}${c}0`),draw(S[r],cx+13,cy,sz,`${r}${c}1`)];
              return [draw(S[r],cx-19,cy,sz,`${r}${c}0`),draw(S[r],cx,cy,sz,`${r}${c}1`),draw(S[r],cx+19,cy,sz,`${r}${c}2`)];
            }))}
          </svg>
        );
      },
      options:[
        {label:"3 △", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          {[-18,0,18].map(dx=><RvTri key={dx} cx={28+dx} cy={28} s={13} fill="#374151" stroke="none" sw={0}/>)}
        </svg>},
        {label:"2 △", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          {[-13,13].map(dx=><RvTri key={dx} cx={28+dx} cy={28} s={15} fill="#374151" stroke="none" sw={0}/>)}
        </svg>},
        {label:"3 ○", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          {[-18,0,18].map(dx=><circle key={dx} cx={28+dx} cy={28} r={10} fill="#374151"/>)}
        </svg>},
        {label:"3 □", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          {[-18,0,18].map(dx=><rect key={dx} x={18+dx} y={18} width={20} height={20} fill="#374151" rx={2}/>)}
        </svg>},
      ]},

    // B3-Q5: Two rules — outer shape per column (○□△) × inner dot count per row (0,1,2) — 3×3
    // Missing: (row2, col2) = triangle with 2 inner dots
    { id:17, title:"Inner Dots", instruction:"What belongs in the missing cell?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[0,1,2].flatMap(r=>[0,1,2].flatMap(c=>{
            if(r===2&&c===2) return [<RvQMark key="q" cx={175} cy={175}/>];
            const cx=35+c*70, cy=35+r*70;
            const outer = c===0
              ? <circle key={`o${r}${c}`} cx={cx} cy={cy} r={26} fill="none" stroke="#374151" strokeWidth={2.5}/>
              : c===1
              ? <rect key={`o${r}${c}`} x={cx-24} y={cy-24} width={48} height={48} fill="none" stroke="#374151" strokeWidth={2.5} rx={3}/>
              : <RvTri key={`o${r}${c}`} cx={cx} cy={cy} s={27} fill="none" stroke="#374151" sw={2.5}/>;
            const dots = r===0 ? [] : r===1
              ? [<circle key={`d${r}${c}0`} cx={cx} cy={cy} r={6} fill="#374151"/>]
              : [<circle key={`d${r}${c}0`} cx={cx-9} cy={cy} r={5} fill="#374151"/>,
                 <circle key={`d${r}${c}1`} cx={cx+9} cy={cy} r={5} fill="#374151"/>];
            return [outer,...dots];
          }))}
        </svg>),
      options:[
        {label:"△ 2 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          <RvTri cx={28} cy={28} s={25} fill="none" stroke="#374151" sw={2.5}/>
          <circle cx={20} cy={30} r={5} fill="#374151"/><circle cx={36} cy={30} r={5} fill="#374151"/>
        </svg>},
        {label:"△ 1 dot", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          <RvTri cx={28} cy={28} s={25} fill="none" stroke="#374151" sw={2.5}/>
          <circle cx={28} cy={30} r={6} fill="#374151"/>
        </svg>},
        {label:"○ 2 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          <circle cx={28} cy={28} r={25} fill="none" stroke="#374151" strokeWidth={2.5}/>
          <circle cx={20} cy={28} r={5} fill="#374151"/><circle cx={36} cy={28} r={5} fill="#374151"/>
        </svg>},
        {label:"□ 2 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56">
          <rect x={2} y={2} width={52} height={52} fill="none" stroke="#374151" strokeWidth={2.5} rx={3}/>
          <circle cx={20} cy={28} r={5} fill="#374151"/><circle cx={36} cy={28} r={5} fill="#374151"/>
        </svg>},
      ]},

    // B3-Q6: Additive rule — cell (r,c) contains (r+c+1) dots — 3×3
    // (0,0)=1, (0,1)=2, (0,2)=3 / (1,0)=2, (1,1)=3, (1,2)=4 / (2,0)=3, (2,1)=4, (2,2)=? = 5
    { id:18, title:"Dot Rule", instruction:"How many dots belong in the empty cell?", ans:1,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[0,1,2].flatMap(r=>[0,1,2].map(c=>{
            const n=r+c+1;
            const cx=35+c*70, cy=35+r*70;
            if(r===2&&c===2) return <RvQMark key="q" cx={175} cy={175}/>;
            return <RvDots key={`${r}${c}`} cx={cx} cy={cy} n={n} r={n<=3?7:6}/>;
          }))}
        </svg>),
      options:[
        {label:"4 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={4} r={8}/></svg>},
        {label:"5 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={5} r={8}/></svg>},
        {label:"6 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={6} r={8}/></svg>},
        {label:"3 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={3} r={8}/></svg>},
      ]},
  ],

  4: [
    // B4-Q1: Multiplication rule — cell(r,c) = (r+1)×(c+1) dots
    { id:19, title:"Dot Matrix", instruction:"How many dots belong in the missing cell?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[[1,2,3],[2,4,6],[3,6,null]].flatMap((row,r)=>row.map((n,c)=>{
            const cx=35+c*70, cy=35+r*70;
            if(n===null) return <RvQMark key="q" cx={175} cy={175}/>;
            return <RvDots key={`${r}${c}`} cx={cx} cy={cy} n={n} r={5}/>;
          }))}
        </svg>),
      options:[
        {label:"9 dots",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={9}  r={4}/></svg>},
        {label:"7 dots",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={7}  r={4}/></svg>},
        {label:"8 dots",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={8}  r={4}/></svg>},
        {label:"12 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={12} r={3.5}/></svg>},
      ]},

    // B4-Q2: Polygon sides matrix — n sides = r+c+3; final cell (2,2)=7 sides
    { id:20, title:"Shape Sides", instruction:"Which shape has the correct number of sides?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[[3,4,5],[4,5,6],[5,6,null]].flatMap((row,r)=>row.map((n,c)=>{
            const cx=35+c*70, cy=35+r*70;
            if(n===null) return <RvQMark key="q" cx={175} cy={175}/>;
            return <RvPoly key={`${r}${c}`} cx={cx} cy={cy} n={n} r={24}/>;
          }))}
        </svg>),
      options:[
        {label:"7 sides", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={7} r={22}/></svg>},
        {label:"5 sides", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={5} r={22}/></svg>},
        {label:"6 sides", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={6} r={22}/></svg>},
        {label:"8 sides", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={8} r={22}/></svg>},
      ]},

    // B4-Q3: Two rules — sides = r+c+3 AND fill alternates by (r+c) parity
    // Even parity = filled, odd parity = empty
    // (2,2): sides=7, parity=4(even) → filled 7-gon
    { id:21, title:"Sides & Fill", instruction:"Which shape belongs in the empty cell?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {[0,1,2].flatMap(r=>[0,1,2].map(c=>{
            if(r===2&&c===2) return <RvQMark key="q" cx={175} cy={175}/>;
            const cx=35+c*70, cy=35+r*70, n=r+c+3, filled=(r+c)%2===0;
            return <RvPoly key={`${r}${c}`} cx={cx} cy={cy} n={n} r={24}
              fill={filled?"#374151":"none"} stroke={filled?"none":"#374151"} sw={filled?0:2.5}/>;
          }))}
        </svg>),
      options:[
        {label:"Filled 7-gon", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={7} r={23} fill="#374151" stroke="none" sw={0}/></svg>},
        {label:"Empty 7-gon",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={7} r={23} fill="none" stroke="#374151" sw={2.5}/></svg>},
        {label:"Filled 8-gon", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={8} r={23} fill="#374151" stroke="none" sw={0}/></svg>},
        {label:"Empty 6-gon",  render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvPoly cx={28} cy={28} n={6} r={23} fill="none" stroke="#374151" sw={2.5}/></svg>},
      ]},

    // B4-Q4: Three rules — direction = dirs[(r+c)%4], size per column, placed in 3×3
    // dirs: 0=right,1=down,2=left,3=up. sizes col0=large,col1=med,col2=small
    // (2,2): (r+c)%4 = 4%4 = 0 = right, size = small → small right arrow
    { id:22, title:"Direction & Size Matrix", instruction:"Which arrow completes the pattern?", ans:0,
      renderStimulus:()=>{
        const dirs=["right","down","left","up"], sizes=[20,14,8];
        return (
          <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
            <RvGrid rows={3} cols={3}/>
            {[0,1,2].flatMap(r=>[0,1,2].map(c=>{
              if(r===2&&c===2) return <RvQMark key="q" cx={175} cy={175}/>;
              return <RvArrow key={`${r}${c}`} cx={35+c*70} cy={35+r*70} dir={dirs[(r+c)%4]} size={sizes[c]}/>;
            }))}
          </svg>
        );
      },
      options:[
        {label:"Small →", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="right" size={8}/></svg>},
        {label:"Small ↓", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="down"  size={8}/></svg>},
        {label:"Med →",   render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="right" size={14}/></svg>},
        {label:"Small ←", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvArrow cx={28} cy={28} dir="left"  size={8}/></svg>},
      ]},
  ],
};


// ── CAT Advancement Rules ─────────────────────────────────────────────────────
// Each band: 6 items (4 for band 4). passThreshold = 4 correct to advance.
const CAT_RULES = {
  1: { passThreshold:4, label:"Foundation",  iqBase:70,  range:15, maLo:7,  maHi:9  },
  2: { passThreshold:4, label:"Standard",    iqBase:85,  range:15, maLo:9,  maHi:12 },
  3: { passThreshold:4, label:"Advanced",    iqBase:100, range:15, maLo:12, maHi:15 },
  4: { passThreshold:3, label:"Exceptional", iqBase:115, range:15, maLo:15, maHi:18 },
};

// IQ + Mental Age lookup based on highest band reached and within-band performance
const scoreCAT = (d1) => {
  const band = d1._band || 1;
  const b = { 1:d1._b1||0, 2:d1._b2||0, 3:d1._b3||0, 4:d1._b4||0 };
  const totalCorrect = b[1]+b[2]+b[3]+b[4];
  const totalQ = Object.keys(d1).filter(k=>!k.startsWith('_')).length;
  const rule = CAT_RULES[band];
  const bc   = b[band];
  const bandTotal = RAVENS_CAT[band].length;

  // IQ estimate: band base + proportional within-band score
  const iq = Math.round(rule.iqBase + (bc / bandTotal) * rule.range);

  // Mental Age: interpolated within band's MA range
  const ma = parseFloat((rule.maLo + (bc / bandTotal) * (rule.maHi - rule.maLo)).toFixed(1));

  // Descriptive label
  const label =
    iq < 80  ? "Below Average"  :
    iq < 90  ? "Low Average"    :
    iq < 110 ? "Average"        :
    iq < 120 ? "High Average"   :
    iq < 130 ? "Superior"       : "Exceptional";

  // Approximate percentile (normal distribution table)
  const pctRank =
    iq >= 130 ? 98 : iq >= 125 ? 95 : iq >= 120 ? 91 : iq >= 115 ? 84 :
    iq >= 110 ? 75 : iq >= 105 ? 63 : iq >= 100 ? 50 : iq >= 95  ? 37 :
    iq >= 90  ? 25 : iq >= 85  ? 16 : iq >= 80  ? 9  : 5;

  return { iq, ma, label, pctRank, band, bandScores:b, totalCorrect, totalQ };
};

const BFI10 = [
  { id:1,  text:"I am outgoing and sociable",                     dom:"E", rev:false },
  { id:2,  text:"I am sometimes rude or critical to others",      dom:"A", rev:true  },
  { id:3,  text:"I am reliable and can always be counted on",     dom:"C", rev:false },
  { id:4,  text:"I worry a lot",                                  dom:"N", rev:false },
  { id:5,  text:"I enjoy creative work and new ideas",            dom:"O", rev:false },
  { id:6,  text:"I am quiet and reserved",                        dom:"E", rev:true  },
  { id:7,  text:"I am generally trusting and cooperative",        dom:"A", rev:false },
  { id:8,  text:"I can be somewhat lazy or disorganised",         dom:"C", rev:true  },
  { id:9,  text:"I stay calm and emotionally stable",             dom:"N", rev:true  },
  { id:10, text:"I have few artistic or creative interests",      dom:"O", rev:true  },
];

const DUKE17 = [
  // Functional (Duke: 0=limited lot, 1=limited little, 2=not limited)
  { id:1,  q:"Do strenuous activities (fast walking, cycling, sports)", type:"func" },
  { id:2,  q:"Do moderate activities (sweeping, light housework)",      type:"func" },
  { id:3,  q:"Climb one flight of stairs",                              type:"func" },
  { id:4,  q:"Bend, lift, or stoop",                                    type:"func" },
  // Frequency past week (0=none, 1=little, 2=some, 3=most, 4=all)
  { id:5,  q:"Visit with friends or relatives",                         type:"freq", neg:false },
  { id:6,  q:"Done work, housework, or schoolwork",                     type:"freq", neg:false },
  { id:7,  q:"Been happy",                                              type:"freq", neg:false },
  { id:8,  q:"Had a lot of energy",                                     type:"freq", neg:false },
  { id:9,  q:"Been depressed or sad",                                   type:"freq", neg:true  },
  { id:10, q:"Been nervous or worried",                                 type:"freq", neg:true  },
  { id:11, q:"Felt worthwhile as a person",                             type:"freq", neg:false },
  { id:14, q:"Had trouble sleeping",                                    type:"freq", neg:true  },
  { id:15, q:"Had physical pain limiting activities",                   type:"freq", neg:true  },
  { id:16, q:"Got along well with other people",                        type:"freq", neg:false },
  // Health ratings (0=poor, 4=excellent)
  { id:12, q:"Overall physical health in the past week",                type:"health" },
  { id:13, q:"Mental or emotional health in the past week",             type:"health" },
  { id:17, q:"Compared to others your age, your health is…",           type:"compare" },
];

const PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or let yourself down",
  "Trouble concentrating on things such as reading or watching TV",
  "Moving or speaking so slowly others could notice — or the opposite, being fidgety",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const AUDITC = [
  { q:"How often do you have a drink containing alcohol?",
    opts:["Never","Monthly or less","2–4 times a month","2–3 times a week","4+ times a week"], sc:[0,1,2,3,4] },
  { q:"How many drinks on a typical drinking day?",
    opts:["1–2","3–4","5–6","7–9","10 or more"], sc:[0,1,2,3,4] },
  { q:"How often do you have 6+ drinks on one occasion?",
    opts:["Never","Less than monthly","Monthly","Weekly","Daily/almost daily"], sc:[0,1,2,3,4] },
];

const CSSRS = [
  "Have you wished you were dead or hoped you could go to sleep and not wake up?",
  "Have you had any actual thoughts of killing yourself?",
  "Have you been thinking about how you might do this?",
  "Have you had these thoughts and had some intention of acting on them?",
  "Have you started to work out or act on the details of how to kill yourself?",
];

const SDQCP = [
  { q:"I often have temper tantrums or hot tempers",      rev:false },
  { q:"I usually do as I am told",                        rev:true  },
  { q:"I fight a lot or bully others to get what I want", rev:false },
  { q:"I am often accused of lying or cheating",          rev:false },
  { q:"I take things that do not belong to me",           rev:false },
];


// ── VALID: Scoring Helpers + Norms ───────────────────────────────
// ─────────────── SCORING HELPERS ───────────────────────────────────────────

const scoreBFI = (resp) => {
  // BFI-10 standard scoring (Rammstedt & John, 2007)
  // Each domain: (forward_item + (6 - reverse_item)) / 2  → range 1–5
  // Forward items: E=1, A=7, C=3, N=4, O=5
  // Reverse items: E=6, A=2, C=8, N=9, O=10
  const doms = { O:[5,10], C:[3,8], E:[1,6], A:[7,2], N:[4,9] };
  const result = {};
  Object.entries(doms).forEach(([d,[f,r]]) => {
    const fv = resp[f] !== undefined ? resp[f] : 3;
    const rv = resp[r] !== undefined ? resp[r] : 3;
    result[d] = ((fv + (6 - rv)) / 2).toFixed(1);
  });
  return result;
};

const scoreDuke = (resp) => {
  const get = (id) => resp[id] !== undefined ? resp[id] : 2;
  // Physical: items 1,2,3,4 (func 0-2 each, max 8)
  const phys    = Math.round((get(1)+get(2)+get(3)+get(4)) / 8 * 100);
  // Mental: items 7,8,11(pos) + 9,10(neg reversed) (freq 0-4 each, max 20)
  const mental  = Math.round((get(7)+get(8)+(4-get(9))+(4-get(10))+get(11)) / 20 * 100);
  // Social: items 5,6,16 (freq 0-4 each, max 12)
  const social  = Math.round((get(5)+get(6)+get(16)) / 12 * 100);
  // General: mean of three functional scales
  const general = Math.round((phys+mental+social) / 3);
  // Self-Esteem: items 7+11 (happy+worthwhile, both 0-4, max 8) — Parkerson 1990
  const selfEsteem = Math.round((get(7)+get(11)) / 8 * 100);
  // Anxiety: items 10+14 (nervous+sleepless, both 0-4, max 8) — higher=worse
  const anxiety    = Math.round((get(10)+get(14)) / 8 * 100);
  // Depression: item9 + (4-item11) (sad + not-worthwhile, max 8) — higher=worse
  const depression = Math.round((get(9)+(4-get(11))) / 8 * 100);
  // Perceived health: items 12,13 (health 0-4 each, max 8)
  const perceived  = Math.round((get(12)+get(13)) / 8 * 100);
  // Pain: item 15 (neg freq, higher=more pain)
  const pain       = Math.round(get(15) / 4 * 100);
  // Disability: item 1 reversed (0=a lot limited → disability=100)
  const disability = Math.round((2-get(1)) / 2 * 100);
  return { phys, mental, social, general, selfEsteem, anxiety, depression, perceived, pain, disability };
};

const scorePHQ = (resp) => Object.values(resp).reduce((a,b)=>a+b,0);

const classPHQ = (score) => {
  if (score<=4)  return { label:"Minimal / None", color:"#10B981", risk:"low" };
  if (score<=9)  return { label:"Mild",           color:"#84CC16", risk:"low" };
  if (score<=14) return { label:"Moderate",       color:"#F59E0B", risk:"moderate" };
  if (score<=19) return { label:"Moderately Severe", color:"#F97316", risk:"high" };
  return              { label:"Severe",           color:"#EF4444", risk:"high" };
};

const scoreCSS = (resp) => {
  const pos = Object.values(resp).filter(Boolean).length;
  if (pos===0) return { score:0, level:0, label:"No ideation", color:"#10B981" };
  if (pos<=1)  return { score:1, level:1, label:"Passive ideation", color:"#84CC16" };
  if (pos<=2)  return { score:2, level:2, label:"Active ideation (no plan)", color:"#F59E0B" };
  if (pos<=3)  return { score:3, level:3, label:"Ideation with plan", color:"#F97316" };
  return       { score:4, level:4, label:"Intent with rehearsal", color:"#EF4444" };
};

const scoreAUDIT = (resp) => {
  const s = Object.entries(resp).reduce((a,[k,v]) => a + AUDITC[parseInt(k)].sc[v], 0);
  if (s<=3)  return { score:s, level:0, label:"Low risk", color:"#10B981" };
  if (s<=7)  return { score:s, level:1, label:"Hazardous use", color:"#F59E0B" };
  return     { score:s, level:2, label:"Harmful / Dependent", color:"#EF4444" };
};

// ── Age-adjusted normative ranges ────────────────────────────────────────────
// Source: Parkerson 1990 (Duke), Rammstedt & John 2007 (BFI-10),
//         NIMHANS/ICMR reference data for Indian adult population.
const getAgeNorms = (age) => {
  const a = parseInt(age) || 30;
  const g = a < 36 ? "young" : a < 56 ? "mid" : "older";
  return {
    // Duke functional scales (higher=better, 0-100)
    phys:       { young:[75,100], mid:[65,100], older:[50,100] }[g],
    mental:     { young:[65,100], mid:[60,100], older:[55,100] }[g],
    social:     { young:[60,100], mid:[55,100], older:[50,100] }[g],
    general:    { young:[67,100], mid:[60,100], older:[52,100] }[g],
    selfEsteem: { young:[70,100], mid:[65,100], older:[60,100] }[g],
    perceived:  { young:[60,100], mid:[55,100], older:[50,100] }[g],
    // Duke dysfunction scales (lower=better, 0-100)
    anxiety:    { young:[0,25],   mid:[0,30],   older:[0,38]   }[g],
    depression: { young:[0,20],   mid:[0,25],   older:[0,32]   }[g],
    pain:       { young:[0,20],   mid:[0,30],   older:[0,40]   }[g],
    disability: { young:[0,15],   mid:[0,25],   older:[0,40]   }[g],
    // BFI-10 T-score normal ranges (M=50, SD=10)
    bfi: {
      O: { young:[38,65], mid:[36,63], older:[34,62] }[g],
      C: { young:[38,65], mid:[42,68], older:[45,70] }[g],
      E: { young:[38,65], mid:[36,63], older:[34,62] }[g],
      A: { young:[38,63], mid:[42,66], older:[45,68] }[g],
      N: { young:[36,64], mid:[33,62], older:[30,58] }[g],
    },
    // Ravens IQ age-adjustment (Average band centre)
    iqAvgLo: { young:90, mid:88, older:82 }[g],
    iqAvgHi: { young:110, mid:108, older:100 }[g],
    group: g,
    label: { young:"Young Adult (18–35)", mid:"Middle Adult (36–55)", older:"Older Adult (56+)" }[g],
  };
};

const generateLocalUID = (mobile, dob, gender) => {
  const last6 = (mobile||"").replace(/\D/g,"").slice(-6).padStart(6,"0");
  const now = new Date();
  const dd = String(now.getDate()).padStart(2,"0");
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const yy = String(now.getFullYear()).slice(-2);
  const g = (gender||"X")[0].toUpperCase();
  return `SC-${last6}-${dd}${mm}${yy}-${g}`;
};


// ── VALID: UI Atoms ───────────────────────────────────────────────
// ─────────────── TINY UI ATOMS ─────────────────────────────────────────────

const cx = (...args) => args.filter(Boolean).join(" ");

const Pill = ({ children, color="#3B82F6" }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
    style={{ background: color + "18", color, border: `1px solid ${color}33` }}>
    {children}
  </span>
);

const ScoreBar = ({ value, max=100, color="#3B82F6", label, sub }) => {
  const pct = Math.min(100, Math.round((value/max)*100));
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-black" style={{ color }}>{pct}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}/>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const SectionHead = ({ icon, title, color="#1A2E4A", badge }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
      style={{ background: color + "18" }}>{icon}</span>
    <div className="flex-1">
      <p className="font-black text-sm text-gray-800">{title}</p>
    </div>
    {badge && <Pill color={badge.color}>{badge.text}</Pill>}
  </div>
);

// ─────────────── SCREENS ───────────────────────────────────────────────────

// ════ WELCOME ════════════════════════════════════════════════════════════════

// ── VALID: Eligibility Screener ──────────────────────────────────
// ════ ELIGIBILITY (3-step) ════════════════════════════════════════════════
const Eligibility = ({ onResult }) => {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState([]);

  const pass = (ok) => {
    const nr = [...results, ok];
    setResults(nr);
    if (step < 2) setTimeout(() => setStep(s => s + 1), 350);
    else {
      const allPass = nr.every(Boolean);
      setTimeout(() => onResult(allPass ? "self" : "assisted"), 500);
    }
  };

  const steps = [
    {
      inst: "Tap the CIRCLE",
      items: [
        { id:"circle",   label:"Circle",   render: <svg width={56} height={56} viewBox="0 0 56 56"><circle cx={28} cy={28} r={22} fill="#6B7280"/></svg> },
        { id:"triangle", label:"Triangle", render: <svg width={56} height={56} viewBox="0 0 56 56"><polygon points="28,6 50,50 6,50" fill="#6B7280"/></svg> },
        { id:"square",   label:"Square",   render: <svg width={56} height={56} viewBox="0 0 56 56"><rect x={6} y={6} width={44} height={44} fill="#6B7280"/></svg> },
      ],
      ans: "circle",
    },
    {
      inst: "Tap the HAPPY face",
      items: [
        { id:"happy",   label:"Happy",   render: <HappyFace/> },
        { id:"neutral", label:"Neutral", render: <NeutralFace/> },
        { id:"sad",     label:"Sad",     render: <SadFace/> },
      ],
      ans: "happy",
    },
    {
      inst: "Tap RED first, then the SQUARE",
      twoStep: true,
    },
  ];

  if (step < 2) {
    const s = steps[step];
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3">
          <p className="text-xs text-center text-gray-400 mb-2">Orientation Check — Step {step+1} of 3</p>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="flex-1 h-2 rounded-full"
                style={{ background: i < step ? "#10B981" : i === step ? "#8B5CF6" : "#E5E7EB" }}/>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center mb-8">
              <p className="text-xl font-black text-purple-800">{s.inst}</p>
            </div>
            <div className="flex justify-around">
              {s.items.map(item => (
                <button key={item.id} onClick={() => pass(item.id === s.ans)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 bg-white active:scale-95 transition-all">
                  {item.render}
                  <span className="text-xs text-gray-500">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Two-step task
  return <TwoStepTask onDone={(ok) => pass(ok)} stepIndex={step} totalSteps={3}/>;
};

// Inline face SVGs
const HappyFace = () => (
  <svg width={56} height={56} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={24} fill="#FDE047"/>
    <ellipse cx={20} cy={24} rx={3} ry={3} fill="#1F2937"/>
    <ellipse cx={36} cy={24} rx={3} ry={3} fill="#1F2937"/>
    <path d="M18 34 Q28 44 38 34" stroke="#1F2937" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
  </svg>
);
const NeutralFace = () => (
  <svg width={56} height={56} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={24} fill="#D1D5DB"/>
    <ellipse cx={20} cy={24} rx={3} ry={3} fill="#1F2937"/>
    <ellipse cx={36} cy={24} rx={3} ry={3} fill="#1F2937"/>
    <line x1={19} y1={36} x2={37} y2={36} stroke="#1F2937" strokeWidth={2.5} strokeLinecap="round"/>
  </svg>
);
const SadFace = () => (
  <svg width={56} height={56} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={24} fill="#BFDBFE"/>
    <ellipse cx={20} cy={24} rx={3} ry={3} fill="#1F2937"/>
    <ellipse cx={36} cy={24} rx={3} ry={3} fill="#1F2937"/>
    <path d="M18 40 Q28 30 38 40" stroke="#1F2937" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
  </svg>
);

const TwoStepTask = ({ onDone, stepIndex, totalSteps }) => {
  const [seq, setSeq] = useState([]);
  const items = [
    { id:"rc", isRed:true,  isSquare:false, label:"Red Circle",     shape:"circle", fill:"#EF4444" },
    { id:"bs", isRed:false, isSquare:true,  label:"Blue Square",    shape:"square",  fill:"#3B82F6" },
    { id:"gt", isRed:false, isSquare:false, label:"Green Triangle", shape:"triangle",fill:"#22C55E" },
    { id:"ys", isRed:false, isSquare:true,  label:"Yellow Square",  shape:"square",  fill:"#EAB308" },
  ];
  const ShapeEl = ({ shape, fill }) => (
    <svg width={48} height={48} viewBox="0 0 48 48">
      {shape==="circle"   && <circle cx={24} cy={24} r={20} fill={fill}/>}
      {shape==="square"   && <rect x={4} y={4} width={40} height={40} fill={fill}/>}
      {shape==="triangle" && <polygon points="24,4 44,44 4,44" fill={fill}/>}
    </svg>
  );
  const tap = (item) => {
    if (seq.find(s=>s.id===item.id)) return;
    const ns = [...seq, item];
    setSeq(ns);
    if (ns.length===2) {
      const ok = ns[0].isRed && ns[1].isSquare;
      setTimeout(() => onDone(ok), 400);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3">
        <p className="text-xs text-center text-gray-400 mb-2">Orientation Check — Step {stepIndex+1} of {totalSteps}</p>
        <div className="flex gap-1.5">
          {Array.from({length:totalSteps}).map((_,i) => (
            <div key={i} className="flex-1 h-2 rounded-full"
              style={{ background: i < stepIndex ? "#10B981" : i===stepIndex ? "#8B5CF6" : "#E5E7EB" }}/>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center mb-6">
            <p className="text-xl font-black text-purple-800">Tap RED first, then the SQUARE</p>
            <p className="text-sm text-purple-500 mt-1">
              {seq.length===0 ? "Touch any red item →" : seq.length===1 ? "Now touch any square →" : ""}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => {
              const idx = seq.findIndex(s=>s.id===item.id);
              return (
                <button key={item.id} onClick={()=>tap(item)} disabled={idx!==-1}
                  className={cx("flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    idx!==-1 ? "border-green-400 bg-green-50" : "border-gray-200 bg-white active:scale-95")}>
                  <ShapeEl shape={item.shape} fill={item.fill}/>
                  <span className="text-xs text-gray-500">{item.label}</span>
                  {idx!==-1 && <span className="text-xs font-bold text-green-600">Step {idx+1} ✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


// ── VALID: Domain Meta + Assessment Container ────────────────────
// ════ DOMAIN NAVIGATOR ═══════════════════════════════════════════════════════
const DOMAIN_META = [
  { id:1, code:"D1", name:"Cognition",   color:"#3B82F6", bg:"#EFF6FF", icon:"🧩", count:22 },
  { id:2, code:"D2", name:"Personality", color:"#8B5CF6", bg:"#F5F3FF", icon:"🪞", count:10 },
  { id:3, code:"D3", name:"Health",      color:"#10B981", bg:"#F0FDF4", icon:"💚", count:17 },
  { id:4, code:"D4", name:"Risk",        color:"#EF4444", bg:"#FEF2F2", icon:"🛡", count:13 },
];

// ════ ASSESSMENT CONTAINER ════════════════════════════════════════════════════
const Assessment = ({ mode, onComplete }) => {
  const [domain, setDomain] = useState(1);
  const [resp, setResp] = useState({ d1:{}, d2:{}, d3:{}, d4:{} });
  const scrollRef = useRef(null);

  const set = (d, k, v) => setResp(r => ({ ...r, [`d${d}`]: { ...r[`d${d}`], [k]: v } }));
  const answered = (d) => d===1
    ? Object.keys(resp.d1).filter(k=>!k.startsWith('_')).length
    : Object.keys(resp[`d${d}`]).length;
  const complete = (d) => d===1
    ? resp.d1._done === 1
    : Object.keys(resp[`d${d}`]).length >= DOMAIN_META[d-1].count;
  const pct = () => {
    const total = DOMAIN_META.reduce((s,m)=>s+m.count,0);
    const done  = DOMAIN_META.reduce((s,m)=>s+answered(m.id),0);
    return Math.round(done/total*100);
  };
  const allDone = DOMAIN_META.every(m => complete(m.id));
  const cd = DOMAIN_META[Math.min(domain,DOMAIN_META.length)-1];

  const nextDomain = () => {
    if (domain < DOMAIN_META.length) { setDomain(d=>d+1); scrollRef.current?.scrollTo(0,0); }
    else onComplete(resp);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-purple-600">CIBS-VALID</span>
          <span className="text-xs text-gray-400">{pct()}% complete</span>
        </div>
        {/* Domain tabs */}
        <div className="flex gap-1">
          {DOMAIN_META.map(m => (
            <button key={m.id} onClick={()=>{ setDomain(m.id); scrollRef.current?.scrollTo(0,0); }}
              className="flex-1 h-2 rounded-full transition-all"
              style={{ background: complete(m.id)?"#10B981": m.id===domain? m.color:"#E5E7EB" }}/>
          ))}
        </div>
        <div className="flex mt-1">
          {DOMAIN_META.map(m => (
            <button key={m.id} onClick={()=>{ setDomain(m.id); scrollRef.current?.scrollTo(0,0); }}
              className="flex-1 text-center text-xs py-0.5 font-bold transition-all"
              style={{ color: complete(m.id)?"#10B981": m.id===domain? m.color:"#CBD5E1" }}>
              {complete(m.id) ? "✓" : m.code}
            </button>
          ))}
        </div>
      </div>

      {/* Domain pill */}
      <div className="px-4 pt-3 pb-1 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: cd.bg, border:`1px solid ${cd.color}33` }}>
          <span>{cd.icon}</span>
          <div>
            <p className="text-xs font-black" style={{ color:cd.color }}>{cd.code} · {cd.name}</p>
            <p className="text-xs text-gray-400">
            {domain===1
              ? (resp.d1._done ? "Cognitive test complete ✓" : "Adaptive assessment in progress")
              : `${answered(domain)}/${cd.count} answered`}
          </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 max-w-sm mx-auto w-full">
        {domain===1 && <DomainCognition set={(k,v)=>set(1,k,v)} color={cd.color} bg={cd.bg}/>}
        {domain===2 && <DomainPersonality resp={resp.d2} set={(k,v)=>set(2,k,v)} color={cd.color} bg={cd.bg}/>}
        {domain===3 && <DomainHealth resp={resp.d3} set={(k,v)=>set(3,k,v)} color={cd.color} bg={cd.bg}/>}
        {domain===4 && <DomainRisk resp={resp.d4} set={(k,v)=>set(4,k,v)} color={cd.color} bg={cd.bg} mode={mode}/>}

        <div className="pt-4 pb-8 space-y-3">
          {!complete(domain) && domain!==1 && (
            <p className="text-center text-xs text-gray-400">
              {cd.count - answered(domain)} more question{cd.count - answered(domain) !== 1 ? "s" : ""} remaining in this domain
            </p>
          )}
          {complete(domain) && (
            <button onClick={nextDomain}
              className="w-full py-4 rounded-2xl font-black text-white text-sm"
              style={{ background: `linear-gradient(135deg,${cd.color},${cd.color}cc)` }}>
              {domain < DOMAIN_META.length ? `Continue → ${DOMAIN_META[domain].name}` : "Complete Assessment ✅"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── VALID: Domain Components (Cognition, Personality, Health, Risk)
// ════ DOMAIN 1 — COGNITION (Adaptive CAT Engine) ══════════════════════════════
const BAND_LABELS = {
  1:"Foundation Level", 2:"Standard Level", 3:"Advanced Level", 4:"Exceptional Level"
};
const BAND_TRANSITIONS = {
  1:"Great start! The patterns are about to get more interesting.",
  2:"Excellent work! You're ready for more complex reasoning challenges.",
  3:"Outstanding! You've reached our most advanced questions.",
};
const BAND_COLORS = { 1:"#3B82F6", 2:"#8B5CF6", 3:"#F59E0B", 4:"#EF4444" };
const BAND_ICONS  = { 1:"🔵", 2:"🟣", 3:"🟡", 4:"🔴" };

const DomainCognition = ({ set, color, bg }) => {
  const [phase, setPhase]     = useState('intro');      // intro | testing | transition | done
  const [band, setBand]       = useState(1);
  const [qIdx, setQIdx]       = useState(0);
  const [selected, setSelected] = useState(null);       // index of chosen option, for highlight
  const [bandCorrect, setBandCorrect] = useState({1:0,2:0,3:0,4:0});
  const [transMsg, setTransMsg] = useState('');
  const [totalQ, setTotalQ]   = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [finalBand, setFinalBand] = useState(null);

  const items   = RAVENS_CAT[band] || [];
  const item    = items[qIdx];
  const bColor  = BAND_COLORS[band];
  const qNumber = Object.values(RAVENS_CAT).slice(0,band-1).flat().length + qIdx + 1;

  const finish = useCallback((fBand, bCorrect, tQ, tC) => {
    // Store everything into parent resp.d1
    set('_done', 1);
    set('_band', fBand);
    set('_b1', bCorrect[1]);
    set('_b2', bCorrect[2]);
    set('_b3', bCorrect[3]);
    set('_b4', bCorrect[4]);
    set('_correct', tC);
    set('_total', tQ);
    setFinalBand(fBand);
    setPhase('done');
  }, [set]);

  const handleAnswer = useCallback((optIdx) => {
    if (selected !== null || phase !== 'testing') return;
    setSelected(optIdx);

    const isCorrect = optIdx === item.ans;
    set(item.id, optIdx); // store in parent

    const newBandCorrect = { ...bandCorrect, [band]: bandCorrect[band] + (isCorrect?1:0) };
    const newTotalQ      = totalQ + 1;
    const newTotalC      = totalCorrect + (isCorrect?1:0);

    setBandCorrect(newBandCorrect);
    setTotalQ(newTotalQ);
    setTotalCorrect(newTotalC);

    setTimeout(() => {
      const nextQIdx = qIdx + 1;

      if (nextQIdx < items.length) {
        // More questions remain in this band — advance
        setQIdx(nextQIdx);
        setSelected(null);
      } else {
        // Band complete — check pass/fail
        const bc = newBandCorrect[band];
        const passed = bc >= CAT_RULES[band].passThreshold;

        if (passed && band < 4) {
          // Advance to next band — show transition screen
          setTransMsg(BAND_TRANSITIONS[band]);
          setPhase('transition');
          setTimeout(() => {
            setBand(b => b+1);
            setQIdx(0);
            setSelected(null);
            setPhase('testing');
          }, 2200);
        } else {
          // Test complete
          finish(band, newBandCorrect, newTotalQ, newTotalC);
        }
      }
    }, 650);
  }, [selected, phase, item, band, qIdx, items, bandCorrect, totalQ, totalCorrect, finish, set]);

  // ── INTRO SCREEN ───────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background:bg, border:`1.5px solid ${color}44` }}>
        <p className="text-sm font-black mb-1" style={{color}}>🧩 Cognitive Pattern Completion</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          You will see a series of visual patterns — shapes, dots, arrows, and grids.
          Each pattern has an empty space. <strong>Tap the picture that best completes the pattern.</strong>
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        {[
          ["🕐","Take your time","There is no time limit. Think carefully before tapping."],
          ["🔍","Look at the whole pattern","Consider rows, columns, and any rules that repeat."],
          ["✅","Tap to confirm","Once you tap an answer the next pattern appears automatically."],
        ].map(([icon,head,sub])=>(
          <div key={head} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{icon}</span>
            <div><p className="text-sm font-bold text-gray-800">{head}</p>
              <p className="text-xs text-gray-500">{sub}</p></div>
          </div>
        ))}
      </div>
      <button onClick={()=>setPhase('testing')}
        className="w-full py-4 rounded-2xl font-black text-white text-base"
        style={{background:`linear-gradient(135deg,${color},${color}cc)`}}>
        Begin Pattern Test →
      </button>
    </div>
  );

  // ── BAND TRANSITION SCREEN ─────────────────────────────────────────────────
  if (phase === 'transition') return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{background:BAND_COLORS[band+1]+"18",border:`3px solid ${BAND_COLORS[band+1]}44`}}>
        ✨
      </div>
      <p className="text-xl font-black text-gray-800 text-center">Well done!</p>
      <p className="text-sm text-gray-600 text-center leading-relaxed max-w-xs">{transMsg}</p>
      <div className="flex gap-2 mt-2">
        {[1,2,3,4].map(b=>(
          <div key={b} className="w-3 h-3 rounded-full transition-all"
            style={{background: b<=band ? BAND_COLORS[b] : "#E5E7EB"}}/>
        ))}
      </div>
      <p className="text-xs text-gray-400">Next challenge loading…</p>
    </div>
  );

  // ── DONE SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const result = scoreCAT({ _band:finalBand,
      _b1:bandCorrect[1],_b2:bandCorrect[2],_b3:bandCorrect[3],_b4:bandCorrect[4] });
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-5 text-center"
          style={{background:`linear-gradient(135deg,${color}12,${color}06)`,border:`2px solid ${color}33`}}>
          <p className="text-3xl mb-1">🎯</p>
          <p className="text-lg font-black text-gray-800 mb-0.5">Pattern Test Complete</p>
          <p className="text-sm text-gray-500">{totalQ} question{totalQ!==1?'s':''} answered across {finalBand} level{finalBand!==1?'s':''}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {label:"Estimated CQ", val:`~${result.iq}`, color:"#3B82F6"},
            {label:"Classification", val:result.label, color:BAND_COLORS[finalBand]},
          ].map(item=>(
            <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-3 text-center">
              <p className="text-base font-black" style={{color:item.color}}>{item.val}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Band-by-Band Progress</p>
          {[1,2,3,4].map(b=>{
            const reached = b <= finalBand;
            const bc = bandCorrect[b];
            const bt = RAVENS_CAT[b].length;
            return (
              <div key={b} className="flex items-center gap-3 mb-2">
                <span className="text-base w-6">{reached?BAND_ICONS[b]:'⬜'}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">{BAND_LABELS[b]}</p>
                  <p className="text-xs text-gray-400">IQ {CAT_RULES[b].iqBase}–{CAT_RULES[b].iqBase+CAT_RULES[b].range}</p>
                </div>
                <span className="text-sm font-black" style={{color:reached?BAND_COLORS[b]:"#D1D5DB"}}>
                  {reached ? `${bc}/${bt}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl p-3 text-xs text-center text-gray-400"
          style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
          Tap <strong>"Continue → Personality"</strong> below to proceed
        </div>
      </div>
    );
  }

  // ── ACTIVE TEST SCREEN ─────────────────────────────────────────────────────
  const bandTotal = items.length;
  const bandPct   = Math.round((qIdx / bandTotal) * 100);
  const val       = selected;

  return (
    <div className="space-y-4">
      {/* Band indicator + question counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{BAND_ICONS[band]}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{background:bColor+"15",color:bColor}}>{BAND_LABELS[band]}</span>
        </div>
        <span className="text-xs font-bold text-gray-400">Question {qNumber}</span>
      </div>

      {/* Active question card */}
      <div className="bg-white rounded-2xl border-2 p-4 shadow-sm"
        style={{borderColor:bColor+"44"}}>
        {/* Item header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{background:bColor}}>{qNumber}</span>
          <div>
            <p className="text-sm font-bold text-gray-800">{item.title}</p>
            <p className="text-xs text-gray-400">{item.instruction}</p>
          </div>
        </div>

        {/* Stimulus */}
        <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 mb-4 flex items-center justify-center py-3">
          {item.renderStimulus()}
        </div>

        {/* 2×2 option grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {item.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)}
              disabled={val !== null}
              className={cx(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all active:scale-95",
                val === i
                  ? "shadow-md scale-105"
                  : val !== null
                  ? "opacity-40 border-gray-200 bg-white"
                  : "border-gray-200 bg-white hover:border-blue-200"
              )}
              style={val===i ? {borderColor:bColor, background:bColor+"15"} : {}}>
              <div className="flex items-center justify-center h-14">
                {opt.render(52)}
              </div>
              <span className="text-xs font-semibold"
                style={{color: val===i ? bColor : "#9CA3AF"}}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Band progress bar */}
      <div className="px-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">Progress in this level</span>
          <span className="text-xs font-bold" style={{color:bColor}}>{qIdx+1}/{bandTotal}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{width:`${((qIdx+1)/bandTotal)*100}%`,background:bColor}}/>
        </div>
      </div>
    </div>
  );
};

// ════ DOMAIN 2 — PERSONALITY (BFI-10) ═══════════════════════════════════════
const DomainPersonality = ({ resp, set, color, bg }) => (
  <div className="space-y-3">
    <div className="rounded-xl p-3 text-xs" style={{ background:bg, border:`1px solid ${color}33` }}>
      <strong style={{color}}>Big Five Personality — BFI-10</strong><br/>
      <span className="text-gray-600">
        Rate how well each statement describes you. <br/>
        1 = Strongly Disagree &nbsp;·&nbsp; 5 = Strongly Agree
      </span>
    </div>
    {BFI10.map(item => {
      const val = resp[item.id];
      const domLabel = { O:"Openness", C:"Conscientiousness", E:"Extraversion", A:"Agreeableness", N:"Neuroticism" }[item.dom];
      return (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background:color+"18", color }}>{item.dom}</span>
            <span className="text-xs text-gray-400">{domLabel}</span>
            {item.rev && <span className="text-xs text-orange-400 ml-auto">reversed</span>}
          </div>
          <p className="text-sm text-gray-700 mb-3">{item.id}. {item.text}</p>
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => set(item.id, v)}
                className={cx("flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-all",
                  val===v ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-300")}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs text-gray-300">Disagree</span>
            <span className="text-xs text-gray-300">Agree</span>
          </div>
        </div>
      );
    })}
  </div>
);

// ════ DOMAIN 3 — HEALTH (Duke-17) ════════════════════════════════════════════
const DomainHealth = ({ resp, set, color, bg }) => {

  // ── Option configs per question type ─────────────────────────────────────
  const FUNC_OPTS = [
    { label:"No — I could not do it at all",        icon:"🔴", sub:"Too difficult or impossible" },
    { label:"Yes — but with quite a bit of effort", icon:"🟡", sub:"Managed, but not easily" },
    { label:"Yes — easily, no problem at all",      icon:"🟢", sub:"No difficulty" },
  ];

  const FREQ_OPTS_POS = [  // positive items (higher = better)
    { label:"Never",                     icon:"😞", sub:"0 days" },
    { label:"Rarely",                    icon:"😐", sub:"1–2 days" },
    { label:"Sometimes",                 icon:"🙂", sub:"3–4 days" },
    { label:"Often",                     icon:"😊", sub:"5–6 days" },
    { label:"Always",                    icon:"😄", sub:"Every day" },
  ];

  const FREQ_OPTS_NEG = [  // negative items (higher = worse — shown in natural language, reversed internally)
    { label:"Never",                     icon:"😄", sub:"0 days" },
    { label:"Rarely",                    icon:"😊", sub:"1–2 days" },
    { label:"Sometimes",                 icon:"🙂", sub:"3–4 days" },
    { label:"Often",                     icon:"😐", sub:"5–6 days" },
    { label:"Always",                    icon:"😞", sub:"Every day" },
  ];

  const HEALTH_OPTS = [
    { label:"Very Poor",   icon:"😟", color:"#EF4444" },
    { label:"Poor",        icon:"😕", color:"#F97316" },
    { label:"Fair",        icon:"😐", color:"#EAB308" },
    { label:"Good",        icon:"🙂", color:"#84CC16" },
    { label:"Excellent",   icon:"😄", color:"#10B981" },
  ];

  const CMP_OPTS = [
    { label:"Much worse",      icon:"⬇⬇", color:"#EF4444" },
    { label:"Somewhat worse",  icon:"⬇",  color:"#F97316" },
    { label:"About the same",  icon:"↔",  color:"#6B7280" },
    { label:"Somewhat better", icon:"⬆",  color:"#84CC16" },
    { label:"Much better",     icon:"⬆⬆", color:"#10B981" },
  ];

  // ── Section divider component ─────────────────────────────────────────────
  const SectionBanner = ({ icon, title, instruction, example }) => (
    <div className="rounded-2xl p-4 mt-2" style={{ background: color+"10", border:`2px solid ${color}33` }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-black" style={{ color }}>{title}</p>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-1">{instruction}</p>
      {example && (
        <div className="rounded-xl px-3 py-2 mt-2 text-xs"
          style={{ background:"white", border:`1px solid ${color}33` }}>
          <span className="font-bold" style={{ color }}>Example: </span>
          <span className="text-gray-600">{example}</span>
        </div>
      )}
    </div>
  );

  // ── Card per question ─────────────────────────────────────────────────────
  const QuestionCard = ({ item, opts, renderOpts }) => {
    const val = resp[item.id];
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-3 leading-snug">
          {item.q}
        </p>
        {renderOpts(val)}
      </div>
    );
  };

  // ── Render helpers per type ───────────────────────────────────────────────
  const renderFunc = (item) => {
    const val = resp[item.id];
    return (
      <div className="space-y-2">
        {FUNC_OPTS.map((opt, i) => (
          <button key={i} onClick={() => set(item.id, i)}
            className={cx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all active:scale-98 text-left",
              val===i
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-green-300"
            )}>
            <span className="text-xl flex-shrink-0">{opt.icon}</span>
            <div>
              <p className={cx("text-sm font-bold", val===i?"text-green-800":"text-gray-700")}>{opt.label}</p>
              <p className="text-xs text-gray-400">{opt.sub}</p>
            </div>
            {val===i && <span className="ml-auto text-green-500 text-base font-black">✓</span>}
          </button>
        ))}
      </div>
    );
  };

  const renderFreq = (item) => {
    const val = resp[item.id];
    const opts = item.neg ? FREQ_OPTS_NEG : FREQ_OPTS_POS;
    return (
      <div className="grid grid-cols-5 gap-1.5">
        {opts.map((opt, i) => (
          <button key={i} onClick={() => set(item.id, i)}
            className={cx(
              "flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 transition-all active:scale-95",
              val===i ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
            )}>
            <span className="text-xl">{opt.icon}</span>
            <span className={cx("text-xs font-bold text-center leading-tight",
              val===i ? "text-green-700" : "text-gray-500")}>{opt.label}</span>
            <span className="text-xs text-gray-300 text-center leading-tight">{opt.sub}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderHealth = (item) => {
    const val = resp[item.id];
    return (
      <div className="grid grid-cols-5 gap-1.5">
        {HEALTH_OPTS.map((opt, i) => (
          <button key={i} onClick={() => set(item.id, i)}
            className={cx(
              "flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 transition-all active:scale-95",
              val===i ? "border-2 shadow-sm" : "border-gray-200 bg-white"
            )}
            style={val===i ? { borderColor:opt.color, background:opt.color+"15" } : {}}>
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-xs font-bold text-center leading-tight"
              style={{ color: val===i ? opt.color : "#9CA3AF" }}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderCompare = (item) => {
    const val = resp[item.id];
    return (
      <div className="grid grid-cols-5 gap-1.5">
        {CMP_OPTS.map((opt, i) => (
          <button key={i} onClick={() => set(item.id, i)}
            className={cx(
              "flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 transition-all active:scale-95",
              val===i ? "border-2 shadow-sm" : "border-gray-200 bg-white"
            )}
            style={val===i ? { borderColor:opt.color, background:opt.color+"15" } : {}}>
            <span className="text-base font-black" style={{ color: val===i ? opt.color : "#D1D5DB" }}>{opt.icon}</span>
            <span className="text-xs font-bold text-center leading-tight"
              style={{ color: val===i ? opt.color : "#9CA3AF" }}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    );
  };

  // ── Group items by type ───────────────────────────────────────────────────
  const funcItems  = DUKE17.filter(i => i.type==="func");
  const freqItems  = DUKE17.filter(i => i.type==="freq");
  const healthItems= DUKE17.filter(i => i.type==="health");
  const cmpItems   = DUKE17.filter(i => i.type==="compare");

  return (
    <div className="space-y-3">

      {/* ── Top intro ── */}
      <div className="rounded-2xl p-4" style={{ background:bg, border:`1.5px solid ${color}44` }}>
        <p className="text-sm font-black mb-1" style={{ color }}>💚 Duke Health Profile — DUKE-17</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          This section asks about your <strong>health and daily activities over the past 7 days</strong>.
          Answer based on how things have actually been — not how you would like them to be.
          There are <strong>17 questions</strong> in 4 short groups.
        </p>
      </div>

      {/* ══ GROUP 1: Physical Ability ══════════════════════════════════════ */}
      <SectionBanner
        icon="🏃"
        title="Group 1 of 4 — Physical Abilities"
        instruction="For each activity below, tell us whether you were able to do it during the past week. Tap the option that best describes your experience."
        example="If climbing stairs was very difficult or impossible for you this week, choose the red option. If you could do it easily, choose the green one."
      />
      {funcItems.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3 leading-snug">
            During the past week, were you able to:
            <span className="block text-base font-black text-gray-900 mt-1">
              {item.q}?
            </span>
          </p>
          {renderFunc(item)}
        </div>
      ))}

      {/* ══ GROUP 2: Daily Life Frequency ══════════════════════════════════ */}
      <SectionBanner
        icon="📅"
        title="Group 2 of 4 — How Often in the Past Week"
        instruction="For each statement, choose how many days out of the past 7 days this was true for you. Tap the face that matches best."
        example="If you felt happy on most days this week, tap 'Often' or 'Always'. If you never felt worried, tap 'Never'."
      />
      {freqItems.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">
            In the past week, how often did you:
          </p>
          <p className="text-base font-black text-gray-900 mb-3">{item.q}?</p>
          {renderFreq(item)}
        </div>
      ))}

      {/* ══ GROUP 3: Health Ratings ═════════════════════════════════════════ */}
      <SectionBanner
        icon="⭐"
        title="Group 3 of 4 — Rate Your Health"
        instruction="Give an overall rating for your health in the past week. Tap the face that matches how your health has been — honestly, as it has felt to you."
        example="If your physical health felt good but not great, tap 'Good'. If your mental health felt excellent, tap 'Excellent'."
      />
      {healthItems.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-base font-black text-gray-900 mb-3 leading-snug">{item.q}</p>
          {renderHealth(item)}
        </div>
      ))}

      {/* ══ GROUP 4: Comparison ════════════════════════════════════════════ */}
      <SectionBanner
        icon="⚖️"
        title="Group 4 of 4 — Compared to Others Your Age"
        instruction="Think about other people you know who are roughly the same age as you. Compared to them overall, how would you say your health is?"
        example="If most people your age seem healthier than you, choose 'Somewhat worse'. If you feel healthier than most, choose 'Somewhat better' or 'Much better'."
      />
      {cmpItems.map(item => (
        <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-base font-black text-gray-900 mb-3 leading-snug">{item.q}</p>
          {renderCompare(item)}
        </div>
      ))}

    </div>
  );
};

// ════ DOMAIN 4 — RISK ════════════════════════════════════════════════════════
const DomainRisk = ({ resp, set, color, bg, mode }) => (
  <div className="space-y-4">
    <div className="rounded-xl p-3 text-xs" style={{ background:bg, border:`1px solid ${color}33` }}>
      <strong style={{color}}>⚠️ Risk Factor Profile — D4</strong><br/>
      <span className="text-gray-600">
        These questions are asked for health monitoring only. All responses are strictly confidential.
        Answer honestly — this helps identify if any support might be needed.
      </span>
    </div>

    {/* C-SSRS */}
    <p className="text-xs font-black text-gray-500 uppercase tracking-wider px-1">Part A — Suicidality Screen (C-SSRS)</p>
    {CSSRS.map((q, i) => {
      const val = resp[`css${i+1}`];
      return (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-gray-700 mb-3">{i+1}. {q}</p>
          <div className="flex gap-2">
            {["Yes","No"].map((opt, j) => (
              <button key={j} onClick={() => set(`css${i+1}`, j===0)}
                className={cx("flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all",
                  val===(j===0) ? (j===0?"border-red-400 bg-red-50 text-red-700":"border-green-400 bg-green-50 text-green-700")
                    : "border-gray-200 text-gray-500")}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    })}

    {/* AUDIT-C */}
    <p className="text-xs font-black text-gray-500 uppercase tracking-wider px-1 mt-2">Part B — Alcohol Screen (AUDIT-C)</p>
    {AUDITC.map((item, i) => {
      const val = resp[`aud${i+1}`];
      return (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-gray-700 mb-2">{item.q}</p>
          <div className="space-y-1.5">
            {item.opts.map((opt, j) => (
              <button key={j} onClick={() => set(`aud${i+1}`, j)}
                className={cx("w-full text-left py-2 px-3 rounded-xl text-xs border-2 transition-all",
                  val===j ? "border-orange-500 bg-orange-50 text-orange-700 font-bold" : "border-gray-200 text-gray-600")}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    })}

    {/* SDQ-CP */}
    <p className="text-xs font-black text-gray-500 uppercase tracking-wider px-1 mt-2">Part C — Conduct Profile (SDQ-CP)</p>
    {SDQCP.map((item, i) => {
      const val = resp[`sdq${i+1}`];
      return (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm text-gray-700 mb-2">{i+1}. {item.q}</p>
          <div className="flex gap-1.5">
            {["Not True","Somewhat True","Certainly True"].map((opt, j) => (
              <button key={j} onClick={() => set(`sdq${i+1}`, j)}
                className={cx("flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  val===j ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 text-gray-400")}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ════ DEMOGRAPHICS ════════════════════════════════════════════════════════════

// ── VALID: Alert Components + Wellbeing Report ───────────────────

// ─── Red Flag Alert Component ────────────────────────────────────────────────
const RedFlag = ({ title, body, helplines }) => (
  <div className="rounded-2xl p-4 mt-4" style={{
    background:"linear-gradient(135deg,#FFF1F1,#FFF7F7)",
    border:"2px solid #FCA5A5"
  }}>
    <div className="flex items-start gap-2.5 mb-2">
      <span className="text-xl flex-shrink-0 mt-0.5">🚨</span>
      <div>
        <p className="text-sm font-black text-red-700 mb-1">{title}</p>
        <p className="text-xs text-red-800 leading-relaxed">{body}</p>
      </div>
    </div>
    {helplines && (
      <div className="rounded-xl p-2.5 mt-2" style={{background:"#FEE2E2"}}>
        <p className="text-xs font-bold text-red-700 mb-1">Free Support — Available Now</p>
        {helplines.map((h,i) => (
          <p key={i} className="text-xs text-red-800">📞 {h}</p>
        ))}
      </div>
    )}
  </div>
);

// ─── Gentle Amber Flag Component ─────────────────────────────────────────────
const AmberFlag = ({ title, body, action }) => (
  <div className="rounded-2xl p-4 mt-3" style={{
    background:"linear-gradient(135deg,#FFFBEB,#FFFEF5)",
    border:"2px solid #FCD34D"
  }}>
    <div className="flex items-start gap-2.5">
      <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
      <div>
        <p className="text-sm font-bold text-amber-800 mb-1">{title}</p>
        <p className="text-xs text-amber-900 leading-relaxed">{body}</p>
        {action && <p className="text-xs font-semibold text-amber-700 mt-1.5">→ {action}</p>}
      </div>
    </div>
  </div>
);

// ─── Strength Badge Component ─────────────────────────────────────────────────
const StrengthBadge = ({ text }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mr-1.5 mb-1.5"
    style={{background:"#F0FDF4", color:"#15803D", border:"1px solid #86EFAC"}}>
    ✦ {text}
  </span>
);

// ══════════════════════════════════════════════════════════════════════════════
// WELLBEING REPORT — Lucid, personal, narrative-driven
// ══════════════════════════════════════════════════════════════════════════════
const WellbeingReport = ({ bfi, duke, cssCl, audCl, ravensScore, ravensLabel, catResult, ageNorms, demographics }) => {

  const dn = ageNorms || getAgeNorms(demographics?.age);

  // ── Cognitive narrative ───────────────────────────────────────────────────
  const cognitiveNarrative = () => {
    const iq = catResult.iq, ma = catResult.ma, pct = catResult.pctRank;
    if (iq >= 115) return {
      headline:"Your reasoning is exceptional",
      body:`You solved advanced multi-rule patterns that require holding several logical principles in mind at once — a result that places you at the ${pct}th percentile, with a mental age equivalent of approximately ${ma} years. You have a natural ability to spot structure in complexity, think several steps ahead, and adapt quickly when a problem changes shape.`,
      strength:"Pattern recognition · Abstract thinking · Analytical depth"
    };
    if (iq >= 100) return {
      headline:"Your reasoning is above average",
      body:`You performed well on the pattern reasoning tasks — ${pct}th percentile, mental age approximately ${ma} years. Your mind picks up sequences and logical rules efficiently, which serves you well in problem-solving, learning new skills, and making sound decisions.`,
      strength:"Logical reasoning · Quick learning · Problem solving"
    };
    if (iq >= 85) return {
      headline:"Your reasoning is solid and practical",
      body:`You answered the pattern tasks at a level consistent with most adults — ${pct}th percentile, mental age approximately ${ma} years. Steady, practical, and reliable. You may think most effectively when you can take your time and work through things step by step.`,
      strength:"Steady thinking · Practical approach · Attention to detail"
    };
    return {
      headline:"Your reasoning may benefit from practice",
      body:`The pattern tasks in this section were challenging today — ${pct}th percentile, mental age approximately ${ma} years. This does not reflect your overall intelligence. Many forms of thinking and ability are simply not measured by visual pattern tests. Step-by-step reasoning is very much a skill that can grow with practice.`,
      strength:"Persistence · Effort · Room to grow"
    };
  };
  const cog = cognitiveNarrative();

  // ── Personality narrative ─────────────────────────────────────────────────
  const bfiNarrative = {
    O: {
      high:{ line:"Curious & Creative", desc:"You have an open, imaginative mind. You are drawn to new ideas, enjoy exploring possibilities, and feel energised by learning. You likely bring fresh perspectives to situations and may sometimes feel a little different from people who prefer routine — and that is a gift, not a flaw." },
      low: { line:"Grounded & Practical", desc:"You prefer what works over what is theoretical. You are comfortable with familiar routines and tend to trust experience over speculation. This pragmatic quality makes you reliable and realistic — qualities many people around you depend on." }
    },
    C: {
      high:{ line:"Reliable & Organised", desc:"You are someone others can count on. You follow through, plan ahead, and take your responsibilities seriously. This conscientiousness is one of the strongest predictors of long-term success and wellbeing — it is a genuine asset." },
      low: { line:"Flexible & Spontaneous", desc:"You tend to live more in the moment and may sometimes find rigid structure frustrating. While this can mean things occasionally slip through the cracks, your flexibility means you adapt well to change — a strength in an unpredictable world. Building a few simple routines can help you harness the best of both." }
    },
    E: {
      high:{ line:"Sociable & Energetic", desc:"You are energised by people and connection. You enjoy being part of conversations, group activities, and social situations. Your warmth and expressiveness make you easy to be around, and people likely find you approachable and engaging." },
      low: { line:"Reflective & Self-Sufficient", desc:"You recharge by spending time with yourself and do not need a lot of external stimulation to feel at ease. This quiet self-sufficiency allows you to think deeply and work independently. It is not shyness — it is a deliberate and valued way of being in the world." }
    },
    A: {
      high:{ line:"Warm & Cooperative", desc:"You genuinely care about the people around you and tend to put relationships first. Your cooperative nature and empathy make you a trusted friend and colleague. You likely go out of your way to keep things harmonious — which is a beautiful quality, as long as you also take care of your own needs." },
      low: { line:"Direct & Independent-minded", desc:"You say what you think and do not easily back down from your position. This directness can sometimes create friction, but it also means people always know where they stand with you — a form of honesty many genuinely respect. Channelled well, this quality is a real leadership strength." }
    },
    N: {
      high:{ line:"Emotionally Sensitive", desc:"You experience your emotions deeply and are attuned to changes in mood, both in yourself and in those around you. This sensitivity is also what makes you empathetic, creative, and authentic. The challenge is that it can also mean you carry stress and worry more intensely than others — and that is something worth actively managing with support and self-care." },
      low: { line:"Emotionally Steady", desc:"You are remarkably resilient under pressure. You tend to remain calm when things go wrong and recover quickly from setbacks. This emotional stability is one of the most protective factors for long-term mental health and is something many people quietly admire about people like you." }
    },
  };

  const bfiFlags = () => {
    const flags = [];
    if (+bfi.N > 4)   flags.push({ title:"You may be carrying more stress than usual", body:"Your responses suggest you are experiencing a notable level of emotional tension or worry right now. This is something many people go through, and it does not mean anything is permanently wrong. But it is worth acknowledging — and speaking with someone you trust or a counsellor can make a real difference.", action:"Consider speaking with a counsellor or your family doctor about how you have been feeling lately." });
    if (+bfi.A < 2)   flags.push({ title:"Relationships may feel difficult right now", body:"Your responses suggest some difficulty with trust or cooperation in relationships at the moment. This can sometimes be a sign of accumulated stress, past hurt, or feeling unsafe around others. It is worth reflecting on whether this is long-standing or a recent shift.", action:"A few sessions with a counsellor can be very helpful in untangling relationship patterns." });
    if (+bfi.C < 1.8) flags.push({ title:"Day-to-day functioning may be a challenge", body:"A very low score on reliability and organisation can sometimes signal that everyday tasks are feeling overwhelming. If you are struggling to manage daily responsibilities, please consider reaching out for support.", action:"Your doctor or a mental health professional can help identify what is making things feel so hard right now." });
    return flags;
  };

  // ── Health narrative ──────────────────────────────────────────────────────
  const healthNarrative = () => {
    const g = +duke.general;
    if (g >= 75) return { head:"Your overall health and wellbeing are in excellent shape", body:"All three pillars — physical, mental, and social health — are functioning well. You are in a strong position right now. The task ahead is to protect and maintain what you have built: regular activity, meaningful connection, and time to rest and restore." };
    if (g >= 55) return { head:"Your wellbeing is in a reasonable place with some areas to nurture", body:"You have real strengths across several areas of health, but something — physical energy, mood, or social connection — may not be quite where you want it. This is a good moment to pay a little more attention to whichever area feels most depleted, before a small dip becomes a larger one." };
    if (g >= 35) return { head:"Some areas of your health need attention right now", body:"Your scores suggest you may be going through a difficult period — physically, emotionally, or both. This is not unusual, and it does not mean things cannot improve. But it does mean this is a good time to reach out — to a doctor, a friend, a counsellor, or someone you trust — rather than pushing through alone." };
    return { head:"Your health and wellbeing are under significant strain", body:"Your responses across physical health, mental health, and social functioning all point to a period of real difficulty. Please do not try to manage this alone. Talking to a healthcare professional — even a single honest conversation — can open doors to support that makes a meaningful difference." };
  };
  const health = healthNarrative();

  const healthFlags = () => {
    const flags = [];
    if (+duke.phys < 30)    flags.push({ title:"Your physical health may need medical attention", body:"Your responses suggest significant limitations in physical activity and function. This is worth a conversation with your doctor, even if you have been putting it off.", action:"Book an appointment with your physician or a nearby primary health centre." });
    if (+duke.mental < 35)  flags.push({ title:"Your mental wellbeing is at a low point", body:"Very low mental health scores on the Duke scale, combined with other findings in this report, suggest you are carrying a significant emotional burden right now. Please do not wait for things to get worse before seeking support.", action:"A mental health professional — psychiatrist, psychologist, or counsellor — can help." });
    if (+duke.social < 30)  flags.push({ title:"You may be feeling isolated right now", body:"Social isolation is one of the strongest risk factors for depression and declining health. If you feel cut off from others, reaching out — even in a small way — matters more than you may realise.", action:"Even one regular social connection can meaningfully protect your mental health." });
    return flags;
  };

  // ── Mood narrative — based on Duke Depression & Anxiety subscales ────────
  const moodNarrative = () => {
    const dep = +duke.depression;
    const anx = +duke.anxiety;
    const depHigh = dep > dn.depression[1];
    const anxHigh = anx > dn.anxiety[1];
    if (!depHigh && !anxHigh) return {
      head:"Your mood and emotional wellbeing are in a healthy place",
      body:"Your responses across the health profile show no significant signs of depression or anxiety at this time. You appear to be managing life's demands without marked emotional distress — a real positive. Continue investing in the things that keep you well: sleep, connection, movement, and moments of meaning."
    };
    if (depHigh && anxHigh) return {
      head:"Your mood and anxiety scores both need attention",
      body:`Your Duke Health Profile shows elevated depression (${dep}/100, normal 0–${dn.depression[1]}) and anxiety (${anx}/100, normal 0–${dn.anxiety[1]}) for your age group. Experiencing both together is common and very treatable. Please do not try to manage this alone — speaking to a doctor or counsellor is an important next step.`
    };
    if (depHigh) return {
      head:"Your mood score suggests you may be experiencing low mood",
      body:`Your Duke Depression subscale score (${dep}/100) is above the normal range for your age group (0–${dn.depression[1]}). This suggests you have been feeling down, sad, or lacking a sense of worth more than usual recently. These feelings are real, valid, and respond well to support.`
    };
    return {
      head:"Your anxiety score suggests you may be feeling more stressed than usual",
      body:`Your Duke Anxiety subscale score (${anx}/100) is above the normal range for your age group (0–${dn.anxiety[1]}). Worry, nervousness, and trouble sleeping are all common signs of elevated anxiety. There is effective support available — please consider speaking with your doctor or a counsellor.`
    };
  };
  const mood = moodNarrative();

  // ── Compile all active flags ───────────────────────────────────────────────
  const activeRedFlags = [];
  if (cssCl.level >= 2) activeRedFlags.push({
    title: cssCl.level >= 4 ? "You have described thoughts of suicide — please reach out right now" :
           cssCl.level >= 3 ? "You are having thoughts of suicide with a plan — please tell someone today" :
           "You are having thoughts of harming yourself — you do not have to face this alone",
    body: cssCl.level >= 3
      ? "You have shared that you are thinking about ending your life and have begun thinking about how. This is a serious signal that you need support right now — not tomorrow. Please contact a crisis line, go to your nearest hospital emergency department, or tell someone you trust immediately."
      : "Thoughts of suicide or self-harm are telling you that your pain has reached a level that needs immediate support. These thoughts can pass, and real help is available. You deserve to feel better.",
    helplines: ["iCall (TISS): 9152987821 (Mon–Sat, 8am–10pm)","Vandrevala Foundation: 1860-2662-345 (24/7)","NIMHANS Helpline: 080-46110007","Emergency: 112"]
  });
  if (+duke.depression > dn.depression[1] * 1.5) activeRedFlags.push({
    title:"Your depression score is significantly elevated — please speak to a doctor",
    body:`Your Duke Depression score (${duke.depression}/100) is well above the normal range for your age group. This level of depressive experience benefits strongly from professional support. Effective help is available — this is a health need, exactly like any other medical condition.`,
    helplines:["iCall (TISS): 9152987821","Your nearest government hospital psychiatry OPD — free of charge"]
  });
  if (audCl.score >= 8) activeRedFlags.push({
    title:"Your alcohol use is at a level that can harm your health",
    body:"Your AUDIT-C score suggests harmful or dependent alcohol use. Alcohol at this level damages physical health, worsens depression and anxiety, and affects relationships and work. The good news is that de-addiction support is effective and confidential. You deserve support without judgement.",
    helplines:["iDARC (NIMHANS): 080-46110007","Vandrevala Foundation: 1860-2662-345 (24/7)"]
  });

  const activeAmberFlags = [];
  if (+duke.depression > dn.depression[1] && +duke.depression <= dn.depression[1] * 1.5) activeAmberFlags.push({
    title:"Your mood score suggests some depressive feelings",
    body:`Your Duke Depression score (${duke.depression}/100) is above the normal range for your age (0–${dn.depression[1]}). This is worth paying attention to — speaking with a counsellor or your family doctor is a sensible step.`,
    action:"Book an appointment with a counsellor or your family doctor in the next week."
  });
  if (+duke.anxiety > dn.anxiety[1]) activeAmberFlags.push({
    title:"Your anxiety level is elevated",
    body:`Your Duke Anxiety score (${duke.anxiety}/100) is above the normal range for your age (0–${dn.anxiety[1]}). Worry, poor sleep, and tension are manageable with the right support.`,
    action:"Consider speaking with a counsellor about stress management and relaxation techniques."
  });
  if (+duke.selfEsteem < dn.selfEsteem[0]) activeAmberFlags.push({
    title:"Your sense of self-worth seems low right now",
    body:`Your Duke Self-Esteem score (${duke.selfEsteem}/100) is below the normal range for your age (${dn.selfEsteem[0]}–100). How we see ourselves shapes almost every area of life. This is absolutely something that can be worked on.`,
    action:"A few sessions with a counsellor focused on self-compassion can make a meaningful difference."
  });
  if (audCl.score >= 4 && audCl.score < 8) activeAmberFlags.push({
    title:"Your alcohol use is worth monitoring",
    body:"Your AUDIT-C score suggests hazardous drinking. At this level, alcohol may be interfering with sleep, mood, or relationships in ways you might not have connected yet.",
    action:"Consider tracking your alcohol intake for a week — it often reveals more than we expect."
  });
  bfiFlags().forEach(f => activeAmberFlags.push(f));
  healthFlags().forEach(f => activeAmberFlags.push(f));

  return (
    <div className="space-y-5">

      {/* ── Active Red Flags ── */}
      {activeRedFlags.map((f,i) => <RedFlag key={i} {...f}/>)}
      {activeAmberFlags.slice(0,2).map((f,i) => <AmberFlag key={i} {...f}/>)}

      {/* ── Cognitive section ── */}
      <div className="bg-white rounded-2xl border border-blue-200 p-5">
        <SectionHead icon="🧩" title="Your Thinking & Reasoning" color="#3B82F6"/>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {label:"CQ Estimate", val:`~${catResult.iq}`, sub:"out of 130", color:"#3B82F6"},
            {label:"Mental Age",  val:`~${catResult.ma} yrs`, sub:catResult.label, color:"#8B5CF6"},
            {label:"Percentile",  val:`${catResult.pctRank}th`, sub:"among peers", color:"#10B981"},
          ].map(({label,val,sub,color})=>(
            <div key={label} className="rounded-xl p-2.5 text-center" style={{background:color+"10",border:`1px solid ${color}30`}}>
              <p className="text-xl font-black" style={{color}}>{val}</p>
              <p className="text-xs font-bold text-gray-600 leading-tight">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{background:"#EFF6FF"}}>
          <div>
            <p className="text-sm font-black text-blue-800 mb-0.5">{cog.headline}</p>
            <div className="flex flex-wrap">{cog.strength.split("·").map(s=><StrengthBadge key={s} text={s.trim()}/>)}</div>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{cog.body}</p>
      </div>

      {/* ── Personality section ── */}
      <div className="bg-white rounded-2xl border border-purple-200 p-5">
        <SectionHead icon="🪞" title="Your Personality & Character" color="#8B5CF6"/>
        <p className="text-xs text-gray-500 mb-4">These scores reflect how you see yourself right now — they are not fixed labels. Personality is dynamic and can shift with experience and growth.</p>
        {[["O","Openness"],["C","Conscientiousness"],["E","Extraversion"],["A","Agreeableness"],["N","Emotional Sensitivity"]].map(([d, label]) => {
          const val = +bfi[d];
          const isHigh = val > 3;
          const nar = bfiNarrative[d][isHigh?"high":"low"];
          const col = "#8B5CF6";
          return (
            <div key={d} className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-gray-700">{label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{background:col+"18",color:col}}>{nar.line}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all"
                  style={{width:`${(val/5)*100}%`, background:`linear-gradient(90deg,${col}88,${col})`}}/>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{nar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ── Health section ── */}
      <div className="bg-white rounded-2xl border border-green-200 p-5">
        <SectionHead icon="💚" title="Your Health & Wellbeing" color="#10B981"/>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label:"Physical",  val:duke.phys,   color:"#3B82F6", icon:"🏃" },
            { label:"Mental",    val:duke.mental,  color:"#8B5CF6", icon:"🧠" },
            { label:"Social",    val:duke.social,  color:"#10B981", icon:"🤝" },
            { label:"Overall",   val:duke.general, color:"#F59E0B", icon:"⭐" },
          ].map(item => {
            const v = +item.val;
            const tier = v>=70?"Good":v>=45?"Fair":"Low";
            const tierColor = v>=70?"#15803D":v>=45?"#B45309":"#DC2626";
            return (
              <div key={item.label} className="rounded-2xl p-3"
                style={{background:item.color+"10", border:`1.5px solid ${item.color}33`}}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold" style={{color:tierColor}}>{tier}</span>
                </div>
                <p className="text-2xl font-black" style={{color:item.color}}>{item.val}</p>
                <p className="text-xs text-gray-500 font-medium">{item.label} Health</p>
              </div>
            );
          })}
        </div>
        <p className="text-sm font-bold text-gray-700 mb-1">{health.head}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{health.body}</p>
      </div>

      {/* ── Mood section ── */}
      {(() => {
        const dep = +duke.depression;
        const anx = +duke.anxiety;
        const se  = +duke.selfEsteem;
        const depOk = dep <= dn.depression[1];
        const anxOk = anx <= dn.anxiety[1];
        const seOk  = se  >= dn.selfEsteem[0];
        const overallOk = depOk && anxOk && seOk;
        const sectionColor = overallOk ? "#10B981" : dep > dn.depression[1]*1.5 || anx > dn.anxiety[1]*1.5 ? "#EF4444" : "#F59E0B";
        return (
          <div className="bg-white rounded-2xl p-5" style={{
            border: `2px solid ${sectionColor}66`,
            background: `linear-gradient(135deg, white, ${sectionColor}06)`
          }}>
            <SectionHead icon="🌤" title="Your Mood & Emotional Wellbeing" color={sectionColor}
              badge={{text: overallOk?"Within normal range":"Needs attention", color:sectionColor}}/>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label:"Depression", val:dep, lo:dn.depression[0], hi:dn.depression[1], worse:"↑", color:"#6366F1" },
                { label:"Anxiety",    val:anx, lo:dn.anxiety[0],    hi:dn.anxiety[1],    worse:"↑", color:"#F59E0B" },
                { label:"Self-Esteem",val:se,  lo:dn.selfEsteem[0], hi:dn.selfEsteem[1], worse:"↓", color:"#10B981" },
              ].map(({ label, val, lo, hi, worse, color }) => {
                const ok = worse==="↑" ? val<=hi : val>=lo;
                const sc = ok ? "#059669" : "#DC2626";
                return (
                  <div key={label} className="rounded-xl p-2.5 text-center border"
                    style={{borderColor:sc+"33", background:sc+"08"}}>
                    <p className="text-2xl font-black" style={{color:sc}}>{val}</p>
                    <p className="text-xs font-bold text-gray-600">{label}</p>
                    <p className="text-xs font-semibold" style={{color:sc}}>{ok?"Normal":worse==="↑"?"Elevated":"Low"}</p>
                    <p className="text-xs text-gray-400">{worse==="↑"?`norm 0–${hi}`:`norm ${lo}–100`}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm font-black text-gray-800 mb-1">{mood.head}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{mood.body}</p>
            {(!depOk || !anxOk) && (
              <div className="mt-3 rounded-xl p-3 text-xs" style={{background:"#FFFBEB",border:"1px solid #FCD34D"}}>
                <p className="font-bold text-amber-800 mb-1">You deserve support</p>
                <p className="text-amber-900">📞 iCall (TISS): <strong>9152987821</strong> — Mon–Sat, 8am–10pm</p>
                <p className="text-amber-900">📞 Vandrevala Foundation: <strong>1860-2662-345</strong> — 24/7, free</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Remaining amber flags ── */}
      {activeAmberFlags.slice(2).map((f,i) => <AmberFlag key={i} {...f}/>)}

      {/* ── Closing note ── */}
      <div className="rounded-2xl p-4" style={{background:"linear-gradient(135deg,#F5F3FF,#EFF6FF)",border:"1.5px solid #DDD6FE"}}>
        <p className="text-xs font-black text-purple-700 mb-1">A note from the CIBS team</p>
        <p className="text-xs text-purple-900 leading-relaxed">
          This report is a starting point for self-understanding — not a diagnosis, and not the final word on who you are.
          Use it as a compassionate mirror. If something here resonates or concerns you, please share it with a trusted doctor
          or counsellor. You deserve support that is personal, skilled, and kind.
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CLINICAL REPORT — Lab-style, formal, structured for clinician use
// ══════════════════════════════════════════════════════════════════════════════

// ── VALID: Clinical Report Component ─────────────────────────────
const ValidClinicalReport = ({ bfi, duke, cssCl, audCl, ravensScore, ravensIQ, ravensLabel, responses, mode, demographics, catResult, ageNorms }) => {

  const sdqTotal = SDQCP.reduce((s,item,i) => {
    const v = responses.d4[`sdq${i+1}`] || 0;
    return s + (item.rev ? (2-v) : v);
  }, 0);

  const bfiDSM = () => {
    const N=+bfi.N, A=+bfi.A, C=+bfi.C, O=+bfi.O, E=+bfi.E;
    const clusters = [];
    if (N>3.8 && A<2.5) clusters.push("Cluster B (Emotional Dysregulation / Antagonism)");
    if (N>3.8 && C<2.5) clusters.push("Cluster C (Anxious / Avoidant traits)");
    if (O<2.5 && E<2.5 && A<2.5) clusters.push("Cluster A (Schizotypal / Detachment pattern)");
    return clusters.length ? clusters : ["No clinically significant DSM-5 Cluster A/B/C personality trait pattern identified"];
  };

  const RangeRow = ({label, val, lo, hi, unit="", flag=""}) => {
    const v = parseFloat(val);
    const inRange = v>=lo && v<=hi;
    const stateColor = inRange ? "#059669" : v>hi ? "#DC2626" : "#D97706";
    const stateLabel = inRange ? "Within Range" : v>hi ? "Above Range ↑" : "Below Range ↓";
    return (
      <tr style={{borderBottom:"1px solid #F1F5F9"}}>
        <td className="py-2 pr-3 text-xs text-gray-700 font-medium">{label}</td>
        <td className="py-2 pr-3 text-sm font-black" style={{color:stateColor}}>{val}{unit}</td>
        <td className="py-2 pr-3 text-xs text-gray-400">{lo}–{hi}{unit}</td>
        <td className="py-2">
          <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
            style={{background:stateColor+"18", color:stateColor}}>{stateLabel}</span>
        </td>
      </tr>
    );
  };

  const today = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
  const reportId = "CIBS-" + (demographics?.uid?.slice(-8)||"XXXX");

  // Compile clinical alerts
  const clinAlerts = [];
  const dn = ageNorms || getAgeNorms(demographics?.age);
  if (cssCl.level >= 3) clinAlerts.push({ sev:"CRITICAL", text:`C-SSRS Level ${cssCl.level}/4 — Suicidal ideation with plan${cssCl.level>=4?" and rehearsal":""} endorsed. Immediate clinical assessment and safety planning required.` });
  if (cssCl.level >= 1 && cssCl.level < 3) clinAlerts.push({ sev:"MODERATE", text:`C-SSRS Level ${cssCl.level} — passive/active ideation without plan. Safety monitoring and 2-week follow-up recommended.` });
  // Duke Depression alert (dysfunction scale — higher=worse; normal upper limit is dn.depression[1])
  if (+duke.depression > dn.depression[1])
    clinAlerts.push({ sev:+duke.depression>60?"HIGH":"MODERATE", text:`Duke Depression subscale ${duke.depression}/100 — above age-adjusted normal range (0–${dn.depression[1]}). Depressive symptomatology indicated. Clinical interview and further evaluation recommended.` });
  // Duke Anxiety alert
  if (+duke.anxiety > dn.anxiety[1])
    clinAlerts.push({ sev:+duke.anxiety>60?"HIGH":"MODERATE", text:`Duke Anxiety subscale ${duke.anxiety}/100 — above age-adjusted normal range (0–${dn.anxiety[1]}). Anxiety symptoms present. Consider structured anxiety assessment (GAD-7/HAM-A).` });
  // Duke Self-Esteem alert (positive scale — lower=worse; normal lower limit is dn.selfEsteem[0])
  if (+duke.selfEsteem < dn.selfEsteem[0])
    clinAlerts.push({ sev:"MODERATE", text:`Duke Self-Esteem subscale ${duke.selfEsteem}/100 — below age-adjusted normal range (${dn.selfEsteem[0]}–100). Low self-worth may co-present with depressive or personality disorder features.` });
  if (audCl.score >= 8) clinAlerts.push({ sev:"HIGH", text:`AUDIT-C score ${audCl.score}/12 — Harmful or dependent use. Structured brief intervention and referral to de-addiction services indicated.` });
  if (audCl.score >= 4 && audCl.score < 8) clinAlerts.push({ sev:"MODERATE", text:`AUDIT-C score ${audCl.score}/12 — Hazardous use detected. Brief alcohol counselling recommended at next clinical contact.` });
  if (sdqTotal >= 5) clinAlerts.push({ sev:"MODERATE", text:`SDQ-Conduct subscale score ${sdqTotal}/10 — Elevated conduct symptomatology. Consider full SDQ or CBCL if paediatric/adolescent presentation.` });
  if (+bfi.N > 4 && +duke.depression > dn.depression[1]) clinAlerts.push({ sev:"MODERATE", text:`High Neuroticism (T=${Math.round(50+(+bfi.N-3)*10)}) concurrent with elevated Duke Depression — emotionally dysregulated presentation warrants psychotherapy referral.` });

  const AlertBadge = ({sev}) => {
    const cfg = {CRITICAL:{bg:"#FEE2E2",c:"#991B1B"},HIGH:{bg:"#FEF2F2",c:"#DC2626"},MODERATE:{bg:"#FFFBEB",c:"#92400E"}};
    const {bg,c} = cfg[sev]||cfg.MODERATE;
    return <span className="text-xs font-black px-2 py-0.5 rounded" style={{background:bg,color:c}}>{sev}</span>;
  };

  return (
    <div className="space-y-5 text-gray-800">

      {/* ── Lab Report Header ── */}
      <div style={{background:"#F8FAFC",border:"1.5px solid #CBD5E1",borderRadius:16}}>
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">CIBS-VALID · Psychometric Lab Report</p>
              <p className="text-xs text-slate-400 mt-0.5">Report ID: {reportId} · {today}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Administered by</p>
              <p className="text-xs font-bold text-slate-700">{mode==="assisted"?"Clinician (Assisted)":"Self-Administered"}</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-3 gap-4 text-xs">
          {[
            ["Battery","CIBS-VALID v3.0"],
            ["Domains","4 (D1–D4)"],
            ["Total Items","~62 (adaptive)"],
            ["Instruments","Raven's CAT-22 · BFI-10 · DUKE-17 · C-SSRS · AUDIT-C · SDQ-CP"],
          ].map(([k,v])=>(
            <div key={k}>
              <p className="text-slate-400 font-medium">{k}</p>
              <p className="text-slate-700 font-bold leading-tight">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Clinical Alerts Panel ── */}
      {clinAlerts.length > 0 && (
        <div style={{background:"#FFF5F5",border:"2px solid #FCA5A5",borderRadius:16,padding:16}}>
          <p className="text-xs font-black text-red-700 uppercase tracking-wider mb-3">⚠ Clinical Alerts — Action Required</p>
          <div className="space-y-2">
            {clinAlerts.map((a,i)=>(
              <div key={i} className="flex items-start gap-2.5">
                <AlertBadge sev={a.sev}/>
                <p className="text-xs text-red-900 leading-relaxed flex-1">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── D1: Cognitive Function ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#3B82F608,white)"}}>
          <p className="text-xs font-black text-blue-700 uppercase tracking-wider">D1 · Cognitive Function</p>
          <p className="text-xs text-slate-400">Raven's Progressive Matrices — Adaptive CAT (CIBS Edition, 11-item pool)</p>
        </div>
        <div className="p-4">
          {/* Summary row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              {label:"Est. CQ",       val:`~${catResult.iq}`,              color:"#3B82F6"},
              {label:"Mental Age",    val:`~${catResult.ma} yrs`,          color:"#8B5CF6"},
              {label:"Percentile",    val:`${catResult.pctRank}th`,        color:"#10B981"},
              {label:"Band / Level",  val:`${catResult.band}/4 · ${catResult.label}`, color:BAND_COLORS[catResult.band]},
            ].map(item=>(
              <div key={item.label} className="rounded-xl p-2 text-center bg-blue-50">
                <p className="text-sm font-black" style={{color:item.color}}>{item.val}</p>
                <p className="text-xs text-gray-500 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
          {/* Band-by-band table */}
          <table className="w-full mb-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Band</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">CQ / MA</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Items</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Correct</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Pass?</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4].map(b=>{
                const reached = b <= catResult.band;
                const bc = catResult.bandScores[b];
                const bt = RAVENS_CAT[b].length;
                const rule = CAT_RULES[b];
                const passed = b < catResult.band; // passed if they advanced past it
                const isFinal = b === catResult.band;
                const passedFinal = isFinal && bc >= rule.passThreshold;
                return (
                  <tr key={b} style={{borderBottom:"1px solid #F1F5F9",
                    background: isFinal ? BAND_COLORS[b]+"08" : "transparent"}}>
                    <td className="py-2 pr-2">
                      <span className="text-xs font-black" style={{color:reached?BAND_COLORS[b]:"#CBD5E1"}}>
                        {BAND_ICONS[b]} B{b}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-xs text-slate-500">
                      {rule.iqBase}–{rule.iqBase+rule.range} · MA {rule.maLo}–{rule.maHi}y
                    </td>
                    <td className="py-2 pr-2 text-xs text-slate-700 font-bold">
                      {reached ? `${bt}` : '—'}
                    </td>
                    <td className="py-2 pr-2 text-sm font-black"
                      style={{color:reached?(bc>=rule.passThreshold?"#059669":"#DC2626"):"#CBD5E1"}}>
                      {reached ? `${bc}/${bt}` : '—'}
                    </td>
                    <td className="py-2 text-xs font-bold">
                      {!reached ? <span className="text-slate-300">Not reached</span>
                       : passed ? <span className="text-green-600">✓ Advanced</span>
                       : passedFinal ? <span className="text-green-600">✓ Passed</span>
                       : isFinal ? <span className="text-amber-600">Final band</span>
                       : <span className="text-red-500">Stopped here</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="rounded-lg px-3 py-2 bg-blue-50 text-xs text-blue-900 mb-2">
            <strong>Interpretation:</strong> {
              catResult.iq>=125?`Exceptional non-verbal reasoning — Mental Age ~${catResult.ma} yrs (${catResult.pctRank}th percentile). Completed highest band levels with passing scores. Abstract and relational pattern recognition is a primary cognitive strength.`:
              catResult.iq>=110?`Above average fluid intelligence — Mental Age ~${catResult.ma} yrs (${catResult.pctRank}th percentile). Advanced to Band 3+, indicating strong capacity for multi-rule abstract reasoning.`:
              catResult.iq>=90?`Average to high-average cognitive screening — Mental Age ~${catResult.ma} yrs (${catResult.pctRank}th percentile). Passed foundation and standard levels. No significant impairment identified.`:
              `Below average performance on non-verbal reasoning screening — Mental Age ~${catResult.ma} yrs (${catResult.pctRank}th percentile). Stopped at Foundation level. Further formal cognitive assessment (WAIS-IV / NIMHANS Battery) is recommended.`
            }
          </div>
          <p className="text-xs text-slate-400 italic">
            Note: CQ and Mental Age are analogs based on highest band reached and within-band performance (22-item adaptive pool, 4 bands).
            Not a validated IQ/MA measure. Adaptive administration: {catResult.totalQ} of up to 22 items presented.
          </p>
        </div>
      </div>

      {/* ── D2: Personality ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#8B5CF608,white)"}}>
          <p className="text-xs font-black text-purple-700 uppercase tracking-wider">D2 · Personality Profile</p>
          <p className="text-xs text-slate-400">Big Five Inventory-10 (BFI-10; Rammstedt & John, 2007)</p>
        </div>
        <div className="p-4">
          <table className="w-full mb-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5 w-6">Dom</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Facet</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Raw (1–5)</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">T-Score</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Flag</th>
              </tr>
            </thead>
            <tbody>
              {[["O","Openness"],["C","Conscientiousness"],["E","Extraversion"],["A","Agreeableness"],["N","Neuroticism"]].map(([d,label])=>{
                const raw = +bfi[d];
                const tScore = Math.round(50 + (raw-3)*10);
                const nLo = ageNorms.bfi[d][0], nHi = ageNorms.bfi[d][1];
                const flag = tScore>nHi ? `↑ Elevated (T>${nHi})` : tScore<nLo ? `↓ Low (T<${nLo})` : "Within normal range";
                const fColor = tScore>nHi ? "#DC2626" : tScore<nLo ? "#D97706" : "#059669";
                return (
                  <tr key={d} style={{borderBottom:"1px solid #F1F5F9"}}>
                    <td className="py-2 pr-2 text-xs font-black text-slate-400">{d}</td>
                    <td className="py-2 pr-2 text-xs text-slate-700">{label}</td>
                    <td className="py-2 pr-2 text-sm font-black text-slate-800">{raw.toFixed(1)}</td>
                    <td className="py-2 pr-2 text-sm font-black" style={{color:fColor}}>T={tScore}</td>
                    <td className="py-2 text-xs font-semibold" style={{color:fColor}}>{flag}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="rounded-lg px-3 py-2 bg-purple-50 text-xs text-purple-900 mb-2">
            <strong>DSM-5 Personality Trait Pattern:</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              {bfiDSM().map((c,i)=><li key={i}>{c}</li>)}
            </ul>
          </div>
          <p className="text-xs text-slate-400 italic">
            Age group: <strong>{ageNorms.label}</strong>. Normal T-range is age-adjusted.
            BFI-10 is a screening instrument. PID-5 recommended if personality disorder evaluation is indicated.
          </p>
        </div>
      </div>

      {/* ── D3: Duke Health Profile ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#10B98108,white)"}}>
          <p className="text-xs font-black text-green-700 uppercase tracking-wider">D3 · Health Profile</p>
          <p className="text-xs text-slate-400">Duke Health Profile (DUKE-17; Parkerson et al., 1990) · Age group: {ageNorms.label}</p>
        </div>
        <div className="p-4">

          {/* ── Psychological Subscale Highlights ── */}
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Psychological Subscales</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label:"Depression", val:+duke.depression, lo:ageNorms.depression[0], hi:ageNorms.depression[1], note:"↓ better", color:"#6366F1" },
              { label:"Anxiety",    val:+duke.anxiety,    lo:ageNorms.anxiety[0],    hi:ageNorms.anxiety[1],    note:"↓ better", color:"#F59E0B" },
              { label:"Self-Esteem",val:+duke.selfEsteem, lo:ageNorms.selfEsteem[0], hi:ageNorms.selfEsteem[1], note:"↑ better", color:"#10B981" },
            ].map(({ label, val, lo, hi, note, color }) => {
              const isDeprAnx = note === "↓ better";
              const ok = isDeprAnx ? val <= hi : val >= lo;
              const sc = ok ? "#059669" : "#DC2626";
              const statusLabel = ok ? "Normal" : isDeprAnx ? "Elevated ↑" : "Low ↓";
              return (
                <div key={label} className="rounded-xl p-2.5 text-center border-2"
                  style={{borderColor: sc+"44", background: sc+"0A"}}>
                  <p className="text-lg font-black" style={{color: sc}}>{val}</p>
                  <p className="text-xs font-bold text-slate-600 leading-tight">{label}</p>
                  <p className="text-xs mt-0.5 font-semibold" style={{color: sc}}>{statusLabel}</p>
                  <p className="text-xs text-slate-400">{note} · norm {isDeprAnx?`0–${hi}`:`${lo}–100`}</p>
                </div>
              );
            })}
          </div>

          {/* ── Full functional scales table ── */}
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Functional Health Scales</p>
          <table className="w-full mb-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Subscale</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Score</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Age Norm</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              <RangeRow label="Physical Health"       val={duke.phys}       lo={ageNorms.phys[0]}       hi={ageNorms.phys[1]}/>
              <RangeRow label="Mental Health"         val={duke.mental}     lo={ageNorms.mental[0]}     hi={ageNorms.mental[1]}/>
              <RangeRow label="Social Health"         val={duke.social}     lo={ageNorms.social[0]}     hi={ageNorms.social[1]}/>
              <RangeRow label="General Health"        val={duke.general}    lo={ageNorms.general[0]}    hi={ageNorms.general[1]}/>
              <RangeRow label="Perceived Health"      val={duke.perceived}  lo={ageNorms.perceived[0]}  hi={ageNorms.perceived[1]}/>
              <RangeRow label="Pain (↓ better)"       val={duke.pain}       lo={ageNorms.pain[0]}       hi={ageNorms.pain[1]}/>
              <RangeRow label="Disability (↓ better)" val={duke.disability} lo={ageNorms.disability[0]} hi={ageNorms.disability[1]}/>
            </tbody>
          </table>
          <div className="rounded-lg px-3 py-2 bg-green-50 text-xs text-green-900">
            <strong>Clinical Summary:</strong> {
              +duke.general>=ageNorms.general[0] ? "General health profile within age-adjusted normal parameters across functional domains." :
              +duke.general>=(ageNorms.general[0]*0.75) ? "Moderate health profile. One or more subscales below age-adjusted normative range. Targeted clinical attention recommended." :
              "Significantly compromised health profile. Multiple subscales below age-adjusted normative range. Multidomain clinical evaluation and intervention planning is indicated."
            }
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">
            Normative reference: Age-adjusted Indian adult population norms. Higher = better for functional scales. Lower = better for Pain and Disability. Psychological subscales: Depression and Anxiety are dysfunction scales (lower=better); Self-Esteem is a positive scale (higher=better).
          </p>
        </div>
      </div>

      {/* ── D4: Risk Factor Profile ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#EF444408,white)"}}>
          <p className="text-xs font-black text-red-700 uppercase tracking-wider">D4 · Risk Factor Profile</p>
          <p className="text-xs text-slate-400">C-SSRS Screen · AUDIT-C · SDQ Conduct Subscale</p>
        </div>
        <div className="p-4 space-y-4">

          {/* C-SSRS */}
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Suicidality — C-SSRS (Columbia, 2008)</p>
            <table className="w-full mb-2">
              <tbody>
                {CSSRS.map((q,i)=>{
                  const v = responses.d4[`css${i+1}`];
                  return (
                    <tr key={i} style={{borderBottom:"1px solid #F8FAFC",
                      background:v===true?"#FEF2F2":"transparent"}}>
                      <td className="py-1.5 pr-2 text-xs text-slate-400">{i+1}</td>
                      <td className="py-1.5 pr-2 text-xs text-slate-700">{q}</td>
                      <td className="py-1.5 text-xs font-black text-center w-12"
                        style={{color:v===true?"#DC2626":"#10B981"}}>{v===true?"YES":v===false?"NO":"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="rounded-lg px-3 py-2 text-xs" style={{background:cssCl.color+"12",border:`1px solid ${cssCl.color}44`}}>
              <div className="flex justify-between items-center">
                <span className="font-black" style={{color:cssCl.color}}>Level {cssCl.level}/4 — {cssCl.label}</span>
                <span className="font-semibold text-slate-600">
                  {cssCl.level===0?"No clinical action required.":
                   cssCl.level===1?"Monitor. Safety check at next appointment.":
                   cssCl.level===2?"Active ideation — safety plan required. Review in 1 week.":
                   cssCl.level===3?"Ideation with plan — urgent clinical assessment today.":
                   "CRITICAL — Imminent risk. Immediate intervention and safety measures required."}
                </span>
              </div>
            </div>
          </div>

          {/* AUDIT-C */}
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Alcohol Use — AUDIT-C (WHO, Bush et al. 1998)</p>
            <table className="w-full mb-2">
              <tbody>
                {AUDITC.map((item,i)=>{
                  const v = responses.d4[`aud${i+1}`];
                  const sc = item.sc[v]??0;
                  return (
                    <tr key={i} style={{borderBottom:"1px solid #F8FAFC"}}>
                      <td className="py-1.5 pr-2 text-xs text-slate-700 leading-tight">{item.q}</td>
                      <td className="py-1.5 pr-2 text-xs text-slate-500 text-right">{v!==undefined?item.opts[v]:"—"}</td>
                      <td className="py-1.5 text-sm font-black text-center w-8" style={{color:sc>=2?"#DC2626":"#374151"}}>{sc}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:"2px solid #E2E8F0"}}>
                  <td className="py-1.5 text-xs font-black text-slate-700" colSpan={2}>AUDIT-C Total</td>
                  <td className="py-1.5 text-base font-black text-center" style={{color:audCl.color}}>{audCl.score}</td>
                </tr>
              </tbody>
            </table>
            <div className="rounded-lg px-3 py-2 text-xs" style={{background:audCl.color+"12",border:`1px solid ${audCl.color}44`}}>
              <span className="font-black" style={{color:audCl.color}}>{audCl.label} (Score {audCl.score}/12) — </span>
              <span className="text-slate-700">
                {audCl.score<=3?"No significant alcohol use detected.":
                 audCl.score<=7?"Hazardous use pattern. Brief intervention (BI) recommended at next clinical contact.":
                 "Harmful or dependent use. Structured brief intervention + referral to de-addiction services indicated. Consider CAGE or AUDIT-Full if further characterisation needed."}
              </span>
            </div>
          </div>

          {/* SDQ-CP */}
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Conduct — SDQ Conduct Subscale (Goodman, 1997)</p>
            <table className="w-full mb-2">
              <tbody>
                {SDQCP.map((item,i)=>{
                  const v = responses.d4[`sdq${i+1}`];
                  const sc = v!==undefined ? (item.rev?2-v:v) : 0;
                  return (
                    <tr key={i} style={{borderBottom:"1px solid #F8FAFC"}}>
                      <td className="py-1.5 pr-2 text-xs text-slate-700">{item.q}</td>
                      <td className="py-1.5 pr-2 text-xs text-slate-400 text-right">{v!==undefined?["Not True","Somewhat True","Certainly True"][v]:"—"}</td>
                      <td className="py-1.5 text-sm font-black text-center w-8">{sc}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:"2px solid #E2E8F0"}}>
                  <td className="py-1.5 text-xs font-black text-slate-700" colSpan={2}>SDQ-Conduct Total</td>
                  <td className="py-1.5 text-base font-black text-center"
                    style={{color:sdqTotal>=5?"#DC2626":sdqTotal>=3?"#D97706":"#059669"}}>{sdqTotal}</td>
                </tr>
              </tbody>
            </table>
            <div className="rounded-lg px-3 py-2 text-xs bg-slate-50 border border-slate-200">
              <span className="font-black" style={{color:sdqTotal>=5?"#DC2626":sdqTotal>=3?"#D97706":"#059669"}}>
                {sdqTotal>=5?"Elevated":sdqTotal>=3?"Borderline":"Normal"} ({sdqTotal}/10) — </span>
              <span className="text-slate-700">
                {sdqTotal>=5?"Elevated conduct symptomatology. Full SDQ or CBCL recommended. Consider ADHD comorbidity.":
                 sdqTotal>=3?"Borderline conduct concerns. Monitor and review in clinical context.":
                 "No significant conduct concerns identified on SDQ screening subscale."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Clinical Summary & Recommendations ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100" style={{background:"#F8FAFC"}}>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Clinical Summary & Recommendations</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label:"D1 Cognition",    val:`CQ ~${catResult.iq} · MA ~${catResult.ma} yrs · ${catResult.pctRank}th %ile`, note:catResult.label, color:"#3B82F6" },
            { label:"D2 Personality",  val:`N=T${Math.round(50+(+bfi.N-3)*10)} · C=T${Math.round(50+(+bfi.C-3)*10)} · E=T${Math.round(50+(+bfi.E-3)*10)}`, note:bfiDSM()[0], color:"#8B5CF6" },
            { label:"D3 Health",       val:`General=${duke.general} · Dep=${duke.depression} · Anx=${duke.anxiety}`, note:`SE=${duke.selfEsteem} · Phys=${duke.phys} · Social=${duke.social}`, color:"#10B981" },
            { label:"D4 Risk",         val:`C-SSRS Lv${cssCl.level} · AUDIT-C ${audCl.score}`, note:cssCl.label+" | "+audCl.label, color:cssCl.level>=2?"#DC2626":audCl.score>=4?"#F97316":"#10B981" },
          ].map(item=>(
            <div key={item.label} className="flex items-center gap-3 py-1.5 border-b border-slate-50">
              <span className="w-28 text-xs font-black" style={{color:item.color}}>{item.label}</span>
              <span className="text-xs font-bold text-slate-800 flex-1">{item.val}</span>
              <span className="text-xs text-slate-400 text-right">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Examiner Notes ── */}
      {mode==="assisted" && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-4">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Examiner Clinical Notes</p>
          <div className="space-y-3">
            {["Behavioural observations during assessment:","Affect and presentation:","Clinical impression:","Diagnosis (provisional):", "Recommended action / Referral:","Examiner signature / date:"].map(l=>(
              <div key={l}>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">{l}</p>
                <div className="h-7 border-b border-dashed border-slate-200"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Report Disclaimer ── */}
      <div className="rounded-xl p-3" style={{background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-500">Disclaimer:</strong> This psychometric screening report is intended for use by qualified mental health
          professionals. It does not constitute a clinical diagnosis under ICD-11 or DSM-5. All findings should be
          interpreted in the context of a full clinical assessment. Instrument citations: BFI-10 (Rammstedt & John, 2007);
          DUKE-17 (Parkerson et al., 1990); C-SSRS (Posner et al., 2011);
          AUDIT-C (Bush et al., 1998); SDQ (Goodman, 1997). Age-adjusted norms: NIMHANS/ICMR adapted reference data.
        </p>
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════════
// ║  UNIFIED: Landing, Bridge, Demographics, Combined Report      ║
// ══════════════════════════════════════════════════════════════════

// ── Landing Page ─────────────────────────────────────────────────
const LandingPage = ({ onStart }) => (
  <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f1f3d 0%,#1a3a6b 60%,#1e4d8c 100%)",
    fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", padding:"24px 16px 48px" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Mono:wght@400;500&display=swap');
      * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
      .font-mono { font-family: 'DM Mono', monospace; }
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes bobble{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
      @keyframes glow{0%,100%{box-shadow:0 0 16px rgba(96,165,250,0.3)}50%{box-shadow:0 0 28px rgba(96,165,250,0.6)}}
      button:active{transform:scale(0.97)}
      input:focus,select:focus{outline:none;border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.15)!important}
      @media print{.no-print{display:none!important}body{background:white!important}}
    `}</style>

    {/* Header */}
    <div style={{ textAlign:"center", marginBottom:32, animation:"fadeUp 0.5s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 4px 20px rgba(59,130,246,0.4)" }}>🧠</div>
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.22em", color:"#93c5fd", textTransform:"uppercase", fontWeight:700 }}>Central Institute of Behavioural Sciences</div>
          <div style={{ fontSize:20, fontWeight:900, color:"white", letterSpacing:"-0.02em" }}>CIBS Assessment Battery</div>
        </div>
      </div>
      <div style={{ fontSize:13, color:"#93c5fd", lineHeight:1.7, maxWidth:360, margin:"0 auto" }}>
        A comprehensive mental health screening platform combining projective and standardised assessments.
        Complete one or both instruments — your report is generated together at the end.
      </div>
    </div>

    {/* Two instrument cards */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, width:"100%", maxWidth:480, marginBottom:20, animation:"fadeUp 0.6s 0.1s ease both" }}>
      {/* VISTA card */}
      <button onClick={()=>onStart("vista")} style={{
        background:"linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))",
        border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:16, padding:"20px 14px",
        cursor:"pointer", textAlign:"left", color:"white", transition:"all 0.2s",
        backdropFilter:"blur(8px)" }}
        onMouseEnter={e=>{e.currentTarget.style.border="1.5px solid rgba(99,179,255,0.6)";e.currentTarget.style.background="linear-gradient(145deg,rgba(59,130,246,0.18),rgba(59,130,246,0.08))";}}
        onMouseLeave={e=>{e.currentTarget.style.border="1.5px solid rgba(255,255,255,0.15)";e.currentTarget.style.background="linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))";}}
      >
        <div style={{ fontSize:28, marginBottom:8 }}>🔷</div>
        <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.1em", color:"#93c5fd", textTransform:"uppercase", marginBottom:3 }}>CIBS-VISTA</div>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Visual Projective Test</div>
        <div style={{ fontSize:10, color:"#cbd5e1", lineHeight:1.6 }}>Non-verbal · 4 stages · ~8 min<br/>Shape · Colour · Shade · Smiley</div>
        <div style={{ marginTop:12, background:"rgba(59,130,246,0.25)", borderRadius:8, padding:"6px 10px",
          fontSize:10, color:"#93c5fd", fontWeight:700 }}>Start with VISTA →</div>
      </button>

      {/* VALID card */}
      <button onClick={()=>onStart("valid")} style={{
        background:"linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))",
        border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:16, padding:"20px 14px",
        cursor:"pointer", textAlign:"left", color:"white", transition:"all 0.2s",
        backdropFilter:"blur(8px)" }}
        onMouseEnter={e=>{e.currentTarget.style.border="1.5px solid rgba(167,139,250,0.6)";e.currentTarget.style.background="linear-gradient(145deg,rgba(139,92,246,0.18),rgba(139,92,246,0.08))";}}
        onMouseLeave={e=>{e.currentTarget.style.border="1.5px solid rgba(255,255,255,0.15)";e.currentTarget.style.background="linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))";}}
      >
        <div style={{ fontSize:28, marginBottom:8 }}>🔬</div>
        <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.1em", color:"#c4b5fd", textTransform:"uppercase", marginBottom:3 }}>CIBS-VALID</div>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Standardised Battery</div>
        <div style={{ fontSize:10, color:"#cbd5e1", lineHeight:1.6 }}>4 domains · ~62 items · ~22 min<br/>Cognition · Personality · Health · Risk</div>
        <div style={{ marginTop:12, background:"rgba(139,92,246,0.25)", borderRadius:8, padding:"6px 10px",
          fontSize:10, color:"#c4b5fd", fontWeight:700 }}>Start with VALID →</div>
      </button>
    </div>

    <div style={{ animation:"fadeUp 0.6s 0.2s ease both", textAlign:"center" }}>
      <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>— or —</div>
      <button onClick={()=>onStart("both")} style={{
        background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", color:"white",
        border:"none", borderRadius:12, padding:"13px 32px", fontSize:13, fontWeight:700,
        cursor:"pointer", letterSpacing:"0.01em", boxShadow:"0 4px 20px rgba(29,78,216,0.4)" }}>
        Take Both Tests Together ✦
      </button>
      <div style={{ fontSize:10, color:"#475569", marginTop:8 }}>
        Recommended for comprehensive assessment · One combined report
      </div>
    </div>

    <div style={{ marginTop:28, fontSize:10, color:"#334155", textAlign:"center", lineHeight:1.8, animation:"fadeUp 0.6s 0.3s ease both" }}>
      Dr Shailesh V. Pangaonkar, MD (Psychiatry) · CIBS, Nagpur<br/>
      For clinical & research use · Demographic details collected at the end
    </div>
  </div>
);

// ── VISTA Flow: Intro Screen ───────────────────────────────────────────────
// ── Multilingual stage instructions ──────────────────────────────────────────
const STAGE_INSTR = {
  en:{
    s1:"Select the shape you like most first, then rank the rest in order of preference",
    s2:"Select the colour you like most first, then rank the rest in order of preference",
    s3:"Select the shade you like most first, then rank the rest in order of preference",
    s4:"Select the expression that shows how you feel most, then rank the rest",
    introTitle:"CIBS-VISTA Visual Assessment",
    introSub:"A non-verbal psychological screening test. No right or wrong answers — just your genuine preference.",
    introSteps:["Seven shapes","Seven colours","Seven shades","Seven expressions"],
    introTime:"Approximately 8–12 minutes",
    beginBtn:"Begin VISTA →",
  },
  hi:{
    s1:"सबसे पहले जो आकृति आपको सबसे अधिक पसंद हो उसे चुनें, फिर बाकी को क्रम से चुनते जाएं",
    s2:"सबसे पहले जो रंग आपको सबसे अधिक पसंद हो उसे चुनें, फिर बाकी को क्रम से चुनते जाएं",
    s3:"सबसे पहले जो छाया आपको सबसे अधिक पसंद हो उसे चुनें, फिर बाकी को क्रम से चुनते जाएं",
    s4:"जो चेहरे का भाव आपके मनोभाव को सबसे अच्छे से दर्शाता हो उसे पहले चुनें, फिर बाकी को क्रम से चुनें",
    introTitle:"CIBS-VISTA दृश्य मूल्यांकन",
    introSub:"एक अशाब्दिक मनोवैज्ञानिक जाँच परीक्षण। कोई सही या गलत उत्तर नहीं — बस आपकी सच्ची प्राथमिकता।",
    introSteps:["सात आकृतियाँ","सात रंग","सात छायाएँ","सात भाव"],
    introTime:"लगभग 8–12 मिनट",
    beginBtn:"VISTA शुरू करें →",
  },
  mr:{
    s1:"तुम्हाला सर्वात जास्त आवडणारी आकृती आधी निवडा, नंतर बाकी क्रमाने निवडा",
    s2:"तुम्हाला सर्वात जास्त आवडणारा रंग आधी निवडा, नंतर बाकी क्रमाने निवडा",
    s3:"तुम्हाला सर्वात जास्त आवडणारी छाया आधी निवडा, नंतर बाकी क्रमाने निवडा",
    s4:"तुमचा मनोभाव सर्वात जास्त दर्शवणारा भाव आधी निवडा, नंतर बाकी क्रमाने निवडा",
    introTitle:"CIBS-VISTA दृश्य मूल्यमापन",
    introSub:"एक अशाब्दिक मनोवैज्ञानिक तपासणी चाचणी. कोणते बरोबर किंवा चुकीचे उत्तर नाही — फक्त तुमची खरी प्राधान्य.",
    introSteps:["सात आकार","सात रंग","सात छाया","सात भाव"],
    introTime:"साधारणतः 8–12 मिनिटे",
    beginBtn:"VISTA सुरू करा →",
  },
  bn:{
    s1:"প্রথমে যে আকৃতিটি আপনার সবচেয়ে বেশি পছন্দ সেটি বেছে নিন, তারপর বাকিগুলো পছন্দ অনুযায়ী সাজান",
    s2:"প্রথমে যে রঙটি আপনার সবচেয়ে বেশি পছন্দ সেটি বেছে নিন, তারপর বাকিগুলো পছন্দ অনুযায়ী সাজান",
    s3:"প্রথমে যে ছায়াটি আপনার সবচেয়ে বেশি পছন্দ সেটি বেছে নিন, তারপর বাকিগুলো পছন্দ অনুযায়ী সাজান",
    s4:"যে মুখের ভাবটি আপনার অনুভূতি সবচেয়ে বেশি প্রকাশ করে সেটি প্রথমে বেছে নিন",
    introTitle:"CIBS-VISTA দৃশ্যমান মূল্যায়ন",
    introSub:"একটি অ-মৌখিক মানসিক স্ক্রিনিং পরীক্ষা। কোনো সঠিক বা ভুল উত্তর নেই।",
    introSteps:["সাতটি আকৃতি","সাতটি রঙ","সাতটি ছায়া","সাতটি অভিব্যক্তি"],
    introTime:"প্রায় ৮–১২ মিনিট",
    beginBtn:"VISTA শুরু করুন →",
  },
  ta:{
    s1:"உங்களுக்கு மிகவும் பிடித்த வடிவத்தை முதலில் தேர்ந்தெடுங்கள், பின்னர் மற்றவற்றை விருப்பத்தின் படி தேர்வு செய்யுங்கள்",
    s2:"உங்களுக்கு மிகவும் பிடித்த நிறத்தை முதலில் தேர்ந்தெடுங்கள்",
    s3:"உங்களுக்கு மிகவும் பிடித்த நிழலை முதலில் தேர்ந்தெடுங்கள்",
    s4:"உங்கள் உணர்வை மிகவும் நன்றாக வெளிப்படுத்தும் வெளிப்பாட்டை முதலில் தேர்ந்தெடுங்கள்",
    introTitle:"CIBS-VISTA காட்சி மதிப்பீடு",
    introSub:"ஒரு வாய்மொழியற்ற மனோவியல் திரையிடல் சோதனை. சரி அல்லது தவறு இல்லை.",
    introSteps:["ஏழு வடிவங்கள்","ஏழு நிறங்கள்","ஏழு நிழல்கள்","ஏழு வெளிப்பாடுகள்"],
    introTime:"தோராயமாக 8–12 நிமிடங்கள்",
    beginBtn:"VISTA தொடங்கு →",
  },
  es:{
    s1:"Seleccione primero la forma que más le guste, luego clasifique las demás en orden de preferencia",
    s2:"Seleccione primero el color que más le guste, luego clasifique los demás en orden de preferencia",
    s3:"Seleccione primero el tono que más le guste, luego clasifique los demás en orden de preferencia",
    s4:"Seleccione primero la expresión que mejor refleje cómo se siente, luego clasifique las demás",
    introTitle:"Evaluación Visual CIBS-VISTA",
    introSub:"Una prueba de detección psicológica no verbal. Sin respuestas correctas ni incorrectas.",
    introSteps:["Siete formas","Siete colores","Siete tonos","Siete expresiones"],
    introTime:"Aproximadamente 8–12 minutos",
    beginBtn:"Comenzar VISTA →",
  },
};

const VistaIntroScreen = ({ onBegin, onBack, lang="en" }) => {
  const SI = STAGE_INSTR[lang] || STAGE_INSTR.en;
  return (
  <div style={{ minHeight:"100vh", background:"#e8ecf0", fontFamily:"'DM Sans',sans-serif", padding:"16px 8px 80px" }}>
    <style>{VISTA_G}</style>
    <div style={{ background:"white", borderRadius:12, padding:"18px 16px", maxWidth:540, width:"100%",
      margin:"0 auto", boxShadow:"0 2px 16px rgba(0,0,0,0.08)", animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:12, borderBottom:"2px solid #1e3a5f" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:13, padding:0 }}>← Back</button>
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"#64748b" }}>Shape · Colour · Shade · Smiley Test</div>
          <h1 style={{ margin:0, fontSize:17, color:"#1e3a5f", fontFamily:"Georgia,serif", fontWeight:700 }}>CIBS-VISTA</h1>
        </div>
      </div>
      <div style={{ background:"#f0f4f8", borderRadius:8, padding:"12px 14px", marginBottom:16, border:"1px solid #cbd5e1" }}>
        <div style={{ fontSize:9, fontWeight:700, color:"#1e3a5f", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Instructions for Examiner</div>
        <div style={{ fontSize:12, color:"#374151", lineHeight:1.85 }}>Present the screen to the subject. No verbal instructions about meaning are to be given. Simply say: <em>"Point to the one you like most. Then the next one. Keep going until all are done."</em></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7, marginBottom:18 }}>
        {[["STAGE I — Shapes","Seven geometric forms","#1e3a5f"],["STAGE II — Colours","Seven spectral colours","#b45309"],
          ["STAGE III — Shades","Seven shade gradations","#6d28d9"],["STAGE IV — Feelings","Seven facial expressions","#be185d"]].map(([t,sub,c])=>(
          <div key={t} style={{ borderRadius:8, padding:"10px", background:"#f8fafc", border:`1px solid ${c}22`, borderLeft:`3px solid ${c}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:c }}>{t}</div>
            <div style={{ fontSize:10, color:"#6b7280" }}>{sub}</div>
          </div>
        ))}
      </div>
      <button style={{ display:"block", width:"100%", padding:"14px", background:"#1e3a5f", color:"white", border:"none",
        borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
        onClick={onBegin}>{SI.beginBtn}</button>
    </div>
  </div>
  );
};

// ── Bridge Screen ──────────────────────────────────────────────────────────
const BridgeScreen = ({ completed, onContinue }) => {
  const isVista = completed === "vista";
  const next = isVista ? "VALID" : "VISTA";
  const icon = isVista ? "🔬" : "🔷";
  const color = isVista ? "#8b5cf6" : "#3b82f6";
  const desc = isVista
    ? "The CIBS-VALID standardised battery (4 domains, ~22 min) will give your report much greater depth — covering cognition, personality, health, and risk in detail."
    : "The CIBS-VISTA visual projective test (~8 min) adds personality, emotional, and risk dimensions through non-verbal stimulus responses.";

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f1f3d,#1a3a6b)", fontFamily:"'DM Sans',sans-serif",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
      <div style={{ maxWidth:420, width:"100%", textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#10b981,#059669)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px",
          boxShadow:"0 4px 24px rgba(16,185,129,0.4)", animation:"glow 2s infinite" }}>✓</div>
        <div style={{ fontSize:13, fontWeight:900, letterSpacing:"0.15em", color:"#10b981", textTransform:"uppercase", marginBottom:8 }}>
          {completed.toUpperCase()} Complete
        </div>
        <div style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:10 }}>
          Add {next} for a fuller picture?
        </div>
        <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.8, marginBottom:24 }}>{desc}</div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={onContinue} style={{
            background:`linear-gradient(135deg,${color},${color}cc)`, color:"white", border:"none",
            borderRadius:14, padding:"16px", fontSize:14, fontWeight:700, cursor:"pointer",
            boxShadow:`0 4px 20px ${color}44` }}>
            {icon} Yes, take {next} now →
          </button>

        </div>
        <div style={{ marginTop:16, fontSize:10, color:"#475569" }}>
          Both VISTA and VALID must be completed to generate your validation report.
        </div>
      </div>
    </div>
  );
};

// ── VALID Consent (simplified for battery context) ─────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
//  MULTILINGUAL INFORMED CONSENT  (ICH-GCP / ICMR compliant)
//  Languages: English · हिंदी · मराठी · বাংলা · தமிழ் · Español · Français
// ══════════════════════════════════════════════════════════════════════════════
const ICF_LANGS = {
  en: {
    name:"English", flag:"🇬🇧", dir:"ltr",
    title:"Informed Consent for Research Participation",
    subtitle:"CIBS-VISTA Validation Study",
    institution:"Central Institute of Behavioural Sciences, Nagpur",
    pi:"Principal Investigator: Dr Shailesh V. Pangaonkar, MD (Psychiatry)",
    ec:"Ethics Committee: Dr Rinki Rughwani Children Hospital, Nagpur",
    about:"CIBS-VISTA is a non-verbal visual screening instrument for mental health research. It uses your preference responses to shapes, colours, shades, and facial expressions to generate a psychological profile. This is a research-grade screening tool — not a diagnostic test.",
    sections:[
      {h:"Purpose",t:"The study aims to establish validity and reliability of the CIBS-VISTA instrument across diverse Indian and international populations. No reading or writing is required — the test is entirely visual."},
      {h:"Participation",t:"You will be shown four sets of images (shapes, colours, shades, facial expressions) and asked to tap or point to your preferred option. The test takes approximately 8–12 minutes."},
      {h:"Who may take this test",t:"Any individual of any age may participate. Children and adolescents may be enrolled by a parent or legal guardian. A clinician may administer on behalf of a patient with verbal consent."},
      {h:"Risks & Benefits",t:"There are no known physical risks. Some individuals may experience mild emotion during the facial expression stage — you may stop at any time. You will receive a free personalised screening report."},
      {h:"Confidentiality",t:"All data is strictly confidential. Your name will not appear in any publication. An anonymous UID replaces your identity in all records. Data retained for 10 years per ICMR guidelines."},
      {h:"Voluntary Participation",t:"Participation is entirely voluntary. You may withdraw at any time without penalty, loss of benefits, or effect on your care."},
      {h:"Contact",t:"Questions: pangaonkar11@gmail.com | +91 9423105228 | Ethics: ethics@cibs-nagpur.in"},
    ],
    items:[
      "I have read (or had read to me) this consent form and had the opportunity to ask questions.",
      "I understand this is a research screening tool — not a clinical diagnosis.",
      "I understand participation is voluntary and I may withdraw at any time without penalty.",
      "I understand my personal information will be kept strictly confidential.",
      "This assessment is being taken by the subject, by a parent/guardian on behalf of their child or ward, or by a clinician on behalf of their patient.",
      "I consent to participate (or give consent on behalf of my child / ward).",
    ],
    modeLabel:"Who is completing this form?",
    modes:["Self (adult or adolescent)","Parent / Guardian on behalf of child or ward","Clinician / Examiner on behalf of patient (verbal consent obtained)"],
    proceed:"I Consent — Begin Assessment →",
    mustTick:"Please tick all boxes to proceed.",
  },
  hi: {
    name:"हिंदी", flag:"🇮🇳", dir:"ltr",
    title:"अनुसंधान में भागीदारी के लिए सूचित सहमति",
    subtitle:"CIBS-VISTA प्रमाणन अध्ययन",
    institution:"केंद्रीय व्यवहार विज्ञान संस्थान, नागपुर",
    pi:"मुख्य अन्वेषक: डॉ. शैलेश वी. पानगावकर, एमडी (मनोचिकित्सा)",
    ec:"नैतिकता समिति: डॉ. रिंकी रुघवानी चिल्ड्रन हॉस्पिटल, नागपुर",
    about:"CIBS-VISTA मानसिक स्वास्थ्य अनुसंधान के लिए एक अशाब्दिक दृश्य जाँच उपकरण है। यह आकृतियों, रंगों, छायाओं और चेहरे के भावों के प्रति आपकी प्राथमिकता के आधार पर मनोवैज्ञानिक प्रोफ़ाइल बनाता है। यह एक शोध-स्तरीय जाँच उपकरण है — निदान परीक्षण नहीं।",
    sections:[
      {h:"उद्देश्य",t:"इस अध्ययन का उद्देश्य विविध भारतीय और अंतर्राष्ट्रीय जनसंख्या में CIBS-VISTA की वैधता और विश्वसनीयता स्थापित करना है। किसी पढ़ने या लिखने की आवश्यकता नहीं — परीक्षण पूरी तरह दृश्य-आधारित है।"},
      {h:"भागीदारी",t:"आपको चार प्रकार की छवियाँ (आकृतियाँ, रंग, छायाएँ, चेहरे के भाव) दिखाई जाएंगी और आपसे पसंदीदा विकल्प चुनने को कहा जाएगा। परीक्षण में लगभग 8–12 मिनट लगते हैं।"},
      {h:"कौन भाग ले सकता है",t:"किसी भी उम्र का व्यक्ति भाग ले सकता है। बच्चों को उनके माता-पिता या कानूनी अभिभावक द्वारा नामांकित किया जा सकता है।"},
      {h:"जोखिम और लाभ",t:"कोई ज्ञात शारीरिक जोखिम नहीं है। आप किसी भी समय रुक सकते हैं। आपको एक निःशुल्क व्यक्तिगत जाँच रिपोर्ट मिलेगी।"},
      {h:"गोपनीयता",t:"सभी डेटा सख्ती से गोपनीय है। आपका नाम किसी प्रकाशन में नहीं आएगा। एक गुमनाम UID का उपयोग होगा।"},
      {h:"स्वैच्छिक भागीदारी",t:"भागीदारी पूरी तरह स्वैच्छिक है। आप बिना किसी दंड के किसी भी समय वापस ले सकते हैं।"},
      {h:"संपर्क",t:"प्रश्नों के लिए: pangaonkar11@gmail.com | +91 9423105228"},
    ],
    items:[
      "मैंने यह सहमति फ़ॉर्म पढ़ा (या पढ़वाया) है और प्रश्न पूछने का अवसर मिला है।",
      "मैं समझता/समझती हूँ कि यह एक शोध जाँच उपकरण है — नैदानिक निदान नहीं।",
      "मैं समझता/समझती हूँ कि भागीदारी स्वैच्छिक है और मैं बिना दंड के वापस ले सकता/सकती हूँ।",
      "मैं समझता/समझती हूँ कि मेरी जानकारी गोपनीय रहेगी।",
      "यह मूल्यांकन स्वयं, या माता-पिता/अभिभावक द्वारा बच्चे/आश्रित की ओर से, या चिकित्सक द्वारा रोगी की ओर से लिया जा रहा है।",
      "मैं इस अध्ययन में भाग लेने के लिए सहमत हूँ (या अपने बच्चे/आश्रित की ओर से सहमति देता/देती हूँ)।",
    ],
    modeLabel:"यह फ़ॉर्म कौन भर रहा है?",
    modes:["स्वयं (वयस्क या किशोर)","माता-पिता / अभिभावक (बच्चे या आश्रित की ओर से)","चिकित्सक / परीक्षक (रोगी की ओर से, मौखिक सहमति के साथ)"],
    proceed:"मैं सहमत हूँ — मूल्यांकन शुरू करें →",
    mustTick:"कृपया आगे बढ़ने के लिए सभी बॉक्स पर टिक करें।",
  },
  mr: {
    name:"मराठी", flag:"🇮🇳", dir:"ltr",
    title:"संशोधनात सहभागासाठी माहितीपूर्ण संमती",
    subtitle:"CIBS-VISTA प्रमाणन अभ्यास",
    institution:"केंद्रीय वर्तणूक विज्ञान संस्था, नागपूर",
    pi:"मुख्य संशोधक: डॉ. शैलेश व्ही. पानगावकर, एमडी (मनोचिकित्सा)",
    ec:"नैतिकता समिती: डॉ. रिंकी रुघवानी चिल्ड्रन हॉस्पिटल, नागपूर",
    about:"CIBS-VISTA हे मानसिक आरोग्य संशोधनासाठी एक अशाब्दिक दृश्य तपासणी साधन आहे. आकार, रंग, छाया आणि चेहऱ्यावरील भावांबद्दलच्या आपल्या प्राधान्यांवर आधारित मनोवैज्ञानिक प्रोफाईल तयार करते. हे संशोधन-दर्जाचे तपासणी साधन आहे — निदान चाचणी नाही.",
    sections:[
      {h:"उद्देश",t:"या अभ्यासाचा उद्देश विविध भारतीय आणि आंतरराष्ट्रीय लोकसंख्येमध्ये CIBS-VISTA ची वैधता आणि विश्वासार्हता स्थापित करणे आहे. वाचन किंवा लेखन आवश्यक नाही — चाचणी पूर्णपणे दृश्यावर आधारित आहे."},
      {h:"सहभाग",t:"तुम्हाला चार प्रकारच्या प्रतिमा (आकार, रंग, छाया, चेहऱ्यावरील भाव) दाखवल्या जातील आणि पसंतीचा पर्याय निवडण्यास सांगितले जाईल. चाचणी साधारणतः 8–12 मिनिटे घेते."},
      {h:"कोण सहभागी होऊ शकते",t:"कोणत्याही वयाची व्यक्ती सहभागी होऊ शकते. मुलांना त्यांचे पालक किंवा कायदेशीर संरक्षक नोंदणी करू शकतात."},
      {h:"धोके आणि फायदे",t:"कोणतेही ज्ञात शारीरिक धोके नाहीत. तुम्ही कधीही थांबू शकता. तुम्हाला विनामूल्य वैयक्तिक तपासणी अहवाल मिळेल."},
      {h:"गोपनीयता",t:"सर्व डेटा कठोरपणे गोपनीय आहे. तुमचे नाव कोणत्याही प्रकाशनात येणार नाही. अनाम UID वापरला जाईल."},
      {h:"ऐच्छिक सहभाग",t:"सहभाग पूर्णपणे ऐच्छिक आहे. तुम्ही कोणत्याही वेळी दंडाशिवाय माघार घेऊ शकता."},
      {h:"संपर्क",t:"प्रश्नांसाठी: pangaonkar11@gmail.com | +91 9423105228"},
    ],
    items:[
      "मी हा संमती फॉर्म वाचला (किंवा वाचून घेतला) आहे आणि प्रश्न विचारण्याची संधी मिळाली आहे.",
      "मला समजते की हे संशोधन तपासणी साधन आहे — नैदानिक निदान नाही.",
      "मला समजते की सहभाग ऐच्छिक आहे आणि मी कोणत्याही वेळी दंडाशिवाय माघार घेऊ शकतो/शकते.",
      "मला समजते की माझी माहिती गोपनीय राहील.",
      "हे मूल्यमापन स्वतः, किंवा पालक/संरक्षकाने मुलाच्या/पाल्याच्या वतीने, किंवा चिकित्सकाने रुग्णाच्या वतीने घेतले जात आहे.",
      "मी या अभ्यासात सहभागी होण्यास सहमत आहे (किंवा माझ्या मुलाच्या/पाल्याच्या वतीने संमती देतो/देते).",
    ],
    modeLabel:"हा फॉर्म कोण भरत आहे?",
    modes:["स्वतः (प्रौढ किंवा किशोर)","पालक / संरक्षक (मुलाच्या किंवा पाल्याच्या वतीने)","चिकित्सक / परीक्षक (रुग्णाच्या वतीने, मौखिक संमतीसह)"],
    proceed:"मी संमती दिली आहे — मूल्यमापन सुरू करा →",
    mustTick:"पुढे जाण्यासाठी कृपया सर्व बॉक्स टिक करा.",
  },
  bn: {
    name:"বাংলা", flag:"🇧🇩", dir:"ltr",
    title:"গবেষণা অংশগ্রহণের জন্য অবহিত সম্মতি",
    subtitle:"CIBS-VISTA যাচাইকরণ গবেষণা",
    institution:"কেন্দ্রীয় আচরণবিদ্যা বিজ্ঞান প্রতিষ্ঠান, নাগপুর",
    pi:"প্রধান তদন্তকারী: ডা. শৈলেশ ভি. পাঙ্গাওনকার, এমডি",
    ec:"নৈতিকতা কমিটি: ডা. রিংকি রুঘওয়ানি শিশু হাসপাতাল, নাগপুর",
    about:"CIBS-VISTA মানসিক স্বাস্থ্য গবেষণার জন্য একটি অ-মৌখিক দৃশ্যমান স্ক্রীনিং যন্ত্র। এটি একটি গবেষণা-মানের স্ক্রীনিং টুল — ক্লিনিকাল ডায়াগনসিস নয়।",
    sections:[
      {h:"উদ্দেশ্য",t:"এই গবেষণার লক্ষ্য বিভিন্ন ভারতীয় ও আন্তর্জাতিক জনগোষ্ঠীতে CIBS-VISTA-র বৈধতা ও নির্ভরযোগ্যতা প্রতিষ্ঠা করা।"},
      {h:"অংশগ্রহণ",t:"চারটি সেট ভিজ্যুয়াল ইমেজ দেখানো হবে। পরীক্ষাটি প্রায় ৮-১২ মিনিট নেয়।"},
      {h:"গোপনীয়তা",t:"সব ডেটা কঠোরভাবে গোপনীয়। বেনামী UID ব্যবহার করা হবে।"},
      {h:"যোগাযোগ",t:"প্রশ্নের জন্য: pangaonkar11@gmail.com"},
    ],
    items:[
      "আমি এই সম্মতি ফর্মটি পড়েছি এবং প্রশ্ন করার সুযোগ পেয়েছি।",
      "আমি বুঝি এটি একটি গবেষণা স্ক্রীনিং টুল — ক্লিনিকাল ডায়াগনসিস নয়।",
      "আমি বুঝি অংশগ্রহণ স্বেচ্ছামূলক এবং যেকোনো সময় বিনা দণ্ডে প্রত্যাহার করতে পারি।",
      "আমার তথ্য গোপনীয় থাকবে।",
      "এই মূল্যায়নটি নিজে, বা পিতামাতা/অভিভাবক শিশুর পক্ষে, বা চিকিৎসক রোগীর পক্ষে নিচ্ছেন।",
      "আমি অংশগ্রহণে সম্মত।",
    ],
    modeLabel:"এই ফর্মটি কে পূরণ করছেন?",
    modes:["নিজে (প্রাপ্তবয়স্ক / কিশোর)","পিতামাতা / অভিভাবক (শিশুর পক্ষে)","চিকিৎসক / পরীক্ষক (মৌখিক সম্মতিসহ)"],
    proceed:"আমি সম্মতি দিয়েছি — মূল্যায়ন শুরু করুন →",
    mustTick:"এগিয়ে যেতে অনুগ্রহ করে সমস্ত বাক্সে টিক দিন।",
  },
  ta: {
    name:"தமிழ்", flag:"🇮🇳", dir:"ltr",
    title:"ஆராய்ச்சி பங்கேற்பிற்கான தகவலறிந்த சம்மதம்",
    subtitle:"CIBS-VISTA சரிபார்ப்பு ஆய்வு",
    institution:"மத்திய நடத்தை அறிவியல் நிறுவனம், நாக்பூர்",
    pi:"முக்கிய ஆராய்ச்சியாளர்: டாக்டர். ஷைலேஷ் பிவி. பங்காவோன்கர்",
    ec:"Ethics Committee: டாக்டர். ரிங்கி ருக்வானி குழந்தைகள் மருத்துவமனை, நாக்பூர்",
    about:"CIBS-VISTA மனநல ஆராய்ச்சிக்கான ஒரு வாய்மொழியற்ற காட்சி தகவல் கருவி. இது ஒரு ஆராய்ச்சி-தரமான கருவி — மருத்துவ நோயறிதல் அல்ல.",
    sections:[
      {h:"நோக்கம்",t:"இந்த ஆய்வு CIBS-VISTA-ன் செல்லுபடியான தன்மை மற்றும் நம்பகத்தன்மையை நிறுவுவதை நோக்கமாகக் கொண்டுள்ளது."},
      {h:"பங்கேற்பு",t:"நான்கு தொகுப்பு காட்சி படங்கள் காட்டப்படும். சோதனை சுமார் 8-12 நிமிடங்கள் ஆகும்."},
      {h:"தொடர்பு",t:"கேள்விகளுக்கு: pangaonkar11@gmail.com"},
    ],
    items:[
      "இந்த சம்மத படிவத்தை படித்தேன், கேள்வி கேட்கும் வாய்ப்பு கிடைத்தது.",
      "இது ஆராய்ச்சி கருவி என்று புரிகிறது — மருத்துவ நோயறிதல் அல்ல.",
      "பங்கேற்பு தன்னார்வமானது என்று புரிகிறது.",
      "என் தகவல்கள் இரகசியமாக இருக்கும்.",
      "இந்த மதிப்பீடு தன்னால், பெற்றோர்/பாதுகாவலரால் குழந்தையின் சார்பாக, அல்லது மருத்துவரால் நோயாளியின் சார்பாக எடுக்கப்படுகிறது.",
      "நான் பங்கேற்க சம்மதிக்கிறேன்.",
    ],
    modeLabel:"இந்த படிவத்தை யார் நிரப்புகிறார்கள்?",
    modes:["நேரில் (பெரியவர் / கிடைஞர்)","பெற்றோர் / பாதுகாவலர்","மருத்துவர் / தேர்வாளர்"],
    proceed:"நான் சம்மதித்தேன் — மதிப்பீடு தொடங்கு →",
    mustTick:"தொடர அனைத்து பெட்டிகளையும் டிக் செய்யவும்.",
  },
  es: {
    name:"Español", flag:"🇪🇸", dir:"ltr",
    title:"Consentimiento Informado para la Participación en la Investigación",
    subtitle:"Estudio de Validación CIBS-VISTA",
    institution:"Instituto Central de Ciencias del Comportamiento, Nagpur",
    pi:"Investigador Principal: Dr. Shailesh V. Pangaonkar, MD (Psiquiatría)",
    ec:"Comité de Ética: Hospital Infantil Dr. Rinki Rughwani, Nagpur",
    about:"CIBS-VISTA es un instrumento de detección visual no verbal para la investigación en salud mental. Es una herramienta de investigación — no un diagnóstico clínico.",
    sections:[
      {h:"Propósito",t:"El estudio tiene como objetivo establecer la validez y fiabilidad del instrumento CIBS-VISTA en diversas poblaciones indias e internacionales."},
      {h:"Participación",t:"Se mostrarán cuatro conjuntos de imágenes visuales. La prueba dura aproximadamente 8-12 minutos."},
      {h:"Contacto",t:"Preguntas: pangaonkar11@gmail.com"},
    ],
    items:[
      "He leído (o me han leído) este formulario y he tenido la oportunidad de hacer preguntas.",
      "Entiendo que esto es una herramienta de investigación — no un diagnóstico clínico.",
      "Entiendo que la participación es voluntaria y puedo retirarme en cualquier momento sin penalización.",
      "Mi información personal se mantendrá estrictamente confidencial.",
      "Esta evaluación es realizada por el sujeto, un padre/tutor en nombre de un menor, o un médico en nombre del paciente.",
      "Doy mi consentimiento para participar.",
    ],
    modeLabel:"¿Quién completa este formulario?",
    modes:["Yo mismo (adulto / adolescente)","Padre / Tutor (en nombre del menor)","Médico / Examinador (consentimiento verbal obtenido)"],
    proceed:"Doy mi consentimiento — Iniciar evaluación →",
    mustTick:"Por favor, marque todas las casillas para continuar.",
  },
};

const LANG_ORDER = ["en","hi","mr","bn","ta","es"];

const BatteryConsent = ({ onConsent }) => {
  const [lang, setLang] = useState("en");
  const [ticked, setTicked] = useState({});
  const [mode, setMode] = useState("");
  const [expanded, setExpanded] = useState(null);
  const L = ICF_LANGS[lang];
  const allTicked = L.items.every((_,i) => ticked[lang+i]) && mode !== "";

  const toggle = (i) => setTicked(t => ({...t, [lang+i]: !t[lang+i]}));

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4f8", fontFamily:"'DM Sans',sans-serif" }} dir={L.dir}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a2e4a,#2d4a7a)", color:"white", padding:"14px 16px" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div style={{ fontSize:9, letterSpacing:"0.18em", color:"#93c5fd", textTransform:"uppercase", marginBottom:2 }}>CIBS Assessment Battery · Research Consent</div>
          <div style={{ fontSize:15, fontWeight:900 }}>{L.title}</div>
          <div style={{ fontSize:11, color:"#bfdbfe", marginTop:2 }}>{L.subtitle}</div>
        </div>
      </div>

      {/* Language selector */}
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"10px 16px" }}>
        <div style={{ maxWidth:560, margin:"0 auto", display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:10, color:"#64748b", fontWeight:700, marginRight:4 }}>LANGUAGE:</span>
          {LANG_ORDER.map(k => (
            <button key={k} onClick={()=>{ setLang(k); setTicked({}); setMode(""); }}
              style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                background: lang===k ? "#1a2e4a" : "#f1f5f9",
                color: lang===k ? "white" : "#475569",
                border: lang===k ? "none" : "1px solid #e2e8f0" }}>
              {ICF_LANGS[k].flag} {ICF_LANGS[k].name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"16px" }}>
        {/* Study info card */}
        <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#1a2e4a", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>
            {L.institution}
          </div>
          <div style={{ fontSize:11, color:"#475569", marginBottom:4 }}>{L.pi}</div>
          <div style={{ fontSize:11, color:"#475569", marginBottom:10 }}>{L.ec}</div>
          <div style={{ fontSize:12, color:"#374151", lineHeight:1.7, padding:"10px", background:"#f8fafc", borderRadius:8, borderLeft:"3px solid #3b82f6" }}>
            {L.about}
          </div>
        </div>

        {/* Expandable sections */}
        <div style={{ marginBottom:12 }}>
          {L.sections.map((s,i) => (
            <div key={i} style={{ marginBottom:6, border:"1px solid #e2e8f0", borderRadius:10, overflow:"hidden" }}>
              <div onClick={()=>setExpanded(expanded===i?null:i)}
                style={{ padding:"10px 14px", background: expanded===i?"#eff6ff":"white",
                  display:"flex", justifyContent:"space-between", cursor:"pointer", fontWeight:700, fontSize:12, color:"#1e3a5f" }}>
                <span>{s.h}</span>
                <span style={{ color:"#3b82f6" }}>{expanded===i?"▲":"▼"}</span>
              </div>
              {expanded===i && (
                <div style={{ padding:"10px 14px", fontSize:12, color:"#374151", lineHeight:1.8, background:"#f8fafc", borderTop:"1px solid #e2e8f0" }}>
                  {s.t}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Who is completing */}
        <div style={{ background:"white", borderRadius:14, padding:14, marginBottom:12, border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#1a2e4a", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>
            {L.modeLabel}
          </div>
          {L.modes.map((m,i) => (
            <div key={i} onClick={()=>setMode(m)}
              style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", marginBottom:6,
                background: mode===m?"#eff6ff":"#f8fafc", borderRadius:10, cursor:"pointer",
                border:`1.5px solid ${mode===m?"#3b82f6":"#e2e8f0"}` }}>
              <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${mode===m?"#3b82f6":"#cbd5e1"}`,
                background: mode===m?"#3b82f6":"white", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {mode===m && <div style={{ width:7, height:7, borderRadius:"50%", background:"white" }}/>}
              </div>
              <span style={{ fontSize:12, color: mode===m?"#1e3a5f":"#374151", fontWeight: mode===m?700:400 }}>{m}</span>
            </div>
          ))}
        </div>

        {/* Tick boxes */}
        <div style={{ marginBottom:12 }}>
          {L.items.map((item,i) => (
            <div key={lang+i} onClick={()=>toggle(i)}
              style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 14px", marginBottom:8,
                background: ticked[lang+i]?"#f0fdf4":"white", borderRadius:12,
                border:`1.5px solid ${ticked[lang+i]?"#86efac":"#e2e8f0"}`, cursor:"pointer" }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${ticked[lang+i]?"#10b981":"#cbd5e1"}`,
                background: ticked[lang+i]?"#10b981":"white", flexShrink:0, marginTop:1,
                display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12 }}>
                {ticked[lang+i]?"✓":""}
              </div>
              <span style={{ fontSize:12, color:"#374151", lineHeight:1.7 }}>{item}</span>
            </div>
          ))}
        </div>

        {!allTicked && (
          <div style={{ textAlign:"center", fontSize:11, color:"#ef4444", marginBottom:8 }}>{L.mustTick}</div>
        )}

        <button onClick={()=>onConsent(lang)} disabled={!allTicked}
          style={{ display:"block", width:"100%", padding:"16px",
            background: allTicked?"linear-gradient(135deg,#1a2e4a,#2d4a7a)":"#e2e8f0",
            color: allTicked?"white":"#9ca3af", border:"none", borderRadius:14,
            fontSize:14, fontWeight:800, cursor: allTicked?"pointer":"default",
            boxShadow: allTicked?"0 4px 16px rgba(26,46,74,0.3)":"none" }}>
          {L.proceed}
        </button>

        <div style={{ marginTop:12, fontSize:10, color:"#94a3b8", textAlign:"center", lineHeight:1.6 }}>
          CIBS Assessment Battery · Version 1.0 · ICH-GCP / ICMR Compliant<br/>
          Ethics Approval: Dr Rinki Rughwani Children Hospital, Nagpur
        </div>
      </div>
    </div>
  );
};

// ── Unified Demographics Form ──────────────────────────────────────────────
const UnifiedDemographics = ({ vistaComplete, validComplete, onComplete }) => {
  const [form, setForm] = useState({ name:"", age:"", gender:"", mobile:"", edu:"", language:"", setting:"", purpose:"", examiner:"", email:"", ref:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const canProceed = form.age && form.gender && (form.mobile.length === 10 || form.ref.trim().length > 0);
  const uid = generateLocalUID(form.mobile, "", form.gender);

  const LBL = { display:"block", fontSize:10, fontWeight:700, color:"#1a2e4a", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 };
  const INP = { width:"100%", padding:"10px 12px", border:"1.5px solid #cbd5e1", borderRadius:10, fontSize:13,
    fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", background:"#fafafa", color:"#0f172a" };

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#1a2e4a,#2d4a7a)", color:"white", padding:"16px", textAlign:"center", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ fontSize:9, letterSpacing:"0.18em", color:"#93c5fd", textTransform:"uppercase" }}>
          {vistaComplete && validComplete ? "VISTA + VALID" : vistaComplete ? "VISTA" : "VALID"} Assessment Complete
        </div>
        <div style={{ fontSize:16, fontWeight:900 }}>Subject Details & Report Generation</div>
        <div style={{ fontSize:11, color:"#93c5fd", marginTop:2 }}>These details personalise your report. Only the UID is stored.</div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"20px 16px 60px" }}>

        {/* Instruments completed badges */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {vistaComplete && <div style={{ background:"#eff6ff", border:"1px solid #93c5fd", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, color:"#1d4ed8" }}>✓ VISTA Complete</div>}
          {validComplete && <div style={{ background:"#f5f3ff", border:"1px solid #c4b5fd", borderRadius:8, padding:"6px 12px", fontSize:11, fontWeight:700, color:"#6d28d9" }}>✓ VALID Complete</div>}
        </div>

        {/* Privacy notice */}
        <div style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#1d4ed8", marginBottom:3 }}>🔒 Your Privacy</div>
          <div style={{ fontSize:11, color:"#1e40af", lineHeight:1.7 }}>
            Your name and contact details are used only to generate your unique UID and personalise this report.
            They are never stored in the research database. Only the anonymous UID is recorded.
          </div>
        </div>

        {/* Core fields */}
        <div style={{ background:"white", borderRadius:14, padding:"16px", marginBottom:14, border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#1a2e4a", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Subject Information</div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={LBL}>Full Name (optional)</label><input style={INP} placeholder="Anonymous Participant" value={form.name} onChange={e=>f("name",e.target.value)}/></div>
            <div><label style={LBL}>Age (years) *</label><input style={INP} type="number" min={3} max={120} placeholder="—" value={form.age} onChange={e=>f("age",e.target.value)}/></div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={LBL}>Gender *</label>
            <div style={{ display:"flex", gap:7 }}>
              {["Male","Female","Other","Prefer not to say"].map(g=>(
                <button key={g} onClick={()=>f("gender",g)} style={{
                  flex:1, padding:"9px 4px", borderRadius:9, fontSize:11, fontWeight:700, cursor:"pointer",
                  border: form.gender===g?"2px solid #1a2e4a":"2px solid #e2e8f0",
                  background: form.gender===g?"#1a2e4a":"white",
                  color: form.gender===g?"white":"#94a3b8" }}>
                  {g==="Prefer not to say"?"N/S":g}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={LBL}>Mobile * (10 digits)</label><input style={INP} type="tel" maxLength={10} placeholder="9876543210" value={form.mobile} onChange={e=>f("mobile",e.target.value)}/></div>
            <div><label style={LBL}>Email (optional)</label><input style={INP} type="email" placeholder="you@email.com" value={form.email} onChange={e=>f("email",e.target.value)}/></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={LBL}>Education</label>
              <select style={INP} value={form.edu} onChange={e=>f("edu",e.target.value)}>
                <option value="">— Select —</option>
                {["Illiterate","Primary (Class 5)","Secondary (Class 10)","Higher Secondary","Graduate","Post-Graduate"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={LBL}>Language</label>
              <select style={INP} value={form.language} onChange={e=>f("language",e.target.value)}>
                <option value="">— Select —</option>
                {["Non-verbal","Hindi","Marathi","Bengali","Tamil","Telugu","English","Other"].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Clinical context */}
        <div style={{ background:"white", borderRadius:14, padding:"16px", marginBottom:14, border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#1a2e4a", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Clinical Context</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={LBL}>Examiner Name</label><input style={INP} placeholder="Clinician / ASHA worker" value={form.examiner} onChange={e=>f("examiner",e.target.value)}/></div>
            <div>
              <label style={LBL}>Setting</label>
              <select style={INP} value={form.setting} onChange={e=>f("setting",e.target.value)}>
                <option value="">— Select —</option>
                {["Primary Health Centre","Community Outreach","Hospital OPD","Home Visit","School / Anganwadi","Residential / Inpatient","Research","Other"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={LBL}>Purpose</label>
              <select style={INP} value={form.purpose} onChange={e=>f("purpose",e.target.value)}>
                <option value="">— Select —</option>
                {["Routine Screening","Cognitive Assessment","Mental Health Evaluation","Risk Assessment","Follow-up","Research / Validation"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label style={LBL}>Clinician Code / Study Ref</label><input style={INP} placeholder="e.g. CIBS-2025-001" value={form.ref} onChange={e=>f("ref",e.target.value)}/></div>
          </div>
        </div>

        {/* UID preview */}
        {canProceed && (
          <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:"12px 14px", marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#15803d", marginBottom:3 }}>Your Anonymous UID</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:16, fontWeight:900, color:"#166534" }}>{uid}</div>
            <div style={{ fontSize:10, color:"#16a34a" }}>This code identifies your record without revealing your identity.</div>
          </div>
        )}

        <button onClick={()=>onComplete({...form, uid})} disabled={!canProceed}
          style={{ display:"block", width:"100%", padding:"16px", borderRadius:14,
            background: canProceed ? "linear-gradient(135deg,#1a2e4a,#2d4a7a)" : "#e2e8f0",
            color: canProceed ? "white" : "#9ca3af", border:"none",
            fontSize:15, fontWeight:900, cursor: canProceed ? "pointer" : "default",
            boxShadow: canProceed ? "0 4px 20px rgba(26,46,74,0.4)" : "none" }}>
          Generate My Report →
        </button>
      </div>
    </div>
  );
};

// ── Combined Report ────────────────────────────────────────────────────────
const CombinedReport = ({ vistaSeqs, vistaResults, validResp, demographics }) => {
  const [tab, setTab] = useState("selfRpt");
  const [printing, setPrinting] = useState(false);

  // Compute VALID scores if VALID was taken
  const bfi      = validResp ? scoreBFI(validResp.d2) : null;
  const duke     = validResp ? scoreDuke(validResp.d3) : null;
  const cssCl    = validResp ? scoreCSS(Object.fromEntries(CSSRS.map((_,i)=>[`css${i+1}`, validResp.d4[`css${i+1}`]]))) : null;
  const audCl    = validResp ? scoreAUDIT(Object.fromEntries(AUDITC.map((_,i)=>[`${i}`, validResp.d4[`aud${i+1}`]??0]))) : null;
  const catResult = validResp ? scoreCAT(validResp.d1) : null;
  const ageNorms  = getAgeNorms(demographics?.age);

  const participant = {
    name: demographics.name, age: demographics.age, gender: demographics.gender,
    edu: demographics.edu, language: demographics.language, setting: demographics.setting,
    purpose: demographics.purpose
  };
  const examiner = demographics.examiner;

  const hasBoth = vistaResults && validResp;

  // Cross-instrument summary data
  const getCross = () => {
    if (!hasBoth) return null;
    const vCQ = vistaResults.clinical.d1.CQ;
    const vCQ_raw = vistaResults.clinical.d1.CQ;
    const valCQ = catResult.iq;
    const cqDiff = Math.abs(vCQ - valCQ);
    const cqConcordant = cqDiff <= 10;
    const vN = vistaResults.clinical.d2.BFt.N;
    const valN = Math.round(50 + (parseFloat(bfi.N) - 3) * 10);
    const nConcordant = Math.abs(vN - valN) <= 12;
    const vDep = vistaResults.clinical.d4.depIdx;
    const valDep = duke.depression;
    const depConcordant = (vDep > 45) === (valDep > 25);
    const vSIR = vistaResults.clinical.d5.SIR.flag;
    const valCSS = cssCl.level;
    const riskConcordant = (vSIR >= 2) === (valCSS >= 2);
    return { vCQ, valCQ, cqDiff, cqConcordant, vN, valN, nConcordant, vDep, valDep, depConcordant, vSIR, valCSS, riskConcordant };
  };
  const cross = getCross();

  const tabs = [
    { id:"selfRpt",  label:"📋 For You",        color:"#059669" },
    { id:"clinRpt",  label:"🏥 For Clinician",  color:"#1e3a5f" },
    ...(hasBoth ? [{ id:"cross", label:"📊 Combined Analysis", color:"#0e7490" }] : []),
  ];

  const today = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

  return (
    <div style={{ minHeight:"100vh", background:"#e8ecf0", fontFamily:"'DM Sans',sans-serif" }} className="no-print-bg">
      <style>{VISTA_G}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;900&family=DM+Mono:wght@400;500&display=swap');
        .font-mono{font-family:'DM Mono',monospace}
        .text-xs{font-size:12px}.text-sm{font-size:13px}.text-base{font-size:15px}
        .font-black{font-weight:900}.font-bold{font-weight:700}.font-semibold{font-weight:600}
        .text-gray-400{color:#9ca3af}.text-gray-500{color:#6b7280}.text-gray-600{color:#4b5563}
        .text-gray-700{color:#374151}.text-gray-800{color:#1f2937}
        .text-blue-300{color:#93c5fd}.text-purple-600{color:#9333ea}
        .min-h-screen{min-height:100vh}.bg-gray-50{background:#f9fafb}.bg-white{background:white}
        .border-b{border-bottom:1px solid #e5e7eb}.border-gray-200{border-color:#e5e7eb}
        .px-4{padding-left:16px;padding-right:16px}.py-3{padding-top:12px;padding-bottom:12px}
        .py-1\\.5{padding-top:6px;padding-bottom:6px}.px-3{padding-left:12px;padding-right:12px}
        .rounded-lg{border-radius:8px}.rounded-xl{border-radius:12px}.rounded-2xl{border-radius:16px}
        .flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:justify-between}
        .gap-2{gap:8px}.gap-1{gap:4px}.space-y-4>*+*{margin-top:16px}
        .p-4{padding:16px}.pb-12{padding-bottom:48px}.max-w-sm{max-width:384px}.mx-auto{margin:0 auto}
        .sticky{position:sticky}.top-0{top:0}.z-20{z-index:20}
        .transition-all{transition:all 0.2s}
        .w-full{width:100%}.flex-1{flex:1}
        .mb-0\\.5{margin-bottom:2px}.mb-1{margin-bottom:4px}.mt-0\\.5{margin-top:2px}
        .text-white{color:white}.leading-relaxed{line-height:1.625}
        @media print{.no-print{display:none!important}body{background:white!important}}
      `}</style>

      {/* Sticky tab bar */}
      <div className="no-print" style={{ background:"white", borderBottom:"1px solid #e5e7eb", padding:"10px 16px", position:"sticky", top:0, zIndex:30 }}>
        <div style={{ maxWidth:760, margin:"0 auto", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, fontWeight:900, color:"#1a2e4a", marginRight:4 }}>CIBS Report</span>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
              background: tab===t.id ? t.color : "#f1f5f9",
              color: tab===t.id ? "white" : "#64748b",
              transition:"all 0.15s" }}>
              {t.label}
            </button>
          ))}
          <button onClick={()=>{setPrinting(true);setTimeout(()=>{window.print();setPrinting(false);},200)}}
            style={{ marginLeft:"auto", padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700,
              background:"#1a2e4a", color:"white", border:"none", cursor:"pointer" }}>
            {printing?"...":"🖨 Print / PDF"}
          </button>
        </div>
      </div>

      {/* ── FOR YOU report (self-assessment prose) ──────────────────── */}
      {tab==="selfRpt" && (
        <div style={{ maxWidth:560, margin:"0 auto", padding:"16px 16px 60px" }}>

          {/* Header card */}
          <div style={{ background:"linear-gradient(135deg,#059669,#047857)", borderRadius:16, padding:20, color:"white", marginBottom:16 }}>
            <div style={{ fontSize:9, letterSpacing:"0.18em", color:"#a7f3d0", textTransform:"uppercase", marginBottom:4 }}>CIBS Assessment · Personal Report</div>
            <div style={{ fontSize:18, fontWeight:900, marginBottom:4 }}>{demographics.name || "Your Results"}</div>
            <div style={{ fontSize:12, color:"#d1fae5" }}>
              {demographics.age ? `Age ${demographics.age}` : ""}{demographics.gender ? ` · ${demographics.gender}` : ""}
              {demographics.edu ? ` · ${demographics.edu}` : ""}
            </div>
            <div style={{ marginTop:10, display:"flex", gap:6, flexWrap:"wrap" }}>
              {vistaResults && <span style={{ fontSize:10, background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"3px 10px" }}>VISTA ✓</span>}
              {validResp    && <span style={{ fontSize:10, background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"3px 10px" }}>VALID ✓</span>}
            </div>
          </div>

          {/* Important note */}
          <div style={{ background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:11, color:"#92400e", lineHeight:1.7 }}>
            <strong>Please note:</strong> This is a personal summary of your screening results. It is not a clinical diagnosis. Please share this report with a qualified mental health professional for proper interpretation.
          </div>

          {/* Cognitive domain */}
          {(vistaResults || catResult) && (() => {
            const vCQ = vistaResults?.clinical?.d1?.CQ;
            const vCQLabel = vistaResults?.clinical?.d1?.CQLabel;
            const vMA = vistaResults?.clinical?.d1?.mentalAge;
            return (
              <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🧩</div>
                  <div style={{ fontWeight:800, color:"#1e3a5f", fontSize:14 }}>Your Thinking & Reasoning</div>
                </div>
                {vistaResults && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:catResult?10:0 }}>
                    <strong>From the visual test:</strong> Your pattern of visual preferences suggests a cognitive style associated with a CQ estimate of {vCQ} ({vCQLabel}).{" "}
                    {vCQ>=115?"This places you in the above-average to superior range for reasoning and pattern recognition.":
                     vCQ>=100?"This is in the solid average range — reliable, practical reasoning.":
                     vCQ>=85?"This suggests steady, concrete thinking — particularly effective in familiar, practical situations.":
                     "This result suggests some difficulty with abstract visual patterns today. Context, stress, and many other factors influence this score."}
                  </div>
                )}
                {catResult && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8 }}>
                    <strong>From the reasoning test:</strong> You scored at the {catResult.pctRank}th percentile on the non-verbal reasoning patterns, with a Mental Age equivalent of approximately {catResult.ma} years ({catResult.label}).{" "}
                    {catResult.iq>=115?"This is an exceptional result — you process complex patterns quickly and accurately.":
                     catResult.iq>=100?"You handled the progressive reasoning tasks well — above average performance.":
                     catResult.iq>=85?"You performed at a solid, practical level on these reasoning tasks.":
                     "The reasoning tasks were challenging today — this is not a measure of your overall intelligence, and practice makes a big difference."}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Personality domain */}
          {(vistaResults || bfi) && (() => {
            const vD2 = vistaResults?.clinical?.d2;
            return (
              <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🪞</div>
                  <div style={{ fontWeight:800, color:"#5b21b6", fontSize:14 }}>Your Personality Style</div>
                </div>
                {vD2 && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:bfi?10:0 }}>
                    <strong>From the visual test:</strong> Your choices suggest a personality pattern broadly consistent with {vD2.bigFiveNarrative||"your unique personality organisation"}.{" "}
                    {vD2.BFt?.N>=55 ? "You may experience emotions quite intensely — this sensitivity is also a source of creativity and empathy. " : "You tend to be emotionally steady and resilient under pressure. "}
                    {vD2.BFt?.E>=55 ? "You draw energy from social engagement." : "You recharge through quiet and solitude."}
                  </div>
                )}
                {bfi && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8 }}>
                    <strong>From the questionnaire:</strong>{" "}
                    {bfi.O>3?"You are curious and open to new experiences. ":"You prefer familiar, practical approaches. "}
                    {bfi.C>3?"You are organised and self-disciplined — a real strength for achieving goals. ":"You tend to be flexible and adaptable — excellent in dynamic environments. "}
                    {bfi.E>3?"You are sociable and energised by people. ":"You are reflective and self-sufficient. "}
                    {bfi.A>3?"You are warm, cooperative, and value harmony. ":"You are direct and independent-minded. "}
                    {bfi.N>3?"Emotional sensitivity is part of your nature — managing this with support and self-care is key.":"You are emotionally stable and resilient."}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Emotional & Health domain */}
          {(vistaResults || duke) && (() => {
            const vD3 = vistaResults?.clinical?.d3;
            const vD4 = vistaResults?.clinical?.d4;
            return (
              <div style={{ background:"white", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💚</div>
                  <div style={{ fontWeight:800, color:"#065f46", fontSize:14 }}>Your Emotional & Physical Wellbeing</div>
                </div>
                {vD3 && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:(vD4||duke)?10:0 }}>
                    <strong>Emotional intelligence (visual test):</strong> Your EQSS score of {vD3.EQSS} ({vD3.EQlabel}) suggests{" "}
                    {vD3.EQSS>=115?"a strong capacity for emotional awareness, empathy, and managing your own feelings effectively.":
                     vD3.EQSS>=85?"a reasonable emotional balance with good coping capacity in most situations.":
                     "some areas where emotional support and skill-building could be very beneficial."}
                  </div>
                )}
                {duke && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8, marginBottom:vD4?10:0 }}>
                    <strong>Health (questionnaire):</strong> Your overall health score is {duke.general}/100.{" "}
                    {duke.general>=70?"This reflects generally good wellbeing across physical, mental, and social dimensions.":
                     duke.general>=50?"Your wellbeing is moderate — there are specific areas worth giving more attention to.":
                     "Your overall wellbeing score suggests you may be going through a difficult period. Please do speak with someone you trust or a health professional."}
                    {duke.mental<60?" Your mental health subscale suggests some emotional strain that deserves attention.":""}
                    {duke.phys<60?" Your physical health subscale is below average — it may be worth discussing this with your doctor.":""}
                    {duke.social<60?" Social support appears low — connection and community can be a powerful buffer against stress.":""}
                  </div>
                )}
                {vD4 && (
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.8 }}>
                    <strong>Mood indicators (visual test):</strong>{" "}
                    {vD4.depIdx>=55?"The visual test picks up some signs of low mood or depressive colouring. This is common and treatable — please talk to someone.":
                     "No significant signs of depression were detected in your visual responses."}
                    {" "}{vD4.anxIdx>=55?"There appear to be some anxiety indicators in your responses — managing stress actively would help.":""}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Risk domain — shown only if elevated */}
          {(() => {
            const vD5 = vistaResults?.clinical?.d5;
            const hasRisk = (vD5 && (vD5.SIR?.flag>=2 || vD5.SUR?.flag>=2 || vD5.CDR?.flag>=2)) ||
                            (cssCl && cssCl.level>=2) || (audCl && audCl.level>=2);
            if (!hasRisk) return (
              <div style={{ background:"#f0fdf4", borderRadius:14, padding:14, marginBottom:12, border:"1px solid #bbf7d0" }}>
                <div style={{ fontSize:13, color:"#065f46", lineHeight:1.7 }}>
                  <strong>✅ Risk screening:</strong> No significant risk indicators were detected in this assessment. This is reassuring — continue the healthy habits that support your wellbeing.
                </div>
              </div>
            );
            return (
              <div style={{ background:"#fff1f2", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #fecdd3" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚠️</div>
                  <div style={{ fontWeight:800, color:"#991b1b", fontSize:14 }}>Some Areas Need Attention</div>
                </div>
                <div style={{ fontSize:13, color:"#7f1d1d", lineHeight:1.8 }}>
                  This screening has flagged some indicators that suggest you may benefit from professional support.{" "}
                  {vD5?.SIR?.flag>=2?"There are some emotional distress indicators that are important to discuss with a mental health professional. ":""}
                  {vD5?.SUR?.flag>=2 || audCl?.level>=2?"Substance use indicators were detected — please speak openly with your doctor about this. ":""}
                  <br/><strong>Please share this report with a trusted doctor or mental health professional.</strong>
                </div>
              </div>
            );
          })()}

          {/* Closing message */}
          <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2d5a8e)", borderRadius:14, padding:16, color:"white", marginBottom:16, fontSize:12, lineHeight:1.8 }}>
            <strong>Remember:</strong> This screening report is a starting point — not a final verdict. Your scores reflect a snapshot of today, shaped by many factors. Use this report as a conversation-starter with a clinician, not as a label or diagnosis. You are more than any score.
          </div>

          <div style={{ fontSize:10, color:"#94a3b8", textAlign:"center", lineHeight:1.6 }}>
            CIBS Assessment Battery · Central Institute of Behavioural Sciences, Nagpur<br/>
            For clinical interpretation, please consult Dr Shailesh V. Pangaonkar MD | pangaonkar11@gmail.com
          </div>
        </div>
      )}

      {/* ── FOR CLINICIAN report (lab-style, all parameters) ──────────── */}
      {tab==="clinRpt" && (
        <div style={{ maxWidth:760, margin:"0 auto", padding:"0 0 60px" }}>
          {/* Use existing VistaClinicalReport for VISTA data if available */}
          {vistaResults && (
            <VistaClinicalReport clinical={vistaResults.clinical} narratives={vistaResults.narratives}
              participant={participant} reportId={vistaResults.reportId} examiner={examiner}/>
          )}
          {/* Append VALID clinical parameters as a structured addendum */}
          {validResp && (() => {
            const Row = ({label,value,ref,interp,flag}) => (
              <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                <td style={{ padding:"8px 10px", fontSize:12, color:"#374151", fontWeight:600, width:"35%" }}>{label}</td>
                <td style={{ padding:"8px 10px", fontSize:13, fontWeight:900, color: flag?"#dc2626":"#111827", width:"20%" }}>{value}</td>
                <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280", width:"20%" }}>{ref}</td>
                <td style={{ padding:"8px 10px", fontSize:11, color: flag?"#991b1b":"#374151", lineHeight:1.5 }}>{interp}</td>
              </tr>
            );
            return (
              <div style={{ background:"white", padding:"24px 28px", borderTop:"4px solid #6d28d9" }}>
                {/* VALID Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, paddingBottom:16, borderBottom:"2px solid #1a2e4a" }}>
                  <div>
                    <div style={{ fontSize:10, color:"#6d28d9", fontWeight:900, letterSpacing:"0.15em", textTransform:"uppercase" }}>CIBS-VALID Standardised Battery</div>
                    <div style={{ fontSize:16, fontWeight:900, color:"#1a2e4a" }}>Clinical Parameters Report</div>
                    <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Multi-Domain Validated Scales · {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
                  </div>
                  <div style={{ textAlign:"right", fontSize:11 }}>
                    <div style={{ fontWeight:700 }}>{demographics.name||"Anonymous"}</div>
                    <div style={{ color:"#6b7280" }}>Age {demographics.age} · {demographics.gender}</div>
                    <div style={{ color:"#6b7280" }}>UID: {demographics.uid||"—"}</div>
                  </div>
                </div>

                {/* D1: Cognition — Ravens CAT */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:900, color:"#1d4ed8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, paddingBottom:4, borderBottom:"1px solid #dbeafe" }}>
                    D1 · Cognition — Raven's Adaptive Test (CAT)
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Parameter","Score","Reference","Interpretation"].map(h=>(
                        <th key={h} style={{ padding:"6px 10px", fontSize:10, color:"#6b7280", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.06em", textAlign:"left" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      <Row label="CQ (Cognitive Quotient)" value={catResult.iq} ref="85–115 average" interp={catResult.label} flag={catResult.iq<70||catResult.iq>130}/>
                      <Row label="Mental Age Equivalent" value={`~${catResult.ma} yrs`} ref={`CA: ${demographics.age||"?"} yrs`} interp={`${catResult.pctRank}th percentile`}/>
                      <Row label="Band Reached" value={catResult.band===1?"B1 Foundation":catResult.band===2?"B2 Standard":catResult.band===3?"B3 Advanced":"B4 Exceptional"} ref="B1–B4" interp={`${catResult.totalCorrect}/${catResult.totalQ} correct`}/>
                    </tbody>
                  </table>
                </div>

                {/* D2: Personality — BFI-10 */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:900, color:"#7c3aed", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, paddingBottom:4, borderBottom:"1px solid #ede9fe" }}>
                    D2 · Personality — BFI-10 (Big Five Inventory)
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Trait","Raw (1–5)","T-Score","Range"].map(h=>(
                        <th key={h} style={{ padding:"6px 10px", fontSize:10, color:"#6b7280", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.06em", textAlign:"left" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[["Openness (O)",bfi.O,Math.round(50+(bfi.O-3)*10)],
                        ["Conscientiousness (C)",bfi.C,Math.round(50+(bfi.C-3)*10)],
                        ["Extraversion (E)",bfi.E,Math.round(50+(bfi.E-3)*10)],
                        ["Agreeableness (A)",bfi.A,Math.round(50+(bfi.A-3)*10)],
                        ["Neuroticism (N)",bfi.N,Math.round(50+(bfi.N-3)*10)],
                      ].map(([trait,raw,t])=>(
                        <tr key={trait} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"8px 10px", fontSize:12, color:"#374151", fontWeight:600 }}>{trait}</td>
                          <td style={{ padding:"8px 10px", fontSize:13, fontWeight:900, color:"#111827" }}>{raw?.toFixed?.(1)||"—"}</td>
                          <td style={{ padding:"8px 10px", fontSize:13, fontWeight:900, color: t>=55?"#dc2626":t<=45?"#2563eb":"#374151" }}>{t}</td>
                          <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>{t>=55?"Elevated":t<=45?"Reduced":"Average"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* D3: Health — Duke-17 */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:900, color:"#059669", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, paddingBottom:4, borderBottom:"1px solid #d1fae5" }}>
                    D3 · Health — Duke Health Profile (DUKE-17)
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Subscale","Score /100","Threshold","Status"].map(h=>(
                        <th key={h} style={{ padding:"6px 10px", fontSize:10, color:"#6b7280", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.06em", textAlign:"left" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[
                        ["Overall Health",duke.general,"≥60 normal",duke.general<60],
                        ["Mental Health",duke.mental,"≥60 normal",duke.mental<60],
                        ["Physical Health",duke.phys,"≥60 normal",duke.phys<60],
                        ["Social Health",duke.social,"≥60 normal",duke.social<60],
                        ["Self-Esteem",duke.selfEsteem,"≥60 normal",duke.selfEsteem<60],
                        ["Anxiety",duke.anxiety,"<40 normal",duke.anxiety>40],
                        ["Depression",duke.depression,"<40 normal",duke.depression>40],
                        ["Pain",duke.pain,"<40 normal",duke.pain>40],
                        ["Disability",duke.disability,"<40 normal",duke.disability>40],
                      ].map(([label,val,ref,flag])=>(
                        <tr key={label} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"8px 10px", fontSize:12, color:"#374151", fontWeight:600 }}>{label}</td>
                          <td style={{ padding:"8px 10px", fontSize:13, fontWeight:900, color:flag?"#dc2626":"#111827" }}>{val}</td>
                          <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>{ref}</td>
                          <td style={{ padding:"8px 10px", fontSize:11, color:flag?"#991b1b":"#15803d", fontWeight:700 }}>{flag?"⚠ Abnormal":"✓ Normal"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* D4: Risk */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:900, color:"#dc2626", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, paddingBottom:4, borderBottom:"1px solid #fee2e2" }}>
                    D4 · Risk Screening
                  </div>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead><tr style={{ background:"#f8fafc" }}>
                      {["Scale","Score","Threshold","Level"].map(h=>(
                        <th key={h} style={{ padding:"6px 10px", fontSize:10, color:"#6b7280", textTransform:"uppercase", fontWeight:700, letterSpacing:"0.06em", textAlign:"left" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"8px 10px", fontSize:12, color:"#374151", fontWeight:600 }}>C-SSRS Analog (Suicidality)</td>
                        <td style={{ padding:"8px 10px", fontSize:13, fontWeight:900, color:cssCl.level>=2?"#dc2626":"#111827" }}>{cssCl.score}</td>
                        <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>0 = no ideation</td>
                        <td style={{ padding:"8px 10px", fontSize:11, color:cssCl.level>=2?"#991b1b":"#15803d", fontWeight:700 }}>{cssCl.label}</td>
                      </tr>
                      <tr style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"8px 10px", fontSize:12, color:"#374151", fontWeight:600 }}>AUDIT-C (Alcohol)</td>
                        <td style={{ padding:"8px 10px", fontSize:13, fontWeight:900, color:audCl.level>=2?"#dc2626":"#111827" }}>{audCl.score}</td>
                        <td style={{ padding:"8px 10px", fontSize:11, color:"#6b7280" }}>≤3 (F), ≤4 (M) low risk</td>
                        <td style={{ padding:"8px 10px", fontSize:11, color:audCl.level>=2?"#991b1b":"#15803d", fontWeight:700 }}>{audCl.label}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Clinician footer */}
                <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 16px", border:"1px solid #e2e8f0", fontSize:10, color:"#6b7280", lineHeight:1.8 }}>
                  <strong style={{ color:"#374151" }}>Clinical Note:</strong> CIBS-VALID is a standardised multi-domain research battery. All subscale scores should be interpreted alongside clinical history, MSE findings, and structured interview. Elevated risk indicators require immediate structured clinical follow-up using primary validated instruments (C-SSRS, AUDIT, PHQ-9, GAD-7). This report is for qualified clinician use only.<br/>
                  <strong>PI:</strong> Dr Shailesh V. Pangaonkar MD · CIBS, Nagpur · pangaonkar11@gmail.com | Ethics: Dr Rinki Rughwani Children Hospital, Nagpur
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── COMBINED ANALYSIS (only if both taken) ─────────────────────── */}
      {tab==="cross" && cross && (
        <div style={{ maxWidth:760, margin:"16px auto", padding:"0 16px 60px" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#0e7490,#0369a1)", borderRadius:14, padding:"20px", color:"white", marginBottom:16 }}>
            <div style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#7dd3fc", marginBottom:4 }}>Cross-Instrument Convergent Summary</div>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:"Georgia,serif" }}>VISTA × VALID Integrated Profile</div>
            <div style={{ fontSize:12, color:"#bae6fd", marginTop:4 }}>
              {demographics.name||"Anonymous"} · {demographics.age?`Age ${demographics.age}`:""}
              {demographics.gender?` · ${demographics.gender}`:""} · {today}
            </div>
          </div>

          {/* Concordance table */}
          {[
            { domain:"Cognitive Estimate", vistaVal:`CQ ${cross.vCQ}`, validVal:`IQ ${cross.valCQ}`, concordant:cross.cqConcordant,
              note: cross.cqConcordant ? `Estimates within ${cross.cqDiff} points — good concordance` : `Difference of ${cross.cqDiff} points — review item-level performance` },
            { domain:"Neuroticism / Emotional Lability", vistaVal:`N T-score ${cross.vN}`, validVal:`N T-score ${cross.valN}`, concordant:cross.nConcordant,
              note: cross.nConcordant ? "Both instruments signal similar emotional stability level" : "Discordant — consider state vs trait distinction" },
            { domain:"Depressive Indicators", vistaVal:`Dep index ${cross.vDep}/100`, validVal:`Duke Dep ${cross.valDep}/100`, concordant:cross.depConcordant,
              note: cross.depConcordant ? "Both instruments agree on depression level" : "Discordant — cross-check with clinical interview" },
            { domain:"Risk Profile", vistaVal:`VISTA flag ${cross.vSIR}/4`, validVal:`C-SSRS level ${cross.valCSS}/4`, concordant:cross.riskConcordant,
              note: cross.riskConcordant ? "Risk levels concordant across both instruments" : "⚠ Discordant risk signals — structured interview required" },
          ].map((row,i)=>(
            <div key={i} style={{ background:"white", borderRadius:12, padding:"14px 16px", marginBottom:10,
              border:`2px solid ${row.concordant?"#86efac":"#fca5a5"}`,
              borderLeft:`5px solid ${row.concordant?"#10b981":"#ef4444"}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#1a2e4a", marginBottom:4 }}>{row.domain}</div>
                <div style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20,
                  background: row.concordant?"#f0fdf4":"#fef2f2",
                  color: row.concordant?"#15803d":"#dc2626" }}>
                  {row.concordant?"✓ Concordant":"⚠ Discordant"}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <div style={{ background:"#eff6ff", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:9, color:"#1d4ed8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>VISTA</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1e3a5f" }}>{row.vistaVal}</div>
                </div>
                <div style={{ background:"#f5f3ff", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:9, color:"#6d28d9", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>VALID</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#4c1d95" }}>{row.validVal}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6 }}>{row.note}</div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ background:"#f8fafc", borderRadius:12, padding:"14px 16px", border:"1px solid #e2e8f0", fontSize:11, color:"#64748b", lineHeight:1.8 }}>
            <strong>Interpretation note:</strong> CIBS-VISTA is a non-verbal projective screening instrument; CIBS-VALID is a standardised self-report battery.
            Concordance between instruments strengthens clinical confidence. Discordance may reflect state-vs-trait differences, administration context, or response style and warrants further structured evaluation.
            This report is prepared at the Central Institute of Behavioural Sciences, Nagpur, for qualified clinician use.
          </div>
        </div>

      )}
    </div>
  );
};

// ── Processing Screen ──────────────────────────────────────────────────────
const ProcessingScreen = () => (
  <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f1f3d,#1a3a6b)",
    display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
    <div style={{ textAlign:"center", maxWidth:340, padding:20 }}>
      <div style={{ width:60, height:60, border:"3px solid rgba(255,255,255,0.1)", borderTopColor:"#60a5fa",
        borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 24px" }}/>
      <div style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:10 }}>Generating Your Report</div>
      <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.8 }}>Computing psychometric scores and preparing clinical interpretations…</div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginTop:20 }}>
        {["Cognitive","Personality","Emotional","Health","Risk"].map((d,i)=>(
          <span key={d} style={{ fontSize:10, color:"#60a5fa", background:"rgba(255,255,255,0.05)", borderRadius:20,
            padding:"4px 10px", animation:`pulse 2s ${i*0.3}s ease-in-out infinite` }}>{d}</span>
        ))}
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// ║  MAIN APP — State Machine                                     ║
// ══════════════════════════════════════════════════════════════════
export default function CIBSBattery() {
  // ── Global state ──────────────────────────────────────────────────────────
  const [screen, setScreen]       = useState("landing");
  const [firstTest, setFirstTest] = useState(null);
  const [testLang, setTestLang]   = useState("en");       // language chosen at consent
  const [mode, setMode]           = useState("assisted");

  // VISTA state
  const [vistaStage, setVistaStage]     = useState("intro");
  const [shapeSeq, setShapeSeq]         = useState([]);
  const [colorSeq, setColorSeq]         = useState([]);
  const [shadeSeq, setShadeSeq]         = useState([]);
  const [smileySeq, setSmileySeq]       = useState([]);
  const [storedFS, setStoredFS]         = useState(null);
  const [storedFC, setStoredFC]         = useState(null);
  const [storedShades, setStoredShades] = useState([]);
  const [vistaResults, setVistaResults] = useState(null); // { clinical, narratives, reportId }

  // VALID state
  const [validResp, setValidResp] = useState(null);
  const [vistaDone, setVistaDone] = useState(false);   // true once smiley stage finishes
  const [validDone, setValidDone] = useState(false);   // true once VALID assessment finishes

  // Shared
  const [demographics, setDemographics] = useState(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const vistaComplete = vistaDone || !!vistaResults;
  const validComplete = validDone || !!validResp;
  const vistaReportId = useRef("CIBS-V-" + Date.now().toString(36).toUpperCase().slice(-8));

  const runVistaReport = async (sSeq, cSeq, shSeq, smSeq, demo) => {
    const cl = computeClinical(sSeq, cSeq, shSeq, smSeq);
    const participant = { name:demo?.name||"", age:demo?.age||"", gender:demo?.gender||"",
      edu:demo?.edu||"", language:demo?.language||"", setting:demo?.setting||"", purpose:demo?.purpose||"" };
    const narr = await vistaGenerateReport(cl, participant);
    setVistaResults({ clinical:cl, narratives:narr, reportId:vistaReportId.current });
  };

  // ── Landing: choose which test to start (or both) ─────────────────────────
  const handleStart = (choice) => {
    if (choice === "both") { setFirstTest("vista"); setScreen("consent"); }
    else { setFirstTest(choice); setScreen("consent"); }
  };

  // ── After consent ─────────────────────────────────────────────────────────
  const handleConsent = (selectedLang) => {
    setTestLang(selectedLang || "en");
    setScreen(firstTest === "vista" ? "vista" : "valid");
  };

  // ── After VISTA completes (smiley stage done) ─────────────────────────────
  const handleVistaComplete = (smSeq) => {
    setSmileySeq(smSeq);
    setVistaDone(true);
    // If VALID already done, skip bridge and go straight to demographics
    if (validDone) { setScreen("demographics"); return; }
    setScreen("vista_done");
  };

  // ── After VALID assessment completes ─────────────────────────────────────
  const handleValidComplete = (resp) => {
    setValidResp(resp);
    setValidDone(true);
    // If VISTA already done, skip bridge and go straight to demographics
    if (vistaDone) { setScreen("demographics"); return; }
    setScreen("valid_done");
  };

  // ── Bridge: user decides whether to take second test ─────────────────────
  const handleBridgeContinue = () => {
    // Only navigate to other test if it hasn't been completed yet
    if (screen === "vista_done") {
      if (validDone) setScreen("demographics");
      else setScreen("valid");
    } else {
      if (vistaDone) setScreen("demographics");
      else setScreen("vista");
    }
  };

  // ── After demographics: generate reports then show combined ──────────────
  const handleDemographics = async (demo) => {
    setDemographics(demo);
    setScreen("processing");

    // ══════════════════════════════════════════════════════════════
    // STEP 1: SUBMIT DATA FIRST — before any report generation
    // This ensures data reaches Google Sheets even if report crashes
    // ══════════════════════════════════════════════════════════════
    try {
      const uid = await generateUID(
        demo.name || "",
        demo.dob || demo.age || "",
        demo.mobile || ""
      );
      const source = getSource();
      const device = getDevice();

      // Score VISTA clinical data
      let vistaScored = null;
      if (shapeSeq.length > 0) {
        try { vistaScored = computeClinical(shapeSeq, colorSeq, shadeSeq,
          smileySeq.length > 0 ? smileySeq : shapeSeq); } catch(e) {}
      }

      // Score VALID responses
      const vBFI  = validResp ? scoreBFI(validResp.d2) : null;
      const vDuke = validResp ? scoreDuke(validResp.d3) : null;
      const vCSS  = validResp ? scoreCSS(
        Object.fromEntries(CSSRS.map((_,i)=>[`css${i+1}`, validResp.d4?.[`css${i+1}`]]))
      ) : null;
      const vAUD  = validResp ? scoreAUDIT(
        Object.fromEntries(AUDITC.map((_,i)=>[`${i}`, validResp.d4?.[`aud${i+1}`]??0]))
      ) : null;
      const vCAT  = validResp ? scoreCAT(validResp.d1) : null;

      const r = vistaScored || {};

      const payload = {
        uid,
        source,
        device,
        language: testLang || "en",
        name: demo.name || "",
        age: demo.age || "",
        gender: demo.gender || "",
        education: demo.edu || "",
        mobile: demo.mobile || "",
        diagnosis: demo.diagnosis || "",
        examiner: demo.examiner || "",
        setting: demo.setting || "",
        // ── VISTA raw sequences ──────────────────────────────────
        vistaShapeSeq: (shapeSeq||[]).join(","),
        vistaColorSeq: (colorSeq||[]).join(","),
        vistaShadeSeq: (shadeSeq||[]).join(","),
        vistaSmileySeq: (smileySeq||[]).join(","),
        // ── VISTA scored domains ─────────────────────────────────
        vistaCQ: r?.d1?.CQ || "",
        vistaIQBand: r?.d1?.iqBand?.band || "",
        vistaEQ: r?.d3?.EQSS || "",
        vistaEQBand: r?.d3?.eqBand?.band || "",
        vistaDistress: r?.d4?.phqAnalog?.level || "",
        vistaRisk: r?.d5?.CRI || "",
        vistaBF_O: r?.d2?.BFt?.O || "",
        vistaBF_C: r?.d2?.BFt?.C || "",
        vistaBF_E: r?.d2?.BFt?.E || "",
        vistaBF_A: r?.d2?.BFt?.A || "",
        vistaBF_N: r?.d2?.BFt?.N || "",
        // ── VALID scored domains ─────────────────────────────────
        validCQ: vCAT?.iq || "",
        validCQBand: vCAT?.label || "",
        validCQPercentile: vCAT?.pctRank || "",
        validBFI_O: vBFI?.O || "",
        validBFI_C: vBFI?.C || "",
        validBFI_E: vBFI?.E || "",
        validBFI_A: vBFI?.A || "",
        validBFI_N: vBFI?.N || "",
        validPhysical: vDuke?.phys || "",
        validMental: vDuke?.mental || "",
        validSocial: vDuke?.social || "",
        validGeneral: vDuke?.general || "",
        validSelfEsteem: vDuke?.selfEsteem || "",
        validAnxiety: vDuke?.anxiety || "",
        validDepression: vDuke?.depression || "",
        validPain: vDuke?.pain || "",
        validDisability: vDuke?.disability || "",
        validCSSSLevel: vCSS?.level ?? "",
        validCSSSLabel: vCSS?.label || "",
        validAUDITScore: vAUD?.score ?? "",
        validAUDITLabel: vAUD?.label || "",
      };

      await submitToSheet(payload);
      console.log("✅ CIBS data submitted to Google Sheets");
    } catch(err) {
      console.error("❌ Data submission failed:", err);
    }

    // ══════════════════════════════════════════════════════════════
    // STEP 2: NOW generate the visual report (safe to crash here)
    // ══════════════════════════════════════════════════════════════
    try {
      if (shapeSeq.length > 0) {
        await runVistaReport(shapeSeq, colorSeq, shadeSeq,
          smileySeq.length > 0 ? smileySeq : shapeSeq, demo);
      }
    } catch(err) {
      console.error("Report generation error:", err);
    }

    setScreen("report");
  };

  // ── VISTA internal stage router ───────────────────────────────────────────
  const VistaFlow = () => {
    if (vistaStage === "intro") return (
      <VistaIntroScreen onBegin={()=>setVistaStage("s1")} onBack={()=>setScreen("landing")} lang={testLang}/>
    );
    const ROOT_S = { minHeight:"100vh", background:"#e8ecf0", fontFamily:"'DM Sans',sans-serif", padding:"16px 8px 80px" };
    const CARD_S = { background:"white", borderRadius:12, padding:"18px 16px", maxWidth:560, width:"100%", margin:"0 auto", boxShadow:"0 2px 16px rgba(0,0,0,0.08)", animation:"fadeUp 0.3s ease" };
    if (vistaStage === "s1") return (
      <div style={ROOT_S}><style>{VISTA_G}</style>
        <div style={CARD_S}>
          <SelectionStage key="s1" stageKey="s1" accentColor="#64748b" title="Stage I — Shapes"
            instr={(STAGE_INSTR[testLang]||STAGE_INSTR.en).s1} items={SHAPES}
            renderItem={(item,sz)=><ShapeSVG code={item.code} fill="#9ca3af" size={sz}/>}
            onComplete={seq=>{setStoredFS(SHAPES.find(s=>s.code===seq[0])||SHAPES[0]);setShapeSeq(seq);setVistaStage("s2");}}/>
        </div>
      </div>
    );
    if (vistaStage === "s2") return (
      <div style={ROOT_S}><style>{VISTA_G}</style>
        <div style={CARD_S}>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}>
              <ShapeSVG code={storedFS?.code||1} fill="#1e3a5f" size={20}/>
              <span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>Primary: {storedFS?.name}</span>
            </span>
          </div>
          <SelectionStage key="s2" stageKey="s2" accentColor="#b45309" title="Stage II — Colours"
            instr={(STAGE_INSTR[testLang]||STAGE_INSTR.en).s2} items={COLORS}
            renderItem={(item,sz)=><ShapeSVG code={storedFS?.code||1} fill={item.hex} size={sz}/>}
            onComplete={seq=>{const fc=COLORS.find(c=>c.code===seq[0])||COLORS[0];setStoredFC(fc);setStoredShades(generateShades(fc.hex));setColorSeq(seq);setVistaStage("s3");}}/>
        </div>
      </div>
    );
    if (vistaStage === "s3") return (
      <div style={ROOT_S}><style>{VISTA_G}</style>
        <div style={CARD_S}>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}>
              <ShapeSVG code={storedFS?.code||1} fill={storedFC?.hex||"#1e3a5f"} size={20}/>
              <span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>{storedFS?.name} · {storedFC?.name} shades</span>
            </span>
          </div>
          <SelectionStage key="s3" stageKey="s3" accentColor="#6d28d9" title="Stage III — Shades"
            instr={(STAGE_INSTR[testLang]||STAGE_INSTR.en).s3} items={storedShades}
            renderItem={(item,sz)=><ShapeSVG code={storedFS?.code||1} fill={item.hex} size={sz}/>}
            onComplete={seq=>{setShadeSeq(seq);setVistaStage("s4");}}/>
        </div>
      </div>
    );
    if (vistaStage === "s4") return (
      <div style={ROOT_S}><style>{VISTA_G}</style>
        <div style={CARD_S}>
          <SelectionStage key="s4" stageKey="s4" accentColor="#be185d" title="Stage IV — Feelings"
            instr={(STAGE_INSTR[testLang]||STAGE_INSTR.en).s4} items={SMILEYS}
            renderItem={(item,sz)=><span style={{fontSize:Math.round(sz*0.72),lineHeight:1,userSelect:"none"}}>{item.emoji}</span>}
            onComplete={seq=>{handleVistaComplete(seq);}}/>
        </div>
      </div>
    );
    return null;
  };

  // ── Screen router ─────────────────────────────────────────────────────────
  if (screen === "landing")    return <LandingPage onStart={handleStart}/>;
  if (screen === "consent")    return <BatteryConsent onConsent={handleConsent}/>;
  if (screen === "vista")      return <VistaFlow/>;
  if (screen === "valid")      return (
    <Assessment mode={mode} onComplete={handleValidComplete}/>
  );
  if (screen === "vista_done") return (
    <BridgeScreen completed="vista" onContinue={handleBridgeContinue}/>
  );
  if (screen === "valid_done") return (
    <BridgeScreen completed="valid" onContinue={handleBridgeContinue}/>
  );
  if (screen === "demographics") return (
    <UnifiedDemographics vistaComplete={vistaComplete} validComplete={validComplete}
      onComplete={handleDemographics}/>
  );
  if (screen === "processing") return <ProcessingScreen/>;
  if (screen === "report" && (vistaResults || validResp)) return (
    <CombinedReport vistaSeqs={{ shapeSeq, colorSeq, shadeSeq, smileySeq }}
      vistaResults={vistaResults} validResp={validResp} demographics={demographics}/>
  );
  return <LandingPage onStart={handleStart}/>;
}
