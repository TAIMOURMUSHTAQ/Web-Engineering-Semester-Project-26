// Shared requirement content for the SRS and the Requirements & Traceability document.

const PROJECT = {
  name: 'OrderHub',
  full: 'OrderHub - Order Management System',
  student: 'Taimour Mushtaq',
  program: 'BS Computer Science, 5th Semester',
  uni: 'Federal Urdu University of Arts, Science & Technology',
  course: 'Web Engineering - Semester Capstone Project',
  date: '14 October 2026',
  version: '1.0'
};

// id, module, text, priority (MoSCoW), phase, screens, entities
const FR = [
  ['FR-01', 'Authentication', 'The system shall provide one shared login page where a user enters a username or email, a password, and selects a role (Employee or Administrator).', 'Must', 'P1 (UI), P5 (logic)', 'Login', 'USERS'],
  ['FR-02', 'Authentication', 'The system shall verify the credentials against the stored password hash and redirect the user to the dashboard of their role.', 'Must', 'P5', 'Login', 'USERS'],
  ['FR-03', 'Authentication', 'The system shall restrict each page to its role, so that an employee cannot open any administrator page.', 'Must', 'P5', 'All', 'USERS'],
  ['FR-04', 'Authentication', 'The system shall show a Logout action on every page that ends the session and returns the user to the login page.', 'Must', 'P1 (UI), P5 (logic)', 'All', 'USERS'],
  ['FR-05', 'Order entry', 'The system shall allow an employee to create an order by entering customer name, contact number, WhatsApp number, address, order amount, item description and payment method (COD, Partial Payment or Full Payment).', 'Must', 'P1 (UI), P3-P4', 'New Order', 'ORDERS, CUSTOMERS, ORDER_ITEMS'],
  ['FR-06', 'Order entry', 'When Partial or Full Payment is selected, the system shall require the amount received and a payment receipt upload (JPG, PNG or PDF, maximum 5 MB).', 'Must', 'P2-P4', 'New Order', 'PAYMENTS'],
  ['FR-07', 'Order entry', 'The system shall validate required fields and formats before saving (phone number 03XX-XXXXXXX, amount greater than zero, amount received not greater than order amount) and show an inline error message next to each invalid field.', 'Must', 'P2 (client), P3 (server)', 'New Order', 'ORDERS, PAYMENTS'],
  ['FR-08', 'Order entry', 'The system shall calculate the balance due (order amount minus amount received) and show it in the order summary before submission.', 'Should', 'P2', 'New Order', 'PAYMENTS'],
  ['FR-09', 'Order entry', 'The system shall save every new order with status Pending, a unique order code (ORD-####), the submitting employee and the date and time of submission.', 'Must', 'P3-P4', 'New Order', 'ORDERS'],
  ['FR-10', 'Order tracking', 'The system shall show an employee a list of their own orders with order ID, date, customer, items, amount, payment method and status.', 'Must', 'P1 (UI), P4', 'My Orders', 'ORDERS'],
  ['FR-11', 'Order tracking', 'The system shall allow the employee to filter the order list by status (All, Pending, Approved, Rejected) and to search by order ID or customer name.', 'Should', 'P2', 'My Orders', 'ORDERS, CUSTOMERS'],
  ['FR-12', 'Order tracking', 'The employee dashboard shall show total, pending and approved order counts, the current month\'s commission, a weekly orders chart and the five most recent orders.', 'Must', 'P1 (UI), P4', 'Employee Dashboard', 'ORDERS, COMMISSIONS'],
  ['FR-13', 'Commission', 'The system shall calculate each employee\'s monthly commission as the total amount of that employee\'s orders approved in the month multiplied by the employee\'s commission rate.', 'Must', 'P3-P4', 'Commission', 'COMMISSIONS, EMPLOYEES, ORDERS'],
  ['FR-14', 'Commission', 'The system shall show the employee a monthly commission breakdown: month, approved orders, total sales, rate, commission amount and payout status.', 'Should', 'P1 (UI), P4', 'Commission', 'COMMISSIONS'],
  ['FR-15', 'Commission', 'The administrator shall be able to set an employee\'s commission rate and mark a month\'s commission as Paid.', 'Could', 'P4', 'Admin Dashboard', 'EMPLOYEES, COMMISSIONS'],
  ['FR-16', 'Order approval', 'The administrator shall see a queue of Pending orders showing order ID, customer, employee, amount, payment method and whether a receipt is attached.', 'Must', 'P1 (UI), P4', 'Order Approval', 'ORDERS, PAYMENTS'],
  ['FR-17', 'Order approval', 'The administrator shall be able to open an order and see the full customer, item and payment details, including a preview of the uploaded receipt.', 'Must', 'P1 (UI), P4', 'Order Approval', 'ORDERS, CUSTOMERS, ORDER_ITEMS, PAYMENTS'],
  ['FR-18', 'Order approval', 'The administrator shall approve or reject an order with optional remarks. The system shall record the decision, the administrator and the date and time.', 'Must', 'P2-P4', 'Order Approval', 'ORDER_APPROVALS, ORDERS'],
  ['FR-19', 'Order approval', 'The system shall allow only the status changes Pending to Approved and Pending to Rejected. An employee shall not be able to edit an order after a decision has been made.', 'Must', 'P3', 'Order Approval, My Orders', 'ORDERS'],
  ['FR-20', 'Payment', 'The administrator shall mark a payment receipt as Verified or Rejected.', 'Should', 'P4', 'Order Approval', 'PAYMENTS'],
  ['FR-21', 'Dispatch & reports', 'Approved orders shall appear in a dispatch list where the administrator records the courier name, tracking number and dispatch date.', 'Must', 'P1 (UI), P4', 'Reports & Dispatch', 'DISPATCHES, ORDERS'],
  ['FR-22', 'Dispatch & reports', 'The administrator shall update the delivery status of a dispatch (Ready, Dispatched, Delivered, Returned).', 'Should', 'P4', 'Reports & Dispatch', 'DISPATCHES'],
  ['FR-23', 'Dispatch & reports', 'The system shall produce a dispatch and payment report showing customer name, address, order amount, payment status and tracking number, filterable by date range and status.', 'Must', 'P1 (UI), P4', 'Reports & Dispatch', 'DISPATCHES, ORDERS, CUSTOMERS, PAYMENTS'],
  ['FR-24', 'Dispatch & reports', 'The system shall export the report to CSV and PDF.', 'Could', 'P5', 'Reports & Dispatch', 'All report data'],
  ['FR-25', 'Admin overview', 'The admin dashboard shall show total orders, pending approvals, total payments collected and commission payable, with a chart of orders over time and the payment-method mix.', 'Must', 'P1 (UI), P4', 'Admin Dashboard', 'ORDERS, PAYMENTS, COMMISSIONS'],
  ['FR-26', 'Admin overview', 'The administrator shall see employee performance (orders, pending, approval rate, commission) and be able to activate or deactivate an employee account.', 'Should', 'P4', 'Admin Dashboard', 'EMPLOYEES, USERS'],
  ['FR-27', 'Navigation', 'Every page shall be reachable from the sidebar of its role, and the current page shall be highlighted.', 'Must', 'P1', 'All', '-']
];

