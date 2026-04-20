// bridge-ui.jsx — Bridge Design System
// Shared components exported to window for all screen files

const { useState, useEffect } = React;

// ── Tokens ─────────────────────────────────────────────────────
const Bridge = {
  accent:   'oklch(52% 0.18 270)',
  accentBg: 'oklch(96.5% 0.03 270)',
  accentDk: 'oklch(40% 0.22 270)',
  green:    'oklch(51% 0.17 145)',
  greenBg:  'oklch(96.5% 0.04 145)',
  amber:    'oklch(62% 0.16 76)',
  amberBg:  'oklch(96.5% 0.05 76)',
  red:      'oklch(52% 0.18 25)',
  redBg:    'oklch(97% 0.03 25)',
  text:     '#0d0f14',
  sub:      '#5a5f72',
  muted:    '#9197ab',
  divider:  'rgba(0,0,0,0.07)',
  card:     '#ffffff',
  bg:       '#f4f5f9',
  border:   'rgba(0,0,0,0.08)',
  sidebar:  '#160f2e',
  sidebarH: 'rgba(255,255,255,0.10)',
};

// ── Logo ───────────────────────────────────────────────────────
const BridgeLogo = ({ size = 36, light = false }) => {
  const c  = light ? '#ffffff' : Bridge.accent;
  const cs = light ? 'rgba(255,255,255,0.55)' : Bridge.accent;
  return (
    <svg width={size} height={Math.round(size * 0.62)} viewBox="0 0 60 37" fill="none">
      <path d="M2 31h56" stroke={c} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M10 31V19" stroke={c} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M50 31V19" stroke={c} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M10 19C10 19 18 7 30 7C42 7 50 19 50 19" stroke={c} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <line x1="20" y1="31" x2="20" y2="21" stroke={cs} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="30" y1="31" x2="30" y2="15" stroke={cs} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="40" y1="31" x2="40" y2="21" stroke={cs} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
};

// ── iOS Status Bar ─────────────────────────────────────────────
const IOSStatusBar = ({ dark = false }) => {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 26px 0', boxSizing:'border-box', width:'100%', position:'relative', zIndex:20 }}>
      <span style={{ fontFamily:'-apple-system,system-ui', fontWeight:600, fontSize:15, color:c, letterSpacing:-0.3 }}>9:41</span>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <svg width="17" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="5" width="3" height="7" rx="0.6" fill={c}/><rect x="9" y="2.5" width="3" height="9.5" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="12" rx="0.6" fill={c}/></svg>
        <svg width="16" height="12" viewBox="0 0 17 12"><path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c}/><path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c}/><circle cx="8.5" cy="10.5" r="1.5" fill={c}/></svg>
        <svg width="25" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none"/><rect x="2" y="2" width="19" height="9" rx="2" fill={c}/><path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
};

