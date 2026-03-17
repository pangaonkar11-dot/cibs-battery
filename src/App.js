import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  CIBS-VISTA ADULT  |  Visual Integrated Screening & Testing of Affect
//  Part 1 : CIBS-CAT  (Cognitive Ability Test — adult norms, Cattell framework)
//  Part 2 : SCSS      (Shape-Colour-Shade-Smiley — Dr Pangaonkar, CIBS Nagpur)
//  © 2026  Central Institute of Behavioural Sciences, Nagpur
//  Dr. Shailesh V. Pangaonkar  |  Dr. Deepali S. Pangaonkar
// ══════════════════════════════════════════════════════════════════════════════

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxCR0_X2xe7ojq38W3XVt-3VAp3JISfH9DLwTolOi61TZcYAOOZhtD9oIJoMmZqU8rk/exec";

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const T = {
  en:{
    appTitle:"CIBS-VISTA", subtitle:"Adult Cognitive & Personality Screening",
    org:"Central Institute of Behavioural Sciences, Nagpur",
    choose:"Choose Language / भाषा चुनें / भाषा निवडा",
    whoFills:"Who is administering this assessment?",
    clinician:"Clinician / Researcher", self:"Self-administered",
    clinSub:"I am a trained health professional or researcher",
    selfSub:"I am taking this assessment myself",
    subjInfo:"Participant Information",
    name:"Full Name", age:"Age (years)", gender:"Gender",
    gM:"Male", gF:"Female", gO:"Other", gN:"Prefer not to say",
    edu:"Education", occ:"Occupation", mobile:"Mobile",
    diagnosis:"Clinical Diagnosis (if any)", examiner:"Examiner / Clinician",
    setting:"Setting", fileNo:"CIBS File No.",
    next:"Next →", back:"← Back", proceed:"Proceed →",
    disclaimer:"Important Notice",
    discPoints:[
      "CIBS-VISTA is a SCREENING TOOL. It measures cognitive ability and personality characteristics using visual stimuli. It is NOT a diagnostic instrument.",
      "Part 1 (CIBS-CAT) measures fluid reasoning using original visual tasks calibrated to adult norms. Results estimate cognitive ability level.",
      "Part 2 (SCSS — Shape Colour Shade Smiley Test) is an original projective instrument developed by Dr. Shailesh Pangaonkar, CIBS Nagpur. It provides personality, emotional, health, and risk profiles.",
      "All scores are screening indicators only. Clinical decisions must be made by a qualified professional.",
      "This tool acknowledges the theoretical framework of Raymond B. Cattell (1949, 1973) for fluid intelligence.",
    ],
    agreeText:"I have read and understood the above. I wish to proceed.",
    proceedBtn:"Proceed to Assessment →",
    part1Name:"Part 1 — CIBS Cognitive Ability Test (CIBS-CAT)",
    part2Name:"Part 2 — Shape Colour Shade Smiley Test (SCSS)",
    p1Intro:"This is a visual reasoning test. You will see patterns and puzzles. Look carefully and choose the best answer. There are no trick questions.",
    p1Note:"There are 4 short tests. Each has a time limit. Work quickly but carefully.",
    subtests:[
      {id:"SER",name:"Patterns",   desc:"What comes next?",               items:12, mins:3},
      {id:"CLS",name:"Odd One Out",desc:"Which one is different?",        items:14, mins:4},
      {id:"MAT",name:"Grids",      desc:"Which completes the grid?",      items:12, mins:3},
      {id:"CON",name:"Rules",      desc:"Which matches the rule?",        items:8,  mins:2.5},
    ],
    practiceTitle:"Practice — try one example",
    practiceInstr:"Look at the shapes in the top row. What should come next? Click your answer.",
    startTest:"Start →", timeLeft:"Time left", skip:"Skip →", answered:"answered",
    p2Intro:"In this part, choose pictures one by one — starting with the one you like most. There are no right or wrong answers. Just choose honestly.",
    p2stages:["Shapes","Colours","Shades","Feelings"],
    generating:"Generating Assessment Report…",
    genSteps:["Computing cognitive scores…","Analysing personality profile…","Building health indicators…","Calculating risk profile…","Compiling clinical report…"],
    reportTitle:"CIBS-VISTA Assessment Report",
    forSelf:"Your Personal Summary",
    forClinician:"Clinician Report",
    printPDF:"🖨️ Print / PDF",
    newAssessment:"🔄 New Assessment",
    disclaimer2:"Screening tool only. All findings require clinical confirmation.",
  },
  hi:{
    appTitle:"CIBS-VISTA", subtitle:"वयस्क संज्ञानात्मक एवं व्यक्तित्व मूल्यांकन",
    org:"केंद्रीय व्यावहारिक विज्ञान संस्थान, नागपुर",
    choose:"भाषा चुनें",
    whoFills:"यह मूल्यांकन कौन कर रहा है?",
    clinician:"चिकित्सक / शोधकर्ता", self:"स्वयं-संचालित",
    clinSub:"मैं एक प्रशिक्षित स्वास्थ्य पेशेवर या शोधकर्ता हूँ",
    selfSub:"मैं स्वयं यह मूल्यांकन ले रहा/रही हूँ",
    subjInfo:"प्रतिभागी जानकारी",
    name:"पूरा नाम", age:"आयु (वर्ष)", gender:"लिंग",
    gM:"पुरुष", gF:"महिला", gO:"अन्य", gN:"बताना नहीं चाहते",
    edu:"शिक्षा", occ:"व्यवसाय", mobile:"मोबाइल",
    diagnosis:"नैदानिक निदान (यदि कोई हो)", examiner:"परीक्षक / चिकित्सक",
    setting:"सेटिंग", fileNo:"CIBS फाइल नंबर",
    next:"आगे →", back:"← वापस", proceed:"जारी रखें →",
    disclaimer:"महत्वपूर्ण सूचना",
    discPoints:[
      "CIBS-VISTA एक जांच उपकरण है। यह दृश्य उत्तेजनाओं के माध्यम से संज्ञानात्मक क्षमता और व्यक्तित्व को मापता है। यह निदान उपकरण नहीं है।",
      "भाग 1 (CIBS-CAT) वयस्क मानकों पर आधारित तरल तर्क क्षमता का अनुमान देता है।",
      "भाग 2 (SCSS) डॉ. शैलेश पानगावकर, CIBS नागपुर द्वारा विकसित एक प्रक्षेपण परीक्षण है।",
      "सभी स्कोर केवल जांच संकेतक हैं।",
    ],
    agreeText:"मैंने उपरोक्त पढ़ और समझ लिया है। मैं आगे बढ़ना चाहता/चाहती हूँ।",
    proceedBtn:"मूल्यांकन की ओर आगे बढ़ें →",
    part1Name:"भाग 1 — CIBS संज्ञानात्मक क्षमता परीक्षण (CIBS-CAT)",
    part2Name:"भाग 2 — आकार रंग छाया मुस्कान परीक्षण (SCSS)",
    p1Intro:"यह एक दृश्य तर्क परीक्षण है। ध्यान से देखें और सही उत्तर चुनें।",
    p1Note:"4 छोटे परीक्षण हैं। प्रत्येक की समय-सीमा है।",
    subtests:[
      {id:"SER",name:"पैटर्न",    desc:"अगला क्या आएगा?",          items:12, mins:3},
      {id:"CLS",name:"अलग चुनो", desc:"कौन सा अलग है?",            items:14, mins:4},
      {id:"MAT",name:"ग्रिड",    desc:"ग्रिड पूरा करने वाला?",    items:12, mins:3},
      {id:"CON",name:"नियम",     desc:"नियम से मेल खाता है?",      items:8,  mins:2.5},
    ],
    practiceTitle:"अभ्यास", practiceInstr:"ऊपर की पंक्ति देखें। आगे क्या आना चाहिए?",
    startTest:"शुरू करें →", timeLeft:"शेष समय", skip:"छोड़ें →", answered:"उत्तर दिए",
    p2Intro:"एक-एक करके चित्र चुनें — पहले जो सबसे ज्यादा पसंद हो।",
    p2stages:["आकृतियाँ","रंग","छाया","भावनाएं"],
    generating:"मूल्यांकन रिपोर्ट तैयार हो रही है…",
    genSteps:["बुद्धि स्कोर गणना…","व्यक्तित्व विश्लेषण…","स्वास्थ्य संकेतक…","जोखिम प्रोफाइल…","नैदानिक रिपोर्ट…"],
    reportTitle:"CIBS-VISTA मूल्यांकन रिपोर्ट",
    forSelf:"आपका व्यक्तिगत सारांश", forClinician:"चिकित्सक रिपोर्ट",
    printPDF:"🖨️ प्रिंट / PDF", newAssessment:"🔄 नया मूल्यांकन",
    disclaimer2:"केवल जांच उपकरण। नैदानिक पुष्टि आवश्यक।",
  },
  mr:{
    appTitle:"CIBS-VISTA", subtitle:"प्रौढ संज्ञानात्मक व व्यक्तिमत्व मूल्यांकन",
    org:"केंद्रीय वर्तणूक विज्ञान संस्था, नागपूर",
    choose:"भाषा निवडा",
    whoFills:"हे मूल्यांकन कोण करत आहे?",
    clinician:"वैद्य / संशोधक", self:"स्वयं-संचालित",
    clinSub:"मी प्रशिक्षित आरोग्य व्यावसायिक किंवा संशोधक आहे",
    selfSub:"मी स्वतः हे मूल्यांकन घेत आहे",
    subjInfo:"सहभागी माहिती",
    name:"पूर्ण नाव", age:"वय (वर्षे)", gender:"लिंग",
    gM:"पुरुष", gF:"स्त्री", gO:"इतर", gN:"सांगू इच्छित नाही",
    edu:"शिक्षण", occ:"व्यवसाय", mobile:"मोबाईल",
    diagnosis:"नैदानिक निदान (असल्यास)", examiner:"परीक्षक / वैद्य",
    setting:"सेटिंग", fileNo:"CIBS फाईल क्र.",
    next:"पुढे →", back:"← मागे", proceed:"पुढे जा →",
    disclaimer:"महत्त्वाची सूचना",
    discPoints:[
      "CIBS-VISTA हे एक तपासणी साधन आहे. हे निदान साधन नाही.",
      "भाग 1 (CIBS-CAT) प्रौढ मानदंडांवर आधारित तरल तर्क क्षमता देते.",
      "भाग 2 (SCSS) डॉ. शैलेश पानगावकर, CIBS नागपूर यांनी विकसित केलेले प्रक्षेपण परीक्षण आहे.",
      "सर्व स्कोर केवळ तपासणी निर्देशक आहेत.",
    ],
    agreeText:"मी वरील वाचले आणि समजले. मला पुढे जायचे आहे.",
    proceedBtn:"मूल्यांकनाकडे पुढे जा →",
    part1Name:"भाग 1 — CIBS संज्ञानात्मक क्षमता चाचणी (CIBS-CAT)",
    part2Name:"भाग 2 — आकार रंग छाया हास्य परीक्षण (SCSS)",
    p1Intro:"हे एक चित्र-आधारित तर्क परीक्षण आहे.",
    p1Note:"4 छोटी परीक्षणे आहेत. प्रत्येकाची वेळ मर्यादा आहे.",
    subtests:[
      {id:"SER",name:"नमुने",    desc:"पुढे काय येईल?",          items:12, mins:3},
      {id:"CLS",name:"वेगळे",    desc:"कोणते वेगळे आहे?",        items:14, mins:4},
      {id:"MAT",name:"जाळी",     desc:"जाळी पूर्ण करणारे?",     items:12, mins:3},
      {id:"CON",name:"नियम",     desc:"नियमाशी जुळणारे?",        items:8,  mins:2.5},
    ],
    practiceTitle:"सराव", practiceInstr:"वरच्या रांगेत पाहा. पुढे काय यायला हवे?",
    startTest:"सुरू करा →", timeLeft:"उरलेला वेळ", skip:"सोडा →", answered:"उत्तरे",
    p2Intro:"एक-एक करून चित्रे निवडा — आधी जे सर्वात आवडते ते.",
    p2stages:["आकार","रंग","छाया","भावना"],
    generating:"मूल्यांकन अहवाल तयार होत आहे…",
    genSteps:["बुद्धिमत्ता स्कोर…","व्यक्तिमत्व विश्लेषण…","आरोग्य निर्देशक…","जोखीम प्रोफाइल…","अहवाल संकलन…"],
    reportTitle:"CIBS-VISTA मूल्यांकन अहवाल",
    forSelf:"आपला वैयक्तिक सारांश", forClinician:"वैद्यकीय अहवाल",
    printPDF:"🖨️ प्रिंट / PDF", newAssessment:"🔄 नवीन मूल्यांकन",
    disclaimer2:"केवळ तपासणी साधन. वैद्यकीय पुष्टी आवश्यक.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  CIBS-CAT ADULT NORMS (Cattell Scale 3 framework, adults 18–75+)
//  IQ = standard score mean 100, SD 15
// ══════════════════════════════════════════════════════════════════════════════
function computeCAT(rawScores, age) {
  const total = Object.values(rawScores).reduce((a,b)=>a+b,0);
  const maxRaw = 46;
  // Age-adjusted expected score (fluid intelligence peaks ~25, declines ~1pt/decade)
  const peakRaw = 38;
  const ageFactor = age <= 25 ? 1.0 : age <= 35 ? 0.97 : age <= 45 ? 0.93 : age <= 55 ? 0.88 : age <= 65 ? 0.82 : 0.75;
  const expectedRaw = peakRaw * ageFactor;
  // Convert to IQ: linear scale around expected
  const deviation = total - expectedRaw;
  const iq = Math.round(100 + (deviation / expectedRaw) * 30);
  const iqClamped = Math.max(55, Math.min(145, iq));
  return { total, maxRaw, iq: iqClamped, pct: iqToPct(iqClamped), ...iqClassAdult(iqClamped) };
}

function iqToPct(iq) {
  const z = (iq - 100) / 15;
  const t = 1/(1+0.2316419*Math.abs(z));
  const d = 0.3989423*Math.exp(-z*z/2);
  const p = d*t*(0.3193815+t*(-0.3565638+t*(1.7814779+t*(-1.8212560+t*1.3302744))));
  const cdf = z>=0?1-p:p;
  return Math.max(1,Math.min(99,Math.round(cdf*100)));
}

function iqClassAdult(iq) {
  if(iq>=130) return{band:"Very Superior",        color:"#085041",bg:"#E1F5EE",desc:"Cognitive ability in the very superior range, exceeding 98% of adults."};
  if(iq>=120) return{band:"Superior",             color:"#0F6E56",bg:"#E1F5EE",desc:"Cognitive ability markedly above average, exceeding 91% of adults."};
  if(iq>=110) return{band:"High Average",         color:"#3B6D11",bg:"#EAF3DE",desc:"Cognitive ability above the population average."};
  if(iq>=90)  return{band:"Average",              color:"#374151",bg:"#f8fafc",desc:"Cognitive ability within the normal population range."};
  if(iq>=80)  return{band:"Low Average",          color:"#633806",bg:"#FAEEDA",desc:"Cognitive ability in the low average range."};
  if(iq>=70)  return{band:"Borderline",           color:"#712B13",bg:"#FAECE7",desc:"Cognitive ability in the borderline range. Structured support recommended."};
  return              {band:"Impaired Range",     color:"#791F1F",bg:"#FCEBEB",desc:"Cognitive ability below borderline. Comprehensive neuropsychological evaluation indicated."};
}

// ══════════════════════════════════════════════════════════════════════════════
//  SVG SHAPE RENDERER
// ══════════════════════════════════════════════════════════════════════════════
function Fig({ t=4, f=0, s=1, r=0, dim=52, extra=null }) {
  const c=dim/2, br=dim/2-4, rad=br*[0.42,0.66,0.88][s];
  const sid="#1e3a5f", fc=f===0?"none":f===1?"#1e3a5f":"#7096bc", sw=dim<40?1.4:1.9;
  const poly=(n,cx,cy,rr)=>Array.from({length:n},(_,i)=>{const a=i*2*Math.PI/n-Math.PI/2;return`${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`;}).join(" ");
  const renderShape=(tp,cx,cy,rr,rotation)=>{
    const tr=rotation?`rotate(${rotation} ${cx} ${cy})`:undefined;
    if(tp===-1) return<circle cx={cx} cy={cy} r={rr*0.22} fill="#1e3a5f"/>;
    if(tp===0)  return<circle cx={cx} cy={cy} r={rr} fill={fc} stroke={sid} strokeWidth={sw}/>;
    if(tp==="D") return<polygon points={`${cx},${cy-rr} ${cx+rr},${cy} ${cx},${cy+rr} ${cx-rr},${cy}`} fill={fc} stroke={sid} strokeWidth={sw}/>;
    return<polygon points={poly(tp,cx,cy,rr)} fill={fc} stroke={sid} strokeWidth={sw} transform={tr}/>;
  };
  return(<svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} overflow="visible">{renderShape(t,c,c,rad,r)}{extra&&renderShape(extra.t,c,c,rad*0.40,0)}</svg>);
}

function MultiFig({figs,dim=52}){
  if(!figs||figs.length===0)return<Fig dim={dim}/>;
  if(figs.length===1)return<Fig {...figs[0]} dim={dim}/>;
  const n=figs.length;
  const positions=n===2?[[0.3,0.5],[0.7,0.5]]:n===3?[[0.2,0.5],[0.5,0.2],[0.8,0.5]]:[[0.3,0.3],[0.7,0.3],[0.3,0.7],[0.7,0.7]];
  const small=dim*0.38;
  return(<svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>{figs.slice(0,positions.length).map((fig,i)=>{const[px,py]=positions[i];return(<svg key={i} x={px*dim-small/2} y={py*dim-small/2} width={small} height={small}><Fig {...fig} dim={small}/></svg>);})}</svg>);
}

// ══════════════════════════════════════════════════════════════════════════════
//  ITEM BANKS — identical to eSMART-C (same cognitive tasks work for adults)
// ══════════════════════════════════════════════════════════════════════════════
const SERIES=[
  {d:1,seq:[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],choices:[{t:0,f:0,s:1},{t:3,f:0,s:1},{t:6,f:0,s:1},{t:4,f:0,s:1},{t:5,f:1,s:1}],ans:2},
  {d:1,seq:[{t:4,f:0,s:1},{t:4,f:1,s:1},{t:4,f:0,s:1}],choices:[{t:4,f:2,s:1},{t:3,f:1,s:1},{t:4,f:0,s:1},{t:4,f:1,s:1},{t:0,f:1,s:1}],ans:3},
  {d:1,seq:[{figs:[{t:3,f:1,s:0}]},{figs:[{t:3,f:1,s:0},{t:3,f:1,s:0}]},{figs:[{t:3,f:1,s:0},{t:3,f:1,s:0},{t:3,f:1,s:0}]}],choices:[{figs:[{t:3,f:1,s:0},{t:3,f:1,s:0}]},{figs:[{t:3,f:1,s:0},{t:3,f:1,s:0},{t:3,f:1,s:0},{t:3,f:1,s:0}]},{figs:[{t:4,f:1,s:0},{t:4,f:1,s:0},{t:4,f:1,s:0}]},{figs:[{t:3,f:1,s:0}]},{figs:[{t:3,f:0,s:0},{t:3,f:0,s:0},{t:3,f:0,s:0},{t:3,f:0,s:0}]}],ans:1},
  {d:1,seq:[{t:6,f:0,s:1},{t:5,f:0,s:1},{t:4,f:0,s:1}],choices:[{t:0,f:0,s:1},{t:3,f:0,s:1},{t:6,f:0,s:1},{t:5,f:0,s:1},{t:3,f:1,s:1}],ans:1},
  {d:1,seq:[{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:45},{t:3,f:1,s:1,r:90}],choices:[{t:3,f:1,s:1,r:90},{t:3,f:1,s:1,r:0},{t:3,f:0,s:1,r:135},{t:3,f:1,s:1,r:135},{t:4,f:1,s:1,r:45}],ans:3},
  {d:2,seq:[{t:4,f:0,s:1},{t:4,f:0,s:1,extra:{t:-1}},{t:5,f:0,s:1}],choices:[{t:5,f:0,s:1,extra:{t:-1}},{t:4,f:1,s:1},{t:6,f:0,s:1},{t:5,f:1,s:1,extra:{t:-1}},{t:4,f:0,s:1,extra:{t:-1}}],ans:0},
  {d:2,seq:[{t:0,f:0,s:0},{t:0,f:0,s:1},{t:0,f:0,s:2}],choices:[{t:0,f:0,s:1},{t:0,f:1,s:0},{t:0,f:0,s:0},{t:0,f:1,s:2},{t:0,f:2,s:0}],ans:1},
  {d:2,seq:[{t:3,f:0,s:1},{t:4,f:1,s:1},{t:5,f:0,s:1}],choices:[{t:6,f:0,s:1},{t:5,f:1,s:1},{t:6,f:1,s:1},{t:3,f:1,s:1},{t:6,f:2,s:1}],ans:2},
  {d:2,seq:[{t:0,f:0,s:2},{t:0,f:0,s:2,extra:{t:3,f:1}},{t:0,f:0,s:2,extra:{t:4,f:1}}],choices:[{t:0,f:0,s:2,extra:{t:6,f:1}},{t:0,f:0,s:2,extra:{t:3,f:0}},{t:0,f:0,s:2,extra:{t:5,f:1}},{t:0,f:1,s:2},{t:0,f:0,s:1,extra:{t:4,f:1}}],ans:2},
  {d:2,seq:[{t:4,f:0,s:1,r:0},{t:4,f:1,s:1,r:45},{t:4,f:0,s:1,r:90}],choices:[{t:4,f:0,s:1,r:135},{t:4,f:1,s:1,r:90},{t:4,f:1,s:1,r:0},{t:4,f:1,s:1,r:135},{t:3,f:1,s:1,r:135}],ans:3},
  {d:3,seq:[{t:3,f:1,s:0},{t:4,f:1,s:1},{t:5,f:1,s:2}],choices:[{t:6,f:1,s:2},{t:6,f:1,s:1},{t:6,f:1,s:0},{t:5,f:1,s:0},{t:3,f:1,s:2}],ans:2},
  {d:3,seq:[{t:3,f:0,s:0},{t:4,f:1,s:1},{t:5,f:0,s:2}],choices:[{t:6,f:1,s:1},{t:6,f:0,s:0},{t:3,f:1,s:0},{t:6,f:1,s:0},{t:6,f:0,s:1}],ans:3},
];
const CLASSIF=[
  {d:1,figs:[{t:0,f:0,s:1},{t:0,f:0,s:1},{t:4,f:0,s:1},{t:0,f:0,s:1},{t:0,f:0,s:1}],ans:2},
  {d:1,figs:[{t:3,f:1,s:1},{t:3,f:1,s:1},{t:3,f:1,s:1},{t:3,f:0,s:1},{t:3,f:1,s:1}],ans:3},
  {d:1,figs:[{t:4,f:0,s:1},{t:4,f:0,s:0},{t:4,f:0,s:1},{t:4,f:0,s:1},{t:4,f:0,s:1}],ans:1},
  {d:1,figs:[{t:3,f:0,s:1},{t:3,f:0,s:1},{t:3,f:0,s:1},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1}],ans:3},
  {d:1,figs:[{t:5,f:0,s:1},{t:5,f:0,s:1},{t:5,f:0,s:1},{t:5,f:0,s:1},{t:5,f:2,s:1}],ans:4},
  {d:2,figs:[{t:4,f:0,s:1},{t:6,f:0,s:1},{t:3,f:0,s:1},{t:4,f:0,s:1},{t:6,f:0,s:1}],ans:2},
  {d:2,figs:[{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:90},{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:0}],ans:2},
  {d:2,figs:[{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:3,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}}],ans:2},
  {d:2,figs:[{t:0,f:1,s:0},{t:0,f:1,s:1},{t:4,f:1,s:1},{t:0,f:1,s:2},{t:0,f:1,s:1}],ans:2},
  {d:2,figs:[{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1,extra:{t:-1}},{t:3,f:0,s:1}],ans:4},
  {d:2,figs:[{t:3,f:0,s:1},{t:5,f:0,s:1},{t:0,f:0,s:1},{t:4,f:0,s:1},{t:6,f:0,s:1}],ans:2},
  {d:3,figs:[{t:4,f:0,s:2},{t:4,f:0,s:2},{t:4,f:0,s:2},{t:4,f:1,s:0},{t:4,f:0,s:2}],ans:3},
  {d:3,figs:[{t:6,f:0,s:2,extra:{t:3,f:1}},{t:6,f:0,s:2,extra:{t:3,f:1}},{t:6,f:1,s:2},{t:6,f:0,s:2,extra:{t:3,f:1}},{t:6,f:0,s:2,extra:{t:3,f:1}}],ans:2},
  {d:3,figs:[{t:3,f:2,s:1,r:180},{t:3,f:2,s:1,r:0},{t:3,f:2,s:1,r:180},{t:3,f:2,s:1,r:90},{t:3,f:2,s:1,r:0}],ans:3},
];
const MATRICES=[
  {d:1,rows:[[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],[{t:3,f:0,s:1},{t:4,f:0,s:1},null]],choices:[{t:5,f:0,s:1},{t:3,f:0,s:1},{t:6,f:0,s:1},{t:4,f:0,s:1},{t:5,f:1,s:1}],ans:0},
  {d:1,rows:[[{t:4,f:0,s:1},{t:4,f:0,s:1},{t:4,f:0,s:1}],[{t:4,f:1,s:1},{t:4,f:1,s:1},{t:4,f:1,s:1}],[{t:4,f:0,s:1},{t:4,f:0,s:1},null]],choices:[{t:4,f:1,s:1},{t:3,f:0,s:1},{t:4,f:0,s:1},{t:4,f:2,s:1},{t:0,f:0,s:1}],ans:2},
  {d:1,rows:[[{t:0,f:1,s:0},{t:0,f:1,s:1},{t:0,f:1,s:2}],[{t:0,f:1,s:0},{t:0,f:1,s:1},{t:0,f:1,s:2}],[{t:0,f:1,s:0},{t:0,f:1,s:1},null]],choices:[{t:0,f:1,s:0},{t:0,f:0,s:2},{t:0,f:1,s:1},{t:0,f:1,s:2},{t:3,f:1,s:2}],ans:3},
  {d:2,rows:[[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],[{t:3,f:1,s:1},{t:4,f:1,s:1},{t:5,f:1,s:1}],[{t:3,f:2,s:1},{t:4,f:2,s:1},null]],choices:[{t:5,f:1,s:1},{t:4,f:2,s:1},{t:5,f:2,s:1},{t:5,f:0,s:1},{t:3,f:2,s:1}],ans:2},
  {d:2,rows:[[{t:3,f:1,s:0},{t:4,f:1,s:1},{t:5,f:1,s:2}],[{t:3,f:0,s:0},{t:4,f:0,s:1},{t:5,f:0,s:2}],[{t:3,f:2,s:0},{t:4,f:2,s:1},null]],choices:[{t:5,f:2,s:1},{t:5,f:2,s:2},{t:5,f:0,s:2},{t:4,f:2,s:2},{t:5,f:2,s:0}],ans:1},
  {d:2,rows:[[{t:3,f:1,s:1,r:0},{t:3,f:1,s:1,r:90},{t:3,f:1,s:1,r:180}],[{t:4,f:0,s:1,r:0},{t:4,f:0,s:1,r:90},{t:4,f:0,s:1,r:180}],[{t:5,f:2,s:1,r:0},{t:5,f:2,s:1,r:90},null]],choices:[{t:5,f:2,s:1,r:0},{t:5,f:0,s:1,r:180},{t:5,f:2,s:1,r:180},{t:3,f:2,s:1,r:180},{t:5,f:2,s:2,r:180}],ans:2},
  {d:2,rows:[[{t:4,f:0,s:2},{t:4,f:0,s:2},{t:4,f:0,s:2}],[{t:4,f:0,s:2,extra:{t:-1}},{t:4,f:0,s:2,extra:{t:-1}},{t:4,f:0,s:2,extra:{t:-1}}],[{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:0,s:2,extra:{t:0,f:1}},null]],choices:[{t:4,f:0,s:2},{t:4,f:0,s:2,extra:{t:-1}},{t:4,f:0,s:2,extra:{t:0,f:1}},{t:4,f:1,s:2},{t:0,f:0,s:2,extra:{t:0,f:1}}],ans:2},
  {d:3,rows:[[{t:6,f:0,s:1},{t:5,f:0,s:1},{t:3,f:0,s:1}],[{t:6,f:1,s:1},{t:5,f:1,s:1},{t:3,f:1,s:1}],[{t:6,f:2,s:1},{t:5,f:2,s:1},null]],choices:[{t:6,f:2,s:1},{t:3,f:2,s:2},{t:3,f:2,s:1},{t:5,f:2,s:1},{t:3,f:1,s:1}],ans:2},
  {d:3,rows:[[{t:3,f:1,s:2},{t:4,f:1,s:1},{t:5,f:1,s:0}],[{t:4,f:0,s:2},{t:5,f:0,s:1},{t:6,f:0,s:0}],[{t:5,f:2,s:2},{t:6,f:2,s:1},null]],choices:[{t:6,f:2,s:1},{t:3,f:2,s:0},{t:6,f:0,s:0},{t:5,f:2,s:0},{t:3,f:2,s:2}],ans:1},
  {d:3,rows:[[{t:0,f:1,s:1},{t:0,f:0,s:1},{t:0,f:1,s:1}],[{t:0,f:0,s:1},{t:0,f:1,s:1},{t:0,f:0,s:1}],[{t:0,f:1,s:1},{t:0,f:0,s:1},null]],choices:[{t:0,f:0,s:1},{t:0,f:1,s:1},{t:3,f:1,s:1},{t:0,f:2,s:1},{t:0,f:0,s:2}],ans:1},
  {d:3,rows:[[{t:4,f:0,s:0},{t:4,f:0,s:0},{t:4,f:0,s:1}],[{t:4,f:0,s:0},{t:4,f:0,s:1},{t:4,f:0,s:2}],[{t:4,f:0,s:1},{t:4,f:0,s:2},null]],choices:[{t:4,f:0,s:1},{t:4,f:0,s:2},{t:4,f:1,s:2},{t:0,f:0,s:2},{t:4,f:0,s:0}],ans:1},
  {d:3,rows:[[{t:3,f:0,s:2},{t:4,f:0,s:2},{t:5,f:0,s:2}],[{t:3,f:1,s:2},{t:4,f:1,s:2},{t:5,f:1,s:2}],[{t:3,f:2,s:2},{t:4,f:2,s:2},null]],choices:[{t:4,f:2,s:2},{t:5,f:0,s:2},{t:5,f:1,s:2},{t:5,f:2,s:2},{t:3,f:2,s:2}],ans:3},
];
const CONDITIONS=[
  {d:1,ref:{shape:0,dot:"in"},choices:[{shape:0,dot:"out"},{shape:0,dot:"in"},{shape:3,dot:"in"},{shape:0,dot:"out"},{shape:0,dot:"top"}],ans:1},
  {d:1,ref:{shape:0,dot:"bot"},choices:[{shape:0,dot:"in"},{shape:0,dot:"top"},{shape:0,dot:"bot"},{shape:3,dot:"bot"},{shape:0,dot:"left"}],ans:2},
  {d:2,ref:{shape:4,dot:"tl"},choices:[{shape:4,dot:"tr"},{shape:4,dot:"bl"},{shape:4,dot:"tl"},{shape:4,dot:"br"},{shape:0,dot:"tl"}],ans:2},
  {d:2,ref:{shape:3,dot:"right"},choices:[{shape:3,dot:"left"},{shape:3,dot:"right"},{shape:3,dot:"top"},{shape:3,dot:"in"},{shape:4,dot:"right"}],ans:1},
  {d:2,ref:{shape:5,dot:"top"},choices:[{shape:5,dot:"in"},{shape:5,dot:"bot"},{shape:6,dot:"top"},{shape:5,dot:"top"},{shape:5,dot:"left"}],ans:3},
  {d:3,ref:{shape:4,dot:"in"},choices:[{shape:4,dot:"out"},{shape:4,dot:"in"},{shape:0,dot:"in"},{shape:4,dot:"tl"},{shape:4,dot:"br"}],ans:1},
  {d:3,ref:{shape:6,dot:"br"},choices:[{shape:6,dot:"tr"},{shape:6,dot:"bl"},{shape:6,dot:"br"},{shape:6,dot:"in"},{shape:3,dot:"br"}],ans:2},
  {d:3,ref:{shape:5,dot:"left"},choices:[{shape:5,dot:"right"},{shape:5,dot:"top"},{shape:5,dot:"left"},{shape:5,dot:"bot"},{shape:6,dot:"left"}],ans:2},
];
const PRACTICE={seq:[{t:3,f:0,s:1},{t:4,f:0,s:1},{t:5,f:0,s:1}],choices:[{t:0,f:0,s:1},{t:6,f:0,s:1},{t:3,f:1,s:1},{t:4,f:0,s:1},{t:5,f:0,s:2}],ans:1};

