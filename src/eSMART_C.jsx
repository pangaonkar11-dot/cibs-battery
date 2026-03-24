import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  eSMART-C  |  CIBS Integrated Child Assessment Platform
//  Part 1 : CIBS-FIS  (Fluid Intelligence Scale — original items, Cattell norms)
//  Part 2 : SCSS      (Shape-Colour-Shade-Smiley Test — Dr Pangaonkar, CIBS)
//  © 2026  Central Institute of Behavioural Sciences, Nagpur
// ══════════════════════════════════════════════════════════════════════════════

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en:{
    appTitle:"eSMART-C", subtitle:"Child Cognitive & Personality Assessment",
    org:"Central Institute of Behavioural Sciences, Nagpur",
    choose:"Choose Language / भाषा चुनें / भाषा निवडा",
    whoFills:"Who is administering this assessment?",
    clinician:"Clinician / Teacher / Researcher", parent:"Parent / Caregiver",
    clinSub:"I am a trained health professional, teacher, or researcher",
    parSub:"I am the parent or primary caregiver of this child",
    childInfo:"Child Information",
    childName:"Child's Full Name", dob:"Date of Birth", age:"Age (years)",
    gender:"Gender", gM:"Male", gF:"Female", gO:"Other",
    school:"School / Institution", grade:"Class / Grade",
    fileNo:"CIBS File No.", examiner:"Examiner",
    next:"Next →", back:"← Back", proceed:"Proceed →",
    disclaimer:"Important Notice",
    discPoints:[
      "eSMART-C is a SCREENING TOOL that measures cognitive ability and personality traits. It is NOT a diagnostic instrument.",
      "Part 1 (CIBS-FIS) measures fluid intelligence using original visual reasoning tasks, calibrated to Cattell's Culture Fair Intelligence Test norms (1949, 1973). Results give a Mental Age (MA) and an estimated IQ using Binet's MA÷CA×100 formula.",
      "Part 2 (SCSS — Shape Colour Shade Smiley Test) is an original projective personality instrument developed by Dr. Shailesh Pangaonkar, CIBS Nagpur. It provides cognitive style, personality, emotional, health, and risk profiles.",
      "All scores are screening indicators only. Clinical decisions must be based on a full assessment by a qualified professional.",
      "This tool acknowledges the theoretical framework of Raymond B. Cattell (1949) and the normative standards published in academic literature.",
    ],
    agreeText:"I have read and understood the above. I wish to proceed.",
    proceedBtn:"Proceed to Assessment →",
    part1Name:"Part 1 — CIBS Fluid Intelligence Scale (CIBS-FIS)",
    part2Name:"Part 2 — Shape Colour Shade Smiley Test (SCSS)",
    p1Intro:"This is a visual reasoning test. You will see patterns, pictures and puzzles. Look carefully and choose the best answer from the choices given. There are no trick questions — just look at the pictures carefully.",
    p1Note:"There are 4 short tests. Each test has a time limit. Answer as many as you can.",
    subtests:[
      {id:"SER",name:"Patterns",  desc:"What comes next in the pattern?",      items:12, mins:3},
      {id:"CLS",name:"Odd One Out",desc:"Which one is different?",              items:14, mins:4},
      {id:"MAT",name:"Grids",     desc:"Which picture completes the grid?",     items:12, mins:3},
      {id:"CON",name:"Positions", desc:"Which picture matches the rule?",       items:8,  mins:2.5},
    ],
    practiceTitle:"Practice — let's try one",
    practiceInstr:"Look at the pictures in the top row. What should come next? Click your answer below.",
    startTest:"Start Test →",
    timeLeft:"Time left",
    skip:"Skip →",
    answered:"answered",
    p2Intro:"In this part, you will choose pictures one by one — starting with the one you like most. There are no right or wrong answers. Just choose honestly.",
    p2stages:["Shapes","Colours","Shades","Feelings"],
    generating:"Generating Assessment Report…",
    genSteps:["Computing intelligence scores…","Analysing personality profile…","Building emotional indicators…","Calculating risk indicators…","Writing clinical report…"],
    reportTitle:"eSMART-C Assessment Report",
    forParent:"Summary for Family",
    forClinician:"Clinician Report",
    cogSection:"Part 1 — Cognitive Assessment (CIBS-FIS)",
    perSection:"Part 2 — Personality & Emotional Profile (SCSS)",
    printPDF:"🖨️ Print / PDF",
    newAssessment:"🔄 New Assessment",
    disclaimer2:"Screening tool only. All findings require clinical confirmation. Not a substitute for professional assessment.",
  },
  hi:{
    appTitle:"eSMART-C", subtitle:"बाल संज्ञानात्मक एवं व्यक्तित्व मूल्यांकन",
    org:"केंद्रीय व्यावहारिक विज्ञान संस्थान, नागपुर",
    choose:"भाषा चुनें",
    whoFills:"यह मूल्यांकन कौन कर रहा है?",
    clinician:"चिकित्सक / शिक्षक / शोधकर्ता", parent:"माता-पिता / देखभालकर्ता",
    clinSub:"मैं एक प्रशिक्षित स्वास्थ्य पेशेवर, शिक्षक या शोधकर्ता हूँ",
    parSub:"मैं इस बच्चे का माता-पिता या प्राथमिक देखभालकर्ता हूँ",
    childInfo:"बच्चे की जानकारी",
    childName:"बच्चे का पूरा नाम", dob:"जन्म तिथि", age:"आयु (वर्ष)",
    gender:"लिंग", gM:"पुरुष", gF:"महिला", gO:"अन्य",
    school:"विद्यालय / संस्था", grade:"कक्षा",
    fileNo:"CIBS फाइल नंबर", examiner:"परीक्षक",
    next:"आगे →", back:"← वापस", proceed:"जारी रखें →",
    disclaimer:"महत्वपूर्ण सूचना",
    discPoints:[
      "eSMART-C एक जांच उपकरण है जो संज्ञानात्मक क्षमता और व्यक्तित्व को मापता है। यह निदान उपकरण नहीं है।",
      "भाग 1 (CIBS-FIS) कैटल के CFIT मानकों पर आधारित मानसिक आयु और IQ का अनुमान देता है।",
      "भाग 2 (SCSS) डॉ. शैलेश पानगावकर, CIBS नागपुर द्वारा विकसित एक प्रक्षेपण परीक्षण है।",
      "सभी स्कोर केवल जांच संकेतक हैं। नैदानिक निर्णय योग्य पेशेवर द्वारा लिए जाने चाहिए।",
    ],
    agreeText:"मैंने उपरोक्त पढ़ और समझ लिया है। मैं आगे बढ़ना चाहता/चाहती हूँ।",
    proceedBtn:"मूल्यांकन की ओर आगे बढ़ें →",
    part1Name:"भाग 1 — CIBS तरल बुद्धि स्केल (CIBS-FIS)",
    part2Name:"भाग 2 — आकार रंग छाया मुस्कान परीक्षण (SCSS)",
    p1Intro:"यह एक चित्र-आधारित तर्क परीक्षण है। तस्वीरों और पैटर्न को ध्यान से देखें और सही उत्तर चुनें।",
    p1Note:"4 छोटे परीक्षण हैं। प्रत्येक की समय-सीमा है।",
    subtests:[
      {id:"SER",name:"पैटर्न",    desc:"अगला क्या आएगा?",         items:12, mins:3},
      {id:"CLS",name:"अलग चुनो", desc:"कौन सा अलग है?",           items:14, mins:4},
      {id:"MAT",name:"ग्रिड",    desc:"कौन सा चित्र ग्रिड पूरा करता है?", items:12, mins:3},
      {id:"CON",name:"स्थितियाँ",desc:"कौन सा चित्र नियम से मेल खाता है?",items:8, mins:2.5},
    ],
    practiceTitle:"अभ्यास — एक बार कोशिश करें",
    practiceInstr:"ऊपर की पंक्ति में चित्र देखें। आगे क्या आना चाहिए? नीचे से अपना उत्तर चुनें।",
    startTest:"परीक्षण शुरू करें →",
    timeLeft:"शेष समय",
    skip:"छोड़ें →",
    answered:"उत्तर दिए",
    p2Intro:"इस भाग में आप एक-एक करके चित्र चुनेंगे — पहले जो सबसे ज्यादा पसंद हो। कोई सही या गलत उत्तर नहीं है।",
    p2stages:["आकृतियाँ","रंग","छाया","भावनाएं"],
    generating:"मूल्यांकन रिपोर्ट तैयार हो रही है…",
    genSteps:["बुद्धि स्कोर की गणना…","व्यक्तित्व प्रोफाइल विश्लेषण…","भावनात्मक संकेतक…","जोखिम संकेतक…","नैदानिक रिपोर्ट…"],
    reportTitle:"eSMART-C मूल्यांकन रिपोर्ट",
    forParent:"परिवार के लिए सारांश",
    forClinician:"चिकित्सक रिपोर्ट",
    cogSection:"भाग 1 — संज्ञानात्मक मूल्यांकन (CIBS-FIS)",
    perSection:"भाग 2 — व्यक्तित्व एवं भावनात्मक प्रोफाइल (SCSS)",
    printPDF:"🖨️ प्रिंट / PDF",
    newAssessment:"🔄 नया मूल्यांकन",
    disclaimer2:"केवल जांच उपकरण। सभी निष्कर्षों के लिए नैदानिक पुष्टि आवश्यक है।",
  },
  mr:{
    appTitle:"eSMART-C", subtitle:"बालक संज्ञानात्मक व व्यक्तिमत्व मूल्यांकन",
    org:"केंद्रीय वर्तणूक विज्ञान संस्था, नागपूर",
    choose:"भाषा निवडा",
    whoFills:"हे मूल्यांकन कोण करत आहे?",
    clinician:"वैद्य / शिक्षक / संशोधक", parent:"पालक / काळजीवाहू",
    clinSub:"मी एक प्रशिक्षित आरोग्य व्यावसायिक, शिक्षक किंवा संशोधक आहे",
    parSub:"मी या मुलाचा पालक किंवा प्राथमिक काळजीवाहू आहे",
    childInfo:"मुलाची माहिती",
    childName:"मुलाचे पूर्ण नाव", dob:"जन्मतारीख", age:"वय (वर्षे)",
    gender:"लिंग", gM:"पुरुष", gF:"स्त्री", gO:"इतर",
    school:"शाळा / संस्था", grade:"इयत्ता",
    fileNo:"CIBS फाईल क्र.", examiner:"परीक्षक",
    next:"पुढे →", back:"← मागे", proceed:"पुढे जा →",
    disclaimer:"महत्त्वाची सूचना",
    discPoints:[
      "eSMART-C हे एक तपासणी साधन आहे जे संज्ञानात्मक क्षमता आणि व्यक्तिमत्व मोजते. हे निदान साधन नाही.",
      "भाग 1 (CIBS-FIS) Cattell च्या CFIT मानदंडांवर आधारित मानसिक वय आणि IQ अंदाज देते.",
      "भाग 2 (SCSS) डॉ. शैलेश पानगावकर, CIBS नागपूर यांनी विकसित केलेले प्रक्षेपण परीक्षण आहे.",
      "सर्व स्कोर केवळ तपासणी निर्देशक आहेत. वैद्यकीय निर्णय पात्र व्यावसायिकाद्वारे घेतले जावेत.",
    ],
    agreeText:"मी वरील वाचले आणि समजले आहे. मला पुढे जायचे आहे.",
    proceedBtn:"मूल्यांकनाकडे पुढे जा →",
    part1Name:"भाग 1 — CIBS तरल बुद्धिमत्ता स्केल (CIBS-FIS)",
    part2Name:"भाग 2 — आकार रंग छाया हास्य परीक्षण (SCSS)",
    p1Intro:"हे एक चित्र-आधारित तर्क परीक्षण आहे. चित्रे आणि नमुने काळजीपूर्वक पाहा आणि योग्य उत्तर निवडा.",
    p1Note:"4 छोटी परीक्षणे आहेत. प्रत्येकाची वेळ मर्यादा आहे.",
    subtests:[
      {id:"SER",name:"नमुने",    desc:"पुढे काय येईल?",                items:12, mins:3},
      {id:"CLS",name:"वेगळे काढा",desc:"कोणते वेगळे आहे?",            items:14, mins:4},
      {id:"MAT",name:"जाळी",     desc:"जाळी पूर्ण करणारे चित्र कोणते?",items:12, mins:3},
      {id:"CON",name:"स्थाने",   desc:"नियमाशी जुळणारे चित्र कोणते?",  items:8,  mins:2.5},
    ],
    practiceTitle:"सराव — एकदा प्रयत्न करा",
    practiceInstr:"वरच्या रांगेतील चित्रे पाहा. पुढे काय यायला हवे? खालून तुमचे उत्तर निवडा.",
    startTest:"परीक्षण सुरू करा →",
    timeLeft:"उरलेला वेळ",
    skip:"सोडा →",
    answered:"उत्तरे दिली",
    p2Intro:"या भागात आपण एक-एक करून चित्रे निवडाल — आधी जे सर्वात आवडते ते. बरोबर किंवा चुकीचे उत्तर नाही.",
    p2stages:["आकार","रंग","छाया","भावना"],
    generating:"मूल्यांकन अहवाल तयार होत आहे…",
    genSteps:["बुद्धिमत्ता स्कोर गणना…","व्यक्तिमत्व प्रोफाइल विश्लेषण…","भावनिक निर्देशक…","जोखीम निर्देशक…","वैद्यकीय अहवाल…"],
    reportTitle:"eSMART-C मूल्यांकन अहवाल",
    forParent:"कुटुंबासाठी सारांश",
    forClinician:"वैद्यकीय अहवाल",
    cogSection:"भाग 1 — संज्ञानात्मक मूल्यांकन (CIBS-FIS)",
    perSection:"भाग 2 — व्यक्तिमत्व व भावनिक प्रोफाइल (SCSS)",
    printPDF:"🖨️ प्रिंट / PDF",
    newAssessment:"🔄 नवीन मूल्यांकन",
    disclaimer2:"केवळ तपासणी साधन. सर्व निष्कर्षांसाठी वैद्यकीय पुष्टी आवश्यक.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  CIBS-FIS NORMS  (Cattell 1973, academic literature — freely citable)
//  Raw score → Mental Age lookup, Scale 2 (ages 8-14, max 46 items)
//  SD = 24, Mean = 100. IQ = (MA ÷ CA) × 100 (Binet formula, public domain)
// ══════════════════════════════════════════════════════════════════════════════
const S2_NORMS = {
  M:{8:18,8.5:20,9:22,9.5:24,10:26,10.5:27,11:29,11.5:30,12:32,12.5:33,13:35,13.5:36,14:37},
  F:{8:19,8.5:21,9:22,9.5:24,10:26,10.5:28,11:29,11.5:31,12:32,12.5:33,13:34,13.5:35,14:36},
};
// Scale 1 norms (ages 4-8, max 30 items)
const S1_NORMS = {
  M:{4:8,4.5:10,5:12,5.5:14,6:16,6.5:18,7:20,7.5:22,8:24},
  F:{4:9,4.5:11,5:13,5.5:15,6:17,6.5:18,7:20,7.5:22,8:24},
};
// Scale 3 norms (ages 14+, max 50 items)
const S3_NORMS = {
  M:{14:29,14.5:31,15:33,15.5:35,16:36,16.5:37,17:38,18:38},
  F:{14:28,14.5:30,15:32,15.5:34,16:35,16.5:36,17:37,18:37},
};

function getScale(ageYrs) {
  if (ageYrs < 8)  return {scale:1, norms:S1_NORMS, maxRaw:30};
  if (ageYrs < 14) return {scale:2, norms:S2_NORMS, maxRaw:46};
  return              {scale:3, norms:S3_NORMS, maxRaw:50};
}

function rawToMA(raw, gender, norms) {
  const g = (gender==="F") ? "F" : "M";
  const ages = Object.keys(norms[g]).map(Number).sort((a,b)=>a-b);
  // Find the two age brackets that bracket this raw score
  for (let i = 0; i < ages.length - 1; i++) {
    const lo = norms[g][ages[i]], hi = norms[g][ages[i+1]];
    if (raw >= lo && raw <= hi) {
      const frac = (hi - lo) > 0 ? (raw - lo) / (hi - lo) : 0;
      return ages[i] + frac * (ages[i+1] - ages[i]);
    }
  }
  if (raw <= norms[g][ages[0]])  return Math.max(ages[0] - 1, ages[0] * raw / Math.max(norms[g][ages[0]], 1));
  return ages[ages.length - 1] + 0.5;
}

function computeFIS(rawScores, ageYrs, gender) {
  const { scale, norms, maxRaw } = getScale(ageYrs);
  const total = Object.values(rawScores).reduce((a,b) => a + b, 0);
  const ma    = rawToMA(total, gender, norms);
  const ca    = Math.min(ageYrs, 16); // cap at 16 for Gf norms per Cattell
  const iq    = Math.round((ma / ca) * 100);
  const pct   = iqToPct(iq);
  return { total, maxRaw, ma: Math.round(ma * 10) / 10, iq, pct, scale, ...iqClass(iq) };
}

function iqToPct(iq) {
  const z = (iq - 100) / 24;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  const cdf = z >= 0 ? 1 - p : p;
  return Math.max(1, Math.min(99, Math.round(cdf * 100)));
}

function iqClass(iq) {
  if (iq >= 148) return {band:"Exceptionally Gifted",  color:"#085041", bg:"#E1F5EE", edu:"Gifted education programme recommended"};
  if (iq >= 124) return {band:"Very Superior",         color:"#0F6E56", bg:"#E1F5EE", edu:"Advanced curriculum, enrichment activities"};
  if (iq >= 112) return {band:"Superior",              color:"#3B6D11", bg:"#EAF3DE", edu:"Challenging coursework, competitive exams"};
  if (iq >= 100) return {band:"High Average",          color:"#0d5c6e", bg:"#f0f9f6", edu:"Standard curriculum with enrichment"};
  if (iq >= 88)  return {band:"Average",               color:"#374151", bg:"#f8fafc", edu:"Standard curriculum"};
  if (iq >= 76)  return {band:"Low Average",           color:"#633806", bg:"#FAEEDA", edu:"Additional learning support recommended"};
  if (iq >= 64)  return {band:"Borderline",            color:"#712B13", bg:"#FAECE7", edu:"Special education evaluation recommended"};
  if (iq >= 52)  return {band:"Mild Intellectual Disability", color:"#791F1F", bg:"#FCEBEB", edu:"Modified curriculum, resource room"};
  return               {band:"Moderate-Severe ID",     color:"#501313", bg:"#FCEBEB", edu:"Specialist evaluation and therapeutic intervention"};
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHAPE RENDERER  — programmatic SVG, completely original artwork
// ══════════════════════════════════════════════════════════════════════════════
// t: 0=circle, 3=triangle, 4=square, 5=pentagon, 6=hexagon, -1=dot, "D"=diamond
// f: 0=hollow, 1=filled, 2=hatched
// s: 0=small, 1=medium, 2=large
// r: rotation degrees
function Fig({ t=4, f=0, s=1, r=0, dim=52, extra=null }) {
  const c = dim / 2;
  const br = dim / 2 - 4;
  const rad = br * [0.42, 0.66, 0.88][s];
  const sid = "#1e3a5f";
  const fc  = f === 0 ? "none" : f === 1 ? "#1e3a5f" : "#7096bc";
  const sw  = dim < 40 ? 1.4 : 1.9;

  const poly = (n, cx, cy, rr) =>
    Array.from({length: n}, (_, i) => {
      const a = i * 2 * Math.PI / n - Math.PI / 2;
      return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
    }).join(" ");

  const renderShape = (tp, cx, cy, rr, rotation) => {
    const tr = rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined;
    if (tp === -1)  return <circle cx={cx} cy={cy} r={rr * 0.22} fill="#1e3a5f"/>;
    if (tp === 0)   return <circle cx={cx} cy={cy} r={rr} fill={fc} stroke={sid} strokeWidth={sw}/>;
    if (tp === "D") return <polygon points={`${cx},${cy-rr} ${cx+rr},${cy} ${cx},${cy+rr} ${cx-rr},${cy}`} fill={fc} stroke={sid} strokeWidth={sw}/>;
    return <polygon points={poly(tp, cx, cy, rr)} fill={fc} stroke={sid} strokeWidth={sw} transform={tr}/>;
  };

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} overflow="visible">
      {renderShape(t, c, c, rad, r)}
      {extra && renderShape(extra.t, c, c, rad * 0.40, 0)}
    </svg>
  );
}

