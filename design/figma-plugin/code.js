// ============================================================
// OrderHub - logical data model (ERD)
// Shared by the Figma plugin, the ERD image and the SRS.
// Each attribute: [name, type, key]  key: PK | FK | UK | "FK, UK" | ""
// ============================================================

var ERD = {
  entities: [
    { id: 'USERS', col: 0, row: 0, desc: 'Login accounts for administrators and employees.',
      attrs: [
        ['user_id', 'INT', 'PK'],
        ['full_name', 'VARCHAR(100)', ''],
        ['username', 'VARCHAR(50)', 'UK'],
        ['email', 'VARCHAR(120)', 'UK'],
        ['password_hash', 'VARCHAR(255)', ''],
        ['role', 'ENUM(admin, employee)', ''],
        ['phone', 'VARCHAR(20)', ''],
        ['is_active', 'BOOLEAN', ''],
        ['created_at', 'DATETIME', '']
      ] },
    { id: 'EMPLOYEES', col: 1, row: 0, desc: 'Employee profile linked one-to-one with a user account.',
      attrs: [
        ['employee_id', 'INT', 'PK'],
        ['user_id', 'INT', 'FK, UK'],
        ['cnic', 'VARCHAR(15)', 'UK'],
        ['commission_rate', 'DECIMAL(5,2)', ''],
        ['joining_date', 'DATE', ''],
        ['status', 'ENUM(active, inactive)', '']
      ] },
    { id: 'COMMISSIONS', col: 2, row: 0, desc: 'Monthly commission record per employee.',
      attrs: [
        ['commission_id', 'INT', 'PK'],
        ['employee_id', 'INT', 'FK'],
        ['period_month', 'CHAR(7)', ''],
        ['approved_orders', 'INT', ''],
        ['total_sales', 'DECIMAL(12,2)', ''],
        ['rate', 'DECIMAL(5,2)', ''],
        ['commission_amount', 'DECIMAL(12,2)', ''],
        ['payout_status', 'ENUM(unpaid, paid)', ''],
        ['paid_on', 'DATE', '']
      ] },
    { id: 'ORDER_APPROVALS', col: 0, row: 1, desc: 'Approve / reject decisions taken by an administrator.',
      attrs: [
        ['approval_id', 'INT', 'PK'],
        ['order_id', 'INT', 'FK'],
        ['admin_id', 'INT', 'FK'],
        ['decision', 'ENUM(approved, rejected)', ''],
        ['remarks', 'VARCHAR(255)', ''],
        ['decided_at', 'DATETIME', '']
      ] },
    { id: 'ORDERS', col: 1, row: 1, desc: 'Customer order recorded by an employee.',
      attrs: [
        ['order_id', 'INT', 'PK'],
        ['order_code', 'VARCHAR(12)', 'UK'],
        ['customer_id', 'INT', 'FK'],
        ['employee_id', 'INT', 'FK'],
        ['order_date', 'DATETIME', ''],
        ['description', 'TEXT', ''],
        ['total_amount', 'DECIMAL(12,2)', ''],
        ['payment_method', 'ENUM(cod, partial, full)', ''],
        ['status', 'ENUM(pending, approved, rejected)', ''],
        ['updated_at', 'DATETIME', '']
      ] },
    { id: 'CUSTOMERS', col: 2, row: 1, desc: 'People who place orders.',
      attrs: [
        ['customer_id', 'INT', 'PK'],
        ['full_name', 'VARCHAR(100)', ''],
        ['contact_number', 'VARCHAR(20)', ''],
        ['whatsapp_number', 'VARCHAR(20)', ''],
        ['address', 'VARCHAR(255)', ''],
        ['city', 'VARCHAR(60)', ''],
        ['created_at', 'DATETIME', '']
      ] },
    { id: 'PAYMENTS', col: 0, row: 2, desc: 'Money received against an order, with receipt.',
      attrs: [
        ['payment_id', 'INT', 'PK'],
        ['order_id', 'INT', 'FK'],
        ['amount_received', 'DECIMAL(12,2)', ''],
        ['payment_date', 'DATETIME', ''],
        ['receipt_path', 'VARCHAR(255)', ''],
        ['transaction_ref', 'VARCHAR(50)', ''],
        ['verification', 'ENUM(unverified, verified, rejected)', ''],
        ['verified_by', 'INT', 'FK']
      ] },
    { id: 'ORDER_ITEMS', col: 1, row: 2, desc: 'Line items that make up an order.',
      attrs: [
        ['item_id', 'INT', 'PK'],
        ['order_id', 'INT', 'FK'],
        ['item_name', 'VARCHAR(120)', ''],
        ['quantity', 'INT', ''],
        ['unit_price', 'DECIMAL(10,2)', ''],
        ['line_total', 'DECIMAL(12,2)', '']
      ] },
    { id: 'DISPATCHES', col: 2, row: 2, desc: 'Courier and tracking details for an approved order.',
      attrs: [
        ['dispatch_id', 'INT', 'PK'],
        ['order_id', 'INT', 'FK, UK'],
        ['courier_name', 'VARCHAR(60)', ''],
        ['tracking_number', 'VARCHAR(30)', 'UK'],
        ['dispatch_date', 'DATE', ''],
        ['delivery_status', 'ENUM(ready, dispatched, delivered, returned)', '']
      ] }
  ],
  // a is always the left / upper entity. ca, cb = cardinality at a's end and b's end.
  rels: [
    { a: 'USERS', b: 'EMPLOYEES', ca: '1', cb: '1', label: 'has profile', kind: 'h' },
    { a: 'EMPLOYEES', b: 'COMMISSIONS', ca: '1', cb: 'N', label: 'earns', kind: 'h' },
    { a: 'USERS', b: 'ORDER_APPROVALS', ca: '1', cb: 'N', label: 'decides (admin)', kind: 'v' },
    { a: 'EMPLOYEES', b: 'ORDERS', ca: '1', cb: 'N', label: 'creates', kind: 'v' },
    { a: 'ORDER_APPROVALS', b: 'ORDERS', ca: 'N', cb: '1', label: 'reviews', kind: 'h' },
    { a: 'ORDERS', b: 'CUSTOMERS', ca: 'N', cb: '1', label: 'placed by', kind: 'h' },
    { a: 'ORDERS', b: 'PAYMENTS', ca: '1', cb: 'N', label: 'paid via', kind: 'elbowL' },
    { a: 'ORDERS', b: 'ORDER_ITEMS', ca: '1', cb: 'N', label: 'contains', kind: 'v' },
    { a: 'ORDERS', b: 'DISPATCHES', ca: '1', cb: '0..1', label: 'shipped as', kind: 'elbowR' }
  ]
};

// Layout constants shared by every renderer so the diagrams match.
var ERD_LAYOUT = { boxW: 340, colGap: 190, headH: 46, rowH: 28, padB: 10, rowGap: [150, 170], margin: 60 };

function erdLayout() {
  var L = ERD_LAYOUT, pos = {}, rowMax = [0, 0, 0];
  ERD.entities.forEach(function (e) {
    var h = L.headH + e.attrs.length * L.rowH + L.padB;
    rowMax[e.row] = Math.max(rowMax[e.row], h);
    pos[e.id] = { w: L.boxW, h: h };
  });
  var rowY = [L.margin, 0, 0];
  rowY[1] = rowY[0] + rowMax[0] + L.rowGap[0];
  rowY[2] = rowY[1] + rowMax[1] + L.rowGap[1];
  ERD.entities.forEach(function (e) {
    var p = pos[e.id];
    p.x = L.margin + e.col * (L.boxW + L.colGap);
    p.y = rowY[e.row];
    p.cx = p.x + p.w / 2;
    p.bottom = p.y + p.h;
  });
  var lines = ERD.rels.map(function (r) {
    var A = pos[r.a], B = pos[r.b], pts, ta, tb, tl;
    if (r.kind === 'h') {
      var y = A.y + L.headH + L.rowH * 1.5;
      pts = [[A.x + A.w, y], [B.x, y]];
      ta = [A.x + A.w + 10, y - 24]; tb = [B.x - 34, y - 24];
      tl = [(A.x + A.w + B.x) / 2, y + 8];
    } else if (r.kind === 'v') {
      pts = [[A.cx, A.bottom], [A.cx, B.y]];
      ta = [A.cx + 10, A.bottom + 6]; tb = [A.cx + 10, B.y - 26];
      tl = [A.cx + 12, (A.bottom + B.y) / 2 - 10];
    } else {
      var sx = r.kind === 'elbowL' ? A.x + 60 : A.x + A.w - 60;
      var midY = B.y - 64;
      pts = [[sx, A.bottom], [sx, midY], [B.cx, midY], [B.cx, B.y]];
      ta = [sx + 10, A.bottom + 6]; tb = [B.cx + 10, B.y - 26];
      tl = [(sx + B.cx) / 2, midY - 30];
    }
    return { rel: r, pts: pts, ta: ta, tb: tb, tl: tl };
  });
  var width = L.margin * 2 + 3 * L.boxW + 2 * L.colGap;
  var height = rowY[2] + rowMax[2] + L.margin;
  return { pos: pos, lines: lines, width: width, height: height };
}


// ============================================================
// OrderHub - Figma design generator
// Web Engineering semester capstone (Order Management System)
//
// Builds, inside the open Figma file:
//   Cover  ·  Design System  ·  3 themed versions of all 8 screens
//   (wired as a clickable prototype)  ·  Sitemap & ERD
// ============================================================

var W = 1440, SIDEBAR = 264, PAD = 32;
var CONTENT_W = W - SIDEBAR - PAD * 2; // 1112
var SIDE_COL = 360, GAP = 24;

// ---------- Themes ----------
var LIGHT_STATUS = {
  success: { fg: '#047857', bg: '#D1FAE5', solid: '#10B981' },
  warning: { fg: '#B45309', bg: '#FEF3C7', solid: '#F59E0B' },
  danger: { fg: '#B91C1C', bg: '#FEE2E2', solid: '#EF4444' },
  neutral: { fg: '#475569', bg: '#EEF1F6', solid: '#94A3B8' }
};

var THEMES = [
  {
    key: 'indigo', letter: 'A', name: 'Indigo Aurora', recommended: true,
    mood: 'Confident modern-SaaS look: deep indigo sidebar, indigo-to-violet gradient accents, clean white cards.',
    dark: false,
    primary: '#4F46E5', primaryHover: '#4338CA', primarySoft: '#EEF2FF', onPrimary: '#FFFFFF',
    grad: ['#4F46E5', '#9333EA'], accent: '#EC4899',
    bg: '#F5F6FB', surface: '#FFFFFF', surfaceAlt: '#F7F8FC', inputBg: '#FFFFFF',
    border: '#E6E8F0', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8',
    sidebar: '#1E1B4B', sidebarBorder: null, sideText: '#C7D2FE', sideHeading: '#818CF8',
    activeBg: '#4F46E5', activeText: '#FFFFFF', brandText: '#FFFFFF', userCard: '#2A2766',
    chart: ['#4F46E5', '#A855F7', '#EC4899'],
    info: { fg: '#4338CA', bg: '#EEF2FF', solid: '#4F46E5' }
  },
  {
    key: 'emerald', letter: 'B', name: 'Emerald Fresh',
    mood: 'Fresh and calm: airy white sidebar, emerald-to-sky gradient, warm amber highlights. Feels trustworthy for money & payments.',
    dark: false,
    primary: '#059669', primaryHover: '#047857', primarySoft: '#E7F8F1', onPrimary: '#FFFFFF',
    grad: ['#10B981', '#0EA5E9'], accent: '#F59E0B',
    bg: '#F2F7F5', surface: '#FFFFFF', surfaceAlt: '#F5FAF8', inputBg: '#FFFFFF',
    border: '#E0EAE5', text: '#0B1F1A', muted: '#5B6B66', subtle: '#94A3A0',
    sidebar: '#FFFFFF', sidebarBorder: '#E0EAE5', sideText: '#475569', sideHeading: '#94A3A0',
    activeBg: '#E7F8F1', activeText: '#047857', brandText: '#0B1F1A', userCard: '#F2F7F5',
    chart: ['#059669', '#0EA5E9', '#F59E0B'],
    info: { fg: '#0369A1', bg: '#E0F2FE', solid: '#0EA5E9' }
  },
  {
    key: 'midnight', letter: 'C', name: 'Midnight Neon',
    mood: 'Bold dark mode: deep navy surfaces with neon cyan-to-violet accents. Striking for a capstone demo / presentation.',
    dark: true,
    primary: '#22D3EE', primaryHover: '#06B6D4', primarySoft: '#0E2A35', onPrimary: '#04141B',
    grad: ['#06B6D4', '#8B5CF6'], accent: '#A78BFA',
    bg: '#0B0F1A', surface: '#121829', surfaceAlt: '#171E33', inputBg: '#0F1525',
    border: '#252D47', text: '#E8EBF5', muted: '#8B93B0', subtle: '#5D6584',
    sidebar: '#0E1322', sidebarBorder: '#1C2338', sideText: '#8B93B0', sideHeading: '#4B5372',
    activeBg: '#12303B', activeText: '#22D3EE', brandText: '#FFFFFF', userCard: '#151C30',
    chart: ['#22D3EE', '#8B5CF6', '#F472B6'],
    info: { fg: '#67E8F9', bg: '#0E2A35', solid: '#22D3EE' },
    status: {
      success: { fg: '#6EE7B7', bg: '#0F2E26', solid: '#34D399' },
      warning: { fg: '#FCD34D', bg: '#33280C', solid: '#FBBF24' },
      danger: { fg: '#FCA5A5', bg: '#3B1519', solid: '#F87171' },
      neutral: { fg: '#A3ABC6', bg: '#1C2338', solid: '#5D6584' }
    }
  }
];
THEMES.forEach(function (t) {
  if (!t.status) t.status = JSON.parse(JSON.stringify(LIGHT_STATUS));
  t.status.info = t.info;
  t.status.primary = { fg: t.dark ? t.primary : t.primaryHover, bg: t.primarySoft, solid: t.primary };
  t.label = 'Option ' + t.letter + ' - ' + t.name;
});

var AVATAR_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9', '#8B5CF6', '#EF4444', '#14B8A6'];