// ══════════════════════════════════════════════════════════════════════════════
//  SCSS DATA (Dr Pangaonkar, CIBS)
// ══════════════════════════════════════════════════════════════════════════════
const SHAPES_SCSS=[{code:1,name:"Circle"},{code:2,name:"Triangle"},{code:3,name:"Square"},{code:4,name:"Rhombus"},{code:5,name:"Pentagon"},{code:6,name:"Hexagon"},{code:7,name:"Octagon"}];
const COLORS_SCSS=[{code:1,name:"Red",hex:"#EF4444"},{code:2,name:"Orange",hex:"#F97316"},{code:3,name:"Yellow",hex:"#EAB308"},{code:4,name:"Green",hex:"#22C55E"},{code:5,name:"Blue",hex:"#3B82F6"},{code:6,name:"Indigo",hex:"#6366F1"},{code:7,name:"Violet",hex:"#A855F7"}];
const SMILEYS_SCSS=[{code:1,name:"Very Happy",emoji:"😄"},{code:2,name:"Happy",emoji:"🙂"},{code:3,name:"Calm",emoji:"😐"},{code:4,name:"Worried",emoji:"😟"},{code:5,name:"Sad",emoji:"😢"},{code:6,name:"Angry",emoji:"😠"},{code:7,name:"Scared",emoji:"😨"}];
const SHAPE_DATA={1:{name:"Circle",complexity:3,cogStyle:"Holistic-Integrative",BFopen:5,BFcons:3,BFextra:5,BFagree:6,BFneuro:3},2:{name:"Triangle",complexity:4,cogStyle:"Analytical-Sequential",BFopen:5,BFcons:5,BFextra:4,BFagree:3,BFneuro:4},3:{name:"Square",complexity:2,cogStyle:"Practical-Systematic",BFopen:2,BFcons:7,BFextra:3,BFagree:5,BFneuro:3},4:{name:"Rhombus",complexity:5,cogStyle:"Adaptive-Creative",BFopen:6,BFcons:4,BFextra:5,BFagree:4,BFneuro:3},5:{name:"Pentagon",complexity:6,cogStyle:"Divergent-Exploratory",BFopen:7,BFcons:3,BFextra:4,BFagree:4,BFneuro:4},6:{name:"Hexagon",complexity:6,cogStyle:"Systemic-Precise",BFopen:5,BFcons:7,BFextra:3,BFagree:5,BFneuro:2},7:{name:"Octagon",complexity:5,cogStyle:"Tenacious-Enduring",BFopen:4,BFcons:6,BFextra:3,BFagree:4,BFneuro:3}};
const COLOR_DATA={1:{name:"Red",temp:"hot",arousal:7,valence:4,BFextra:7,BFneuro:6,physArousal:"High",socialWarm:6},2:{name:"Orange",temp:"warm",arousal:6,valence:6,BFextra:6,BFneuro:4,physArousal:"Elevated",socialWarm:7},3:{name:"Yellow",temp:"warm",arousal:5,valence:7,BFextra:5,BFneuro:3,physArousal:"Moderate",socialWarm:6},4:{name:"Green",temp:"cool",arousal:4,valence:6,BFextra:4,BFneuro:2,physArousal:"Moderate",socialWarm:5},5:{name:"Blue",temp:"cool",arousal:3,valence:6,BFextra:3,BFneuro:2,physArousal:"Low",socialWarm:4},6:{name:"Indigo",temp:"dark-cool",arousal:3,valence:4,BFextra:2,BFneuro:4,physArousal:"Low",socialWarm:3},7:{name:"Violet",temp:"dark-cool",arousal:4,valence:4,BFextra:2,BFneuro:5,physArousal:"Low",socialWarm:3}};
const SHADE_DATA={1:{label:"Shade 1 (Lightest)",rawEmo:95,mentalBurden:5,emotOpen:95,ruminScore:5},2:{label:"Shade 2 (Light)",rawEmo:82,mentalBurden:15,emotOpen:82,ruminScore:12},3:{label:"Shade 3",rawEmo:70,mentalBurden:28,emotOpen:68,ruminScore:22},4:{label:"Shade 4 (Medium)",rawEmo:55,mentalBurden:44,emotOpen:52,ruminScore:38},5:{label:"Shade 5",rawEmo:40,mentalBurden:58,emotOpen:36,ruminScore:55},6:{label:"Shade 6 (Dark)",rawEmo:28,mentalBurden:73,emotOpen:22,ruminScore:70},7:{label:"Shade 7 (Darkest)",rawEmo:15,mentalBurden:88,emotOpen:10,ruminScore:85}};
const SMILEY_DATA={1:{name:"Very Happy",valence:95,arousal:72,negAffect:5,anx:3,dep:3,anger:3,fear:3},2:{name:"Happy",valence:80,arousal:58,negAffect:15,anx:10,dep:10,anger:8,fear:8},3:{name:"Calm",valence:65,arousal:32,negAffect:28,anx:20,dep:18,anger:12,fear:15},4:{name:"Worried",valence:35,arousal:62,negAffect:58,anx:65,dep:38,anger:30,fear:55},5:{name:"Sad",valence:20,arousal:22,negAffect:75,anx:35,dep:78,anger:22,fear:40},6:{name:"Angry",valence:15,arousal:88,negAffect:80,anx:42,dep:35,anger:88,fear:35},7:{name:"Scared",valence:10,arousal:72,negAffect:85,anx:88,dep:55,anger:30,fear:88}};

