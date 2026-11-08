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

if (typeof module !== 'undefined') module.exports = { ERD: ERD, ERD_LAYOUT: ERD_LAYOUT, erdLayout: erdLayout };