var STATUS_TONE = {
  Pending: 'warning', Approved: 'success', Rejected: 'danger', Paid: 'success', Partial: 'warning',
  COD: 'info', Unpaid: 'warning', Dispatched: 'info', Delivered: 'success', Ready: 'neutral',
  Uploaded: 'success', 'Not required': 'neutral', Verified: 'success', Processing: 'warning'
};

// ---------- Icons (24px line icons) ----------
var ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  plusCircle: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h6v4H9zM9 11h6M9 15h4"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M6 6l9-3 1 3"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  xCircle: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  truck: '<path d="M2 6h11v10H2zM13 9h4.5L21 12.5V16h-8"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 8M22 21v-1a6 6 0 0 0-4-5.6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  coins: '<circle cx="12" cy="12" r="9"/><path d="M15 9.2c-.6-.8-1.7-1.2-3-1.2-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.4-.4-3-1.2M12 6v2M12 16v2"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  filter: '<path d="M3 5h18l-7 8.5V20l-4-2v-4.5z"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  barChart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15v4M17 17h4"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  moreH: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};

// ============================================================
// Low-level helpers
// ============================================================
var FONT = {};

async function loadFonts() {
  var want = {
    regular: ['Regular'], medium: ['Medium', 'Regular'], semibold: ['Semi Bold', 'SemiBold', 'Bold'],
    bold: ['Bold', 'Semi Bold'], black: ['Extra Bold', 'ExtraBold', 'Black', 'Bold']
  };
  var families = ['Inter', 'Roboto', 'Arial'];
  for (var fi = 0; fi < families.length; fi++) {
    var fam = families[fi], got = {};
    for (var k in want) {
      for (var si = 0; si < want[k].length; si++) {
        try {
          await figma.loadFontAsync({ family: fam, style: want[k][si] });
          got[k] = { family: fam, style: want[k][si] };
          break;
        } catch (e) { /* try next style */ }
      }
    }
    if (got.regular) {
      for (var k2 in want) if (!got[k2]) got[k2] = got.bold || got.regular;
      FONT = got;
      return fam;
    }
  }
  throw new Error('Could not load the Inter font (or Roboto/Arial fallback).');
}

function rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
  return { r: parseInt(h.substr(0, 2), 16) / 255, g: parseInt(h.substr(2, 2), 16) / 255, b: parseInt(h.substr(4, 2), 16) / 255 };
}
function rgba(h, a) { var c = rgb(h); c.a = a; return c; }
function solid(h, op) { return [{ type: 'SOLID', color: rgb(h), opacity: op == null ? 1 : op }]; }
function grad(c1, c2, dir) {
  var m = dir === 'h' ? [[1, 0, 0], [0, 1, 0]]
    : dir === 'v' ? [[0, 1, 0], [-1, 0, 1]]
    : [[0.5, 0.5, 0], [-0.5, 0.5, 0.5]];
  return [{ type: 'GRADIENT_LINEAR', gradientTransform: m,
    gradientStops: [{ position: 0, color: rgba(c1, 1) }, { position: 1, color: rgba(c2, 1) }] }];
}
function dropShadow(hex, a, y, r, spread) {
  return { type: 'DROP_SHADOW', color: rgba(hex, a), offset: { x: 0, y: y }, radius: r, spread: spread || 0, visible: true, blendMode: 'NORMAL' };
}
function cardShadow(th) {
  return th.dark ? [dropShadow('#000000', 0.35, 8, 24)] : [dropShadow('#0F172A', 0.04, 1, 2), dropShadow('#0F172A', 0.05, 8, 24)];
}
function glow(th) { return [dropShadow(th.primary, th.dark ? 0.35 : 0.28, 6, 16)]; }

// Sizing that can only be applied after a node sits inside an auto-layout parent.
var LATE = {};
function later(node, o) { LATE[node.id] = o; return node; }
function put(parent) {
  for (var i = 1; i < arguments.length; i++) {
    var k = arguments[i];
    if (!k) continue;
    parent.appendChild(k);
    var o = LATE[k.id];
    if (o) {
      delete LATE[k.id];
      var auto = parent.layoutMode && parent.layoutMode !== 'NONE';
      if (o.abs) {
        if (auto) k.layoutPositioning = 'ABSOLUTE';
        k.x = o.abs[0]; k.y = o.abs[1];
      }
      if (auto) {
        if (o.fillW) {
          if (k.type === 'TEXT') k.textAutoResize = 'HEIGHT';
          k.layoutSizingHorizontal = 'FILL';
        }
        if (o.fillH) k.layoutSizingVertical = 'FILL';
        if (o.grow) k.layoutGrow = 1;
      }
    }
  }
  return parent;
}

// Frame (optionally auto-layout).  o: dir 'h'|'v', gap, pad, w, h, r, fill, fills, op,
// stroke, sw, sides{t,r,b,l}, dash, shadow, align, justify, fillW, fillH, grow, abs, clip, minH
function box(name, o) {
  o = o || {};
  var f = figma.createFrame();
  f.name = name;
  f.clipsContent = !!o.clip;
  f.fills = o.fills ? o.fills : (o.fill ? solid(o.fill, o.op) : []);
  if (o.dir) {
    f.layoutMode = o.dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
    f.itemSpacing = o.gap || 0;
    var p = o.pad == null ? 0 : o.pad;
    var P = Array.isArray(p) ? (p.length === 2 ? [p[0], p[1], p[0], p[1]] : p) : [p, p, p, p];
    f.paddingTop = P[0]; f.paddingRight = P[1]; f.paddingBottom = P[2]; f.paddingLeft = P[3];
    f.primaryAxisAlignItems = o.justify || 'MIN';
    f.counterAxisAlignItems = o.align || 'MIN';
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
  }
  if (o.w != null || o.h != null) {
    f.resize(o.w != null ? o.w : Math.max(f.width, 1), o.h != null ? o.h : Math.max(f.height, 1));
    if (o.dir) {
      var horiz = o.dir === 'h';
      if (o.w != null) { if (horiz) f.primaryAxisSizingMode = 'FIXED'; else f.counterAxisSizingMode = 'FIXED'; }
      if (o.h != null) { if (horiz) f.counterAxisSizingMode = 'FIXED'; else f.primaryAxisSizingMode = 'FIXED'; }
    }
  }
  if (o.r != null) f.cornerRadius = o.r;
  if (o.stroke) {
    f.strokes = solid(o.stroke, o.strokeOp);
    f.strokeWeight = o.sw || 1;
    f.strokeAlign = 'INSIDE';
    if (o.sides) {
      f.strokeTopWeight = o.sides.t || 0; f.strokeRightWeight = o.sides.r || 0;
      f.strokeBottomWeight = o.sides.b || 0; f.strokeLeftWeight = o.sides.l || 0;
    }
    if (o.dash) f.dashPattern = o.dash;
  }
  if (o.shadow) f.effects = o.shadow;
  if (o.minH) { try { f.minHeight = o.minH; } catch (e) { /* older API */ } }
  if (o.fillW || o.fillH || o.abs || o.grow) later(f, { fillW: o.fillW, fillH: o.fillH, abs: o.abs, grow: o.grow });
  return f;
}

function txt(s, size, weight, color, o) {
  o = o || {};
  var t = figma.createText();
  t.fontName = FONT[weight || 'regular'];
  t.characters = String(s);
  t.fontSize = size;
  t.fills = solid(color, o.op);
  if (o.lh) t.lineHeight = { value: o.lh, unit: 'PIXELS' };
  if (o.ls != null) t.letterSpacing = { value: o.ls, unit: 'PERCENT' };
  if (o.upper) t.textCase = 'UPPER';
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.under) t.textDecoration = 'UNDERLINE';
  if (o.w) { t.resize(o.w, t.height); t.textAutoResize = 'HEIGHT'; }
  t.name = o.name || String(s).slice(0, 40);
  if (o.fillW || o.abs) later(t, { fillW: o.fillW, abs: o.abs });
  return t;
}

function icon(name, color, size) {
  size = size || 20;
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color +
    '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
  var n = figma.createNodeFromSvg(svg);
  n.name = 'icon/' + name;
  n.fills = [];
  n.clipsContent = false;
  if (size !== 24) n.rescale(size / 24);
  return n;
}

function circle(d, color, o) {
  o = o || {};
  var e = figma.createEllipse();
  e.resize(d, d);
  e.fills = o.fills || solid(color, o.op);
  e.name = o.name || 'circle';
  if (o.stroke) { e.strokes = solid(o.stroke); e.strokeWeight = o.sw || 1; }
  if (o.abs) later(e, { abs: o.abs });
  return e;
}

function rect(w, h, color, o) {
  o = o || {};
  var r = figma.createRectangle();
  r.resize(Math.max(w, 0.01), Math.max(h, 0.01));
  r.fills = o.fills || solid(color, o.op);
  if (o.r != null) r.cornerRadius = o.r;
  r.name = o.name || 'rect';
  if (o.fillW) later(r, { fillW: true });
  return r;
}

function spacer(o) { return box('Spacer', { dir: 'v', w: (o && o.w) || 1, h: (o && o.h) || 1, grow: o && o.grow, fillW: o && o.fillW }); }

function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

// ============================================================
// Components
// ============================================================
function logoMark(th, size, onDark) {
  var b = box('Logo', { dir: 'h', w: size, h: size, r: size * 0.3, align: 'CENTER', justify: 'CENTER',
    fills: onDark ? solid('#FFFFFF', 0.18) : grad(th.grad[0], th.grad[1], 'diag'), shadow: onDark ? null : glow(th) });
  put(b, icon('package', '#FFFFFF', Math.round(size * 0.55)));
  return b;
}

function avatar(name, d) {
  var initials = name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
  var c = AVATAR_COLORS[hash(name) % AVATAR_COLORS.length];
  var a = box('Avatar/' + name, { dir: 'h', w: d, h: d, r: d / 2, fill: c, align: 'CENTER', justify: 'CENTER' });
  put(a, txt(initials, Math.round(d * 0.38), 'semibold', '#FFFFFF'));
  return a;
}

function pill(th, label, toneKey) {
  var s = th.status[toneKey || STATUS_TONE[label] || 'info'];
  var p = box('Badge/' + label, { dir: 'h', gap: 6, pad: [4, 10, 4, 8], r: 999, fill: s.bg, align: 'CENTER' });
  put(p, circle(6, s.solid, { name: 'dot' }), txt(label, 12, 'semibold', s.fg));
  return p;
}

function countChip(th, n, active) {
  var c = box('Count', { dir: 'h', pad: [1, 7], r: 999, fill: active ? th.primary : th.border, align: 'CENTER' });
  put(c, txt(n, 11, 'semibold', active ? th.onPrimary : th.muted));
  return c;
}

function button(th, label, kind, o) {
  o = o || {};
  var sm = o.size === 'sm';
  var K = {
    primary: { fill: th.primary, fg: th.onPrimary, shadow: glow(th) },
    gradient: { fills: grad(th.grad[0], th.grad[1], 'h'), fg: '#FFFFFF', shadow: glow(th) },
    secondary: { fill: th.surface, fg: th.text, stroke: th.border },
    soft: { fill: th.primarySoft, fg: th.status.primary.fg },
    success: { fill: th.status.success.solid, fg: th.dark ? '#04140E' : '#FFFFFF' },
    successSoft: { fill: th.status.success.bg, fg: th.status.success.fg },
    danger: { fill: th.status.danger.solid, fg: th.dark ? '#1A0507' : '#FFFFFF' },
    dangerSoft: { fill: th.status.danger.bg, fg: th.status.danger.fg },
    ghost: { fg: th.status.primary.fg }
  }[kind || 'primary'];
  var b = box('Button/' + label, { dir: 'h', gap: sm ? 6 : 8, pad: sm ? [7, 12] : [11, 18], r: sm ? 8 : 10,
    align: 'CENTER', justify: 'CENTER', fill: K.fill, fills: K.fills, stroke: K.stroke, shadow: K.shadow, fillW: o.fillW });
  if (o.icon) put(b, icon(o.icon, K.fg, sm ? 14 : 18));
  if (label) put(b, txt(label, sm ? 12 : 14, 'semibold', K.fg));
  if (o.badge) put(b, countChip(th, o.badge, false));
  if (o.iconRight) put(b, icon(o.iconRight, K.fg, sm ? 14 : 18));
  return b;
}

function iconButton(th, name, o) {
  o = o || {};
  var b = box('IconButton/' + name, { dir: 'h', w: o.size || 40, h: o.size || 40, r: 10, align: 'CENTER', justify: 'CENTER',
    fill: o.active ? th.primary : th.surface, stroke: o.active ? null : th.border });
  if (o.label != null) put(b, txt(o.label, 13, 'semibold', o.active ? th.onPrimary : th.text));
  else put(b, icon(name, o.active ? th.onPrimary : th.muted, 18));
  if (o.dot) put(b, circle(8, th.status.danger.solid, { abs: [24, 9], stroke: th.surface, sw: 2, name: 'unread' }));
  return b;
}

function card(th, name, o) {
  o = o || {};
  return box(name, { dir: 'v', gap: o.gap == null ? 18 : o.gap, pad: o.pad == null ? 24 : o.pad, r: 16,
    fill: o.fill || th.surface, fills: o.fills, stroke: th.border, shadow: cardShadow(th),
    fillW: o.fillW, fillH: o.fillH, w: o.w, align: o.align, clip: o.clip });
}