// ── iOS Device ─────────────────────────────────────────────────
const IOSDevice = ({ children, dark = false, width = 390, height = 844 }) => (
  <div style={{ width, height, borderRadius:50, overflow:'hidden', position:'relative', background: dark ? '#1c1c1e' : '#f2f2f7', boxShadow:'0 40px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.14)', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", WebkitFontSmoothing:'antialiased', display:'flex', flexDirection:'column' }}>
    <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)', width:120, height:34, borderRadius:20, background:'#000', zIndex:50, pointerEvents:'none' }}/>
    <IOSStatusBar dark={dark} />
    <div style={{ flex:1, overflow:'auto', marginTop:4 }}>{children}</div>
    <div style={{ height:34, display:'flex', justifyContent:'center', alignItems:'flex-end', paddingBottom:8, flexShrink:0 }}>
      <div style={{ width:134, height:5, borderRadius:100, background: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.2)' }}/>
    </div>
  </div>
);

// ── iOS Hero ───────────────────────────────────────────────────
const IosHero = ({ icon, title, subtitle, compact = false }) => (
  <div style={{ background:`linear-gradient(150deg, oklch(52% 0.18 270) 0%, oklch(43% 0.22 285) 100%)`, padding: compact ? '44px 24px 28px' : '52px 24px 32px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
    {icon && (
      <div style={{ width:72, height:72, borderRadius:22, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, boxShadow:'inset 0 1px 1px rgba(255,255,255,0.3)', color:'#fff' }}>
        {icon}
      </div>
    )}
    <h1 style={{ fontSize: compact ? 20 : 22, fontWeight:700, color:'#fff', lineHeight:1.25, marginBottom:10, letterSpacing:-0.4 }}>{title}</h1>
    {subtitle && <p style={{ fontSize:13.5, color:'rgba(255,255,255,0.75)', lineHeight:1.55, maxWidth:290 }}>{subtitle}</p>}
  </div>
);

// ── iOS Wave + Scroll Body ─────────────────────────────────────
const IosBody = ({ children }) => (
  <>
    <div style={{ marginTop:-1 }}>
      <svg viewBox="0 0 390 24" fill="none" style={{ display:'block', width:'100%' }}>
        <path d="M0 0C100 24 290 24 390 0V24H0V0Z" fill={Bridge.bg}/>
      </svg>
    </div>
    <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:12, paddingBottom:28 }}>
      {children}
    </div>
  </>
);

// ── Button ─────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', onClick, full = false, small = false, disabled = false }) => {
  const [pressed, setPressed] = useState(false);
  const base = { width: full ? '100%' : undefined, height: small ? 42 : 52, borderRadius: small ? 11 : 14, border:'none', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize: small ? 13.5 : 15, fontWeight:600, transition:'all 0.1s', transform: pressed ? 'scale(0.97)' : 'scale(1)', opacity: disabled ? 0.45 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:6 };
  const styles = {
    primary: { ...base, background: Bridge.accent, color:'#fff', boxShadow:`0 4px 18px oklch(52% 0.18 270 / 0.28)` },
    secondary: { ...base, background:'transparent', color: Bridge.sub, border:`1.5px solid ${Bridge.border}` },
    ghost: { ...base, background:'transparent', color: Bridge.accent, border:`1.5px solid ${Bridge.accent}` },
    danger: { ...base, background: Bridge.red, color:'#fff' },
    success: { ...base, background: Bridge.green, color:'#fff' },
  };
  return (
    <button style={styles[variant] || styles.primary} onClick={onClick} disabled={disabled}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}>
      {children}
    </button>
  );
};

// ── Card ───────────────────────────────────────────────────────
const Card = ({ children, style = {}, p = '4px 16px' }) => (
  <div style={{ background: Bridge.card, borderRadius:18, padding:p, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', ...style }}>
    {children}
  </div>
);

// ── Section Label ──────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:600, color: Bridge.muted, letterSpacing:'0.07em', textTransform:'uppercase', padding:'14px 0 6px' }}>
    {children}
  </div>
);

// ── Row ────────────────────────────────────────────────────────
const Row = ({ children, style = {} }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:`1px solid ${Bridge.divider}`, ...style }}>
    {children}
  </div>
);

// ── Hardship Badge ─────────────────────────────────────────────
const HARDSHIP = {
  SEVERE:   { bg: Bridge.redBg,   color: Bridge.red,   dot:'#d94' },
  MODERATE: { bg: Bridge.amberBg, color: Bridge.amber, dot:'#ca6' },
  LOW:      { bg: Bridge.greenBg, color: Bridge.green, dot:'#5a8' },
  NONE:     { bg:'#f0f0f4',       color: Bridge.muted, dot:'#aaa' },
};
const HardshipBadge = ({ level = 'NONE', large = false }) => {
  const cfg = HARDSHIP[level] || HARDSHIP.NONE;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, background: cfg.bg, color: cfg.color, borderRadius:100, padding: large ? '7px 16px' : '4px 12px', fontSize: large ? 13 : 11.5, fontWeight:700, letterSpacing:0.3 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background: cfg.color, flexShrink:0 }}/>
      {level.charAt(0)+level.slice(1).toLowerCase()} Hardship
    </span>
  );
};

