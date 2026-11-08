// Renders docs/ERD.png from design/src/erd-data.js (same layout as the Figma ERD page).
// Usage: node docs/src/erd-render.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ERD, ERD_LAYOUT: L, erdLayout } = require('../../design/src/erd-data.js');

const lay = erdLayout();
const TOP = 120;
const W = lay.width, H = lay.height + TOP;
const short = t => (t.length > 14 ? t.replace(/\(.*\)/, '(...)') : t);
const tag = k => {
  if (!k) return '';
  const cls = k === 'PK' ? 'pk' : k.startsWith('FK') ? 'fk' : 'uk';
  return `<span class="tag ${cls}">${k.replace(', ', '/')}</span>`;
};

let lines = '', chips = '';
lay.lines.forEach(ln => {
  const pts = ln.pts.map(p => `${p[0]},${p[1] + TOP}`).join(' ');
  lines += `<polyline points="${pts}" />`;
  chips += `<div class="card" style="left:${ln.ta[0]}px;top:${ln.ta[1] + TOP}px">${ln.rel.ca}</div>`;
  chips += `<div class="card" style="left:${ln.tb[0]}px;top:${ln.tb[1] + TOP}px">${ln.rel.cb}</div>`;
  const centered = ln.rel.kind !== 'v';
  chips += `<div class="rel${centered ? ' c' : ''}" style="left:${ln.tl[0]}px;top:${ln.tl[1] + TOP}px">${ln.rel.label}</div>`;
});

const boxes = ERD.entities.map(e => {
  const p = lay.pos[e.id];
  const rows = e.attrs.map((a, i) =>
    `<div class="row${i % 2 ? ' alt' : ''}"><span class="key">${tag(a[2])}</span><span class="name${a[2] === 'PK' ? ' b' : ''}">${a[0]}</span><span class="type">${short(a[1])}</span></div>`).join('');
  return `<div class="ent" style="left:${p.x}px;top:${p.y + TOP}px;width:${p.w}px;height:${p.h}px"><div class="head">${e.id}</div>${rows}</div>`;
}).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;background:#fff;font-family:Inter,"Segoe UI",Arial,sans-serif;position:relative;color:#0F172A}
h1{position:absolute;left:${L.margin}px;top:36px;font-size:30px;letter-spacing:-.5px}
p.sub{position:absolute;left:${L.margin}px;top:80px;font-size:15px;color:#64748B}
svg{position:absolute;left:0;top:0}
polyline{fill:none;stroke:#94A3B8;stroke-width:2;stroke-linejoin:round}
.ent{position:absolute;border:1px solid #E6E8F0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.06)}
.head{height:${L.headH}px;line-height:${L.headH}px;padding:0 16px;color:#fff;font-weight:700;font-size:14px;letter-spacing:.6px;background:linear-gradient(90deg,#4F46E5,#9333EA)}
.row{height:${L.rowH}px;display:flex;align-items:center;gap:8px;padding:0 14px;font-size:13px}
.row.alt{background:#F7F8FC}
.key{width:50px;flex:none}.name{width:150px;flex:none;font-weight:500}.name.b{font-weight:700}
.type{flex:1;text-align:right;white-space:nowrap;font-size:11px;color:#64748B}
.tag{font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px}
.pk{background:#FEF3C7;color:#B45309}.fk{background:#EEF2FF;color:#4338CA}.uk{background:#EEF1F6;color:#475569}
.card{position:absolute;background:#4F46E5;color:#fff;font-weight:700;font-size:12px;padding:2px 8px;border-radius:6px}
.rel{position:absolute;background:#F1F3F9;color:#64748B;font-size:12px;font-weight:500;padding:3px 8px;border-radius:6px;white-space:nowrap}
.rel.c{transform:translateX(-50%)}
</style></head><body>
<h1>OrderHub - Entity Relationship Diagram</h1>
<p class="sub">9 entities  ·  PK = primary key, FK = foreign key, UK = unique  ·  1 / N / 0..1 = cardinality</p>
<svg width="${W}" height="${H}">${lines}</svg>${boxes}${chips}
</body></html>`;

const outDir = path.join(__dirname, '..');
const htmlPath = path.join(outDir, 'src', 'erd.html');
fs.writeFileSync(htmlPath, html);
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2',
  `--window-size=${W},${H}`, `--screenshot=${path.join(outDir, 'ERD.png')}`, 'file:///' + htmlPath.replace(/\\/g, '/')], { stdio: 'ignore' });
console.log('ERD.png', W, H);
