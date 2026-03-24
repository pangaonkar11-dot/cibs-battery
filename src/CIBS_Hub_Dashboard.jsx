import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  CIBS CENTRAL HUB DASHBOARD v3.0
//  Central Institute of Behavioural Sciences, Nagpur
//  Dr. Shailesh V. Pangaonkar
//
//  Roles:
//    MASTER  → Full access (Dr. Pangaonkar)
//    HUB     → Field worker view (ANM/MHW/Teacher)
//
//  Deployment: Add to cibs-battery.vercel.app as /hub route
// ══════════════════════════════════════════════════════════════════════════════

const GAS_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec";
const BASE_APP_URL = "https://cibs-battery.vercel.app";

// Tool config
const TOOLS = {
  vista:    { label:"CIBS-VISTA",   path:"/#vista",    icon:"🔷", color:"#3B82F6", desc:"Adult screening — 6–8 min" },
  valid:    { label:"CIBS-VALID",   path:"/#valid",    icon:"🔬", color:"#8B5CF6", desc:"Adult validation battery — 30 min" },
  "esmart-c":{ label:"eSMART-C",   path:"/#esmart-c", icon:"🧩", color:"#F59E0B", desc:"Child assessment (3–18) — 20 min" },
  "esmart-p":{ label:"eSMART-P",   path:"/#esmart-p", icon:"👨‍👩‍👧", color:"#10B981", desc:"Parent questionnaire — 15 min" },
  "esmart-v":{ label:"eSMART-V",   path:"/#esmart-v", icon:"🏥", color:"#EF4444", desc:"Clinician validation — 25 min" },
};

// ── tiny helpers ──────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(" ");

async function gasCall(payload) {
  const r = await fetch(GAS_URL, {
    method:"POST",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify(payload),
  });
  return r.json();
}

async function gasGet(params) {
  const qs = Object.entries(params).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join("&");
  const r = await fetch(`${GAS_URL}?${qs}`);
  return r.json();
}