// Multi-figure cell (for count-based items)
function MultiFig({ figs, dim=52 }) {
  if (!figs || figs.length === 0) return <Fig dim={dim}/>;
  if (figs.length === 1) return <Fig {...figs[0]} dim={dim}/>;
  const n = figs.length;
  // Arrange in 2x2 grid or row
  const positions = n === 2
    ? [[0.3, 0.5], [0.7, 0.5]]
    : n === 3
    ? [[0.2, 0.5], [0.5, 0.2], [0.8, 0.5]]
    : [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]];
  const small = dim * 0.38;
  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
      {figs.slice(0, positions.length).map((fig, i) => {
        const [px, py] = positions[i];
        return (
          <svg key={i} x={px * dim - small / 2} y={py * dim - small / 2} width={small} height={small}>
            <Fig {...fig} dim={small}/>
          </svg>
        );
      })}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CIBS-FIS ITEM BANK  — 46 original items, 4 subtests
//  All items are ORIGINAL CIBS works. Cognitive rules derived from Cattell's
//  theoretical framework (public domain science). No CFIT artwork reproduced.
//  Acknowledgement: Cattell, R.B. (1949, 1973). Culture Fair Intelligence Test.
//  Institute for Personality and Ability Testing, Champaign, IL.
// ══════════════════════════════════════════════════════════════════════════════

// Fig notation: {t, f, s, r, extra, figs(for multi)}
// difficulty 1=easy, 2=medium, 3=hard (for adaptive use)

// SERIES ITEMS — show 3 figs in sequence, pick 4th (from 5 choices)
const SERIES = [
  // 1. Sides increase: T→S→P→? (H)
  { d:1, seq:[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],
    choices:[{t:0,f:0,s:1},{t:3,f:0,s:1},{t:6,f:0,s:1},{t:4,f:0,s:1},{t:5,f:1,s:1}], ans:2 },

  // 2. Fill alternates hollow→filled→hollow→? (filled)
  { d:1, seq:[{t:4,f:0,s:1},{t:4,f:1,s:1},{t:4,f:0,s:1}],
    choices:[{t:4,f:2,s:1},{t:3,f:1,s:1},{t:4,f:0,s:1},{t:4,f:1,s:1},{t:0,f:1,s:1}], ans:3 },

  // 3. Count increases 1→2→3→? (4 shapes)
  { d:1,
    seq:[{figs:[{t:3,f:1,s:0}]},{figs:[{t:3,f:1,s:0},{t:3,f:1,s:0}]},{figs:[{t:3,f:1,s:0},{t:3,f:1,s:0},{t:3,f:1,s:0}]}],
    choices:[
      {figs:[{t:3,f:1,s:0},{t:3,f:1,s:0}]},
      {figs:[{t:3,f:1,s:0},{t:3,f:1,s:0},{t:3,f:1,s:0},{t:3,f:1,s:0}]},
      {figs:[{t:4,f:1,s:0},{t:4,f:1,s:0},{t:4,f:1,s:0}]},
      {figs:[{t:3,f:1,s:0}]},
      {figs:[{t:3,f:0,s:0},{t:3,f:0,s:0},{t:3,f:0,s:0},{t:3,f:0,s:0}]},
    ], ans:1 },

  // 4. Sides decrease H→P→S→? (T)
  { d:1, seq:[{t:6,f:0,s:1},{t:5,f:0,s:1},{t:4,f:0,s:1}],
    choices:[{t:0,f:0,s:1},{t:3,f:0,s:1},{t:6,f:0,s:1},{t:5,f:0,s:1},{t:3,f:1,s:1}], ans:1 },

  // 5. Rotation +90° each step: T(0)→T(90)→T(180)→? T(270 = equivalent 0+extra)
  // Use 45° increments for clarity: 0→45→90→135
  { d:1, seq:[{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:45},{t:3,f:1,s:1,r:90}],
    choices:[{t:3,f:1,s:1,r:90},{t:3,f:1,s:1,r:0},{t:3,f:0,s:1,r:135},{t:3,f:1,s:1,r:135},{t:4,f:1,s:1,r:45}], ans:3 },

  // 6. Shape progresses, fill stays hollow: T,h→S,h→P,h; inner dot added each time
  { d:2, seq:[{t:4,f:0,s:1},{t:4,f:0,s:1,extra:{t:-1}},{t:5,f:0,s:1}],
    choices:[{t:5,f:0,s:1,extra:{t:-1}},{t:4,f:1,s:1},{t:6,f:0,s:1},{t:5,f:1,s:1,extra:{t:-1}},{t:4,f:0,s:1,extra:{t:-1}}], ans:0 },

  // 7. Size increases: small→medium→large→? (back to small but filled)
  { d:2, seq:[{t:0,f:0,s:0},{t:0,f:0,s:1},{t:0,f:0,s:2}],
    choices:[{t:0,f:0,s:1},{t:0,f:1,s:0},{t:0,f:0,s:0},{t:0,f:1,s:2},{t:0,f:2,s:0}], ans:1 },

  // 8. Two rules: sides increase AND fill toggles: T_h→S_f→P_h→? (H_f)
  { d:2, seq:[{t:3,f:0,s:1},{t:4,f:1,s:1},{t:5,f:0,s:1}],
    choices:[{t:6,f:0,s:1},{t:5,f:1,s:1},{t:6,f:1,s:1},{t:3,f:1,s:1},{t:6,f:2,s:1}], ans:2 },

  // 9. Inner shape progresses: Circle[no inner]→Circle[T inside]→Circle[S inside]→?
  { d:2,
    seq:[{t:0,f:0,s:2},{t:0,f:0,s:2,extra:{t:3,f:1}},{t:0,f:0,s:2,extra:{t:4,f:1}}],
    choices:[{t:0,f:0,s:2,extra:{t:6,f:1}},{t:0,f:0,s:2,extra:{t:3,f:0}},{t:0,f:0,s:2,extra:{t:5,f:1}},{t:0,f:1,s:2},{t:0,f:0,s:1,extra:{t:4,f:1}}], ans:2 },

  // 10. Rotation + fill: S(0,h)→S(45,f)→S(90,h)→? S(135,f)
  { d:2, seq:[{t:4,f:0,s:1,r:0},{t:4,f:1,s:1,r:45},{t:4,f:0,s:1,r:90}],
    choices:[{t:4,f:0,s:1,r:135},{t:4,f:1,s:1,r:90},{t:4,f:1,s:1,r:0},{t:4,f:1,s:1,r:135},{t:3,f:1,s:1,r:135}], ans:3 },

  // 11. Compound: size increases by 1 step AND shape sides increase by 1
  // T_small→S_med→P_large→? (H_large? no — H loops back to T but xl=not available)
  // Use: T_small→S_med→P_large→H_small (wrap size, continue sides)
  { d:3, seq:[{t:3,f:1,s:0},{t:4,f:1,s:1},{t:5,f:1,s:2}],
    choices:[{t:6,f:1,s:2},{t:6,f:1,s:1},{t:6,f:1,s:0},{t:5,f:1,s:0},{t:3,f:1,s:2}], ans:2 },

  // 12. Hardest: Three-attribute rule — shape, size, AND fill all cycle independently
  // T_s_h → S_m_f → P_l_h → H_s_f → ? → back or: T_m_h (shape wraps, size continues, fill continues)
  // Show: T(s,h), S(m,f), P(l,h). Answer: H(s,f) — sides+1, size wraps s, fill toggles
  { d:3, seq:[{t:3,f:0,s:0},{t:4,f:1,s:1},{t:5,f:0,s:2}],
    choices:[{t:6,f:1,s:1},{t:6,f:0,s:0},{t:3,f:1,s:0},{t:6,f:1,s:0},{t:6,f:0,s:1}], ans:3 },
];