// ── Utility functions ─────────────────────────────────────────────
function iqBand(cq){if(cq>=130)return{band:"Very Superior",percentile:"≥98th"};if(cq>=120)return{band:"Superior",percentile:"91–97th"};if(cq>=110)return{band:"High Average",percentile:"75–90th"};if(cq>=90)return{band:"Average",percentile:"25–74th"};if(cq>=80)return{band:"Low Average",percentile:"9–24th"};if(cq>=70)return{band:"Borderline",percentile:"2–8th"};return{band:"Impaired Range",percentile:"<2nd"};}
function eqBand(eq){if(eq>=115)return{band:"Well Above Average",percentile:"≥84th"};if(eq>=100)return{band:"Above Average",percentile:"50–83rd"};if(eq>=85)return{band:"Average",percentile:"16–49th"};if(eq>=70)return{band:"Below Average",percentile:"2–15th"};return{band:"Well Below Average",percentile:"<2nd"};}
function phqAnalog(score){if(score<=10)return{level:"None to Minimal",severity:0};if(score<=25)return{level:"Mild",severity:1};if(score<=50)return{level:"Moderate",severity:2};if(score<=75)return{level:"Moderately Severe",severity:3};return{level:"Severe",severity:4};}
function riskLevel(score){if(score<=15)return{level:"Not Indicated",color:"#16a34a",bg:"#f0fdf4",border:"#86efac",flag:0};if(score<=35)return{level:"Low",color:"#65a30d",bg:"#f7fee7",border:"#bef264",flag:1};if(score<=55)return{level:"Moderate",color:"#d97706",bg:"#fffbeb",border:"#fcd34d",flag:2};if(score<=75)return{level:"Elevated",color:"#ea580c",bg:"#fff7ed",border:"#fdba74",flag:3};return{level:"High",color:"#dc2626",bg:"#fef2f2",border:"#fca5a5",flag:4};}