const NFR = [
  ['NFR-01', 'Performance', 'Each page shall load in under 2 seconds on a normal broadband or 4G connection. Order lists shall be paginated (10-25 rows per page) so that response time does not grow with the number of orders.'],
  ['NFR-02', 'Security', 'Passwords shall be stored only as bcrypt hashes. Sessions shall expire after 30 minutes of inactivity. All input shall be validated on the server and all database access shall use parameterised queries to prevent SQL injection.'],
  ['NFR-03', 'Security', 'Uploaded receipts shall be limited to JPG, PNG or PDF files of at most 5 MB, stored outside the public web root and renamed on upload.'],
  ['NFR-04', 'Authorisation', 'Role checks shall be enforced on the server for every administrator route, not only by hiding links in the interface.'],
  ['NFR-05', 'Usability', 'A new employee shall be able to submit a complete order in under 2 minutes without training. Status shall always be shown as a coloured badge with a text label.'],
  ['NFR-06', 'Accessibility', 'Text and controls shall meet WCAG 2.1 AA contrast (4.5:1 for body text). Every input shall have a visible label, and all actions shall be reachable with the keyboard.'],
  ['NFR-07', 'Compatibility', 'The site shall work on current versions of Chrome, Edge and Firefox, at screen widths from 360 px (mobile) to 1920 px (desktop).'],
  ['NFR-08', 'Reliability', 'A submitted order shall never be lost. Approval and payment updates shall run inside one database transaction, and the database shall be backed up daily.'],
  ['NFR-09', 'Maintainability', 'The project shall keep the Phase 1 folder structure, meaningful file names and one external stylesheet (design tokens), so that later phases extend the same code.'],
  ['NFR-10', 'Consistency', 'All screens shall follow the Figma design system: the same colours, typography, spacing, buttons, badges, tables and navigation.'],
  ['NFR-11', 'Auditability', 'Every approval decision and payment verification shall store who performed it and when.']
];

