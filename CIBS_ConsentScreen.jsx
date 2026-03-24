// ══════════════════════════════════════════════════════════════════════════════
//  CIBS UNIFIED CONSENT SCREEN COMPONENT v3.0
//  Drop this into VISTA, VALID, eSMART-C, eSMART-P, eSMART-V
//  Captures: consent tick, timestamp, assent (for child tools)
//  Usage: <ConsentScreen tool="vista" lang="en" onConsent={(data)=>...} />
// ══════════════════════════════════════════════════════════════════════════════
import { useState } from "react";

const CONSENT_TEXT = {
  en: {
    vista: {
      title: "Before We Begin — CIBS-VISTA",
      intro: "CIBS-VISTA is a visual screening tool developed at CIBS Nagpur. It is NOT a clinical diagnosis.",
      points: [
        "You will point to shapes, colours, shades, and faces on screen. No reading or writing is required.",
        "The assessment takes 6–8 minutes and is completely voluntary.",
        "Your data is stored securely using a coded ID — your name is not linked to research records.",
        "You may stop at any time without any consequence.",
        "Your results will be shared with you as a personal report at the end.",
      ],
      ctri: "CTRI Registration: [CTRI/2026/XXXXX — pending]",
      tick: "I have understood the above and agree to participate.",
      btn: "I Agree — Begin Assessment →",
    },
    valid: {
      title: "Before We Begin — CIBS-VALID",
      intro: "CIBS-VALID is a gold-standard validation battery used for research. It is NOT a clinical diagnosis.",
      points: [
        "You will answer 9 standardised questionnaires about cognition, personality, health, and mood.",
        "The assessment takes approximately 30 minutes. All sections are voluntary.",
        "Sensitive questions (about mood, suicidal thoughts) are included for research purposes. You may skip any question.",
        "Your data is stored securely with a coded UID — no raw personal data in the research database.",
        "If any response indicates elevated risk, a qualified clinician will speak with you before you leave.",
        "PHQ-9 & GAD-7: Pfizer public domain. WHO-5: WHO CC BY-NC-SA. BFI-10: open access. All others: public domain or free for research.",
      ],
      ctri: "CTRI Registration: [CTRI/2026/XXXXX — pending]",
      tick: "I have read and understood the above. I consent to participate in this research study.",
      btn: "I Consent — Begin Assessment →",
    },
    "esmart-c": {
      title: "Before We Begin — eSMART-C (Examiner / Clinician)",
      intro: "eSMART-C assesses cognitive ability (CIBS-FIS) and personality (SCSS) in children aged 3–18 years.",
      points: [
        "This is a screening tool only — it does not constitute a clinical diagnosis.",
        "The child will respond by pointing to patterns and pictures. No reading or writing is required.",
        "Total time: approximately 20–25 minutes.",
        "Data is stored with a unique FileNo linking to eSMART-P and eSMART-V records.",
        "The child's assent will be recorded separately. Assessment is not conducted without child's willing participation.",
      ],
      ctri: "CTRI Registration: [CTRI/2026/XXXXX — pending]",
      tick: "I (examiner / clinician) confirm that ethical clearance is in place and I consent to administer this assessment.",
      assentTick: "The child has verbally or behaviourally indicated willingness to participate (assent granted).",
      btn: "Confirm Consent & Begin →",
      hasAssent: true,
    },
    "esmart-p": {
      title: "Before We Begin — eSMART-P (Parent / Caregiver)",
      intro: "eSMART-P is a parent-report questionnaire about your child's development and behaviour.",
      points: [
        "This questionnaire is for RESEARCH and SCREENING purposes only. It is not a diagnosis.",
        "Please answer based on your observations of the child over the past 6 months.",
        "All responses are completely confidential. The FileNo links your answers to the child's assessment record.",
        "You may skip any question you find uncomfortable.",
        "You may withdraw from this study at any time without consequence.",
      ],
      ctri: "CTRI Registration: [CTRI/2026/XXXXX — pending]",
      tick: "I am the parent or legal guardian of this child. I have understood the above and give my consent to participate.",
      btn: "I Consent — Begin Questionnaire →",
    },
    "esmart-v": {
      title: "Before We Begin — eSMART-V (Clinician)",
      intro: "eSMART-V is the clinician validation module — for use by trained mental health professionals only.",
      points: [
        "This module records gold-standard cognitive scores, DSM-5/ICD-11 diagnoses, and C-SSRS risk ratings.",
        "Data is linked to eSMART-C and eSMART-P records via the shared FileNo.",
        "All findings are clinical records and are subject to standard clinical confidentiality requirements.",
        "C-SSRS ratings require a structured clinical interview before scoring.",
      ],
      ctri: "",
      tick: "I am a qualified clinician. I confirm I have conducted the appropriate clinical assessments before completing this form.",
      btn: "Confirm & Begin →",
    },
  },
};

// Hindi + Marathi versions (abbreviated — full versions in translation document)
const CONSENT_HINDI = {
  vista: { title:"शुरू करने से पहले — CIBS-VISTA", tick:"मैंने उपरोक्त पढ़ और समझ लिया है। मैं भाग लेने के लिए सहमत हूँ।", btn:"मैं सहमत हूँ — मूल्यांकन शुरू करें →" },
  valid: { title:"शुरू करने से पहले — CIBS-VALID", tick:"मैं इस शोध अध्ययन में भाग लेने के लिए सहमति देता/देती हूँ।", btn:"मैं सहमत हूँ — शुरू करें →" },
  "esmart-p": { title:"शुरू करने से पहले — eSMART-P", tick:"मैं इस बच्चे का माता-पिता/अभिभावक हूँ। मैं सहमत हूँ।", btn:"मैं सहमत हूँ →" },
};

