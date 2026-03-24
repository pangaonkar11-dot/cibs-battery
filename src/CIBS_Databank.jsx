import { useState, useRef } from "react";

// ════════════════════════════════════════════════════════════════════════════
//  CIBS DATABANK  |  Unified Research Data Integration Engine
//  Central Institute of Behavioural Sciences, Nagpur
//  Dr. Shailesh Pangaonkar — Director & Consultant Psychiatrist
//  MBBS, DPM, DNB, MSc BA
//
//  Merges eSMART-P + eSMART-C + eSMART-V into ONE row per child by FileNo
//  Exports: CSV (Excel-compatible) · Full Databank · Filtered subsets
// ════════════════════════════════════════════════════════════════════════════

// ── COLUMN DEFINITIONS ────────────────────────────────────────────────────
const IDENTITY_COLS = ["FileNo","ChildName","DOB","AgeYrs","Gender","School","Grade","Examiner","AssessmentDate"];

const P_PERINATAL = Array.from({length:14},(_,i)=>`P_P${i+1}`);
const P_BX_ITEMS  = ["P_CI2","P_CI3","P_SI6","P_SI7","P_ADD27","P_ADD29","P_ASD14","P_SLD34","P_MDD44","P_ANX49","P_PI10","P_PI11","P_ASD18","P_ADD31","P_SLD37","P_MDD46","P_ANX60","P_PI12","P_ASD21","P_ADD33","P_ASD25","P_SLD41","P_ANX62","P_ODD51","P_CD53","P_CD55"];
const P_DOMAINS   = ["IDD","ADHD","ASD","SLD","MDD","ANX","ODD","CD"];
const P_DOM_COLS  = P_DOMAINS.flatMap(d=>[`P_${d}_score`,`P_${d}_sev`]);
const P_RISK_COLS = ["P_AgeGroup","P_PeriRiskLevel","P_PeriRiskCount","P_RiskTag","P_SuicideFlag","P_SM1","P_SM2","P_SM3","P_SM4","P_SM5","P_SM6"];

const C_FIS_COLS  = ["C_FIS_Scale","C_FIS_RawTotal","C_FIS_MA","C_FIS_IQ","C_FIS_IQBand","C_FIS_Pct","C_FIS_SER","C_FIS_CLS","C_FIS_MAT","C_FIS_CON"];
const C_SCSS_COLS = ["C_ShapeCode","C_ColorCode","C_ShadeCode","C_SmileyCode","C_CQ","C_IQBand_SCSS","C_EQSS","C_EQBand","C_ESI","C_SelfAware","C_EmoReg","C_EmoRes","C_MHI","C_AnxIdx","C_AnxLevel","C_DepIdx","C_DepLevel","C_SFI","C_WBI","C_DSMCluster","C_DSMFeatures","C_SIR","C_SUR","C_CDR","C_CRI"];

const V_COG_COLS  = ["V_MISIC_FSIQ","V_MISIC_VIQ","V_MISIC_PIQ","V_WISC_FSIQ","V_WISC_VCI","V_WISC_PRI","V_SB5_FSIQ","V_RAVENS_Raw","V_RAVENS_Pct","V_CFIT_IQ","V_VABS_ABC","V_CARS_Total","V_SNAP_Total","V_CDI_Total","V_SCARED_Total","V_SDQ_Total"];
const V_DX_COLS   = P_DOMAINS.flatMap(d=>[`V_${d}_Dx`,`V_${d}_Code`,`V_${d}_ClinicianSev`]);
const V_RISK_COLS = ["V_SIR","V_SUR","V_CDR","V_Prognosis","V_NextReview"];

const ALL_COLS = [...IDENTITY_COLS,...P_PERINATAL,...P_BX_ITEMS,...P_DOM_COLS,...P_RISK_COLS,...C_FIS_COLS,...C_SCSS_COLS,...V_COG_COLS,...V_DX_COLS,...V_RISK_COLS,"V_Impression","V_Treatment"];