const BR = [
  ['BR-01', 'An order code has the form ORD- followed by at least four digits and is unique.'],
  ['BR-02', 'A payment receipt is mandatory for Partial and Full Payment and not required for Cash on Delivery.'],
  ['BR-03', 'COD: amount received = 0. Partial Payment: 0 < amount received < order amount. Full Payment: amount received = order amount.'],
  ['BR-04', 'Balance due = order amount - sum of all payments received for the order.'],
  ['BR-05', 'Commission is earned only on Approved orders and is counted in the month the order was approved. The default rate is 7.5%.'],
  ['BR-06', 'Only Approved orders can be dispatched, and each order has at most one dispatch record.'],
  ['BR-07', 'A tracking number is unique across all dispatches.'],
  ['BR-08', 'An order\'s status can change only from Pending to Approved or from Pending to Rejected (see the state table).']
];

const USE_CASES = [
  { id: 'UC-01', name: 'Log in', actor: 'Employee, Administrator', fr: 'FR-01 to FR-04',
    pre: 'The user has an active account.',
    main: ['User opens the login page.', 'User enters a username or email and password, and selects a role.', 'System verifies the credentials and role.', 'System opens the dashboard for that role.'],
    alt: ['3a. Wrong credentials: the system shows "Invalid username or password" and stays on the login page.', '3b. Account deactivated: the system shows "Your account is inactive - contact the administrator".'],
    post: 'A session exists for the user, and only pages for their role are accessible.' },
  { id: 'UC-02', name: 'Create a new order', actor: 'Employee', fr: 'FR-05 to FR-09',
    pre: 'The employee is logged in.',
    main: ['Employee opens New Order.', 'Employee enters customer information (name, contact, WhatsApp, address).', 'Employee enters the order amount and items.', 'Employee selects the payment method.', 'For Partial or Full Payment, the employee enters the amount received and uploads the receipt.', 'System validates the form and shows the balance due.', 'Employee presses Submit Order.', 'System saves the order as Pending with a new order code and shows a confirmation.'],
    alt: ['6a. A field is invalid: the system highlights the field and shows the error; the order is not saved.', '7a. Employee presses Reset: the system clears the form.'],
    post: 'The order is stored with status Pending and appears in My Orders and in the admin approval queue.' },
  { id: 'UC-03', name: 'Track my orders', actor: 'Employee', fr: 'FR-10 to FR-12',
    pre: 'The employee is logged in.',
    main: ['Employee opens My Orders (or the dashboard).', 'System lists the employee\'s orders, newest first, with status badges.', 'Employee filters by status or searches by order ID or customer.', 'System updates the list.'],
    alt: ['2a. No orders yet: the system shows an empty state with a "Create your first order" button.'],
    post: 'None (read-only).' },
  { id: 'UC-04', name: 'View commission', actor: 'Employee', fr: 'FR-13, FR-14',
    pre: 'The employee is logged in.',
    main: ['Employee opens Commission.', 'System shows the approved orders, total sales, rate and commission earned for the selected month.', 'System shows the monthly trend chart and the breakdown table with payout status.'],
    alt: ['2a. The employee selects another month: the system recalculates the figures for that month.'],
    post: 'None (read-only).' },
  { id: 'UC-05', name: 'Review and approve / reject an order', actor: 'Administrator', fr: 'FR-16 to FR-19',
    pre: 'The administrator is logged in and at least one order is Pending.',
    main: ['Administrator opens Order Approval.', 'System lists the Pending orders.', 'Administrator selects an order.', 'System shows the order details and the payment receipt.', 'Administrator enters optional remarks and presses Approve.', 'System sets the status to Approved, records the decision and moves the order to the dispatch list.'],
    alt: ['5a. Administrator presses Reject: the system sets the status to Rejected and shows the remarks to the employee.', '5b. The order was already decided by another administrator: the system shows a message and refreshes the queue.'],
    post: 'The order is Approved or Rejected, and an ORDER_APPROVALS record exists.' },
  { id: 'UC-06', name: 'Verify payment receipt', actor: 'Administrator', fr: 'FR-17, FR-20',
    pre: 'The order has a payment with an uploaded receipt.',
    main: ['Administrator opens the order detail.', 'Administrator views the receipt at full size.', 'Administrator marks the payment as Verified.'],
    alt: ['3a. The receipt does not match: the administrator marks it Rejected and adds remarks.'],
    post: 'The payment verification status, the verifying administrator and the time are stored.' },
  { id: 'UC-07', name: 'Dispatch an order', actor: 'Administrator', fr: 'FR-21, FR-22',
    pre: 'The order is Approved.',
    main: ['Administrator opens Reports & Dispatch.', 'Administrator selects an order marked Ready.', 'Administrator enters the courier, tracking number and dispatch date.', 'System saves the dispatch and sets the status to Dispatched.', 'Later, the administrator updates the status to Delivered.'],
    alt: ['3a. The tracking number already exists: the system rejects it and asks for a unique number.'],
    post: 'A DISPATCHES record exists for the order with the current delivery status.' },
  { id: 'UC-08', name: 'Generate and export a report', actor: 'Administrator', fr: 'FR-23 to FR-25',
    pre: 'The administrator is logged in.',
    main: ['Administrator opens Reports & Dispatch.', 'Administrator selects a date range and status filter.', 'System shows the matching dispatch and payment records with totals.', 'Administrator presses Export CSV or Export PDF.', 'System downloads the file.'],
    alt: ['3a. No records match: the system shows "No records for the selected filters".'],
    post: 'The report file is downloaded; the data is unchanged.' }
];

