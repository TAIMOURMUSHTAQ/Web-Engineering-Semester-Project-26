/* My Orders and Order Approval pages: table display, search, status filter,
   and the Approve / Reject actions on the admin page. */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("orders-body");
    const searchInput = document.getElementById("order-search");
    const statusFilter = document.getElementById("status-filter");
    const isAdminView = tableBody.dataset.view === "admin";
    const COLUMN_COUNT = 7; // both tables have seven columns

    // Admins see every order; an employee sees only their own.
    function getVisibleOrders() {
        const orders = OMS.loadOrders();
        if (isAdminView) {
            return orders;
        }
        return orders.filter(function (order) {
            return order.employee === OMS.CURRENT_EMPLOYEE;
        });
    }

    // Keeps orders that match both the search text and the selected status.
    function filterOrders(orders, searchText, status) {
        const text = searchText.trim().toLowerCase();

        return orders.filter(function (order) {
            const matchesSearch = order.customer.toLowerCase().includes(text) ||
                order.id.toLowerCase().includes(text);
            const matchesStatus = status === "All" || order.status === status;
            return matchesSearch && matchesStatus;
        });
    }

    function createActionCell(order) {
        const cell = document.createElement("td");
        cell.className = "actions-cell";

        [["Approve", "approve", OMS.STATUS.APPROVED], ["Reject", "reject", OMS.STATUS.REJECTED]].forEach(function (action) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn " + action[1];
            button.textContent = action[0];
            button.dataset.orderId = order.id;
            button.dataset.newStatus = action[2];
            button.disabled = order.status !== OMS.STATUS.PENDING; // decided orders are final
            cell.append(button, " ");
        });

        return cell;
    }

    function createOrderRow(order) {
        const row = document.createElement("tr");
        const statusCell = OMS.createStatusCell(order.status, order.status.toLowerCase());

        if (isAdminView) {
            row.append(
                OMS.createCell(order.id),
                OMS.createCell(order.customer),
                OMS.createCell(order.employee),
                OMS.createCell(OMS.formatCurrency(order.amount)),
                OMS.createCell(order.method),
                statusCell,
                createActionCell(order)
            );
        } else {
            row.append(
                OMS.createCell(order.id),
                OMS.createCell(OMS.formatDate(order.date)),
                OMS.createCell(order.customer),
                OMS.createCell(order.items),
                OMS.createCell(OMS.formatCurrency(order.amount)),
                OMS.createCell(order.method),
                statusCell
            );
        }
        return row;
    }

    function updateStatusCounters(orders) {
        OMS.setText("count-pending", OMS.countByStatus(orders, OMS.STATUS.PENDING));
        OMS.setText("count-approved", OMS.countByStatus(orders, OMS.STATUS.APPROVED));
        OMS.setText("count-rejected", OMS.countByStatus(orders, OMS.STATUS.REJECTED));
    }

    // Redraws the table and counters from the current data and filter values.
    function renderOrders() {
        const orders = getVisibleOrders();
        const matches = filterOrders(orders, searchInput.value, statusFilter.value);

        updateStatusCounters(orders);
        OMS.setText("results-count", "Showing " + matches.length + " of " + orders.length + " orders");

        if (matches.length === 0) {
            OMS.showEmptyRow(tableBody, "No matching order found.", COLUMN_COUNT);
        } else {
            tableBody.replaceChildren(...matches.map(createOrderRow));
        }
    }

    // One listener on the table handles the buttons of every row (event delegation).
    function handleTableClick(event) {
        const button = event.target.closest("button[data-order-id]");
        if (!button) {
            return;
        }

        const orderId = button.dataset.orderId;
        const newStatus = button.dataset.newStatus;

        if (OMS.updateOrderStatus(orderId, newStatus)) {
            const type = newStatus === OMS.STATUS.APPROVED ? "success" : "info";
            OMS.showMessage("order-message", "Order " + orderId + " " + newStatus.toLowerCase() + " successfully.", type);
        } else {
            OMS.showMessage("order-message", "Order " + orderId + " has already been decided.", "error");
        }
        renderOrders();
    }

    function clearFilters() {
        searchInput.value = "";
        statusFilter.value = "All";
        renderOrders();
    }

    searchInput.addEventListener("input", renderOrders);
    statusFilter.addEventListener("change", renderOrders);
    document.getElementById("clear-filters").addEventListener("click", clearFilters);

    document.getElementById("reset-data").addEventListener("click", function () {
        OMS.resetOrders();
        OMS.hideMessage("order-message");
        clearFilters();
    });

    if (isAdminView) {
        tableBody.addEventListener("click", handleTableClick);
    }

    renderOrders();
});