// ── Sustainability Badge ────────────────────────────────────────
const SUST = {
  HIGH:   { bg: Bridge.greenBg, color: Bridge.green },
  MEDIUM: { bg: Bridge.amberBg, color: Bridge.amber },
  LOW:    { bg: Bridge.redBg,   color: Bridge.red },
};
const SustBadge = ({ level = 'HIGH' }) => {
  const cfg = SUST[level] || SUST.HIGH;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background: cfg.bg, color: cfg.color, borderRadius:100, padding:'4px 10px', fontSize:11.5, fontWeight:700 }}>
      {level} sustainability
    </span>
  );
};

// ── Check / X Rows ─────────────────────────────────────────────
const CheckRow = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${Bridge.divider}` }}>
    <span style={{ width:20, height:20, borderRadius:'50%', background: Bridge.greenBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke={Bridge.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
    <span style={{ fontSize:13.5, color: Bridge.text }}>{text}</span>
  </div>
);
const XRow = ({ text }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${Bridge.divider}` }}>
    <span style={{ width:20, height:20, borderRadius:'50%', background: Bridge.redBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke={Bridge.red} strokeWidth="1.6" strokeLinecap="round"/></svg>
    </span>
    <span style={{ fontSize:13.5, color: Bridge.text }}>{text}</span>
  </div>
);

// ── Progress Bar ───────────────────────────────────────────────
const ProgressBar = ({ value = 0, max = 100, color, height = 8 }) => {
  const pct = Math.min(100, (value / max) * 100);
  const barColor = color || (pct > 66 ? Bridge.red : pct > 33 ? Bridge.amber : Bridge.green);
  return (
    <div style={{ height, borderRadius:100, background:'rgba(0,0,0,0.08)', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background: barColor, borderRadius:100, transition:'width 0.5s' }}/>
    </div>
  );
};

// ── Admin Icon Set ─────────────────────────────────────────────
const AdminIcons = {
  queue: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="2" width="16" height="3" rx="1.5" fill={c}/><rect x="1" y="7.5" width="16" height="3" rx="1.5" fill={c}/><rect x="1" y="13" width="10" height="3" rx="1.5" fill={c}/></svg>,
  cases: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="13" rx="2.5" stroke={c} strokeWidth="1.6" fill="none"/><path d="M6 4V3a3 3 0 016 0v1" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><line x1="5" y1="9" x2="13" y2="9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><line x1="5" y1="12.5" x2="10" y2="12.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  performance: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 14l4-4 3 3 4-6 3 3" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  compliance: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L3 5v5c0 3.3 2.7 6.4 6 7 3.3-.6 6-3.7 6-7V5L9 2z" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round"/><path d="M6 9l2 2 4-4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  policy: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.6"/><path d="M9 6v4l2.5 2.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  executive: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="10" width="4" height="7" rx="1" fill={c}/><rect x="7" y="6" width="4" height="11" rx="1" fill={c}/><rect x="13" y="2" width="4" height="15" rx="1" fill={c}/></svg>,
};

const ADMIN_NAV = [
  { id:'queue',       label:'Queue',       icon: AdminIcons.queue },
  { id:'cases',       label:'Cases',       icon: AdminIcons.cases },
  { id:'performance', label:'Performance', icon: AdminIcons.performance },
  { id:'compliance',  label:'Compliance',  icon: AdminIcons.compliance },
  { id:'executive',   label:'Executive',   icon: AdminIcons.executive },
  { id:'policy',      label:'Policy',      icon: AdminIcons.policy },
];

// ── Admin Layout ───────────────────────────────────────────────
const AdminLayout = ({ children, active = 'cases', title = '', subtitle = '' }) => (
  <div style={{ display:'flex', height:'100vh', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", WebkitFontSmoothing:'antialiased', background: Bridge.bg }}>
    {/* Sidebar */}
    <div style={{ width:220, background: Bridge.sidebar, display:'flex', flexDirection:'column', flexShrink:0, padding:'28px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 20px 28px' }}>
        <BridgeLogo size={30} light />
        <span style={{ fontSize:18, fontWeight:700, color:'#fff', letterSpacing:-0.4 }}>Bridge</span>
      </div>
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2, padding:'0 10px' }}>
        {ADMIN_NAV.map(item => {
          const isActive = item.id === active;
          return (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background: isActive ? Bridge.sidebarH : 'transparent', cursor:'pointer', transition:'background 0.15s' }}>
              {item.icon(isActive ? '#fff' : 'rgba(255,255,255,0.45)')}
              <span style={{ fontSize:13.5, fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
              {item.id === 'queue' && <span style={{ marginLeft:'auto', background: Bridge.red, color:'#fff', borderRadius:100, padding:'1px 7px', fontSize:11, fontWeight:700 }}>8</span>}
            </div>
          );
        })}
      </nav>
      <div style={{ padding:'0 20px', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background: Bridge.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>JW</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Jane Williams</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Case Officer</div>
          </div>
        </div>
      </div>
    </div>

    {/* Main */}
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Topbar */}
      <div style={{ height:60, background:'#fff', borderBottom:`1px solid ${Bridge.border}`, display:'flex', alignItems:'center', padding:'0 32px', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color: Bridge.text, letterSpacing:-0.3 }}>{title}</div>
          {subtitle && <div style={{ fontSize:12, color: Bridge.muted, marginTop:1 }}>{subtitle}</div>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:12.5, color: Bridge.muted }}>April 20, 2026</div>
          <div style={{ width:1, height:20, background: Bridge.border }}/>
          <div style={{ width:32, height:32, borderRadius:'50%', background: Bridge.accentBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color: Bridge.accent }}>JW</div>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex:1, overflow:'auto', padding:28 }}>
        {children}
      </div>
    </div>
  </div>
);