const STORIES = [
  ['US-01', 'Employee', 'log in with my email and password', 'I only see my own work', 'Given valid credentials, when I press Sign in, then I land on the Employee Dashboard. Given a wrong password, I see an error and stay on the login page.', 'FR-01, FR-02'],
  ['US-02', 'Employee', 'record a customer order with payment details', 'the business has the order and the payment on record', 'All required fields are marked *. Submit is blocked until they are valid. After submitting, the order shows in My Orders as Pending.', 'FR-05, FR-07, FR-09'],
  ['US-03', 'Employee', 'upload the payment receipt for advance payments', 'the admin can verify the payment without asking me', 'Partial or Full Payment makes the receipt field required. Only JPG, PNG or PDF up to 5 MB is accepted. The file name is shown after upload.', 'FR-06'],
  ['US-04', 'Employee', 'see the balance the customer still has to pay', 'I can tell the customer the right amount', 'Balance due = amount - received, updated as I type, and shown in the order summary.', 'FR-08'],
  ['US-05', 'Employee', 'see the status of every order I submitted', 'I can follow up on pending or rejected ones', 'The list shows Pending, Approved and Rejected badges. The status filter and search work together.', 'FR-10, FR-11'],
  ['US-06', 'Employee', 'see how much commission I earned this month', 'I can track my income', 'Commission = approved sales x rate. The monthly breakdown shows the payout status.', 'FR-13, FR-14'],
  ['US-07', 'Administrator', 'see all pending orders in one queue', 'nothing waits too long for approval', 'The queue shows only Pending orders, oldest first, with a count badge in the sidebar.', 'FR-16'],
  ['US-08', 'Administrator', 'approve or reject an order after checking its receipt', 'only paid or valid orders are dispatched', 'Approve or Reject updates the status immediately, the decision is logged, and remarks are visible to the employee.', 'FR-17, FR-18, FR-19, FR-20'],
  ['US-09', 'Administrator', 'record the courier and tracking number for approved orders', 'customers can track their parcels', 'Only Approved orders can be dispatched. Tracking numbers must be unique.', 'FR-21, FR-22'],
  ['US-10', 'Administrator', 'see and export a dispatch and payment report', 'I can reconcile collections', 'Filter by date range and status, then export to CSV or PDF with the same columns as on screen.', 'FR-23, FR-24'],
  ['US-11', 'Administrator', 'see business totals and employee performance at a glance', 'I can manage the team', 'The dashboard shows four KPIs, two charts and the employee performance table.', 'FR-25, FR-26']
];

