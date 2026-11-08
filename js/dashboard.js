/* Employee Dashboard, Admin Dashboard and Reports & Dispatch pages.
   All counters are calculated from the order data whenever a page loads. */

document.addEventListener("DOMContentLoaded", function () {
    const RECENT_ORDER_LIMIT = 5;
    const orders = OMS.loadOrders();
    const approvedOrders = orders.filter(function (order) {
        return order.status === OMS.STATUS.APPROVED;
    });

    // Adds up one numeric value, chosen by getValue, across a list of orders.
    function sumOrders(list, getValue) {
        return list.reduce(function (total, order) {
            return total + getValue(order);
        }, 0);
    }

    function getOrderAmount(order) {
        return order.amount;
    }

    function renderEmployeeDashboard() {
        const myOrders = orders.filter(function (order) {
            return order.employee === OMS.CURRENT_EMPLOYEE;
        });
        const latestMonth = OMS.getMonthlyCommission(OMS.CURRENT_EMPLOYEE)[0];

        OMS.setText("stat-total", myOrders.length);
        OMS.setText("stat-pending", OMS.countByStatus(myOrders, OMS.STATUS.PENDING));
        OMS.setText("stat-approved", OMS.countByStatus(myOrders, OMS.STATUS.APPROVED));
        OMS.setText("stat-commission", OMS.formatCurrency(latestMonth ? latestMonth.commission : 0));

        const rows = myOrders.slice(0, RECENT_ORDER_LIMIT).map(function (order) {
            const row = document.createElement("tr");
            row.append(
                OMS.createCell(order.id),
                OMS.createCell(order.customer),
                OMS.createCell(OMS.formatCurrency(order.amount)),
                OMS.createCell(order.method),
                OMS.createStatusCell(order.status, order.status.toLowerCase())
            );
            return row;
        });
        document.getElementById("recent-orders-body").replaceChildren(...rows);
    }

    function renderAdminDashboard() {
        const totalSales = sumOrders(approvedOrders, getOrderAmount);
        const totalReceived = sumOrders(approvedOrders, function (order) {
            return order.received;
        });

        OMS.setText("stat-total", orders.length);
        OMS.setText("stat-pending", OMS.countByStatus(orders, OMS.STATUS.PENDING));
        OMS.setText("stat-approved", approvedOrders.length);
        OMS.setText("stat-payments", OMS.formatCurrency(totalReceived));
        OMS.setText("stat-employees", OMS.employees.length);
        OMS.setText("stat-commission", OMS.formatCurrency(OMS.calculateCommission(totalSales, OMS.COMMISSION_RATE)));

        const rows = OMS.employees.map(function (employee) {
            const employeeOrders = orders.filter(function (order) {
                return order.employee === employee;
            });
            const employeeApproved = employeeOrders.filter(function (order) {
                return order.status === OMS.STATUS.APPROVED;
            });
            const sales = sumOrders(employeeApproved, getOrderAmount);

            const row = document.createElement("tr");
            row.append(
                OMS.createCell(employee),
                OMS.createCell(employeeOrders.length),
                OMS.createCell(employeeApproved.length),
                OMS.createCell(OMS.countByStatus(employeeOrders, OMS.STATUS.PENDING)),
                OMS.createCell(OMS.formatCurrency(OMS.calculateCommission(sales, OMS.COMMISSION_RATE)))
            );
            return row;
        });
        document.getElementById("employee-summary-body").replaceChildren(...rows);
    }

    // Paid, Partial or COD label for the dispatch report.
    function getPaymentBadge(order) {
        if (order.method === OMS.METHOD.FULL) {
            return { label: "Paid", cssClass: "approved" };
        } else if (order.method === OMS.METHOD.PARTIAL) {
            return { label: "Partial", cssClass: "pending" };
        }
        return { label: "COD", cssClass: "pending" };
    }

    function renderReports() {
        const dispatchedCount = approvedOrders.filter(function (order) {
            return order.tracking !== null;
        }).length;

        OMS.setText("stat-ready", approvedOrders.length - dispatchedCount);
        OMS.setText("stat-dispatched", dispatchedCount);
        OMS.setText("stat-collected", OMS.formatCurrency(sumOrders(approvedOrders, function (order) {
            return order.received;
        })));
        OMS.setText("stat-outstanding", OMS.formatCurrency(sumOrders(approvedOrders, function (order) {
            return OMS.calculateBalance(order.amount, order.received);
        })));

        const body = document.getElementById("dispatch-body");
        if (approvedOrders.length === 0) {
            OMS.showEmptyRow(body, "No approved orders to dispatch.", 5);
            return;
        }

        const rows = approvedOrders.map(function (order) {
            const badge = getPaymentBadge(order);
            const row = document.createElement("tr");
            row.append(
                OMS.createCell(order.customer),
                OMS.createCell(order.address),
                OMS.createCell(OMS.formatCurrency(order.amount)),
                OMS.createStatusCell(badge.label, badge.cssClass),
                OMS.createCell(order.tracking || "Not assigned")
            );
            return row;
        });
        body.replaceChildren(...rows);
    }

    // The table on the page shows which of the three pages this is.
    if (document.getElementById("recent-orders-body")) {
        renderEmployeeDashboard();
    } else if (document.getElementById("employee-summary-body")) {
        renderAdminDashboard();
    } else if (document.getElementById("dispatch-body")) {
        renderReports();
    }
});
