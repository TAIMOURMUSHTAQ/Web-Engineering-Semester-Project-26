// Builds docs/SRS_OrderHub.docx and docs/Requirements_and_Traceability_OrderHub.docx
// Usage: node docs/src/build-docs.js   (needs the "docx" npm package)
const fs = require('fs');
const path = require('path');
const D = require(process.env.DOCX_PATH || 'docx');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  HeadingLevel, ImageRun, PageBreak, LevelFormat, BorderStyle, TableOfContents, Footer, Header, PageNumber,
  VerticalAlign
} = D;
const C = require('./content.js');
const { ERD } = require('../../design/src/erd-data.js');

const ROOT = path.join(__dirname, '..', '..');
const DOCS = path.join(__dirname, '..');
const CONTENT_W = 9638; // A4 with 2 cm margins, in DXA
const INK = '1E1B4B', ACCENT = '4F46E5', MUTED = '64748B', HEAD_FILL = 'EEF2FF', ALT_FILL = 'F7F8FC', LINE = 'D9DCE8';

// ---------- helpers ----------
const run = (t, o = {}) => new TextRun({ text: t, ...o });
function P(text, o = {}) {
  const children = Array.isArray(text) ? text : [run(text, o.run || {})];
  return new Paragraph({ children, spacing: { after: 120, line: 288 }, ...o.para });
}
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t)], pageBreakBefore: false });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(t)] });
const H3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run(t)] });
const bullet = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'bullets', level: lvl }, spacing: { after: 60, line: 276 },
  children: Array.isArray(t) ? t : [run(t)] });
const numbered = (t, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 276 }, children: [run(t)] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
const caption = t => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240 },
  children: [run(t, { italics: true, size: 18, color: MUTED })] });

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(content, width, o = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map(c =>
    c instanceof Paragraph ? c : new Paragraph({ spacing: { after: 40 }, keepNext: !!o.keepNext, keepLines: true,
      children: [run(String(c), { bold: o.bold, size: o.size || 19, color: o.color })] }));
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.TOP,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: paras
  });
}

// weights -> DXA widths that sum to CONTENT_W
function widths(weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const w = weights.map(x => Math.floor(CONTENT_W * x / sum));
  w[w.length - 1] += CONTENT_W - w.reduce((a, b) => a + b, 0);
  return w;
}

function table(header, rows, weights, o = {}) {
  const w = widths(weights);
  const head = new TableRow({ tableHeader: true, children: header.map((h, i) => cell(h, w[i], { bold: true, fill: HEAD_FILL, color: INK })) });
  const body = rows.map((r, ri) => new TableRow({ children: r.map((v, i) =>
    cell(v, w[i], { fill: ri % 2 ? ALT_FILL : undefined, bold: o.boldFirst && i === 0 })) }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w, rows: [head, ...body] });
}

function kvTable(rows, weights = [1, 3]) {
  const w = widths(weights);
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w,
    rows: rows.map(r => new TableRow({ cantSplit: true, children: [cell(r[0], w[0], { bold: true, fill: HEAD_FILL, color: INK, keepNext: true }), cell(r[1], w[1], { keepNext: true })] })) });
}

function image(file, maxWpx, maxHpx) {
  const buf = fs.readFileSync(file);
  const iw = buf.readUInt32BE(16), ih = buf.readUInt32BE(20);
  let w = maxWpx, h = Math.round(maxWpx * ih / iw);
  if (maxHpx && h > maxHpx) { h = maxHpx; w = Math.round(maxHpx * iw / ih); }
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: 'png', data: buf, transformation: { width: w, height: h } })] });
}
const spacer = () => new Paragraph({ spacing: { after: 80 }, children: [] });