const VALIDATION = [
  ['Customer Name', 'Required, 3-100 letters and spaces', 'Enter the customer\'s full name.'],
  ['Contact Number', 'Required, pattern 03XX-XXXXXXX', 'Enter a valid mobile number, e.g. 0300-1234567.'],
  ['WhatsApp Number', 'Optional, same pattern as contact', 'Enter a valid WhatsApp number or leave it empty.'],
  ['Customer Address', 'Required, 10-255 characters', 'Enter the full delivery address.'],
  ['Order Amount (Rs.)', 'Required, whole number > 0', 'Order amount must be greater than 0.'],
  ['Order Description / Items', 'Required, 3-500 characters', 'List at least one item.'],
  ['Payment Method', 'Required, one of COD / Partial / Full', 'Select how the customer is paying.'],
  ['Amount Received (Rs.)', 'COD = 0; Partial: 0 < x < amount; Full: x = amount', 'Amount received does not match the payment method.'],
  ['Payment Receipt', 'Required for Partial / Full; JPG, PNG or PDF; at most 5 MB', 'Upload the receipt (JPG, PNG or PDF, max 5 MB).']
];

const STATES = [
  ['(new)', 'Submit order', 'Pending', 'Employee'],
  ['Pending', 'Approve', 'Approved', 'Administrator'],
  ['Pending', 'Reject', 'Rejected', 'Administrator'],
  ['Approved', 'Record dispatch', 'Approved + dispatch Ready / Dispatched', 'Administrator'],
  ['Dispatched', 'Mark delivered / returned', 'Delivered / Returned', 'Administrator'],
  ['Approved / Rejected', 'Edit order', 'Not allowed', '-']
];

const TESTS = [
  ['TC-01', 'FR-02', 'Log in with valid employee credentials', 'Employee Dashboard opens'],
  ['TC-02', 'FR-02', 'Log in with a wrong password', 'Error shown; stays on Login'],
  ['TC-03', 'FR-03', 'Employee opens approvals.html directly', 'Access denied / redirect to Login'],
  ['TC-04', 'FR-07', 'Submit New Order with contact "12345"', 'Inline error on Contact Number; order not saved'],
  ['TC-05', 'FR-06', 'Select Partial Payment and submit without a receipt', 'Receipt required error'],
  ['TC-06', 'FR-08', 'Amount 4,200, received 2,000', 'Balance due shows Rs. 2,200'],
  ['TC-07', 'FR-09', 'Submit a valid order', 'New ORD code created, status Pending'],
  ['TC-08', 'FR-11', 'Filter My Orders by Rejected', 'Only Rejected orders listed'],
  ['TC-09', 'FR-18', 'Admin approves ORD-1041', 'Status Approved; approval record stored'],
  ['TC-10', 'FR-19', 'Employee tries to edit an Approved order', 'Edit not allowed'],
  ['TC-11', 'FR-13', '39 approved orders worth Rs. 2,46,000 at 7.5%', 'Commission = Rs. 18,450'],
  ['TC-12', 'FR-21', 'Dispatch with an existing tracking number', 'Duplicate tracking number error'],
  ['TC-13', 'FR-24', 'Export the dispatch report to CSV', 'CSV downloads with the on-screen columns']
];