// ── SCSS Clinical Algorithm ───────────────────────────────────────
function computeSCSS(sSeq,cSeq,shSeq,smSeq){
  const W=[7,6,5,4,3,2,1];
  const s0=sSeq[0],c0=cSeq[0],sh0=shSeq[0],sm0=smSeq[0];
  const SD=SHADE_DATA,CD=COLOR_DATA,SMD=SMILEY_DATA,SHD=SHAPE_DATA;
  const isWarm=["hot","warm"].includes(CD[c0].temp),isDarkCool=CD[c0].temp==="dark-cool";
  const isAngular=[2,4,5].includes(s0),isRounded=s0===1,isSymm=[3,6].includes(s0);

  // D1: Cognitive Style
  let wtd=0,maxWtd=0;
  sSeq.forEach((code,i)=>{wtd+=SHD[code].complexity*W[i];maxWtd+=7*W[i];});
  const rawCog=(wtd/maxWtd)*100;
  const CQ=Math.round(55+(rawCog/100)*90);
  const iq=iqBand(CQ);
  const cogFlex=Math.abs(SHD[sSeq[0]].complexity-SHD[sSeq[6]].complexity);
  const flexLabel=cogFlex>=4?"High":cogFlex>=2?"Moderate":"Restricted";
  const procOrient=isWarm?"Action-Oriented / Externally Driven":isDarkCool?"Reflective / Internally Driven":"Balanced Processing";
  const midComplexity=SHD[sSeq[3]].complexity;
  const midLabel=midComplexity>=5?"High-Complexity Baseline":midComplexity>=4?"Mid-Range Baseline":"Low-Complexity Baseline";
  const d1={CQ,iqBand:iq,primaryStyle:SHD[s0].cogStyle,secondaryStyle:SHD[sSeq[1]].cogStyle,flexIndex:cogFlex,flexLabel,procOrient,rawCog:Math.round(rawCog),topShape:SHD[sSeq[0]],midShape:SHD[sSeq[3]],botShape:SHD[sSeq[6]],midLabel};

  // D2: Personality — Big Five + DSM-5
  const shapeW=0.6,colorW=0.4;
  let BF={O:0,C:0,E:0,A:0,N:0};
  sSeq.forEach((code,i)=>{const sh=SHD[code];const w=W[i]/28;BF.O+=sh.BFopen*w*shapeW;BF.C+=sh.BFcons*w*shapeW;BF.E+=sh.BFextra*w*shapeW;BF.A+=sh.BFagree*w*shapeW;BF.N+=sh.BFneuro*w*shapeW;});
  const col=CD[c0];BF.E+=col.BFextra/7*colorW;BF.N+=col.BFneuro/7*colorW;
  BF.N+=SD[sh0].mentalBurden/100*0.3;BF.N=Math.min(BF.N,1.0);
  const BFt={};["O","C","E","A","N"].forEach(k=>{BFt[k]=Math.round(30+BF[k]*40);});
  const hN=BFt.N>=55,lE=BFt.E<45;
  let dsmCluster,dsmFeatures,dsmDesc,dsmClinical;
  if(isDarkCool&&(isAngular||s0===7)&&lE){dsmCluster="Cluster A Alignment";dsmFeatures="Schizoid / Schizotypal features";dsmDesc="Tendency towards social withdrawal, restricted emotional expression, preference for solitude, possible unconventional ideation.";dsmClinical="Assess for flat affect, anhedonia, social isolation. Rule out schizophrenia spectrum disorders.";}
  else if(isWarm&&isAngular&&(hN||BFt.E>=58)){dsmCluster="Cluster B Alignment";dsmFeatures="Borderline / Histrionic / Narcissistic features";dsmDesc="Tendency towards emotional intensity, impulsivity, attention-seeking, affective instability, interpersonal difficulties.";dsmClinical="Assess for impulsivity, affective dysregulation, identity instability. Screen for trauma history.";}
  else if(!isWarm&&(isRounded||isSymm)&&hN){dsmCluster="Cluster C Alignment";dsmFeatures="Avoidant / Dependent / OCPD features";dsmDesc="Tendency towards anxiety-based inhibition, rigid adherence, excessive need for reassurance, fear of criticism.";dsmClinical="Assess for generalised anxiety, social anxiety features, perfectionism, OCD spectrum.";}
  else{dsmCluster="No Significant Cluster Alignment";dsmFeatures="Adaptive personality organisation";dsmDesc="No clinically significant personality cluster alignment. Balanced adaptive traits with context-appropriate flexibility.";dsmClinical="No specific personality-based clinical concerns. Routine monitoring sufficient.";}
  const bfDesc={O:BFt.O>=55?"Elevated — high intellectual curiosity, openness, creative ideation":BFt.O<45?"Reduced — preference for conventional, concrete approaches":"Within average range",C:BFt.C>=55?"Elevated — high self-discipline, organisation, goal-directedness":BFt.C<45?"Reduced — may present with impulsivity, difficulty sustaining effort":"Within average range",E:BFt.E>=55?"Elevated — socially outgoing, high energy, assertive":BFt.E<45?"Reduced — reserved, socially selective, prefers limited stimulation":"Within average range",A:BFt.A>=55?"Elevated — cooperative, prosocial, trusting":BFt.A<45?"Reduced — competitive, sceptical, challenging":"Within average range",N:BFt.N>=55?"Elevated — marked emotional reactivity, vulnerability to distress":BFt.N<45?"Reduced — emotionally stable, resilient":"Within average range"};
  const d2={BFt,bfDesc,dsmCluster,dsmFeatures,dsmDesc,dsmClinical};

  // D3: Emotional Intelligence
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
  const d3={EQSS,eqBand:eqB,ESI,selfAwareness,emoRegulation,emoResilience,shadePrimary:SD[sh0],affState:SMD[sm0].name,affValence,ruminScore:SD[sh0].ruminScore};

  // D4: Health
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
  const sfLevel=SFI>=70?"Adequate":SFI>=50?"Moderate":"Limited";
  const overallWBI=Math.round((MHI+physNorm+SFI)/3);
  const d4={MHI,distressRaw,phqAnalog:phqA,anxIdx,anxLevel:anxIdx>=70?"Elevated":anxIdx>=45?"Moderate":anxIdx>=25?"Mild":"Minimal",depIdx,depLevel:depIdx>=70?"Elevated":depIdx>=45?"Moderate":depIdx>=25?"Mild":"Minimal",physArousal,physNorm,SFI,sfLevel,overallWBI};

  // D5: Risk
  const SIR_raw=Math.round(SD[sh0].ruminScore*0.3+SMD[sm0].dep*0.25+SD[sh0].mentalBurden*0.25+(isDarkCool?15:0)+(sm0>=5?SMD[sm0].fear*0.2:0));
  const SUR_raw=Math.round(SMD[sm0].negAffect*0.25+SD[sh0].mentalBurden*0.20+CD[c0].arousal/7*35+(isAngular?15:0)+(isWarm&&sm0>=4?15:0));
  const CDR_raw=Math.round(SMD[sm0].anger*0.30+SMD[sm0].negAffect*0.20+CD[c0].arousal/7*25+(isAngular&&isWarm?20:0)+(sm0===6?20:0));
  const SIR=riskLevel(SIR_raw),SUR=riskLevel(SUR_raw),CDR=riskLevel(CDR_raw);
  const SIR_indicators=[];
  if(sh0>=6)SIR_indicators.push("Dark shade preference — elevated emotional burden indicator");
  if(sm0>=5)SIR_indicators.push("Primary affect "+SMD[sm0].name+" — high negative valence");
  if(isDarkCool)SIR_indicators.push("Dark-cool colour — social withdrawal indicator");
  if(SIR_indicators.length===0)SIR_indicators.push("No significant visual indicators for elevated risk");
  const SUR_indicators=[];
  if(isWarm&&CD[c0].arousal>=6)SUR_indicators.push("High-arousal warm colour — sensation-seeking tendency");
  if(isAngular&&sm0>=4)SUR_indicators.push("Angular shape with negative affect — impulsivity-distress pairing");
  if(SD[sh0].mentalBurden>=60)SUR_indicators.push("Elevated emotional burden — risk of maladaptive coping");
  if(SUR_indicators.length===0)SUR_indicators.push("No significant visual indicators for elevated risk");
  const CDR_indicators=[];
  if(sm0===6)CDR_indicators.push("Primary affect — Anger — high aggression indicator");
  if(isAngular&&isWarm)CDR_indicators.push("Angular shape + warm colour — dominance-aggression pairing");
  if(CDR_indicators.length===0)CDR_indicators.push("No significant visual indicators for elevated risk");
  const maxFlag=Math.max(SIR.flag,SUR.flag,CDR.flag);
  const CRI=maxFlag===0?"Minimal":maxFlag===1?"Low — Monitor":maxFlag===2?"Moderate — Intervention Indicated":maxFlag===3?"Significant — Priority Referral":"Urgent — Immediate Evaluation Required";
  const d5={SIR,SIR_raw,SIR_indicators,SUR,SUR_raw,SUR_indicators,CDR,CDR_raw,CDR_indicators,CRI,maxFlag};

  const meta={shapeCode:sSeq.join(""),colorCode:cSeq.join(""),shadeCode:shSeq.join(""),smileyCode:smSeq.join(""),firstShape:SHAPE_DATA[s0].name,firstColor:COLOR_DATA[c0].name,firstShade:SHADE_DATA[sh0].label,firstSmiley:SMILEY_DATA[sm0].name};
  return{d1,d2,d3,d4,d5,meta};
}

// ── SCSS Shape SVG ────────────────────────────────────────────────
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

// ── Data submission ───────────────────────────────────────────────
async function submitToSheet(payload){
  try{
    const res=await fetch(APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(payload)});
    const result=await res.json();
    console.log("✅ VISTA submission result:",result);
    return result;
  }catch(err){console.error("❌ Submission error:",err);return{status:"error"};}
}

// ══════════════════════════════════════════════════════════════════════════════
//  UI COMPONENTS
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
  const pick=item=>{const ns=[...selected,item],nr=remaining.filter(i=>i.code!==item.code);setSelected(ns);setRemaining(nr);if(nr.length===0)setTimeout(()=>onComplete(ns.map(i=>i.code)),500);};
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,width:"100%"}}>
    <div style={{textAlign:"center",padding:"0 8px"}}>
      <div style={{display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:ac,background:`${ac}12`,borderRadius:100,padding:"4px 14px",marginBottom:6}}>{title}</div>
      <div style={{fontSize:14,color:"#374151",fontWeight:500,lineHeight:1.5}}>{instr}</div>
    </div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
      {Array.from({length:7},(_,i)=>(<div key={i} style={{width:28,height:28,borderRadius:"50%",background:i<selected.length?ac:"rgba(30,64,175,0.05)",color:i<selected.length?"white":`${ac}70`,border:i<selected.length?`2px solid ${ac}`:`1.5px dashed ${ac}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>{i<selected.length?"✓":i+1}</div>))}
    </div>
    {remaining.length>0?<StaticCircle key={`${stageKey}-${remaining.length}`} items={remaining} onSelect={pick} renderItem={(item,sz)=>renderItem(item,sz)}/>:<div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>✅</div>}
    {selected.length>0&&(<div style={{width:"100%",maxWidth:400,background:"rgba(30,64,175,0.02)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(30,64,175,0.08)"}}>
      <div style={{fontSize:9,fontWeight:700,color:ac,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7}}>Your selections — 1 (most liked) → 7</div>
      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>{selected.map((item,idx)=>(<div key={item.code} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:32,height:32,borderRadius:"50%",background:"white",border:`2px solid ${idx===0?ac:`${ac}28`}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{renderItem(item,19)}</div><span style={{fontSize:8,color:"#9CA3AF",fontWeight:700}}>{idx+1}</span></div>))}</div>
    </div>)}
  </div>);}

function Timer({totalSecs,onTimeout,t}){
  const[remaining,setRemaining]=useState(totalSecs);
  const ref=useRef(null);
  useEffect(()=>{ref.current=setInterval(()=>{setRemaining(r=>{if(r<=1){clearInterval(ref.current);onTimeout();return 0;}return r-1;});},1000);return()=>clearInterval(ref.current);},[]);
  const pct=(remaining/totalSecs)*100,mins=Math.floor(remaining/60),secs=remaining%60;
  const col=pct>40?"#0d9488":pct>15?"#d97706":"#dc2626";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}>
    <div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:3,transition:"width 1s linear"}}/></div>
    <span style={{fontSize:13,fontWeight:700,color:col,minWidth:42,textAlign:"right",fontFamily:"monospace"}}>{mins}:{String(secs).padStart(2,"0")}</span>
  </div>);}

function FigBox({fig,size=52,selected=false,onClick=null}){
  const isMulti=fig&&fig.figs;
  return(<div style={{width:size,height:size,border:`${selected?"2.5px solid #0d5c6e":"1.5px solid #e2e8f0"}`,borderRadius:8,background:selected?"#e0f2fe":"#fafafa",display:"flex",alignItems:"center",justifyContent:"center",cursor:onClick?"pointer":"default",transition:"all 0.15s",flexShrink:0,boxShadow:selected?"0 0 0 3px #bae6fd":"none"}} onClick={onClick}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor="#0d9488";e.currentTarget.style.background="#f0fdfa";}}}
    onMouseLeave={e=>{if(onClick&&!selected){e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="#fafafa";}}}>
    {isMulti?<MultiFig figs={fig.figs} dim={size-6}/>:fig?<Fig {...fig} dim={size-6}/>:<span style={{fontSize:18,color:"#94a3b8",fontWeight:700}}>?</span>}
  </div>);}

function CondFig({shape=0,dot="in",dim=52}){
  const c=dim/2,r=dim/2-6,sid="#1e3a5f";
  const poly=n=>Array.from({length:n},(_,i)=>{const a=i*2*Math.PI/n-Math.PI/2;return`${c+r*Math.cos(a)},${c+r*Math.sin(a)}`;}).join(" ");
  const shapeEl=shape===0?<circle cx={c} cy={c} r={r} fill="none" stroke={sid} strokeWidth={1.8}/>:<polygon points={poly(shape)} fill="none" stroke={sid} strokeWidth={1.8}/>;
  const dotPos={in:[c,c],out:[c,dim-4],top:[c,3],bot:[c,dim-3],left:[3,c],right:[dim-3,c],tl:[c*0.4,c*0.4],tr:[c*1.6,c*0.4],bl:[c*0.4,c*1.6],br:[c*1.6,c*1.6]};
  const[dx,dy]=dotPos[dot]||[c,c];
  return(<svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>{shapeEl}<circle cx={dx} cy={dy} r={3.2} fill="#1e3a5f"/></svg>);}

function scoreSubtest(answers,items){let c=0;Object.entries(answers).forEach(([idx,chosen])=>{if(chosen===items[parseInt(idx)].ans)c++;});return c;}

// ── Subtest renderers ─────────────────────────────────────────────
function SeriesSubtest({onComplete,t}){
  const[idx,setIdx]=useState(0);const[answers,setAnswers]=useState({});const[selected,setSelected]=useState(null);const[confirmed,setConfirmed]=useState(false);
  const item=SERIES[idx];
  const confirm=(choiceIdx)=>{setSelected(choiceIdx);setConfirmed(true);setTimeout(()=>{const newAns={...answers,[idx]:choiceIdx};setAnswers(newAns);setSelected(null);setConfirmed(false);if(idx+1>=SERIES.length){onComplete(newAns);}else{setIdx(idx+1);}},500);};
  const skip=()=>{const newAns={...answers,[idx]:-1};setAnswers(newAns);if(idx+1>=SERIES.length){onComplete(newAns);}else{setIdx(idx+1);}};
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:12,color:"#64748b"}}>{idx+1}/{SERIES.length}</span><div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}><div style={{width:`${(idx/SERIES.length)*100}%`,height:"100%",background:"#0d9488"}}/></div></div>
    <p style={{fontSize:13,color:"#374151",marginBottom:14,fontWeight:500}}>What comes next in the pattern?</p>
    <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
      {item.seq.map((fig,i)=><FigBox key={i} fig={fig} size={54}/>)}
      <div style={{width:54,height:54,border:"2px dashed #0d9488",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:"#f0fdfa"}}><span style={{fontSize:20,color:"#0d9488",fontWeight:800}}>?</span></div>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
      {item.choices.map((fig,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><FigBox fig={fig} size={54} selected={selected===i} onClick={()=>!confirmed&&confirm(i)}/><span style={{fontSize:12,fontWeight:700,color:selected===i?"#0d5c6e":"#94a3b8"}}>{i+1}</span></div>))}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button onClick={skip} style={{padding:"6px 14px",borderRadius:7,background:"#f1f5f9",color:"#64748b",border:"none",fontSize:12,cursor:"pointer"}}>{t.skip}</button></div>
  </div>);}