function titlePage(title, subtitle) {
  const P_ = C.PROJECT;
  return [
    new Paragraph({ spacing: { before: 1800, after: 120 }, children: [run(P_.uni.toUpperCase(), { size: 20, bold: true, color: MUTED })] }),
    new Paragraph({ spacing: { after: 600 }, children: [run(P_.course, { size: 22, color: MUTED })] }),
    new Paragraph({ spacing: { after: 160 }, children: [run(title, { size: 52, bold: true, color: INK })] }),
    new Paragraph({ spacing: { after: 160 }, children: [run(subtitle, { size: 30, color: ACCENT })] }),
    new Paragraph({ spacing: { after: 900 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } }, children: [] }),
    kvTable([['Project', P_.full], ['Prepared by', P_.student], ['Programme', P_.program], ['Version', P_.version], ['Date', P_.date],
      ['Related work', 'Phase 1 HTML/CSS prototype and report; Figma design (OrderHub-Figma-Plugin.zip)']], [1, 3]),
    pageBreak()
  ];
}

function makeDoc(children) {
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
    run(C.PROJECT.full + '   |   Page ', { size: 16, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED })] })] });
  return new Document({
    creator: C.PROJECT.student, title: C.PROJECT.full,
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: 'Calibri', size: 21, color: '1F2937' } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 34, bold: true, color: INK }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0, keepNext: true, keepLines: true } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, color: ACCENT }, paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 1, keepNext: true, keepLines: true } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 22, bold: true, color: INK }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2, keepNext: true, keepLines: true } }
      ]
    },
    numbering: { config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } }] },
      ...Array.from({ length: 12 }, (_, i) => ({ reference: 'num' + i, levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] }))
    ] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      footers: { default: footer },
      children
    }]
  });
}

const REL_MEANING = {
  'USERS-EMPLOYEES': 'Each employee has exactly one user account; an employee profile belongs to one user.',
  'EMPLOYEES-COMMISSIONS': 'An employee earns one commission record per month.',
  'USERS-ORDER_APPROVALS': 'An administrator (user with role admin) records many approval decisions.',
  'EMPLOYEES-ORDERS': 'An employee creates many orders; each order is recorded by one employee.',
  'ORDER_APPROVALS-ORDERS': 'Each approval decision is about one order; an order can have decision records.',
  'ORDERS-CUSTOMERS': 'A customer places many orders; each order belongs to one customer.',
  'ORDERS-PAYMENTS': 'An order can receive several payments (advance and balance).',
  'ORDERS-ORDER_ITEMS': 'An order contains one or more line items.',
  'ORDERS-DISPATCHES': 'An approved order has at most one dispatch record.'
};

const frRows = ids => C.FR.filter(f => ids.includes(f[1])).map(f => [f[0], f[2], f[3], f[4]]);

