import { useState, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   PAPER LAYOUT LAB — v0.8
   
   PRINT ARCHITECTURE:
   - "screen-preview" class: visible on screen, hidden when printing
   - "print-layout" class: hidden on screen, visible when printing
   - Print layout has NO background, NO shadow, NO decoration
   - Only lines, content, and structure are printed
   - User prints on colored paper → paper IS the background
   
   In claude.ai sandbox: Cmd+P is blocked by sandbox security.
   Deploy to Vercel/GitHub Pages for native print to work.
   PNG fallback provided for sandbox preview.
   ═══════════════════════════════════════════════════════════════ */

const SD = {
  "A6 Bible": { w: 95, h: 171, label: "A6 Bible", bh: 155 },
  "A6 FC": { w: 105, h: 172, label: "A6 FC", bh: 155 },
  A7: { w: 80, h: 120, label: "A7", bh: 130 },
  M5: { w: 74, h: 105, label: "M5", bh: 115 },
  A9: { w: 60, h: 80, label: "A9", bh: 100 },
  Custom: { w: 100, h: 150, label: "FREE", bh: 140 },
};
const LSP = [6, 6.5, 7, 8];
const GSP = [2, 5];
const PTS = [{ id: "lined", n: "Lined", i: "═" }, { id: "grid", n: "Grid", i: "▦" }, { id: "dot", n: "Dot", i: "⠿" }];
const FTS = [
  { id: "caveat", n: "Handwritten", en: "'Caveat',cursive", zh: "'ZCOOL XiaoWei',serif", s: "Aa 手账" },
  { id: "serif", n: "Serif / 宋体", en: "'Playfair Display',serif", zh: "'Noto Serif SC',serif", s: "Aa 手账" },
  { id: "sans", n: "Sans / 文楷", en: "'Quicksand',sans-serif", zh: "'LXGW WenKai',cursive", s: "Aa 手账" },
  { id: "mono", n: "Typewriter", en: "'Special Elite',cursive", zh: "'LXGW WenKai Mono',monospace", s: "Aa 手账" },
];
const SCC = [{ n: "White", c: "#ffffff" }, { n: "Warm Gray", c: "#c4b8a8" }, { n: "Soft Blue", c: "#a8bcc4" }, { n: "Blush", c: "#c4a8b0" }, { n: "Sage", c: "#a8c4b0" }, { n: "Lavender", c: "#b0a8c4" }, { n: "Brown", c: "#bba88e" }, { n: "Coral", c: "#c4a8a8" }, { n: "Sky", c: "#a8c0d4" }];
const DCC = [{ n: "Black", c: "#2c2c2c" }, { n: "Dark Brown", c: "#5c4033" }, { n: "Navy", c: "#2c3e5a" }, { n: "Charcoal", c: "#4a4a4a" }, { n: "Forest", c: "#2d4a3e" }, { n: "Wine", c: "#5a2d3e" }];
const LYS = { A: { id: "A", n: "Photo + Notes", d: "Image + notes, adjustable" }, D: { id: "D", n: "Pure Ruled Page", d: "Full page lines/grid/dots" }, B: { id: "B", n: "Title + Two Columns", d: "Movable column divider" }, C: { id: "C", n: "Title + Checklist", d: "Adjustable checkboxes" } };
const FU = "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Playfair+Display:wght@400;600&family=Quicksand:wght@400;500;600&family=Special+Elite&family=Noto+Serif+SC:wght@300;400;600&family=ZCOOL+XiaoWei&family=LXGW+WenKai:wght@300;400;700&family=LXGW+WenKai+Mono&display=swap";

// ─── SVG Components ───
const BunnyPen = ({ size = 50 }) => (
  <svg width={size} height={size * 2.6} viewBox="0 0 50 130" fill="none">
    <path d="M16 22C16 22 14 6 17 3C20 0 22 2 22 5C22 8 21 22 21 22" stroke="#5c5047" strokeWidth="1.6" fill="#f5f0e8" strokeLinecap="round"/>
    <path d="M17 8C17.5 6 18.5 5 19 7C19 10 18.5 14 18 17" fill="#e8d4d0" opacity="0.35"/>
    <path d="M29 22C29 22 27 6 30 3C33 0 35 2 35 5C35 8 34 22 34 22" stroke="#5c5047" strokeWidth="1.6" fill="#f5f0e8" strokeLinecap="round"/>
    <path d="M30 8C30.5 6 31.5 5 32 7C32 10 31.5 14 31 17" fill="#e8d4d0" opacity="0.35"/>
    <rect x="10" y="18" width="30" height="30" rx="12" ry="13" fill="#f5f0e8" stroke="#5c5047" strokeWidth="1.6"/>
    <path d="M17 27Q19 25.5 22 26.5" stroke="#5c5047" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    <path d="M28 26.5Q31 25.5 33 27" stroke="#5c5047" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    <ellipse cx="21" cy="31" rx="2.5" ry="3" fill="#5c5047"/><ellipse cx="20.3" cy="29.6" rx="0.9" ry="1.1" fill="#f5f0e8"/>
    <ellipse cx="30" cy="31" rx="2.5" ry="3" fill="#5c5047"/><ellipse cx="29.3" cy="29.6" rx="0.9" ry="1.1" fill="#f5f0e8"/>
    <ellipse cx="25.5" cy="36" rx="2.8" ry="2" fill="#e8c4b8" opacity="0.5"/>
    <path d="M24 37Q25.5 38.5 27 37" stroke="#5c5047" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    <path d="M22 40Q25.5 43 29 40" stroke="#5c5047" strokeWidth="1" fill="none" strokeLinecap="round"/>
    <circle cx="21.5" cy="37.5" r="0.5" fill="#5c5047" opacity="0.3"/><circle cx="20" cy="38.5" r="0.5" fill="#5c5047" opacity="0.3"/>
    <circle cx="29.5" cy="37.5" r="0.5" fill="#5c5047" opacity="0.3"/><circle cx="31" cy="38.5" r="0.5" fill="#5c5047" opacity="0.3"/>
    <rect x="18" y="48" width="14" height="5" rx="2" fill="#c4b5a3" stroke="#5c5047" strokeWidth="1"/>
    <rect x="20" y="53" width="10" height="50" rx="4" fill="#5c5047" stroke="#3d342c" strokeWidth="0.8"/>
    <rect x="30" y="55" width="2.5" height="22" rx="1" fill="#8b7355"/><circle cx="31.2" cy="76" r="1.5" fill="#8b7355"/>
    <rect x="19.5" y="62" width="11" height="2" rx="1" fill="#c4b5a380"/>
    <path d="M20 103L22 115Q25 120 28 115L30 103" fill="#c4b5a3" stroke="#5c5047" strokeWidth="0.8"/>
    <path d="M23 115L25 125L27 115" fill="#3d342c"/>
  </svg>
);
const BunnyS = ({ s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <path d="M12 12C12 12 11 5 13 4C15 3 16 4 16 6C16 8 15 12 15 12" stroke="#5c5047" strokeWidth="1.2" fill="#f5f0e8" strokeLinecap="round"/>
    <path d="M20 12C20 12 19 5 21 4C23 3 24 4 24 6C24 8 23 12 23 12" stroke="#5c5047" strokeWidth="1.2" fill="#f5f0e8" strokeLinecap="round"/>
    <rect x="9" y="10" width="18" height="18" rx="7" ry="8" fill="#f5f0e8" stroke="#5c5047" strokeWidth="1.2"/>
    <circle cx="15" cy="18" r="1.5" fill="#5c5047"/><circle cx="21" cy="18" r="1.5" fill="#5c5047"/>
    <path d="M14.5 21Q18 24 21.5 21" stroke="#5c5047" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
  </svg>
);
const NB = ({ label, color, onClick, height }) => (
  <div onClick={onClick} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px) rotate(-1.5deg)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"} style={{ cursor: "pointer", transition: "transform .3s cubic-bezier(.34,1.56,.64,1)", marginLeft: "-3px" }}>
    <svg width="48" height={height} viewBox={`0 0 48 ${height}`} fill="none">
      <rect x="2" y="6" width="44" height={height - 12} rx="2.5" fill={color} stroke="#5c5047" strokeWidth="1.4"/>
      <line x1="7" y1="10" x2="7" y2={height - 10} stroke="#5c504760" strokeWidth=".7"/>
      <rect x="4" y="2" width="40" height="5" rx="1" fill="#f9f6f0" stroke="#5c504730" strokeWidth=".4"/>
      <text x="24" y={height / 2} textAnchor="middle" dominantBaseline="middle" fill="#5c5047" fontSize="13" fontFamily="'Caveat',cursive" fontWeight="700" transform={`rotate(-90,24,${height / 2})`} style={{ letterSpacing: "1px" }}>{label}</text>
    </svg>
  </div>
);
const DW = ({ onClick }) => (
  <div onClick={onClick} style={{ cursor: "pointer", marginLeft: "-2px" }}>
    <svg width="72" height="155" viewBox="0 0 72 155" fill="none">
      <rect x="3" y="3" width="66" height="149" rx="3" fill="#e8dfd4" stroke="#5c5047" strokeWidth="1.4"/>
      <rect x="8" y="8" width="56" height="42" rx="2" fill="#f0e9df" stroke="#5c504770" strokeWidth=".8"/>
      <ellipse cx="36" cy="29" rx="5" ry="3.5" fill="none" stroke="#c4786e" strokeWidth="1.2"/>
      <rect x="8" y="54" width="56" height="42" rx="2" fill="#f0e9df" stroke="#5c504770" strokeWidth=".8"/>
      <circle cx="36" cy="75" r="4" fill="none" stroke="#8baa8e" strokeWidth="1.2"/>
      <rect x="8" y="100" width="56" height="42" rx="2" fill="#f0e9df" stroke="#5c504770" strokeWidth=".8"/>
      <rect x="31" y="118" width="10" height="7" rx="1.5" fill="none" stroke="#9ab0c4" strokeWidth="1.2"/>
    </svg>
  </div>
);

// ─── UI Helpers ───
const Pnl = ({ children, mb = "10px" }) => <div style={{ background: "#faf7f2", border: "1px solid #e8dfd4", borderRadius: "12px", padding: "13px 15px", marginBottom: mb }}>{children}</div>;
const Sld = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#9a8e80", marginBottom: "4px" }}><span>{label}</span><span style={{ color: "#5c5047", fontWeight: 600 }}>{value}{unit}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#5c5047" }} />
  </div>
);
const Clr = ({ value, onChange }) => {
  const [pk, setPk] = useState(false);
  return (
    <div>
      <div style={{ fontSize: "14px", color: "#9a8e80", marginBottom: "6px" }}>Line Color</div>
      <div style={{ fontSize: "10px", color: "#b8a995", marginBottom: "4px" }}>SOFT</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "6px" }}>
        {SCC.map(p => <button key={p.c} onClick={() => onChange(p.c)} title={p.n} style={{ width: "26px", height: "26px", borderRadius: "50%", background: p.c, cursor: "pointer", padding: 0, border: value === p.c ? "3px solid #5c5047" : p.c === "#ffffff" ? "1.5px solid #ccc" : "1.5px solid #e8dfd4", boxShadow: value === p.c ? "0 0 0 2px #f9f6f0" : "none" }} />)}
      </div>
      <div style={{ fontSize: "10px", color: "#b8a995", marginBottom: "4px" }}>DARK</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
        {DCC.map(p => <button key={p.c} onClick={() => onChange(p.c)} title={p.n} style={{ width: "26px", height: "26px", borderRadius: "50%", background: p.c, cursor: "pointer", padding: 0, border: value === p.c ? "3px solid #5c5047" : "1.5px solid #999", boxShadow: value === p.c ? "0 0 0 2px #f9f6f0" : "none" }} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ position: "relative" }}>
          <div onClick={() => setPk(!pk)} style={{ width: "30px", height: "30px", borderRadius: "7px", background: value, border: "2px solid #5c5047", cursor: "pointer" }} />
          {pk && <div style={{ position: "absolute", top: "36px", left: 0, zIndex: 30, background: "#faf7f2", border: "1px solid #e8dfd4", borderRadius: "8px", padding: "10px", boxShadow: "0 4px 16px #5c504720" }}>
            <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: "120px", height: "90px", border: "none", cursor: "pointer", background: "none" }} />
            <div onClick={() => setPk(false)} style={{ textAlign: "center", fontSize: "14px", color: "#5c5047", cursor: "pointer", marginTop: "5px", fontFamily: "'Caveat',cursive" }}>done ✓</div>
          </div>}
        </div>
        <span style={{ fontSize: "13px", color: "#9a8e80", fontFamily: "monospace" }}>custom</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE SVG COMPONENT
   
   Two modes controlled by `forPrint` prop:
   - forPrint=false (screen): has #faf7f2 paper background
   - forPrint=true (print): TRANSPARENT background, no fill rect
   
   Lines use mm-based spacing: lineSpacing(mm) × scale = pixels
   Scale = 3.5 px/mm for screen, giving accurate mm representation
   ═══════════════════════════════════════════════════════════════ */
