import { useState, useRef, useCallback, useEffect } from "react";

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║   CIBS-VALID  —  Standalone Validation Assessment Battery  v 1.0        ║
// ║   Central Institute of Behavioural Sciences, Nagpur                      ║
// ║   Domains: Cognition · Personality · Health · Depression · Risk          ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ─────────────── INSTRUMENT DATA ───────────────────────────────────────────

// ── SVG Shape Primitives for Raven's Visual Matrices ──────────────────────────
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
    6:[[-10,-7],[0,-7],[10,-7],[-10,7],[0,7],[10,7]],
    7:[[-10,-9],[0,-9],[10,-9],[-10,0],[10,0],[-5,9],[5,9]],
    8:[[-12,-7],[-4,-7],[4,-7],[12,-7],[-12,7],[-4,7],[4,7],[12,7]],
    9:[[-11,-11],[0,-11],[11,-11],[-11,0],[0,0],[11,0],[-11,11],[0,11],[11,11]],
    12:[[-13,-10],[-4,-10],[4,-10],[13,-10],[-13,-2],[-4,-2],[4,-2],[13,-2],[-13,7],[-4,7],[4,7],[13,7]],
  };
  return <>{(layouts[n]||[]).map(([dx,dy],i)=><circle key={i} cx={cx+dx} cy={cy+dy} r={r} fill="#374151"/>)}</>;
};