// ============================================================
// SRS
// ============================================================
function buildSRS() {
  const k = [];
  k.push(...titlePage('Software Requirements Specification', C.PROJECT.full));

  k.push(H1('Revision history'));
  k.push(table(['Version', 'Date', 'Author', 'Change'], [
    ['0.1', '12 Oct 2026', C.PROJECT.student, 'Phase 1 report: problem statement, basic functional and non-functional requirements, sitemap.'],
    ['1.0', '14 Oct 2026', C.PROJECT.student, 'Full SRS (IEEE 830 structure): detailed requirements, interfaces, data model (ERD + data dictionary), business rules, use cases and UI design reference.']
  ], [1, 1.3, 1.5, 5]));
  k.push(H1('Table of contents'));
  k.push(new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }));
  k.push(P('(If the contents are empty, right-click here and choose "Update Field".)', { run: { italics: true, size: 18, color: MUTED } }));
  k.push(pageBreak());

  // 1 Introduction
  k.push(H1('1. Introduction'));
  k.push(H2('1.1 Purpose'));
  k.push(P('This document specifies the software requirements of OrderHub, a web-based Order Management System built as the Web Engineering semester project. It is the reference for the remaining project phases (JavaScript, backend, database, authentication, testing and deployment) and for evaluating the finished system.'));
  k.push(H2('1.2 Scope'));
  k.push(P('OrderHub lets a small business record customer orders through its employees and lets an administrator approve them, verify payments, track commissions and manage dispatch. It covers:'));
  ['Shared login with two roles: Employee and Administrator.', 'Order entry with customer, item and payment details (COD, Partial or Full Payment) and receipt upload.',
    'Order tracking and status (Pending, Approved, Rejected).', 'Monthly commission calculation per employee.',
    'Order approval and payment verification by the administrator.', 'Dispatch recording with courier tracking numbers, and reports.']
    .forEach(t => k.push(bullet(t)));
  k.push(P('Out of scope: online payment gateways, customer self-service ordering, inventory and stock control, and courier API integration.'));
  k.push(H2('1.3 Definitions and acronyms'));
  k.push(table(['Term', 'Meaning'], [
    ['Admin', 'Administrator: the business owner or manager who reviews orders.'], ['Employee', 'A sales staff member who records orders.'],
    ['COD', 'Cash on Delivery: the customer pays the courier on delivery.'], ['Partial Payment', 'The customer pays an advance; the balance is collected on delivery.'],
    ['Full Payment', 'The customer pays the full amount before dispatch.'], ['Receipt', 'Proof of a bank, JazzCash or EasyPaisa transfer uploaded by the employee.'],
    ['Dispatch', 'Handing an approved order to a courier with a tracking number.'], ['KPI', 'Key performance indicator (summary figure on a dashboard).'],
    ['SRS', 'Software Requirements Specification.'], ['ERD', 'Entity Relationship Diagram.'], ['FR / NFR / BR', 'Functional / non-functional requirement / business rule.'],
    ['P1-P5', 'Project phases: P1 HTML/CSS, P2 JavaScript, P3 backend, P4 database, P5 authentication, testing and deployment.']
  ], [1.3, 5]));
  k.push(H2('1.4 References'));
  ['Web Engineering Practical Assignment 01 brief - Phase 1: Front-End Prototype of an Order Management System.',
    'Web_Engineering_Assignment01_Report.docx - Phase 1 report (problem statement, requirements, sitemap, screenshots).',
    'OrderHub Figma design - generated by design/OrderHub-Figma-Plugin.zip (three colour options, eight screens each).',
    'IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications.',
    'Requirements_and_Traceability_OrderHub.docx - user stories, detailed use cases, traceability matrix and test cases (companion document).']
    .forEach(t => k.push(bullet(t)));
  k.push(H2('1.5 Overview'));
  k.push(P('Section 2 describes the product and its users. Section 3 covers the external interfaces, including the UI design. Section 4 lists the functional requirements by feature. Section 5 lists the non-functional requirements. Section 6 defines the data model and business rules. Section 7 summarises the use cases.'));

  // 2 Overall description
  k.push(H1('2. Overall description'));
  k.push(H2('2.1 Product perspective'));
  k.push(P('OrderHub is a new, self-contained web application that replaces manual, paper-based order recording. It is built in phases on the same code base:'));
  k.push(table(['Phase', 'Technology', 'Delivers'], [
    ['P1', 'HTML5, CSS3', 'Static prototype of all eight pages with sample data (completed).'],
    ['P2', 'JavaScript', 'Form validation, live balance calculation, filtering and search, interactive Approve / Reject.'],
    ['P3', 'Backend (PHP / Node / Python)', 'Server-side validation, business rules, file upload, session handling.'],
    ['P4', 'Relational database (MySQL)', 'Tables from the ERD in Section 6; CRUD for orders, payments, approvals and dispatches.'],
    ['P5', 'Auth, testing, hosting', 'Real login and role-based access, test execution, deployment.']
  ], [0.6, 1.8, 5]));
  k.push(H2('2.2 Product functions'));
  ['Authenticate users and route them to the correct dashboard.', 'Record orders with customer, item and payment information.',
    'Track order status and show dashboards with KPIs and charts.', 'Calculate and display monthly employee commission.',
    'Approve or reject orders and verify payment receipts.', 'Record dispatch details and produce dispatch / payment reports.']
    .forEach(t => k.push(bullet(t)));
  k.push(H2('2.3 User classes and characteristics'));
  k.push(table(['User class', 'Description', 'Main responsibilities'], [
    ['Employee', 'Sales staff; basic computer skills; uses the system many times a day, often under time pressure.', 'Enter customer and order details, choose the payment method, upload receipts, track order status, view commission.'],
    ['Administrator', 'Owner or manager; uses the system daily to control orders and money.', 'Review and approve / reject orders, verify payments, monitor balances and commissions, manage employees, prepare dispatch and reports.']
  ], [1.2, 2.6, 3.4]));
  k.push(H2('2.4 Operating environment'));
  ['Client: any modern browser (Chrome, Edge, Firefox) on Windows, macOS, Android or iOS.', 'Server: Apache / Nginx or Node.js on Linux or Windows; MySQL 8 (or MariaDB).',
    'Local development: XAMPP / WAMP or Node.js; the Phase 1 prototype opens directly from the file system.']
    .forEach(t => k.push(bullet(t)));
  k.push(H2('2.5 Design and implementation constraints'));
  ['One external stylesheet controls the design; inline CSS is not the main styling method (course rule).', 'Semantic HTML5 elements (header, nav, main, section, article, footer) on every page.',
    'Meaningful file names and the folder structure defined in Phase 1 must be kept, because every later phase extends the same project.',
    'Currency is Pakistani Rupees (Rs.) with South-Asian digit grouping (e.g. Rs. 19,84,500).']
    .forEach(t => k.push(bullet(t)));
  k.push(H2('2.6 Assumptions and dependencies'));
  ['Each employee has a personal account; accounts are not shared.', 'Customers pay through COD, bank transfer, JazzCash or EasyPaisa; the system only records proof and does not process payments.',
    'Courier tracking numbers are entered manually (no courier API).', 'The business operates with one administrator role (one or more administrator accounts).']
    .forEach(t => k.push(bullet(t)));

  // 3 External interfaces
  k.push(H1('3. External interface requirements'));
  k.push(H2('3.1 User interfaces'));
  k.push(P('The user interface is specified by the OrderHub Figma design, which has eight screens in three colour options: A - Indigo Aurora (recommended), B - Emerald Fresh and C - Midnight Neon (dark). All screens share a left sidebar for navigation, a top bar with search, notifications and the user profile, and a content area of cards, tables and forms.'));
  k.push(table(['Screen', 'File (Phase 1)', 'User', 'Content'], C.SCREENS, [1.4, 1.7, 1.1, 3.6]));
  k.push(spacer());
  k.push(image(path.join(DOCS, 'figma-previews', 'A-indigo-login.png'), 560));
  k.push(caption('Figure 1: Login screen - Option A, Indigo Aurora.'));
  k.push(image(path.join(DOCS, 'figma-previews', 'A-indigo-employee-dashboard.png'), 560));
  k.push(caption('Figure 2: Employee Dashboard - Option A, Indigo Aurora.'));
  k.push(image(path.join(DOCS, 'figma-previews', 'B-emerald-new-order.png'), 480, 560));
  k.push(caption('Figure 3: New Order form - Option B, Emerald Fresh.'));
  k.push(image(path.join(DOCS, 'figma-previews', 'C-midnight-order-approval.png'), 560));
  k.push(caption('Figure 4: Order Approval with receipt verification - Option C, Midnight Neon.'));
  k.push(P('UI rules that apply to every screen:'));
  ['Status is always shown as a coloured badge with text: Pending (amber), Approved / Paid / Delivered (green), Rejected (red), COD / Dispatched (blue), Ready (grey).',
    'Required form fields are marked with a red asterisk, and errors appear directly below the field.', 'Primary actions use the primary button; destructive actions (Reject) use the red soft button.',
    'Money is right-aligned in tables in bold and prefixed with "Rs.".']
    .forEach(t => k.push(bullet(t)));
  k.push(H2('3.2 Hardware interfaces'));
  k.push(P('No special hardware. A camera or scanner may be used outside the system to capture receipts before upload.'));
  k.push(H2('3.3 Software interfaces'));
  ['Database: MySQL 8 through a parameterised query layer (PDO / mysql2 / SQLAlchemy).', 'File storage: server file system for receipts (path stored in PAYMENTS.receipt_path).',
    'Export: CSV generation and a PDF library (e.g. Dompdf, pdfkit or jsPDF) for reports.']
    .forEach(t => k.push(bullet(t)));
  k.push(H2('3.4 Communication interfaces'));
  k.push(P('HTTPS between browser and server in production. HTML forms use POST; uploads use multipart/form-data. No e-mail or SMS integration is required in this version.'));

  // 4 Functional requirements
  k.push(H1('4. System features (functional requirements)'));
  k.push(P('Priority uses MoSCoW: Must, Should, Could. The phase column shows when each requirement is implemented (P1 = already shown in the HTML/CSS prototype).'));
  const groups = [
    ['4.1 Authentication and access', ['Authentication'], 'Shared login for both roles, role-based routing and logout.', 'User submits credentials → system validates and opens the role\'s dashboard.'],
    ['4.2 Order entry', ['Order entry'], 'Employees record customer orders including payment information and receipts.', 'Employee submits the New Order form → system validates, stores the order as Pending and confirms.'],
    ['4.3 Order tracking and employee dashboard', ['Order tracking'], 'Employees follow the status of their orders.', 'Employee opens My Orders or the Dashboard → system lists their orders and totals.'],
    ['4.4 Commission', ['Commission'], 'Monthly commission per employee from approved sales.', 'An order is approved → the commission for that employee and month is recalculated.'],
    ['4.5 Order approval and payment verification', ['Order approval', 'Payment'], 'The administrator reviews pending orders and verifies receipts.', 'Admin presses Approve / Reject → system records the decision and updates the status.'],
    ['4.6 Dispatch and reports', ['Dispatch & reports'], 'Dispatch of approved orders and reporting.', 'Admin records courier and tracking number → order appears as Dispatched in reports.'],
    ['4.7 Administrator overview and navigation', ['Admin overview', 'Navigation'], 'Business KPIs, employee performance and consistent navigation.', 'Admin opens the dashboard → system shows current totals and charts.']
  ];
  groups.forEach(g => {
    k.push(H2(g[0]));
    k.push(P([run('Description: ', { bold: true }), run(g[2])]));
    k.push(P([run('Stimulus / response: ', { bold: true }), run(g[3])]));
    k.push(table(['ID', 'Requirement', 'Priority', 'Phase'], frRows(g[1]), [0.8, 5.2, 0.8, 1.3], { boldFirst: true }));
  });

  // 5 NFR
  k.push(H1('5. Non-functional requirements'));
  k.push(table(['ID', 'Category', 'Requirement'], C.NFR, [0.8, 1.3, 5.6], { boldFirst: true }));

  // 6 Data
  k.push(H1('6. Data requirements'));
  k.push(H2('6.1 Entity Relationship Diagram'));
  k.push(P('The logical data model has nine entities. USERS holds login accounts for both roles; EMPLOYEES extends a user with commission data. An order belongs to one customer and one employee, has one or more items and payments, may have approval records, and has at most one dispatch.'));
  k.push(image(path.join(DOCS, 'ERD.png'), 640));
  k.push(caption('Figure 5: OrderHub ERD (also on the "Sitemap & ERD" page of the Figma file).'));
  k.push(H2('6.2 Relationships'));
  k.push(table(['Relationship', 'Cardinality', 'Meaning'], ERD.rels.map(r => [`${r.a} - ${r.b}`, `${r.ca} : ${r.cb}`, REL_MEANING[r.a + '-' + r.b]]), [2.6, 1, 3.6]));
  k.push(H2('6.3 Data dictionary'));
  ERD.entities.forEach(e => {
    k.push(H3(e.id));
    k.push(P(e.desc, { run: { italics: true, color: MUTED } }));
    k.push(table(['Attribute', 'Type', 'Key', 'Description'], e.attrs.map(a => [a[0], a[1], a[2] || '-', C.DESC[e.id][a[0]] || '']), [1.7, 2, 0.8, 3.6]));
  });
  k.push(H2('6.4 Business rules'));
  k.push(table(['ID', 'Rule'], C.BR, [0.8, 6.5], { boldFirst: true }));
  k.push(H2('6.5 Order status transitions'));
  k.push(table(['From', 'Event', 'To', 'Actor'], C.STATES, [1.6, 1.8, 2.6, 1.3]));

  // 7 Use cases
  k.push(H1('7. Use case summary'));
  k.push(P('Detailed flows are in the companion Requirements & Traceability document.'));
  k.push(table(['ID', 'Use case', 'Actor', 'Requirements'], C.USE_CASES.map(u => [u.id, u.name, u.actor, u.fr]), [0.8, 3, 1.8, 1.6], { boldFirst: true }));

  // Appendix
  k.push(H1('Appendix A - Sitemap'));
  k.push(image(path.join(ROOT, 'screenshots', 'sitemap.png'), 620));
  k.push(caption('Figure 6: Sitemap and navigation structure (from the Phase 1 report).'));
  return makeDoc(k);
}

