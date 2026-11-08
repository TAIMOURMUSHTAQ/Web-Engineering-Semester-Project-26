/* Login page: validates the form and opens the dashboard for the chosen role. */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const REDIRECT_DELAY_MS = 800;

    // Returns an error message, or an empty string when the value is valid.
    function getUsernameError() {
        const username = usernameInput.value.trim();

        if (username === "") {
            return "Please enter your username or email.";
        } else if (username.includes("@") && !EMAIL_PATTERN.test(username)) {
            return "Please enter a valid email address.";
        }
        return "";
    }

    function getPasswordError() {
        return passwordInput.value === "" ? "Please enter your password." : "";
    }

    function validateInput(input, getError) {
        const error = getError();
        if (error) {
            OMS.showFieldError(input, error);
            return false;
        }
        OMS.clearFieldError(input);
        return true;
    }

    function handleLogin(event) {
        event.preventDefault();

        const usernameValid = validateInput(usernameInput, getUsernameError);
        const passwordValid = validateInput(passwordInput, getPasswordError);

        if (!usernameValid || !passwordValid) {
            OMS.showMessage("login-message", "Please correct the highlighted fields.", "error");
            (usernameValid ? passwordInput : usernameInput).focus();
            return;
        }

        OMS.showMessage("login-message", "Login details validated. Opening your dashboard...", "success");

        const selectedRole = form.querySelector('input[name="role"]:checked').value;
        const destination = selectedRole === "admin" ? "admin-dashboard.html" : "employee-dashboard.html";
        setTimeout(function () {
            window.location.href = destination;
        }, REDIRECT_DELAY_MS);
    }

    form.addEventListener("submit", handleLogin);

    // Remove an error as soon as the user corrects the field.
    usernameInput.addEventListener("input", function () {
        if (usernameInput.classList.contains("invalid")) {
            validateInput(usernameInput, getUsernameError);
        }
    });
    passwordInput.addEventListener("input", function () {
        if (passwordInput.classList.contains("invalid")) {
            validateInput(passwordInput, getPasswordError);
        }
    });
});