function cardHeader(th, title, sub, right) {
  var h = box('Card header', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER', gap: 16 });
  var l = box('Titles', { dir: 'v', gap: 2 });
  put(l, txt(title, 16, 'semibold', th.text));
  if (sub) put(l, txt(sub, 13, 'regular', th.muted));
  put(h, l);
  if (right) put(h, right);
  return h;
}

function divider(th) { return box('Divider', { h: 1, fill: th.border, fillW: true }); }

function field(th, label, ph, o) {
  o = o || {};
  var wrap = box('Field/' + (label || ph), { dir: 'v', gap: 7, w: o.w, fillW: o.w ? false : o.fillW !== false });
  if (label) {
    var lr = box('Label', { dir: 'h', gap: 2 });
    put(lr, txt(label, 13, 'medium', th.text));
    if (o.req) put(lr, txt('*', 13, 'semibold', th.status.danger.solid));
    put(wrap, lr);
  }
  var inp = box('Input', { dir: 'h', gap: 10, pad: o.area ? [12, 14] : [0, 14], h: o.area ? 92 : 44, r: 10,
    fill: o.readonly ? th.surfaceAlt : th.inputBg, stroke: o.focus ? th.primary : th.border, sw: o.focus ? 1.5 : 1,
    align: o.area ? 'MIN' : 'CENTER', fillW: true,
    shadow: o.focus ? [dropShadow(th.primary, th.dark ? 0.25 : 0.16, 0, 0, 3)] : null });
  if (o.icon) put(inp, icon(o.icon, th.subtle, 18));
  if (o.prefix) put(inp, txt(o.prefix, 14, 'medium', th.muted));
  put(inp, txt(o.value || ph, 14, o.value ? 'medium' : 'regular', o.value ? th.text : th.subtle, { fillW: true }));
  if (o.select) put(inp, icon('chevronDown', th.muted, 18));
  if (o.suffixIcon) put(inp, icon(o.suffixIcon, th.subtle, 18));
  if (o.kbd) {
    var k = box('Shortcut', { dir: 'h', pad: [2, 6], r: 6, stroke: th.border, fill: th.surface });
    put(k, txt(o.kbd, 11, 'medium', th.muted));
    put(inp, k);
  }
  put(wrap, inp);
  if (o.hint) put(wrap, txt(o.hint, 12, 'regular', th.muted));
  return wrap;
}

function fieldRow() {
  var r = box('Field row', { dir: 'h', gap: 16, fillW: true });
  for (var i = 0; i < arguments.length; i++) put(r, arguments[i]);
  return r;
}

function tabs(th, items, activeIdx) {
  var t = box('Tabs', { dir: 'h', gap: 4, pad: 4, r: 12, fill: th.surfaceAlt, stroke: th.border });
  items.forEach(function (it, i) {
    var a = i === activeIdx;
    var tab = box('Tab/' + it[0], { dir: 'h', gap: 8, pad: [7, 14], r: 9, align: 'CENTER',
      fill: a ? th.surface : null, shadow: a ? cardShadow(th) : null });
    put(tab, txt(it[0], 13, a ? 'semibold' : 'medium', a ? th.text : th.muted));
    if (it[1] != null) put(tab, countChip(th, it[1], a));
    put(t, tab);
  });
  return t;
}

function progress(th, w, pct, color) {
  var track = box('Progress', { w: w, h: 8, r: 4, fill: th.dark ? th.border : th.surfaceAlt, clip: true });
  if (!th.dark) { track.strokes = solid(th.border); track.strokeWeight = 1; track.strokeAlign = 'INSIDE'; }
  var bar = rect(Math.round(w * pct), 8, null, { r: 4, fills: color ? solid(color) : grad(th.grad[0], th.grad[1], 'h'), name: 'value' });
  track.appendChild(bar);
  return track;
}

function kpi(th, label, value, iconName, toneKey, trend, caption) {
  var s = th.status[toneKey];
  var c = card(th, 'KPI/' + label, { gap: 14, pad: 20, fillW: true });
  var top = box('Top', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  var chip = box('Icon chip', { dir: 'h', w: 44, h: 44, r: 12, fill: s.bg, align: 'CENTER', justify: 'CENTER' });
  put(chip, icon(iconName, s.solid, 22));
  put(top, chip);
  if (trend) {
    var up = trend.charAt(0) !== '-';
    var tone = th.status[up ? 'success' : 'danger'];
    var tp = box('Trend', { dir: 'h', gap: 4, pad: [3, 8], r: 999, fill: tone.bg, align: 'CENTER' });
    put(tp, icon('trendUp', tone.fg, 12), txt(trend, 12, 'semibold', tone.fg));
    put(top, tp);
  }
  put(c, top);
  var body = box('Body', { dir: 'v', gap: 4, fillW: true });
  put(body, txt(label, 13, 'medium', th.muted), txt(value, 26, 'bold', th.text, { ls: -1 }));
  if (caption) put(body, txt(caption, 12, 'regular', th.subtle));
  put(c, body);
  return c;
}

function kpiRow(th, cards) {
  var r = box('KPI row', { dir: 'h', gap: 20, fillW: true });
  cards.forEach(function (c) { put(r, c); });
  return r;
}

function row(name, gap) { return box(name || 'Row', { dir: 'h', gap: gap == null ? GAP : gap, fillW: true }); }

function infoLine(th, label, value, o) {
  o = o || {};
  var l = box('Line/' + label, { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER', gap: 12 });
  put(l, txt(label, 13, 'regular', th.muted));
  if (typeof value === 'string') put(l, txt(value, o.big ? 18 : 14, o.big || o.bold ? 'bold' : 'medium', o.color || th.text));
  else put(l, value);
  return l;
}

// Table with fixed column widths (weights) that fills `width`.
function table(th, width, cols, rows, o) {
  o = o || {};
  var sum = cols.reduce(function (a, c) { return a + (c.w || 1); }, 0);
  var inner = width - 32 - (cols.length - 1) * 12;
  var widths = cols.map(function (c) { return Math.floor(inner * (c.w || 1) / sum); });
  var t = box('Table', { dir: 'v', w: width });
  var head = box('Table header', { dir: 'h', gap: 12, pad: [11, 16], r: 10, fill: th.surfaceAlt, align: 'CENTER', fillW: true });
  cols.forEach(function (c, i) {
    var cell = box('th/' + c.label, { dir: 'h', w: widths[i], align: 'CENTER', justify: c.right ? 'MAX' : 'MIN' });
    put(cell, txt(c.label, 11, 'semibold', th.muted, { ls: 6, upper: true }));
    put(head, cell);
  });
  put(t, head);
  rows.forEach(function (r, ri) {
    var hl = o.highlight === ri;
    var rw = box('Row ' + (ri + 1), { dir: 'h', gap: 12, pad: [13, 16], align: 'CENTER', fillW: true, r: hl ? 10 : 0,
      fill: hl ? th.primarySoft : null, stroke: hl ? th.primary : th.border, sw: 1,
      sides: hl ? { t: 1, r: 1, b: 1, l: 1 } : { b: ri < rows.length - 1 ? 1 : 0 } });
    r.forEach(function (v, i) {
      var cell = box('td', { dir: 'h', w: widths[i], gap: 10, align: 'CENTER', justify: cols[i].right ? 'MAX' : 'MIN' });
      put(cell, cellNode(th, v, cols[i]));
      put(rw, cell);
    });
    if (o.links && o.links[ri]) o.links[ri](rw);
    put(t, rw);
  });
  return t;
}

function cellNode(th, v, col) {
  if (v == null) return null;
  if (typeof v === 'string' || typeof v === 'number') {
    var weight = col.bold ? 'semibold' : 'regular';
    var color = col.link ? th.status.primary.fg : (col.muted ? th.muted : th.text);
    if (col.link) weight = 'semibold';
    return txt(v, 14, weight, color, { fillW: true, align: col.right ? 'RIGHT' : 'LEFT' });
  }
  if (v.pill) return pill(th, v.pill, v.tone);
  if (v.person) {
    var p = box('Person', { dir: 'h', gap: 10, align: 'CENTER', fillW: true });
    put(p, avatar(v.person, 32));
    var n = box('Name', { dir: 'v', gap: 0, fillW: true });
    put(n, txt(v.person, 14, 'medium', th.text, { fillW: true }));
    if (v.sub) put(n, txt(v.sub, 12, 'regular', th.muted, { fillW: true }));
    put(p, n);
    return p;
  }
  if (v.progress != null) {
    var g = box('Rate', { dir: 'h', gap: 10, align: 'CENTER' });
    put(g, progress(th, 90, v.progress), txt(Math.round(v.progress * 100) + '%', 13, 'semibold', th.text));
    return g;
  }
  if (v.actions) {
    var a = box('Actions', { dir: 'h', gap: 8, align: 'CENTER' });
    put(a, button(th, 'Approve', 'success', { size: 'sm', icon: 'check' }), button(th, 'Reject', 'dangerSoft', { size: 'sm', icon: 'x' }));
    return a;
  }
  if (v.node) return v.node;
  return null;
}

function pagination(th, text) {
  var f = box('Pagination', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  put(f, txt(text, 13, 'regular', th.muted));
  var p = box('Pages', { dir: 'h', gap: 6 });
  put(p, iconButton(th, 'chevronLeft', { size: 34 }), iconButton(th, '', { size: 34, label: '1', active: true }),
    iconButton(th, '', { size: 34, label: '2' }), iconButton(th, '', { size: 34, label: '3' }),
    iconButton(th, '', { size: 34, label: '...' }), iconButton(th, '', { size: 34, label: '8' }),
    iconButton(th, 'chevronRight', { size: 34 }));
  put(f, p);
  return f;
}

// ---------- Charts ----------
function barChart(th, w, h, data, o) {
  var f = box('Chart/Bars', { w: w, h: h });
  var top = 16, bottom = 30, left = 52;
  var plotH = h - top - bottom, plotW = w - left;
  for (var i = 0; i <= 4; i++) {
    var y = Math.round(top + plotH - plotH * i / 4);
    var line = rect(plotW, 1, th.border, { name: 'grid' });
    f.appendChild(line); line.x = left; line.y = y;
    var lab = txt(o.fmt(o.max * i / 4), 11, 'regular', th.subtle);
    f.appendChild(lab); lab.x = 0; lab.y = y - 8;
  }
  var slot = plotW / data.length;
  var bw = Math.min(o.barW || 40, slot * 0.56);
  data.forEach(function (d, i) {
    var bh = Math.max(6, plotH * d.value / o.max);
    var hi = i === o.hi;
    var r = rect(bw, bh, null, { name: 'bar/' + d.label,
      fills: hi ? grad(th.grad[0], th.grad[1], 'v') : solid(th.primary, th.dark ? 0.28 : 0.2) });
    r.topLeftRadius = 8; r.topRightRadius = 8;
    f.appendChild(r);
    r.x = Math.round(left + slot * i + (slot - bw) / 2); r.y = Math.round(top + plotH - bh);
    var l = txt(d.label, 12, hi ? 'semibold' : 'medium', hi ? th.text : th.muted);
    f.appendChild(l); l.x = Math.round(r.x + bw / 2 - l.width / 2); l.y = top + plotH + 10;
    if (hi) {
      var tip = box('Tooltip', { dir: 'h', pad: [5, 10], r: 8, fill: th.dark ? '#E8EBF5' : '#0F172A' });
      put(tip, txt(o.tip || o.fmt(d.value), 12, 'semibold', th.dark ? '#0B0F1A' : '#FFFFFF'));
      f.appendChild(tip); tip.x = Math.round(r.x + bw / 2 - tip.width / 2); tip.y = Math.round(r.y - tip.height - 8);
    }
  });
  return f;
}

function donut(th, d, segs, centerTop, centerSub) {
  var f = box('Chart/Donut', { w: d, h: d });
  var total = segs.reduce(function (a, s) { return a + s.value; }, 0);
  var track = figma.createEllipse();
  track.resize(d, d); track.fills = solid(th.surfaceAlt); track.name = 'track';
  track.arcData = { startingAngle: 0, endingAngle: 2 * Math.PI, innerRadius: 0.74 };
  f.appendChild(track);
  var a0 = -Math.PI / 2;
  segs.forEach(function (s) {
    var sweep = 2 * Math.PI * s.value / total;
    var e = figma.createEllipse();
    e.resize(d, d); e.fills = solid(s.color); e.name = s.label;
    e.arcData = { startingAngle: a0 + 0.02, endingAngle: a0 + sweep - 0.02, innerRadius: 0.74 };
    f.appendChild(e);
    a0 += sweep;
  });
  var c1 = txt(centerTop, 26, 'bold', th.text);
  f.appendChild(c1); c1.x = Math.round((d - c1.width) / 2); c1.y = Math.round(d / 2 - c1.height + 4);
  var c2 = txt(centerSub, 12, 'medium', th.muted);
  f.appendChild(c2); c2.x = Math.round((d - c2.width) / 2); c2.y = Math.round(d / 2 + 4);
  return f;
}

function legend(th, segs, total) {
  var l = box('Legend', { dir: 'v', gap: 12, fillW: true });
  segs.forEach(function (s) {
    var r = box('Legend/' + s.label, { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
    var left = box('Key', { dir: 'h', gap: 10, align: 'CENTER' });
    put(left, box('swatch', { w: 10, h: 10, r: 3, fill: s.color }), txt(s.label, 13, 'medium', th.text));
    var right = box('Val', { dir: 'h', gap: 8, align: 'CENTER' });
    put(right, txt(String(s.value), 13, 'semibold', th.text), txt(Math.round(100 * s.value / total) + '%', 12, 'regular', th.muted));
    put(r, left, right);
    put(l, r);
  });
  return l;
}

// ============================================================
// App shell (sidebar + topbar)
// ============================================================
var EMP_NAV = [
  ['Dashboard', 'home', 'employee-dashboard'], ['New Order', 'plusCircle', 'new-order'],
  ['My Orders', 'clipboard', 'my-orders'], ['Commission', 'wallet', 'commission']
];
var ADMIN_NAV = [
  ['Dashboard', 'home', 'admin-dashboard'], ['Order Approval', 'checkCircle', 'approvals', '17'],
  ['Reports & Dispatch', 'truck', 'reports']
];

function navItem(th, label, iconName, active, badge) {
  var it = box('Nav/' + label, { dir: 'h', gap: 12, pad: [10, 12], r: 10, align: 'CENTER', fillW: true,
    fill: active ? th.activeBg : null, shadow: active && !th.sidebarBorder && !th.dark ? glow(th) : null });
  put(it, icon(iconName, active ? th.activeText : th.sideText, 20));
  put(it, txt(label, 14, active ? 'semibold' : 'medium', active ? th.activeText : th.sideText, { fillW: true }));
  if (badge) {
    var b = box('Badge', { dir: 'h', pad: [1, 8], r: 999, fill: th.accent, align: 'CENTER' });
    put(b, txt(badge, 11, 'bold', '#FFFFFF'));
    put(it, b);
  }
  return it;
}

function sidebar(th, role, activeKey, reg) {
  var s = box('Sidebar', { dir: 'v', w: SIDEBAR, pad: [24, 16], gap: 6, fill: th.sidebar, fillH: true,
    stroke: th.sidebarBorder, sides: th.sidebarBorder ? { r: 1 } : null });
  var brand = box('Brand', { dir: 'h', gap: 12, pad: [0, 8, 20, 8], align: 'CENTER' });
  var bt = box('Brand text', { dir: 'v', gap: 0 });
  put(bt, txt('OrderHub', 19, 'bold', th.brandText, { ls: -1 }), txt('Order Management System', 11, 'medium', th.sideText));
  put(brand, logoMark(th, 40), bt);
  put(s, brand);
  var menu = box('Section label', { dir: 'h', pad: [12, 12, 6, 12] });
  put(menu, txt('Main menu', 11, 'semibold', th.sideHeading, { upper: true, ls: 8 }));
  put(s, menu);
  (role === 'admin' ? ADMIN_NAV : EMP_NAV).forEach(function (n) {
    var it = navItem(th, n[0], n[1], n[2] === activeKey, n[3]);
    put(s, it);
    reg.links.push({ node: it, target: n[2] });
  });
  var acc = box('Section label', { dir: 'h', pad: [18, 12, 6, 12] });
  put(acc, txt('Account', 11, 'semibold', th.sideHeading, { upper: true, ls: 8 }));
  put(s, acc);
  var lo = navItem(th, 'Logout', 'logout', false);
  put(s, lo);
  reg.links.push({ node: lo, target: 'login' });
  put(s, spacer({ grow: true, fillW: true }));

  var promo = box('Roadmap card', { dir: 'v', gap: 8, pad: 16, r: 14, fills: grad(th.grad[0], th.grad[1], 'diag'), fillW: true, clip: true });
  put(promo, circle(110, '#FFFFFF', { op: 0.1, abs: [150, -40] }));
  put(promo, icon('sparkles', '#FFFFFF', 20), txt('Semester roadmap', 14, 'bold', '#FFFFFF'),
    txt('Next: JS validation, backend, database & real login.', 12, 'regular', '#FFFFFF', { op: 0.85, fillW: true, lh: 17 }));
  put(s, promo);

  var who = role === 'admin' ? ['Hassan Raza', 'Administrator'] : ['Ali Hassan', 'Sales Employee'];
  var u = box('User card', { dir: 'h', gap: 10, pad: 10, r: 12, fill: th.userCard, align: 'CENTER', fillW: true });
  var ut = box('User', { dir: 'v', gap: 0, fillW: true });
  put(ut, txt(who[0], 13, 'semibold', th.brandText), txt(who[1], 12, 'regular', th.sideText));
  put(u, avatar(who[0], 36), ut, icon('moreH', th.sideText, 18));
  put(s, u);
  return s;
}

function topbar(th, crumbs, role) {
  var t = box('Topbar', { dir: 'h', h: 72, pad: [0, PAD], align: 'CENTER', justify: 'SPACE_BETWEEN', fillW: true,
    fill: th.surface, stroke: th.border, sides: { b: 1 } });
  var c = box('Breadcrumb', { dir: 'h', gap: 8, align: 'CENTER' });
  put(c, txt(crumbs[0], 14, 'medium', th.muted), icon('chevronRight', th.subtle, 16), txt(crumbs[1], 14, 'semibold', th.text));
  put(t, c);
  var r = box('Actions', { dir: 'h', gap: 14, align: 'CENTER' });
  put(r, field(th, null, 'Search orders, customers...', { w: 320, icon: 'search', kbd: 'Ctrl K' }));
  put(r, iconButton(th, 'bell', { dot: true }));
  put(r, box('Separator', { w: 1, h: 28, fill: th.border }));
  var who = role === 'admin' ? ['Hassan Raza', 'Administrator'] : ['Ali Hassan', 'Employee'];
  var u = box('Profile', { dir: 'h', gap: 10, align: 'CENTER' });
  var ut = box('Who', { dir: 'v', gap: 0 });
  put(ut, txt(who[0], 13, 'semibold', th.text), txt(who[1], 12, 'regular', th.muted));
  put(u, avatar(who[0], 36), ut, icon('chevronDown', th.muted, 16));
  put(r, u);
  put(t, r);
  return t;
}

function shell(th, cfg, reg) {
  var root = box(cfg.name, { dir: 'h', w: W, fill: th.bg, clip: true, minH: 1024 });
  put(root, sidebar(th, cfg.role, cfg.key, reg));
  var main = box('Main', { dir: 'v', fillW: true });
  put(root, main);
  put(main, topbar(th, cfg.crumbs, cfg.role));
  var content = box('Content', { dir: 'v', pad: PAD, gap: GAP, fillW: true });
  put(main, content);
  reg.frames[cfg.key] = root;
  return { root: root, content: content };
}

function pageHeader(th, title, sub, actions) {
  var h = box('Page header', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'MAX', gap: 24 });
  var l = box('Heading', { dir: 'v', gap: 6 });
  put(l, txt(title, 28, 'bold', th.text, { ls: -2 }), txt(sub, 14, 'regular', th.muted));
  put(h, l);
  if (actions && actions.length) {
    var a = box('Header actions', { dir: 'h', gap: 12, align: 'CENTER' });
    actions.forEach(function (x) { put(a, x); });
    put(h, a);
  }
  return h;
}

// ============================================================
// Sample data (same as the HTML prototype)
// ============================================================
var RECENT = [
  ['ORD-1048', 'Sana Malik', '12 Oct 2026', 'COD', 'Rs. 4,200', 'Pending'],
  ['ORD-1047', 'Bilal Ahmed', '11 Oct 2026', 'Full Payment', 'Rs. 7,800', 'Approved'],
  ['ORD-1046', 'Hira Shah', '11 Oct 2026', 'Partial Payment', 'Rs. 2,650', 'Approved'],
  ['ORD-1045', 'Usman Tariq', '10 Oct 2026', 'COD', 'Rs. 5,100', 'Rejected'],
  ['ORD-1044', 'Ayesha Noor', '09 Oct 2026', 'Full Payment', 'Rs. 9,300', 'Approved']
];
var MY_ORDERS = [
  ['ORD-1048', '12 Oct 2026', 'Sana Malik', '2x Cotton Kurta', 'Rs. 4,200', 'COD', 'Pending'],
  ['ORD-1047', '11 Oct 2026', 'Bilal Ahmed', '1x Leather Wallet, 1x Belt', 'Rs. 7,800', 'Full Payment', 'Approved'],
  ['ORD-1046', '11 Oct 2026', 'Hira Shah', '3x Scented Candle', 'Rs. 2,650', 'Partial Payment', 'Approved'],
  ['ORD-1045', '10 Oct 2026', 'Usman Tariq', '1x Bluetooth Speaker', 'Rs. 5,100', 'COD', 'Rejected'],
  ['ORD-1044', '09 Oct 2026', 'Ayesha Noor', '1x Wrist Watch', 'Rs. 9,300', 'Full Payment', 'Approved'],
  ['ORD-1043', '08 Oct 2026', 'Hamza Qureshi', '2x Sports Cap', 'Rs. 1,900', 'COD', 'Pending']
];

// ============================================================
// Screens
// ============================================================
function screenLogin(th, reg) {
  var root = box('01 - Login', { dir: 'h', w: W, h: 1024, fill: th.bg, clip: true });
  reg.frames['login'] = root;

  var left = box('Brand panel', { dir: 'v', w: 700, pad: 64, fills: grad(th.grad[0], th.grad[1], 'diag'), fillH: true,
    justify: 'SPACE_BETWEEN', clip: true });
  put(left, circle(560, '#FFFFFF', { op: 0.07, abs: [360, -200] }), circle(380, '#FFFFFF', { op: 0.06, abs: [-140, 720] }),
    circle(150, '#FFFFFF', { op: 0.09, abs: [520, 600] }));
  var brand = box('Brand', { dir: 'h', gap: 12, align: 'CENTER' });
  put(brand, logoMark(th, 44, true), txt('OrderHub', 22, 'bold', '#FFFFFF', { ls: -1 }));
  put(left, brand);

  var mid = box('Hero', { dir: 'v', gap: 22 });
  var tag = box('Tag', { dir: 'h', gap: 8, pad: [6, 12], r: 999, fill: '#FFFFFF', op: 0.16, align: 'CENTER' });
  put(tag, icon('sparkles', '#FFFFFF', 14), txt('Web Engineering - Semester Capstone', 12, 'semibold', '#FFFFFF'));
  put(mid, tag);
  put(mid, txt('Every order, from booking to doorstep.', 50, 'bold', '#FFFFFF', { w: 560, lh: 58, ls: -2 }));
  put(mid, txt('Record customer orders, verify payments, approve in one click and track every parcel. Built for small sales teams.', 17, 'regular', '#FFFFFF', { w: 520, lh: 27, op: 0.85 }));
  var stats = box('Stats', { dir: 'h', gap: 14 });
  [['312', 'Orders this month'], ['98%', 'Dispatched on time'], ['8', 'Active employees']].forEach(function (s) {
    var g = box('Stat/' + s[1], { dir: 'v', gap: 2, pad: [14, 18], r: 14, fill: '#FFFFFF', op: 0.12, stroke: '#FFFFFF', strokeOp: 0.22 });
    put(g, txt(s[0], 24, 'bold', '#FFFFFF'), txt(s[1], 12, 'medium', '#FFFFFF', { op: 0.8 }));
    put(stats, g);
  });
  put(mid, stats);
  put(left, mid);
  put(left, txt('© 2026 OrderHub  ·  Taimour Mushtaq  ·  BS Computer Science', 13, 'regular', '#FFFFFF', { op: 0.7 }));
  put(root, left);

  var right = box('Form panel', { dir: 'v', fillW: true, fillH: true, align: 'CENTER', justify: 'CENTER', fill: th.bg });
  var c = card(th, 'Login card', { w: 448, pad: 40, gap: 22 });
  var head = box('Heading', { dir: 'v', gap: 6, fillW: true });
  put(head, txt('Welcome back', 30, 'bold', th.text, { ls: -2 }), txt('Sign in to continue to your workspace.', 14, 'regular', th.muted));
  put(c, head);

  var seg = box('Role switch', { dir: 'h', gap: 4, pad: 4, r: 12, fill: th.surfaceAlt, stroke: th.border, fillW: true });
  [['Employee', 'user', true], ['Administrator', 'shield', false]].forEach(function (s) {
    var it = box('Role/' + s[0], { dir: 'h', gap: 8, pad: [9, 12], r: 9, align: 'CENTER', justify: 'CENTER', fillW: true,
      fill: s[2] ? th.surface : null, shadow: s[2] ? cardShadow(th) : null });
    put(it, icon(s[1], s[2] ? th.primary : th.muted, 16), txt(s[0], 13, s[2] ? 'semibold' : 'medium', s[2] ? th.text : th.muted));
    put(seg, it);
  });
  put(c, seg);
  put(c, field(th, 'Username or Email', 'ali.hassan@orderhub.pk', { icon: 'mail', focus: true, value: 'ali.hassan@orderhub.pk' }));
  put(c, field(th, 'Password', '••••••••••', { icon: 'lock', suffixIcon: 'eye', value: '••••••••••' }));

  var opts = box('Options', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  var rem = box('Remember', { dir: 'h', gap: 8, align: 'CENTER' });
  var cb = box('Checkbox', { dir: 'h', w: 18, h: 18, r: 5, fill: th.primary, align: 'CENTER', justify: 'CENTER' });
  put(cb, icon('check', th.onPrimary, 12));
  put(rem, cb, txt('Remember me', 13, 'medium', th.text));
  put(opts, rem, txt('Forgot password?', 13, 'semibold', th.status.primary.fg));
  put(c, opts);

  var signIn = button(th, 'Sign in', 'gradient', { fillW: true, iconRight: 'arrowRight' });
  put(c, signIn);
  reg.links.push({ node: signIn, target: 'employee-dashboard' });

  var dv = box('Or', { dir: 'h', gap: 12, align: 'CENTER', fillW: true });
  put(dv, divider(th), txt('Quick demo access', 12, 'medium', th.subtle), divider(th));
  put(c, dv);
  var demo = box('Demo buttons', { dir: 'h', gap: 12, fillW: true });
  var e = button(th, 'Employee view', 'secondary', { fillW: true, icon: 'user' });
  var a = button(th, 'Admin view', 'secondary', { fillW: true, icon: 'shield' });
  put(demo, e, a);
  put(c, demo);
  reg.links.push({ node: e, target: 'employee-dashboard' });
  reg.links.push({ node: a, target: 'admin-dashboard' });
  put(right, c);
  put(right, txt('Phase 1 prototype - authentication is connected in a later phase.', 12, 'regular', th.subtle));
  right.itemSpacing = 20;
  put(root, right);
  return root;
}

function screenEmployeeDashboard(th, reg) {
  var S = shell(th, { name: '02 - Employee Dashboard', key: 'employee-dashboard', role: 'employee', crumbs: ['Employee', 'Dashboard'] }, reg);
  var newBtn = button(th, 'New Order', 'primary', { icon: 'plus' });
  reg.links.push({ node: newBtn, target: 'new-order' });
  put(S.content, pageHeader(th, 'Good morning, Ali', 'Here is what is happening with your orders this month.',
    [button(th, 'October 2026', 'secondary', { icon: 'calendar', iconRight: 'chevronDown' }), newBtn]));
  put(S.content, kpiRow(th, [
    kpi(th, 'Total Orders', '48', 'package', 'primary', '+8%', 'vs. 44 last month'),
    kpi(th, 'Pending Orders', '6', 'clock', 'warning', null, 'Awaiting admin review'),
    kpi(th, 'Approved Orders', '39', 'checkCircle', 'success', '+12%', '81% approval rate'),
    kpi(th, 'Monthly Commission', 'Rs. 18,450', 'coins', 'info', '+5%', 'At 7.5% commission rate')
  ]));

  var r = row('Charts');
  var chart = card(th, 'Orders this week', { fillW: true, fillH: true });
  put(chart, cardHeader(th, 'Orders this week', '23 orders  ·  5 - 11 Oct 2026', tabs(th, [['Week'], ['Month']], 0)));
  var cw = CONTENT_W - SIDE_COL - GAP - 48;
  put(chart, barChart(th, cw, 230, [
    { label: 'Mon', value: 3 }, { label: 'Tue', value: 5 }, { label: 'Wed', value: 2 }, { label: 'Thu', value: 6 },
    { label: 'Fri', value: 4 }, { label: 'Sat', value: 1 }, { label: 'Sun', value: 2 }],
    { max: 8, hi: 3, fmt: function (v) { return String(Math.round(v)); }, tip: '6 orders' }));
  var side = card(th, 'Order status', { w: SIDE_COL, fillH: true, align: 'CENTER' });
  put(side, cardHeader(th, 'Order status', 'This month'));
  var segs = [{ label: 'Approved', value: 39, color: th.status.success.solid }, { label: 'Pending', value: 6, color: th.status.warning.solid },
    { label: 'Rejected', value: 3, color: th.status.danger.solid }];
  put(side, donut(th, 170, segs, '48', 'orders'), legend(th, segs, 48));
  put(r, chart, side);
  put(S.content, r);

  var t = card(th, 'Recent orders', { fillW: true });
  var va = button(th, 'View all', 'ghost', { iconRight: 'arrowRight', size: 'sm' });
  reg.links.push({ node: va, target: 'my-orders' });
  put(t, cardHeader(th, 'Recent orders', 'Last five orders submitted by you', va));
  put(t, table(th, CONTENT_W - 48, [
    { label: 'Order ID', w: 0.9, link: true }, { label: 'Customer', w: 1.6 }, { label: 'Date', w: 1.1, muted: true },
    { label: 'Payment', w: 1.2 }, { label: 'Amount', w: 1, bold: true }, { label: 'Status', w: 1 }],
    RECENT.map(function (o) { return [o[0], { person: o[1] }, o[2], o[3], o[4], { pill: o[5] }]; })));
  put(S.content, t);
  return S.root;
}

function sectionTitle(th, n, title, sub) {
  var h = box('Section/' + title, { dir: 'h', gap: 14, align: 'CENTER', fillW: true });
  var num = box('Step', { dir: 'h', w: 32, h: 32, r: 10, fill: th.primarySoft, align: 'CENTER', justify: 'CENTER' });
  put(num, txt(String(n), 14, 'bold', th.status.primary.fg));
  var t = box('Text', { dir: 'v', gap: 1 });
  put(t, txt(title, 16, 'semibold', th.text), txt(sub, 13, 'regular', th.muted));
  put(h, num, t);
  return h;
}

function radioCard(th, title, sub, iconName, selected) {
  var c = box('Payment/' + title, { dir: 'v', gap: 10, pad: 16, r: 12, fillW: true,
    fill: selected ? th.primarySoft : th.surface, stroke: selected ? th.primary : th.border, sw: selected ? 1.5 : 1 });
  var top = box('Top', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  var chip = box('Icon', { dir: 'h', w: 36, h: 36, r: 10, fill: selected ? th.primary : th.surfaceAlt, align: 'CENTER', justify: 'CENTER' });
  put(chip, icon(iconName, selected ? th.onPrimary : th.muted, 18));
  var radio = box('Radio', { dir: 'h', w: 20, h: 20, r: 10, stroke: selected ? th.primary : th.subtle, sw: selected ? 6 : 1.5,
    fill: selected ? th.surface : null });
  put(top, chip, radio);
  put(c, top, txt(title, 14, 'semibold', th.text), txt(sub, 12, 'regular', th.muted, { fillW: true }));
  return c;
}

function screenNewOrder(th, reg) {
  var S = shell(th, { name: '03 - New Order', key: 'new-order', role: 'employee', crumbs: ['Orders', 'New Order'] }, reg);
  put(S.content, pageHeader(th, 'Create new order', 'Fill in customer, order and payment details. Fields marked * are required.',
    [button(th, 'Save draft', 'secondary', { icon: 'file' })]));
  var r = row('Form layout');
  var f = card(th, 'Order form', { fillW: true, gap: 22, pad: 28 });
  put(f, sectionTitle(th, 1, 'Customer information', 'Who is this order for?'));
  put(f, fieldRow(field(th, 'Customer Name', 'e.g. Sana Malik', { req: true, icon: 'user', value: 'Sana Malik' }),
    field(th, 'Contact Number', '03XX-XXXXXXX', { req: true, icon: 'phone', value: '0300-1234567', focus: true })));
  put(f, fieldRow(field(th, 'WhatsApp Number', '03XX-XXXXXXX', { icon: 'message', value: '0300-1234567' }),
    field(th, 'City', 'Select city', { icon: 'mapPin', select: true, value: 'Islamabad' })));
  put(f, field(th, 'Customer Address', 'House, street, area, city', { req: true, area: true, value: 'House 24, Street 7, G-10, Islamabad' }));
  put(f, divider(th));
  put(f, sectionTitle(th, 2, 'Order details', 'Amount and items in this order'));
  put(f, fieldRow(field(th, 'Order Amount', 'e.g. 4200', { req: true, prefix: 'Rs.', value: '4,200' }),
    field(th, 'Order Date', 'dd/mm/yyyy', { icon: 'calendar', value: '12 Oct 2026' })));
  put(f, field(th, 'Order Description / Items', 'List the items in this order', { req: true, area: true, value: '2x Cotton Kurta (Size M, Navy Blue)' }));
  put(f, divider(th));
  put(f, sectionTitle(th, 3, 'Payment information', 'How is the customer paying?'));
  var pm = box('Payment methods', { dir: 'h', gap: 14, fillW: true });
  put(pm, radioCard(th, 'Cash on Delivery', 'Customer pays when the parcel arrives', 'truck', false),
    radioCard(th, 'Partial Payment', 'Advance now, balance on delivery', 'wallet', true),
    radioCard(th, 'Full Payment', 'Paid in full before dispatch', 'checkCircle', false));
  put(f, pm);
  put(f, fieldRow(field(th, 'Amount Received', '0', { prefix: 'Rs.', value: '2,000' }),
    field(th, 'Balance Due', '0', { prefix: 'Rs.', value: '2,200', readonly: true, hint: 'Calculated automatically in Phase 2' })));

  var dz = box('Receipt upload', { dir: 'v', gap: 10, pad: 24, r: 12, align: 'CENTER', fillW: true,
    fill: th.surfaceAlt, stroke: th.dark ? th.subtle : th.primary, strokeOp: th.dark ? 1 : 0.5, sw: 1.5, dash: [6, 5] });
  var up = box('Icon', { dir: 'h', w: 44, h: 44, r: 12, fill: th.primarySoft, align: 'CENTER', justify: 'CENTER' });
  put(up, icon('upload', th.primary, 20));
  var line = box('Text', { dir: 'h', gap: 4 });
  put(line, txt('Drop payment receipt here or', 14, 'medium', th.text), txt('browse', 14, 'semibold', th.status.primary.fg, { under: true }));
  put(dz, up, line, txt('Required for Partial / Full payment  ·  PNG, JPG or PDF up to 5 MB', 12, 'regular', th.muted));
  put(f, dz);
  var fileRow = box('Uploaded file', { dir: 'h', gap: 12, pad: 12, r: 12, align: 'CENTER', fillW: true, stroke: th.border, fill: th.surface });
  var fi = box('File icon', { dir: 'h', w: 36, h: 36, r: 8, fill: th.status.success.bg, align: 'CENTER', justify: 'CENTER' });
  put(fi, icon('image', th.status.success.solid, 18));
  var fn = box('Name', { dir: 'v', gap: 0, fillW: true });
  put(fn, txt('receipt_ORD-1048.jpg', 13, 'semibold', th.text), txt('248 KB  ·  Uploaded', 12, 'regular', th.muted));
  put(fileRow, fi, fn, icon('checkCircle', th.status.success.solid, 20));
  put(f, fileRow);

  var btns = box('Form buttons', { dir: 'h', gap: 12, fillW: true, justify: 'MAX' });
  put(btns, button(th, 'Reset', 'secondary', { icon: 'x' }));
  var sub = button(th, 'Submit Order', 'gradient', { icon: 'send' });
  put(btns, sub);
  reg.links.push({ node: sub, target: 'my-orders' });
  put(f, btns);

  var col = box('Side column', { dir: 'v', gap: GAP, w: SIDE_COL });
  var sum = card(th, 'Order summary', { fillW: true, gap: 14 });
  put(sum, cardHeader(th, 'Order summary', 'Live preview of this order', pill(th, 'Draft', 'neutral')));
  put(sum, divider(th));
  put(sum, infoLine(th, 'Customer', 'Sana Malik'), infoLine(th, 'Contact', '0300-1234567'), infoLine(th, 'City', 'Islamabad'),
    infoLine(th, 'Items', '2x Cotton Kurta'), infoLine(th, 'Payment', 'Partial Payment'));
  put(sum, divider(th));
  put(sum, infoLine(th, 'Order amount', 'Rs. 4,200'), infoLine(th, 'Received', 'Rs. 2,000', { color: th.status.success.fg }));
  var bal = box('Balance', { dir: 'h', pad: 14, r: 12, fill: th.primarySoft, fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  put(bal, txt('Balance due', 14, 'semibold', th.status.primary.fg), txt('Rs. 2,200', 22, 'bold', th.status.primary.fg, { ls: -1 }));
  put(sum, bal);
  put(sum, infoLine(th, 'Status after submit', pill(th, 'Pending')));
  put(col, sum);

  var next = card(th, 'What happens next', { fillW: true, gap: 14 });
  put(next, cardHeader(th, 'What happens next?', null));
  [['1', 'Order is saved with Pending status'], ['2', 'Admin verifies the payment receipt'], ['3', 'Approved orders move to dispatch']].forEach(function (s) {
    var l = box('Step ' + s[0], { dir: 'h', gap: 12, align: 'CENTER', fillW: true });
    var n = box('Num', { dir: 'h', w: 26, h: 26, r: 13, fills: grad(th.grad[0], th.grad[1], 'diag'), align: 'CENTER', justify: 'CENTER' });
    put(n, txt(s[0], 12, 'bold', '#FFFFFF'));
    put(l, n, txt(s[1], 13, 'medium', th.text, { fillW: true }));
    put(next, l);
  });
  put(col, next);
  put(r, f, col);
  put(S.content, r);
  return S.root;
}

function screenMyOrders(th, reg) {
  var S = shell(th, { name: '04 - My Orders', key: 'my-orders', role: 'employee', crumbs: ['Orders', 'My Orders'] }, reg);
  var nb = button(th, 'New Order', 'primary', { icon: 'plus' });
  reg.links.push({ node: nb, target: 'new-order' });
  put(S.content, pageHeader(th, 'My orders', 'Every order you have submitted, with its current approval status.',
    [button(th, 'Export', 'secondary', { icon: 'download' }), nb]));
  put(S.content, kpiRow(th, [
    kpi(th, 'All Orders', '48', 'package', 'primary'), kpi(th, 'Pending', '6', 'clock', 'warning'),
    kpi(th, 'Approved', '39', 'checkCircle', 'success'), kpi(th, 'Rejected', '3', 'xCircle', 'danger')]));
  var c = card(th, 'Orders table', { fillW: true, gap: 20 });
  var tb = box('Toolbar', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  put(tb, tabs(th, [['All', '48'], ['Pending', '6'], ['Approved', '39'], ['Rejected', '3']], 0));
  var tr = box('Tools', { dir: 'h', gap: 10, align: 'CENTER' });
  put(tr, field(th, null, 'Search by order ID or customer', { w: 280, icon: 'search' }),
    button(th, 'Last 30 days', 'secondary', { icon: 'calendar' }), button(th, 'Filters', 'secondary', { icon: 'filter' }));
  put(tb, tr);
  put(c, tb);
  put(c, table(th, CONTENT_W - 48, [
    { label: 'Order ID', w: 0.85, link: true }, { label: 'Date', w: 1, muted: true }, { label: 'Customer', w: 1.45 },
    { label: 'Items', w: 1.8 }, { label: 'Amount', w: 0.9, bold: true }, { label: 'Payment', w: 1.1 }, { label: 'Status', w: 0.95 }],
    MY_ORDERS.map(function (o) { return [o[0], o[1], { person: o[2] }, o[3], o[4], o[5], { pill: o[6] }]; })));
  put(c, pagination(th, 'Showing 1 - 6 of 48 orders'));
  put(S.content, c);
  return S.root;
}

function screenCommission(th, reg) {
  var S = shell(th, { name: '05 - Commission', key: 'commission', role: 'employee', crumbs: ['Employee', 'Commission'] }, reg);
  put(S.content, pageHeader(th, 'Commission', 'Your monthly earnings from approved orders at a 7.5% commission rate.',
    [button(th, 'October 2026', 'secondary', { icon: 'calendar', iconRight: 'chevronDown' }), button(th, 'Download statement', 'primary', { icon: 'download' })]));
  put(S.content, kpiRow(th, [
    kpi(th, 'Approved Orders', '39', 'checkCircle', 'success', '+12%', 'This month'),
    kpi(th, 'Total Sales', 'Rs. 2,46,000', 'barChart', 'primary', '+6%', 'From approved orders'),
    kpi(th, 'Commission Rate', '7.5%', 'percent', 'warning', null, 'Set by administrator'),
    kpi(th, 'Commission Earned', 'Rs. 18,450', 'coins', 'info', '+5%', 'Payout on 05 Nov 2026')]));
  var r = row('Charts');
  var ch = card(th, 'Commission trend', { fillW: true, fillH: true });
  put(ch, cardHeader(th, 'Commission trend', 'Last 6 months', tabs(th, [['6M'], ['1Y']], 0)));
  put(ch, barChart(th, CONTENT_W - SIDE_COL - GAP - 48, 230, [
    { label: 'May', value: 12300 }, { label: 'Jun', value: 15800 }, { label: 'Jul', value: 13100 },
    { label: 'Aug', value: 14400 }, { label: 'Sep', value: 21037 }, { label: 'Oct', value: 18450 }],
    { max: 24000, hi: 5, fmt: function (v) { return v === 0 ? '0' : Math.round(v / 1000) + 'k'; }, tip: 'Rs. 18,450' }));
  var tg = card(th, 'Sales target', { w: SIDE_COL, fillH: true, gap: 16 });
  put(tg, cardHeader(th, 'Monthly sales target', 'October 2026'));
  var big = box('Big number', { dir: 'h', gap: 10, align: 'MAX' });
  put(big, txt('82%', 44, 'bold', th.text, { ls: -3 }), txt('of target reached', 13, 'medium', th.muted));
  put(tg, big, progress(th, SIDE_COL - 48, 0.82));
  put(tg, txt('Rs. 2,46,000 of Rs. 3,00,000', 13, 'medium', th.muted));
  put(tg, divider(th));
  put(tg, infoLine(th, 'Next payout', '05 Nov 2026'), infoLine(th, 'Payout method', 'Bank transfer'),
    infoLine(th, 'Payout status', pill(th, 'Processing')));
  put(r, ch, tg);
  put(S.content, r);
  var t = card(th, 'Monthly breakdown', { fillW: true });
  put(t, cardHeader(th, 'Monthly breakdown', 'Commission = Total sales x Rate', button(th, 'Export', 'secondary', { icon: 'download', size: 'sm' })));
  put(t, table(th, CONTENT_W - 48, [
    { label: 'Month', w: 1.2, bold: true }, { label: 'Approved Orders', w: 1 }, { label: 'Total Sales', w: 1.1 },
    { label: 'Rate', w: 0.7 }, { label: 'Commission', w: 1, bold: true }, { label: 'Payout', w: 0.9 }],
    [['October 2026', '39', 'Rs. 2,46,000', '7.5%', 'Rs. 18,450', { pill: 'Processing' }],
     ['September 2026', '44', 'Rs. 2,80,500', '7.5%', 'Rs. 21,037', { pill: 'Paid' }],
     ['August 2026', '31', 'Rs. 1,92,000', '7.5%', 'Rs. 14,400', { pill: 'Paid' }],
     ['July 2026', '28', 'Rs. 1,74,700', '7.5%', 'Rs. 13,100', { pill: 'Paid' }]]));
  put(S.content, t);
  return S.root;
}

function screenAdminDashboard(th, reg) {
  var S = shell(th, { name: '06 - Admin Dashboard', key: 'admin-dashboard', role: 'admin', crumbs: ['Admin', 'Dashboard'] }, reg);
  var rv = button(th, 'Review approvals', 'primary', { icon: 'checkCircle', badge: '17' });
  reg.links.push({ node: rv, target: 'approvals' });
  put(S.content, pageHeader(th, 'Admin overview', 'Orders, payments, employees and commissions at a glance.',
    [button(th, 'Last 30 days', 'secondary', { icon: 'calendar', iconRight: 'chevronDown' }), rv]));
  put(S.content, kpiRow(th, [
    kpi(th, 'Total Orders', '312', 'package', 'primary', '+14%', '271 approved'),
    kpi(th, 'Pending Approvals', '17', 'clock', 'warning', null, 'Needs your review'),
    kpi(th, 'Total Payments', 'Rs. 19,84,500', 'wallet', 'success', '+9%', 'Collected this month'),
    kpi(th, 'Commission Payable', 'Rs. 1,48,800', 'coins', 'info', null, '8 active employees')]));
  var r = row('Charts');
  var ch = card(th, 'Orders overview', { fillW: true, fillH: true });
  put(ch, cardHeader(th, 'Orders overview', '312 orders  ·  last 7 days shown', tabs(th, [['7D'], ['30D'], ['90D']], 0)));
  put(ch, barChart(th, CONTENT_W - SIDE_COL - GAP - 48, 230, [
    { label: 'Mon', value: 38 }, { label: 'Tue', value: 52 }, { label: 'Wed', value: 41 }, { label: 'Thu', value: 60 },
    { label: 'Fri', value: 47 }, { label: 'Sat', value: 35 }, { label: 'Sun', value: 39 }],
    { max: 80, hi: 3, fmt: function (v) { return String(Math.round(v)); }, tip: '60 orders' }));
  var pm = card(th, 'Payment methods', { w: SIDE_COL, fillH: true, align: 'CENTER' });
  put(pm, cardHeader(th, 'Payment methods', 'All orders this month'));
  var segs = [{ label: 'Cash on Delivery', value: 148, color: th.chart[0] }, { label: 'Partial Payment', value: 86, color: th.chart[1] },
    { label: 'Full Payment', value: 78, color: th.chart[2] }];
  put(pm, donut(th, 170, segs, '312', 'orders'), legend(th, segs, 312));
  put(r, ch, pm);
  put(S.content, r);

  var r2 = row('Tables');
  var emp = card(th, 'Employee performance', { fillW: true, fillH: true });
  put(emp, cardHeader(th, 'Employee performance', '8 active employees  ·  top 4 shown', button(th, 'All employees', 'ghost', { size: 'sm', iconRight: 'arrowRight' })));
  put(emp, table(th, CONTENT_W - SIDE_COL - GAP - 48, [
    { label: 'Employee', w: 1.7 }, { label: 'Orders', w: 0.6 }, { label: 'Pending', w: 0.65 },
    { label: 'Approval', w: 1.45 }, { label: 'Commission', w: 1, bold: true }],
    [[{ person: 'Fatima Raza', sub: 'Sales  ·  7.5%' }, '52', '3', { progress: 0.9 }, 'Rs. 22,100'],
     [{ person: 'Mariam Khan', sub: 'Sales  ·  7.5%' }, '45', '2', { progress: 0.91 }, 'Rs. 19,300'],
     [{ person: 'Ali Hassan', sub: 'Sales  ·  7.5%' }, '48', '6', { progress: 0.81 }, 'Rs. 18,450'],
     [{ person: 'Zain Abbas', sub: 'Sales  ·  7.5%' }, '40', '4', { progress: 0.88 }, 'Rs. 16,750']]));
  var att = card(th, 'Needs attention', { w: SIDE_COL, fillH: true, gap: 14 });
  put(att, cardHeader(th, 'Needs attention', '17 orders waiting', pill(th, 'Pending')));
  [['Sana Malik', 'ORD-1048', 'Rs. 4,200', '2h ago'], ['Hamza Qureshi', 'ORD-1043', 'Rs. 1,900', '5h ago'],
   ['Nida Aslam', 'ORD-1041', 'Rs. 6,750', '1d ago'], ['Kashif Iqbal', 'ORD-1039', 'Rs. 12,400', '2d ago']].forEach(function (p) {
    var l = box('Pending/' + p[1], { dir: 'h', gap: 12, align: 'CENTER', fillW: true });
    var n = box('Text', { dir: 'v', gap: 0, fillW: true });
    put(n, txt(p[0], 13, 'semibold', th.text), txt(p[1] + '  ·  ' + p[3], 12, 'regular', th.muted));
    put(l, avatar(p[0], 34), n, txt(p[2], 13, 'semibold', th.text));
    put(att, l);
  });
  put(att, spacer({ grow: true, fillW: true }));
  var oq = button(th, 'Open approval queue', 'soft', { fillW: true, iconRight: 'arrowRight' });
  put(att, oq);
  reg.links.push({ node: oq, target: 'approvals' });
  put(r2, emp, att);
  put(S.content, r2);
  return S.root;
}

function screenApprovals(th, reg) {
  var S = shell(th, { name: '07 - Order Approval', key: 'approvals', role: 'admin', crumbs: ['Admin', 'Order Approval'] }, reg);
  put(S.content, pageHeader(th, 'Order approval', 'Review submitted orders, verify payment and approve or reject them.',
    [button(th, 'Filters', 'secondary', { icon: 'filter' }), button(th, 'Approve selected', 'success', { icon: 'check', badge: '2' })]));
  var c = card(th, 'Approval queue', { fillW: true, gap: 20 });
  var tb = box('Toolbar', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  put(tb, tabs(th, [['Pending', '17'], ['Approved', '271'], ['Rejected', '24']], 0),
    field(th, null, 'Search order ID, customer or employee', { w: 320, icon: 'search' }));
  put(c, tb);
  put(c, table(th, CONTENT_W - 48, [
    { label: 'Order ID', w: 0.8, link: true }, { label: 'Customer', w: 1.25 }, { label: 'Employee', w: 0.95 },
    { label: 'Amount', w: 0.8, bold: true }, { label: 'Payment', w: 0.95 }, { label: 'Receipt', w: 1.05 },
    { label: 'Status', w: 0.85 }, { label: 'Action', w: 1.85 }],
    [['ORD-1048', { person: 'Sana Malik' }, 'Ali Hassan', 'Rs. 4,200', 'COD', { pill: 'Not required' }, { pill: 'Pending' }, { actions: true }],
     ['ORD-1043', { person: 'Hamza Qureshi' }, 'Ali Hassan', 'Rs. 1,900', 'COD', { pill: 'Not required' }, { pill: 'Pending' }, { actions: true }],
     ['ORD-1041', { person: 'Nida Aslam' }, 'Fatima Raza', 'Rs. 6,750', 'Partial Payment', { pill: 'Uploaded' }, { pill: 'Pending' }, { actions: true }],
     ['ORD-1039', { person: 'Kashif Iqbal' }, 'Zain Abbas', 'Rs. 12,400', 'Full Payment', { pill: 'Uploaded' }, { pill: 'Pending' }, { actions: true }]],
    { highlight: 2 }));
  put(S.content, c);

  var r = row('Detail');
  var d = card(th, 'Order detail', { fillW: true, fillH: true, gap: 20 });
  var title = box('Title', { dir: 'h', gap: 12, align: 'CENTER' });
  put(title, txt('ORD-1041', 20, 'bold', th.text), pill(th, 'Pending'), txt('Submitted 07 Oct 2026, 4:12 PM', 13, 'regular', th.muted));
  put(d, title);
  var grid = box('Info grid', { dir: 'h', gap: 32, fillW: true });
  [[['Customer', 'Nida Aslam'], ['Contact / WhatsApp', '0321-5558899'], ['Address', 'House 8, DHA Phase 2, Karachi']],
   [['Employee', 'Fatima Raza'], ['Items', '1x Silk Dupatta, 2x Lawn Suit'], ['Payment method', 'Partial Payment']]].forEach(function (colData) {
    var col = box('Column', { dir: 'v', gap: 14, fillW: true });
    colData.forEach(function (kv) {
      var k = box(kv[0], { dir: 'v', gap: 2, fillW: true });
      put(k, txt(kv[0], 12, 'medium', th.muted), txt(kv[1], 14, 'semibold', th.text, { fillW: true }));
      put(col, k);
    });
    put(grid, col);
  });
  put(d, grid);
  var money = box('Amounts', { dir: 'h', gap: 12, fillW: true });
  [['Order amount', 'Rs. 6,750', th.text], ['Received', 'Rs. 3,000', th.status.success.fg], ['Balance on delivery', 'Rs. 3,750', th.status.warning.fg]].forEach(function (m) {
    var b = box(m[0], { dir: 'v', gap: 4, pad: 14, r: 12, fill: th.surfaceAlt, stroke: th.border, fillW: true });
    put(b, txt(m[0], 12, 'medium', th.muted), txt(m[1], 18, 'bold', m[2]));
    put(money, b);
  });
  put(d, money);
  put(d, field(th, 'Remarks for employee', 'Add a note (optional) - e.g. reason for rejection', { area: true }));
  var acts = box('Decision', { dir: 'h', gap: 12, fillW: true, justify: 'MAX' });
  put(acts, button(th, 'Reject order', 'dangerSoft', { icon: 'x' }), button(th, 'Approve order', 'success', { icon: 'check' }));
  put(d, acts);

  var rc = card(th, 'Payment receipt', { w: SIDE_COL, fillH: true, gap: 16 });
  put(rc, cardHeader(th, 'Payment receipt', 'Uploaded by employee', pill(th, 'Verified')));
  var prev = box('Receipt preview', { dir: 'v', gap: 10, h: 200, r: 12, fills: grad(th.grad[0], th.grad[1], 'diag'), fillW: true,
    align: 'CENTER', justify: 'CENTER', clip: true });
  var paper = box('Paper', { dir: 'v', gap: 6, pad: 14, w: 170, r: 8, fill: '#FFFFFF', shadow: [dropShadow('#000000', 0.2, 8, 20)] });
  put(paper, txt('JazzCash', 12, 'bold', '#0F172A'), txt('Rs. 3,000', 18, 'bold', '#0F172A'),
    rect(140, 4, '#E2E8F0', { r: 2 }), rect(110, 4, '#E2E8F0', { r: 2 }), rect(126, 4, '#E2E8F0', { r: 2 }),
    txt('Txn JC-77812034', 10, 'medium', '#64748B'));
  put(prev, paper);
  put(rc, prev);
  put(rc, infoLine(th, 'File', 'receipt_ORD-1041.jpg'), infoLine(th, 'Transaction ID', 'JC-77812034'),
    infoLine(th, 'Method', 'JazzCash'), infoLine(th, 'Amount', 'Rs. 3,000', { bold: true }));
  put(rc, spacer({ grow: true, fillW: true }));
  put(rc, button(th, 'View full size', 'secondary', { icon: 'eye', fillW: true }));
  put(r, d, rc);
  put(S.content, r);
  return S.root;
}

function workflowStepper(th) {
  var c = card(th, 'Order workflow', { fillW: true, gap: 20 });
  put(c, cardHeader(th, 'Order workflow', 'Employee login  >  Submit  >  Pending  >  Admin review  >  Approved  >  Dispatch'));
  var st = box('Stepper', { dir: 'h', fillW: true, align: 'MIN' });
  var steps = [['Submitted', '312', 'send', true], ['Pending review', '17', 'clock', true], ['Approved', '271', 'checkCircle', true],
    ['Ready to dispatch', '24', 'package', false], ['Dispatched', '247', 'truck', false]];
  steps.forEach(function (s, i) {
    var it = box('Step/' + s[0], { dir: 'v', gap: 8, align: 'CENTER', w: 150 });
    var ci = box('Circle', { dir: 'h', w: 48, h: 48, r: 24, align: 'CENTER', justify: 'CENTER',
      fills: s[3] ? grad(th.grad[0], th.grad[1], 'diag') : solid(th.primarySoft), shadow: s[3] ? glow(th) : null });
    put(ci, icon(s[2], s[3] ? '#FFFFFF' : th.primary, 22));
    put(it, ci, txt(s[0], 13, 'semibold', th.text), txt(s[1] + ' orders', 12, 'regular', th.muted));
    put(st, it);
    if (i < steps.length - 1) {
      var conn = box('Connector', { dir: 'v', pad: [23, 0, 0, 0], fillW: true });
      put(conn, box('Line', { h: 3, r: 2, fillW: true, fills: steps[i + 1][3] ? grad(th.grad[0], th.grad[1], 'h') : solid(th.border) }));
      put(st, conn);
    }
  });
  put(c, st);
  return c;
}

function screenReports(th, reg) {
  var S = shell(th, { name: '08 - Reports & Dispatch', key: 'reports', role: 'admin', crumbs: ['Admin', 'Reports & Dispatch'] }, reg);
  put(S.content, pageHeader(th, 'Reports & dispatch', 'Dispatch details and payment status for approved orders.',
    [button(th, 'Export CSV', 'secondary', { icon: 'download' }), button(th, 'Export PDF', 'primary', { icon: 'file' })]));
  put(S.content, workflowStepper(th));
  put(S.content, kpiRow(th, [
    kpi(th, 'Ready to Dispatch', '24', 'package', 'info', null, 'Approved, awaiting courier'),
    kpi(th, 'Dispatched', '247', 'truck', 'primary', '+11%', 'This month'),
    kpi(th, 'Amount Collected', 'Rs. 17,52,300', 'wallet', 'success', '+9%', '88% of billed'),
    kpi(th, 'Pending Payment', 'Rs. 2,32,200', 'clock', 'warning', null, 'COD + partial balances')]));
  var c = card(th, 'Dispatch report', { fillW: true, gap: 20 });
  var tb = box('Toolbar', { dir: 'h', fillW: true, justify: 'SPACE_BETWEEN', align: 'CENTER' });
  put(tb, tabs(th, [['All', '271'], ['Ready', '24'], ['Dispatched', '247'], ['Delivered', '198']], 0));
  var tr = box('Tools', { dir: 'h', gap: 10, align: 'CENTER' });
  put(tr, field(th, null, '01 Oct - 14 Oct 2026', { w: 240, icon: 'calendar', select: true }), button(th, 'Courier', 'secondary', { icon: 'truck', iconRight: 'chevronDown' }));
  put(tb, tr);
  put(c, tb);
  put(c, table(th, CONTENT_W - 48, [
    { label: 'Customer', w: 1.35 }, { label: 'Address', w: 2 }, { label: 'Amount', w: 0.85, bold: true },
    { label: 'Payment', w: 0.85 }, { label: 'Courier', w: 0.75, muted: true }, { label: 'Tracking No.', w: 1, link: true }, { label: 'Status', w: 1 }],
    [[{ person: 'Bilal Ahmed' }, 'House 24, Street 7, G-10, Islamabad', 'Rs. 7,800', { pill: 'Paid' }, 'TCS', 'TRK-884512', { pill: 'Delivered' }],
     [{ person: 'Hira Shah' }, 'Flat 3B, Gulberg III, Lahore', 'Rs. 2,650', { pill: 'Partial' }, 'Leopards', 'TRK-884498', { pill: 'Dispatched' }],
     [{ person: 'Ayesha Noor' }, 'House 11, Satellite Town, Rawalpindi', 'Rs. 9,300', { pill: 'Paid' }, 'TCS', 'TRK-884471', { pill: 'Dispatched' }],
     [{ person: 'Kashif Iqbal' }, 'House 56, Model Town, Multan', 'Rs. 12,400', { pill: 'Paid' }, 'M&P', 'TRK-884463', { pill: 'Ready' }],
     [{ person: 'Nida Aslam' }, 'House 8, DHA Phase 2, Karachi', 'Rs. 6,750', { pill: 'COD' }, 'Leopards', 'TRK-884450', { pill: 'Ready' }]]));
  put(c, pagination(th, 'Showing 1 - 5 of 271 dispatch records'));
  put(S.content, c);
  return S.root;
}

var SCREENS = [screenLogin, screenEmployeeDashboard, screenNewOrder, screenMyOrders,
  screenCommission, screenAdminDashboard, screenApprovals, screenReports];

// ============================================================
// Prototype wiring
// ============================================================
async function wirePrototype(reg) {
  var ok = 0;
  for (var i = 0; i < reg.links.length; i++) {
    var l = reg.links[i], dest = reg.frames[l.target];
    if (!dest) continue;
    var transition = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.25 };
    var modern = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: transition, preserveScrollPosition: false }] }];
    var legacy = [{ trigger: { type: 'ON_CLICK' }, action: { type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: transition, preserveScrollPosition: false } }];
    try {
      if (l.node.setReactionsAsync) await l.node.setReactionsAsync(modern); else l.node.reactions = modern;
      ok++;
    } catch (e1) {
      try {
        if (l.node.setReactionsAsync) await l.node.setReactionsAsync(legacy); else l.node.reactions = legacy;
        ok++;
      } catch (e2) { /* prototype links are optional */ }
    }
  }
  return ok;
}

// ============================================================
// Pages
// ============================================================
async function newPage(name) {
  var p = figma.createPage();
  p.name = name;
  return p;
}

function layoutGrid(page, frames, cols, gapX, gapY, y0) {
  var y = y0 || 0;
  for (var i = 0; i < frames.length; i += cols) {
    var rowH = 0;
    for (var j = 0; j < cols && i + j < frames.length; j++) {
      var f = frames[i + j];
      f.x = j * (W + gapX); f.y = y;
      rowH = Math.max(rowH, f.height);
    }
    y += rowH + gapY;
  }
}

function pageTitle(th, title, sub, w) {
  var t = box('Page title', { dir: 'v', gap: 10, w: w || 1600 });
  put(t, txt(title, 64, 'bold', th ? th.text : '#0F172A', { ls: -2 }), txt(sub, 22, 'regular', th ? th.muted : '#64748B', { fillW: true, lh: 32 }));
  return t;
}

async function buildThemePage(th, wire, report) {
  var page = await newPage(th.label + (th.recommended ? '  (recommended)' : ''));
  page.backgrounds = solid(th.dark ? '#05070D' : '#E9EBF2');
  var reg = { frames: {}, links: [] };
  var frames = [];
  for (var i = 0; i < SCREENS.length; i++) {
    report('Theme ' + th.name + ': screen ' + (i + 1) + ' of ' + SCREENS.length);
    var f = SCREENS[i](th, reg);
    page.appendChild(f);
    frames.push(f);
  }
  layoutGrid(page, frames, 4, 160, 240, 0);
  var title = pageTitle(th.dark ? th : null, th.label, th.mood + '   Press Present (play) to click through the prototype - starts at Login.', 4 * W + 3 * 160);
  if (th.dark) { title.children[0].fills = solid('#FFFFFF'); }
  page.appendChild(title);
  title.x = 0; title.y = -title.height - 120;
  var links = 0;
  if (wire) {
    report('Theme ' + th.name + ': wiring prototype links');
    links = await wirePrototype(reg);
    try { page.flowStartingPoints = [{ nodeId: reg.frames['login'].id, name: th.name + ' - full flow' }]; } catch (e) { }
  }
  return { page: page, links: links };
}

// ---------- Design system ----------
function swatch(th, name, paints, hex) {
  var s = box('Swatch/' + name, { dir: 'v', gap: 8, w: 168 });
  var chip = box('Chip', { w: 168, h: 96, r: 14, fills: paints, stroke: th.border });
  put(s, chip, txt(name, 13, 'semibold', th.text), txt(hex, 12, 'regular', th.muted));
  return s;
}

function dsSection(th, title, sub) {
  var s = box('Section/' + title, { dir: 'v', gap: 20, fillW: true });
  var h = box('Head', { dir: 'v', gap: 4 });
  put(h, txt(title, 22, 'bold', th.text), txt(sub, 14, 'regular', th.muted));
  put(s, h);
  return s;
}

function designSystemFrame(th) {
  var f = box(th.label + ' - Design system', { dir: 'v', gap: 48, pad: 64, w: W, fill: th.bg, r: 24 });
  var head = box('Header', { dir: 'h', gap: 20, align: 'CENTER', fillW: true });
  var ht = box('Title', { dir: 'v', gap: 6, fillW: true });
  put(ht, txt(th.label, 36, 'bold', th.text, { ls: -2 }), txt(th.mood, 15, 'regular', th.muted, { fillW: true, lh: 22 }));
  put(head, logoMark(th, 64), ht);
  if (th.recommended) put(head, pill(th, 'Recommended', 'success'));
  put(f, head);

  var colors = dsSection(th, 'Colour palette', 'Saved as Figma colour styles under "' + th.name + ' /".');
  var grid = box('Swatches', { dir: 'h', gap: 20, fillW: true });
  [['Primary', th.primary], ['Primary hover', th.primaryHover], ['Primary soft', th.primarySoft], ['Accent', th.accent],
   ['Background', th.bg], ['Surface', th.surface], ['Border', th.border], ['Text', th.text], ['Muted text', th.muted],
   ['Sidebar', th.sidebar], ['Success', th.status.success.solid], ['Warning', th.status.warning.solid], ['Danger', th.status.danger.solid]].forEach(function (c) {
    put(grid, swatch(th, c[0], solid(c[1]), c[1]));
  });
  put(grid, swatch(th, 'Brand gradient', grad(th.grad[0], th.grad[1], 'diag'), th.grad[0] + ' > ' + th.grad[1]));
  put(colors, grid);
  grid.layoutWrap = 'WRAP'; grid.counterAxisSpacing = 24;
  put(f, colors);

  var type = dsSection(th, 'Typography', 'Inter - one family, five weights. Sizes in px.');
  [['Display  ·  50 / Bold', 50, 'bold'], ['Heading 1  ·  28 / Bold', 28, 'bold'], ['Heading 2  ·  20 / Semi Bold', 20, 'semibold'],
   ['Card title  ·  16 / Semi Bold', 16, 'semibold'], ['Body  ·  14 / Regular - used for tables, forms and descriptions.', 14, 'regular'],
   ['Caption  ·  12 / Medium', 12, 'medium']].forEach(function (t) { put(type, txt(t[0], t[1], t[2], th.text, { ls: t[1] > 24 ? -2 : 0 })); });
  put(f, type);

  var comp = dsSection(th, 'Components', 'Buttons, badges, inputs, navigation and cards used across all 8 screens.');
  var b1 = box('Buttons', { dir: 'h', gap: 12, align: 'CENTER' });
  put(b1, button(th, 'Primary', 'primary', { icon: 'plus' }), button(th, 'Gradient', 'gradient', { iconRight: 'arrowRight' }),
    button(th, 'Secondary', 'secondary', { icon: 'download' }), button(th, 'Soft', 'soft'), button(th, 'Ghost link', 'ghost', { iconRight: 'arrowRight' }),
    button(th, 'Approve', 'success', { icon: 'check', size: 'sm' }), button(th, 'Reject', 'dangerSoft', { icon: 'x', size: 'sm' }));
  put(comp, b1);
  var b2 = box('Badges', { dir: 'h', gap: 10, align: 'CENTER' });
  ['Pending', 'Approved', 'Rejected', 'Paid', 'Partial', 'COD', 'Ready', 'Dispatched', 'Delivered'].forEach(function (s) { put(b2, pill(th, s)); });
  put(comp, b2);
  var b3 = box('Inputs', { dir: 'h', gap: 16, fillW: true });
  put(b3, field(th, 'Default', 'Placeholder text', { icon: 'user' }), field(th, 'Focused', '', { icon: 'mail', focus: true, value: 'ali.hassan@orderhub.pk' }),
    field(th, 'Select', 'Choose', { select: true, value: 'Partial Payment' }), field(th, 'Read only', '', { prefix: 'Rs.', value: '2,200', readonly: true }));
  put(comp, b3);
  var b4 = box('Cards', { dir: 'h', gap: 20, fillW: true, align: 'MIN' });
  var navDemo = box('Sidebar sample', { dir: 'v', gap: 6, pad: 16, w: 264, r: 16, fill: th.sidebar, stroke: th.sidebarBorder || th.sidebar });
  put(navDemo, navItem(th, 'Dashboard', 'home', true), navItem(th, 'Order Approval', 'checkCircle', false, '17'), navItem(th, 'Reports & Dispatch', 'truck', false));
  put(b4, navDemo, kpi(th, 'Total Orders', '312', 'package', 'primary', '+14%', '271 approved'),
    kpi(th, 'Pending Approvals', '17', 'clock', 'warning', null, 'Needs your review'), tabs(th, [['All', '48'], ['Pending', '6'], ['Approved', '39']], 0));
  put(comp, b4);
  put(f, comp);
  return f;
}

function createStyles(th) {
  var list = [['Primary', th.primary], ['Primary hover', th.primaryHover], ['Primary soft', th.primarySoft], ['Accent', th.accent],
    ['Background', th.bg], ['Surface', th.surface], ['Border', th.border], ['Text', th.text], ['Muted', th.muted], ['Sidebar', th.sidebar],
    ['Success', th.status.success.solid], ['Warning', th.status.warning.solid], ['Danger', th.status.danger.solid]];
  var made = 0;
  list.forEach(function (c) {
    try { var s = figma.createPaintStyle(); s.name = th.name + '/' + c[0]; s.paints = solid(c[1]); made++; } catch (e) { }
  });
  try { var g = figma.createPaintStyle(); g.name = th.name + '/Brand gradient'; g.paints = grad(th.grad[0], th.grad[1], 'diag'); made++; } catch (e) { }
  return made;
}

// ---------- Cover ----------
function coverFrame(themes) {
  var ink = '#0B1020';
  var f = box('Cover', { dir: 'v', gap: 56, pad: 96, w: 1920, fill: ink, clip: true, r: 32 });
  put(f, circle(900, '#4F46E5', { op: 0.25, abs: [1300, -380] }), circle(700, '#06B6D4', { op: 0.16, abs: [-260, 700] }));
  var head = box('Heading', { dir: 'v', gap: 18 });
  var tag = box('Tag', { dir: 'h', gap: 8, pad: [8, 14], r: 999, fill: '#FFFFFF', op: 0.08, stroke: '#FFFFFF', strokeOp: 0.15, align: 'CENTER' });
  put(tag, txt('WEB ENGINEERING  ·  SEMESTER CAPSTONE PROJECT', 13, 'semibold', '#C7D2FE', { ls: 8 }));
  put(head, tag);
  var logoRow = box('Logo row', { dir: 'h', gap: 24, align: 'CENTER' });
  put(logoRow, logoMark(themes[0], 96), txt('OrderHub', 110, 'black', '#FFFFFF', { ls: -4 }));
  put(head, logoRow);
  put(head, txt('Order Management System  -  UI / UX design in three colour directions', 30, 'medium', '#FFFFFF', { op: 0.85 }));
  put(head, txt('Taimour Mushtaq  ·  BS Computer Science, 5th Semester  ·  Federal Urdu University of Arts, Science & Technology', 18, 'regular', '#FFFFFF', { op: 0.6 }));
  put(f, head);

  var cards = box('Theme options', { dir: 'h', gap: 28, fillW: true });
  themes.forEach(function (th) {
    var c = box('Option ' + th.letter, { dir: 'v', gap: 18, pad: 28, r: 24, fill: '#FFFFFF', op: 0.05, stroke: '#FFFFFF', strokeOp: 0.12, fillW: true });
    var prev = box('Mini preview', { dir: 'h', h: 170, r: 16, fill: th.bg, fillW: true, clip: true });
    var sb = box('Mini sidebar', { dir: 'v', gap: 8, pad: 12, w: 70, fill: th.sidebar, fillH: true });
    put(sb, logoMark(th, 22), rect(46, 8, th.activeBg, { r: 4 }), rect(40, 6, th.sideText, { r: 3, op: 0.5 }), rect(44, 6, th.sideText, { r: 3, op: 0.5 }));
    var mn = box('Mini content', { dir: 'v', gap: 10, pad: 14, fillW: true });
    var kr = box('Mini KPIs', { dir: 'h', gap: 8, fillW: true });
    [th.primary, th.status.warning.solid, th.status.success.solid].forEach(function (cc) {
      var k = box('k', { dir: 'v', gap: 6, pad: 10, r: 8, fill: th.surface, stroke: th.border, fillW: true });
      put(k, rect(18, 18, cc, { r: 5 }), rect(40, 6, th.text, { r: 3, op: 0.7 }));
      put(kr, k);
    });
    var ch = box('Mini chart', { dir: 'h', gap: 6, pad: 10, r: 8, fill: th.surface, stroke: th.border, fillW: true, align: 'MAX', h: 64 });
    [20, 34, 24, 42, 30, 16].forEach(function (hh, i) { put(ch, rect(14, hh, null, { r: 3, fills: i === 3 ? grad(th.grad[0], th.grad[1], 'v') : solid(th.primary, 0.25) })); });
    put(mn, kr, ch);
    put(prev, sb, mn);
    put(c, prev);
    var sw = box('Swatches', { dir: 'h', gap: 8 });
    [th.primary, th.grad[1], th.accent, th.sidebar, th.bg].forEach(function (cc) { put(sw, circle(28, cc, { stroke: '#FFFFFF', sw: 2 })); });
    put(c, sw);
    var nm = box('Name', { dir: 'h', gap: 10, align: 'CENTER' });
    put(nm, txt('Option ' + th.letter + '  ·  ' + th.name, 24, 'bold', '#FFFFFF'));
    if (th.recommended) {
      var rb = box('Recommended', { dir: 'h', pad: [4, 10], r: 999, fills: grad(th.grad[0], th.grad[1], 'h') });
      put(rb, txt('Recommended', 12, 'bold', '#FFFFFF'));
      put(nm, rb);
    }
    put(c, nm, txt(th.mood, 15, 'regular', '#FFFFFF', { op: 0.7, fillW: true, lh: 22 }));
    put(cards, c);
  });
  put(f, cards);

  var how = box('How to use', { dir: 'h', gap: 28, fillW: true });
  [['8 screens per option', 'Login, Employee Dashboard, New Order, My Orders, Commission, Admin Dashboard, Order Approval, Reports & Dispatch.'],
   ['Clickable prototype', 'Open an Option page and press Present. Sidebar links, Sign in, New Order and Logout all navigate.'],
   ['Docs inside', 'Design System page has colour styles, type and components. Sitemap & ERD page has the data model.']].forEach(function (h) {
    var b = box(h[0], { dir: 'v', gap: 6, fillW: true });
    put(b, txt(h[0], 18, 'bold', '#FFFFFF'), txt(h[1], 15, 'regular', '#FFFFFF', { op: 0.65, fillW: true, lh: 22 }));
    put(how, b);
  });
  put(f, how);
  return f;
}

// ---------- Sitemap & ERD ----------
function line(parent, pts, color, weight, dash) {
  var minX = Infinity, minY = Infinity;
  pts.forEach(function (p) { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); });
  var v = figma.createVector();
  v.vectorPaths = [{ windingRule: 'NONE', data: pts.map(function (p, i) { return (i ? 'L ' : 'M ') + (p[0] - minX) + ' ' + (p[1] - minY); }).join(' ') }];
  v.strokes = solid(color);
  v.strokeWeight = weight || 2;
  v.strokeJoin = 'ROUND';
  if (dash) v.dashPattern = dash;
  v.fills = [];
  v.name = 'connector';
  parent.appendChild(v);
  v.x = minX; v.y = minY;
  return v;
}

function sitemapFrame(th) {
  var Wd = 1720, Hd = 760;
  var f = box('Sitemap', { w: Wd, h: Hd, fill: th.surface, r: 24, stroke: th.border });
  var t = txt('Sitemap & navigation', 32, 'bold', th.text, { ls: -1 });
  f.appendChild(t); t.x = 56; t.y = 48;
  var s = txt('Shared login splits into two role-based areas. Every page links back to its dashboard and to Logout.', 16, 'regular', th.muted);
  f.appendChild(s); s.x = 56; s.y = 96;
  function node(label, sub, x, y, kind) {
    var n = box('Page/' + label, { dir: 'v', gap: 2, pad: [14, 20], r: 14, w: 230, align: 'CENTER',
      fills: kind === 'root' ? grad(th.grad[0], th.grad[1], 'diag') : solid(kind === 'hub' ? th.primarySoft : th.surface),
      stroke: kind === 'leaf' ? th.border : null, shadow: kind === 'root' ? glow(th) : null });
    put(n, txt(label, 15, 'bold', kind === 'root' ? '#FFFFFF' : (kind === 'hub' ? th.status.primary.fg : th.text)),
      txt(sub, 12, 'regular', kind === 'root' ? '#FFFFFF' : th.muted, { op: kind === 'root' ? 0.85 : 1 }));
    f.appendChild(n); n.x = x; n.y = y;
    return n;
  }
  var root = node('Login', 'index.html', Wd / 2 - 115, 170, 'root');
  var emp = node('Employee Dashboard', 'employee-dashboard.html', 380, 330, 'hub');
  var adm = node('Admin Dashboard', 'admin-dashboard.html', 1110, 330, 'hub');
  var empKids = [['New Order', 'new-order.html'], ['My Orders', 'my-orders.html'], ['Commission', 'commission.html']];
  var admKids = [['Order Approval', 'approvals.html'], ['Reports & Dispatch', 'reports-dispatch.html']];
  var c = th.dark ? th.subtle : th.primary;
  var ry = root.y + root.height, hy = 330;
  line(f, [[root.x + 115, ry], [root.x + 115, ry + 40], [emp.x + 115, ry + 40], [emp.x + 115, hy]], c, 2);
  line(f, [[root.x + 115, ry + 40], [adm.x + 115, ry + 40], [adm.x + 115, hy]], c, 2);
  var ky = 520;
  empKids.forEach(function (k, i) {
    var x = 100 + i * 280;
    var n = node(k[0], k[1], x, ky, 'leaf');
    line(f, [[emp.x + 115, emp.y + emp.height], [emp.x + 115, ky - 40], [x + 115, ky - 40], [x + 115, ky]], c, 2);
  });
  admKids.forEach(function (k, i) {
    var x = 970 + i * 290;
    node(k[0], k[1], x, ky, 'leaf');
    line(f, [[adm.x + 115, adm.y + adm.height], [adm.x + 115, ky - 40], [x + 115, ky - 40], [x + 115, ky]], c, 2);
  });
  var lg = txt('Logout (on every page)  >  returns to Login', 13, 'medium', th.muted);
  f.appendChild(lg); lg.x = 56; lg.y = Hd - 56;
  return f;
}

// Long ENUM lists are shortened on the diagram; the SRS data dictionary lists every value.
function shortType(t) { return t.length > 14 ? t.replace(/\(.*\)/, '(...)') : t; }

function erdFrame(th) {
  var L = erdLayout();
  var top = 150;
  var f = box('ERD - OrderHub database', { w: L.width, h: L.height + top, fill: th.surface, r: 24, stroke: th.border });
  var t = txt('Entity Relationship Diagram', 32, 'bold', th.text, { ls: -1 });
  f.appendChild(t); t.x = ERD_LAYOUT.margin; t.y = 48;
  var s = txt('9 entities  ·  PK = primary key, FK = foreign key, UK = unique  ·  1 / N / 0..1 = cardinality', 16, 'regular', th.muted);
  f.appendChild(s); s.x = ERD_LAYOUT.margin; s.y = 96;
  var lc = th.dark ? th.subtle : '#94A3B8';
  L.lines.forEach(function (ln) {
    line(f, ln.pts.map(function (p) { return [p[0], p[1] + top]; }), lc, 2);
    function chip(text, at, strong) {
      var c = box('Card ' + text, { dir: 'h', pad: [2, 8], r: 6, fill: strong ? th.primary : th.surface, stroke: strong ? null : lc });
      put(c, txt(text, 12, 'bold', strong ? th.onPrimary : th.text));
      f.appendChild(c); c.x = at[0]; c.y = at[1] + top;
    }
    chip(ln.rel.ca, ln.ta, true);
    chip(ln.rel.cb, ln.tb, true);
    var lab = box('Rel ' + ln.rel.label, { dir: 'h', pad: [3, 8], r: 6, fill: th.surfaceAlt });
    put(lab, txt(ln.rel.label, 12, 'medium', th.muted));
    f.appendChild(lab);
    lab.x = Math.round(ln.rel.kind === 'h' || ln.rel.kind.indexOf('elbow') === 0 ? ln.tl[0] - lab.width / 2 : ln.tl[0]);
    lab.y = Math.round(ln.tl[1] + top);
  });
  ERD.entities.forEach(function (e) {
    var p = L.pos[e.id];
    var b = box('Entity/' + e.id, { dir: 'v', w: p.w, h: p.h, r: 12, fill: th.surface, stroke: th.dark ? th.subtle : th.border, clip: true,
      shadow: cardShadow(th) });
    var hd = box('Header', { dir: 'h', gap: 10, h: ERD_LAYOUT.headH, pad: [0, 16], align: 'CENTER', fillW: true, fills: grad(th.grad[0], th.grad[1], 'h') });
    put(hd, icon('table', '#FFFFFF', 16), txt(e.id, 14, 'bold', '#FFFFFF', { ls: 4 }));
    put(b, hd);
    e.attrs.forEach(function (a, i) {
      var r = box('Attr/' + a[0], { dir: 'h', gap: 8, h: ERD_LAYOUT.rowH, pad: [0, 14], align: 'CENTER', fillW: true,
        fill: i % 2 ? th.surfaceAlt : null });
      var key = box('Key', { dir: 'h', w: 50, align: 'CENTER' });
      if (a[2]) {
        var isPk = a[2] === 'PK';
        var tone = isPk ? th.status.warning : (a[2].indexOf('FK') === 0 ? th.status.info : th.status.neutral);
        var kc = box('Tag', { dir: 'h', pad: [1, 5], r: 4, fill: tone.bg });
        put(kc, txt(a[2].replace(', ', '/'), 10, 'bold', tone.fg));
        put(key, kc);
      }
      put(r, key, txt(a[0], 13, a[2] === 'PK' ? 'bold' : 'medium', th.text, { w: 150 }),
        txt(shortType(a[1]), 11, 'regular', th.muted, { fillW: true, align: 'RIGHT' }));
      put(b, r);
    });
    f.appendChild(b); b.x = p.x; b.y = p.y + top;
  });
  return f;
}

// ============================================================
// Main
// ============================================================
figma.showUI(__html__, { width: 400, height: 640, themeColors: true });

figma.ui.onmessage = async function (msg) {
  if (msg.type === 'cancel') { figma.closePlugin(); return; }
  if (msg.type !== 'generate') return;
  var report = function (t) { figma.ui.postMessage({ type: 'progress', text: t }); };
  try {
    report('Loading fonts...');
    var fam = await loadFonts();
    var themes = THEMES.filter(function (t) { return msg.themes.indexOf(t.key) !== -1; });
    if (!themes.length) themes = THEMES;

    // Cover on the first page if it is empty, otherwise on a new page.
    var first = figma.root.children[0];
    if (first && first.loadAsync) await first.loadAsync();
    var coverPage;
    if (first && first.children.length === 0) { coverPage = first; coverPage.name = 'Cover - OrderHub'; }
    else coverPage = await newPage('Cover - OrderHub');
    coverPage.backgrounds = solid('#05070D');
    report('Building cover...');
    var cover = coverFrame(themes);
    coverPage.appendChild(cover);

    var stylesMade = 0;
    if (msg.designSystem) {
      report('Building design system...');
      var ds = await newPage('Design System');
      ds.backgrounds = solid('#E9EBF2');
      var x = 0;
      themes.forEach(function (th) {
        var f = designSystemFrame(th);
        ds.appendChild(f); f.x = x; f.y = 0; x += W + 120;
        stylesMade += createStyles(th);
      });
    }

    var totalLinks = 0;
    for (var i = 0; i < themes.length; i++) {
      var res = await buildThemePage(themes[i], msg.prototype, report);
      totalLinks += res.links;
    }

    if (msg.diagrams) {
      report('Drawing sitemap & ERD...');
      var dp = await newPage('Sitemap & ERD');
      dp.backgrounds = solid('#E9EBF2');
      var sm = sitemapFrame(themes[0]);
      dp.appendChild(sm); sm.x = 0; sm.y = 0;
      var er = erdFrame(themes[0]);
      dp.appendChild(er); er.x = 0; er.y = sm.height + 160;
    }

    if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(coverPage); else figma.currentPage = coverPage;
    figma.viewport.scrollAndZoomIntoView([cover]);
    var summary = 'Done! ' + themes.length + ' theme(s) x 8 screens' + (msg.prototype ? ', ' + totalLinks + ' prototype links' : '') +
      (stylesMade ? ', ' + stylesMade + ' colour styles' : '') + (fam !== 'Inter' ? ' (font fallback: ' + fam + ')' : '') + '.';
    figma.ui.postMessage({ type: 'done', text: summary });
    figma.notify(summary, { timeout: 6000 });
  } catch (err) {
    var m = (err && err.message) ? err.message : String(err);
    figma.ui.postMessage({ type: 'error', text: m });
    figma.notify('OrderHub generator error: ' + m, { error: true, timeout: 10000 });
  }
};