const Page = ({ sz, ly, lsp, ttl, sub, img, lc, pt, fid, phr, ckc, mh, mv, cs, colBlank = false, forPrint = false, lineOp = 1, dotSize = 1 }) => {
  const si = SD[sz];
  const scale = 3.5; // px per mm
  const pw = si.w * scale, ph = si.h * scale;
  const ls = lsp * scale; // line spacing in px
  const xl = mh * scale, xr = mh * scale, yt = mv * scale, yb = mv * scale;
  const f = FTS.find(x => x.id === fid) || FTS[0];
  const tf = `${f.zh},${f.en}`;
  const ct = yt, cb = ph - yb;

  // Pattern renderer — integer keys, no filter
  const pat = (sy, ey, sx = xl, ex = pw - xr, p = "") => {
    const r = [];
    let i = 0;
    if (pt === "lined") {
      for (let y = sy; y <= ey; y += ls) r.push(<line key={p + "L" + i++} x1={sx} y1={y} x2={ex} y2={y} stroke={lc} strokeWidth="1.2" opacity={lineOp}/>);
    } else if (pt === "grid") {
      const cols = Math.round((ex - sx) / ls);
      const rows = Math.round((ey - sy) / ls);
      const aR = sx + cols * ls;
      const aB = sy + rows * ls;
      for (let row = 0; row <= rows; row++) {
        const y = sy + row * ls;
        r.push(<line key={p + "H" + i++} x1={sx} y1={y} x2={aR} y2={y} stroke={lc} strokeWidth="0.8" opacity={lineOp}/>);
      }
      let j = 0;
      for (let col = 0; col <= cols; col++) {
        const x = sx + col * ls;
        r.push(<line key={p + "V" + j++} x1={x} y1={sy} x2={x} y2={aB} stroke={lc} strokeWidth="0.8" opacity={lineOp}/>);
      }
    } else {
      const cols = Math.round((ex - sx) / ls);
      const rows = Math.round((ey - sy) / ls);
      for (let row = 0; row <= rows; row++)
        for (let col = 0; col <= cols; col++)
          r.push(<circle key={p + "D" + i++} cx={sx + col * ls} cy={sy + row * ls} r={dotSize} fill={lc} opacity={lineOp}/>);
    }
    return r;
  };

  let content;
  if (ly === "A") {
    const ih = (cb - ct) * phr / 100, ns = ct + ih + 14;
    content = <>
      <rect x={xl} y={ct} width={pw - xl - xr} height={ih} fill="none" stroke={lc} strokeWidth="1" strokeDasharray="5 4" rx="3"/>
      {img && !forPrint && <image href={img} x={xl} y={ct} width={pw - xl - xr} height={ih} preserveAspectRatio="xMidYMid slice"/>}
      {img && forPrint && <image href={img} x={xl} y={ct} width={pw - xl - xr} height={ih} preserveAspectRatio="xMidYMid slice"/>}
      {!img && !forPrint && <text x={pw / 2} y={ct + ih / 2 + 5} textAnchor="middle" fill="#b8a995" fontSize="18" fontFamily={tf}>📷 add image</text>}
      {ttl && <text x={xl} y={ns + 4} fill={forPrint ? lc : "#5c5047"} fontSize="20" fontFamily={tf} fontWeight="600">{ttl}</text>}
      {pat(ns + 20, cb, xl, pw - xr, "A")}
    </>;
  } else if (ly === "D") {
    const ls2 = ttl ? ct + 34 : ct;
    content = <>
      {ttl && <text x={xl} y={ct + 22} fill={forPrint ? lc : "#5c5047"} fontSize="20" fontFamily={tf} fontWeight="600">{ttl}</text>}
      {pat(ls2, cb, xl, pw - xr, "D")}
    </>;
  } else if (ly === "B") {
    const ty = ct + 24, ls2 = ttl ? ty + 16 : ct, dv = xl + (pw - xl - xr) * cs / 100, g = 6;
    content = <>
      {ttl && <text x={pw / 2} y={ty} textAnchor="middle" fill={forPrint ? lc : "#5c5047"} fontSize="20" fontFamily={tf} fontWeight="600">{ttl}</text>}
      <line x1={dv} y1={ls2} x2={dv} y2={cb} stroke={lc} strokeWidth="1"/>
      {!colBlank && pat(ls2 + 8, cb, xl, dv - g, "BL")}
      {!colBlank && pat(ls2 + 8, cb, dv + g, pw - xr, "BR")}
    </>;
  } else {
    const ty = ct + 24, cs2 = ty + (sub ? 34 : 16), av = cb - cs2, sp = av / ckc;
    content = <>
      {ttl && <text x={xl} y={ty} fill={forPrint ? lc : "#5c5047"} fontSize="20" fontFamily={tf} fontWeight="600">{ttl}</text>}
      {sub && <text x={xl} y={ty + 18} fill={forPrint ? lc : "#9a8e80"} fontSize="14" fontFamily={tf}>{sub}</text>}
      {Array.from({ length: ckc }, (_, i) => { const y = cs2 + i * sp; return <g key={"CK" + i}><rect x={xl} y={y + 2} width="12" height="12" rx="2.5" fill="none" stroke={lc} strokeWidth="1"/><line x1={xl + 20} y1={y + 14} x2={pw - xr} y2={y + 14} stroke={lc} strokeWidth=".7"/></g>; })}
    </>;
  }

  return (
    <svg width={pw} height={ph} viewBox={`0 0 ${pw} ${ph}`} xmlns="http://www.w3.org/2000/svg"
      style={{ background: forPrint ? "transparent" : "#faf7f2" }}>
      {/* Screen mode: paper background. Print mode: NO background */}
      {!forPrint && <rect width={pw} height={ph} fill="#faf7f2"/>}
      {content}
    </svg>
  );
};

