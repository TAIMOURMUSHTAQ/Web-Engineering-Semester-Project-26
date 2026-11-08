/* Commission page: calculates the logged-in employee's commission per month. */

document.addEventListener("DOMContentLoaded", function () {
    const monthSelect = document.getElementById("commission-month");
    const monthlyRecords = OMS.getMonthlyCommission(OMS.CURRENT_EMPLOYEE);

    function fillMonthOptions() {
        monthlyRecords.forEach(function (record) {
            const option = document.createElement("option");
            option.value = record.month;
            option.textContent = OMS.formatMonth(record.month);
            monthSelect.appendChild(option);
        });
    }

    // Updates the summary cards for the month chosen in the dropdown.
    function showSelectedMonth() {
        const record = monthlyRecords.find(function (item) {
            return item.month === monthSelect.value;
        });

        OMS.setText("commission-orders", record.approvedOrders);
        OMS.setText("commission-sales", OMS.formatCurrency(record.totalSales));
        OMS.setText("commission-rate", record.rate + "%");
        OMS.setText("commission-earned", OMS.formatCurrency(record.commission));
    }

    function renderBreakdownTable() {
        const rows = monthlyRecords.map(function (record) {
            const row = document.createElement("tr");
            row.append(
                OMS.createCell(OMS.formatMonth(record.month)),
                OMS.createCell(record.approvedOrders),
                OMS.createCell(OMS.formatCurrency(record.totalSales)),
                OMS.createCell(record.rate + "%"),
                OMS.createCell(OMS.formatCurrency(record.commission))
            );
            return row;
        });
        document.getElementById("commission-body").replaceChildren(...rows);
    }

    monthSelect.addEventListener("change", showSelectedMonth);

    fillMonthOptions();
    showSelectedMonth();
    renderBreakdownTable();
});