// ── SAMPLE RECORDS ─────────────────────────────────────────────────────────
const SAMPLE_RECORDS = [
  {
    FileNo:"C-4700",ChildName:"Rahul Sharma",DOB:"2015-03-15",AgeYrs:"10",Gender:"Male",School:"Nagpur Public School",Grade:"Class 5",Examiner:"Dr. Pangaonkar",AssessmentDate:"2026-03-17",
    P_P1:"no",P_P2:"no",P_P3:"yes",P_P4:"no",P_P5:"no",P_P6:"yes",P_P7:"no",P_P8:"no",P_P9:"no",P_P10:"no",P_P11:"no",P_P12:"no",P_P13:"no",P_P14:"no",
    P_CI2:1,P_CI3:1,P_SI6:2,P_SI7:1,P_ADD27:3,P_ADD29:3,P_ASD14:0,P_SLD34:1,P_MDD44:0,P_ANX49:1,P_PI10:0,P_PI11:1,P_ASD18:0,P_ADD31:3,P_SLD37:2,P_MDD46:0,P_ANX60:0,P_PI12:0,P_ASD21:0,P_ADD33:3,P_ASD25:0,P_SLD41:1,P_ANX62:1,P_ODD51:2,P_CD53:0,P_CD55:0,
    P_IDD_score:6,P_IDD_sev:"Normal",P_ADHD_score:12,P_ADHD_sev:"Moderate",P_ASD_score:0,P_ASD_sev:"Normal",P_SLD_score:4,P_SLD_sev:"Moderate",P_MDD_score:0,P_MDD_sev:"Normal",P_ANX_score:2,P_ANX_sev:"Normal",P_ODD_score:2,P_ODD_sev:"Normal",P_CD_score:0,P_CD_sev:"Normal",
    P_AgeGroup:"Primary (6-10)",P_PeriRiskLevel:"Low",P_PeriRiskCount:2,P_RiskTag:"LEVEL 2",P_SuicideFlag:"Clear",P_SM1:"NO",P_SM2:"NO",P_SM3:"NO",P_SM4:"NO",P_SM5:"NO",P_SM6:"YES",
    C_FIS_Scale:2,C_FIS_RawTotal:33,C_FIS_MA:"10.9",C_FIS_IQ:108,C_FIS_IQBand:"High Average",C_FIS_Pct:68,C_FIS_SER:9,C_FIS_CLS:11,C_FIS_MAT:8,C_FIS_CON:5,
    C_ShapeCode:"3421567",C_ColorCode:"4153627",C_ShadeCode:"2341567",C_SmileyCode:"2134567",C_CQ:104,C_IQBand_SCSS:"High Average",C_EQSS:96,C_EQBand:"Above Average",C_ESI:78,C_SelfAware:82,C_EmoReg:75,C_EmoRes:77,C_MHI:78,C_AnxIdx:22,C_AnxLevel:"Mild",C_DepIdx:10,C_DepLevel:"Minimal",C_SFI:74,C_WBI:75,C_DSMCluster:"No Significant Cluster Alignment",C_DSMFeatures:"Adaptive personality organisation",C_SIR:"Not Indicated",C_SUR:"Not Indicated",C_CDR:"Low",C_CRI:"Minimal",
    V_MISIC_FSIQ:106,V_WISC_FSIQ:"",V_SB5_FSIQ:"",V_RAVENS_Raw:"",V_CFIT_IQ:"",V_VABS_ABC:"",V_CARS_Total:"",V_SNAP_Total:28,V_CDI_Total:"",V_SCARED_Total:"",V_SDQ_Total:18,
    V_ADHD_Dx:"YES",V_ADHD_Code:"6A05",V_ADHD_ClinicianSev:"Moderate",V_SLD_Dx:"YES",V_SLD_Code:"6A03",V_SLD_ClinicianSev:"Mild",V_IDD_Dx:"NO",V_ASD_Dx:"NO",V_MDD_Dx:"NO",V_ANX_Dx:"NO",V_ODD_Dx:"NO",V_CD_Dx:"NO",
    V_SIR:"Not Present",V_SUR:"Not Present",V_CDR:"Present — Monitor",V_Prognosis:"Good",V_NextReview:"2026-06-17",
    V_Impression:"10-year-old male presenting with ADHD (Moderate, Combined presentation) and SLD (Reading). CIBS-FIS IQ 108 consistent with MISIC FSIQ 106. SCSS profile shows adaptive personality with above-average EQ.",
    V_Treatment:"Methylphenidate assessment · Remedial education referral · Parent psychoeducation · School teacher liaison",
  },
];