const CONSENT_MARATHI = {
  vista: { title:"सुरू करण्यापूर्वी — CIBS-VISTA", tick:"मी वरील वाचले आणि समजले आहे. मी सहभागी होण्यास सहमत आहे.", btn:"मी सहमत आहे — सुरू करा →" },
  valid: { title:"सुरू करण्यापूर्वी — CIBS-VALID", tick:"मी या संशोधन अभ्यासात सहभागी होण्यास संमती देतो/देते.", btn:"मी सहमत आहे →" },
  "esmart-p": { title:"सुरू करण्यापूर्वी — eSMART-P", tick:"मी या मुलाचे पालक/पाठीराखे आहे. मी सहमत आहे.", btn:"मी सहमत आहे →" },
};

export function ConsentScreen({ tool="vista", lang="en", onConsent }) {
  const [ticked, setTicked]       = useState(false);
  const [assentTicked, setAssent] = useState(false);

  const enText = CONSENT_TEXT.en[tool] || CONSENT_TEXT.en.vista;
  const hiOver = CONSENT_HINDI[tool] || {};
  const mrOver = CONSENT_MARATHI[tool] || {};

  const overlay = lang === "hi" ? hiOver : lang === "mr" ? mrOver : {};
  const title   = overlay.title || enText.title;
  const tickTxt = overlay.tick  || enText.tick;
  const btnTxt  = overlay.btn   || enText.btn;

  const canProceed = ticked && (!enText.hasAssent || assentTicked);

  const handleConsent = () => {
    if (!canProceed) return;
    const now = new Date().toISOString();
    onConsent({
      consent: "YES",
      consentDT: now,
      assent: enText.hasAssent ? (assentTicked ? "YES" : "NO") : "N/A",
      assentDT: enText.hasAssent && assentTicked ? now : "",
    });
  };

  const toolColors = {
    vista:"#3B82F6", valid:"#8B5CF6",
    "esmart-c":"#F59E0B", "esmart-p":"#10B981", "esmart-v":"#EF4444",
  };
  const color = toolColors[tool] || "#3B82F6";

  return (
    <div className="min-h-screen flex flex-col"
      style={{background:`linear-gradient(160deg,${color}15,white)`}}>

      {/* Top bar */}
      <div className="px-4 py-4" style={{background:color}}>
        <div className="max-w-lg mx-auto">
          <p className="text-white font-black text-base">{title}</p>
          <p className="text-white text-opacity-80 text-xs mt-0.5">Central Institute of Behavioural Sciences, Nagpur</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 gap-4">

        {/* Intro */}
        <div className="rounded-2xl p-4" style={{background:color+"15",border:`1.5px solid ${color}33`}}>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed">{enText.intro}</p>
        </div>

        {/* Points */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          {enText.points.map((pt, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                style={{background:color}}>{i+1}</span>
              <p className="text-sm text-gray-700 leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>

        {/* CTRI note */}
        {enText.ctri && (
          <p className="text-xs text-gray-400 italic text-center">{enText.ctri}</p>
        )}

        {/* Consent tick */}
        <label className="flex items-start gap-3 bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all"
          style={{borderColor: ticked ? color : "#E5E7EB"}}>
          <input type="checkbox" checked={ticked} onChange={e => setTicked(e.target.checked)}
            className="mt-0.5 w-5 h-5 accent-blue-600 flex-shrink-0"/>
          <span className="text-sm text-gray-800 font-medium leading-relaxed">{tickTxt}</span>
        </label>

        {/* Assent tick (child tools only) */}
        {enText.hasAssent && (
          <label className="flex items-start gap-3 bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all"
            style={{borderColor: assentTicked ? "#F59E0B" : "#E5E7EB"}}>
            <input type="checkbox" checked={assentTicked} onChange={e => setAssent(e.target.checked)}
              className="mt-0.5 w-5 h-5 flex-shrink-0"/>
            <span className="text-sm text-gray-800 font-medium leading-relaxed">{enText.assentTick}</span>
          </label>
        )}

        {/* Proceed button */}
        <button onClick={handleConsent} disabled={!canProceed}
          className="w-full py-4 rounded-2xl font-black text-white text-base transition-all"
          style={{
            background: canProceed ? `linear-gradient(135deg,${color},${color}cc)` : "#CBD5E1",
            cursor: canProceed ? "pointer" : "not-allowed",
            boxShadow: canProceed ? `0 8px 24px ${color}44` : "none",
          }}>
          {btnTxt}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          By proceeding, consent is recorded with date and time stamp · CIBS/IRB/2025–26
        </p>
      </div>
    </div>
  );
}

// ── Submission helper — add to each instrument's submitToSheet function ──────
export function buildConsentPayload(consentData, tool) {
  const toolKey = tool.toUpperCase().replace(/-/g,"_");
  return {
    [`${toolKey}_Consent`]:    consentData.consent,
    [`${toolKey}_Consent_DT`]: consentData.consentDT,
    [`${toolKey}_Assent`]:     consentData.assent,
    [`${toolKey}_Assent_DT`]:  consentData.assentDT,
    [`${toolKey}_Start_DT`]:   consentData.consentDT, // start = consent time
  };
}