function ClassifSubtest({onComplete,t}){
  const[idx,setIdx]=useState(0);const[answers,setAnswers]=useState({});const[selected,setSelected]=useState(null);
  const item=CLASSIF[idx];
  const confirm=(choiceIdx)=>{setSelected(choiceIdx);setTimeout(()=>{const newAns={...answers,[idx]:choiceIdx};setAnswers(newAns);setSelected(null);if(idx+1>=CLASSIF.length){onComplete(newAns);}else{setIdx(idx+1);}},500);};
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:12,color:"#64748b"}}>{idx+1}/{CLASSIF.length}</span><div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}><div style={{width:`${(idx/CLASSIF.length)*100}%`,height:"100%",background:"#7c3aed"}}/></div></div>
    <p style={{fontSize:13,color:"#374151",marginBottom:14,fontWeight:500}}>Which one is different from the others?</p>
    <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
      {item.figs.map((fig,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><FigBox fig={fig} size={58} selected={selected===i} onClick={()=>selected===null&&confirm(i)}/><span style={{fontSize:12,fontWeight:700,color:selected===i?"#7c3aed":"#94a3b8"}}>{i+1}</span></div>))}
    </div>
  </div>);}

function MatrixSubtest({onComplete,t}){
  const[idx,setIdx]=useState(0);const[answers,setAnswers]=useState({});const[selected,setSelected]=useState(null);
  const item=MATRICES[idx];const cellSz=50;
  const confirm=(choiceIdx)=>{setSelected(choiceIdx);setTimeout(()=>{const newAns={...answers,[idx]:choiceIdx};setAnswers(newAns);setSelected(null);if(idx+1>=MATRICES.length){onComplete(newAns);}else{setIdx(idx+1);}},500);};
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:12,color:"#64748b"}}>{idx+1}/{MATRICES.length}</span><div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}><div style={{width:`${(idx/MATRICES.length)*100}%`,height:"100%",background:"#1d4ed8"}}/></div></div>
    <p style={{fontSize:13,color:"#374151",marginBottom:14,fontWeight:500}}>Which picture completes the grid?</p>
    <div style={{display:"inline-grid",gridTemplateColumns:`repeat(3,${cellSz}px)`,gap:3,border:"2px solid #1d4ed8",borderRadius:8,padding:4,marginBottom:16,background:"#eff6ff"}}>
      {item.rows.flatMap((row,ri)=>row.map((cell,ci)=>cell?<FigBox key={`${ri}-${ci}`} fig={cell} size={cellSz}/>:<div key={`${ri}-${ci}`} style={{width:cellSz,height:cellSz,border:"2px dashed #1d4ed8",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:"white"}}><span style={{fontSize:18,color:"#1d4ed8",fontWeight:800}}>?</span></div>))}
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
      {item.choices.map((fig,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><FigBox fig={fig} size={52} selected={selected===i} onClick={()=>selected===null&&confirm(i)}/><span style={{fontSize:12,fontWeight:700,color:selected===i?"#1d4ed8":"#94a3b8"}}>{i+1}</span></div>))}
    </div>
  </div>);}

function CondSubtest({onComplete,t}){
  const[idx,setIdx]=useState(0);const[answers,setAnswers]=useState({});const[selected,setSelected]=useState(null);
  const item=CONDITIONS[idx];const cellSz=56;
  const confirm=(choiceIdx)=>{setSelected(choiceIdx);setTimeout(()=>{const newAns={...answers,[idx]:choiceIdx};setAnswers(newAns);setSelected(null);if(idx+1>=CONDITIONS.length){onComplete(newAns);}else{setIdx(idx+1);}},500);};
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:12,color:"#64748b"}}>{idx+1}/{CONDITIONS.length}</span><div style={{flex:1,height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}><div style={{width:`${(idx/CONDITIONS.length)*100}%`,height:"100%",background:"#0891b2"}}/></div></div>
    <p style={{fontSize:13,color:"#374151",marginBottom:10,fontWeight:500}}>Which follows the same rule as the example?</p>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <div style={{border:"2px solid #0891b2",borderRadius:8,padding:4,background:"#ecfeff"}}><CondFig shape={item.ref.shape} dot={item.ref.dot} dim={cellSz}/></div>
      <span style={{fontSize:22,color:"#94a3b8",fontWeight:700}}>→</span>
      <span style={{fontSize:12,color:"#64748b"}}>Choose the matching dot rule</span>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
      {item.choices.map((c,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <div style={{width:cellSz,height:cellSz,border:`${selected===i?"2.5px solid #0891b2":"1.5px solid #e2e8f0"}`,borderRadius:8,background:selected===i?"#ecfeff":"#fafafa",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:selected===i?"0 0 0 3px #a5f3fc":"none"}} onClick={()=>selected===null&&confirm(i)}><CondFig shape={c.shape} dot={c.dot} dim={cellSz-6}/></div>
        <span style={{fontSize:12,fontWeight:700,color:selected===i?"#0891b2":"#94a3b8"}}>{i+1}</span>
      </div>))}
    </div>
  </div>);}

