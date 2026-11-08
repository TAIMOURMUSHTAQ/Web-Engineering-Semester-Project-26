/* ============================================================
   Order Management System - Shared data and helper functions
   Web Engineering Assignment 02 (Phase 2: JavaScript)

   Every page loads this file first. It creates ONE global object,
   OMS, so the other script files can share code without creating
   many global variables.
   ============================================================ */

const OMS = (function () {
    const STORAGE_KEY = "oms_orders";
    const COMMISSION_RATE = 7.5; // percent (business rule BR-05)
    const CURRENT_EMPLOYEE = "Ali Hassan"; // the employee shown on the employee pages

    const STATUS = { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" };
    const METHOD = { COD: "COD", PARTIAL: "Partial Payment", FULL: "Full Payment" };

    const employees = ["Ali Hassan", "Fatima Raza", "Zain Abbas", "Mariam Khan"];

    // Commission totals from months before the orders below.
    const commissionHistory = [
        { employee: "Ali Hassan", month: "2026-09", approvedOrders: 44, totalSales: 280500 },
        { employee: "Ali Hassan", month: "2026-08", approvedOrders: 31, totalSales: 192000 }
    ];

    // Starting orders, newest first. Dates are stored as YYYY-MM-DD.
    const defaultOrders = [
        { id: "ORD-1048", date: "2026-10-12", customer: "Sana Malik", contact: "0301-2345678", address: "House 5, Street 2, F-8, Islamabad", items: "2x Cotton Kurta", amount: 4200, received: 0, method: METHOD.COD, status: STATUS.PENDING, employee: "Ali Hassan", decidedOn: null, tracking: null },
        { id: "ORD-1047", date: "2026-10-11", customer: "Bilal Ahmed", contact: "0312-3456789", address: "House 24, Street 7, G-10, Islamabad", items: "1x Leather Wallet, 1x Belt", amount: 7800, received: 7800, method: METHOD.FULL, status: STATUS.APPROVED, employee: "Ali Hassan", decidedOn: "2026-10-12", tracking: "TRK-884512" },
        { id: "ORD-1046", date: "2026-10-11", customer: "Hira Shah", contact: "0323-4567890", address: "Flat 3B, Gulberg III, Lahore", items: "3x Scented Candle", amount: 2650, received: 1000, method: METHOD.PARTIAL, status: STATUS.APPROVED, employee: "Ali Hassan", decidedOn: "2026-10-12", tracking: "TRK-884498" },
        { id: "ORD-1045", date: "2026-10-10", customer: "Usman Tariq", contact: "0334-5678901", address: "House 9, Saddar, Peshawar", items: "1x Bluetooth Speaker", amount: 5100, received: 0, method: METHOD.COD, status: STATUS.REJECTED, employee: "Ali Hassan", decidedOn: "2026-10-11", tracking: null },
        { id: "ORD-1044", date: "2026-10-09", customer: "Ayesha Noor", contact: "0345-6789012", address: "House 11, Satellite Town, Rawalpindi", items: "1x Wrist Watch", amount: 9300, received: 9300, method: METHOD.FULL, status: STATUS.APPROVED, employee: "Ali Hassan", decidedOn: "2026-10-10", tracking: "TRK-884471" },
        { id: "ORD-1043", date: "2026-10-08", customer: "Hamza Qureshi", contact: "0300-7890123", address: "House 17, Cantt, Sialkot", items: "2x Sports Cap", amount: 1900, received: 0, method: METHOD.COD, status: STATUS.PENDING, employee: "Ali Hassan", decidedOn: null, tracking: null },
        { id: "ORD-1042", date: "2026-10-07", customer: "Rabia Anwar", contact: "0311-8901234", address: "House 30, Johar Town, Lahore", items: "1x Handbag", amount: 8400, received: 8400, method: METHOD.FULL, status: STATUS.APPROVED, employee: "Mariam Khan", decidedOn: "2026-10-08", tracking: "TRK-884441" },
        { id: "ORD-1041", date: "2026-10-07", customer: "Nida Aslam", contact: "0322-9012345", address: "House 8, DHA Phase 2, Karachi", items: "2x Table Lamp", amount: 6750, received: 3000, method: METHOD.PARTIAL, status: STATUS.PENDING, employee: "Fatima Raza", decidedOn: null, tracking: null },
        { id: "ORD-1040", date: "2026-10-06", customer: "Sajid Mehmood", contact: "0333-0123456", address: "House 2, Peoples Colony, Faisalabad", items: "1x Wall Clock", amount: 3600, received: 0, method: METHOD.COD, status: STATUS.APPROVED, employee: "Fatima Raza", decidedOn: "2026-10-07", tracking: null },
        { id: "ORD-1039", date: "2026-10-06", customer: "Kashif Iqbal", contact: "0344-1234567", address: "House 56, Model Town, Multan", items: "1x Smart Watch, 1x Earbuds", amount: 12400, received: 12400, method: METHOD.FULL, status: STATUS.PENDING, employee: "Zain Abbas", decidedOn: null, tracking: null },
        { id: "ORD-1038", date: "2026-10-05", customer: "Maham Javed", contact: "0305-2345678", address: "House 41, Hayatabad, Peshawar", items: "3x Cushion Cover", amount: 5250, received: 2000, method: METHOD.PARTIAL, status: STATUS.APPROVED, employee: "Zain Abbas", decidedOn: "2026-10-06", tracking: "TRK-884430" },
        { id: "ORD-1037", date: "2026-10-04", customer: "Faisal Karim", contact: "0316-3456789", address: "House 13, Latifabad, Hyderabad", items: "1x Backpack", amount: 2300, received: 0, method: METHOD.COD, status: STATUS.PENDING, employee: "Mariam Khan", decidedOn: null, tracking: null }
    ];

    /* ---------- Order storage (localStorage bonus feature) ---------- */

    // Pages share orders through localStorage. The browser can block it, so
    // the starting orders are used whenever nothing valid can be read.
    function loadOrders() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(saved)) {
                return saved;
            }
        } catch (error) {
            console.warn("Saved orders could not be read; using the starting orders.", error);
        }
        return defaultOrders.map(function (order) {
            return Object.assign({}, order);
        });
    }

    function saveOrders(orders) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        } catch (error) {
            console.warn("Orders could not be saved in this browser.", error);
        }
    }

    function resetOrders() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn("Saved orders could not be cleared.", error);
        }
    }

    /* ---------- Order operations ---------- */

    // Creates the next ORD-#### code from the highest existing number.
    function getNextOrderId(orders) {
        let highest = 0;
        orders.forEach(function (order) {
            highest = Math.max(highest, Number(order.id.replace("ORD-", "")));
        });
        return "ORD-" + (highest + 1);
    }

    // Adds a new Pending order at the top of the list and returns it.
    function addOrder(details) {
        const orders = loadOrders();
        const order = Object.assign({}, details, {
            id: getNextOrderId(orders),
            date: getTodayISO(),
            status: STATUS.PENDING,
            employee: CURRENT_EMPLOYEE,
            decidedOn: null,
            tracking: null
        });
        orders.unshift(order);
        saveOrders(orders);
        return order;
    }

    // Only Pending orders may change status (business rule BR-08).
    function updateOrderStatus(orderId, newStatus) {
        const orders = loadOrders();
        const order = orders.find(function (item) {
            return item.id === orderId;
        });

        if (!order || order.status !== STATUS.PENDING) {
            return false;
        }

        order.status = newStatus;
        order.decidedOn = getTodayISO();
        saveOrders(orders);
        return true;
    }

    function countByStatus(orders, status) {
        return orders.filter(function (order) {
            return order.status === status;
        }).length;
    }

    /* ---------- Calculations ---------- */

    function calculateBalance(amount, received) {
        return amount - received;
    }

    function calculateCommission(totalSales, rate) {
        return totalSales * rate / 100;
    }

    // Builds one entry per month for an employee, newest month first.
    // Commission counts in the month an order was approved (BR-05).
    function getMonthlyCommission(employee) {
        const months = {};

        commissionHistory.forEach(function (record) {
            if (record.employee === employee) {
                months[record.month] = {
                    month: record.month,
                    approvedOrders: record.approvedOrders,
                    totalSales: record.totalSales
                };
            }
        });

        loadOrders().forEach(function (order) {
            if (order.employee === employee && order.status === STATUS.APPROVED) {
                const monthKey = order.decidedOn.slice(0, 7);
                if (!months[monthKey]) {
                    months[monthKey] = { month: monthKey, approvedOrders: 0, totalSales: 0 };
                }
                months[monthKey].approvedOrders += 1;
                months[monthKey].totalSales += order.amount;
            }
        });

        return Object.values(months)
            .map(function (entry) {
                return Object.assign(entry, {
                    rate: COMMISSION_RATE,
                    commission: calculateCommission(entry.totalSales, COMMISSION_RATE)
                });
            })
            .sort(function (a, b) {
                return b.month.localeCompare(a.month);
            });
    }

    /* ---------- Formatting ---------- */

    // en-IN grouping keeps the project's format, e.g. Rs. 2,46,000
    function formatCurrency(value) {
        return "Rs. " + Math.round(value).toLocaleString("en-IN");
    }

    function getTodayISO() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return today.getFullYear() + "-" + month + "-" + day;
    }

    // "2026-10-12" becomes "12 Oct 2026"
    function formatDate(isoDate) {
        const parts = isoDate.split("-");
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

    // "2026-10" becomes "October 2026"
    function formatMonth(monthKey) {
        const parts = monthKey.split("-");
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
        return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    }

    /* ---------- Interface helpers ---------- */

    function setText(elementId, text) {
        document.getElementById(elementId).textContent = text;
    }

    // type is "success", "error" or "info"; the colours are in style.css.
    function showMessage(elementId, text, type) {
        const box = document.getElementById(elementId);
        box.textContent = text;
        box.className = "message " + type;
    }

    function hideMessage(elementId) {
        const box = document.getElementById(elementId);
        box.textContent = "";
        box.className = "message hidden";
    }

    // Shows an error directly below an input and highlights the input.
    function showFieldError(input, text) {
        clearFieldError(input);
        const error = document.createElement("p");
        error.className = "field-error";
        error.id = input.id + "-error";
        error.textContent = text;
        input.insertAdjacentElement("afterend", error);
        input.classList.add("invalid");
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", error.id);
    }

    function clearFieldError(input) {
        const error = document.getElementById(input.id + "-error");
        if (error) {
            error.remove();
        }
        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
    }

    // textContent is used so text typed by a user can never run as HTML.
    function createCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    function createStatusCell(label, cssClass) {
        const cell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "status " + cssClass;
        badge.textContent = label;
        cell.appendChild(badge);
        return cell;
    }

    // Replaces a table body's content with a single message row.
    function showEmptyRow(tableBody, text, columnCount) {
        const row = document.createElement("tr");
        const cell = createCell(text);
        cell.colSpan = columnCount;
        cell.className = "empty-row";
        row.appendChild(cell);
        tableBody.replaceChildren(row);
    }

    // Only what other files need is returned; the rest stays private.
    return {
        COMMISSION_RATE,
        CURRENT_EMPLOYEE,
        STATUS,
        METHOD,
        employees,
        loadOrders,
        resetOrders,
        addOrder,
        updateOrderStatus,
        countByStatus,
        calculateBalance,
        calculateCommission,
        getMonthlyCommission,
        formatCurrency,
        formatDate,
        formatMonth,
        setText,
        showMessage,
        hideMessage,
        showFieldError,
        clearFieldError,
        createCell,
        createStatusCell,
        showEmptyRow
    };
})();