// ── Admin Stat Card ────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:4 }}>
    {icon && <div style={{ marginBottom:6 }}>{icon}</div>}
    <div style={{ fontSize:28, fontWeight:700, color: color || Bridge.text, letterSpacing:-0.8 }}>{value}</div>
    <div style={{ fontSize:13, fontWeight:600, color: Bridge.text }}>{label}</div>
    {sub && <div style={{ fontSize:12, color: Bridge.muted, marginTop:2 }}>{sub}</div>}
  </div>
);

// ── Data Table ─────────────────────────────────────────────────
const Table = ({ cols, rows }) => (
  <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
    <div style={{ display:'grid', gridTemplateColumns: cols.map(c => c.w || '1fr').join(' '), background: Bridge.bg, padding:'10px 20px', gap:16, borderBottom:`1px solid ${Bridge.border}` }}>
      {cols.map(c => <div key={c.key} style={{ fontSize:11.5, fontWeight:600, color: Bridge.muted, textTransform:'uppercase', letterSpacing:'0.05em' }}>{c.label}</div>)}
    </div>
    {rows.map((row, i) => (
      <div key={i} style={{ display:'grid', gridTemplateColumns: cols.map(c => c.w || '1fr').join(' '), padding:'13px 20px', gap:16, borderBottom: i < rows.length-1 ? `1px solid ${Bridge.divider}` : 'none', alignItems:'center' }}>
        {cols.map(c => <div key={c.key} style={{ fontSize:13.5, color: c.muted ? Bridge.sub : Bridge.text }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</div>)}
      </div>
    ))}
  </div>
);

// ── Tabs ───────────────────────────────────────────────────────
const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display:'flex', gap:0, borderBottom:`2px solid ${Bridge.border}`, marginBottom:20 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ padding:'10px 18px', fontSize:13.5, fontWeight: active===t.id ? 600 : 400, color: active===t.id ? Bridge.accent : Bridge.sub, background:'none', border:'none', cursor:'pointer', borderBottom: active===t.id ? `2px solid ${Bridge.accent}` : '2px solid transparent', marginBottom:-2, transition:'all 0.15s', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {t.label}
      </button>
    ))}
  </div>
);