// ── UTILITIES ─────────────────────────────────────────────────────────────
function getVal(rec, col) {
  const v = rec[col];
  return v===undefined||v===null||v==="" ? "" : String(v);
}

function escapeCsvVal(v) {
  const s = String(v ?? "");
  return s.includes(",")||s.includes('"')||s.includes("\n") ? `"${s.replace(/"/g,'""')}"` : s;
}

function buildCSV(records, cols) {
  const header = cols.join(",");
  const rows = records.map(r=>cols.map(c=>escapeCsvVal(getVal(r,c))).join(","));
  return [header,...rows].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function mergeRecords(existing, incoming, keyCol="FileNo") {
  const map = {};
  existing.forEach(r=>{ map[r[keyCol]] = {...r}; });
  incoming.forEach(r=>{ map[r[keyCol]] = {...(map[r[keyCol]]||{}), ...r}; });
  return Object.values(map);
}

function parseCsvToRecords(text) {
  const lines = text.trim().split("\n");
  if(lines.length<2) return [];
  const headers = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  return lines.slice(1).map(line=>{
    const vals = line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
    const rec = {};
    headers.forEach((h,i)=>{ rec[h]=vals[i]||""; });
    return rec;
  });
}

// ── DOMAIN CONFIG ──────────────────────────────────────────────────────────
const DOM_CFG = {
  IDD: {color:"#7c3aed",max:28}, ADHD:{color:"#2563eb",max:16}, ASD:{color:"#0891b2",max:16},
  SLD: {color:"#0d9488",max:12}, MDD:{color:"#dc2626",max:8},   ANX:{color:"#ea580c",max:12},
  ODD: {color:"#b45309",max:4},  CD:{color:"#9f1239",max:8},
};
const SEV_COL_MAP = {Normal:"#16a34a",Mild:"#65a30d",Moderate:"#d97706",Severe:"#dc2626"};

// ── COLUMN GROUP LABELS ────────────────────────────────────────────────────
const COL_GROUPS = [
  {label:"Identity",cols:IDENTITY_COLS,color:"#0d5c6e"},
  {label:"eSMART-P Perinatal",cols:P_PERINATAL,color:"#7c3aed"},
  {label:"eSMART-P Behaviour Items",cols:P_BX_ITEMS,color:"#0891b2"},
  {label:"eSMART-P Domain Scores",cols:P_DOM_COLS,color:"#dc2626"},
  {label:"eSMART-P Risk",cols:P_RISK_COLS,color:"#b45309"},
  {label:"eSMART-C FIS (Cognitive)",cols:C_FIS_COLS,color:"#0d9488"},
  {label:"eSMART-C SCSS (Personality)",cols:C_SCSS_COLS,color:"#be185d"},
  {label:"eSMART-V Cognitive Tests",cols:V_COG_COLS,color:"#1e3a5f"},
  {label:"eSMART-V Diagnosis & Severity",cols:V_DX_COLS,color:"#1e5f2e"},
  {label:"eSMART-V Risk & Impression",cols:[...V_RISK_COLS,"V_Impression","V_Treatment"],color:"#7c1d1d"},
];

// ── STATS HELPER ───────────────────────────────────────────────────────────
function computeStats(records) {
  const N = records.length;
  if(N===0) return null;
  const iqVals = records.map(r=>parseFloat(r.C_FIS_IQ)).filter(n=>!isNaN(n));
  const iqMean = iqVals.length>0 ? (iqVals.reduce((a,b)=>a+b,0)/iqVals.length).toFixed(1) : "—";
  const domStats = P_DOMAINS.map(d=>{
    const vals=records.map(r=>parseFloat(r[`P_${d}_score`])).filter(n=>!isNaN(n));
    const mean=vals.length>0?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):"—";
    const flags=records.filter(r=>r[`P_${d}_sev`]&&r[`P_${d}_sev`]!=="Normal").length;
    return {d,mean,flags,pct:vals.length>0?Math.round(flags/vals.length*100):0};
  });
  const sflag=records.filter(r=>r.P_SuicideFlag==="FLAGGED").length;
  return {N,iqMean,iqVals,domStats,sflag};
}