// Attribute descriptions for the data dictionary.
const DESC = {
  USERS: { user_id: 'Surrogate key.', full_name: 'Display name.', username: 'Login name, unique.', email: 'Login e-mail, unique.', password_hash: 'bcrypt hash; the plain password is never stored.', role: 'admin or employee - drives authorisation.', phone: 'Contact number.', is_active: 'False = account disabled.', created_at: 'Account creation time.' },
  EMPLOYEES: { employee_id: 'Surrogate key.', user_id: 'Login account of this employee (1:1).', cnic: 'National ID number, unique.', commission_rate: 'Percentage, default 7.50.', joining_date: 'Date the employee joined.', status: 'active / inactive.' },
  COMMISSIONS: { commission_id: 'Surrogate key.', employee_id: 'Employee who earned it.', period_month: 'Month in YYYY-MM format; unique per employee.', approved_orders: 'Count of orders approved in the month.', total_sales: 'Sum of approved order amounts.', rate: 'Rate applied (copied from the employee).', commission_amount: 'total_sales x rate / 100.', payout_status: 'unpaid / paid.', paid_on: 'Date of payout.' },
  ORDER_APPROVALS: { approval_id: 'Surrogate key.', order_id: 'Order decided.', admin_id: 'USERS.user_id of the administrator.', decision: 'approved / rejected.', remarks: 'Optional note shown to the employee.', decided_at: 'Time of decision.' },
  ORDERS: { order_id: 'Surrogate key.', order_code: 'Human-readable code ORD-####.', customer_id: 'Customer who placed the order.', employee_id: 'Employee who recorded the order.', order_date: 'Submission time.', description: 'Free-text items / notes from the form.', total_amount: 'Order amount in Rs.', payment_method: 'cod / partial / full.', status: 'pending / approved / rejected.', updated_at: 'Last change time.' },
  CUSTOMERS: { customer_id: 'Surrogate key.', full_name: 'Customer name.', contact_number: 'Mobile number 03XX-XXXXXXX.', whatsapp_number: 'Optional WhatsApp number.', address: 'Delivery address.', city: 'City (used in reports).', created_at: 'First order time.' },
  PAYMENTS: { payment_id: 'Surrogate key.', order_id: 'Order this payment belongs to.', amount_received: 'Amount in Rs.', payment_date: 'When received.', receipt_path: 'Stored file path of the receipt.', transaction_ref: 'Bank / JazzCash / EasyPaisa reference.', verification: 'unverified / verified / rejected.', verified_by: 'USERS.user_id of the verifying administrator.' },
  ORDER_ITEMS: { item_id: 'Surrogate key.', order_id: 'Parent order.', item_name: 'Product name.', quantity: 'Quantity, >= 1.', unit_price: 'Price per unit in Rs.', line_total: 'quantity x unit_price.' },
  DISPATCHES: { dispatch_id: 'Surrogate key.', order_id: 'Dispatched order, unique (one dispatch per order).', courier_name: 'TCS, Leopards, M&P, etc.', tracking_number: 'Courier tracking number, unique.', dispatch_date: 'Date handed to the courier.', delivery_status: 'ready / dispatched / delivered / returned.' }
};

const SCREENS = [
  ['Login', 'index.html', 'Both', 'Shared sign-in with role switch and demo shortcuts.'],
  ['Employee Dashboard', 'employee-dashboard.html', 'Employee', 'KPIs, weekly orders chart, status donut, recent orders.'],
  ['New Order', 'new-order.html', 'Employee', 'Three-section order form with payment cards, receipt upload and a live summary.'],
  ['My Orders', 'my-orders.html', 'Employee', 'Status tabs, search, orders table and pagination.'],
  ['Commission', 'commission.html', 'Employee', 'Commission KPIs, 6-month trend, target progress and monthly breakdown.'],
  ['Admin Dashboard', 'admin-dashboard.html', 'Administrator', 'Business KPIs, orders chart, payment mix, employee performance, needs-attention list.'],
  ['Order Approval', 'approvals.html', 'Administrator', 'Pending queue with Approve / Reject, order detail and receipt verification.'],
  ['Reports & Dispatch', 'reports-dispatch.html', 'Administrator', 'Workflow stepper, dispatch KPIs, dispatch report with tracking numbers and export.']
];

module.exports = { PROJECT, FR, NFR, BR, USE_CASES, STORIES, VALIDATION, STATES, TESTS, DESC, SCREENS };