// CLASSIFICATION ITEMS — show 5 figs, pick odd one out (0-based index)
const CLASSIF = [
  // 1. 4 circles, 1 square
  { d:1, figs:[{t:0,f:0,s:1},{t:0,f:0,s:1},{t:4,f:0,s:1},{t:0,f:0,s:1},{t:0,f:0,s:1}], ans:2 },
  // 2. 4 filled, 1 hollow (same triangle)
  { d:1, figs:[{t:3,f:1,s:1},{t:3,f:1,s:1},{t:3,f:1,s:1},{t:3,f:0,s:1},{t:3,f:1,s:1}], ans:3 },
  // 3. 4 medium, 1 small
  { d:1, figs:[{t:4,f:0,s:1},{t:4,f:0,s:0},{t:4,f:0,s:1},{t:4,f:0,s:1},{t:4,f:0,s:1}], ans:1 },
  // 4. 4 triangles, 1 has inner dot
  { d:1, figs:[{t:3,f:0,s:1},{t:3,f:0,s:1},{t:3,f:0,s:1},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1}], ans:3 },
  // 5. 4 hollow, 1 hatched
  { d:1, figs:[{t:5,f:0,s:1},{t:5,f:0,s:1},{t:5,f:0,s:1},{t:5,f:0,s:1},{t:5,f:2,s:1}], ans:4 },
  // 6. 4 shapes with even sides (S,H,S,H,S), 1 with odd (T)
  { d:2, figs:[{t:4,f:0,s:1},{t:6,f:0,s:1},{t:3,f:0,s:1},{t:4,f:0,s:1},{t:6,f:0,s:1}], ans:2 },
  // 7. 4 rotated 0°, 1 rotated 90°
  { d:2, figs:[{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:90},{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:0}], ans:2 },
  // 8. 4 have inner circle, 1 has inner triangle
  { d:2, figs:[{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:3,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}}], ans:2 },
  // 9. 4 same shape different size, 1 different shape same medium size
  { d:2, figs:[{t:0,f:1,s:0},{t:0,f:1,s:1},{t:4,f:1,s:1},{t:0,f:1,s:2},{t:0,f:1,s:1}], ans:2 },
  // 10. 4 triangles with dot, 1 triangle without dot (reverse of rule)
  { d:2, figs:[{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1}], ans:4 },
  // 11. 4 polygons (3+ sides), 1 circle (no sides — belongs to different "family")
  { d:2, figs:[{t:3,f:0,s:1},{t:5,f:0,s:1},{t:0,f:0,s:1},{t:4,f:0,s:1},{t:6,f:0,s:1}], ans:2 },
  // 12. 4 large hollow, 1 small filled — TWO attributes different
  { d:3, figs:[{t:4,f:0,s:2},{t:4,f:0,s:2},{t:4,f:0,s:2},{t:4,f:1,s:0},{t:4,f:0,s:2}], ans:3 },
  // 13. 4 share property: all have inner shape; 1 is filled solid with no inner
  { d:3, figs:[{t:6,f:0,s:2,extra:{t:3,f:1}},{t:6,f:0,s:2,extra:{t:3,f:1}},{t:6,f:1,s:2},{t:6,f:0,s:2,extra:{t:3,f:1}},{t:6,f:0,s:2,extra:{t:3,f:1}}], ans:2 },
  // 14. Abstract: 4 are reflections (180° rotation) of a base shape; 1 is rotated 90° (not a reflection)
  { d:3, figs:[{t:3,f:2,s:1,r:180},{t:3,f:2,s:1,r:0},{t:3,f:2,s:1,r:180},{t:3,f:2,s:1,r:90},{t:3,f:2,s:1,r:0}], ans:3 },
];

// MATRIX ITEMS — 3×3 grid, bottom-right missing, pick from 5 choices
// Each item: rows[3][3] where rows[2][2] = null (the ? cell)
// Rules: shape/fill/size change across rows and/or down columns
const MATRICES = [
  // M1: shape changes across row (T,S,P), same across all rows. Fill same. Easy.
  { d:1,
    rows:[[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],[{t:3,f:0,s:1},{t:4,f:0,s:1},null]],
    choices:[{t:5,f:0,s:1},{t:3,f:0,s:1},{t:6,f:0,s:1},{t:4,f:0,s:1},{t:5,f:1,s:1}], ans:0 },

  // M2: fill changes down column (h,f,h), shape same. Easy.
  { d:1,
    rows:[[{t:4,f:0,s:1},{t:4,f:0,s:1},{t:4,f:0,s:1}],[{t:4,f:1,s:1},{t:4,f:1,s:1},{t:4,f:1,s:1}],[{t:4,f:0,s:1},{t:4,f:0,s:1},null]],
    choices:[{t:4,f:1,s:1},{t:3,f:0,s:1},{t:4,f:0,s:1},{t:4,f:2,s:1},{t:0,f:0,s:1}], ans:2 },

  // M3: size changes across row (s,m,l), same shape, hollow. Easy-medium.
  { d:1,
    rows:[[{t:0,f:1,s:0},{t:0,f:1,s:1},{t:0,f:1,s:2}],[{t:0,f:1,s:0},{t:0,f:1,s:1},{t:0,f:1,s:2}],[{t:0,f:1,s:0},{t:0,f:1,s:1},null]],
    choices:[{t:0,f:1,s:0},{t:0,f:0,s:2},{t:0,f:1,s:1},{t:0,f:1,s:2},{t:3,f:1,s:2}], ans:3 },

  // M4: shape changes across row, fill changes down column. Medium.
  { d:2,
    rows:[[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],[{t:3,f:1,s:1},{t:4,f:1,s:1},{t:5,f:1,s:1}],[{t:3,f:2,s:1},{t:4,f:2,s:1},null]],
    choices:[{t:5,f:1,s:1},{t:4,f:2,s:1},{t:5,f:2,s:1},{t:5,f:0,s:1},{t:3,f:2,s:1}], ans:2 },

  // M5: shape changes (T,S,P), size changes (s,m,l) — both rules active. Medium.
  { d:2,
    rows:[[{t:3,f:1,s:0},{t:4,f:1,s:1},{t:5,f:1,s:2}],[{t:3,f:0,s:0},{t:4,f:0,s:1},{t:5,f:0,s:2}],[{t:3,f:2,s:0},{t:4,f:2,s:1},null]],
    choices:[{t:5,f:2,s:1},{t:5,f:2,s:2},{t:5,f:0,s:2},{t:4,f:2,s:2},{t:5,f:2,s:0}], ans:1 },

  // M6: rotation changes: 0→90→180 across row; shape constant. Medium.
  { d:2,
    rows:[[{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:90},{t:3,f:1,s:1,r:180}],[{t:4,f:0,s:1,r:0},{t:4,f:0,s:1,r:90},{t:4,f:0,s:1,r:180}],[{t:5,f:2,s:1,r:0},{t:5,f:2,s:1,r:90},null]],
    choices:[{t:5,f:2,s:1,r:0},{t:5,f:0,s:1,r:180},{t:5,f:2,s:1,r:180},{t:3,f:2,s:1,r:180},{t:5,f:2,s:2,r:180}], ans:2 },

  // M7: inner shape changes down (no inner, dot, circle inside). Medium-hard.
  { d:2,
    rows:[[{t:4,f:0,s:2},{t:4,f:0,s:2},{t:4,f:0,s:2}],[{t:4,f:0,s:2,extra:{t:-1}},{t:4,f:0,s:2,extra:{t:-1}},{t:4,f:0,s:2,extra:{t:-1}}],[{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}},null]],
    choices:[{t:4,f:0,s:2},{t:4,f:0,s:2,extra:{t:-1}},{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:1,s:2},{t:0,f:0,s:2,extra:{t:0,f:1}}], ans:2 },

  // M8: two shapes combine rules — row: shape changes; col: fill changes. Hard.
  { d:3,
    rows:[[{t:6,f:0,s:1},{t:5,f:0,s:1},{t:3,f:0,s:1}],[{t:6,f:1,s:1},{t:5,f:1,s:1},{t:3,f:1,s:1}],[{t:6,f:2,s:1},{t:5,f:2,s:1},null]],
    choices:[{t:6,f:2,s:1},{t:3,f:2,s:2},{t:3,f:2,s:1},{t:5,f:2,s:1},{t:3,f:1,s:1}], ans:2 },

  // M9: progressive: each cell shape = previous shape + 1 side, size decrements.
  { d:3,
    rows:[[{t:3,f:1,s:2},{t:4,f:1,s:1},{t:5,f:1,s:0}],[{t:4,f:0,s:2},{t:5,f:0,s:1},{t:6,f:0,s:0}],[{t:5,f:2,s:2},{t:6,f:2,s:1},null]],
    choices:[{t:6,f:2,s:1},{t:3,f:2,s:0},{t:6,f:0,s:0},{t:5,f:2,s:0},{t:3,f:2,s:2}], ans:1 },

  // M10: alternating fill across diagonal + shape constant. Hard.
  { d:3,
    rows:[[{t:0,f:1,s:1},{t:0,f:0,s:1},{t:0,f:1,s:1}],[{t:0,f:0,s:1},{t:0,f:1,s:1},{t:0,f:0,s:1}],[{t:0,f:1,s:1},{t:0,f:0,s:1},null]],
    choices:[{t:0,f:0,s:1},{t:0,f:1,s:1},{t:3,f:1,s:1},{t:0,f:2,s:1},{t:0,f:0,s:2}], ans:1 },

  // M11: size increases diagonally. Hard.
  { d:3,
    rows:[[{t:4,f:0,s:0},{t:4,f:0,s:0},{t:4,f:0,s:1}],[{t:4,f:0,s:0},{t:4,f:0,s:1},{t:4,f:0,s:2}],[{t:4,f:0,s:1},{t:4,f:0,s:2},null]],
    choices:[{t:4,f:0,s:1},{t:4,f:0,s:2},{t:4,f:1,s:2},{t:0,f:0,s:2},{t:4,f:0,s:0}], ans:1 },

  // M12: Hardest — combined rule: across row: shape cycle (T→S→P); down col: fill cycle (h→f→ha); missing = P,ha,l
  { d:3,
    rows:[[{t:3,f:0,s:2},{t:4,f:0,s:2},{t:5,f:0,s:2}],[{t:3,f:1,s:2},{t:4,f:1,s:2},{t:5,f:1,s:2}],[{t:3,f:2,s:2},{t:4,f:2,s:2},null]],
    choices:[{t:4,f:2,s:2},{t:5,f:0,s:2},{t:5,f:1,s:2},{t:5,f:2,s:2},{t:3,f:2,s:2}], ans:3 },
];

// CONDITIONS ITEMS — reference box shows shape + dot position; pick matching choice
// dot position: "in"=inside, "out"=outside, "tl"=top-left, "tr"=top-right, "bl"=bottom-left, "br"=bottom-right, "top","bot","left","right"
const CONDITIONS = [
  // C1: Dot inside circle — pick the one with dot inside (not outside)
  { d:1, ref:{shape:0, dot:"in"},
    choices:[{shape:0,dot:"out"},{shape:0,dot:"in"},{shape:3,dot:"in"},{shape:0,dot:"out"},{shape:0,dot:"top"}], ans:1 },
  // C2: Dot outside circle (below) — pick matching
  { d:1, ref:{shape:0, dot:"bot"},
    choices:[{shape:0,dot:"in"},{shape:0,dot:"top"},{shape:0,dot:"bot"},{shape:3,dot:"bot"},{shape:0,dot:"left"}], ans:2 },
  // C3: Dot inside square, upper-left zone
  { d:2, ref:{shape:4, dot:"tl"},
    choices:[{shape:4,dot:"tr"},{shape:4,dot:"bl"},{shape:4,dot:"tl"},{shape:4,dot:"br"},{shape:0,dot:"tl"}], ans:2 },
  // C4: Dot outside triangle, to the right
  { d:2, ref:{shape:3, dot:"right"},
    choices:[{shape:3,dot:"left"},{shape:3,dot:"right"},{shape:3,dot:"top"},{shape:3,dot:"in"},{shape:4,dot:"right"}], ans:1 },
  // C5: Dot at top of pentagon
  { d:2, ref:{shape:5, dot:"top"},
    choices:[{shape:5,dot:"in"},{shape:5,dot:"bot"},{shape:6,dot:"top"},{shape:5,dot:"top"},{shape:5,dot:"left"}], ans:3 },
  // C6: Dot between two nested shapes: inside outer, outside inner
  { d:3, ref:{shape:4, dot:"in"}, // square with circle inside, dot is in square but outside circle
    choices:[{shape:4,dot:"out"},{shape:4,dot:"in"},{shape:0,dot:"in"},{shape:4,dot:"tl"},{shape:4,dot:"br"}], ans:1 },
  // C7: Dot at bottom-right of hexagon
  { d:3, ref:{shape:6, dot:"br"},
    choices:[{shape:6,dot:"tr"},{shape:6,dot:"bl"},{shape:6,dot:"br"},{shape:6,dot:"in"},{shape:3,dot:"br"}], ans:2 },
  // C8: Dot at left of shape
  { d:3, ref:{shape:5, dot:"left"},
    choices:[{shape:5,dot:"right"},{shape:5,dot:"top"},{shape:5,dot:"left"},{shape:5,dot:"bot"},{shape:6,dot:"left"}], ans:2 },
];