// ============================================================
// Requirements & traceability
// ============================================================
function buildReq() {
  const k = [];
  k.push(...titlePage('Requirements Analysis & Traceability', C.PROJECT.full));
  k.push(H1('Table of contents'));
  k.push(new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }));
  k.push(P('(If the contents are empty, right-click here and choose "Update Field".)', { run: { italics: true, size: 18, color: MUTED } }));
  k.push(pageBreak());

  k.push(H1('1. Introduction'));
  k.push(P('This document complements the SRS. It turns the requirements into user stories with acceptance criteria and detailed use cases, then traces every functional requirement to its screen, data entities, phase and test case. Requirement IDs (FR, NFR, BR) are the same as in the SRS.'));
  k.push(H2('1.1 Problem statement'));
  k.push(P('A small business receives customer orders through its employees and records them manually, which is slow and error-prone. Payments arrive in different ways (cash on delivery, advance transfer or full transfer) and the proof is easily lost. The owner cannot see pending orders, collected payments or employee commission without going through paper records, and dispatch details are kept separately. OrderHub gives employees one form to record orders and payments, and gives the administrator one place to approve orders, verify payments, track commission and prepare dispatch reports.'));
  k.push(H2('1.2 Stakeholders and goals'));
  k.push(table(['Stakeholder', 'Goal', 'Success measure'], [
    ['Business owner / Administrator', 'Control orders and money in one place.', 'Every order is approved or rejected within one working day; collections reconcile with reports.'],
    ['Employees', 'Record orders quickly and get paid commission correctly.', 'An order is entered in under 2 minutes; commission matches approved sales.'],
    ['Customers (indirect)', 'Receive the right order and a tracking number.', 'Every dispatched order has a unique tracking number.'],
    ['Course instructor', 'A well-engineered project extended phase by phase.', 'Requirements are traceable to pages, data and tests.']
  ], [1.8, 2.6, 3.2]));

  k.push(H1('2. Requirements summary'));
  k.push(H2('2.1 Functional requirements (MoSCoW)'));
  k.push(table(['ID', 'Module', 'Requirement', 'Priority'], C.FR.map(f => [f[0], f[1], f[2], f[3]]), [0.8, 1.3, 5, 0.8], { boldFirst: true }));
  const count = p => C.FR.filter(f => f[3] === p).length;
  k.push(P(`Totals: ${count('Must')} Must, ${count('Should')} Should, ${count('Could')} Could, ${C.FR.length} in all.`, { run: { italics: true, color: MUTED } }));
  k.push(H2('2.2 Non-functional requirements'));
  k.push(table(['ID', 'Category', 'Requirement'], C.NFR, [0.8, 1.3, 5.6], { boldFirst: true }));

  k.push(H1('3. User stories'));
  k.push(P('Format: As a <role>, I want <goal> so that <benefit>. The acceptance criteria are the conditions for the story to count as done.'));
  k.push(table(['ID', 'Story', 'Acceptance criteria', 'FR'], C.STORIES.map(s => [s[0], `As an ${s[1].toLowerCase()}, I want to ${s[2]} so that ${s[3]}.`, s[4], s[5]]), [0.7, 3, 3.4, 1.1], { boldFirst: true }));

  k.push(H1('4. Use cases'));
  k.push(H2('4.1 Actors and use cases'));
  k.push(table(['Actor', 'Use cases'], [
    ['Employee', 'UC-01 Log in, UC-02 Create a new order, UC-03 Track my orders, UC-04 View commission'],
    ['Administrator', 'UC-01 Log in, UC-05 Review and approve / reject an order, UC-06 Verify payment receipt, UC-07 Dispatch an order, UC-08 Generate and export a report']
  ], [1.4, 6]));
  k.push(H2('4.2 Detailed use cases'));
  C.USE_CASES.forEach((u, i) => {
    k.push(H3(`${u.id}: ${u.name}`));
    k.push(kvTable([['Actor', u.actor], ['Requirements', u.fr], ['Precondition', u.pre], ['Postcondition', u.post]], [1.3, 5]));
    k.push(P([run('Main flow', { bold: true })], { para: { spacing: { before: 120, after: 60 }, keepNext: true } }));
    u.main.forEach(s => k.push(numbered(s, 'num' + (i % 12))));
    k.push(P([run('Alternate flows', { bold: true })], { para: { spacing: { before: 120, after: 60 }, keepNext: true } }));
    u.alt.forEach(s => k.push(bullet(s)));
  });

  k.push(H1('5. New Order form validation rules'));
  k.push(P('These rules are implemented in JavaScript in Phase 2 and repeated on the server in Phase 3 (FR-06, FR-07, BR-02, BR-03).'));
  k.push(table(['Field', 'Rule', 'Error message'], C.VALIDATION, [1.7, 2.8, 3]));

  k.push(H1('6. Order status transitions'));
  k.push(table(['From', 'Event', 'To', 'Actor'], C.STATES, [1.6, 1.8, 2.6, 1.3]));

  k.push(H1('7. Requirements traceability matrix'));
  k.push(P('Every functional requirement traced to its screen, data entities, delivery phase and test case.'));
  const tcFor = id => C.TESTS.filter(t => t[1] === id).map(t => t[0]).join(', ') || '-';
  const usFor = id => C.STORIES.filter(s => s[5].split(', ').includes(id)).map(s => s[0]).join(', ') || '-';
  k.push(table(['FR', 'Story', 'Screen', 'Entities', 'Phase', 'Test'],
    C.FR.map(f => [f[0], usFor(f[0]), f[5], f[6], f[4], tcFor(f[0])]), [0.8, 0.9, 1.6, 2.3, 1.3, 0.9], { boldFirst: true }));

  k.push(H1('8. Acceptance test cases'));
  k.push(table(['ID', 'FR', 'Steps / input', 'Expected result'], C.TESTS, [0.7, 0.8, 3.3, 3], { boldFirst: true }));

  k.push(pageBreak());
  k.push(H1('9. Data model reference'));
  k.push(P('The full data dictionary is in SRS Section 6. ERD:'));
  k.push(image(path.join(DOCS, 'ERD.png'), 640));
  k.push(caption('Figure 1: OrderHub ERD.'));
  return makeDoc(k);
}

(async () => {
  const out = [['SRS_OrderHub.docx', buildSRS()], ['Requirements_and_Traceability_OrderHub.docx', buildReq()]];
  for (const [name, doc] of out) {
    fs.writeFileSync(path.join(DOCS, name), await Packer.toBuffer(doc));
    console.log('wrote', name);
  }
})();