// ── Admin Section Header ───────────────────────────────────────
const AdminSection = ({ title, children, action }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <h3 style={{ fontSize:15, fontWeight:700, color: Bridge.text, margin:0 }}>{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Customer Web Layout ────────────────────────────────────────
const CustomerLayout = ({ children, step, totalSteps, title, subtitle, back }) => (
  <div style={{ minHeight:'100vh', background: Bridge.bg, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", WebkitFontSmoothing:'antialiased' }}>
    <header style={{ height:60, background:'#fff', borderBottom:`1px solid ${Bridge.border}`, display:'flex', alignItems:'center', padding:'0 40px', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <BridgeLogo size={26} />
        <span style={{ fontSize:17, fontWeight:700, color: Bridge.text, letterSpacing:-0.4 }}>Bridge</span>
        <span style={{ fontSize:12, color: Bridge.muted, marginLeft:4, padding:'2px 8px', background: Bridge.accentBg, color: Bridge.accent, borderRadius:100, fontWeight:600 }}>Customer Portal</span>
      </div>
      {step && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {Array.from({ length: totalSteps || step }).map((_, i) => (
            <div key={i} style={{ width: i < step ? 24 : 8, height:6, borderRadius:100, background: i < step ? Bridge.accent : Bridge.border, transition:'all 0.3s' }}/>
          ))}
          <span style={{ fontSize:12.5, color: Bridge.muted, marginLeft:4 }}>Step {step}{totalSteps ? ` of ${totalSteps}` : ''}</span>
        </div>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:13.5, color: Bridge.sub }}>Sarah Mitchell</span>
        <div style={{ width:34, height:34, borderRadius:'50%', background: Bridge.accentBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color: Bridge.accent }}>SM</div>
      </div>
    </header>
    <main style={{ maxWidth:840, margin:'0 auto', padding:'40px 32px 60px' }}>
      {back && <button onClick={back} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color: Bridge.sub, cursor:'pointer', fontSize:13.5, fontWeight:500, marginBottom:20, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:0 }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Back</button>}
      {title && <div style={{ marginBottom:28 }}><h1 style={{ fontSize:26, fontWeight:800, color: Bridge.text, letterSpacing:-0.6, marginBottom:6 }}>{title}</h1>{subtitle && <p style={{ fontSize:14.5, color: Bridge.sub, lineHeight:1.55 }}>{subtitle}</p>}</div>}
      {children}
    </main>
  </div>
);

// ── Web Hero Banner ────────────────────────────────────────────
const WebHero = ({ title, subtitle, icon, children }) => (
  <div style={{ background:`linear-gradient(135deg, oklch(52% 0.18 270) 0%, oklch(43% 0.22 285) 100%)`, borderRadius:20, padding:'36px 40px', marginBottom:24, color:'#fff', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', right:-20, top:-20, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
    <div style={{ position:'absolute', right:60, bottom:-40, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
    <div style={{ position:'relative' }}>
      {icon && <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>}
      <h2 style={{ fontSize:24, fontWeight:800, letterSpacing:-0.5, marginBottom:8 }}>{title}</h2>
      {subtitle && <p style={{ fontSize:14, color:'rgba(255,255,255,0.78)', lineHeight:1.55, maxWidth:500 }}>{subtitle}</p>}
      {children}
    </div>
  </div>
);

// ── Exports ────────────────────────────────────────────────────
Object.assign(window, {
  Bridge, BridgeLogo, IOSStatusBar, IOSDevice,
  IosHero, IosBody,
  Btn, Card, SectionLabel, Row, ProgressBar,
  HardshipBadge, SustBadge, CheckRow, XRow,
  CustomerLayout, WebHero,
  AdminLayout, StatCard, Table, Tabs, AdminSection,
});