// ══════════════════════════════════════════════════════════════════════════════
//  CONDITIONS RENDERER — shows shape + dot in specified position
// ══════════════════════════════════════════════════════════════════════════════
function CondFig({ shape=0, dot="in", dim=52 }) {
  const c = dim / 2, r = dim / 2 - 6;
  const sid = "#1e3a5f";
  const poly = (n) => Array.from({length:n}, (_,i) => {
    const a = i * 2 * Math.PI / n - Math.PI / 2;
    return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
  }).join(" ");
  const shapeEl = shape === 0 ? <circle cx={c} cy={c} r={r} fill="none" stroke={sid} strokeWidth={1.8}/>
    : <polygon points={poly(shape)} fill="none" stroke={sid} strokeWidth={1.8}/>;
  const dotPositions = {
    in:    [c, c],         out:  [c, dim - 4],
    top:   [c, 3],         bot:  [c, dim - 3],
    left:  [3, c],         right:[dim - 3, c],
    tl:    [c*0.4, c*0.4], tr:   [c*1.6, c*0.4],
    bl:    [c*0.4, c*1.6], br:   [c*1.6, c*1.6],
  };
  const [dx, dy] = dotPositions[dot] || [c, c];
  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
      {shapeEl}
      <circle cx={dx} cy={dy} r={3.2} fill="#1e3a5f"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PRACTICE ITEM
// ══════════════════════════════════════════════════════════════════════════════
const PRACTICE = {
  seq: [{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],
  choices: [{t:0,f:0,s:1},{t:6,f:0,s:1},{t:3,f:1,s:1},{t:4,f:0,s:1},{t:5,f:0,s:2}],
  ans: 1,
};

// ══════════════════════════════════════════════════════════════════════════════
//  SCSS DATA (Dr Pangaonkar, CIBS — from SCST_Clinical_2)
// ══════════════════════════════════════════════════════════════════════════════
const SHAPES_SCSS = [{code:1,name:"Circle"},{code:2,name:"Triangle"},{code:3,name:"Square"},{code:4,name:"Rhombus"},{code:5,name:"Pentagon"},{code:6,name:"Hexagon"},{code:7,name:"Octagon"}];
const COLORS_SCSS = [{code:1,name:"Red",hex:"#EF4444"},{code:2,name:"Orange",hex:"#F97316"},{code:3,name:"Yellow",hex:"#EAB308"},{code:4,name:"Green",hex:"#22C55E"},{code:5,name:"Blue",hex:"#3B82F6"},{code:6,name:"Indigo",hex:"#6366F1"},{code:7,name:"Violet",hex:"#A855F7"}];
const SMILEYS_SCSS = [{code:1,name:"Very Happy",emoji:"😄"},{code:2,name:"Happy",emoji:"🙂"},{code:3,name:"Calm",emoji:"😐"},{code:4,name:"Worried",emoji:"😟"},{code:5,name:"Sad",emoji:"😢"},{code:6,name:"Angry",emoji:"😠"},{code:7,name:"Scared",emoji:"😨"}];
const SHAPE_DATA = {1:{name:"Circle",complexity:3,cogStyle:"Holistic-Integrative",BFopen:5,BFcons:3,BFextra:5,BFagree:6,BFneuro:3},2:{name:"Triangle",complexity:4,cogStyle:"Analytical-Sequential",BFopen:5,BFcons:5,BFextra:4,BFagree:3,BFneuro:4},3:{name:"Square",complexity:2,cogStyle:"Practical-Systematic",BFopen:2,BFcons:7,BFextra:3,BFagree:5,BFneuro:3},4:{name:"Rhombus",complexity:5,cogStyle:"Adaptive-Creative",BFopen:6,BFcons:4,BFextra:5,BFagree:4,BFneuro:3},5:{name:"Pentagon",complexity:6,cogStyle:"Divergent-Exploratory",BFopen:7,BFcons:3,BFextra:4,BFagree:4,BFneuro:4},6:{name:"Hexagon",complexity:6,cogStyle:"Systemic-Precise",BFopen:5,BFcons:7,BFextra:3,BFagree:5,BFneuro:2},7:{name:"Octagon",complexity:5,cogStyle:"Tenacious-Enduring",BFopen:4,BFcons:6,BFextra:3,BFagree:4,BFneuro:3}};
const COLOR_DATA = {1:{name:"Red",temp:"hot",arousal:7,valence:4,BFextra:7,BFneuro:6,physArousal:"High",socialWarm:6},2:{name:"Orange",temp:"warm",arousal:6,valence:6,BFextra:6,BFneuro:4,physArousal:"Elevated",socialWarm:7},3:{name:"Yellow",temp:"warm",arousal:5,valence:7,BFextra:5,BFneuro:3,physArousal:"Moderate",socialWarm:6},4:{name:"Green",temp:"cool",arousal:4,valence:6,BFextra:4,BFneuro:2,physArousal:"Moderate",socialWarm:5},5:{name:"Blue",temp:"cool",arousal:3,valence:6,BFextra:3,BFneuro:2,physArousal:"Low",socialWarm:4},6:{name:"Indigo",temp:"dark-cool",arousal:3,valence:4,BFextra:2,BFneuro:4,physArousal:"Low",socialWarm:3},7:{name:"Violet",temp:"dark-cool",arousal:4,valence:4,BFextra:2,BFneuro:5,physArousal:"Low",socialWarm:3}};
const SHADE_DATA = {1:{label:"Shade 1 (Lightest)",rawEmo:95,mentalBurden:5,emotOpen:95,ruminScore:5},2:{label:"Shade 2 (Light)",rawEmo:82,mentalBurden:15,emotOpen:82,ruminScore:12},3:{label:"Shade 3",rawEmo:70,mentalBurden:28,emotOpen:68,ruminScore:22},4:{label:"Shade 4 (Medium)",rawEmo:55,mentalBurden:44,emotOpen:52,ruminScore:38},5:{label:"Shade 5",rawEmo:40,mentalBurden:58,emotOpen:36,ruminScore:55},6:{label:"Shade 6 (Dark)",rawEmo:28,mentalBurden:73,emotOpen:22,ruminScore:70},7:{label:"Shade 7 (Darkest)",rawEmo:15,mentalBurden:88,emotOpen:10,ruminScore:85}};
const SMILEY_DATA = {1:{name:"Very Happy",valence:95,arousal:72,negAffect:5,anx:3,dep:3,anger:3,fear:3},2:{name:"Happy",valence:80,arousal:58,negAffect:15,anx:10,dep:10,anger:8,fear:8},3:{name:"Calm",valence:65,arousal:32,negAffect:28,anx:20,dep:18,anger:12,fear:15},4:{name:"Worried",valence:35,arousal:62,negAffect:58,anx:65,dep:38,anger:30,fear:55},5:{name:"Sad",valence:20,arousal:22,negAffect:75,anx:35,dep:78,anger:22,fear:40},6:{name:"Angry",valence:15,arousal:88,negAffect:80,anx:42,dep:35,anger:88,fear:35},7:{name:"Scared",valence:10,arousal:72,negAffect:85,anx:88,dep:55,anger:30,fear:88}};

function iqBand(cq){if(cq>=130)return{band:"Very Superior",percentile:"≥98th"};if(cq>=120)return{band:"Superior",percentile:"91–97th"};if(cq>=110)return{band:"High Average",percentile:"75–90th"};if(cq>=90)return{band:"Average",percentile:"25–74th"};if(cq>=80)return{band:"Low Average",percentile:"9–24th"};if(cq>=70)return{band:"Borderline",percentile:"2–8th"};return{band:"Intellectually Limited",percentile:"<2nd"};}
function eqBand(eq){if(eq>=115)return{band:"Well Above Average",percentile:"≥84th"};if(eq>=100)return{band:"Above Average",percentile:"50–83rd"};if(eq>=85)return{band:"Average",percentile:"16–49th"};if(eq>=70)return{band:"Below Average",percentile:"2–15th"};return{band:"Well Below Average",percentile:"<2nd"};}
function phqAnalog(score){if(score<=10)return{level:"None to Minimal",severity:0};if(score<=25)return{level:"Mild",severity:1};if(score<=50)return{level:"Moderate",severity:2};if(score<=75)return{level:"Moderately Severe",severity:3};return{level:"Severe",severity:4};}
function riskLevel(score){if(score<=15)return{level:"Not Indicated",color:"#16a34a",bg:"#f0fdf4",border:"#86efac",flag:0};if(score<=35)return{level:"Low",color:"#65a30d",bg:"#f7fee7",border:"#bef264",flag:1};if(score<=55)return{level:"Moderate",color:"#d97706",bg:"#fffbeb",border:"#fcd34d",flag:2};if(score<=75)return{level:"Elevated",color:"#ea580c",bg:"#fff7ed",border:"#fdba74",flag:3};return{level:"High",color:"#dc2626",bg:"#fef2f2",border:"#fca5a5",flag:4};}

function computeClinical(sSeq,cSeq,shSeq,smSeq){
  const W=[7,6,5,4,3,2,1];
  const s0=sSeq[0],c0=cSeq[0],sh0=shSeq[0],sm0=smSeq[0];
  const SD=SHADE_DATA,CD=COLOR_DATA,SMD=SMILEY_DATA,SHD=SHAPE_DATA;

  // D1: COGNITIVE
  let wtd=0,maxWtd=0;
  sSeq.forEach((code,i)=>{wtd+=SHD[code].complexity*W[i];maxWtd+=7*W[i];});
  const rawCog=(wtd/maxWtd)*100;
  const CQ=Math.round(55+(rawCog/100)*90);
  const iq=iqBand(CQ);
  const cogFlex=Math.abs(SHD[sSeq[0]].complexity-SHD[sSeq[6]].complexity);
  const flexLabel=cogFlex>=4?"High":cogFlex>=2?"Moderate":"Restricted";
  const isWarm=["hot","warm"].includes(CD[c0].temp);
  const isDarkCool=CD[c0].temp==="dark-cool";
  const isAngular=[2,4,5].includes(s0),isRounded=s0===1,isSymm=[3,6].includes(s0);
  const procOrient=isWarm?"Action-Oriented / Externally Motivated":isDarkCool?"Reflective / Internally Motivated":"Balanced Processing Orientation";
  const midComplexity=SHD[sSeq[3]].complexity;
  const midLabel=midComplexity>=5?"High-Complexity Neutral Baseline":midComplexity>=4?"Mid-Range Baseline":"Low-Complexity Neutral Baseline";
  const d1={CQ,iqBand:iq,primaryStyle:SHD[s0].cogStyle,secondaryStyle:SHD[sSeq[1]].cogStyle,
    flexIndex:cogFlex,flexLabel,procOrient,rawCog:Math.round(rawCog),
    topShape:SHD[sSeq[0]],secondShape:SHD[sSeq[1]],midShape:SHD[sSeq[3]],botShape:SHD[sSeq[6]],
    midLabel,colorInfluence:CD[c0].name};

  // D2: PERSONALITY
  const shapeW=0.6,colorW=0.4;
  let BF={O:0,C:0,E:0,A:0,N:0};
  sSeq.forEach((code,i)=>{const sh=SHD[code];const w=W[i]/28;BF.O+=sh.BFopen*w*shapeW;BF.C+=sh.BFcons*w*shapeW;BF.E+=sh.BFextra*w*shapeW;BF.A+=sh.BFagree*w*shapeW;BF.N+=sh.BFneuro*w*shapeW;});
  const col=CD[c0];BF.E+=col.BFextra/7*colorW;BF.N+=col.BFneuro/7*colorW;
  BF.N+=SD[sh0].mentalBurden/100*0.3;BF.N=Math.min(BF.N,1.0);
  const BFt={};["O","C","E","A","N"].forEach(k=>{BFt[k]=Math.round(30+BF[k]*40);});
  const hN=BFt.N>=55,lE=BFt.E<45;
  let dsmCluster,dsmFeatures,dsmDesc,dsmClinical;
  if(isDarkCool&&(isAngular||s0===7)&&lE){
    dsmCluster="Cluster A Alignment";dsmFeatures="Schizoid / Schizotypal features";
    dsmDesc="Tendency towards social withdrawal, restricted emotional expression, preference for solitary activity, possible unconventional thinking patterns.";
    dsmClinical="Assess for flat affect, anhedonia, social isolation. Rule out prodromal schizophrenia spectrum in younger subjects.";
  }else if(isWarm&&isAngular&&(hN||BFt.E>=58)){
    dsmCluster="Cluster B Alignment";dsmFeatures="Borderline / Histrionic / Narcissistic features";
    dsmDesc="Tendency towards emotional intensity, impulsivity, attention-seeking, affective instability, and interpersonal boundary difficulties.";
    dsmClinical="Assess for impulsivity, affective dysregulation, identity instability. Screen for trauma history. Monitor for externalising behaviours.";
  }else if(!isWarm&&(isRounded||isSymm)&&hN){
    dsmCluster="Cluster C Alignment";dsmFeatures="Avoidant / Dependent / OCPD features";
    dsmDesc="Tendency towards anxiety-based inhibition, rigid rule adherence, excessive need for reassurance, fear of criticism.";
    dsmClinical="Assess for generalised anxiety, social anxiety features, perfectionism. Consider impact on daily functioning and relationships.";
  }else{
    dsmCluster="No Significant Cluster Alignment";dsmFeatures="Adaptive personality organisation";
    dsmDesc="No clinically significant personality cluster alignment. Subject demonstrates balanced adaptive traits with context-appropriate behavioural flexibility.";
    dsmClinical="No specific personality-based clinical concerns at this time. Supportive monitoring sufficient.";
  }
  const bfDesc={
    O:BFt.O>=55?"Elevated — high intellectual curiosity, openness, creative ideation":BFt.O<45?"Reduced — preference for conventional, concrete approaches":"Within average range",
    C:BFt.C>=55?"Elevated — high self-discipline, organisation, goal-directedness":BFt.C<45?"Reduced — may present with impulsivity, difficulty sustaining effort":"Within average range",
    E:BFt.E>=55?"Elevated — socially outgoing, high energy, assertive":BFt.E<45?"Reduced — reserved, socially selective, prefers limited stimulation":"Within average range",
    A:BFt.A>=55?"Elevated — cooperative, prosocial, trusting, conflict-avoidant":BFt.A<45?"Reduced — competitive, sceptical, challenging of authority":"Within average range",
    N:BFt.N>=55?"Elevated — marked emotional reactivity, vulnerability to distress":BFt.N<45?"Reduced — emotionally stable, resilient, low distress susceptibility":"Within average range",
  };
  const d2={BFt,bfDesc,dsmCluster,dsmFeatures,dsmDesc,dsmClinical};

  // D3: EMOTIONAL INTELLIGENCE
  const shadeEmo=SD[sh0].rawEmo;const smVal=SMD[sm0].valence;
  const shEQmod=isRounded?10:isAngular?-8:isSymm?4:2;
  const cEQmod=["cool"].includes(CD[c0].temp)?8:isDarkCool?0:isWarm?-4:0;
  const rawEQ=Math.min(100,Math.max(0,shadeEmo*0.5+smVal*0.3+shEQmod+cEQmod));
  const EQSS=Math.round(55+(rawEQ/100)*90);
  const eqB=eqBand(EQSS);
  const selfAwareness=Math.min(100,Math.round(SD[sh0].emotOpen*0.7+smVal*0.3));
  const emoRegulation=Math.min(100,Math.round(shadeEmo*0.6+(100-SMD[sm0].negAffect)*0.4));
  const emoResilience=Math.min(100,Math.round(rawCog*0.3+shadeEmo*0.4+(100-SD[sh0].ruminScore)*0.3));
  const ESI=Math.round((selfAwareness+emoRegulation+emoResilience)/3);
  const affValence=smVal>=70?"Positive":smVal>=45?"Neutral-Mixed":smVal>=25?"Negative-Mild":"Negative-Significant";
  const d3={EQSS,eqBand:eqB,rawEQ:Math.round(rawEQ),ESI,selfAwareness,emoRegulation,emoResilience,
    shadePrimary:SD[sh0],affState:SMD[sm0].name,affValence,ruminScore:SD[sh0].ruminScore};

  // D4: HEALTH
  const distressRaw=Math.round(SMD[sm0].negAffect*0.35+SD[sh0].mentalBurden*0.35+SMD[sm0].dep*0.15+SMD[sm0].anx*0.15);
  const MHI=100-distressRaw;
  const phqA=phqAnalog(distressRaw);
  const anxIdx=Math.round(SMD[sm0].anx*0.6+SD[sh0].ruminScore*0.4);
  const depIdx=Math.round(SMD[sm0].dep*0.6+SD[sh0].mentalBurden*0.4);
  const physScore=Math.round(100-(CD[c0].arousal-1)*12+(isRounded?5:isAngular?-4:0));
  const physNorm=Math.min(95,Math.max(25,physScore));
  const physArousal=CD[c0].physArousal||"Moderate";
  const socRaw=Math.round(CD[c0].socialWarm/7*50+(isRounded?50:isAngular?30:40)+SMD[sm0].valence*0.15);
  const SFI=Math.min(95,Math.max(20,socRaw));
  const sfLevel=SFI>=70?"Adequate – Social engagement indicators within functional range":SFI>=50?"Moderate – Some social withdrawal indicated":"Limited – Significant social isolation indicated";
  const overallWBI=Math.round((MHI+physNorm+SFI)/3);
  const d4={MHI,distressRaw,phqAnalog:phqA,
    anxIdx,anxLevel:anxIdx>=70?"Elevated":anxIdx>=45?"Moderate":anxIdx>=25?"Mild":"Minimal",
    depIdx,depLevel:depIdx>=70?"Elevated":depIdx>=45?"Moderate":depIdx>=25?"Mild":"Minimal",
    physArousal,physNorm,SFI,sfLevel,overallWBI};

  // D5: RISK
  const SIR_raw=Math.round(SD[sh0].ruminScore*0.3+SMD[sm0].dep*0.25+SD[sh0].mentalBurden*0.25+(isDarkCool?15:0)+(sm0>=5?SMD[sm0].fear*0.2:0));
  const SUR_raw=Math.round(SMD[sm0].negAffect*0.25+SD[sh0].mentalBurden*0.20+CD[c0].arousal/7*35+(isAngular?15:0)+(isWarm&&sm0>=4?15:0));
  const CDR_raw=Math.round(SMD[sm0].anger*0.30+SMD[sm0].negAffect*0.20+CD[c0].arousal/7*25+(isAngular&&isWarm?20:0)+(sm0===6?20:0));
  const SIR=riskLevel(SIR_raw),SUR=riskLevel(SUR_raw),CDR=riskLevel(CDR_raw);
  const SIR_indicators=[];
  if(sh0>=6)SIR_indicators.push("Dark shade preference — elevated emotional burden indicator");
  if(sm0>=5)SIR_indicators.push("Primary affect "+SMD[sm0].name+" — high negative valence");
  if(isDarkCool)SIR_indicators.push("Dark-cool colour — social withdrawal indicator");
  if(s0===2&&sm0>=4)SIR_indicators.push("Angular primary shape with negative affect — stress reactivity");
  if(SIR_indicators.length===0)SIR_indicators.push("No significant visual indicators for elevated risk");
  const SUR_indicators=[];
  if(isWarm&&CD[c0].arousal>=6)SUR_indicators.push("High-arousal warm colour — sensation-seeking tendency");
  if(isAngular&&sm0>=4)SUR_indicators.push("Angular shape with negative affect — impulsivity-distress pairing");
  if(SD[sh0].mentalBurden>=60)SUR_indicators.push("Elevated emotional burden — risk of maladaptive coping");
  if(SUR_indicators.length===0)SUR_indicators.push("No significant visual indicators for elevated risk");
  const CDR_indicators=[];
  if(sm0===6)CDR_indicators.push("Primary affect — Anger — high aggression indicator");
  if(isAngular&&isWarm)CDR_indicators.push("Angular shape + warm colour — dominance-aggression pairing");
  if(CD[c0].arousal>=6)CDR_indicators.push("High physiological arousal colour — low frustration tolerance");
  if(CDR_indicators.length===0)CDR_indicators.push("No significant visual indicators for elevated risk");
  const maxFlag=Math.max(SIR.flag,SUR.flag,CDR.flag);
  const CRI=maxFlag===0?"Minimal":maxFlag===1?"Low — Monitor":maxFlag===2?"Moderate — Intervention Indicated":maxFlag===3?"Significant — Priority Referral":"Urgent — Immediate Evaluation Required";
  const CRI_color=maxFlag<=1?"#16a34a":maxFlag===2?"#d97706":maxFlag===3?"#ea580c":"#dc2626";
  const d5={SIR,SIR_raw,SIR_indicators,SUR,SUR_raw,SUR_indicators,CDR,CDR_raw,CDR_indicators,CRI,CRI_color,maxFlag};

  const meta={shapeCode:sSeq.join(""),colorCode:cSeq.join(""),shadeCode:shSeq.join(""),smileyCode:smSeq.join(""),
    firstShape:SHAPE_DATA[s0].name,firstColor:COLOR_DATA[c0].name,
    firstShade:SHADE_DATA[sh0].label,firstSmiley:SMILEY_DATA[sm0].name};
  return{d1,d2,d3,d4,d5,meta};
}

// SCSS SHAPES SVG
function ShapeSCSS({code,fill="#1e40af",size=48}){
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
  </svg>);}

function generateShades(hex){try{const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0;if(max!==min){const d=max-min;s=(max+min)>1?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}const hd=Math.round(h*360),sp=Math.round(Math.max(s,0.5)*100);return[88,76,63,50,38,26,14].map((lp,i)=>({code:i+1,hex:`hsl(${hd},${sp}%,${lp}%)`}));}catch{return Array.from({length:7},(_,i)=>({code:i+1,hex:`hsl(0,0%,${88-11*i}%)`}));}}

function StaticCircle({items,onSelect,renderItem}){
  const[ready,setReady]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setReady(true),80);return()=>clearTimeout(t);},[]);
  const n=items.length;
  const vw=typeof window!=="undefined"?Math.min(window.innerWidth,520):400;
  const radius=Math.min(130,Math.max(90,vw*0.24));
  const itemSize=Math.min(70,Math.max(54,radius*0.52));
  const cs=radius*2+itemSize+10,cx=cs/2;
  return(<div style={{position:"relative",width:cs,height:cs,maxWidth:"100%",margin:"0 auto",flexShrink:0}}>
    <svg style={{position:"absolute",top:0,left:0,pointerEvents:"none"}} width={cs} height={cs}><circle cx={cx} cy={cx} r={radius} fill="none" stroke="rgba(30,64,175,0.12)" strokeWidth={1.5} strokeDasharray="5 5"/></svg>
    {items.map((item,idx)=>{
      const angle=(idx/n)*2*Math.PI-Math.PI/2;
      const tx=cx+radius*Math.cos(angle)-itemSize/2,ty=cx+radius*Math.sin(angle)-itemSize/2;
      return(<div key={item.code} onClick={()=>onSelect(item)} style={{position:"absolute",width:itemSize,height:itemSize,top:ready?ty:cx-itemSize/2,left:ready?tx:cx-itemSize/2,opacity:ready?1:0,transition:`top 0.5s cubic-bezier(0.34,1.4,0.64,1) ${idx*50}ms,left 0.5s cubic-bezier(0.34,1.4,0.64,1) ${idx*50}ms,opacity 0.3s ease ${idx*50}ms,transform 0.18s ease`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:"white",borderRadius:"50%",boxShadow:"0 3px 14px rgba(0,0,0,0.1),0 0 0 1.5px rgba(30,64,175,0.15)",userSelect:"none",touchAction:"manipulation",zIndex:2}}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.12)";e.currentTarget.style.boxShadow="0 6px 22px rgba(30,64,175,0.25),0 0 0 2.5px rgba(30,64,175,0.45)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.1),0 0 0 1.5px rgba(30,64,175,0.15)";}}
      >{renderItem(item,Math.round(itemSize*0.55))}</div>);
    })}
  </div>);}

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
      {Array.from({length:7},(_,i)=>(<div key={i} style={{width:28,height:28,borderRadius:"50%",background:i<selected.length?ac:"rgba(30,64,175,0.05)",color:i<selected.length?"white":`${ac}70`,border:i<selected.length?`2px solid ${ac}`:`1.5px dashed ${ac}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>{i<selected.length?"✓":i+1}</div>))}
    </div>
    {remaining.length>0
      ?<StaticCircle key={`${stageKey}-${remaining.length}`} items={remaining} onSelect={pick} renderItem={(item,sz)=>renderItem(item,sz)}/>
      :<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>✅</div>
    }
    {selected.length>0&&(<div style={{width:"100%",maxWidth:400,background:"rgba(30,64,175,0.02)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(30,64,175,0.08)"}}>
      <div style={{fontSize:9,fontWeight:700,color:ac,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Selection order — Position 1 (most liked) → 7</div>
      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>{selected.map((item,idx)=>(<div key={item.code} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:32,height:32,borderRadius:"50%",background:"white",border:`2px solid ${idx===0?ac:`${ac}28`}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{renderItem(item,19)}</div><span style={{fontSize:8,color:"#9CA3AF",fontWeight:700}}>{idx+1}</span></div>))}</div>
    </div>)}
  </div>);}