// ─── Main App ───
export default function App() {
  const [v, setV] = useState("desk");
  const [sz, setSz] = useState(null);
  const [ly, setLy] = useState("A");
  const [lsp, setLsp] = useState(7);
  const [pt, setPt] = useState("lined");
  const [lc, setLc] = useState("#c4b8a8");
  const [fid, setFid] = useState("caveat");
  const [ttl, setTtl] = useState("");
  const [sub, setSub] = useState("");
  const [img, setImg] = useState(null);
  const [drw, setDrw] = useState(false);
  const [cw, setCw] = useState(100);
  const [ch, setCh] = useState(150);
  const [shC, setShC] = useState(false);
  const [phr, setPhr] = useState(35);
  const [ckc, setCkc] = useState(12);
  const [mh, setMh] = useState(8);
  const [mv, setMv] = useState(8);
  const [cs, setCs] = useState(50);
  const [colBlank, setColBlank] = useState(false);
  const [lineOp, setLineOp] = useState(1);
  const [dotSize, setDotSize] = useState(1);
  const [expImg, setExpImg] = useState(null);
  const svgRef = useRef(null);
  const fiRef = useRef(null);

  const cSp = pt === "lined" ? LSP : GSP;
  const hPt = p => { setPt(p); if (p === "lined" && ![6, 6.5, 7, 8].includes(lsp)) setLsp(7); if (p !== "lined" && ![2, 5].includes(lsp)) setLsp(5); };
  const hSz = s => { if (s === "Custom") { setShC(true); return; } setSz(s); setV("editor"); setTtl(""); setSub(""); setImg(null); setExpImg(null); };
  const hCC = () => { SD.Custom.w = parseInt(cw) || 100; SD.Custom.h = parseInt(ch) || 150; setSz("Custom"); setShC(false); setV("editor"); };
  const hImg = e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImg(ev.target.result); r.readAsDataURL(f); } };

  const pp = { sz, ly, lsp, ttl, sub, img, lc, pt, fid, phr, ckc, mh, mv, cs, colBlank, lineOp, dotSize };

  // PNG export with transparent background
  const doExportPNG = () => {
    const el = svgRef.current?.querySelector("svg");
    if (!el) return;
    const str = new XMLSerializer().serializeToString(el);
    const si = SD[sz];
    const sc = 3.5;
    const c = document.createElement("canvas");
    c.width = si.w * sc * 3; c.height = si.h * sc * 3;
    const ctx = c.getContext("2d");
    ctx.scale(3, 3);
    const im = new Image();
    im.onload = () => {
      // Transparent background for print-on-colored-paper use
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(im, 0, 0, si.w * sc, si.h * sc);
      setExpImg(c.toDataURL("image/png"));
    };
    im.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(str)));
  };

  // Print: use window.print() — works when deployed, shows instruction in sandbox
  const doPrint = () => {
    try { window.print(); } catch(e) {}
    // If print didn't trigger (sandbox), show fallback message
    setExpImg("PRINT_HINT");
  };

  // ═══ DESK VIEW ═══
  if (v === "desk") {
    const ks = ["A6 Bible", "A6 FC", "A7", "M5", "A9", "Custom"];
    const cl = ["#e8dfd4", "#d4c8b8", "#d4cce0", "#c9d4c8", "#ddd0c4", "#ddd4c4"];
    return (
      <div className="screen-preview" style={{ minHeight: "100vh", background: "linear-gradient(180deg,#f5f0e8,#ede6da)", fontFamily: "'Caveat',cursive", overflow: "hidden" }}>
        <link href={FU} rel="stylesheet"/>
        <style>{printCSS}</style>
        <div style={{ textAlign: "center", padding: "30px 20px 6px" }}>
          <h1 style={{ fontSize: "38px", color: "#5c5047", fontWeight: 700, margin: 0, letterSpacing: "2px" }}>Paper Layout Lab</h1>
          <p style={{ fontSize: "18px", color: "#9a8e80", margin: "6px 0 0" }}>your little printable page studio</p>
          <p style={{ fontSize: "15px", color: "#b8a995", margin: "10px auto 0", maxWidth: "440px", lineHeight: 1.5 }}>Pick a notebook → choose a layout → customize lines, colors & fonts → print or export</p>
        </div>
        <div style={{ maxWidth: "720px", margin: "20px auto 0", padding: "0 16px" }}>
          <div style={{
            background: `repeating-linear-gradient(90deg,transparent,transparent 50px,#c4b49912 50px,#c4b49912 51px),linear-gradient(160deg,#d4c4af,#c9b99e 50%,#bfaf94)`,
            borderRadius: "14px 14px 0 0", border: "1.5px solid #b0a08a", borderBottom: "none",
            padding: "30px 24px 34px", position: "relative", minHeight: "200px",
            boxShadow: "inset 0 2px 8px #fff3,0 4px 20px #5c504720",
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "14px", marginBottom: "-2px" }}>
                <div style={{ background: "#f9f6f0", border: "1.5px solid #5c5047", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", fontSize: "17px", fontWeight: 600, color: "#5c5047", maxWidth: "155px", lineHeight: 1.3, boxShadow: "2px 2px 0 #5c504710", marginBottom: "6px" }}>
                  Welcome! ✦<br/><span style={{ fontSize: "14px", fontWeight: 400, color: "#9a8e80" }}>Pick a notebook to start</span>
                </div>
                <BunnyPen size={44} />
              </div>
              {ks.map((k, i) => <NB key={k} label={SD[k].label} color={cl[i]} height={SD[k].bh} onClick={() => hSz(k)} />)}
              <div style={{ position: "relative" }}>
                <DW onClick={() => setDrw(!drw)} />
                {drw && <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", background: "#f9f6f0", border: "1.5px solid #5c5047", borderRadius: "10px", padding: "10px 14px", fontSize: "15px", color: "#5c5047", whiteSpace: "nowrap", boxShadow: "0 4px 12px #5c504715", zIndex: 10 }}>✦ To be continued... ✦<div style={{ fontSize: "12px", color: "#9a8e80", marginTop: "3px" }}>tapes, stickers & prompts</div></div>}
              </div>
            </div>
          </div>
          <div style={{ background: "linear-gradient(180deg,#b8a88e,#a89878)", borderRadius: "0 0 14px 14px", border: "1.5px solid #a09080", borderTop: "none", height: "18px", boxShadow: "0 4px 12px #5c504720" }}/>
          <div style={{ height: "18px", margin: "0 20px", background: "radial-gradient(ellipse at center,#5c504712,transparent 70%)", borderRadius: "50%" }}/>
        </div>
        {shC && <div style={{ position: "fixed", inset: 0, background: "#5c504740", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShC(false)}>
          <div style={{ background: "#faf7f2", borderRadius: "16px", padding: "24px 28px", border: "1.5px solid #5c5047", minWidth: "240px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 14px", color: "#5c5047", fontSize: "22px" }}>Custom Size</h3>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {[["W", cw, setCw], ["H", ch, setCh]].map(([l, v, s]) => <div key={l}><label style={{ fontSize: "14px", color: "#9a8e80" }}>{l} (mm)</label><input type="number" value={v} onChange={e => s(e.target.value)} style={{ display: "block", width: "70px", padding: "6px 8px", border: "1px solid #c4b8a8", borderRadius: "6px", background: "#f9f6f0", fontFamily: "'Caveat',cursive", fontSize: "16px", color: "#5c5047", marginTop: "4px", outline: "none" }}/></div>)}
            </div>
            <button onClick={hCC} style={{ background: "#5c5047", color: "#f9f6f0", border: "none", borderRadius: "8px", padding: "8px 20px", fontFamily: "'Caveat',cursive", fontSize: "17px", cursor: "pointer", width: "100%" }}>Open notebook →</button>
          </div>
        </div>}
        <div style={{ textAlign: "center", padding: "18px", fontSize: "12px", color: "#b8a99550" }}>Paper Layout Lab · v0.8</div>
      </div>
    );
  }

  // ═══ EDITOR VIEW ═══
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#f5f0e8,#ede6da)", fontFamily: "'Caveat',cursive" }}>
      <link href={FU} rel="stylesheet"/>
      <style>{printCSS}</style>

      {/* ══ PRINT LAYOUT — hidden on screen, shown when printing ══ */}
      <div className="print-layout">
        <Page {...pp} forPrint={true} />
      </div>

      {/* ══ SCREEN PREVIEW — shown on screen, hidden when printing ══ */}
      <div className="screen-preview">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid #e8dfd4", background: "#faf7f2ee", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 20, flexWrap: "wrap", gap: "8px" }}>
          <button onClick={() => { setV("desk"); setExpImg(null); }} style={{ background: "none", border: "1px solid #c4b8a8", borderRadius: "8px", padding: "5px 14px", fontFamily: "'Caveat',cursive", fontSize: "16px", color: "#5c5047", cursor: "pointer" }}>← desk</button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><BunnyS s={26} /><span style={{ fontSize: "18px", color: "#5c5047", fontWeight: 600 }}>Paper Layout Lab</span></div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={doPrint} style={{ background: "#5c5047", color: "#f9f6f0", border: "none", borderRadius: "8px", padding: "6px 16px", fontFamily: "'Caveat',cursive", fontSize: "16px", cursor: "pointer" }}>🖨 Print</button>
            <button onClick={doExportPNG} style={{ background: "none", border: "1.5px solid #5c5047", borderRadius: "8px", padding: "6px 16px", fontFamily: "'Caveat',cursive", fontSize: "16px", color: "#5c5047", cursor: "pointer" }}>↓ Save PNG</button>
          </div>
        </div>

        <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto", padding: "14px", gap: "18px", flexWrap: "wrap", justifyContent: "center" }}>
          {/* Controls */}
          <div style={{ width: "250px", flexShrink: 0 }}>
            <Pnl><div style={{ fontSize: "13px", color: "#9a8e80" }}>Notebook</div><div style={{ fontSize: "22px", color: "#5c5047", fontWeight: 600 }}>{sz}</div><div style={{ fontSize: "14px", color: "#9a8e80" }}>{SD[sz]?.w} × {SD[sz]?.h} mm</div></Pnl>
            <Pnl>
              <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "5px" }}>Layout</div>
              {Object.values(LYS).map(l => <button key={l.id} onClick={() => setLy(l.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: "7px", cursor: "pointer", background: ly === l.id ? "#5c504712" : "transparent", border: ly === l.id ? "1.5px solid #5c5047" : "1px solid transparent", marginBottom: "3px", fontFamily: "'Caveat',cursive" }}>
                <div style={{ fontSize: "15px", color: "#5c5047", fontWeight: 600 }}>{l.n}</div><div style={{ fontSize: "12px", color: "#9a8e80" }}>{l.d}</div></button>)}
            </Pnl>
            {ly === "A" && <Pnl><Sld label="Photo area" value={phr} onChange={setPhr} min={10} max={75} unit="%" /></Pnl>}
            {ly === "C" && <Pnl><Sld label="Checkboxes" value={ckc} onChange={v => setCkc(Math.round(v))} min={3} max={30} /></Pnl>}
            {ly === "B" && <Pnl>
              <Sld label="Column split" value={cs} onChange={setCs} min={20} max={80} unit="%" />
              <div style={{ height: "8px" }}/>
              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => setColBlank(false)} style={{ flex: 1, padding: "6px 0", borderRadius: "7px", cursor: "pointer", background: !colBlank ? "#5c5047" : "transparent", color: !colBlank ? "#f9f6f0" : "#5c5047", border: !colBlank ? "none" : "1px solid #c4b8a8", fontFamily: "'Caveat',cursive", fontSize: "14px", fontWeight: 600 }}>With lines</button>
                <button onClick={() => setColBlank(true)} style={{ flex: 1, padding: "6px 0", borderRadius: "7px", cursor: "pointer", background: colBlank ? "#5c5047" : "transparent", color: colBlank ? "#f9f6f0" : "#5c5047", border: colBlank ? "none" : "1px solid #c4b8a8", fontFamily: "'Caveat',cursive", fontSize: "14px", fontWeight: 600 }}>Blank</button>
              </div>
            </Pnl>}
            <Pnl>
              <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "5px" }}>Paper Type</div>
              <div style={{ display: "flex", gap: "5px" }}>
                {PTS.map(p => <button key={p.id} onClick={() => hPt(p.id)} style={{ flex: 1, padding: "7px 0", borderRadius: "7px", cursor: "pointer", background: pt === p.id ? "#5c5047" : "transparent", color: pt === p.id ? "#f9f6f0" : "#5c5047", border: pt === p.id ? "none" : "1px solid #c4b8a8", fontFamily: "'Caveat',cursive", fontSize: "14px", fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}><span style={{ fontSize: "17px", lineHeight: 1 }}>{p.i}</span><span>{p.n}</span></button>)}
              </div>
            </Pnl>
            <Pnl>
              <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "5px" }}>Spacing</div>
              <div style={{ display: "flex", gap: "5px" }}>
                {cSp.map(s => <button key={s} onClick={() => setLsp(s)} style={{ flex: 1, padding: "7px 0", borderRadius: "7px", cursor: "pointer", background: lsp === s ? "#5c5047" : "transparent", color: lsp === s ? "#f9f6f0" : "#5c5047", border: lsp === s ? "none" : "1px solid #c4b8a8", fontFamily: "'Caveat',cursive", fontSize: "16px", fontWeight: 600 }}>{s}</button>)}
              </div>
              <div style={{ fontSize: "11px", color: "#b8a995", marginTop: "3px", textAlign: "center" }}>mm</div>
            </Pnl>
            <Pnl>
              <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "5px" }}>Margin</div>
              <Sld label="← → Left & Right" value={mh} onChange={setMh} min={2} max={20} unit="mm" />
              <div style={{ height: "8px" }}/>
              <Sld label="↑ ↓ Top & Bottom" value={mv} onChange={setMv} min={2} max={20} unit="mm" />
            </Pnl>
            <Pnl><Clr value={lc} onChange={setLc} /></Pnl>
            <Pnl>
              <Sld label="Line opacity" value={Math.round(lineOp * 100)} onChange={v => setLineOp(v / 100)} min={10} max={100} unit="%" />
              {pt === "dot" && <><div style={{ height: "8px" }}/><Sld label="Dot size" value={dotSize} onChange={setDotSize} min={0.5} max={2.5} step={0.1} unit="px" /></>}
            </Pnl>
            <Pnl>
              <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "5px" }}>Font</div>
              {FTS.map(f => <button key={f.id} onClick={() => setFid(f.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "6px 9px", borderRadius: "7px", cursor: "pointer", background: fid === f.id ? "#5c504712" : "transparent", border: fid === f.id ? "1.5px solid #5c5047" : "1px solid transparent", marginBottom: "3px" }}>
                <span style={{ fontSize: "14px", color: "#5c5047", fontFamily: "'Caveat',cursive" }}>{f.n}</span>
                <span style={{ fontSize: "15px", color: "#9a8e80", fontFamily: `${f.en},${f.zh}` }}>{f.s}</span></button>)}
            </Pnl>
            <Pnl mb="0">
              <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "5px" }}>Content</div>
              <input type="text" placeholder="Page title..." value={ttl} onChange={e => setTtl(e.target.value)} style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8dfd4", borderRadius: "6px", background: "#fff", fontFamily: "'Caveat',cursive", fontSize: "17px", color: "#5c5047", marginBottom: "5px", outline: "none", boxSizing: "border-box" }} />
              {ly === "C" && <input type="text" placeholder="Subtitle..." value={sub} onChange={e => setSub(e.target.value)} style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8dfd4", borderRadius: "6px", background: "#fff", fontFamily: "'Caveat',cursive", fontSize: "16px", color: "#5c5047", outline: "none", boxSizing: "border-box", marginBottom: "5px" }} />}
              {ly === "A" && <><input ref={fiRef} type="file" accept="image/*" style={{ display: "none" }} onChange={hImg}/><button onClick={() => fiRef.current?.click()} style={{ width: "100%", padding: "7px", border: "1px dashed #c4b8a8", borderRadius: "6px", background: img ? "#5c504710" : "transparent", fontFamily: "'Caveat',cursive", fontSize: "15px", color: "#5c5047", cursor: "pointer", boxSizing: "border-box" }}>{img ? "✓ change image" : "📷 Upload image"}</button></>}
            </Pnl>
          </div>

          {/* Preview + export area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: "320px" }}>
            <div style={{ fontSize: "13px", color: "#9a8e80", marginBottom: "10px" }}>{SD[sz]?.w}×{SD[sz]?.h}mm · {pt} · {lsp}mm · margin H{mh}/V{mv}mm</div>
            <div ref={svgRef} style={{ background: "#e8dfd420", padding: "18px", borderRadius: "8px", display: "inline-block", boxShadow: "0 2px 20px #5c504715" }}>
              {/* Screen preview with paper background */}
              <Page {...pp} forPrint={false} />
            </div>

            {/* Export / Print feedback */}
            {expImg && expImg === "PRINT_HINT" && (
              <div style={{ marginTop: "20px", textAlign: "center", background: "#faf7f2", border: "1px solid #e8dfd4", borderRadius: "12px", padding: "18px 24px", maxWidth: "400px" }}>
                <p style={{ fontSize: "18px", color: "#5c5047", margin: "0 0 8px", fontWeight: 600 }}>🖨 Print tip</p>
                <p style={{ fontSize: "14px", color: "#5c5047", margin: "0 0 6px", lineHeight: 1.5 }}>
                  在这个预览环境中 Cmd+P 可能不可用。<br/>
                  把项目部署到 Vercel 后，Print 按钮和 Cmd+P 都能正常工作。
                </p>
                <p style={{ fontSize: "14px", color: "#9a8e80", margin: "0 0 10px", lineHeight: 1.5 }}>
                  目前可以用 <strong>↓ Save PNG</strong> 导出透明背景的图片，然后打印该图片。
                </p>
                <button onClick={() => setExpImg(null)} style={{ background: "none", border: "1px solid #c4b8a8", borderRadius: "7px", padding: "5px 16px", fontFamily: "'Caveat',cursive", fontSize: "15px", color: "#9a8e80", cursor: "pointer" }}>got it ✓</button>
              </div>
            )}

            {expImg && expImg !== "PRINT_HINT" && (
              <div style={{ marginTop: "20px", textAlign: "center", background: "#faf7f2", border: "1px solid #e8dfd4", borderRadius: "12px", padding: "18px 24px" }}>
                <p style={{ fontSize: "18px", color: "#5c5047", margin: "0 0 4px", fontWeight: 600 }}>✓ PNG Ready (transparent background)</p>
                <p style={{ fontSize: "14px", color: "#9a8e80", margin: "0 0 12px" }}>Right-click → Save image / 右键 → 存储图像</p>
                <div style={{ background: "repeating-conic-gradient(#e8dfd4 0% 25%, #f5f0e8 0% 50%) 50%/16px 16px", padding: "8px", borderRadius: "4px", display: "inline-block" }}>
                  <img src={expImg} alt="export" style={{ maxWidth: "280px", display: "block" }} />
                </div>
                <br/><button onClick={() => setExpImg(null)} style={{ marginTop: "10px", background: "none", border: "1px solid #c4b8a8", borderRadius: "7px", padding: "5px 16px", fontFamily: "'Caveat',cursive", fontSize: "15px", color: "#9a8e80", cursor: "pointer" }}>dismiss</button>
              </div>
            )}

            <div style={{ marginTop: "12px", fontSize: "12px", color: "#b8a99540" }}>Paper Layout Lab · v0.8</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRINT CSS
   
   When printing (@media print):
   - .screen-preview is HIDDEN (all UI, controls, desk, decorations)
   - .print-layout is SHOWN (just the SVG with transparent bg)
   - No background colors printed
   - No shadows, no decorations
   - Only lines, text, and structure
   
   This means: user prints on colored paper → paper is the background
   ═══════════════════════════════════════════════════════════════ */
const printCSS = `
  .print-layout {
    display: none;
  }

  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
    }

    .screen-preview {
      display: none !important;
    }

    .print-layout {
      display: flex !important;
      justify-content: center;
      align-items: flex-start;
      padding: 0;
      margin: 0;
      background: transparent !important;
    }

    .print-layout svg {
      background: transparent !important;
      box-shadow: none !important;
    }

    @page {
      margin: 5mm;
      size: auto;
    }
  }
`;