// ════════════════════════════════════════════════════════════════════════════
//  MANUAL ENTRY FORM
// ════════════════════════════════════════════════════════════════════════════
function ManualEntryForm({onSave}) {
  const [data,setData]=useState({FileNo:"",ChildName:"",AgeYrs:"",Gender:"",School:"",Examiner:"",AssessmentDate:new Date().toISOString().slice(0,10)});
  const upd=(k,v)=>setData(x=>({...x,[k]:v}));
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:16}}>
      <p style={{fontSize:11,fontWeight:700,color:"#0d5c6e",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Quick Manual Entry (Identity fields)</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {[["CIBS File No. (UID) *","FileNo","text"],["Child's Full Name","ChildName","text"],["Age (years)","AgeYrs","number"],["Gender","Gender","select"],["School","School","text"],["Examiner","Examiner","text"],["Assessment Date","AssessmentDate","date"]].map(([lbl,key,type])=>(
          <div key={key}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"#475569",marginBottom:3}}>{lbl}</label>
            {type==="select"
              ? <select value={data[key]} onChange={e=>upd(key,e.target.value)} style={{width:"100%",padding:"7px 10px",border:"1.5px solid #e2e8f0",borderRadius:7,fontSize:12,background:"#fff",outline:"none"}}>
                  <option value="">—</option>
                  {["Male","Female","Other"].map(o=><option key={o}>{o}</option>)}
                </select>
              : <input type={type} value={data[key]} onChange={e=>upd(key,e.target.value)}
                  style={{width:"100%",padding:"7px 10px",border:"1.5px solid #e2e8f0",borderRadius:7,fontSize:12,color:"#1e293b",outline:"none",boxSizing:"border-box"}}/>
            }
          </div>
        ))}
      </div>
      <button onClick={()=>{if(data.FileNo){onSave(data);}}} style={{padding:"9px 20px",borderRadius:8,background:"#0d5c6e",color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add Record →</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [records, setRecords] = useState(SAMPLE_RECORDS);
  const [view, setView]       = useState("table");   // "table" | "stats" | "schema" | "import"
  const [filterText, setFilterText] = useState("");
  const [selectedCols, setSelectedCols] = useState(["FileNo","ChildName","AgeYrs","Gender","P_ADHD_score","P_ADHD_sev","P_ASD_score","C_FIS_IQ","C_FIS_IQBand","C_CRI"]);
  const [showColPicker, setShowColPicker] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const fileRef = useRef();

  const filtered = records.filter(r=>{
    if(!filterText) return true;
    return Object.values(r).some(v=>String(v).toLowerCase().includes(filterText.toLowerCase()));
  });

  const stats = computeStats(records);

  function addRecord(rec) {
    setRecords(prev=>mergeRecords(prev,[rec],"FileNo"));
  }

  function importCSV() {
    try {
      const incoming = parseCsvToRecords(importText);
      if(incoming.length===0){setImportMsg("⚠️ No records found. Check CSV format.");return;}
      setRecords(prev=>mergeRecords(prev,incoming,"FileNo"));
      setImportMsg(`✅ ${incoming.length} record(s) imported / merged by FileNo.`);
      setImportText("");
    } catch(e) {
      setImportMsg("❌ Import failed. Check CSV format.");
    }
  }

  function handleFileUpload(e) {
    const file=e.target.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{ setImportText(ev.target.result); };
    reader.readAsText(file);
  }

  function exportFull() {
    downloadCSV(buildCSV(filtered,ALL_COLS),`CIBS_Databank_Full_${new Date().toISOString().slice(0,10)}.csv`);
  }
  function exportP() {
    const cols=[...IDENTITY_COLS,...P_PERINATAL,...P_BX_ITEMS,...P_DOM_COLS,...P_RISK_COLS];
    downloadCSV(buildCSV(filtered,cols),`CIBS_eSMART_P_${new Date().toISOString().slice(0,10)}.csv`);
  }
  function exportC() {
    const cols=[...IDENTITY_COLS,...C_FIS_COLS,...C_SCSS_COLS];
    downloadCSV(buildCSV(filtered,cols),`CIBS_eSMART_C_${new Date().toISOString().slice(0,10)}.csv`);
  }
  function exportV() {
    const cols=[...IDENTITY_COLS,...V_COG_COLS,...V_DX_COLS,...V_RISK_COLS,"V_Impression","V_Treatment"];
    downloadCSV(buildCSV(filtered,cols),`CIBS_eSMART_V_${new Date().toISOString().slice(0,10)}.csv`);
  }
  function exportResearch() {
    const cols=[...IDENTITY_COLS,...P_DOM_COLS,...P_RISK_COLS,"C_FIS_IQ","C_FIS_IQBand","C_CQ","C_EQSS","C_MHI","C_SFI","C_CRI",...V_DX_COLS,"V_Prognosis"];
    downloadCSV(buildCSV(filtered,cols),`CIBS_Research_Export_${new Date().toISOString().slice(0,10)}.csv`);
  }

  const today = new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",background:"#f0f4f8",minHeight:"100vh"}}>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f 0%,#0d5c6e 60%,#0d9488 100%)",padding:"16px 22px",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:10,background:"rgba(255,255,255,0.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="9" r="3.8" fill="#5DCAA5"/>
                <circle cx="8" cy="16" r="2.8" fill="#9FE1CB"/>
                <circle cx="22" cy="16" r="2.8" fill="#9FE1CB"/>
                <circle cx="11" cy="24" r="3.2" fill="#1D9E75"/>
                <circle cx="19" cy="24" r="3.2" fill="#1D9E75"/>
                <line x1="15" y1="12" x2="8" y2="16" stroke="#9FE1CB" strokeWidth="1.2" opacity="0.9"/>
                <line x1="15" y1="12" x2="22" y2="16" stroke="#9FE1CB" strokeWidth="1.2" opacity="0.9"/>
                <line x1="8" y1="18" x2="11" y2="24" stroke="#5DCAA5" strokeWidth="1.2" opacity="0.8"/>
                <line x1="22" y1="18" x2="19" y2="24" stroke="#5DCAA5" strokeWidth="1.2" opacity="0.8"/>
              </svg>
            </div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <h1 style={{margin:0,fontSize:20,fontWeight:900,color:"#fff"}}>CIBS Databank</h1>
                <span style={{padding:"2px 8px",borderRadius:5,background:"rgba(255,255,255,0.18)",fontSize:10,fontWeight:700,color:"#9FE1CB"}}>RESEARCH ENGINE</span>
              </div>
              <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.65)"}}>Unified eSMART-P + C + V Data Integration · CIBS Nagpur</p>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["table","📊 Data Table"],["stats","📈 Statistics"],["schema","🏗 Schema"],["import","⬆ Import"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:view===v?"#fff":"rgba(255,255,255,0.18)",color:view===v?"#0d5c6e":"#fff"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUMMARY STRIP ── */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"10px 22px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:16,flex:1}}>
            {[["Total Records",records.length,"#0d5c6e"],["P Records",records.filter(r=>r.P_ADHD_score!==undefined).length,"#7c3aed"],["C Records",records.filter(r=>r.C_FIS_IQ!==undefined).length,"#0d9488"],["V Records",records.filter(r=>r.V_Impression!==undefined).length,"#1e3a5f"],["Filtered",filtered.length,"#374151"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'Courier New',monospace"}}>{v}</div>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={exportFull} style={{padding:"8px 14px",borderRadius:7,background:"#0d5c6e",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>📥 Full CSV</button>
            <button onClick={exportP} style={{padding:"8px 12px",borderRadius:7,background:"#7c3aed",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>P Only</button>
            <button onClick={exportC} style={{padding:"8px 12px",borderRadius:7,background:"#0d9488",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>C Only</button>
            <button onClick={exportV} style={{padding:"8px 12px",borderRadius:7,background:"#1e3a5f",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>V Only</button>
            <button onClick={exportResearch} style={{padding:"8px 12px",borderRadius:7,background:"#16a34a",color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>🔬 Research</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"18px 14px"}}>

        {/* ══ TABLE VIEW ══ */}
        {view==="table"&&<>
          {/* Toolbar */}
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <input value={filterText} onChange={e=>setFilterText(e.target.value)} placeholder="🔍 Search any field..."
              style={{flex:1,minWidth:200,padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,color:"#1e293b",outline:"none"}}/>
            <button onClick={()=>setShowColPicker(!showColPicker)} style={{padding:"9px 14px",borderRadius:9,background:"#fff",border:"1.5px solid #e2e8f0",fontSize:12,fontWeight:700,cursor:"pointer",color:"#374151"}}>⚙ Columns ({selectedCols.length})</button>
          </div>

          {/* Column picker */}
          {showColPicker&&(
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:16,marginBottom:14}}>
              <p style={{fontSize:11,fontWeight:700,color:"#0d5c6e",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Select columns to display in table</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:10}}>
                <button onClick={()=>setSelectedCols([...IDENTITY_COLS,...P_DOM_COLS,"C_FIS_IQ","C_FIS_IQBand","C_CRI"])} style={{padding:"5px 10px",borderRadius:6,background:"#eff6ff",color:"#1d4ed8",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>Research Preset</button>
                <button onClick={()=>setSelectedCols([...IDENTITY_COLS,...P_BX_ITEMS,...P_DOM_COLS])} style={{padding:"5px 10px",borderRadius:6,background:"#faf5ff",color:"#7c3aed",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>eSMART-P Full</button>
                <button onClick={()=>setSelectedCols([...IDENTITY_COLS,...C_FIS_COLS,...C_SCSS_COLS])} style={{padding:"5px 10px",borderRadius:6,background:"#f0fdfa",color:"#0d9488",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>eSMART-C Full</button>
                <button onClick={()=>setSelectedCols(ALL_COLS)} style={{padding:"5px 10px",borderRadius:6,background:"#f0fdf4",color:"#16a34a",border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>All Columns</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:180,overflowY:"auto"}}>
                {ALL_COLS.map(col=>{
                  const sel=selectedCols.includes(col);
                  const grp=COL_GROUPS.find(g=>g.cols.includes(col));
                  return <button key={col} onClick={()=>setSelectedCols(prev=>sel?prev.filter(c=>c!==col):[...prev,col])}
                    style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${sel?(grp?.color||"#0d5c6e")+"60":"#e2e8f0"}`,background:sel?(grp?.color||"#0d5c6e")+"12":"#f8fafc",color:sel?(grp?.color||"#0d5c6e"):"#64748b",fontSize:10,fontWeight:sel?700:400,cursor:"pointer"}}>
                    {col}
                  </button>;
                })}
              </div>
            </div>
          )}

          {/* Add record */}
          <div style={{marginBottom:14}}>
            <ManualEntryForm onSave={(rec)=>{addRecord(rec); setView("table");}}/>
          </div>

          {/* Table */}
          <div style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #e2e8f0",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:"#1e3a5f"}}>
                    {selectedCols.map(col=>{
                      const grp=COL_GROUPS.find(g=>g.cols.includes(col));
                      return <th key={col} style={{padding:"9px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:"#fff",whiteSpace:"nowrap",borderRight:"1px solid rgba(255,255,255,0.1)",background:grp?.color||"#1e3a5f"}}>{col}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={selectedCols.length} style={{padding:"24px",textAlign:"center",color:"#94a3b8",fontStyle:"italic"}}>No records match your filter.</td></tr>}
                  {filtered.map((rec,ri)=>(
                    <tr key={rec.FileNo||ri} style={{background:ri%2===0?"#fff":"#fafafa"}}>
                      {selectedCols.map(col=>{
                        const v=getVal(rec,col);
                        // Colour severity cells
                        if(col.endsWith("_sev")&&v) {
                          const c=SEV_COL_MAP[v]||"#374151";
                          return <td key={col} style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>
                            <span style={{padding:"2px 8px",borderRadius:8,fontSize:10,fontWeight:700,background:c+"18",color:c}}>{v}</span>
                          </td>;
                        }
                        // Colour IQ
                        if(col==="C_FIS_IQ"&&v) {
                          const iq=parseInt(v)||0;
                          const c=iq>=112?"#0F6E56":iq>=100?"#0d5c6e":iq>=88?"#374151":iq>=76?"#633806":"#791F1F";
                          return <td key={col} style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}><span style={{fontFamily:"monospace",fontWeight:800,color:c}}>{v}</span></td>;
                        }
                        return <td key={col} style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#374151"}} title={v}>{v||<span style={{color:"#e2e8f0"}}>—</span>}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:"8px 14px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",fontSize:11,color:"#94a3b8",display:"flex",justifyContent:"space-between"}}>
              <span>Showing {filtered.length} of {records.length} records · {selectedCols.length} columns</span>
              <span>CIBS Databank · {today}</span>
            </div>
          </div>
        </>}

        {/* ══ STATS VIEW ══ */}
        {view==="stats"&&stats&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
            {[["Total Children",stats.N,"#0d5c6e"],["Mean CIBS-FIS IQ",stats.iqMean,"#0d9488"],["Suicide Flags",stats.sflag,"#dc2626"],["Unique Schools",new Set(records.map(r=>r.School)).size,"#7c3aed"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#fff",borderRadius:10,padding:"16px",border:"1px solid #e2e8f0",textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,color:c,fontFamily:"'Courier New',monospace"}}>{v}</div>
                <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e2e8f0",marginBottom:16}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1e3a5f",margin:"0 0 14px"}}>eSMART-P Domain Profile — Mean Scores & Flag Rates</h3>
            {stats.domStats.map(({d,mean,flags,pct})=>{
              const cfg=DOM_CFG[d];
              return <div key={d} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:cfg.color,minWidth:60}}>{d}</span>
                  <span style={{fontSize:12,color:"#374151"}}>Mean: <strong>{mean}</strong> / {cfg.max}</span>
                  <span style={{fontSize:11,color:flags>0?"#dc2626":"#16a34a",fontWeight:700}}>{flags} flagged ({pct}%)</span>
                </div>
                <div style={{background:"#f3f4f6",borderRadius:4,height:10,overflow:"hidden"}}>
                  <div style={{width:`${mean!=="—"?((parseFloat(mean)/cfg.max)*100):0}%`,height:"100%",background:cfg.color,borderRadius:4}}/>
                </div>
              </div>;
            })}
          </div>

          <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e2e8f0"}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1e3a5f",margin:"0 0 14px"}}>IQ Distribution (CIBS-FIS)</h3>
            {stats.iqVals.length===0&&<p style={{color:"#94a3b8",fontStyle:"italic",fontSize:12}}>No FIS IQ data available yet.</p>}
            {stats.iqVals.length>0&&[["Below 76","Borderline/ID",stats.iqVals.filter(v=>v<76).length,"#dc2626"],["76–99","Low Avg / Avg",stats.iqVals.filter(v=>v>=76&&v<100).length,"#d97706"],["100–111","High Average",stats.iqVals.filter(v=>v>=100&&v<112).length,"#0d9488"],["112+","Superior+",stats.iqVals.filter(v=>v>=112).length,"#0d5c6e"]].map(([range,label,n,c])=>(
              <div key={range} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,color:c,minWidth:90}}>{range}</span>
                <span style={{fontSize:11,color:"#6b7280",minWidth:110}}>{label}</span>
                <div style={{flex:1,background:"#f3f4f6",borderRadius:4,height:12,overflow:"hidden"}}>
                  <div style={{width:`${stats.iqVals.length>0?(n/stats.iqVals.length)*100:0}%`,height:"100%",background:c,borderRadius:4}}/>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:c,minWidth:30,textAlign:"right"}}>{n}</span>
              </div>
            ))}
          </div>
        </>}

        {/* ══ SCHEMA VIEW ══ */}
        {view==="schema"&&<>
          <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e2e8f0",marginBottom:14}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1e3a5f",margin:"0 0 6px"}}>CIBS Databank — Master Column Schema</h3>
            <p style={{fontSize:12,color:"#6b7280",marginBottom:14,lineHeight:1.6}}>One row per child. FileNo (CIBS File Number) is the primary key linking all three modules. Total columns: <strong>{ALL_COLS.length}</strong>.</p>
            {COL_GROUPS.map(g=>(
              <div key={g.label} style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                  <div style={{width:12,height:12,borderRadius:2,background:g.color,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:g.color}}>{g.label}</span>
                  <span style={{fontSize:11,color:"#94a3b8"}}>({g.cols.length} columns)</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,paddingLeft:22}}>
                  {g.cols.map(col=>(
                    <span key={col} style={{padding:"2px 8px",borderRadius:5,background:g.color+"12",color:g.color,fontSize:10,fontWeight:500,border:`1px solid ${g.color}30`}}>{col}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:10,padding:"12px 16px",fontSize:12,color:"#92400e",lineHeight:1.7}}>
            📌 <strong>Integration Note:</strong> Each eSMART module exports a CSV with its own columns + the FileNo identifier. The CIBS Databank merges these by FileNo. A child can have P-only, C-only, or all three rows — the schema accommodates partial data with empty cells.
          </div>
        </>}

        {/* ══ IMPORT VIEW ══ */}
        {view==="import"&&<>
          <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e2e8f0",marginBottom:14}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1e3a5f",margin:"0 0 8px"}}>Import CSV from eSMART-P, eSMART-C, or eSMART-V</h3>
            <p style={{fontSize:12,color:"#6b7280",marginBottom:14,lineHeight:1.6}}>Paste CSV content below, or upload a file. The system will merge records by <strong>FileNo</strong> — existing records will be updated with new data.</p>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} style={{display:"none"}}/>
              <button onClick={()=>fileRef.current.click()} style={{padding:"9px 18px",borderRadius:8,background:"#eff6ff",color:"#1e40af",border:"1.5px solid #bfdbfe",fontSize:13,fontWeight:700,cursor:"pointer"}}>📁 Upload CSV File</button>
              <button onClick={()=>setImportText("")} style={{padding:"9px 14px",borderRadius:8,background:"#f1f5f9",color:"#475569",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear</button>
            </div>
            <textarea value={importText} onChange={e=>setImportText(e.target.value)} placeholder={"Paste CSV content here...\n\nExpected columns include FileNo as the primary key.\n\nSupported sources:\n• eSMART-P CSV export (columns start with P_)\n• eSMART-C CSV export (columns start with C_)\n• eSMART-V CSV export (columns start with V_)"} rows={10}
              style={{width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,color:"#1e293b",outline:"none",resize:"vertical",fontFamily:"'Courier New',monospace",lineHeight:1.6,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center"}}>
              <button onClick={importCSV} style={{padding:"10px 22px",borderRadius:9,background:"#0d5c6e",color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer"}}>⬆ Import & Merge →</button>
              {importMsg&&<span style={{fontSize:13,fontWeight:600,color:importMsg.startsWith("✅")?"#16a34a":importMsg.startsWith("⚠️")?"#d97706":"#dc2626"}}>{importMsg}</span>}
            </div>
          </div>

          <div style={{background:"#fff",borderRadius:12,padding:20,border:"1px solid #e2e8f0"}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#1e3a5f",margin:"0 0 14px"}}>Manual Single-Record Entry</h3>
            <ManualEntryForm onSave={(rec)=>{addRecord(rec); setImportMsg(`✅ Record ${rec.FileNo} added.`); setView("table");}}/>
          </div>
        </>}

        {/* Footer */}
        <div style={{marginTop:20,padding:"12px 16px",background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",fontSize:11,color:"#94a3b8"}}>
          <span>CIBS Databank · Central Institute of Behavioural Sciences, Nagpur · Dr. Shailesh Pangaonkar, MBBS, DPM, DNB, MSc BA</span>
          <span>Data is session-only. Export CSV to persist.</span>
        </div>
      </div>
    </div>
  );
}
