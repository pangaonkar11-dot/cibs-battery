// ══════════════════════════════════════════════════════════════════════════════
//  CIBS UNIFIED UID UTILITIES v3.0
//  Include in ALL instruments (VISTA, VALID, eSMART C/P/V)
//  No dependencies — pure JS
// ══════════════════════════════════════════════════════════════════════════════

// ── ADULT UID (VISTA / VALID) ─────────────────────────────────────────────────
// Format: AV-[MOBILE6]-[DDMMYY]-[G]
// Example: AV-105228-220326-M
// Primary key for ADULT_BATTERY sheet
export function generateAdultUID(mobile = "", gender = "") {
  const m6 = (mobile || "").replace(/\D/g, "").slice(-6).padStart(6, "0");
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2, "0");
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const yy  = String(now.getFullYear()).slice(-2);
  const g   = (gender || "X")[0].toUpperCase();
  return `AV-${m6}-${dd}${mm}${yy}-${g}`;
}

// ── CHILD FileNo (eSMART C/P/V) ───────────────────────────────────────────────
// Format: CH-[CENTERCODE]-[YY]-[NNNN]
// Example: CH-CIBS-26-0047
// Primary key for CHILD_BATTERY sheet
// CenterCode: "CIBS" for Nagpur clinic, ANM/MHW get their own code from Hub
export function generateChildFileNo(centerCode = "CIBS", existingSeq = null) {
  const yy  = String(new Date().getFullYear()).slice(-2);
  const seq = existingSeq
    ? String(existingSeq).padStart(4, "0")
    : String(Math.floor(1000 + Math.random() * 8999)).padStart(4, "0");
  return `CH-${(centerCode || "CIBS").toUpperCase()}-${yy}-${seq}`;
}

// ── MOBILE HASH (used instead of raw mobile in research columns) ──────────────
// Deterministic: same mobile always produces same hash
// Not cryptographic — used only for de-duplication, not security
export function hashMobile(mobile = "") {
  const m = (mobile || "").replace(/\D/g, "").slice(-10);
  if (!m) return "";
  let h = 0;
  for (let i = 0; i < m.length; i++) {
    h = ((h << 3) ^ m.charCodeAt(i)) & 0x7FFFFFFF;
  }
  return "M" + h.toString(16).toUpperCase().padStart(8, "0");
}

// ── RETEST DETECTION ──────────────────────────────────────────────────────────
// Returns: { isRetest: bool, existingUID: string|null }
// How it works:
//   1. Generate candidate UID from mobile + today's date
//   2. Check if server has a record with same mobile hash
//   3. If yes → retest → use existing UID, increment counter
export async function detectRetest(gasUrl, mobile, gender, auth = "") {
  if (!mobile || mobile.length < 6) return { isRetest: false, existingUID: null };
  const hash = hashMobile(mobile);
  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ Source: "hub-read", sheet: "ADULT_BATTERY", auth, filterMobile: hash }),
    });
    const data = await res.json();
    if (data.status === "ok" && data.data && data.data.length > 0) {
      const latest = data.data.sort((a,b) => (b.Last_Updated||"").localeCompare(a.Last_Updated||""))[0];
      return { isRetest: true, existingUID: latest.UID, retestCount: latest.Retest_Count || 0 };
    }
  } catch {}
  return { isRetest: false, existingUID: null };
}

// ── TIMESTAMP GENERATOR ────────────────────────────────────────────────────────
export function nowISO() {
  return new Date().toISOString();
}

// ── APPS SCRIPT SUBMISSION (unified for all instruments) ─────────────────────
const DEFAULT_GAS_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec";

export async function submitToGAS(payload, gasUrl = DEFAULT_GAS_URL) {
  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(`✅ CIBS ${payload.Source} submission:`, data);
    return data;
  } catch (err) {
    console.error(`❌ CIBS ${payload.Source} submission error:`, err);
    return { status: "error", msg: err.toString() };
  }
}

// ── EXAMPLE: How VALID should call submitToGAS ─────────────────────────────────
/*
  import { generateAdultUID, submitToGAS, hashMobile } from "./CIBS_UID_Utils";

  const uid = subjInfo.vistaUID || generateAdultUID(subjInfo.mobile, subjInfo.gender);

  const payload = {
    Source: "valid-standalone",
    UID: uid,
    Mobile: hashMobile(subjInfo.mobile),         // ← hashed, not raw
    Name: subjInfo.name,
    Age: subjInfo.age,
    Gender: subjInfo.gender,
    Language: lang,
    VALID_Consent: "YES",
    VALID_Consent_DT: consentData.consentDT,     // ← from ConsentScreen
    VALID_Start_DT: consentData.consentDT,
    "VALID CQ": catRes.iq,
    "VALID CQ Band": catRes.label,
    // ... all scoring fields ...
  };

  await submitToGAS(payload);
*/

// ── EXAMPLE: How eSMART-P should call submitToGAS ─────────────────────────────
/*
  import { generateChildFileNo, submitToGAS, hashMobile } from "./CIBS_UID_Utils";

  const fileNo = childInfo.fileNo || generateChildFileNo("CIBS");

  const payload = {
    Source: "esmart-p",
    FileNo: fileNo,
    Mobile_Parent: hashMobile(informant.mobile),  // ← hashed
    ChildName: childInfo.name,
    AgeYrs: childInfo.age,
    DOB: childInfo.dob,
    Gender: childInfo.gender,
    P_Consent: "YES",
    P_Consent_DT: consentData.consentDT,
    P_Start_DT: consentData.consentDT,
    // ... all P_ scoring fields ...
  };

  await submitToGAS(payload);
*/
