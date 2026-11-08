/* New Order page: form validation, dynamic payment fields, balance calculation. */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("order-form");
    const amountInput = document.getElementById("amount");
    const receivedInput = document.getElementById("received");
    const receiptInput = document.getElementById("receipt");
    const receivedRow = document.getElementById("received-row");
    const receiptRow = document.getElementById("receipt-row");
    const methodRadios = form.querySelectorAll('input[name="payment_method"]');

    const CONTACT_PATTERN = /^03\d{2}-\d{7}$/;
    const NAME_PATTERN = /^[A-Za-z ]{3,100}$/;
    const RECEIPT_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
    const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

    function getValue(fieldId) {
        return document.getElementById(fieldId).value.trim();
    }

    // Returns "cod", "partial" or "full".
    function getSelectedMethod() {
        return form.querySelector('input[name="payment_method"]:checked').value;
    }

    /* ---------- Validation rules ----------
       Each rule returns an error message, or "" when the value is valid. */

    function getNameError() {
        const name = getValue("customer-name");
        if (name === "") {
            return "Please enter the customer's full name.";
        } else if (!NAME_PATTERN.test(name)) {
            return "Name must be 3-100 letters and spaces only.";
        }
        return "";
    }

    function getContactError() {
        const contact = getValue("contact");
        if (contact === "") {
            return "Please enter the contact number.";
        } else if (!CONTACT_PATTERN.test(contact)) {
            return "Please enter a valid contact number, e.g. 0300-1234567.";
        }
        return "";
    }

    function getWhatsappError() {
        const whatsapp = getValue("whatsapp");
        if (whatsapp !== "" && !CONTACT_PATTERN.test(whatsapp)) {
            return "Please enter a valid WhatsApp number or leave it empty.";
        }
        return "";
    }

    function getAddressError() {
        const length = getValue("address").length;
        if (length === 0) {
            return "Please enter the delivery address.";
        } else if (length < 10 || length > 255) {
            return "Address must be 10-255 characters long.";
        }
        return "";
    }

    function getAmountError() {
        const value = getValue("amount");
        const amount = Number(value);
        if (value === "") {
            return "Please enter the order amount.";
        } else if (amount <= 0) {
            return "Order amount must be greater than 0.";
        } else if (!Number.isInteger(amount)) {
            return "Order amount must be a whole number.";
        }
        return "";
    }

    function getDescriptionError() {
        const length = getValue("description").length;
        if (length === 0) {
            return "Please list at least one item.";
        } else if (length < 3 || length > 500) {
            return "Description must be 3-500 characters long.";
        }
        return "";
    }

    // Business rule BR-03: COD = 0, Partial: 0 < received < amount, Full: received = amount.
    function getReceivedError() {
        const method = getSelectedMethod();
        const value = getValue("received");
        const amount = Number(getValue("amount"));
        const received = Number(value);

        // A wrong order amount is reported on its own field, so skip the comparison.
        if (method === "cod" || getAmountError() !== "") {
            return "";
        } else if (value === "") {
            return "Please enter the amount received.";
        } else if (received <= 0) {
            return "Amount received must be greater than 0.";
        } else if (received > amount) {
            return "Amount received cannot be greater than order amount.";
        } else if (method === "partial" && received === amount) {
            return "A partial payment must be less than the order amount. Select Full Payment instead.";
        } else if (method === "full" && received !== amount) {
            return "Full payment must equal the order amount.";
        }
        return "";
    }

    // A receipt is required for Partial and Full Payment only (BR-02).
    function getReceiptError() {
        if (getSelectedMethod() === "cod") {
            return "";
        }

        const file = receiptInput.files[0];
        if (!file) {
            return "Please upload the payment receipt.";
        }

        const extension = file.name.split(".").pop().toLowerCase();
        if (!RECEIPT_EXTENSIONS.includes(extension)) {
            return "Receipt must be a JPG, PNG or PDF file.";
        } else if (file.size > MAX_RECEIPT_BYTES) {
            return "Receipt must not be larger than 5 MB.";
        }
        return "";
    }

    // Connects each input to its validation rule.
    const validationRules = [
        { input: document.getElementById("customer-name"), getError: getNameError },
        { input: document.getElementById("contact"), getError: getContactError },
        { input: document.getElementById("whatsapp"), getError: getWhatsappError },
        { input: document.getElementById("address"), getError: getAddressError },
        { input: amountInput, getError: getAmountError },
        { input: document.getElementById("description"), getError: getDescriptionError },
        { input: receivedInput, getError: getReceivedError },
        { input: receiptInput, getError: getReceiptError }
    ];

    function validateField(rule) {
        const error = rule.getError();
        if (error) {
            OMS.showFieldError(rule.input, error);
            return false;
        }
        OMS.clearFieldError(rule.input);
        return true;
    }

    // Checks every field and returns the first invalid input (or null).
    function validateOrderForm() {
        let firstInvalidInput = null;
        validationRules.forEach(function (rule) {
            if (!validateField(rule) && firstInvalidInput === null) {
                firstInvalidInput = rule.input;
            }
        });
        return firstInvalidInput;
    }

    function revalidateReceived() {
        if (getValue("received") !== "" || receivedInput.classList.contains("invalid")) {
            validateField({ input: receivedInput, getError: getReceivedError });
        }
    }

    /* ---------- Dynamic payment behaviour ---------- */

    // Shows the fields each payment method needs and pre-fills what it can.
    function updatePaymentFields() {
        const method = getSelectedMethod();
        const isCod = method === "cod";

        receivedRow.classList.toggle("hidden", isCod);
        receiptRow.classList.toggle("hidden", isCod);
        receivedInput.readOnly = method === "full";

        if (isCod) {
            receivedInput.value = "";
            receiptInput.value = "";
            OMS.clearFieldError(receivedInput);
            OMS.clearFieldError(receiptInput);
        } else if (method === "full") {
            receivedInput.value = getValue("amount");
            OMS.clearFieldError(receivedInput);
        }

        updateBalance();
    }

    // Balance due = order amount - amount received (BR-04).
    function updateBalance() {
        const amount = Number(getValue("amount"));
        const received = Number(getValue("received"));
        const balance = OMS.calculateBalance(amount, received);

        if (amount > 0 && balance >= 0) {
            OMS.setText("balance-due", OMS.formatCurrency(balance));
        } else {
            OMS.setText("balance-due", "--");
        }
    }

    /* ---------- Form events ---------- */

    function handleSubmit(event) {
        event.preventDefault();

        const firstInvalidInput = validateOrderForm();
        if (firstInvalidInput) {
            OMS.showMessage("order-message", "Please correct the highlighted fields before submitting.", "error");
            firstInvalidInput.focus();
            return;
        }

        const methodNames = { cod: OMS.METHOD.COD, partial: OMS.METHOD.PARTIAL, full: OMS.METHOD.FULL };
        const receiptFile = receiptInput.files[0];
        const order = OMS.addOrder({
            customer: getValue("customer-name"),
            contact: getValue("contact"),
            whatsapp: getValue("whatsapp"),
            address: getValue("address"),
            items: getValue("description"),
            amount: Number(getValue("amount")),
            received: Number(getValue("received")),
            method: methodNames[getSelectedMethod()],
            receiptName: receiptFile ? receiptFile.name : null // only the file name is kept
        });

        form.reset();
        OMS.showMessage(
            "order-message",
            "Order " + order.id + " validated and submitted successfully. Status: Pending. Balance due: " +
                OMS.formatCurrency(OMS.calculateBalance(order.amount, order.received)) + ".",
            "success"
        );
        window.scrollTo(0, 0);
    }

    // The browser clears the values just after this event, so wait one tick.
    function handleReset() {
        setTimeout(function () {
            validationRules.forEach(function (rule) {
                OMS.clearFieldError(rule.input);
            });
            updatePaymentFields();
        }, 0);
    }

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);
    document.getElementById("reset-button").addEventListener("click", function () {
        OMS.hideMessage("order-message");
    });

    methodRadios.forEach(function (radio) {
        radio.addEventListener("change", updatePaymentFields);
    });

    amountInput.addEventListener("input", function () {
        updatePaymentFields();
        revalidateReceived();
    });

    // Amount Received gets immediate feedback while typing.
    receivedInput.addEventListener("input", function () {
        updateBalance();
        validateField({ input: receivedInput, getError: getReceivedError });
    });

    receiptInput.addEventListener("change", function () {
        validateField({ input: receiptInput, getError: getReceiptError });
    });

    // Other fields are checked on leaving them, then re-checked while being fixed.
    validationRules.forEach(function (rule) {
        rule.input.addEventListener("blur", function () {
            if (rule.input !== receiptInput) {
                validateField(rule);
            }
        });
        rule.input.addEventListener("input", function () {
            if (rule.input.classList.contains("invalid")) {
                validateField(rule);
            }
        });
    });

    updatePaymentFields();
});