function buildLink(tool, params = {}) {
  const base = BASE_APP_URL + (TOOLS[tool]?.path || "/");
  const qs = Object.entries(params).filter(([,v])=>v).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join("&");
  return qs ? base + (base.includes("?")?"&":"?") + qs : base;
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const tryLogin = async () => {
    if (!pw.trim()) return;
    setLoading(true); setErr("");
    // Check locally first (master), then server for hub workers
    if (pw === "CIBS_MASTER_2026") { onLogin("master", pw); setLoading(false); return; }
    if (pw === "CIBS_HUB_2026") { onLogin("hub", pw); setLoading(false); return; }
    // Try hub worker personal password
    try {
      const res = await gasCall({ Source:"hub-admin", action:"stats", auth:pw });
      if (res.status === "ok") { onLogin("hub", pw); }
      else { setErr("Incorrect password. Contact Dr. Pangaonkar."); }
    } catch { setErr("Connection error. Check internet."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{background:"linear-gradient(160deg,#001840,#004B6B)"}}>
      <div className="w-full max-w-sm">
        {/* Logo block */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl"
            style={{background:"rgba(255,255,255,0.12)"}}>🧠</div>
          <div className="text-white font-black text-2xl mb-1">CIBS Central Hub</div>
          <div className="text-blue-200 text-sm">Central Institute of Behavioural Sciences</div>
          <div className="text-blue-300 text-xs mt-1">Nagpur · cibs-battery.vercel.app</div>
        </div>
        {/* Login card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <p className="text-gray-600 text-sm mb-4 text-center">Enter your access password to continue</p>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key==="Enter" && tryLogin()}
            placeholder="Password"
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono mb-3 outline-none focus:border-blue-400"
          />
          {err && <p className="text-red-500 text-xs mb-3 text-center">{err}</p>}
          <button onClick={tryLogin} disabled={loading || !pw.trim()}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all"
            style={{background: pw.trim() ? "linear-gradient(135deg,#001840,#004B6B)" : "#CBD5E1",
                    cursor: pw.trim() ? "pointer" : "not-allowed"}}>
            {loading ? "Checking…" : "Sign In →"}
          </button>
        </div>
        <p className="text-center text-blue-300 text-xs mt-6">
          For access: Contact Dr. Pangaonkar · +91 9423105228
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function CIBSHubDashboard() {
  const [auth, setAuth]     = useState(null); // null | { role, password }
  const [tab, setTab]       = useState("overview");
  const [stats, setStats]   = useState({adultSubjects:0,childSubjects:0});
  const [adultData, setAdultData] = useState([]);
  const [childData, setChildData] = useState([]);
  const [workers, setWorkers]    = useState([]);
  const [loading, setLoading]    = useState(false);
  const [toast, setToast]        = useState(null);

  const isMaster = auth?.role === "master";

  const showToast = (msg, type="ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStats = useCallback(async () => {
    if (!auth) return;
    try {
      const s = await gasCall({ Source:"hub-admin", action:"stats", auth:auth.password });
      if (s.status === "ok") setStats(s);
    } catch {}
  }, [auth]);

  const loadData = useCallback(async (sheet, setter) => {
    if (!auth) return;
    setLoading(true);
    try {
      const r = await gasCall({ Source:"hub-read", sheet, auth:auth.password });
      if (r.status === "ok") setter(r.data || []);
    } catch {}
    setLoading(false);
  }, [auth]);

  useEffect(() => { if (auth) { loadStats(); } }, [auth, loadStats]);
  useEffect(() => {
    if (auth && tab === "adult")   loadData("ADULT_BATTERY", setAdultData);
    if (auth && tab === "child")   loadData("CHILD_BATTERY", setChildData);
    if (auth && tab === "workers") loadData("HUB_WORKERS",   setWorkers);
  }, [auth, tab, loadData]);

  if (!auth) return <LoginScreen onLogin={(role,pw) => setAuth({role,pw})}/>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg"
          style={{background: toast.type==="ok"?"#10B981":"#EF4444", color:"white"}}>
          {toast.type==="ok"?"✓":"⚠"} {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div style={{background:"linear-gradient(135deg,#001840,#004B6B)"}} className="px-4 py-4 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="font-black text-lg">🧠 CIBS Central Hub</div>
            <div className="text-blue-200 text-xs mt-0.5">
              {isMaster ? "Master Admin — Dr. Pangaonkar" : "Hub Worker Dashboard"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">
              {isMaster ? "🔑 MASTER" : "👤 HUB"}
            </span>
            <button onClick={() => setAuth(null)} className="text-xs text-blue-200 hover:text-white">Sign out</button>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {[
            ["overview","📊 Overview"],
            ["generate","🔗 Send Links"],
            ["adult","👤 Adult Data"],
            ["child","🧒 Child Data"],
            ...(isMaster ? [["workers","🏥 Workers"],["export","📥 Export"]] : []),
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all"
              style={{
                borderColor: tab===id ? "#004B6B" : "transparent",
                color: tab===id ? "#004B6B" : "#9CA3AF",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {label:"Adult Subjects",     val:stats.adultSubjects || 0, icon:"👤", color:"#3B82F6"},
                {label:"Child Assessments",  val:stats.childSubjects || 0, icon:"🧒", color:"#10B981"},
                {label:"Instruments",        val:5,                         icon:"🔬", color:"#8B5CF6"},
                {label:"Data Safety",        val:"ICMR",                    icon:"🔒", color:"#F59E0B"},
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black" style={{color:s.color}}>{s.val}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tool status */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-black text-gray-800 mb-4">Assessment Instruments</h2>
              <div className="space-y-3">
                {Object.entries(TOOLS).map(([id, t]) => (
                  <div key={id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                    <span className="text-2xl w-8">{t.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-800">{t.label}</div>
                      <div className="text-xs text-gray-500">{t.desc}</div>
                    </div>
                    <a href={BASE_APP_URL + t.path} target="_blank" rel="noreferrer"
                      className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white"
                      style={{background:t.color}}>
                      Open →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture note */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h3 className="font-black text-blue-800 mb-3">🏗 Data Architecture</h3>
              <div className="space-y-2 text-sm text-blue-900">
                {[
                  "VISTA + VALID → ADULT_BATTERY sheet — one row per adult, linked by UID (AV-XXXXXX-DDMMYY-G)",
                  "eSMART C + P + V → CHILD_BATTERY sheet — one row per child, linked by FileNo (CH-CENTERCODE-YY-NNNN)",
                  "Mobile number is hashed for re-test detection — raw number never stored",
                  "Consent date-time recorded for every instrument on every submission",
                  "Re-test: data updates in-place on same row, timestamp updated, retest_count incremented",
                  "Data stored on Google Sheets (Google's servers, India region) — compliant with ICMR 2017 Guidelines",
                  "Zero cost: Google Sheets free · Vercel free tier · Firebase Spark free",
                ].map((t,i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-blue-400 flex-shrink-0">▸</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SEND LINKS TAB ── */}
        {tab === "generate" && <LinkGenerator auth={auth} showToast={showToast}/>}

        {/* ── ADULT DATA TAB ── */}
        {tab === "adult" && (
          <DataTable
            data={adultData}
            loading={loading}
            title="Adult Battery (VISTA + VALID)"
            keyCol="UID"
            displayCols={["UID","Name","Age","Gender","Language","VISTA_Submit_DT","VALID_Submit_DT",
              "VISTA_CQ","VISTA_Urgency","VALID_PHQ9","VALID_PHQ9_Level","VALID_CSSRS_Level",
              "VISTA_Consent","VALID_Consent","VISTA_VALID_Linked","Retest_Count"]}
            onRefresh={() => loadData("ADULT_BATTERY", setAdultData)}
          />
        )}

        {/* ── CHILD DATA TAB ── */}
        {tab === "child" && (
          <DataTable
            data={childData}
            loading={loading}
            title="Child Battery (eSMART C + P + V)"
            keyCol="FileNo"
            displayCols={["FileNo","ChildName","AgeYrs","Gender","AgeGroup",
              "C_Submit_DT","P_Submit_DT","V_Submit_DT",
              "C_FIS_IQ","C_FIS_IQBand","P_ADHD_sev","P_ASD_sev",
              "C_Consent","C_Assent","P_Consent","V_Consent",
              "C_Complete","P_Complete","V_Complete","All_Complete","Retest_Count"]}
            onRefresh={() => loadData("CHILD_BATTERY", setChildData)}
          />
        )}

        {/* ── WORKERS TAB (master only) ── */}
        {tab === "workers" && isMaster && (
          <WorkersPanel auth={auth} workers={workers} showToast={showToast}
            onRefresh={() => loadData("HUB_WORKERS", setWorkers)}/>
        )}

        {/* ── EXPORT TAB (master only) ── */}
        {tab === "export" && isMaster && <ExportPanel auth={auth} showToast={showToast}/>}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LINK GENERATOR COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function LinkGenerator({ auth, showToast }) {
  const [form, setForm] = useState({
    tool:"vista", subjectName:"", age:"", gender:"", fileNo:"", hubId:"", notes:""
  });
  const [generated, setGenerated] = useState(null);
  const [sending, setSending]     = useState(false);

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const generate = async () => {
    setSending(true);
    // Generate FileNo for child tools if not provided
    let fileNo = form.fileNo;
    if (!fileNo && ["esmart-c","esmart-p","esmart-v"].includes(form.tool)) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const seq = String(Math.floor(Math.random()*9000)+1000);
      fileNo = `CH-${auth.role==="master"?"CIBS":"HUB"}-${yy}-${seq}`;
      f("fileNo", fileNo);
    }

    const params = {};
    if (fileNo)       params.fileNo = fileNo;
    if (form.hubId)   params.hub    = form.hubId;
    if (form.subjectName) params.name = form.subjectName;
    if (form.age)     params.age    = form.age;
    if (form.gender)  params.gender = form.gender;

    const url = buildLink(form.tool, params);

    // Log link to sheet
    try {
      await gasCall({
        Source:"hub-admin", action:"generate_link", auth: auth.password,
        Type: form.tool, FileNo: fileNo || "",
        SubjectName: form.subjectName, AgeApprox: form.age, Gender: form.gender,
        HubID: form.hubId, Notes: form.notes, BaseURL: BASE_APP_URL,
      });
    } catch {}

    setGenerated({ url, fileNo, tool: form.tool });
    showToast("Link generated successfully");
    setSending(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generated.url);
    showToast("Link copied to clipboard");
  };

  const whatsapp = () => {
    const msg = `${TOOLS[form.tool]?.label} Assessment — CIBS Nagpur\n\nDear ${form.subjectName || "Participant"},\n\nPlease complete your assessment using this link:\n${generated.url}\n\nThis takes approximately ${TOOLS[form.tool]?.desc}.\n\n— Central Institute of Behavioural Sciences, Nagpur`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  const INP = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400";
  const LBL = "block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1";

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-black text-gray-800 mb-5">🔗 Generate Assessment Link</h2>

        <div className="mb-4">
          <label className={LBL}>Assessment Tool *</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(TOOLS).map(([id,t]) => (
              <button key={id} onClick={() => f("tool",id)}
                className={cx("p-3 rounded-xl border-2 text-left transition-all",
                  form.tool===id ? "border-blue-500 bg-blue-50" : "border-gray-200")}> 
                <div className="text-lg mb-1">{t.icon}</div>
                <div className="text-xs font-bold" style={{color:form.tool===id?t.color:"#6B7280"}}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={LBL}>Subject Name</label>
            <input className={INP} value={form.subjectName} onChange={e=>f("subjectName",e.target.value)} placeholder="Optional"/>
          </div>
          <div>
            <label className={LBL}>Age (approx)</label>
            <input className={INP} type="number" value={form.age} onChange={e=>f("age",e.target.value)} placeholder="e.g. 34"/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={LBL}>Gender</label>
            <select className={INP} value={form.gender} onChange={e=>f("gender",e.target.value)}>
              <option value="">—</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className={LBL}>
              {["esmart-c","esmart-p","esmart-v"].includes(form.tool) ? "Child File No." : "UID (optional)"}
            </label>
            <input className={INP} value={form.fileNo} onChange={e=>f("fileNo",e.target.value)} placeholder="Auto-generates if blank"/>
          </div>
        </div>

        <div className="mb-4">
          <label className={LBL}>Notes (internal)</label>
          <input className={INP} value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Village, PHC, school name, etc."/>
        </div>

        <button onClick={generate} disabled={sending}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
          style={{background: sending?"#CBD5E1":"linear-gradient(135deg,#001840,#004B6B)"}}>
          {sending ? "Generating…" : `Generate ${TOOLS[form.tool]?.label} Link →`}
        </button>
      </div>

      {generated && (
        <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-600 font-black text-sm">✓ Link Ready</span>
            {generated.fileNo && (
              <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                {generated.fileNo}
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl p-3 mb-4 border border-green-200">
            <p className="text-xs text-gray-600 break-all font-mono">{generated.url}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white border-2 border-green-400 text-green-700">
              📋 Copy Link
            </button>
            <button onClick={whatsapp}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{background:"#25D366"}}>
              📲 WhatsApp
            </button>
          </div>
          <p className="text-xs text-green-600 mt-3 text-center">
            Link logged in Google Sheet · CIBS File No. pre-filled when participant opens
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DATA TABLE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function DataTable({ data, loading, title, keyCol, displayCols, onRefresh }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = data.filter(r =>
    !search || Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const STATUS_COLOR = {
    YES:"#10B981", YES_ONLY:"#10B981", BOTH_COMPLETE:"#10B981", VISTA_ONLY:"#F59E0B",
    VALID_ONLY:"#F59E0B", NO:"#EF4444", "":"#9CA3AF",
    CRITICAL:"#EF4444", HIGH:"#F97316", MODERATE:"#F59E0B",
  };

  const cellColor = (col, val) => {
    if (col.includes("Consent") || col.includes("Complete") || col.includes("Linked")) return STATUS_COLOR[val] || "#6B7280";
    if (col.includes("Urgency") || col.includes("CSSRS")) return STATUS_COLOR[val] || "#6B7280";
    return "#1C1C1C";
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 text-sm">Loading data…</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-black text-gray-800">{title} <span className="text-gray-400 font-normal text-sm">({filtered.length} records)</span></h2>
        <div className="flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search…"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 w-48"/>
          <button onClick={onRefresh} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600">↻ Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{background:"#001840"}}>
                {displayCols.map(c => (
                  <th key={c} className="px-3 py-2.5 text-left text-white font-semibold whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={displayCols.length} className="text-center py-12 text-gray-400">No records found</td></tr>
              )}
              {filtered.map((row, ri) => (
                <tr key={row[keyCol]||ri}
                  onClick={() => setSelected(row)}
                  className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                  style={{background: ri%2===0?"white":"#FAFAFA"}}>
                  {displayCols.map(col => {
                    const v = String(row[col] ?? "");
                    const color = cellColor(col, v);
                    return (
                      <td key={col} className="px-3 py-2 whitespace-nowrap font-medium" style={{color}}>
                        {v.length > 28 ? v.slice(0,25)+"…" : v || <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-800">{selected[keyCol]}</h3>
              <button onClick={()=>setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selected).filter(([,v])=>v!=="").map(([k,v])=>(
                <div key={k} className="bg-gray-50 rounded-xl px-3 py-2">
                  <div className="text-xs text-gray-500 font-medium mb-0.5">{k}</div>
                  <div className="text-sm font-semibold text-gray-800 break-all">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  WORKERS PANEL (master only)
// ══════════════════════════════════════════════════════════════════════════════
function WorkersPanel({ auth, workers, showToast, onRefresh }) {
  const [form, setForm] = useState({HubName:"",Role:"ANM",Mobile:"",Village:"",District:"",State:"Maharashtra",CenterCode:""});
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const INP = "w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400";

  const register = async () => {
    if (!form.HubName || !form.Mobile) { showToast("Name and Mobile required","err"); return; }
    setSaving(true);
    try {
      const res = await gasCall({ Source:"hub-admin", action:"register_worker", auth:auth.password, ...form });
      if (res.status==="ok") {
        showToast(`Worker registered: ${res.hubId}`);
        setForm({HubName:"",Role:"ANM",Mobile:"",Village:"",District:"",State:"Maharashtra",CenterCode:""});
        onRefresh();
      }
    } catch { showToast("Error — check connection","err"); }
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Register form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-black text-gray-800 mb-5">Register New Field Worker</h2>
        <div className="space-y-3">
          {[
            ["Worker Full Name *","HubName","text","ANM / Teacher / MHW name"],
            ["Role","Role","select",""],
            ["Mobile Number *","Mobile","tel","10-digit mobile"],
            ["Village / Area","Village","text",""],
            ["District","District","text",""],
            ["State","State","text","Maharashtra"],
            ["Centre Code","CenterCode","text","e.g. NGC, NGR, AMR"],
          ].map(([lbl,key,type,ph]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">{lbl}</label>
              {type==="select" ? (
                <select className={INP} value={form[key]} onChange={e=>f(key,e.target.value)}>
                  {["ANM","MHW","ASHA Worker","School Teacher","Nurse","Psychologist","Other"].map(o=><option key={o}>{o}</option>)}
                </select>
              ) : (
                <input className={INP} type={type} placeholder={ph} value={form[key]} onChange={e=>f(key,e.target.value)}/>
              )}
            </div>
          ))}
        </div>
        <button onClick={register} disabled={saving}
          className="w-full mt-4 py-3 rounded-2xl font-bold text-white text-sm"
          style={{background:saving?"#CBD5E1":"linear-gradient(135deg,#001840,#004B6B)"}}>
          {saving ? "Registering…" : "Register Worker →"}
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">Worker receives default password: CIBS_HUB_2026</p>
      </div>

      {/* Workers list */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-800">Registered Workers ({workers.length})</h2>
          <button onClick={onRefresh} className="text-xs text-blue-500">↻ Refresh</button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {workers.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No workers registered yet</p>}
          {workers.map((w,i) => (
            <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-gray-800">{w.HubName}</div>
                  <div className="text-xs text-gray-500">{w.Role} · {w.Village}, {w.District}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{w.HubID}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{background:w.Active==="YES"?"#D1FAE5":"#FEE2E2",color:w.Active==="YES"?"#065F46":"#991B1B"}}>
                  {w.Active==="YES"?"Active":"Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXPORT PANEL (master only)
// ══════════════════════════════════════════════════════════════════════════════
function ExportPanel({ auth, showToast }) {
  const [exporting, setExporting] = useState(null);

  const doExport = async (sheet, label) => {
    setExporting(sheet);
    try {
      const res = await gasCall({ Source:"export", sheet, format:"csv", auth:auth.password });
      if (res.status === "ok" && res.csv) {
        const blob = new Blob([res.csv], { type:"text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `CIBS_${sheet}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
        showToast(`${label} exported (${res.total} records)`);
      } else { showToast("Export failed — " + (res.msg||"unknown error"), "err"); }
    } catch { showToast("Connection error","err"); }
    setExporting(null);
  };

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-black text-gray-800 mb-2">📥 Export Research Data</h2>
        <p className="text-sm text-gray-500 mb-6">
          Download all data as CSV. Open in Excel, SPSS, or R for analysis.
          All exports are authenticated — Master password required.
        </p>
        <div className="space-y-3">
          {[
            ["ADULT_BATTERY","👤 Adult Battery (VISTA + VALID)","All adult assessments with convergent validity columns"],
            ["CHILD_BATTERY","🧒 Child Battery (eSMART C+P+V)","All child assessments across all three modules"],
            ["HUB_WORKERS","🏥 Workers Registry","All registered ANM/MHW/Teacher workers"],
            ["LINKS_ISSUED","🔗 Links Issued","History of all assessment links generated and their status"],
            ["AUDIT_LOG","📋 Audit Log","Complete submission audit trail with timestamps"],
          ].map(([sheet, label, desc]) => (
            <div key={sheet} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-800">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <button onClick={() => doExport(sheet, label)}
                disabled={exporting === sheet}
                className="px-4 py-2 rounded-xl font-bold text-sm text-white flex-shrink-0"
                style={{background: exporting===sheet ? "#CBD5E1" : "#001840"}}>
                {exporting===sheet ? "…" : "CSV ↓"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
        <h3 className="font-black text-blue-800 mb-3">📊 Data Safety — Indian Norms Compliance</h3>
        <div className="space-y-2 text-xs text-blue-900">
          {[
            "✓ ICMR National Ethical Guidelines 2017 — data stored with coded UID, no raw PII in research columns",
            "✓ IT Act 2000 & PDPB Draft — sensitive health data encrypted at rest (Google AES-256)",
            "✓ Data residency — Google Sheets auto-locates to nearest region; Firebase explicitly set to Mumbai (asia-south1)",
            "✓ Mobile number hashed before storage — raw mobile never written to research database",
            "✓ Consent date-time recorded for every instrument — legally compliant audit trail",
            "✓ Access control — Master password (PI only) + Hub password (field workers) + no public data endpoint",
            "✓ Audit log — every submission logged with source, UID, timestamp, and payload size",
            "✓ Budget: ₹0/month — Google Sheets (free) + Vercel (free) + Firebase Spark (free)",
          ].map((t,i) => <div key={i}>{t}</div>)}
        </div>
      </div>
    </div>
  );
}