// ── CAT Item Pools organised by IQ Band ───────────────────────────────────────
// Band 1 (IQ 75–90)  — 2 items  — advance rule: 2/2 correct
// Band 2 (IQ 90–110) — 4 items  — advance rule: 2/4 correct
// Band 3 (IQ 110–124)— 3 items  — advance rule: 2/3 correct
// Band 4 (IQ ≥125)   — 2 items  — terminal band (no advance)
const RAVENS_CAT = {
  1: [
    // B1-Q1: Shape cycle ○□△ — very simple repeating pattern
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

    // B1-Q2: Size series — circles shrinking left to right
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
  ],

  2: [
    // B2-Q1: Dot doubling 1→2→4→?
    { id:3, title:"Dot Count", instruction:"How many dots fill the next box?", ans:0,
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
        {label:"5 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={4} r={5}/></svg>},
        {label:"6 dots", render:(sz=56)=><svg width={sz} height={sz} viewBox="0 0 56 56"><RvDots cx={28} cy={28} n={6} r={4.5}/></svg>},
      ]},

    // B2-Q2: Arrow rotation 90° clockwise
    { id:4, title:"Arrow Direction", instruction:"Which arrow direction comes next?", ans:0,
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

    // B2-Q3: Checkerboard alternating fill — bottom right missing
    { id:5, title:"Grid Pattern", instruction:"Which tile completes the checkerboard?", ans:0,
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

    // B2-Q4: Count increases per row (1→2→3 shapes per column)
    { id:6, title:"Count Pattern", instruction:"How many squares complete the bottom row?", ans:0,
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
  ],

  3: [
    // B3-Q1: Size shrinks across columns, shape changes per row — 3×3 matrix
    { id:7, title:"Size & Shape", instruction:"Which shape belongs in the empty box?", ans:0,
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

    // B3-Q2: Shade gradient dark→grey→light across each row
    { id:8, title:"Shade Pattern", instruction:"Which shade belongs in the empty box?", ans:0,
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

    // B3-Q3: TWO simultaneous rules — arrow direction changes per row, size shrinks per column
    { id:9, title:"Direction & Size", instruction:"Which arrow completes the pattern?", ans:0,
      renderStimulus:()=>(
        <svg viewBox="0 0 210 210" width={210} height={210} style={{display:'block',margin:'0 auto'}}>
          <RvGrid rows={3} cols={3}/>
          {/* Row 0: right arrows, large→med→small */}
          <RvArrow cx={35}  cy={35}  dir="right" size={20}/>
          <RvArrow cx={105} cy={35}  dir="right" size={14}/>
          <RvArrow cx={175} cy={35}  dir="right" size={8}/>
          {/* Row 1: down arrows */}
          <RvArrow cx={35}  cy={105} dir="down" size={20}/>
          <RvArrow cx={105} cy={105} dir="down" size={14}/>
          <RvArrow cx={175} cy={105} dir="down" size={8}/>
          {/* Row 2: left arrows — last cell missing */}
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
  ],

  4: [
    // B4-Q1: Multiplication dot matrix — cell(r,c) = (r+1)×(c+1) dots
    // 1·2·3 / 2·4·6 / 3·6·? → answer 9
    { id:10, title:"Dot Matrix", instruction:"How many dots belong in the missing cell?", ans:0,
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

    // B4-Q2: Polygon sides sequence — each step adds one side (3→4→5 per row, 3→4→5 per col, diagonal rule)
    // Row1: △(3) □(4) ⬠(5) / Row2: □(4) ⬠(5) ⬡(6) / Row3: ⬠(5) ⬡(6) ?(7=heptagon)
    { id:11, title:"Shape Sides", instruction:"Which shape has the correct number of sides?", ans:0,
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
  ],
};

// ── CAT Advancement Rules ─────────────────────────────────────────────────────
const CAT_RULES = {
  1: { passThreshold:2, label:"Foundation",  iqBase:75,  range:14 },
  2: { passThreshold:2, label:"Standard",    iqBase:90,  range:19 },
  3: { passThreshold:2, label:"Advanced",    iqBase:105, range:18 },
  4: { passThreshold:1, label:"Exceptional", iqBase:120, range:15 },
};

// IQ lookup based on highest band reached and correct score in that final band
const scoreCAT = (d1) => {
  const band = d1._band || 1;
  const b = { 1:d1._b1||0, 2:d1._b2||0, 3:d1._b3||0, 4:d1._b4||0 };
  const totalCorrect = b[1]+b[2]+b[3]+b[4];
  const totalQ = Object.keys(d1).filter(k=>!k.startsWith('_')).length;
  const rule = CAT_RULES[band];
  const bc = b[band];
  const bandTotal = Object.values(RAVENS_CAT[band]).length;
  const iq = Math.round(rule.iqBase + (bc / bandTotal) * rule.range);
  const label =
    iq < 90  ? "Below Average" :
    iq < 110 ? "Average" :
    iq < 120 ? "High Average" :
    iq < 130 ? "Superior" : "Exceptional";
  return { iq, label, band, bandScores:b, totalCorrect, totalQ };
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

// ─────────────── SCORING HELPERS ───────────────────────────────────────────

const scoreBFI = (resp) => {
  const doms = { O:[5,10], C:[3,8], E:[1,6], A:[2,7], N:[4,9] };
  const result = {};
  Object.entries(doms).forEach(([d,[f,r]]) => {
    const fv = resp[f] || 3;
    const rv = resp[r] || 3;
    result[d] = ((fv + (6 - rv)) / 2).toFixed(1);
  });
  return result;
};

const scoreDuke = (resp) => {
  const get = (id) => resp[id] !== undefined ? resp[id] : 2;
  // Physical: items 1,2,3,4 (func: 0–2 each → 0–8 → scaled 0–100)
  const phys = ((get(1) + get(2) + get(3) + get(4)) / 8 * 100).toFixed(0);
  // Mental: items 7,8,9(rev),10(rev),11 freq 0–4 each
  const mental = (((get(7) + get(8) + (4-get(9)) + (4-get(10)) + get(11)) / 20 * 100)).toFixed(0);
  // Social: 5,6,16
  const social = ((( get(5) + get(6) + get(16)) / 12 * 100)).toFixed(0);
  // General: avg phys+mental+social
  const general = ((+phys + +mental + +social) / 3).toFixed(0);
  // Self-esteem: item 11
  const selfEsteem = ((get(11)/4)*100).toFixed(0);
  // Anxiety: item 10
  const anxiety = ((get(10)/4)*100).toFixed(0);
  // Depression: item 9
  const depression = ((get(9)/4)*100).toFixed(0);
  // Perceived health: 12,13 avg
  const perceived = (((get(12) + get(13)) / 8 * 100)).toFixed(0);
  // Pain: item 15 (reversed)
  const pain = (((4-get(15))/4)*100).toFixed(0);
  // Disability: item 1 (reversed – limited a lot = disabled)
  const disability = (((2-get(1))/2)*100).toFixed(0);
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
  if (pos===0) return { level:0, label:"No ideation", color:"#10B981" };
  if (pos<=1)  return { level:1, label:"Passive ideation", color:"#84CC16" };
  if (pos<=2)  return { level:2, label:"Active ideation (no plan)", color:"#F59E0B" };
  if (pos<=3)  return { level:3, label:"Ideation with plan", color:"#F97316" };
  return              { level:4, label:"Intent with rehearsal", color:"#EF4444" };
};

const scoreAUDIT = (resp) => {
  const s = Object.entries(resp).reduce((a,[k,v]) => a + AUDITC[parseInt(k)].sc[v], 0);
  if (s<=3)  return { score:s, label:"Low risk", color:"#10B981" };
  if (s<=7)  return { score:s, label:"Hazardous use", color:"#F59E0B" };
  return          { score:s, label:"Harmful / Dependent", color:"#EF4444" };
};

const generateUID = (mobile, dob, gender) => {
  const last6 = (mobile||"").replace(/\D/g,"").slice(-6).padStart(6,"0");
  const now = new Date();
  const dd = String(now.getDate()).padStart(2,"0");
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const yy = String(now.getFullYear()).slice(-2);
  const g = (gender||"X")[0].toUpperCase();
  return `SC-${last6}-${dd}${mm}${yy}-${g}`;
};

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
const Welcome = ({ onSelf, onClinician }) => (
  <div className="min-h-screen flex flex-col" style={{
    background: "linear-gradient(160deg, #0F1E30 0%, #1A2E4A 50%, #0F1E30 100%)"
  }}>
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {/* Branding */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-2xl"
          style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.5)" }}>
          <span className="text-4xl">📋</span>
        </div>
        <div className="absolute -top-1 -right-8 w-6 h-6 rounded-full bg-green-400 animate-pulse opacity-75"/>
      </div>

      <h1 className="text-4xl font-black text-white mb-1 tracking-tight">CIBS-VALID</h1>
      <p className="text-purple-300 font-semibold mb-1 text-sm">
        Validation & Assessment of Longitudinal Instrument Diagnostics
      </p>
      <p className="text-purple-500 text-xs mb-8">
        Central Institute of Behavioural Sciences · Nagpur · v 1.0
      </p>

      {/* Domain chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-xs">
        {[
          { d:"D1", label:"Cognition",   color:"#3B82F6" },
          { d:"D2", label:"Personality", color:"#8B5CF6" },
          { d:"D3", label:"Health",      color:"#10B981" },
          { d:"D4", label:"Depression",  color:"#F59E0B" },
          { d:"D5", label:"Risk",        color:"#EF4444" },
        ].map(x => (
          <span key={x.d} className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: x.color + "25", color: x.color, border: `1px solid ${x.color}44` }}>
            {x.d} · {x.label}
          </span>
        ))}
      </div>

      <p className="text-purple-400 text-xs mb-8">
        5 domains · ~58 items · 20–25 minutes
      </p>

      {/* Mode selection */}
      <div className="w-full max-w-sm space-y-3">
        <button onClick={onSelf}
          className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all active:scale-98"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
          Self-Assessment
          <span className="block text-purple-200 text-xs font-normal mt-0.5">For literate, tech-savvy individuals</span>
        </button>
        <button onClick={onClinician}
          className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg"
          style={{ background: "linear-gradient(135deg, #1D4ED8, #1A2E4A)" }}>
          Clinician-Assisted Mode
          <span className="block text-blue-200 text-xs font-normal mt-0.5">Examiner reads aloud · Any literacy level</span>
        </button>
      </div>
    </div>
    <p className="text-center text-purple-600 text-xs pb-4 px-4">
      PI: Dr Shailesh V. Pangaonkar · CIBS Nagpur · +91 9423105228
    </p>
  </div>
);

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

// ════ CONSENT ════════════════════════════════════════════════════════════════
const Consent = ({ mode, onConsent }) => {
  const [ticked, setTicked] = useState({});
  const stmts = [
    "I confirm that this form has been read to me (or I have read it myself) in a language I understand.",
    "I understand that my participation is entirely voluntary and I can stop at any time without any consequence.",
    "I understand that no personal identifiers will be stored in the database — only an anonymous UID.",
    "I understand that anonymised group data may be used in scientific publications and I will not be identifiable.",
    "I agree to complete the CIBS-VALID assessment battery today and receive a personalised report.",
    "I understand that if any elevated risk is identified, I may be offered — but am not obliged to accept — further support.",
  ];
  const allTicked = stmts.every((_, i) => ticked[i]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <p className="text-xs font-black text-center text-gray-700">Informed Consent</p>
        <p className="text-xs text-center text-gray-400">
          {mode==="self" ? "Self-Administration" : "Clinician-Assisted Mode"}
        </p>
      </div>
      <div className="p-4 max-w-sm mx-auto space-y-4 pb-8">
        <div className="rounded-2xl p-4" style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE" }}>
          <p className="text-xs font-bold text-blue-700 mb-1">Ethics Approval Note</p>
          <p className="text-xs text-blue-800">
            This study has been submitted to the Ethics Committee of Dr Rinki Rughwani Children Hospital,
            Nagpur. EC reference and date will be inserted on formal approval. For any concern about
            participant rights, contact the EC directly at the hospital.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-800 mb-2">About This Assessment</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            CIBS-VALID is a multi-domain mental health assessment battery developed by
            Central Institute of Behavioural Sciences (CIBS), Nagpur. It consists of
            5 validated domains covering cognitive function, personality, physical and
            mental health, depression screening, and risk factor profiling.
            <br/><br/>
            <strong>Duration:</strong> ~20–25 minutes. &nbsp;
            <strong>Format:</strong> Multiple-choice questions only.&nbsp;
            <strong>No physical procedures.</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Please confirm each statement:</p>
          <div className="space-y-3">
            {stmts.map((s, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer"
                onClick={() => setTicked(t => ({ ...t, [i]: !t[i] }))}>
                <div className={cx(
                  "mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  ticked[i] ? "bg-purple-600 border-purple-600" : "border-gray-300"
                )}>
                  {ticked[i] && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed select-none">{s}</p>
              </label>
            ))}
          </div>
        </div>

        {mode==="assisted" && (
          <div className="rounded-2xl p-3" style={{ background:"#FFFBEB", border:"1.5px solid #FCD34D" }}>
            <p className="text-xs text-amber-800">
              <strong>Examiner note:</strong> Please read all questions aloud. Record responses on the participant's behalf.
              Verbal consent has been obtained and noted in the examiner log.
            </p>
          </div>
        )}

        <button onClick={onConsent} disabled={!allTicked}
          className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-40"
          style={{ background: allTicked ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "#9CA3AF" }}>
          I Consent — Begin CIBS-VALID →
        </button>
      </div>
    </div>
  );
};

// ════ DOMAIN NAVIGATOR ═══════════════════════════════════════════════════════
const DOMAIN_META = [
  { id:1, code:"D1", name:"Cognition",   color:"#3B82F6", bg:"#EFF6FF", icon:"🧩", count:8  },
  { id:2, code:"D2", name:"Personality", color:"#8B5CF6", bg:"#F5F3FF", icon:"🪞", count:10 },
  { id:3, code:"D3", name:"Health",      color:"#10B981", bg:"#F0FDF4", icon:"💚", count:17 },
  { id:4, code:"D4", name:"Depression",  color:"#F59E0B", bg:"#FFFBEB", icon:"🌤", count:9  },
  { id:5, code:"D5", name:"Risk",        color:"#EF4444", bg:"#FEF2F2", icon:"🛡", count:13 },
];

// ════ ASSESSMENT CONTAINER ════════════════════════════════════════════════════
const Assessment = ({ mode, onComplete }) => {
  const [domain, setDomain] = useState(1);
  const [resp, setResp] = useState({ d1:{}, d2:{}, d3:{}, d4:{}, d5:{} });
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
  const cd = DOMAIN_META[domain-1];

  const nextDomain = () => {
    if (domain < 5) { setDomain(d=>d+1); scrollRef.current?.scrollTo(0,0); }
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
        {domain===4 && <DomainDepression resp={resp.d4} set={(k,v)=>set(4,k,v)} color={cd.color} bg={cd.bg} mode={mode}/>}
        {domain===5 && <DomainRisk resp={resp.d5} set={(k,v)=>set(5,k,v)} color={cd.color} bg={cd.bg} mode={mode}/>}

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
              {domain < 5 ? `Continue → ${DOMAIN_META[domain].name}` : "Complete Assessment ✅"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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

// ════ DOMAIN 4 — DEPRESSION (PHQ-9) ══════════════════════════════════════════
const DomainDepression = ({ resp, set, color, bg, mode }) => {
  const opts = ["Not at all (0)","Several days (1)","More than half the days (2)","Nearly every day (3)"];
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-3 text-xs" style={{ background:bg, border:`1px solid ${color}33` }}>
        <strong style={{color}}>PHQ-9 Depression Screening</strong><br/>
        <span className="text-gray-600">
          Over the <strong>past 2 weeks</strong>, how often have you been bothered by the following problems?
        </span>
      </div>
      {PHQ9.map((text, i) => {
        const val = resp[i+1];
        const isSuicidal = i === 8;
        return (
          <div key={i} className={cx("bg-white rounded-2xl border p-4",
            isSuicidal ? "border-red-200" : "border-gray-200")}>
            {isSuicidal && (
              <div className="rounded-xl p-2 mb-3" style={{ background:"#FEF2F2", border:"1px solid #FCA5A5" }}>
                <p className="text-xs text-red-700">
                  ⚠️ If you are experiencing these thoughts, please reach out for help.
                  {mode==="assisted" && " Examiner: assess further and escalate if needed."}
                  <br/><strong>iCall (TISS): 9152987821 &nbsp;|&nbsp; Vandrevala Foundation: 1860-2662-345</strong>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-700 mb-2">{i+1}. {text}</p>
            <div className="space-y-1.5">
              {opts.map((opt, j) => (
                <button key={j} onClick={() => set(i+1, j)}
                  className={cx("w-full text-left py-2 px-3 rounded-xl text-xs border-2 transition-all",
                    val===j ? "border-amber-500 bg-amber-50 text-amber-700 font-bold" : "border-gray-200 text-gray-600")}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ════ DOMAIN 5 — RISK ═════════════════════════════════════════════════════════
const DomainRisk = ({ resp, set, color, bg, mode }) => (
  <div className="space-y-4">
    <div className="rounded-xl p-3 text-xs" style={{ background:bg, border:`1px solid ${color}33` }}>
      <strong style={{color}}>⚠️ Risk Factor Profile — D5</strong><br/>
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
const Demographics = ({ onComplete }) => {
  const [form, setForm] = useState({ name:"", age:"", gender:"", mobile:"", email:"", ref:"" });
  const f = (k,v) => setForm(p => ({ ...p, [k]: v }));
  const canProceed = form.mobile.length === 10 || form.ref.trim().length > 0;
  const uid = generateUID(form.mobile, form.gender);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <p className="text-xs font-black text-center text-gray-700">Subject ID & Details</p>
        <p className="text-xs text-center text-gray-400">Required for report generation and record keeping</p>
      </div>
      <div className="p-4 max-w-sm mx-auto space-y-4 pb-8">
        <div className="rounded-2xl p-3" style={{ background:"#F5F3FF", border:"1.5px solid #DDD6FE" }}>
          <p className="text-xs font-bold text-purple-700 mb-1">Your Privacy</p>
          <p className="text-xs text-purple-800">
            Your name and contact details are used only to generate your unique UID and to send your report.
            They are never stored in the research database. Only the anonymous UID is recorded.
          </p>
        </div>

        {[
          { k:"name",   label:"Full Name (optional — leave blank to remain anonymous)", placeholder:"Anonymous Participant", type:"text" },
          { k:"age",    label:"Age (years) *", placeholder:"25", type:"number" },
          { k:"mobile", label:"Mobile Number * (10 digits)", placeholder:"9876543210", type:"tel", maxLen:10 },
          { k:"email",  label:"Email Address (optional — for receiving your report)", placeholder:"you@email.com", type:"email" },
          { k:"ref",    label:"Clinician Reference / Study Code (if provided)", placeholder:"e.g. CIBS-2025-001", type:"text" },
        ].map(f2 => (
          <div key={f2.k}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f2.label}</label>
            <input value={form[f2.k]} onChange={e=>f(f2.k, e.target.value)}
              placeholder={f2.placeholder} type={f2.type} maxLength={f2.maxLen}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"/>
          </div>
        ))}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
          <div className="flex gap-2">
            {["Male","Female","Other","Prefer not to say"].map(g => (
              <button key={g} onClick={()=>f("gender",g)}
                className={cx("flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  form.gender===g ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-400")}>
                {g==="Prefer not to say"?"Other/NSD":g}
              </button>
            ))}
          </div>
        </div>

        {canProceed && (
          <div className="rounded-xl p-3" style={{ background:"#F0FDF4", border:"1px solid #86EFAC" }}>
            <p className="text-xs font-bold text-green-700 mb-0.5">Your anonymous UID</p>
            <p className="text-base font-mono font-black text-green-800">{uid}</p>
            <p className="text-xs text-green-600">This code identifies your record without revealing your identity.</p>
          </div>
        )}

        <button onClick={() => onComplete({ ...form, uid })} disabled={!canProceed}
          className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-40"
          style={{ background: canProceed ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "#9CA3AF" }}>
          Generate My Report →
        </button>
      </div>
    </div>
  );
};

// ════ REPORT ══════════════════════════════════════════════════════════════════
const Report = ({ responses, demographics, mode }) => {
  const [tab, setTab] = useState(mode==="self" ? "wellbeing" : "clinical");
  const [printing, setPrinting] = useState(false);
  const reportRef = useRef(null);

  // --- Compute scores ---
  const bfi   = scoreBFI(responses.d2);
  const duke  = scoreDuke(responses.d3);
  const phqRaw= scorePHQ(responses.d4);
  const phqCl = classPHQ(phqRaw);
  const cssCl = scoreCSS(Object.fromEntries(
    CSSRS.map((_,i) => [`css${i+1}`, responses.d5[`css${i+1}`]])
  ));
  const audCl = scoreAUDIT(Object.fromEntries(
    AUDITC.map((_,i) => [`${i}`, responses.d5[`aud${i+1}`] !== undefined ? responses.d5[`aud${i+1}`] : 0])
  ));
  const catResult   = scoreCAT(responses.d1);
  const ravensScore = catResult.totalCorrect;
  const ravensIQ    = catResult.iq;
  const ravensLabel = catResult.label;

  const today = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50" ref={reportRef}>
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 print:hidden sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <p className="text-xs font-black text-gray-700">CIBS-VALID Report</p>
          <div className="flex gap-2">
            {["wellbeing","clinical"].map(t => (
              <button key={t} onClick={()=>setTab(t)}
                className={cx("text-xs px-3 py-1.5 rounded-lg font-bold border transition-all",
                  tab===t ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-500 bg-white")}>
                {t==="wellbeing"?"Wellbeing":"Clinical"}
              </button>
            ))}
            <button onClick={handlePrint}
              className="text-xs px-3 py-1.5 rounded-lg font-bold bg-gray-800 text-white">
              {printing?"...":"PDF"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 pb-12 space-y-4">
        {/* Subject banner */}
        <div className="rounded-2xl p-4 text-white"
          style={{ background:"linear-gradient(135deg,#1A2E4A,#243B58)" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-blue-300 mb-0.5">CIBS-VALID Assessment Report</p>
              <p className="text-base font-black">{demographics.name || "Anonymous Participant"}</p>
              <p className="text-xs text-blue-300">
                {demographics.age ? `Age ${demographics.age}` : ""}
                {demographics.gender ? ` · ${demographics.gender}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-300">UID</p>
              <p className="text-xs font-mono font-black">{demographics.uid}</p>
              <p className="text-xs text-blue-400 mt-0.5">{today}</p>
            </div>
          </div>
        </div>

        {tab === "wellbeing" && <WellbeingReport bfi={bfi} duke={duke} phqRaw={phqRaw} phqCl={phqCl} cssCl={cssCl} audCl={audCl} ravensScore={ravensScore} ravensLabel={ravensLabel} catResult={catResult}/>}
        {tab === "clinical"  && <ClinicalReport  bfi={bfi} duke={duke} phqRaw={phqRaw} phqCl={phqCl} cssCl={cssCl} audCl={audCl} ravensScore={ravensScore} ravensIQ={ravensIQ} ravensLabel={ravensLabel} responses={responses} mode={mode} demographics={demographics} catResult={catResult}/>}

        {/* Footer */}
        <div className="rounded-xl p-3 text-center" style={{ background:"#F8FAFC", border:"1px solid #E2E8F0" }}>
          <p className="text-xs text-gray-400">
            Central Institute of Behavioural Sciences (CIBS), Nagpur<br/>
            Dr Shailesh V. Pangaonkar · +91 9423105228 · pangaonkar11@gmail.com<br/>
            This report is for informational purposes only and does not constitute a clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

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
const WellbeingReport = ({ bfi, duke, phqRaw, phqCl, cssCl, audCl, ravensScore, ravensLabel }) => {

  // ── Cognitive narrative ───────────────────────────────────────────────────
  const cognitiveNarrative = () => {
    if (ravensScore >= 7) return {
      headline:"Your reasoning is exceptional",
      body:"You solved almost every pattern in this assessment correctly — a result that places you well above most people your age. You have a natural ability to spot structure in complexity, think several steps ahead, and adapt quickly when a problem changes shape. This kind of thinking is a significant life advantage and tends to be a strong predictor of success in demanding fields.",
      strength:"Pattern recognition · Abstract thinking · Analytical depth"
    };
    if (ravensScore >= 5) return {
      headline:"Your reasoning is above average",
      body:"You performed very well on the pattern reasoning tasks — picking up sequences and logical rules that many people miss. Your mind is wired to find connections and organise information efficiently. This is a solid cognitive strength that serves you well in problem-solving, learning new skills, and making sound decisions.",
      strength:"Logical reasoning · Quick learning · Problem solving"
    };
    if (ravensScore >= 3) return {
      headline:"Your reasoning is solid and practical",
      body:"You answered the pattern tasks at a level consistent with most adults — steady, practical, and reliable. You may find that you think more effectively when you can take your time and work through things step by step rather than under pressure. That is a real strength in itself: thoroughness often beats speed.",
      strength:"Steady thinking · Practical approach · Attention to detail"
    };
    return {
      headline:"Your reasoning may benefit from practice",
      body:"The pattern tasks in this section were challenging for you today. This does not reflect your intelligence — many people find abstract visual puzzles difficult, and there are many forms of intelligence this test simply does not measure. What it does suggest is that systematic, step-by-step thinking may be an area worth nurturing, and that is very much within reach.",
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

  // ── Mood narrative ────────────────────────────────────────────────────────
  const moodNarrative = () => {
    if (phqRaw <= 4) return { head:"Your mood is in a healthy place", body:"Your responses over the past two weeks show little to no sign of low mood or depression. You appear to be managing life's demands without significant emotional distress — a real positive. Continue investing in the things that keep you well: sleep, connection, movement, and moments of meaning." };
    if (phqRaw <= 9) return { head:"You may be experiencing some low mood", body:"Your responses suggest that over the past two weeks, you have been feeling a little flat, tired, or low more often than usual. This is mild — and very common — but it is also a signal worth listening to. Sometimes mild mood dips are your mind's way of asking for rest, connection, or change. Pay attention to what might have shifted." };
    if (phqRaw <= 14) return { head:"You are experiencing moderate depressive symptoms", body:"Your responses indicate that you have been struggling with mood, energy, sleep, or motivation more days than not over the past two weeks. These are symptoms of moderate depression — a real medical condition, not a character flaw or weakness. You deserve proper support, and effective treatments exist. Please take this seriously." };
    if (phqRaw <= 19) return { head:"You are experiencing significant depression", body:"Your score indicates moderately severe depressive symptoms. The way you have been feeling — the heaviness, the lack of energy, the difficulty finding pleasure in things — is not something you have to simply endure. This level of depression responds well to treatment. Please reach out to a doctor or mental health professional as soon as you are able." };
    return { head:"You are in a mental health crisis and need support today", body:"Your responses indicate severe depressive symptoms. We are concerned about you. Please do not be alone with these feelings today. Tell someone you trust how you are really feeling, or call a helpline right now. You are not a burden — reaching out is a brave and important act." };
  };
  const mood = moodNarrative();

  const phq9SuicidalItem = responses => responses?.d4?.[9] || 0;

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
  if (phqRaw >= 15) activeRedFlags.push({
    title:"Your mood score is in the severe range — please speak to a doctor",
    body:"A PHQ-9 score above 15 indicates severe depression that almost always requires professional treatment. Antidepressant therapy, psychological support, or both can dramatically improve how you feel. This is not weakness — it is a health need, exactly like treating high blood pressure or diabetes.",
    helplines:["iCall (TISS): 9152987821","Your nearest government hospital psychiatry OPD — free of charge"]
  });
  if (audCl.score >= 8) activeRedFlags.push({
    title:"Your alcohol use is at a level that can harm your health",
    body:"Your AUDIT-C score suggests harmful or dependent alcohol use. Alcohol at this level damages physical health, worsens depression and anxiety, and affects relationships and work. The good news is that de-addiction support is effective and confidential. You deserve support without judgement.",
    helplines:["iDARC (NIMHANS): 080-46110007","Vandrevala Foundation: 1860-2662-345 (24/7)"]
  });

  const activeAmberFlags = [];
  if (phqRaw >= 10 && phqRaw < 15) activeAmberFlags.push({
    title:"Your mood has been low enough to benefit from professional support",
    body:"A PHQ-9 score of 10–14 indicates moderate depression. Many people at this level benefit significantly from speaking with a counsellor or doctor. You do not need to be in crisis to ask for help.",
    action:"Book an appointment with a counsellor, psychologist, or your family doctor in the next week."
  });
  if (+duke.mental < 40 && phqRaw < 10) activeAmberFlags.push({
    title:"Your mental health score suggests emotional fatigue",
    body:"Even when you are not meeting the threshold for clinical depression, sustained low mental health scores can wear you down over time. Prioritising rest, reducing stressors, and connecting with supportive people can help.",
    action:"Consider speaking with a counsellor or trusted friend about how you have been feeling."
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
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl" style={{background:"#EFF6FF"}}>
          <div className="text-center flex-shrink-0">
            <p className="text-3xl font-black text-blue-700">{ravensScore}<span className="text-base text-blue-400">/8</span></p>
            <p className="text-xs font-bold text-blue-500">{ravensLabel}</p>
          </div>
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
      <div className="bg-white rounded-2xl p-5" style={{
        border: `2px solid ${phqCl.color}66`,
        background: `linear-gradient(135deg, white, ${phqCl.color}06)`
      }}>
        <SectionHead icon="🌤" title="Your Mood & Emotional Wellbeing" color={phqCl.color}
          badge={{text:phqCl.label, color:phqCl.color}}/>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-center px-4 py-3 rounded-xl flex-shrink-0"
            style={{background:phqCl.color+"15",border:`1.5px solid ${phqCl.color}44`}}>
            <p className="text-3xl font-black" style={{color:phqCl.color}}>{phqRaw}</p>
            <p className="text-xs text-gray-500">out of 27</p>
          </div>
          <div>
            <p className="text-sm font-black text-gray-800 mb-0.5">{mood.head}</p>
            <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
              <div className="h-full rounded-full transition-all"
                style={{width:`${(phqRaw/27)*100}%`, background:`linear-gradient(90deg,${phqCl.color}88,${phqCl.color})`}}/>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{mood.body}</p>
        {phqRaw >= 10 && phqRaw < 15 && (
          <div className="mt-3 rounded-xl p-3 text-xs" style={{background:"#FFFBEB",border:"1px solid #FCD34D"}}>
            <p className="font-bold text-amber-800 mb-1">You deserve support</p>
            <p className="text-amber-900">📞 iCall (TISS): <strong>9152987821</strong> — Mon–Sat, 8am–10pm</p>
            <p className="text-amber-900">📞 Vandrevala Foundation: <strong>1860-2662-345</strong> — 24/7, free</p>
          </div>
        )}
      </div>

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
const ClinicalReport = ({ bfi, duke, phqRaw, phqCl, cssCl, audCl, ravensScore, ravensIQ, ravensLabel, responses, mode, demographics, catResult }) => {

  const sdqTotal = SDQCP.reduce((s,item,i) => {
    const v = responses.d5[`sdq${i+1}`] || 0;
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
  if (cssCl.level >= 3) clinAlerts.push({ sev:"CRITICAL", text:`C-SSRS Level ${cssCl.level}/4 — Suicidal ideation with plan${cssCl.level>=4?" and rehearsal":""} endorsed. Immediate clinical assessment and safety planning required.` });
  if (phqRaw >= 15) clinAlerts.push({ sev:"HIGH", text:`PHQ-9 score ${phqRaw}/27 (${phqCl.label}). Clinical MDD evaluation indicated. Consider MINI / SCID follow-up.` });
  if (responses.d4[9] >= 1) clinAlerts.push({ sev:"HIGH", text:`PHQ-9 Item 9 positive (passive suicidal ideation score: ${responses.d4[9]}). Cross-referenced with C-SSRS Level ${cssCl.level}.` });
  if (cssCl.level >= 1 && cssCl.level < 3) clinAlerts.push({ sev:"MODERATE", text:`C-SSRS Level ${cssCl.level} — passive/active ideation without plan. Safety monitoring and 2-week follow-up recommended.` });
  if (audCl.score >= 8) clinAlerts.push({ sev:"HIGH", text:`AUDIT-C score ${audCl.score}/12 — Harmful or dependent use. Structured brief intervention and referral to de-addiction services indicated.` });
  if (audCl.score >= 4 && audCl.score < 8) clinAlerts.push({ sev:"MODERATE", text:`AUDIT-C score ${audCl.score}/12 — Hazardous use detected. Brief alcohol counselling recommended at next clinical contact.` });
  if (sdqTotal >= 5) clinAlerts.push({ sev:"MODERATE", text:`SDQ-Conduct subscale score ${sdqTotal}/10 — Elevated conduct symptomatology. Consider full SDQ or CBCL if paediatric/adolescent presentation.` });
  if (+bfi.N > 4 && phqRaw >= 10) clinAlerts.push({ sev:"MODERATE", text:`High Neuroticism (T=${Math.round(50+(+bfi.N-3)*10)}) concurrent with PHQ-9 ≥10 — emotionally dysregulated presentation warrants psychotherapy referral.` });

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
            ["Battery","CIBS-VALID v1.0"],
            ["Domains","5 (D1–D5)"],
            ["Total Items","~58"],
            ["Instruments","Raven's · BFI-10 · DUKE-17 · PHQ-9 · C-SSRS · AUDIT-C · SDQ-CP"],
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
              {label:"Est. CQ",      val:`~${catResult.iq}`,           color:"#3B82F6"},
              {label:"Classification",val:catResult.label,             color:BAND_COLORS[catResult.band]},
              {label:"Highest Band", val:`Band ${catResult.band}/4`,   color:BAND_COLORS[catResult.band]},
              {label:"Items Adm.",   val:`${catResult.totalQ}`,        color:"#374151"},
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
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">IQ Range</th>
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
                      {rule.iqBase}–{rule.iqBase+rule.range}
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
              catResult.iq>=125?"Exceptional non-verbal reasoning. Completed all band levels with passing scores. Abstract and relational pattern recognition is a primary cognitive strength.":
              catResult.iq>=110?"Above average fluid intelligence. Advanced to Band 3+, indicating strong capacity for multi-rule abstract reasoning.":
              catResult.iq>=90?"Average to high-average cognitive screening performance. Passed foundation and standard levels. No significant impairment identified.":
              "Below average performance on non-verbal reasoning screening. Stopped at Foundation level. Further formal cognitive assessment (WAIS-IV / NIMHANS Battery) is recommended to characterise the profile."
            }
          </div>
          <p className="text-xs text-slate-400 italic">
            Note: CQ estimate is an analog based on highest band reached and within-band performance.
            Not a validated IQ measure. Adaptive administration: {catResult.totalQ} of 11 possible items administered.
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
                const flag = tScore>=65?"↑ Elevated (>1 SD)":tScore<=35?"↓ Low (<1 SD)":"Within normal range";
                const fColor = tScore>=65?"#DC2626":tScore<=35?"#D97706":"#059669";
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
            Reference: Mean T=50, SD=10. Clinically significant deviation: T≥65 or T≤35.
            BFI-10 is a screening instrument. PID-5 recommended if personality disorder evaluation is indicated.
          </p>
        </div>
      </div>

      {/* ── D3: Duke Health Profile ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#10B98108,white)"}}>
          <p className="text-xs font-black text-green-700 uppercase tracking-wider">D3 · Health Profile</p>
          <p className="text-xs text-slate-400">Duke Health Profile (DUKE-17; Parkerson et al., 1990)</p>
        </div>
        <div className="p-4">
          <table className="w-full mb-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Subscale</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Score (0–100)</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Norm Range</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              <RangeRow label="Physical Health"   val={duke.phys}       lo={60} hi={100}/>
              <RangeRow label="Mental Health"     val={duke.mental}     lo={55} hi={100}/>
              <RangeRow label="Social Health"     val={duke.social}     lo={55} hi={100}/>
              <RangeRow label="General Health"    val={duke.general}    lo={58} hi={100}/>
              <RangeRow label="Self-Esteem"       val={duke.selfEsteem} lo={50} hi={100}/>
              <RangeRow label="Perceived Health"  val={duke.perceived}  lo={50} hi={100}/>
              <RangeRow label="Anxiety (↓ better)"val={duke.anxiety}    lo={0}  hi={30}/>
              <RangeRow label="Depression (↓ better)" val={duke.depression} lo={0} hi={30}/>
              <RangeRow label="Pain (↓ better)"  val={duke.pain}       lo={0}  hi={25}/>
              <RangeRow label="Disability (↓ better)" val={duke.disability} lo={0} hi={20}/>
            </tbody>
          </table>
          <div className="rounded-lg px-3 py-2 bg-green-50 text-xs text-green-900">
            <strong>Clinical Summary:</strong> {
              +duke.general>=70 ? "Health profile within normal parameters across functional domains. No significant health-related flag on DUKE-17." :
              +duke.general>=45 ? "Moderate health profile. One or more subscales are below normative range. Clinical attention to low-scoring domains is recommended." :
              "Significantly compromised health profile. Multiple subscales below normative range. Multidomain clinical evaluation and intervention planning is indicated."
            }
          </div>
          <p className="text-xs text-slate-400 mt-2 italic">
            Normative reference: General adult Indian population (adapted norms). Higher = better for all subscales except Anxiety, Depression, Pain, and Disability.
          </p>
        </div>
      </div>

      {/* ── D4: PHQ-9 ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#F59E0B08,white)"}}>
          <p className="text-xs font-black text-amber-700 uppercase tracking-wider">D4 · Depressive Symptomatology</p>
          <p className="text-xs text-slate-400">Patient Health Questionnaire-9 (PHQ-9; Kroenke & Spitzer, 2001)</p>
        </div>
        <div className="p-4">
          {/* Item-by-item table */}
          <table className="w-full mb-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">#</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5">Criterion (DSM-5)</th>
                <th className="text-left text-xs text-slate-400 font-medium pb-1.5 w-10">Score</th>
              </tr>
            </thead>
            <tbody>
              {PHQ9.map((text,i)=>{
                const v = responses.d4[i+1] ?? "—";
                const isCriterion = i<=1;
                const isRisk = i===8;
                return (
                  <tr key={i} style={{borderBottom:"1px solid #F8FAFC",
                    background: isRisk&&v>=1?"#FEF2F2": isCriterion&&v>=2?"#FFFBEB":"transparent"}}>
                    <td className="py-1.5 pr-2 text-xs text-slate-400">{i+1}</td>
                    <td className="py-1.5 pr-2 text-xs text-slate-700">
                      {text} {isRisk&&<span className="text-red-500 font-bold"> ⚠</span>}
                    </td>
                    <td className="py-1.5 text-sm font-black text-center"
                      style={{color:v>=2?"#DC2626":v>=1?"#D97706":"#374151"}}>{v}</td>
                  </tr>
                );
              })}
              <tr style={{borderTop:"2px solid #E2E8F0"}}>
                <td colSpan={2} className="py-2 text-sm font-black text-slate-700">Total Score</td>
                <td className="py-2 text-lg font-black text-center" style={{color:phqCl.color}}>{phqRaw}</td>
              </tr>
            </tbody>
          </table>
          {/* Severity band */}
          <div className="flex gap-1.5 mb-3">
            {[["≤4","Minimal","#10B981"],["5–9","Mild","#84CC16"],["10–14","Moderate","#F59E0B"],["15–19","Mod-Severe","#F97316"],["≥20","Severe","#EF4444"]].map(([range,label,c])=>{
              const ranges=[[0,4],[5,9],[10,14],[15,19],[20,27]];
              const isActive = ranges.some(([lo,hi],idx)=>phqRaw>=lo&&phqRaw<=hi&&["≤4","5–9","10–14","15–19","≥20"][idx]===range);
              return (
                <div key={range} className="flex-1 rounded-lg py-1.5 text-center border-2 transition-all"
                  style={{borderColor:isActive?c:c+"33",background:isActive?c+"22":"transparent"}}>
                  <p className="text-xs font-black" style={{color:isActive?c:"#94A3B8"}}>{range}</p>
                  <p className="text-xs font-medium" style={{color:isActive?c:"#CBD5E1"}}>{label}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg px-3 py-2 text-xs" style={{background:phqCl.color+"12",border:`1px solid ${phqCl.color}44`}}>
            <strong style={{color:phqCl.color}}>Clinical Interpretation:</strong>
            <span className="text-slate-700"> PHQ-9 total = {phqRaw}/27 → {phqCl.label} depressive symptomatology. </span>
            {phqRaw>=10&&<span className="text-red-700 font-semibold">Meets clinical threshold for Major Depressive Episode screening. Structured diagnostic interview (MINI/SCID) and treatment initiation to be considered. </span>}
            {responses.d4[9]>=1&&<span className="text-red-700 font-semibold">Item 9 (passive SI) positive — cross-reference with C-SSRS Level {cssCl.level} below.</span>}
          </div>
        </div>
      </div>

      {/* ── D5: Risk Profile ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100"
          style={{background:"linear-gradient(90deg,#EF444408,white)"}}>
          <p className="text-xs font-black text-red-700 uppercase tracking-wider">D5 · Risk Factor Profile</p>
          <p className="text-xs text-slate-400">C-SSRS Screen · AUDIT-C · SDQ Conduct Subscale</p>
        </div>
        <div className="p-4 space-y-4">

          {/* C-SSRS */}
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Suicidality — C-SSRS (Columbia, 2008)</p>
            <table className="w-full mb-2">
              <tbody>
                {CSSRS.map((q,i)=>{
                  const v = responses.d5[`css${i+1}`];
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
                  const v = responses.d5[`aud${i+1}`];
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
                  const v = responses.d5[`sdq${i+1}`];
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
            { label:"D1 Cognition",    val:`${ravensScore}/8 · ${ravensLabel}`, note:`CQ analog ~${ravensIQ}`, color:"#3B82F6" },
            { label:"D2 Personality",  val:`N=T${Math.round(50+(+bfi.N-3)*10)} · C=T${Math.round(50+(+bfi.C-3)*10)} · E=T${Math.round(50+(+bfi.E-3)*10)}`, note:bfiDSM()[0], color:"#8B5CF6" },
            { label:"D3 Health",       val:`General=${duke.general}/100`, note:`Phys=${duke.phys} · Mental=${duke.mental} · Social=${duke.social}`, color:"#10B981" },
            { label:"D4 Depression",   val:`PHQ-9 = ${phqRaw}/27`, note:phqCl.label, color:phqCl.color },
            { label:"D5 Risk",         val:`C-SSRS Lv${cssCl.level} · AUDIT-C ${audCl.score}`, note:cssCl.label+" | "+audCl.label, color:cssCl.level>=2?"#DC2626":audCl.score>=4?"#F97316":"#10B981" },
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
          DUKE-17 (Parkerson et al., 1990); PHQ-9 (Kroenke & Spitzer, 2001); C-SSRS (Posner et al., 2011);
          AUDIT-C (Bush et al., 1998); SDQ (Goodman, 1997).
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════ MAIN APP ════════════════════════════════════════

export default function CIBSValid() {
  const [screen, setScreen] = useState("welcome"); // welcome → eligibility → consent → assessment → demographics → report
  const [mode, setMode] = useState("self");
  const [responses, setResponses] = useState(null);
  const [demographics, setDemographics] = useState(null);

  const startFlow = (m) => { setMode(m); setScreen("eligibility"); };

  return (
    <div className="font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-mono { font-family: 'DM Mono', monospace; }
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
        }
        button:active { transform: scale(0.97); }
      `}</style>

      {screen==="welcome"     && <Welcome onSelf={()=>startFlow("self")} onClinician={()=>startFlow("assisted")}/>}
      {screen==="eligibility" && <Eligibility onResult={(r)=>{ setMode(r); setScreen("consent"); }}/>}
      {screen==="consent"     && <Consent mode={mode} onConsent={()=>setScreen("assessment")}/>}
      {screen==="assessment"  && <Assessment mode={mode} onComplete={(r)=>{ setResponses(r); setScreen("demographics"); }}/>}
      {screen==="demographics"&& <Demographics onComplete={(d)=>{ setDemographics(d); setScreen("report"); }}/>}
      {screen==="report"      && responses && demographics &&
        <Report responses={responses} demographics={demographics} mode={mode}/>}
    </div>
  );
}