// ══════════════════════════════════════════════════════════════════════════════
//  ADULT REPORT — Comprehensive Clinical Report
// ══════════════════════════════════════════════════════════════════════════════
function VISTAReport({catResult, scss, subjInfo, t, onNew}){
  const[tab,setTab]=useState("self");
  const today=new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});

  const SBar=({label,value,max=100,color="#0d5c6e",lo=null,hi=null})=>(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
        <span style={{color:"#374151",fontWeight:600}}>{label}</span>
        <span style={{fontWeight:800,color,fontFamily:"monospace"}}>{value}</span>
      </div>
      <div style={{background:"#f3f4f6",borderRadius:4,height:8,overflow:"hidden",position:"relative"}}>
        <div style={{width:`${(value/max)*100}%`,height:"100%",background:color,borderRadius:4}}/>
        {lo!==null&&<div style={{position:"absolute",top:0,left:`${lo}%`,width:`${hi-lo}%`,height:"100%",background:"rgba(0,0,0,0.12)",borderRadius:2}}/>}
      </div>
      {lo!==null&&<div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>Normal range: {lo}–{hi}</div>}
    </div>);

  const Card=({title,color="#1e3a5f",children})=>(
    <div style={{background:"white",borderRadius:14,marginBottom:16,border:`1px solid ${color}18`,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
      <div style={{background:`linear-gradient(135deg,${color},${color}dd)`,padding:"12px 16px",color:"white"}}>
        <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase"}}>{title}</div>
      </div>
      <div style={{padding:16}}>{children}</div>
    </div>);

  return(
    <div style={{background:"#e8ecf0",minHeight:"100vh",padding:"16px 8px 80px",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`@media print{body{background:white!important}#no-print{display:none!important}}`}</style>
      <div id="no-print" style={{maxWidth:800,margin:"0 auto 14px",display:"flex",gap:9,flexWrap:"wrap"}}>
        <button onClick={()=>window.print()} style={{flex:1,minWidth:130,padding:"11px",background:"#1e3a5f",color:"white",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer"}}>{t.printPDF}</button>
        <button onClick={onNew} style={{flex:1,minWidth:130,padding:"11px",background:"white",color:"#1e3a5f",border:"1.5px solid #1e3a5f",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.newAssessment}</button>
      </div>

      <div style={{maxWidth:800,margin:"0 auto",background:"white",boxShadow:"0 4px 40px rgba(0,0,0,0.12)",borderRadius:4}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#0d1f3c,#1e3a5f,#1a56a0)",padding:"22px 24px",color:"white"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"#93c5fd",marginBottom:4}}>CIBS-VISTA · Adult Cognitive & Personality Assessment</div>
              <div style={{fontSize:22,fontWeight:900,lineHeight:1.3}}>Assessment Report</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2}}>CIBS-CAT + SCSS · Central Institute of Behavioural Sciences, Nagpur</div>
            </div>
            <div style={{textAlign:"right",fontSize:11,color:"rgba(255,255,255,0.7)",lineHeight:2}}>
              <div style={{color:"white",fontWeight:700,fontSize:13}}>{today}</div>
              <div>Dr. Shailesh V. Pangaonkar</div>
              <div>Director & Consultant Psychiatrist</div>
              <div>MBBS, DPM, DNB, MSc BA</div>
            </div>
          </div>
          {/* Subject strip */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:16}}>
            {[["Name",subjInfo.name||"—"],["Age",subjInfo.age+" yrs"],["Gender",subjInfo.gender||"—"],["Education",subjInfo.edu||"—"]].map(([k,v])=>(
              <div key={k} style={{background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontSize:9,color:"#93c5fd",letterSpacing:"0.08em",textTransform:"uppercase"}}>{k}</div>
                <div style={{fontSize:12,fontWeight:700,color:"white",marginTop:2}}>{v}</div>
              </div>))}
          </div>
          {/* Codes strip */}
          <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["SCSS Code",`S${scss.meta.shapeCode}·C${scss.meta.colorCode}·Sh${scss.meta.shadeCode}·Sm${scss.meta.smileyCode}`],["Primary Shape",scss.meta.firstShape],["Primary Colour",scss.meta.firstColor],["Primary Shade",scss.meta.firstShade.split(" ")[0]+" "+scss.meta.firstShade.split(" ")[1]],["Affect",scss.meta.firstSmiley]].map(([k,v])=>(
              <div key={k} style={{background:"rgba(255,255,255,0.08)",borderRadius:6,padding:"5px 10px"}}>
                <div style={{fontSize:8,color:"#93c5fd",letterSpacing:"0.06em"}}>{k}</div>
                <div style={{fontSize:11,fontWeight:700,color:"white"}}>{v}</div>
              </div>))}
          </div>
        </div>

        {/* Tab bar */}
        <div id="no-print" style={{display:"flex",borderBottom:"2px solid #e2e8f0",background:"#f8fafc"}}>
          {[["self","👤 "+t.forSelf],["clinician","🏥 "+t.forClinician]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px",background:tab===id?"white":"transparent",color:tab===id?"#1e3a5f":"#64748b",border:"none",borderBottom:tab===id?"2px solid #1e3a5f":"2px solid transparent",marginBottom:-2,fontSize:12,fontWeight:tab===id?700:500,cursor:"pointer",transition:"all 0.2s"}}>{label}</button>))}
        </div>

        <div style={{padding:"20px 20px 40px"}}>
          {/* ═══ SELF TAB ═══ */}
          {tab==="self"&&(
            <div>
              {/* CAT Cognitive Result */}
              <Card title="Part 1 — Cognitive Ability (CIBS-CAT)" color="#0d5c6e">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                  <div style={{background:catResult.bg,borderRadius:12,padding:16,textAlign:"center",border:`1px solid ${catResult.color}30`}}>
                    <div style={{fontSize:10,color:catResult.color,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>CIBS-CAT IQ Estimate</div>
                    <div style={{fontSize:42,fontWeight:900,color:catResult.color,lineHeight:1}}>{catResult.iq}</div>
                    <div style={{fontSize:13,fontWeight:700,color:catResult.color,marginTop:4}}>{catResult.band}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{catResult.pct}th percentile</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,justifyContent:"center"}}>
                    <div style={{background:"#f8fafc",borderRadius:10,padding:12}}>
                      <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Items Correct</div>
                      <div style={{fontSize:18,fontWeight:900,color:"#1e3a5f"}}>{catResult.total} / {catResult.maxRaw}</div>
                    </div>
                    <div style={{background:"#f8fafc",borderRadius:10,padding:12}}>
                      <div style={{fontSize:11,color:"#374151",lineHeight:1.6}}>{catResult.desc}</div>
                    </div>
                  </div>
                </div>
                {/* IQ Bell curve visual */}
                <div style={{background:"#f8fafc",borderRadius:10,padding:12,marginBottom:8}}>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:8,textTransform:"uppercase"}}>Population Range</div>
                  <div style={{display:"flex",gap:2,alignItems:"flex-end",height:40}}>
                    {[{r:"<70",h:10},{r:"70–79",h:20},{r:"80–89",h:35},{r:"90–109",h:40},{r:"110–119",h:35},{r:"120–129",h:20},{r:"≥130",h:10}].map((bar,i)=>{
                      const iq=catResult.iq;
                      const inRange=(i===0&&iq<70)||(i===1&&iq>=70&&iq<80)||(i===2&&iq>=80&&iq<90)||(i===3&&iq>=90&&iq<110)||(i===4&&iq>=110&&iq<120)||(i===5&&iq>=120&&iq<130)||(i===6&&iq>=130);
                      return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{width:"100%",height:bar.h,background:inRange?catResult.color:"#e2e8f0",borderRadius:"3px 3px 0 0",position:"relative"}}>
                          {inRange&&<div style={{position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",fontSize:9,fontWeight:900,color:catResult.color,whiteSpace:"nowrap"}}>▼ YOU</div>}
                        </div>
                        <div style={{fontSize:7,color:"#94a3b8",textAlign:"center",lineHeight:1.2}}>{bar.r}</div>
                      </div>);})}
                  </div>
                </div>
              </Card>

              {/* SCSS Cognitive Style */}
              <Card title="Cognitive Style (SCSS)" color="#1d4ed8">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div style={{background:"#eff6ff",borderRadius:10,padding:12}}>
                    <div style={{fontSize:10,color:"#1d4ed8",fontWeight:700,marginBottom:3}}>Primary Style</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#1e3a5f"}}>{scss.d1.primaryStyle}</div>
                  </div>
                  <div style={{background:"#eff6ff",borderRadius:10,padding:12}}>
                    <div style={{fontSize:10,color:"#1d4ed8",fontWeight:700,marginBottom:3}}>Processing</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#1e3a5f"}}>{scss.d1.procOrient}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:"#64748b",background:"#f8fafc",padding:"10px 12px",borderRadius:8}}>
                  Cognitive Flexibility: <strong>{scss.d1.flexLabel}</strong> · Secondary style: <strong>{scss.d1.secondaryStyle}</strong>
                </div>
              </Card>

              {/* Personality */}
              <Card title="Personality Profile (Big Five + DSM-5)" color="#7c3aed">
                <div style={{background:"#f5f3ff",borderRadius:10,padding:12,marginBottom:14,border:"1px solid #ddd6fe"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#6d28d9",marginBottom:4}}>{scss.d2.dsmCluster}</div>
                  <div style={{fontSize:12,color:"#4c1d95",fontWeight:600,marginBottom:4}}>{scss.d2.dsmFeatures}</div>
                  <div style={{fontSize:11,color:"#64748b",lineHeight:1.7}}>{scss.d2.dsmDesc}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:8}}>
                  {[["O","Openness","#8b5cf6"],["C","Consci.","#0891b2"],["E","Extraver.","#059669"],["A","Agreeable.","#d97706"],["N","Neuroticism","#dc2626"]].map(([d,label,color])=>(
                    <div key={d} style={{background:"white",borderRadius:10,padding:10,border:`1px solid ${color}30`,textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                      <div style={{fontSize:22,fontWeight:900,color}}>{scss.d2.BFt[d]}</div>
                      <div style={{fontSize:9,color:"#9ca3af",marginTop:2}}>{label}</div>
                      <div style={{height:3,background:"#f1f5f9",borderRadius:2,marginTop:6,overflow:"hidden"}}><div style={{width:`${(scss.d2.BFt[d]/70)*100}%`,height:"100%",background:color,borderRadius:2}}/></div>
                    </div>))}
                </div>
                <div style={{fontSize:10,color:"#64748b",textAlign:"center"}}>Big Five T-scores (mean=50, SD=10). Normal range: 40–60</div>
              </Card>

              {/* Emotional Intelligence */}
              <Card title="Emotional Intelligence & Wellbeing" color="#059669">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                  <div style={{background:"#f0fdf4",borderRadius:10,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#059669",fontWeight:700}}>EQ Standard Score</div>
                    <div style={{fontSize:36,fontWeight:900,color:"#059669"}}>{scss.d3.EQSS}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#16a34a"}}>{scss.d3.eqBand.band}</div>
                    <div style={{fontSize:10,color:"#64748b"}}>{scss.d3.eqBand.percentile} percentile</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,justifyContent:"center"}}>
                    <SBar label="Self-Awareness" value={scss.d3.selfAwareness} color="#10b981"/>
                    <SBar label="Regulation" value={scss.d3.emoRegulation} color="#3b82f6"/>
                    <SBar label="Resilience" value={scss.d3.emoResilience} color="#8b5cf6"/>
                    <SBar label="ESI (Overall)" value={scss.d3.ESI} color="#059669"/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{background:"#f8fafc",borderRadius:10,padding:12}}>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:700}}>Emotional State</div>
                    <div style={{fontSize:14,fontWeight:800,color:"#1e3a5f",marginTop:3}}>{scss.d3.affState}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{scss.d3.affValence} valence</div>
                  </div>
                  <div style={{background:"#f8fafc",borderRadius:10,padding:12}}>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:700}}>Mental Burden</div>
                    <div style={{fontSize:14,fontWeight:800,color:scss.d3.shadePrimary.mentalBurden>=60?"#dc2626":"#059669",marginTop:3}}>{scss.d3.shadePrimary.mentalBurden}/100</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{scss.d3.shadePrimary.mentalBurden>=60?"Elevated — attention needed":"Within manageable range"}</div>
                  </div>
                </div>
              </Card>

              {/* Health Parameters */}
              <Card title="Health Parameters" color="#0891b2">
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                  {[["Mental Health",scss.d4.MHI,"#3b82f6"],["Physical",scss.d4.physNorm,"#10b981"],["Social",scss.d4.SFI,"#8b5cf6"],["Overall WBI",scss.d4.overallWBI,"#f59e0b"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:10,textAlign:"center",border:`1px solid ${c}30`}}>
                      <div style={{fontSize:22,fontWeight:900,color:v>=60?c:v>=40?"#d97706":"#dc2626"}}>{v}</div>
                      <div style={{fontSize:10,color:"#64748b",marginTop:3}}>{l}</div>
                      <div style={{height:3,background:"#e2e8f0",borderRadius:2,marginTop:6,overflow:"hidden"}}><div style={{width:`${v}%`,height:"100%",background:v>=60?c:v>=40?"#d97706":"#dc2626",borderRadius:2}}/></div>
                    </div>))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:6}}>Mental Health Indicators</div>
                    <SBar label="Distress Level" value={scss.d4.distressRaw} color={scss.d4.phqAnalog.severity>=2?"#dc2626":"#059669"}/>
                    <SBar label="Anxiety" value={scss.d4.anxIdx} color={scss.d4.anxIdx>=60?"#d97706":"#0891b2"}/>
                    <SBar label="Depression" value={scss.d4.depIdx} color={scss.d4.depIdx>=60?"#dc2626":"#0891b2"}/>
                  </div>
                  <div style={{background:"#f8fafc",borderRadius:10,padding:12}}>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:6}}>Distress Classification</div>
                    <div style={{fontSize:18,fontWeight:900,color:scss.d4.phqAnalog.severity>=2?"#dc2626":scss.d4.phqAnalog.severity>=1?"#d97706":"#059669"}}>{scss.d4.phqAnalog.level}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:4}}>Autonomic Arousal: <strong>{scss.d4.physArousal}</strong></div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Social Functioning: <strong>{scss.d4.SFI>=70?"Adequate":scss.d4.SFI>=50?"Moderate":"Limited"}</strong></div>
                  </div>
                </div>
              </Card>

              {/* Risk Profile */}
              <Card title="Risk Profile" color="#dc2626">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                  {[["Suicidality",scss.d5.SIR,scss.d5.SIR_raw],["Substance Use",scss.d5.SUR,scss.d5.SUR_raw],["Conduct",scss.d5.CDR,scss.d5.CDR_raw]].map(([label,risk,raw])=>(
                    <div key={label} style={{background:risk.bg,borderRadius:10,padding:12,border:`1px solid ${risk.border}`}}>
                      <div style={{fontSize:9,color:risk.color,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{label}</div>
                      <div style={{fontSize:16,fontWeight:900,color:risk.color}}>{risk.level}</div>
                      <div style={{fontSize:10,color:"#64748b",marginTop:2}}>Raw index: {raw}</div>
                    </div>))}
                </div>
                <div style={{background:scss.d5.maxFlag>=2?"#fef2f2":"#f0fdf4",border:`1px solid ${scss.d5.maxFlag>=2?"#fca5a5":"#86efac"}`,borderRadius:10,padding:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:scss.d5.maxFlag>=2?"#dc2626":"#059669",marginBottom:3}}>Combined Risk Index</div>
                  <div style={{fontSize:16,fontWeight:900,color:scss.d5.maxFlag>=2?"#dc2626":"#059669"}}>{scss.d5.CRI}</div>
                  {scss.d5.maxFlag>=2&&<div style={{fontSize:11,color:"#64748b",marginTop:4}}>⚠ Structured clinical assessment recommended at earliest opportunity.</div>}
                </div>
              </Card>

              <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:10,padding:14,fontSize:11,color:"#92400e",lineHeight:1.7}}>
                <strong>Disclaimer:</strong> {t.disclaimer2} CIBS-VISTA is not a substitute for comprehensive clinical assessment. All elevated indicators require follow-up with a qualified mental health professional.
              </div>
            </div>)}

          {/* ═══ CLINICIAN TAB ═══ */}
          {tab==="clinician"&&(
            <div style={{fontFamily:"'Courier New',monospace"}}>
              <div style={{background:"#1e3a5f",color:"white",borderRadius:10,padding:"14px 18px",marginBottom:20}}>
                <div style={{fontSize:10,letterSpacing:"0.15em",color:"#93c5fd"}}>CIBS-VISTA CLINICAL REPORT — CONFIDENTIAL</div>
                <div style={{fontSize:13,fontWeight:700,marginTop:4}}>{subjInfo.name||"Anonymous"} · Age {subjInfo.age} · {subjInfo.gender} · {today}</div>
                <div style={{fontSize:11,color:"#93c5fd",marginTop:2}}>Examiner: {subjInfo.examiner||"—"} · Setting: {subjInfo.setting||"—"} · File: {subjInfo.fileNo||"—"}</div>
                <div style={{fontSize:11,color:"#93c5fd",marginTop:2}}>SCSS Codes: S{scss.meta.shapeCode}·C{scss.meta.colorCode}·Sh{scss.meta.shadeCode}·Sm{scss.meta.smileyCode} | Diagnosis: {subjInfo.diagnosis||"—"}</div>
              </div>

              {/* Section 1: Cognitive */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:900,color:"#0d5c6e",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:"2px solid #0d5c6e"}}>I. COGNITIVE ABILITY — CIBS-CAT</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <tbody>
                    {[["IQ Estimate (CIBS-CAT)",catResult.iq,"Mean=100, SD=15"],["Classification Band",catResult.band,""],["Percentile Rank",catResult.pct+"th","Population reference"],["Items Correct",`${catResult.total} / ${catResult.maxRaw}`,"Raw score"],["SCSS-CQ (Visual Reasoning)",scss.d1.CQ,iqBand(scss.d1.CQ).band+" · "+iqBand(scss.d1.CQ).percentile],["Cognitive Style",scss.d1.primaryStyle,""],["Processing Orientation",scss.d1.procOrient,""],["Cognitive Flexibility",scss.d1.flexLabel,"Gap index: "+scss.d1.flexIndex]].map(([l,v,n])=>(
                      <tr key={l} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 8px",fontWeight:600,color:"#374151",width:"40%"}}>{l}</td>
                        <td style={{padding:"6px 8px",fontWeight:900,color:"#1e3a5f",width:"35%"}}>{v}</td>
                        <td style={{padding:"6px 8px",color:"#9ca3af",fontSize:10,width:"25%"}}>{n}</td>
                      </tr>))}
                  </tbody>
                </table>
                <div style={{background:"#f0f9ff",borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:11,color:"#0369a1",lineHeight:1.7}}>
                  <strong>Clinical Note:</strong> {catResult.desc} SCSS-CQ and CIBS-CAT scores should be interpreted together with clinical history, MSE, and formal neuropsychological evaluation where indicated.
                </div>
              </div>

              {/* Section 2: Personality */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:900,color:"#7c3aed",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:"2px solid #7c3aed"}}>II. PERSONALITY ORGANISATION (SCSS)</div>
                <div style={{background:"#f5f3ff",borderRadius:8,padding:"10px 12px",marginBottom:12,border:"1px solid #ddd6fe"}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#6d28d9"}}>{scss.d2.dsmCluster} — {scss.d2.dsmFeatures}</div>
                  <div style={{fontSize:11,color:"#4c1d95",marginTop:4,lineHeight:1.7}}>{scss.d2.dsmDesc}</div>
                  <div style={{fontSize:11,color:"#6d28d9",marginTop:6,fontWeight:700}}>Clinical action: {scss.d2.dsmClinical}</div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr style={{background:"#f8fafc"}}>{["Domain","T-Score","Interpretation"].map(h=><th key={h} style={{padding:"6px 8px",fontSize:10,color:"#6b7280",textTransform:"uppercase",fontWeight:700,textAlign:"left"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[["Openness (O)","#8b5cf6"],["Conscientiousness (C)","#0891b2"],["Extraversion (E)","#059669"],["Agreeableness (A)","#d97706"],["Neuroticism (N)","#dc2626"]].map(([label,color],i)=>{
                      const k=["O","C","E","A","N"][i];
                      return(<tr key={k} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 8px",fontWeight:600,color:"#374151"}}>{label}</td>
                        <td style={{padding:"6px 8px",fontWeight:900,color}}>{scss.d2.BFt[k]}</td>
                        <td style={{padding:"6px 8px",fontSize:10,color:"#64748b"}}>{scss.d2.bfDesc[k]}</td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>

              {/* Section 3: EQ & Health */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:900,color:"#059669",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:"2px solid #059669"}}>III. EMOTIONAL INTELLIGENCE & HEALTH INDICATORS</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <tbody>
                    {[["EQ Standard Score",scss.d3.EQSS,scss.d3.eqBand.band+" · "+scss.d3.eqBand.percentile],["Emotional Stability Index (ESI)",scss.d3.ESI+"/100",""],["Self-Awareness",scss.d3.selfAwareness+"/100",""],["Emotional Regulation",scss.d3.emoRegulation+"/100",""],["Resilience",scss.d3.emoResilience+"/100",""],["Mental Health Index (MHI)",scss.d4.MHI+"/100","PHQ-analog: "+scss.d4.phqAnalog.level],["Anxiety Indicator",scss.d4.anxIdx+"/100",scss.d4.anxLevel],["Depression Indicator",scss.d4.depIdx+"/100",scss.d4.depLevel],["Physical Health Index",scss.d4.physNorm+"/100","Autonomic arousal: "+scss.d4.physArousal],["Social Functioning Index",scss.d4.SFI+"/100",scss.d4.SFI>=70?"Adequate":"Reduced"],["Overall Wellbeing Index",scss.d4.overallWBI+"/100",""]].map(([l,v,n])=>(
                      <tr key={l} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 8px",fontWeight:600,color:"#374151",width:"40%"}}>{l}</td>
                        <td style={{padding:"6px 8px",fontWeight:900,color:"#1e3a5f",width:"25%"}}>{v}</td>
                        <td style={{padding:"6px 8px",color:"#9ca3af",fontSize:10,width:"35%"}}>{n}</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>

              {/* Section 4: Risk */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:900,color:"#dc2626",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:"2px solid #dc2626"}}>IV. RISK FACTOR PROFILE</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead><tr style={{background:"#f8fafc"}}>{["Scale","Level","Raw Index","Key Indicators"].map(h=><th key={h} style={{padding:"6px 8px",fontSize:10,color:"#6b7280",textTransform:"uppercase",fontWeight:700,textAlign:"left"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[["Suicidal Ideation (C-CSSRS analog)",scss.d5.SIR,scss.d5.SIR_raw,scss.d5.SIR_indicators],["Substance Use Risk",scss.d5.SUR,scss.d5.SUR_raw,scss.d5.SUR_indicators],["Conduct/Aggression Risk",scss.d5.CDR,scss.d5.CDR_raw,scss.d5.CDR_indicators]].map(([label,risk,raw,inds])=>(
                      <tr key={label} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 8px",fontWeight:600,color:"#374151",fontSize:11}}>{label}</td>
                        <td style={{padding:"6px 8px",fontWeight:900,color:risk.color,fontSize:11}}>{risk.level}</td>
                        <td style={{padding:"6px 8px",fontWeight:700,color:"#374151"}}>{raw}</td>
                        <td style={{padding:"6px 8px",fontSize:9,color:"#64748b"}}>{inds.join("; ")}</td>
                      </tr>))}
                  </tbody>
                </table>
                <div style={{background:scss.d5.maxFlag>=2?"#fef2f2":"#f0fdf4",border:`1px solid ${scss.d5.maxFlag>=2?"#fca5a5":"#86efac"}`,borderRadius:8,padding:"10px 12px",marginTop:12}}>
                  <strong>Combined Risk Index: {scss.d5.CRI}</strong>
                  {scss.d5.maxFlag>=3&&<div style={{marginTop:4,color:"#dc2626",fontWeight:700}}>⚠ PRIORITY: Immediate structured clinical evaluation and safety planning required.</div>}
                  {scss.d5.maxFlag===2&&<div style={{marginTop:4,color:"#d97706"}}>Structured clinical interview and targeted intervention indicated at next clinical contact.</div>}
                </div>
              </div>

              {/* Recommendations */}
              <div style={{background:"#f8fafc",borderRadius:10,padding:"14px 16px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:11,fontWeight:900,color:"#1e3a5f",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>Clinical Recommendations</div>
                <ol style={{margin:0,paddingLeft:18,fontSize:11,color:"#374151",lineHeight:2}}>
                  <li>Correlate CIBS-CAT score ({catResult.iq} — {catResult.band}) with standardised neuropsychological evaluation (Wechsler Adult, NIMHANS battery) before clinical decision-making.</li>
                  <li>Verify {scss.d2.dsmCluster} ({scss.d2.dsmFeatures}) with structured personality assessment (NEO-PI-3, PID-5, or SCID-5-PD).</li>
                  <li>Apply validated primary instruments for confirmed domains: PHQ-9 (depression), GAD-7 (anxiety), AUDIT (substance), Columbia C-SSRS (suicidality).</li>
                  <li>{scss.d5.maxFlag>=2?"PRIORITY — Administer Columbia C-SSRS in full at this clinical contact. Risk indicators elevated on SCSS.":"Monitor risk indicators at next scheduled contact. C-CSSRS indicated if clinical picture warrants."}</li>
                  <li>Address {scss.d4.phqAnalog.level} distress level with appropriate psychosocial and pharmacological intervention as clinically indicated.</li>
                  <li>Schedule CIBS-VISTA reassessment in 3–6 months or following any major therapeutic intervention.</li>
                </ol>
              </div>

              <div style={{marginTop:16,fontSize:10,color:"#9ca3af",lineHeight:1.8,borderTop:"1px solid #e2e8f0",paddingTop:12}}>
                <strong>Instruments:</strong> CIBS-CAT (CIBS original, Cattell 1973 framework) · SCSS (Dr. S.V. Pangaonkar, CIBS Nagpur, 2024) · DSM-5 (APA, 2013) · Big Five (Costa & McCrae, 1992) · C-SSRS analogue (Posner et al., 2011)<br/>
                <strong>Disclaimer:</strong> This is a screening report. All findings require clinical confirmation. Not a substitute for comprehensive psychiatric evaluation. For qualified clinician use only.
              </div>
            </div>)}
        </div>
      </div>
    </div>);}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function CIBSVISTAAdult(){
  const[lang,setLang]=useState(null);
  const[screen,setScreen]=useState("language");
  const[role,setRole]=useState(null);
  const[agreed,setAgreed]=useState(false);
  const[subjInfo,setSubjInfo]=useState({name:"",age:"",gender:"",edu:"",occ:"",mobile:"",diagnosis:"",examiner:"",setting:"",fileNo:""});
  const[catPhase,setCatPhase]=useState("intro");
  const[catScores,setCatScores]=useState({});
  const[pracSel,setPracSel]=useState(null);
  const[scssPhase,setScssPhase]=useState("intro");
  const[shapeSeq,setShapeSeq]=useState([]);
  const[colorSeq,setColorSeq]=useState([]);
  const[shadeSeq,setShadeSeq]=useState([]);
  const[smileySeq,setSmileySeq]=useState([]);
  const[storedFS,setStoredFS]=useState(null);
  const[storedFC,setStoredFC]=useState(null);
  const[storedShades,setStoredShades]=useState([]);
  const[generating,setGenerating]=useState(false);
  const[genStep,setGenStep]=useState(0);
  const[catResult,setCatResult]=useState(null);
  const[scssResult,setScssResult]=useState(null);

  const t=T[lang]||T.en;
  const rootStyle={minHeight:"100vh",background:"#f0f4f8",fontFamily:"'Segoe UI',system-ui,sans-serif",padding:"0 0 60px"};
  const cardStyle={background:"white",borderRadius:14,padding:"20px 18px",maxWidth:560,width:"100%",margin:"0 auto",boxShadow:"0 2px 18px rgba(0,0,0,0.09)"};

  const reset=()=>{setScreen("language");setLang(null);setRole(null);setAgreed(false);setSubjInfo({name:"",age:"",gender:"",edu:"",occ:"",mobile:"",diagnosis:"",examiner:"",setting:"",fileNo:""});setCatPhase("intro");setCatScores({});setPracSel(null);setScssPhase("intro");setShapeSeq([]);setColorSeq([]);setShadeSeq([]);setSmileySeq([]);setStoredFS(null);setStoredFC(null);setStoredShades([]);setGenerating(false);setGenStep(0);setCatResult(null);setScssResult(null);};

  const scoreSubtests=(scores)=>{
    return{SER:scoreSubtest(scores.SER||{},SERIES),CLS:scoreSubtest(scores.CLS||{},CLASSIF),MAT:scoreSubtest(scores.MAT||{},MATRICES),CON:scoreSubtest(scores.CON||{},CONDITIONS)};
  };

  const runReport=async(seqs)=>{
    setGenerating(true);
    const steps=[0,1,2,3,4];
    for(const s of steps){setGenStep(s);await new Promise(r=>setTimeout(r,600));}

    const subtotals=scoreSubtests(catScores);
    const totalCorrect=Object.values(subtotals).reduce((a,b)=>a+b,0);
    const cat=computeCAT({total:totalCorrect},parseInt(subjInfo.age)||35);
    setCatResult(cat);

    const scss=computeSCSS(seqs.shapeSeq,seqs.colorSeq,seqs.shadeSeq,seqs.smileySeq);
    setScssResult(scss);

    // Submit to Google Sheets
    try{
      const payload={
        uid:subjInfo.mobile?btoa(subjInfo.name.slice(0,3)+subjInfo.age+subjInfo.mobile.slice(-4)).slice(0,12).toUpperCase():"ANON-"+Date.now().toString(36).toUpperCase().slice(-6),
        name:subjInfo.name,age:subjInfo.age,gender:subjInfo.gender,education:subjInfo.edu,
        occupation:subjInfo.occ,mobile:subjInfo.mobile,diagnosis:subjInfo.diagnosis,
        examiner:subjInfo.examiner,setting:subjInfo.setting,fileNo:subjInfo.fileNo,
        source:"vista-adult",device:navigator.userAgent.match(/Mobile/i)?"Mobile":"Desktop",
        language:lang||"en",
        // CAT scores
        catIQ:cat.iq,catBand:cat.band,catPercentile:cat.pct,catTotal:cat.total,
        // SCSS VISTA scores
        vistaCQ:scss.d1.CQ,vistaIQBand:iqBand(scss.d1.CQ).band,
        vistaEQ:scss.d3.EQSS,vistaEQBand:scss.d3.eqBand.band,
        vistaDistress:scss.d4.phqAnalog.level,vistaRisk:scss.d5.CRI,
        vistaBF_O:scss.d2.BFt.O,vistaBF_C:scss.d2.BFt.C,vistaBF_E:scss.d2.BFt.E,vistaBF_A:scss.d2.BFt.A,vistaBF_N:scss.d2.BFt.N,
        vistaDSMCluster:scss.d2.dsmCluster,
        vistaShapeSeq:(seqs.shapeSeq||[]).join(","),vistaColorSeq:(seqs.colorSeq||[]).join(","),
        vistaShadeSeq:(seqs.shadeSeq||[]).join(","),vistaSmileySeq:(seqs.smileySeq||[]).join(","),
        // Health
        vistaMHI:scss.d4.MHI,vistaPhysical:scss.d4.physNorm,vistaSocial:scss.d4.SFI,
        vistaAnxiety:scss.d4.anxIdx,vistaDepression:scss.d4.depIdx,
        vistaOverallWBI:scss.d4.overallWBI,
        // Risk
        vistaSIR:scss.d5.SIR.level,vistaSUR:scss.d5.SUR.level,vistaCDR:scss.d5.CDR.level,
      };
      await submitToSheet(payload);
    }catch(e){console.error("Submission error:",e);}

    setGenerating(false);
    setScreen("report");
  };

  // ── Language selection ────────────────────────────────────────
  if(screen==="language") return(
    <div style={rootStyle}>
      <div style={{background:"linear-gradient(135deg,#0d1f3c,#1e3a5f)",padding:"28px 20px 40px",textAlign:"center",color:"white",marginBottom:-20}}>
        <div style={{fontSize:9,letterSpacing:"0.2em",color:"#93c5fd",textTransform:"uppercase",marginBottom:8}}>Central Institute of Behavioural Sciences, Nagpur</div>
        <div style={{fontSize:28,fontWeight:900,letterSpacing:"0.02em",marginBottom:4}}>CIBS-VISTA</div>
        <div style={{fontSize:13,color:"#bfdbfe",fontWeight:500}}>Adult Cognitive & Personality Screening</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:4}}>CIBS-CAT + SCSS · Dr. Shailesh V. Pangaonkar</div>
      </div>
      <div style={{...cardStyle,marginTop:40}}>
        <div style={{fontSize:13,fontWeight:700,color:"#1e3a5f",textAlign:"center",marginBottom:20}}>{T.en.choose}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["en","English","A"],["hi","हिंदी — Hindi","अ"],["mr","मराठी — Marathi","अ"]].map(([code,label,icon])=>(
            <button key={code} onClick={()=>{setLang(code);setScreen("role");}} style={{padding:"14px 18px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:600,color:"#1e3a5f",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.background="#eff6ff";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="white";}}>
              <span style={{width:36,height:36,borderRadius:"50%",background:"#1e3a5f",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,flexShrink:0}}>{icon}</span>
              {label}
            </button>))}
        </div>
      </div>
    </div>);

  // ── Role selection ────────────────────────────────────────────
  if(screen==="role") return(
    <div style={rootStyle}>
      <div style={{background:"linear-gradient(135deg,#0d1f3c,#1e3a5f)",padding:"20px",textAlign:"center",color:"white",marginBottom:24}}>
        <div style={{fontSize:16,fontWeight:800}}>{t.appTitle}</div>
        <div style={{fontSize:11,color:"#bfdbfe"}}>{t.subtitle}</div>
      </div>
      <div style={cardStyle}>
        <div style={{fontSize:14,fontWeight:700,color:"#1e3a5f",marginBottom:20,textAlign:"center"}}>{t.whoFills}</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[[t.clinician,t.clinSub,"🏥","clinician"],[t.self,t.selfSub,"👤","self"]].map(([title,sub,icon,r])=>(
            <button key={r} onClick={()=>{setRole(r);setScreen("disclaimer");}} style={{padding:"16px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.background="#eff6ff";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.background="white";}}>
              <span style={{fontSize:28}}>{icon}</span>
              <div><div style={{fontSize:14,fontWeight:700,color:"#1e3a5f"}}>{title}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{sub}</div></div>
            </button>))}
        </div>
      </div>
    </div>);

  // ── Disclaimer ────────────────────────────────────────────────
  if(screen==="disclaimer") return(
    <div style={rootStyle}>
      <div style={{background:"linear-gradient(135deg,#0d1f3c,#1e3a5f)",padding:"20px",textAlign:"center",color:"white",marginBottom:24}}>
        <div style={{fontSize:16,fontWeight:800}}>{t.appTitle}</div>
        <div style={{fontSize:11,color:"#bfdbfe"}}>{t.disclaimer}</div>
      </div>
      <div style={cardStyle}>
        <div style={{background:"#fef9ec",border:"1.5px solid #fcd34d",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#92400e",marginBottom:10}}>⚠ {t.disclaimer}</div>
          <ol style={{margin:0,paddingLeft:18,color:"#78350f",fontSize:12,lineHeight:2}}>
            {t.discPoints.map((p,i)=><li key={i}>{p}</li>)}
          </ol>
        </div>
        <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginBottom:20}}>
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{marginTop:2,width:16,height:16,flexShrink:0}}/>
          <span style={{fontSize:13,color:"#374151",lineHeight:1.6}}>{t.agreeText}</span>
        </label>
        <button onClick={()=>agreed&&setScreen("demographics")} style={{width:"100%",padding:"14px",borderRadius:12,background:agreed?"linear-gradient(135deg,#1e3a5f,#2d5a8e)":"#e2e8f0",color:agreed?"white":"#9ca3af",border:"none",fontSize:14,fontWeight:700,cursor:agreed?"pointer":"not-allowed"}}>{t.proceedBtn}</button>
      </div>
    </div>);

  // ── Demographics ──────────────────────────────────────────────
  if(screen==="demographics"){
    const f=(k,v)=>setSubjInfo(p=>({...p,[k]:v}));
    const canProceed=subjInfo.age&&subjInfo.gender;
    const INP={width:"100%",padding:"10px 12px",border:"1.5px solid #cbd5e1",borderRadius:10,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#fafafa",color:"#0f172a"};
    const LBL={display:"block",fontSize:10,fontWeight:700,color:"#1a2e4a",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4};
    return(
      <div style={rootStyle}>
        <div style={{background:"linear-gradient(135deg,#0d1f3c,#1e3a5f)",padding:"20px",textAlign:"center",color:"white",marginBottom:24}}>
          <div style={{fontSize:16,fontWeight:800}}>{t.appTitle} — {t.subjInfo}</div>
        </div>
        <div style={{...cardStyle,maxWidth:620}}>
          <div style={{background:"white",borderRadius:14,padding:16,marginBottom:14,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1a2e4a",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Participant</div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={LBL}>{t.name}</label><input style={INP} placeholder="—" value={subjInfo.name} onChange={e=>f("name",e.target.value)}/></div>
              <div><label style={LBL}>{t.age} *</label><input style={INP} type="number" min={18} max={99} placeholder="35" value={subjInfo.age} onChange={e=>f("age",e.target.value)}/></div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={LBL}>{t.gender} *</label>
              <div style={{display:"flex",gap:7}}>
                {[[t.gM,"Male"],[t.gF,"Female"],[t.gO,"Other"],[t.gN,"N/S"]].map(([label,val])=>(
                  <button key={val} onClick={()=>f("gender",val)} style={{flex:1,padding:"9px 4px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",border:subjInfo.gender===val?"2px solid #1a2e4a":"2px solid #e2e8f0",background:subjInfo.gender===val?"#1a2e4a":"white",color:subjInfo.gender===val?"white":"#94a3b8"}}>{label}</button>))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={LBL}>{t.edu}</label>
                <select style={INP} value={subjInfo.edu} onChange={e=>f("edu",e.target.value)}>
                  <option value="">— Select —</option>
                  {["Illiterate","Primary","Secondary","Higher Secondary","Graduate","Post-Graduate","Doctoral"].map(o=><option key={o}>{o}</option>)}
                </select></div>
              <div><label style={LBL}>{t.occ}</label><input style={INP} placeholder="Profession" value={subjInfo.occ} onChange={e=>f("occ",e.target.value)}/></div>
            </div>
          </div>
          {role==="clinician"&&(
            <div style={{background:"white",borderRadius:14,padding:16,marginBottom:14,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#1a2e4a",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Clinical Context</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={LBL}>{t.mobile}</label><input style={INP} type="tel" maxLength={10} placeholder="9876543210" value={subjInfo.mobile} onChange={e=>f("mobile",e.target.value)}/></div>
                <div><label style={LBL}>{t.diagnosis}</label><input style={INP} placeholder="—" value={subjInfo.diagnosis} onChange={e=>f("diagnosis",e.target.value)}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={LBL}>{t.examiner}</label><input style={INP} placeholder="Dr. Name" value={subjInfo.examiner} onChange={e=>f("examiner",e.target.value)}/></div>
                <div><label style={LBL}>{t.setting}</label>
                  <select style={INP} value={subjInfo.setting} onChange={e=>f("setting",e.target.value)}>
                    <option value="">— Select —</option>
                    {["Hospital OPD","Primary Health Centre","Community Outreach","Home Visit","Research","Other"].map(s=><option key={s}>{s}</option>)}
                  </select></div>
              </div>
            </div>)}
          <button onClick={()=>canProceed&&setScreen("cat")} style={{display:"block",width:"100%",padding:"15px",borderRadius:14,background:canProceed?"linear-gradient(135deg,#1e3a5f,#2d5a8e)":"#e2e8f0",color:canProceed?"white":"#9ca3af",border:"none",fontSize:14,fontWeight:700,cursor:canProceed?"pointer":"not-allowed"}}>
            Begin Assessment → {t.part1Name}
          </button>
        </div>
      </div>);}

  // ── CAT Screens ───────────────────────────────────────────────
  if(screen==="cat"){
    if(catPhase==="intro") return(
      <div style={rootStyle}>
        <div style={{background:"linear-gradient(135deg,#0d3b47,#0d5c6e)",padding:"20px",color:"white",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#9FE1CB",marginBottom:4}}>Part 1 of 2</div>
          <div style={{fontSize:18,fontWeight:800}}>{t.part1Name}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:4}}>{subjInfo.name?`${subjInfo.name}, ${subjInfo.age} years`:`Age ${subjInfo.age}`}</div>
        </div>
        <div style={cardStyle}>
          <div style={{background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <p style={{fontSize:13,color:"#134e4a",margin:"0 0 8px",lineHeight:1.7}}>{t.p1Intro}</p>
            <p style={{fontSize:12,color:"#065f46",margin:0,fontWeight:600}}>{t.p1Note}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {t.subtests.map((st,i)=>(
              <div key={st.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#0d5c6e",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{st.name}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{st.desc}</div>
                </div>
                <div style={{textAlign:"right",fontSize:11,color:"#94a3b8"}}>
                  <div>{st.items} items</div><div>{st.mins} min</div>
                </div>
              </div>))}
          </div>
          <button onClick={()=>setCatPhase("practice")} style={{width:"100%",padding:"13px",borderRadius:10,background:"#0d5c6e",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.startTest}</button>
        </div>
      </div>);

    if(catPhase==="practice") return(
      <div style={rootStyle}>
        <div style={{background:"linear-gradient(135deg,#0d3b47,#0d5c6e)",padding:"16px",color:"white",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:14,fontWeight:700}}>{t.practiceTitle}</div>
        </div>
        <div style={cardStyle}>
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"12px 14px",marginBottom:18}}>
            <p style={{fontSize:13,color:"#166534",margin:0}}>{t.practiceInstr}</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
            {PRACTICE.seq.map((fig,i)=><FigBox key={i} fig={fig} size={54}/>)}
            <div style={{width:54,height:54,border:"2px dashed #0d9488",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:"#f0fdfa"}}><span style={{fontSize:20,color:"#0d9488",fontWeight:800}}>?</span></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
            {PRACTICE.choices.map((fig,i)=>(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <FigBox fig={fig} size={54} selected={pracSel===i} onClick={()=>setPracSel(i)}/>
              <span style={{fontSize:12,fontWeight:700,color:pracSel===i?"#0d5c6e":"#94a3b8"}}>{i+1}</span>
            </div>))}
          </div>
          {pracSel!==null&&(
            <div style={{textAlign:"center",padding:"12px",borderRadius:8,background:pracSel===PRACTICE.ans?"#f0fdf4":"#fef2f2",border:`1px solid ${pracSel===PRACTICE.ans?"#86efac":"#fca5a5"}`,marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:13,color:pracSel===PRACTICE.ans?"#16a34a":"#dc2626"}}>{pracSel===PRACTICE.ans?"✅ Correct! Triangle→Square→Pentagon→Hexagon (sides increase)":"❌ Not quite. The shapes gain sides: Triangle(3)→Square(4)→Pentagon(5)→?"}</span>
            </div>)}
          <button onClick={()=>setCatPhase("SER")} style={{width:"100%",padding:"12px",borderRadius:10,background:"#0d5c6e",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.startTest}</button>
        </div>
      </div>);

    const subtestMap={SER:"CLS",CLS:"MAT",MAT:"CON",CON:"done"};
    const subtestColors={SER:"#0d9488",CLS:"#7c3aed",MAT:"#1d4ed8",CON:"#0891b2"};
    const subtestNames={SER:t.subtests[0],CLS:t.subtests[1],MAT:t.subtests[2],CON:t.subtests[3]};

    if(["SER","CLS","MAT","CON"].includes(catPhase)){
      const stInfo=subtestNames[catPhase];
      const totalSecs=Math.round(stInfo.mins*60);
      const col=subtestColors[catPhase];
      const onSubtestComplete=(ans)=>{
        setCatScores(prev=>({...prev,[catPhase]:ans}));
        const next=subtestMap[catPhase];
        if(next==="done"){setScreen("scss");}
        else{setCatPhase(next);}
      };
      return(
        <div style={rootStyle}>
          <div style={cardStyle}>
            <div style={{background:col,borderRadius:10,padding:"12px 14px",color:"white",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",opacity:0.8}}>CIBS-CAT · {stInfo.name}</div>
                  <div style={{fontSize:14,fontWeight:700}}>{stInfo.desc}</div>
                </div>
                <div style={{fontSize:10,opacity:0.8,textAlign:"right"}}>{stInfo.items} items · {stInfo.mins} min</div>
              </div>
              <Timer totalSecs={totalSecs} onTimeout={onSubtestComplete} t={t}/>
            </div>
            {catPhase==="SER"&&<SeriesSubtest onComplete={onSubtestComplete} t={t}/>}
            {catPhase==="CLS"&&<ClassifSubtest onComplete={onSubtestComplete} t={t}/>}
            {catPhase==="MAT"&&<MatrixSubtest onComplete={onSubtestComplete} t={t}/>}
            {catPhase==="CON"&&<CondSubtest onComplete={onSubtestComplete} t={t}/>}
          </div>
        </div>);}
  }

  // ── SCSS Screens ──────────────────────────────────────────────
  if(screen==="scss"){
    if(scssPhase==="intro") return(
      <div style={rootStyle}>
        <div style={{background:"linear-gradient(135deg,#1e3a5f,#374151)",padding:"20px",color:"white",textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:"#9FE1CB",marginBottom:4}}>Part 2 of 2</div>
          <div style={{fontSize:18,fontWeight:800}}>{t.part2Name}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:4}}>{t.p2Intro}</div>
        </div>
        <div style={cardStyle}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:20}}>
            {(t.p2stages||[]).map((s,i)=>{const cols=["#1e3a5f","#b45309","#6d28d9","#be185d"];return(<div key={s} style={{borderRadius:8,padding:"10px",background:"#f8fafc",border:`1px solid ${cols[i]}20`,borderLeft:`3px solid ${cols[i]}`}}><div style={{fontSize:11,fontWeight:700,color:cols[i]}}>Stage {i+1}</div><div style={{fontSize:13,color:"#374151",fontWeight:500}}>{s}</div></div>);})}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",justifyContent:"center",marginBottom:18}}>
            {SHAPES_SCSS.slice(0,5).map(sh=>(<div key={sh.code} style={{width:40,height:40,borderRadius:"50%",background:"white",boxShadow:"0 2px 10px rgba(30,58,95,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><ShapeSCSS code={sh.code} fill="#9ca3af" size={24}/></div>))}
          </div>
          <button onClick={()=>setScssPhase("s1")} style={{width:"100%",padding:"13px",borderRadius:10,background:"#1e3a5f",color:"white",border:"none",fontSize:14,fontWeight:700,cursor:"pointer"}}>Begin Stage 1 →</button>
        </div>
      </div>);

    const scssCard={background:"white",borderRadius:12,padding:"18px 16px",maxWidth:560,width:"100%",margin:"0 auto",boxShadow:"0 2px 16px rgba(0,0,0,0.08)"};

    if(scssPhase==="s1") return(<div style={{...rootStyle,paddingBottom:80}}><div style={scssCard}><SelectionStage key="s1" stageKey="s1" accentColor="#64748b" title="Stage 1 — Shapes" instr="Select the shape you like most first. Continue until all 7 are selected." items={SHAPES_SCSS} renderItem={(item,sz)=><ShapeSCSS code={item.code} fill="#9ca3af" size={sz}/>} onComplete={seq=>{setStoredFS(SHAPES_SCSS.find(s=>s.code===seq[0])||SHAPES_SCSS[0]);setShapeSeq(seq);setScssPhase("s2");}}/></div></div>);

    if(scssPhase==="s2") return(<div style={{...rootStyle,paddingBottom:80}}><div style={scssCard}>
      <div style={{textAlign:"center",marginBottom:10}}><span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}><ShapeSCSS code={storedFS?.code||1} fill="#1e3a5f" size={20}/><span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>Primary: {storedFS?.name}</span></span></div>
      <SelectionStage key="s2" stageKey="s2" accentColor="#b45309" title="Stage 2 — Colours" instr="Select the colour you like most first." items={COLORS_SCSS} renderItem={(item,sz)=><ShapeSCSS code={storedFS?.code||1} fill={item.hex} size={sz}/>} onComplete={seq=>{const fc=COLORS_SCSS.find(c=>c.code===seq[0])||COLORS_SCSS[0];setStoredFC(fc);setStoredShades(generateShades(fc.hex));setColorSeq(seq);setScssPhase("s3");}}/>
    </div></div>);

    if(scssPhase==="s3") return(<div style={{...rootStyle,paddingBottom:80}}><div style={scssCard}>
      <div style={{textAlign:"center",marginBottom:10}}><span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(30,58,95,0.07)",borderRadius:100,padding:"4px 12px"}}><ShapeSCSS code={storedFS?.code||1} fill={storedFC?.hex||"#1e3a5f"} size={20}/><span style={{fontSize:12,color:"#1e3a5f",fontWeight:600}}>{storedFS?.name} · {storedFC?.name} shades</span></span></div>
      <SelectionStage key="s3" stageKey="s3" accentColor="#6d28d9" title="Stage 3 — Shades" instr="Select the shade you like most first." items={storedShades} renderItem={(item,sz)=><ShapeSCSS code={storedFS?.code||1} fill={item.hex} size={sz}/>} onComplete={seq=>{setShadeSeq(seq);setScssPhase("s4");}}/>
    </div></div>);

    if(scssPhase==="s4") return(<div style={{...rootStyle,paddingBottom:80}}><div style={scssCard}>
      <SelectionStage key="s4" stageKey="s4" accentColor="#be185d" title="Stage 4 — Feelings" instr="Select the expression that shows how you feel most right now." items={SMILEYS_SCSS} renderItem={(item,sz)=><span style={{fontSize:Math.round(sz*0.72),lineHeight:1,userSelect:"none"}}>{item.emoji}</span>} onComplete={seq=>{setSmileySeq(seq);runReport({shapeSeq,colorSeq,shadeSeq,smileySeq:seq});}}/>
    </div></div>);}

  // ── Generating ────────────────────────────────────────────────
  if(generating) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0f1f3d,#1a3a6b)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{textAlign:"center",maxWidth:340,padding:20}}>
        <div style={{width:60,height:60,border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#60a5fa",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 24px"}}/>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <h2 style={{fontSize:20,color:"white",marginBottom:10,fontWeight:800}}>{t.generating}</h2>
        <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginTop:14}}>
          {(t.genSteps||[]).map((s,i)=>(<span key={s} style={{fontSize:10,color:i===genStep?"#60a5fa":"rgba(255,255,255,0.4)",background:i===genStep?"rgba(96,165,250,0.15)":"transparent",borderRadius:20,padding:"4px 10px",fontWeight:i===genStep?700:400,transition:"all 0.3s"}}>{s}</span>))}
        </div>
      </div>
    </div>);

  // ── Report ────────────────────────────────────────────────────
  if(screen==="report"&&catResult&&scssResult) return(
    <VISTAReport catResult={catResult} scss={scssResult} subjInfo={subjInfo} t={t} onNew={reset}/>);

  return null;
}