// ══════════════════════════════════════════════════════════════════════════════
//  TIMER COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function Timer({ totalSecs, onTimeout, t }) {
  const [remaining, setRemaining] = useState(totalSecs);
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current); onTimeout(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);
  const pct = (remaining / totalSecs) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const col = pct > 40 ? "#0d9488" : pct > 15 ? "#d97706" : "#dc2626";
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3,transition:"width 1s linear"}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color:col,minWidth:42,textAlign:"right",fontFamily:"'Courier New',monospace"}}>
        {mins}:{String(secs).padStart(2,"0")}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  FIG DISPLAY CELL
// ══════════════════════════════════════════════════════════════════════════════
function FigBox({ fig, size=52, selected=false, onClick=null, label=null }) {
  const isMulti = fig && fig.figs;
  const style = {
    width:size, height:size, border:`${selected?"2.5px solid #0d5c6e":"1.5px solid #e2e8f0"}`,
    borderRadius:8, background:selected?"#e0f2fe":"#fafafa",
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:onClick?"pointer":"default", transition:"all 0.15s", flexShrink:0,
    boxShadow:selected?"0 0 0 3px #bae6fd":"none",
  };
  return (
    <div style={style} onClick={onClick}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor="#0d9488";e.currentTarget.style.background="#f0fdfa";}}}
      onMouseLeave={e=>{if(onClick&&!selected){e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="#fafafa";}}}>
      {isMulti ? <MultiFig figs={fig.figs} dim={size-6}/> : fig ? <Fig {...fig} dim={size-6}/> : <span style={{fontSize:18,color:"#94a3b8",fontWeight:700}}>?</span>}
      {label && <div style={{position:"absolute",bottom:-18,left:0,right:0,textAlign:"center",fontSize:11,color:"#64748b",fontWeight:600}}>{label}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUBTEST RENDERERS
// ══════════════════════════════════════════════════════════════════════════════
function SeriesSubtest({ onComplete, t }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const item = SERIES[idx];

  const confirm = (choiceIdx) => {
    setSelected(choiceIdx);
    setConfirmed(true);
    setTimeout(() => {
      const newAns = {...answers, [idx]: choiceIdx};
      setAnswers(newAns);
      setSelected(null); setConfirmed(false);
      if (idx + 1 >= SERIES.length) { onComplete(newAns); }
      else { setIdx(idx + 1); }
    }, 500);
  };

  const skip = () => {
    const newAns = {...answers, [idx]: -1};
    setAnswers(newAns);
    if (idx + 1 >= SERIES.length) { onComplete(newAns); }
    else { setIdx(idx + 1); }
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <span style={{fontSize:12,color:"#64748b"}}>{idx+1} / {SERIES.length}</span>
        <div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${(idx/SERIES.length)*100}%`,height:"100%",background:"#0d9488"}}/>
        </div>
      </div>
      <p style={{fontSize:13,color:"#374151",marginBottom:14,fontWeight:500}}>What comes next in the pattern?</p>
      {/* Sequence row */}
      <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
        {item.seq.map((fig,i) => <FigBox key={i} fig={fig} size={54}/>)}
        <div style={{width:54,height:54,border:"2px dashed #0d9488",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:"#f0fdfa"}}>
          <span style={{fontSize:20,color:"#0d9488",fontWeight:800}}>?</span>
        </div>
      </div>
      {/* Choices */}
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {item.choices.map((fig,i) => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <FigBox fig={fig} size={54} selected={selected===i} onClick={() => !confirmed && confirm(i)}/>
            <span style={{fontSize:12,fontWeight:700,color:selected===i?"#0d5c6e":"#94a3b8"}}>{i+1}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
        <button onClick={skip} style={{padding:"6px 14px",borderRadius:7,background:"#f1f5f9",color:"#64748b",border:"none",fontSize:12,cursor:"pointer"}}>{t.skip}</button>
      </div>
    </div>
  );
}

function ClassifSubtest({ onComplete, t }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const item = CLASSIF[idx];

  const confirm = (choiceIdx) => {
    setSelected(choiceIdx);
    setTimeout(() => {
      const newAns = {...answers, [idx]: choiceIdx};
      setAnswers(newAns);
      setSelected(null);
      if (idx + 1 >= CLASSIF.length) { onComplete(newAns); }
      else { setIdx(idx + 1); }
    }, 500);
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <span style={{fontSize:12,color:"#64748b"}}>{idx+1} / {CLASSIF.length}</span>
        <div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${(idx/CLASSIF.length)*100}%`,height:"100%",background:"#7c3aed"}}/>
        </div>
      </div>
      <p style={{fontSize:13,color:"#374151",marginBottom:14,fontWeight:500}}>Which one is different from the others?</p>
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {item.figs.map((fig,i) => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <FigBox fig={fig} size={58} selected={selected===i} onClick={() => selected===null && confirm(i)}/>
            <span style={{fontSize:12,fontWeight:700,color:selected===i?"#7c3aed":"#94a3b8"}}>{i+1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixSubtest({ onComplete, t }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const item = MATRICES[idx];
  const cellSz = 50;

  const confirm = (choiceIdx) => {
    setSelected(choiceIdx);
    setTimeout(() => {
      const newAns = {...answers, [idx]: choiceIdx};
      setAnswers(newAns);
      setSelected(null);
      if (idx + 1 >= MATRICES.length) { onComplete(newAns); }
      else { setIdx(idx + 1); }
    }, 500);
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <span style={{fontSize:12,color:"#64748b"}}>{idx+1} / {MATRICES.length}</span>
        <div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${(idx/MATRICES.length)*100}%`,height:"100%",background:"#1d4ed8"}}/>
        </div>
      </div>
      <p style={{fontSize:13,color:"#374151",marginBottom:14,fontWeight:500}}>Which picture completes the grid?</p>
      {/* 3×3 grid */}
      <div style={{display:"inline-grid",gridTemplateColumns:`repeat(3,${cellSz}px)`,gap:3,border:"2px solid #1d4ed8",borderRadius:8,padding:4,marginBottom:16,background:"#eff6ff"}}>
        {item.rows.flatMap((row, ri) => row.map((cell, ci) =>
          cell ? <FigBox key={`${ri}-${ci}`} fig={cell} size={cellSz}/>
               : <div key={`${ri}-${ci}`} style={{width:cellSz,height:cellSz,border:"2px dashed #1d4ed8",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:"white"}}>
                   <span style={{fontSize:18,color:"#1d4ed8",fontWeight:800}}>?</span>
                 </div>
        ))}
      </div>
      {/* Choices */}
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {item.choices.map((fig,i) => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <FigBox fig={fig} size={52} selected={selected===i} onClick={() => selected===null && confirm(i)}/>
            <span style={{fontSize:12,fontWeight:700,color:selected===i?"#1d4ed8":"#94a3b8"}}>{i+1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CondSubtest({ onComplete, t }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const item = CONDITIONS[idx];
  const cellSz = 56;

  const confirm = (choiceIdx) => {
    setSelected(choiceIdx);
    setTimeout(() => {
      const newAns = {...answers, [idx]: choiceIdx};
      setAnswers(newAns);
      setSelected(null);
      if (idx + 1 >= CONDITIONS.length) { onComplete(newAns); }
      else { setIdx(idx + 1); }
    }, 500);
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <span style={{fontSize:12,color:"#64748b"}}>{idx+1} / {CONDITIONS.length}</span>
        <div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${(idx/CONDITIONS.length)*100}%`,height:"100%",background:"#0891b2"}}/>
        </div>
      </div>
      <p style={{fontSize:13,color:"#374151",marginBottom:10,fontWeight:500}}>Which choice follows the same rule as the example?</p>
      {/* Reference */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{border:"2px solid #0891b2",borderRadius:8,padding:4,background:"#ecfeff"}}>
          <CondFig shape={item.ref.shape} dot={item.ref.dot} dim={cellSz}/>
        </div>
        <span style={{fontSize:22,color:"#94a3b8",fontWeight:700}}>→</span>
        <span style={{fontSize:12,color:"#64748b"}}>Choose the one that shows the same dot rule</span>
      </div>
      {/* Choices */}
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        {item.choices.map((c,i) => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{width:cellSz,height:cellSz,border:`${selected===i?"2.5px solid #0891b2":"1.5px solid #e2e8f0"}`,borderRadius:8,background:selected===i?"#ecfeff":"#fafafa",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s",boxShadow:selected===i?"0 0 0 3px #a5f3fc":"none"}} onClick={() => selected===null && confirm(i)}>
              <CondFig shape={c.shape} dot={c.dot} dim={cellSz-6}/>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:selected===i?"#0891b2":"#94a3b8"}}>{i+1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Score a subtest's answers against correct answers
function scoreSubtest(answers, items) {
  let correct = 0;
  Object.entries(answers).forEach(([idx, chosen]) => {
    if (chosen === items[parseInt(idx)].ans) correct++;
  });
  return correct;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLAUDE API — COMBINED NARRATIVE GENERATOR
// ══════════════════════════════════════════════════════════════════════════════
async function generateNarrative(fisResult, scss, childInfo) {
  const prompt = `You are a senior child clinical psychologist at CIBS Nagpur writing a combined eSMART-C assessment report. Write in warm, professional language appropriate for both a clinician and a concerned parent.

CHILD: ${childInfo.name||"Subject"}, Age ${childInfo.age||"—"} years, ${childInfo.gender==="F"?"Female":"Male"}, School: ${childInfo.school||"—"}

PART 1 — CIBS-FIS (Fluid Intelligence, Cattell norms):
IQ Estimate: ${fisResult.iq} | Mental Age: ${fisResult.ma} years | Band: ${fisResult.band}
Percentile: ${fisResult.pct}th | Scale: ${fisResult.scale} | Items correct: ${fisResult.total}/${fisResult.maxRaw}
Educational recommendation: ${fisResult.edu}

PART 2 — SCSS (Dr Pangaonkar, CIBS Nagpur):
SCSS Codes: Shape ${scss.meta.shapeCode} | Colour ${scss.meta.colorCode} | Shade ${scss.meta.shadeCode} | Smiley ${scss.meta.smileyCode}
Primary Selections: ${scss.meta.firstShape} | ${scss.meta.firstColor} | ${scss.meta.firstShade} | ${scss.meta.firstSmiley}
Cognitive Style (SCSS-CQ ${scss.d1.CQ}): ${scss.d1.primaryStyle} — ${scss.d1.procOrient}
Personality: ${scss.d2.dsmCluster} (${scss.d2.dsmFeatures})
EQ: ${scss.d3.EQSS} (${scss.d3.eqBand.band}) | ESI: ${scss.d3.ESI}/100
Mental Health Index: ${scss.d4.MHI}/100 — ${scss.d4.phqAnalog.level}
Risk Index: ${scss.d5.CRI}

Write a JSON with these keys (no markdown, pure JSON):
{
  "cog_summary": "3-4 sentence paragraph about cognitive findings for parent, warm and clear language",
  "cog_clinical": "2-3 sentence clinical interpretation of IQ result for clinician",
  "scss_summary": "3-4 sentences about personality/emotional profile for parent",
  "scss_clinical": "2-3 sentences technical personality interpretation for clinician",
  "combined": "2-3 sentences integrating cognitive + personality findings",
  "recommendations": "5 numbered recommendations separated by newline, concrete and practical"
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1200, messages:[{role:"user",content:prompt}] })
    });
    const data = await res.json();
    const txt = (data.content||[]).map(b=>b.text||"").join("");
    const clean = txt.replace(/```json|```/g,"").trim();
    return JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}")+1));
  } catch(e) {
    return { cog_summary:"Cognitive assessment completed. Results require clinical interpretation.", cog_clinical:"CIBS-FIS score obtained. Full clinical evaluation recommended.", scss_summary:"Personality profile completed via SCSS.", scss_clinical:"SCSS profile requires clinical integration.", combined:"Combined assessment completed.", recommendations:"1. Review results with qualified clinician\n2. Follow recommended educational support\n3. Re-assess in 6 months\n4. Parental guidance as indicated\n5. School counsellor consultation" };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMBINED REPORT
// ══════════════════════════════════════════════════════════════════════════════
function CombinedReport({ fisResult, scss, narrative, childInfo, t, onNew }) {
  const today = new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});
  const sevC = {Normal:"#16a34a",Mild:"#65a30d",Moderate:"#d97706",Severe:"#dc2626"};
  const sevB = {Normal:"#f0fdf4",Mild:"#f7fee7",Moderate:"#fffbeb",Severe:"#fef2f2"};

  const SBar = ({label,value,max=100,color="#0d5c6e"}) => (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
        <span style={{color:"#374151",fontWeight:500}}>{label}</span>
        <span style={{fontWeight:700,color,fontFamily:"'Courier New',monospace"}}>{value}</span>
      </div>
      <div style={{background:"#f3f4f6",borderRadius:3,height:6,overflow:"hidden"}}>
        <div style={{width:`${(value/max)*100}%`,height:"100%",background:color,borderRadius:3}}/>
      </div>
    </div>
  );

  return (
    <div style={{background:"#e8ecf0",minHeight:"100vh",padding:"16px 8px 80px",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`@media print{body{background:white!important}#no-print{display:none!important}}`}</style>

      {/* Action bar */}
      <div id="no-print" style={{maxWidth:800,margin:"0 auto 14px",display:"flex",gap:9,flexWrap:"wrap"}}>
        <button onClick={()=>window.print()} style={{flex:1,minWidth:130,padding:"11px",background:"#0d5c6e",color:"white",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.printPDF}</button>
        <button onClick={()=>{ makeCSV_C(childInfo,fisResult,scss,lang); const ok=submitToDatabank_C(childInfo,fisResult,scss,lang); setDbSubmitted_C(ok); }} style={{flex:1,minWidth:130,padding:"11px",background:"#16a34a",color:"white",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>📊 Download CSV</button>
        <button onClick={onNew} style={{flex:1,minWidth:130,padding:"11px",background:"white",color:"#0d5c6e",border:"1.5px solid #0d5c6e",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.newAssessment}</button>
        {dbSubmitted_C&&<div style={{flex:2,padding:"10px 14px",borderRadius:9,background:"#f0fdf4",border:"1px solid #86efac",fontSize:12,fontWeight:700,color:"#15803d"}}>✅ Data submitted to CIBS Databank (File: {childInfo?.fileNo})</div>}
      </div>

      <div style={{maxWidth:800,margin:"0 auto",background:"white",boxShadow:"0 4px 40px rgba(0,0,0,0.12)"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#0d3b47,#0d5c6e,#0d9488)",padding:"20px 24px",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#9FE1CB",marginBottom:4}}>eSMART-C · Child Cognitive & Personality Assessment</div>
              <div style={{fontSize:20,fontWeight:700,lineHeight:1.3}}>Combined Assessment Report</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2}}>CIBS-FIS + SCSS · Central Institute of Behavioural Sciences, Nagpur</div>
            </div>
            <div style={{textAlign:"right",fontSize:11,color:"rgba(255,255,255,0.7)",lineHeight:2}}>
              <div style={{color:"white",fontWeight:700,fontSize:13}}>{today}</div>
              <div>Dr. Shailesh Pangaonkar</div>
              <div>Director and Consultant Psychiatrist</div>
              <div>MBBS, DPM, DNB, MSc BA</div>
            </div>
          </div>
          {/* Child info strip */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:16}}>
            {[["Name",childInfo.name||"—"],["Age",`${childInfo.age||"—"} yrs`],["School",childInfo.school||"—"],["File No.",childInfo.fileNo||"—"]].map(([l,v])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.12)",borderRadius:7,padding:"7px 10px"}}>
                <div style={{fontSize:9,opacity:0.65}}>{l}</div>
                <div style={{fontSize:12,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"20px"}}>

          {/* ═══ PART 1: COGNITIVE ═══ */}
          <div style={{background:"#0d5c6e",color:"white",padding:"8px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16,marginLeft:-20,marginRight:-20}}>
            {t.cogSection}
          </div>

          {/* IQ Score Card */}
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:16,marginBottom:20,alignItems:"center"}}>
            <div style={{background:fisResult.bg,border:`3px solid ${fisResult.color}`,borderRadius:16,padding:"20px 24px",textAlign:"center",minWidth:130}}>
              <div style={{fontSize:11,color:fisResult.color,fontWeight:700,marginBottom:4}}>CIBS-FIS</div>
              <div style={{fontSize:48,fontWeight:900,color:fisResult.color,lineHeight:1,fontFamily:"'Courier New',monospace"}}>{fisResult.iq}</div>
              <div style={{fontSize:12,color:fisResult.color,marginTop:4}}>IQ Estimate</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:2}}>MA: {fisResult.ma} yrs | {fisResult.pct}th pct</div>
            </div>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:fisResult.color,marginBottom:6}}>{fisResult.band}</div>
              <div style={{fontSize:13,color:"#374151",lineHeight:1.7,marginBottom:10}}>{narrative?.cog_summary}</div>
              <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#1d4ed8"}}>
                <strong>Educational recommendation:</strong> {fisResult.edu}
              </div>
            </div>
          </div>

          {/* Subtest scores */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            {[["Patterns","SER",fisResult.ser||0,SERIES.length,"#0d9488"],["Odd One Out","CLS",fisResult.cls||0,CLASSIF.length,"#7c3aed"],["Grids","MAT",fisResult.mat||0,MATRICES.length,"#1d4ed8"],["Positions","CON",fisResult.con||0,CONDITIONS.length,"#0891b2"]].map(([name,id,sc,mx,col])=>(
              <div key={id} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:4}}>{name}</div>
                <div style={{fontSize:22,fontWeight:800,color:col}}>{sc}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>/{mx}</div>
              </div>
            ))}
          </div>

          <div style={{background:"#f8fafc",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:20,fontSize:12,color:"#374151",lineHeight:1.7}}>
            <strong style={{color:"#0d5c6e"}}>Clinician note:</strong> {narrative?.cog_clinical} Scale {fisResult.scale} used (ages {fisResult.scale===1?"4–8":fisResult.scale===2?"8–14":"14+"}). Formula: IQ = (Mental Age ÷ Chronological Age) × 100. Norms: Cattell (1949, 1973).
          </div>

          {/* ═══ PART 2: SCSS ═══ */}
          <div style={{background:"#1e3a5f",color:"white",padding:"8px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16,marginLeft:-20,marginRight:-20}}>
            {t.perSection}
          </div>

          {/* SCSS codes */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            {[["I — Shape",scss.meta.shapeCode,scss.meta.firstShape,"#1e3a5f"],["II — Colour",scss.meta.colorCode,scss.meta.firstColor,"#b45309"],["III — Shade",scss.meta.shadeCode,"Shade "+scss.meta.shadeCode[0],"#6d28d9"],["IV — Smiley",scss.meta.smileyCode,scss.meta.firstSmiley,"#be185d"]].map(([l,v,first,c])=>(
              <div key={l} style={{background:"white",border:`1px solid ${c}25`,borderRadius:6,padding:"9px 10px"}}>
                <div style={{fontSize:8,fontWeight:700,color:c,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{l}</div>
                <div style={{fontFamily:"'Courier New',monospace",fontSize:18,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{first}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Cognitive Style */}
            <div style={{background:"#eff6ff",borderRadius:8,padding:"12px",border:"1px solid #bfdbfe"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Cognitive Style (SCSS)</div>
              <div style={{fontSize:14,fontWeight:700,color:"#1e3a5f",marginBottom:4}}>{scss.d1.primaryStyle}</div>
              <div style={{fontSize:12,color:"#374151",marginBottom:8}}>{scss.d1.procOrient}</div>
              <div style={{fontSize:11,color:"#64748b"}}>Flexibility: <strong>{scss.d1.flexLabel}</strong></div>
            </div>
            {/* EQ */}
            <div style={{background:"#fff7ed",borderRadius:8,padding:"12px",border:"1px solid #fed7aa"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#9a3412",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Emotional Intelligence</div>
              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
                <span style={{fontSize:28,fontWeight:800,color:"#c2410c"}}>{scss.d3.EQSS}</span>
                <span style={{fontSize:12,color:"#9a3412"}}>{scss.d3.eqBand.band}</span>
              </div>
              <SBar label="Self-Awareness" value={scss.d3.selfAwareness} color="#d97706"/>
              <SBar label="Regulation" value={scss.d3.emoRegulation} color="#d97706"/>
            </div>
          </div>

          {/* Personality */}
          <div style={{background:"#f8fafc",borderRadius:8,padding:"14px",border:"1px solid #e2e8f0",marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Personality Profile</div>
            <div style={{marginBottom:8}}>
              <span style={{fontSize:12,fontWeight:700,color:"#1e3a5f"}}>{scss.d2.dsmCluster}</span>
              <span style={{fontSize:11,color:"#64748b",marginLeft:8}}>{scss.d2.dsmFeatures}</span>
            </div>
            <div style={{fontSize:12,color:"#374151",lineHeight:1.7,marginBottom:10}}>{scss.d2.dsmDesc}</div>
            {/* Big Five bars */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px"}}>
              {[["Openness","O",scss.d2.BFt.O],["Conscientiousness","C",scss.d2.BFt.C],["Extraversion","E",scss.d2.BFt.E],["Agreeableness","A",scss.d2.BFt.A],["Neuroticism","N",scss.d2.BFt.N]].map(([l,a,sc])=>{
                const hi=sc>=55,lo=sc<45;
                const col=hi?"#1e3a5f":lo?"#dc2626":"#6b7280";
                return(<div key={a} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <span style={{fontSize:10,fontWeight:700,color:col,width:14}}>{a}</span>
                  <div style={{flex:1,background:"#f3f4f6",borderRadius:2,height:5,overflow:"hidden"}}>
                    <div style={{width:`${(sc-30)/40*100}%`,height:"100%",background:col}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:col,fontFamily:"'Courier New',monospace",width:24}}>{sc}</span>
                </div>);
              })}
            </div>
          </div>

          {/* Health indicators */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            {[["Mental Health",scss.d4.MHI,"#9d174d","#fdf2f8",[["Anxiety",scss.d4.anxIdx,scss.d4.anxLevel],["Depression",scss.d4.depIdx,scss.d4.depLevel]]],["Physical Health",scss.d4.physNorm,"#9f1239","#fff1f2",[]],["Social Functioning",scss.d4.SFI,"#6b21a8","#fdf4ff",[]]].map(([label,val,col,bg,subs])=>(
              <div key={label} style={{background:bg,borderRadius:8,padding:"12px",border:`1px solid ${col}20`}}>
                <div style={{fontSize:9,fontWeight:700,color:col,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{label}</div>
                <div style={{fontSize:24,fontWeight:800,color:col,marginBottom:4,fontFamily:"'Courier New',monospace"}}>{val}<span style={{fontSize:11,color:col,opacity:0.6}}>/100</span></div>
                {subs.map(([sl,sv,ss])=><div key={sl} style={{fontSize:10,color:"#374151",marginBottom:2}}>{sl}: <strong>{ss}</strong> ({sv})</div>)}
              </div>
            ))}
          </div>

          {/* Risk profile */}
          <div style={{background:"#fef2f2",borderRadius:8,padding:"12px 14px",border:`2px solid ${scss.d5.CRI_color}40`,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.08em"}}>Combined Risk Index</div>
              <div style={{fontSize:13,fontWeight:800,color:scss.d5.CRI_color}}>{scss.d5.CRI}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[["Suicidal Ideation",scss.d5.SIR],["Substance Use",scss.d5.SUR],["Conduct / Delinquency",scss.d5.CDR]].map(([l,r])=>(
                <div key={l} style={{background:r.bg,border:`1px solid ${r.border}`,borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:"#374151",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:11,fontWeight:800,color:r.color}}>{r.level}</div>
                  <div style={{background:"#f9fafb",borderRadius:2,height:4,overflow:"hidden",marginTop:4}}>
                    <div style={{width:`${r===scss.d5.SIR?scss.d5.SIR_raw:r===scss.d5.SUR?scss.d5.SUR_raw:scss.d5.CDR_raw}%`,height:"100%",background:r.color}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative summary */}
          <div style={{background:"#f0fdf4",borderRadius:8,padding:"14px",border:"1px solid #86efac",marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:"#15803d",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Integrated Clinical Summary</div>
            <div style={{fontSize:13,color:"#166534",lineHeight:1.8,fontFamily:"Georgia,serif"}}>{narrative?.combined}</div>
          </div>

          {/* Recommendations */}
          {narrative?.recommendations && (
            <div style={{marginBottom:16}}>
              <div style={{background:"#0d5c6e",color:"white",padding:"7px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12,marginLeft:-20,marginRight:-20}}>Clinical Recommendations</div>
              <div style={{fontSize:12,color:"#1f2937",lineHeight:2,fontFamily:"Georgia,serif"}}>
                {narrative.recommendations.split("\n").filter(l=>l.trim()).map((line,i)=>(
                  <div key={i} style={{marginBottom:4,paddingLeft:4}}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{background:"#f8fafc",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:16}}>
            <div style={{fontSize:11,color:"#374151",lineHeight:1.8}}>
              <strong>Test Limitations:</strong> CIBS-FIS is an original CIBS instrument calibrated to Cattell (1949, 1973) CFIT norms. SCSS is an original projective instrument by Dr. Shailesh Pangaonkar, CIBS Nagpur. Both are screening tools. All scores require clinical confirmation by a qualified professional. Not equivalent to full psychometric batteries (Wechsler, Stanford-Binet, NEO-PI).
            </div>
          </div>

          {/* Signature */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,borderTop:"1.5px solid #0d5c6e",paddingTop:14}}>
            {["Evaluating Clinician","Supervising Clinician (if applicable)"].map(label=>(
              <div key={label}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:12}}>{label}</div>
                <div style={{borderBottom:"1px dotted #cbd5e1",marginBottom:6,height:28}}/>
                <div style={{fontSize:9,color:"#9ca3af"}}>Name & Designation: _______________________</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:14,borderTop:"1px solid #e5e7eb",paddingTop:10,display:"flex",justifyContent:"space-between",fontSize:9,color:"#9ca3af"}}>
            <span>eSMART-C · CIBS Nagpur · {today}</span>
            <span>CONFIDENTIAL — For clinical use only</span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [lang,    setLang]    = useState(null);
  const [screen,  setScreen]  = useState("lang");
  const [role,    setRole]    = useState(null);
  const [agreed,  setAgreed]  = useState(false);
  const [childInfo, setChildInfo] = useState({name:"",dob:"",age:"",gender:"",school:"",grade:"",fileNo:"",examiner:""});

  // CIBS-FIS state
  const [fisPhase,  setFisPhase]  = useState("intro");  // intro|practice|SER|CLS|MAT|CON|done
  const [fisScores, setFisScores] = useState({});
  const [dbSubmitted_C, setDbSubmitted_C] = useState(false);
  const [pracDone,  setPracDone]  = useState(false);
  const [pracSel,   setPracSel]   = useState(null);

  // SCSS state
  const [scssPhase, setScssPhase] = useState("intro");
  const [shapeSeq,  setShapeSeq]  = useState([]);
  const [colorSeq,  setColorSeq]  = useState([]);
  const [shadeSeq,  setShadeSeq]  = useState([]);
  const [smileySeq, setSmileySeq] = useState([]);
  const [storedFS,  setStoredFS]  = useState(null);
  const [storedFC,  setStoredFC]  = useState(null);
  const [storedShades, setStoredShades] = useState([]);

  // Results
  const [generating, setGenerating] = useState(false);
  const [genStep,    setGenStep]    = useState(0);
  const [fisResult,  setFisResult]  = useState(null);
  const [scssResult, setScssResult] = useState(null);
  const [narrative,  setNarrative]  = useState(null);

  const t = T[lang] || T.en;
  const upd = (k,v) => setChildInfo(x=>({...x,[k]:v}));

  const getAge = () => {
    if (childInfo.dob) {
      const ms = Date.now() - new Date(childInfo.dob).getTime();
      if (!isNaN(ms) && ms > 0) return ms / (1000*60*60*24*365.25);
    }
    return parseFloat(childInfo.age) || 10;
  };

  const runReport = async (scssSeqs) => {
    setGenerating(true);
    const steps = [0,1,2,3,4];
    for (const s of steps) {
      setGenStep(s);
      await new Promise(r => setTimeout(r, 700));
    }
    // Compute FIS
    const ageYrs = getAge();
    const gender = childInfo.gender === "F" ? "F" : "M";
    const rawScores = fisScores;
    const serScore = scoreSubtest(rawScores.SER||{}, SERIES);
    const clsScore = scoreSubtest(rawScores.CLS||{}, CLASSIF);
    const matScore = scoreSubtest(rawScores.MAT||{}, MATRICES);
    const conScore = scoreSubtest(rawScores.CON||{}, CONDITIONS);
    const total = serScore + clsScore + matScore + conScore;
    const fis = computeFIS({SER:serScore,CLS:clsScore,MAT:matScore,CON:conScore}, ageYrs, gender);
    fis.ser=serScore; fis.cls=clsScore; fis.mat=matScore; fis.con=conScore;
    setFisResult(fis);
    // Compute SCSS
    const scss = computeClinical(scssSeqs.shapeSeq, scssSeqs.colorSeq, scssSeqs.shadeSeq, scssSeqs.smileySeq);
    setScssResult(scss);
    // Generate narrative
    const narr = await generateNarrative(fis, scss, childInfo);
    setNarrative(narr);
    setGenerating(false);
    setScreen("report");
  };

  const reset = () => {
    setScreen("lang"); setLang(null); setRole(null); setAgreed(false);
    setChildInfo({name:"",dob:"",age:"",gender:"",school:"",grade:"",fileNo:"",examiner:""});
    setFisPhase("intro"); setFisScores({});
    setScssPhase("intro"); setShapeSeq([]); setColorSeq([]); setShadeSeq([]); setSmileySeq([]);
    setFisResult(null); setScssResult(null); setNarrative(null);
    setPracDone(false); setPracSel(null);
  };

  const cardStyle = {background:"white",borderRadius:14,padding:"22px 20px",maxWidth:600,width:"100%",margin:"0 auto",boxShadow:"0 2px 20px rgba(0,0,0,0.10)"};
  const rootStyle = {minHeight:"100vh",background:"#e8ecf0",fontFamily:"'Segoe UI',system-ui,sans-serif",padding:"20px 12px 60px"};

  // ── LANGUAGE ──
  if (screen==="lang") return (
    <div style={{...rootStyle,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{...cardStyle,textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:16,background:"linear-gradient(135deg,#0d5c6e,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <svg width={40} height={40} viewBox="0 0 40 40"><circle cx={20} cy={12} r={5} fill="#5DCAA5"/><circle cx={10} cy={20} r={3.5} fill="#9FE1CB"/><circle cx={30} cy={20} r={3.5} fill="#9FE1CB"/><circle cx={14} cy={30} r={4} fill="#1D9E75"/><circle cx={26} cy={30} r={4} fill="#1D9E75"/><line x1={20} y1={17} x2={10} y2={20} stroke="#9FE1CB" strokeWidth={1.2} opacity="0.9"/><line x1={20} y1={17} x2={30} y2={20} stroke="#9FE1CB" strokeWidth={1.2} opacity="0.9"/><line x1={10} y1={23} x2={14} y2={30} stroke="#5DCAA5" strokeWidth={1.2} opacity="0.8"/><line x1={30} y1={23} x2={26} y2={30} stroke="#5DCAA5" strokeWidth={1.2} opacity="0.8"/></svg>
        </div>
        <h1 style={{fontSize:26,fontWeight:900,color:"#0d3b47",margin:"0 0 4px"}}>eSMART-C</h1>
        <p style={{color:"#64748b",fontSize:13,margin:"0 0 4px"}}>Child Cognitive & Personality Assessment</p>
        <p style={{color:"#94a3b8",fontSize:11,margin:"0 0 28px"}}>CIBS Nagpur · Dr. Shailesh Pangaonkar</p>
        <h2 style={{fontSize:15,fontWeight:700,color:"#374151",margin:"0 0 14px"}}>Choose Language / भाषा चुनें / भाषा निवडा</h2>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{c:"en",l:"English",s:"Continue in English",f:"🇬🇧"},{c:"hi",l:"हिन्दी",s:"हिन्दी में जारी रखें",f:"🇮🇳"},{c:"mr",l:"मराठी",s:"मराठीत पुढे जा",f:"🟠"}].map(o=>(
            <button key={o.c} onClick={()=>{setLang(o.c);setScreen("role");}} style={{padding:"13px 18px",borderRadius:12,border:"2px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}} onMouseOver={e=>{e.currentTarget.style.borderColor="#0d9488";e.currentTarget.style.background="#f0fdfa";}} onMouseOut={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="#f8fafc";}}>
              <span style={{fontSize:26}}>{o.f}</span>
              <div><div style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>{o.l}</div><div style={{fontSize:12,color:"#64748b"}}>{o.s}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ROLE ──
  if (screen==="role") return (
    <div style={{...rootStyle,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={cardStyle}>
        <h2 style={{fontSize:17,fontWeight:800,color:"#0d3b47",margin:"0 0 6px",textAlign:"center"}}>eSMART-C</h2>
        <p style={{color:"#64748b",fontSize:13,textAlign:"center",margin:"0 0 20px"}}>{t.whoFills}</p>
        {[{r:"clinician",icon:"🩺",lbl:t.clinician,sub:t.clinSub},{r:"parent",icon:"👨‍👩‍👧",lbl:t.parent,sub:t.parSub}].map(o=>(
          <button key={o.r} onClick={()=>{setRole(o.r);setScreen("childinfo");}} style={{width:"100%",padding:"16px 18px",borderRadius:12,border:"2px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",marginBottom:10}} onMouseOver={e=>{e.currentTarget.style.borderColor="#0d9488";e.currentTarget.style.background="#f0fdfa";}} onMouseOut={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="#f8fafc";}}>
            <span style={{fontSize:32}}>{o.icon}</span>
            <div><div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{o.lbl}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{o.sub}</div></div>
          </button>
        ))}
        <button onClick={()=>setScreen("lang")} style={{width:"100%",padding:"8px",borderRadius:8,background:"#f1f5f9",color:"#64748b",border:"none",fontSize:12,cursor:"pointer",marginTop:8}}>← Change Language</button>
      </div>
    </div>
  );

  // ── CHILD INFO ──
  if (screen==="childinfo") {
    const fld = (lbl,k,type="text") => (
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:11,fontWeight:600,color:"#475569"}}>{lbl}</label>
        <input type={type} value={childInfo[k]} onChange={e=>upd(k,e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#1e293b",outline:"none",background:"#fafafa"}}/>
      </div>
    );
    return (
      <div style={rootStyle}>
        <div style={cardStyle}>
          <h2 style={{fontSize:16,fontWeight:800,color:"#0d5c6e",margin:"0 0 16px"}}>👶 {t.childInfo}</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div style={{gridColumn:"1/-1"}}>{fld(t.childName,"name")}</div>
            {fld(t.dob,"dob","date")}
            {fld(t.age,"age","number")}
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"#475569",display:"block",marginBottom:4}}>{t.gender}</label>
              <select value={childInfo.gender} onChange={e=>upd("gender",e.target.value)} style={{width:"100%",padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#1e293b",background:"#fafafa"}}>
                <option value="">Select...</option>
                <option value="M">{t.gM}</option><option value="F">{t.gF}</option><option value="O">{t.gO}</option>
              </select>
            </div>
            {fld(t.grade,"grade")}
            {fld(t.school,"school")}
            {fld(t.fileNo,"fileNo")}
            {fld(t.examiner,"examiner")}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setScreen("role")} style={{flex:1,padding:"10px",borderRadius:9,background:"#f1f5f9",color:"#475569",border:"none",fontSize:13,cursor:"pointer"}}>{t.back}</button>
            <button onClick={()=>setScreen("disclaimer")} disabled={!childInfo.name} style={{flex:2,padding:"12px",borderRadius:9,background:childInfo.name?"#0d5c6e":"#e2e8f0",color:childInfo.name?"#fff":"#94a3b8",border:"none",fontSize:14,fontWeight:700,cursor:childInfo.name?"pointer":"not-allowed"}}>{t.next}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── DISCLAIMER ──
  if (screen==="disclaimer") return (
    <div style={rootStyle}>
      <div style={cardStyle}>
        <div style={{background:"#fff7ed",borderBottom:"2px solid #fed7aa",padding:"14px 16px",marginLeft:-20,marginRight:-20,marginTop:-22,borderRadius:"14px 14px 0 0",display:"flex",gap:12,marginBottom:16}}>
          <span style={{fontSize:24}}>⚖️</span>
          <div>
            <h2 style={{fontSize:15,fontWeight:800,color:"#9a3412",margin:"0 0 3px"}}>{t.disclaimer}</h2>
            <p style={{fontSize:11,color:"#c2410c",margin:0}}>Please read carefully before proceeding</p>
          </div>
        </div>
        {(t.discPoints||[]).map((pt,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
            <div style={{minWidth:22,height:22,borderRadius:"50%",background:i<=1?"#fef2f2":"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<=1?"#dc2626":"#16a34a",flexShrink:0,marginTop:1}}>{i+1}</div>
            <p style={{margin:0,fontSize:12,color:"#374151",lineHeight:1.6}}>{pt}</p>
          </div>
        ))}
        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"11px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:18}}>🏥</span>
          <div><p style={{margin:0,fontSize:11,fontWeight:700,color:"#1d4ed8"}}>Central Institute of Behavioural Sciences (CIBS), Nagpur</p><p style={{margin:0,fontSize:10,color:"#64748b"}}>ICMR Guidelines Compliant · ICH-GCP Standards</p></div>
        </div>
        <label style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",padding:"12px 14px",background:agreed?"#f0fdf4":"#f8fafc",borderRadius:10,border:`2px solid ${agreed?"#86efac":"#e2e8f0"}`,marginBottom:14,transition:"all 0.2s"}}>
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{width:17,height:17,marginTop:1,accentColor:"#0d9488"}}/>
          <span style={{fontSize:12,fontWeight:600,color:agreed?"#15803d":"#374151",lineHeight:1.5}}>{t.agreeText}</span>
        </label>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setScreen("childinfo")} style={{flex:1,padding:"10px",borderRadius:9,background:"#f1f5f9",color:"#475569",border:"none",fontSize:13,cursor:"pointer"}}>{t.back}</button>
          <button onClick={()=>{if(agreed){setScreen("fis");}}} disabled={!agreed} style={{flex:2,padding:"12px",borderRadius:9,background:agreed?"#0d5c6e":"#e2e8f0",color:agreed?"#fff":"#94a3b8",border:"none",fontSize:14,fontWeight:700,cursor:agreed?"pointer":"not-allowed"}}>{t.proceedBtn}</button>
        </div>
      </div>
    </div>
  );

  // ── FIS SCREENS ──
  if (screen==="fis") {
    const TEAL = "#0d9488";

    // FIS Intro
    if (fisPhase==="intro") return (
      <div style={rootStyle}>
        <div style={cardStyle}>
          <div style={{background:"linear-gradient(135deg,#0d5c6e,#0d9488)",borderRadius:12,padding:"18px",color:"white",marginBottom:18}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#9FE1CB",marginBottom:4}}>Part 1 of 2</div>
            <h2 style={{fontSize:17,fontWeight:800,margin:"0 0 6px"}}>{t.part1Name}</h2>
            <p style={{fontSize:12,opacity:0.85,margin:0}}>{t.p1Intro}</p>
          </div>
          <p style={{fontSize:13,color:"#374151",marginBottom:14}}>{t.p1Note}</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {t.subtests.map((st,i)=>(
              <div key={st.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:TEAL,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{st.name}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{st.desc}</div>
                </div>
                <div style={{textAlign:"right",fontSize:11,color:"#94a3b8"}}>
                  <div>{st.items} items</div>
                  <div>{st.mins} min</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setFisPhase("practice")} style={{width:"100%",padding:"13px",borderRadius:10,background:"#0d5c6e",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.startTest}</button>
        </div>
      </div>
    );

    // Practice
    if (fisPhase==="practice") return (
      <div style={rootStyle}>
        <div style={cardStyle}>
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"12px 14px",marginBottom:18}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#15803d",margin:"0 0 6px"}}>{t.practiceTitle}</h3>
            <p style={{fontSize:12,color:"#166534",margin:0}}>{t.practiceInstr}</p>
          </div>
          {/* Sequence */}
          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
            {PRACTICE.seq.map((fig,i)=><FigBox key={i} fig={fig} size={54}/>)}
            <div style={{width:54,height:54,border:"2px dashed #0d9488",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:"#f0fdfa"}}><span style={{fontSize:20,color:"#0d9488",fontWeight:800}}>?</span></div>
          </div>
          {/* Choices */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
            {PRACTICE.choices.map((fig,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <FigBox fig={fig} size={54} selected={pracSel===i} onClick={()=>{if(!pracDone){setPracSel(i);}}}/>
                <span style={{fontSize:12,fontWeight:700,color:pracSel===i?"#0d5c6e":"#94a3b8"}}>{i+1}</span>
              </div>
            ))}
          </div>
          {pracSel!==null && (
            <div style={{textAlign:"center",padding:"12px",borderRadius:8,background:pracSel===PRACTICE.ans?"#f0fdf4":"#fef2f2",border:`1px solid ${pracSel===PRACTICE.ans?"#86efac":"#fca5a5"}`,marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:13,color:pracSel===PRACTICE.ans?"#16a34a":"#dc2626"}}>{pracSel===PRACTICE.ans?"✅ Correct! The shapes have increasing sides: Triangle → Square → Pentagon → Hexagon":"❌ Not quite. Look for the pattern in the number of sides: Triangle(3) → Square(4) → Pentagon(5) → ?"}</span>
            </div>
          )}
          <button onClick={()=>setFisPhase("SER")} style={{width:"100%",padding:"12px",borderRadius:10,background:"#0d5c6e",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.startTest}</button>
        </div>
      </div>
    );

    // Subtests
    const subtestMap = {SER:"CLS", CLS:"MAT", MAT:"CON", CON:"done"};
    const subtestColors = {SER:"#0d9488",CLS:"#7c3aed",MAT:"#1d4ed8",CON:"#0891b2"};
    const subtestNames = {SER:t.subtests[0],CLS:t.subtests[1],MAT:t.subtests[2],CON:t.subtests[3]};

    if (["SER","CLS","MAT","CON"].includes(fisPhase)) {
      const stInfo = subtestNames[fisPhase];
      const totalSecs = Math.round(stInfo.mins * 60);
      const col = subtestColors[fisPhase];
      const onSubtestComplete = (ans) => {
        setFisScores(prev => ({...prev, [fisPhase]: ans}));
        const next = subtestMap[fisPhase];
        if (next === "done") { setScreen("scss"); }
        else { setFisPhase(next); }
      };
      return (
        <div style={rootStyle}>
          <div style={cardStyle}>
            {/* Header */}
            <div style={{background:col,borderRadius:10,padding:"12px 14px",color:"white",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",opacity:0.8}}>CIBS-FIS · {stInfo.name}</div>
                  <div style={{fontSize:14,fontWeight:700}}>{stInfo.desc}</div>
                </div>
                <div style={{fontSize:10,opacity:0.8,textAlign:"right"}}>{stInfo.items} items · {stInfo.mins} min</div>
              </div>
              <Timer totalSecs={totalSecs} onTimeout={onSubtestComplete} t={t}/>
            </div>
            {fisPhase==="SER" && <SeriesSubtest onComplete={onSubtestComplete} t={t}/>}
            {fisPhase==="CLS" && <ClassifSubtest onComplete={onSubtestComplete} t={t}/>}
            {fisPhase==="MAT" && <MatrixSubtest onComplete={onSubtestComplete} t={t}/>}
            {fisPhase==="CON" && <CondSubtest onComplete={onSubtestComplete} t={t}/>}
          </div>
        </div>
      );
    }
  }

  // ── SCSS SCREENS ──
  if (screen==="scss") {
    if (scssPhase==="intro") return (
      <div style={rootStyle}>
        <div style={cardStyle}>
          <div style={{background:"linear-gradient(135deg,#1e3a5f,#374151)",borderRadius:12,padding:"18px",color:"white",marginBottom:18}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#9FE1CB",marginBottom:4}}>Part 2 of 2</div>
            <h2 style={{fontSize:17,fontWeight:800,margin:"0 0 6px"}}>{t.part2Name}</h2>
            <p style={{fontSize:12,opacity:0.85,margin:0}}>{t.p2Intro}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:20}}>
            {(t.p2stages||[]).map((s,i)=>{
              const cols=["#1e3a5f","#b45309","#6d28d9","#be185d"];
              return(<div key={s} style={{borderRadius:8,padding:"10px",background:"#f8fafc",border:`1px solid ${cols[i]}20`,borderLeft:`3px solid ${cols[i]}`}}><div style={{fontSize:11,fontWeight:700,color:cols[i]}}>Stage {i+1}</div><div style={{fontSize:13,color:"#374151",fontWeight:500}}>{s}</div></div>);
            })}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",justifyContent:"center",marginBottom:18}}>
            {SHAPES_SCSS.slice(0,5).map((sh,i)=>(
              <div key={sh.code} style={{width:40,height:40,borderRadius:"50%",background:"white",boxShadow:"0 2px 10px rgba(30,58,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <ShapeSCSS code={sh.code} fill="#9ca3af" size={24}/>
              </div>
            ))}
          </div>
          <button onClick={()=>setScssPhase("s1")} style={{width:"100%",padding:"13px",borderRadius:10,background:"#1e3a5f",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>Begin Stage 1 →</button>
        </div>
      </div>
    );

    const scssCard = {background:"white",borderRadius:12,padding:"18px 16px",maxWidth:560,width:"100%",margin:"0 auto",boxShadow:"0 2px 16px rgba(0,0,0,0.08)"};

    if (scssPhase==="s1") return (
      <div style={{...rootStyle,paddingBottom:80}}>
        <div style={scssCard}>
          <SelectionStage key="s1" stageKey="s1" accentColor="#64748b" title="Stage 1 — Shapes"
            instr="Select the shape you like most first. Then continue until all 7 are selected."
            items={SHAPES_SCSS}
            renderItem={(item,sz)=><ShapeSCSS code={item.code} fill="#9ca3af" size={sz}/>}
            onComplete={seq=>{
              setStoredFS(SHAPES_SCSS.find(s=>s.code===seq[0])||SHAPES_SCSS[0]);
              setShapeSeq(seq); setScssPhase("s2");
            }}/>
        </div>
      </div>
    );

    if (scssPhase==="s2") return (
      <div style={{...rootStyle,paddingBottom:80}}>
        <div style={scssCard}>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}>
              <ShapeSCSS code={storedFS?.code||1} fill="#1e3a5f" size={20}/>
              <span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>Primary shape: {storedFS?.name}</span>
            </span>
          </div>
          <SelectionStage key="s2" stageKey="s2" accentColor="#b45309" title="Stage 2 — Colours"
            instr="Select the colour you like most first."
            items={COLORS_SCSS}
            renderItem={(item,sz)=><ShapeSCSS code={storedFS?.code||1} fill={item.hex} size={sz}/>}
            onComplete={seq=>{
              const fc=COLORS_SCSS.find(c=>c.code===seq[0])||COLORS_SCSS[0];
              setStoredFC(fc); setStoredShades(generateShades(fc.hex));
              setColorSeq(seq); setScssPhase("s3");
            }}/>
        </div>
      </div>
    );

    if (scssPhase==="s3") return (
      <div style={{...rootStyle,paddingBottom:80}}>
        <div style={scssCard}>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}>
              <ShapeSCSS code={storedFS?.code||1} fill={storedFC?.hex||"#1e3a5f"} size={20}/>
              <span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>{storedFS?.name} · {storedFC?.name} shades</span>
            </span>
          </div>
          <SelectionStage key="s3" stageKey="s3" accentColor="#6d28d9" title="Stage 3 — Shades"
            instr="Select the shade you like most first."
            items={storedShades}
            renderItem={(item,sz)=><ShapeSCSS code={storedFS?.code||1} fill={item.hex} size={sz}/>}
            onComplete={seq=>{setShadeSeq(seq); setScssPhase("s4");}}/>
        </div>
      </div>
    );

    if (scssPhase==="s4") return (
      <div style={{...rootStyle,paddingBottom:80}}>
        <div style={scssCard}>
          <SelectionStage key="s4" stageKey="s4" accentColor="#be185d" title="Stage 4 — Feelings"
            instr="Select the expression that shows how you feel most right now."
            items={SMILEYS_SCSS}
            renderItem={(item,sz)=><span style={{fontSize:Math.round(sz*0.72),lineHeight:1,userSelect:"none"}}>{item.emoji}</span>}
            onComplete={seq=>{
              setSmileySeq(seq);
              runReport({shapeSeq,colorSeq,shadeSeq,smileySeq:seq});
            }}/>
        </div>
      </div>
    );
  }

  // ── GENERATING ──
  if (generating) return (
    <div style={{...rootStyle,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:340,padding:20}}>
        <div style={{width:56,height:56,border:"3px solid #e2e8f0",borderTopColor:"#0d5c6e",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 20px"}}/>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        <h2 style={{fontSize:20,color:"#0d3b47",marginBottom:10}}>{t.generating}</h2>
        <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:14}}>
          {(t.genSteps||[]).map((s,i)=>(
            <span key={s} style={{fontSize:10,color:i===genStep?"#0d5c6e":"#94a3b8",background:i===genStep?"#e0f2fe":"white",borderRadius:20,padding:"4px 10px",animation:"pulse 2s ease-in-out infinite",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",fontWeight:i===genStep?700:400,transition:"all 0.3s"}}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── REPORT ──
  if (screen==="report" && fisResult && scssResult) {
    return <CombinedReport fisResult={fisResult} scss={scssResult} narrative={narrative} childInfo={childInfo} t={t} onNew={reset}/>;
  }

  return null;
}
