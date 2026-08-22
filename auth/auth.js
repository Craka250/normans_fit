/* =========================================================
   VYRON AUTHENTICATION
   Frontend Authentication Adapter

   NOTE:
   This implementation uses localStorage for development/
   prototype purposes.

   Production authentication should be moved to a backend
   using secure HTTP-only session cookies or tokens.
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const STORAGE = {
        USERS: "vyron_users_v1",
        SESSION: "vyron_session_v1",
        RESET: "vyron_reset_tokens_v1"
    };


    const PBKDF2_ITERATIONS = 120000;

    const encoder = new TextEncoder();

    /* =========================================================
    SESSION CONFIGURATION
    ========================================================= */

    const SESSION_CONFIG = {
        // Member is logged out after 5 minutes without activity.
        INACTIVITY_TIMEOUT: 5 * 60 * 1000,

        // Check inactivity every 10 seconds.
        CHECK_INTERVAL: 10 * 1000,

        // Do not write localStorage on every mouse movement.
        ACTIVITY_THROTTLE: 30 * 1000,

        // Events that count as user activity.
        ACTIVITY_EVENTS: [
            "click",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "touchmove"
        ]
    };


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);


    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];


    /* =====================================================
       STORAGE HELPERS
    ===================================================== */

    function readStorage(key, fallback = []) {

        try {

            const value = localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            const parsed = JSON.parse(value);

            return parsed ?? fallback;

        } catch (error) {

            console.warn(
                `VYRON storage read failed for "${key}".`,
                error
            );

            return fallback;
        }
    }


    function writeStorage(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error(
                `VYRON storage write failed for "${key}".`,
                error
            );

            return false;
        }
    }


    /* =====================================================
       NORMALIZATION
    ===================================================== */

    function normalizeEmail(value) {

        return String(value || "")
            .trim()
            .toLowerCase();
    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function isValidEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
            .test(normalizeEmail(value));
    }


    function isValidName(value) {

        return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/
            .test(String(value || "").trim());
    }


    function isValidPhone(value) {

        const phone = String(value || "").trim();

        if (!phone) {
            return true;
        }

        return /^[+0-9][0-9 ()-]{7,18}$/.test(phone);
    }


    function isStrongPassword(password) {

        return (
            typeof password === "string" &&
            password.length >= 8 &&
            password.length <= 128 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    }


    /* =====================================================
       BASE64 / RANDOM DATA
    ===================================================== */

    function bytesToBase64(bytes) {

        let binary = "";

        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });

        return btoa(binary);
    }


    function base64ToBytes(value) {

        const binary = atob(value);

        return Uint8Array.from(
            binary,
            character => character.charCodeAt(0)
        );
    }


    function randomBytes(size = 16) {

        const bytes = new Uint8Array(size);

        crypto.getRandomValues(bytes);

        return bytes;
    }


    function createId() {
        if (
            globalThis.crypto &&
            typeof globalThis.crypto.randomUUID ===
                "function"
        ) {
            return globalThis.crypto.randomUUID();
        }

        return [
            Date.now().toString(36),
            Math.random().toString(36).slice(2),
            Math.random().toString(36).slice(2)
        ].join("-");
    }


    /* =====================================================
       PASSWORD HASHING
    ===================================================== */

    async function derivePasswordHash(password, salt) {

        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );


        const bits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt,
                iterations: PBKDF2_ITERATIONS,
                hash: "SHA-256"
            },
            key,
            256
        );


        return bytesToBase64(
            new Uint8Array(bits)
        );
    }


    /* =====================================================
       CONSTANT-TIME COMPARISON
    ===================================================== */

    function secureEqual(a, b) {

        if (
            typeof a !== "string" ||
            typeof b !== "string"
        ) {
            return false;
        }


        if (a.length !== b.length) {
            return false;
        }


        let result = 0;


        for (let index = 0; index < a.length; index++) {

            result |=
                a.charCodeAt(index) ^
                b.charCodeAt(index);
        }


        return result === 0;
    }


    /* =====================================================
       UI MESSAGES
    ===================================================== */

    function showMessage(
        message,
        type = "info"
    ) {

        const element = $("#authMessage");

        if (!element) {
            return;
        }


        element.textContent = message;

        element.className =
            `auth-message show ${type}`;
    }


    function clearFormState(form) {

        if (!form) {
            return;
        }


        $$(".field-error", form)
            .forEach(element => {
                element.textContent = "";
            });


        $$("input", form)
            .forEach(input => {
                input.classList.remove("invalid");
                input.removeAttribute("aria-invalid");
            });


        const message = $("#authMessage");

        if (message) {
            message.className = "auth-message";
            message.textContent = "";
        }
    }


    function showFieldError(
        fieldName,
        message
    ) {

        const errorElement =
            document.querySelector(
                `[data-error-for="${fieldName}"]`
            );


        const input =
            document.getElementById(fieldName);


        if (errorElement) {
            errorElement.textContent = message;
        }


        if (input) {

            input.classList.toggle(
                "invalid",
                Boolean(message)
            );


            if (message) {
                input.setAttribute(
                    "aria-invalid",
                    "true"
                );
            } else {
                input.removeAttribute(
                    "aria-invalid"
                );
            }
        }
    }


    /* =====================================================
       BUTTON LOADING STATE
    ===================================================== */

    function setButtonLoading(
        button,
        text
    ) {

        if (!button) {
            return;
        }


        button.disabled = true;

        button.dataset.originalContent =
            button.innerHTML;


        button.innerHTML = `
            <span>${text}</span>
            <i
                class="fa-solid fa-spinner fa-spin"
                aria-hidden="true"
            ></i>
        `;
    }


    function restoreButton(button) {

        if (!button) {
            return;
        }


        button.disabled = false;


        if (button.dataset.originalContent) {

            button.innerHTML =
                button.dataset.originalContent;


            delete button.dataset.originalContent;
        }
    }


    /* =====================================================
       REGISTERED USER COUNT
    ===================================================== */

    function updateUserCount() {

        const users =
            readStorage(STORAGE.USERS, []);


        const count =
            Array.isArray(users)
                ? users.length
                : 0;


        $$("[data-user-count]")
            .forEach(element => {

                element.textContent =
                    count.toLocaleString();
            });
    }


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    function initializePasswordToggles() {
        $$("[data-toggle-password]")
            .forEach(button => {

                if (
                    button.dataset.passwordToggleInitialized ===
                    "true"
                ) {
                    return;
                }

                button.dataset.passwordToggleInitialized =
                    "true";

                button.addEventListener(
                    "click",
                    () => {

                        const input =
                            document.getElementById(
                                button.dataset.togglePassword
                            );

                        if (!input) {
                            return;
                        }

                        const showingPassword =
                            input.type === "text";

                        input.type =
                            showingPassword
                                ? "password"
                                : "text";

                        button.setAttribute(
                            "aria-pressed",
                            String(!showingPassword)
                        );

                        button.setAttribute(
                            "aria-label",
                            showingPassword
                                ? "Show password"
                                : "Hide password"
                        );

                        button.innerHTML =
                            showingPassword
                                ? `
                                    <i
                                        class="fa-regular fa-eye"
                                        aria-hidden="true"
                                    ></i>
                                `
                                : `
                                    <i
                                        class="fa-regular fa-eye-slash"
                                        aria-hidden="true"
                                    ></i>
                                `;
                    }
                );
            });
    }


    /* =====================================================
       PASSWORD STRENGTH
    ===================================================== */

    function initializePasswordStrength() {
        const input = $("#password");
        const meter =
            $(".password-strength span");

        if (!input || !meter) {
            return;
        }

        if (
            input.dataset.strengthInitialized ===
            "true"
        ) {
            return;
        }

        input.dataset.strengthInitialized =
            "true";

        input.addEventListener(
            "input",
            () => {
                const password =
                    input.value;

                let score = 0;

                if (password.length >= 8) {
                    score++;
                }

                if (password.length >= 12) {
                    score++;
                }

                if (/[A-Z]/.test(password)) {
                    score++;
                }

                if (/[a-z]/.test(password)) {
                    score++;
                }

                if (/\d/.test(password)) {
                    score++;
                }

                if (
                    /[^A-Za-z0-9]/.test(password)
                ) {
                    score++;
                }

                const percentage =
                    Math.min(
                        (score / 6) * 100,
                        100
                    );

                meter.style.width =
                    `${percentage}%`;
            }
        );
    }


    /* =========================================================
    SAFE REDIRECT
    ========================================================= */

    function getSafeRedirect() {

        const requested =
            new URLSearchParams(
                window.location.search
            ).get("redirect");

        if (!requested) {
            return "../member-dashboard.html";
        }

        // Block external redirects
        if (
            /^https?:/i.test(requested) ||
            /^\/\//.test(requested) ||
            /javascript:/i.test(requested)
        ) {
            return "../member-dashboard.html";
        }

        const cleaned =
            requested.replace(/^\/+/, "");

        return cleaned.startsWith("../")
            ? cleaned
            : `../${cleaned}`;
    }

    /* =========================================================
    AUTHENTICATION STATE
    ========================================================= */

    function getSession() {

        return readStorage(
            STORAGE.SESSION,
            null
        );
    }

    function isSessionValid() {
        const session = getSession();

        if (!session || typeof session !== "object") {
            return false;
        }

        const now = Date.now();

        const createdAtTimestamp =
            Number(
                session.createdAtTimestamp ||
                new Date(session.createdAt).getTime()
            );

        const lastActivityAt =
            Number(
                session.lastActivityAt ||
                createdAtTimestamp ||
                0
            );

        if (!lastActivityAt) {
            localStorage.removeItem(
                STORAGE.SESSION
            );

            return false;
        }

        /*
        * Five-minute inactivity timeout.
        */
        if (
            now - lastActivityAt >=
            SESSION_CONFIG.INACTIVITY_TIMEOUT
        ) {
            localStorage.removeItem(
                STORAGE.SESSION
            );

            return false;
        }

        /*
        * Keep expiresAt synchronized with
        * the inactivity timestamp.
        */
        const expiresAt =
            Number(session.expiresAt || 0);

        if (
            expiresAt &&
            now >= expiresAt
        ) {
            localStorage.removeItem(
                STORAGE.SESSION
            );

            return false;
        }

        return true;
    }

    /* =========================================================
    INACTIVITY SESSION MANAGEMENT
    ========================================================= */

    let inactivityCheckTimer = null;
    let inactivityMonitorStarted = false;

    function getLastActivity() {
        const session = getSession();

        if (!session) {
            return 0;
        }

        return Number(
            session.lastActivityAt ||
            session.createdAtTimestamp ||
            0
        );
    }


    function expireSession() {
        localStorage.removeItem(
            STORAGE.SESSION
        );

        stopInactivityMonitor();

        const pathname =
            window.location.pathname
                .replace(/\\/g, "/");

        if (
            pathname.includes(
                "/member-dashboard.html"
            )
        ) {
            const currentPage =
                pathname
                    .split("/")
                    .pop() ||
                "member-dashboard.html";

            const redirect =
                `../${currentPage}`;

            window.location.replace(
                `auth/login.html?timeout=1&redirect=${encodeURIComponent(
                    redirect
                )}`
            );
        }
    }


    function checkSessionInactivity() {
        const session = getSession();

        if (!session) {
            stopInactivityMonitor();
            return;
        }

        const lastActivity =
            Number(
                session.lastActivityAt ||
                session.createdAtTimestamp ||
                0
            );

        if (!lastActivity) {
            expireSession();
            return;
        }

        const inactiveFor =
            Date.now() - lastActivity;

        if (
            inactiveFor >=
            SESSION_CONFIG.INACTIVITY_TIMEOUT
        ) {
            console.log(
                "[VYRON AUTH] Session expired due to inactivity."
            );

            expireSession();
        }
    }

    let lastActivityWrite = 0;

    function updateSessionActivity() {
        const session = getSession();

        if (!session) {
            return;
        }

        const now = Date.now();

        /*
        * Prevent excessive localStorage writes.
        */
        if (
            now - lastActivityWrite <
            SESSION_CONFIG.ACTIVITY_THROTTLE
        ) {
            return;
        }

        session.lastActivityAt = now;

        /*
        * Sliding inactivity expiration.
        *
        * The session expires 5 minutes AFTER
        * the user's last recorded activity.
        */
        session.expiresAt =
            now +
            SESSION_CONFIG.INACTIVITY_TIMEOUT;

        const saved = writeStorage(
            STORAGE.SESSION,
            session
        );

        if (saved) {
            lastActivityWrite = now;
        }
    }


    function startInactivityMonitor() {
        if (inactivityMonitorStarted) {
            return;
        }

        if (!isSessionValid()) {
            return;
        }

        inactivityMonitorStarted = true;

        SESSION_CONFIG.ACTIVITY_EVENTS.forEach(
            eventName => {
                document.addEventListener(
                    eventName,
                    updateSessionActivity,
                    {
                        passive: true
                    }
                );
            }
        );

        inactivityCheckTimer =
            window.setInterval(
                checkSessionInactivity,
                SESSION_CONFIG.CHECK_INTERVAL
            );

        console.log(
            "[VYRON AUTH] Inactivity monitor started."
        );
    }


    function stopInactivityMonitor() {
        SESSION_CONFIG.ACTIVITY_EVENTS.forEach(
            eventName => {
                document.removeEventListener(
                    eventName,
                    updateSessionActivity
                );
            }
        );

        if (inactivityCheckTimer !== null) {
            window.clearInterval(
                inactivityCheckTimer
            );

            inactivityCheckTimer = null;
        }

        inactivityMonitorStarted = false;

        console.log(
            "[VYRON AUTH] Inactivity monitor stopped."
        );
    }

    function hasRegisteredAccounts() {

        const users =
            readStorage(
                STORAGE.USERS,
                []
            );

        return (
            Array.isArray(users) &&
            users.length > 0
        );
    }


    /* =========================================================
    AUTH ROUTES
    ========================================================= */

    /*
    * VYRON directory structure:
    *
    * /index.html
    * /member-dashboard.html
    * /auth/login.html
    * /auth/signup.html
    * /auth/forgot-password.html
    * /auth/reset-password.html
    *
    * Because auth pages live inside /auth/,
    * dashboard is one level above them.
    */

    /* =========================================================
    AUTH ROUTES
    ========================================================= */

    function isInsideAuthDirectory() {
        return window.location.pathname
            .replace(/\\/g, "/")
            .includes("/auth/");
    }


    /* ---------------------------------------------------------
    LOGIN
    --------------------------------------------------------- */

    function redirectToLogin(redirect = "") {

        const url = isInsideAuthDirectory()
            ? "login.html"
            : "auth/login.html";

        const finalUrl = redirect
            ? `${url}?redirect=${encodeURIComponent(redirect)}`
            : url;

        window.location.replace(finalUrl);
    }


    /* ---------------------------------------------------------
    SIGNUP
    --------------------------------------------------------- */

    function redirectToSignup(redirect = "") {

        const url = isInsideAuthDirectory()
            ? "signup.html"
            : "auth/signup.html";

        const finalUrl = redirect
            ? `${url}?redirect=${encodeURIComponent(redirect)}`
            : url;

        window.location.replace(finalUrl);
    }


    /* ---------------------------------------------------------
    DASHBOARD
    --------------------------------------------------------- */

    function redirectToDashboard() {

        const dashboardUrl = isInsideAuthDirectory()
            ? "../member-dashboard.html"
            : "member-dashboard.html";

        window.location.replace(dashboardUrl);
    }


    /* =========================================================
    AUTH PAGE ROUTING
    ========================================================= */

    function routeUserToAuthentication() {

        if (isSessionValid()) {

            redirectToDashboard();

            return;
        }

        if (hasRegisteredAccounts()) {

            redirectToLogin();

            return;
        }

        redirectToSignup();
    }


    /* =========================================================
    PROTECTED PAGE GUARD
    ========================================================= */

    function requireAuthentication() {
        if (isSessionValid()) {

            updateSessionActivity();
            startInactivityMonitor();

            return true;
        }

        localStorage.removeItem(
            STORAGE.SESSION
        );

        stopInactivityMonitor();

        const currentPage =
            window.location.pathname
                .split("/")
                .pop();

        const requestedPage =
            currentPage &&
            currentPage !== "login.html" &&
            currentPage !== "signup.html"
                ? currentPage
                : "";

        if (hasRegisteredAccounts()) {
            redirectToLogin(
                requestedPage
            );
        } else {
            redirectToSignup(
                requestedPage
            );
        }

        return false;
    }


    /* =========================================================
    PUBLIC AUTH PAGE GUARD
    ========================================================= */

    function preventAuthenticatedAuthPage() {

        if (!isSessionValid()) {
            return false;
        }

        redirectToDashboard();

        return true;
    }


    /* =====================================================
       SIGNUP
    ===================================================== */

    async function handleSignup(form) {

        clearFormState(form);


        const data =
            new FormData(form);


        const firstName =
            String(
                data.get("firstName") || ""
            ).trim();


        const lastName =
            String(
                data.get("lastName") || ""
            ).trim();


        const email =
            normalizeEmail(
                data.get("email")
            );


        const phone =
            String(
                data.get("phone") || ""
            ).trim();


        const password =
            String(
                data.get("password") || ""
            );


        const confirmPassword =
            String(
                data.get("confirmPassword") || ""
            );


        const termsAccepted =
            data.get("terms") === "on";


        let valid = true;


        /* ---------------------------------------------
           First Name
        --------------------------------------------- */

        if (!isValidName(firstName)) {

            showFieldError(
                "firstName",
                "Enter a valid first name."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Last Name
        --------------------------------------------- */

        if (!isValidName(lastName)) {

            showFieldError(
                "lastName",
                "Enter a valid last name."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Email
        --------------------------------------------- */

        if (!isValidEmail(email)) {

            showFieldError(
                "email",
                "Enter a valid email address."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Phone
        --------------------------------------------- */

        if (!isValidPhone(phone)) {

            showFieldError(
                "phone",
                "Enter a valid phone number."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Password
        --------------------------------------------- */

        if (!isStrongPassword(password)) {

            showFieldError(
                "password",
                "Use 8+ characters with uppercase, lowercase, a number and a special character."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Confirm Password
        --------------------------------------------- */

        if (password !== confirmPassword) {

            showFieldError(
                "confirmPassword",
                "Passwords do not match."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Terms
        --------------------------------------------- */

        if (!termsAccepted) {

            showFieldError(
                "terms",
                "You must accept the required terms."
            );

            valid = false;
        }


        /* ---------------------------------------------
           Stop if invalid
        --------------------------------------------- */

        if (!valid) {

            showMessage(
                "Please correct the highlighted fields before continuing.",
                "error"
            );

            return;
        }


        /* ---------------------------------------------
           Read existing users
        --------------------------------------------- */

        const users =
            readStorage(
                STORAGE.USERS,
                []
            );


        const existingUser =
            Array.isArray(users)
                ? users.some(
                    user =>
                        user.email === email
                )
                : false;


        if (existingUser) {

            showFieldError(
                "email",
                "An account with this email already exists."
            );


            showMessage(
                "An account already exists. Please sign in instead.",
                "error"
            );

            return;
        }


        const submitButton =
            $("#signupSubmit");


        setButtonLoading(
            submitButton,
            "CREATING ACCOUNT..."
        );


        try {

            /* -----------------------------------------
               Generate salt
            ----------------------------------------- */

            const salt =
                randomBytes();


            /* -----------------------------------------
               Derive password hash
            ----------------------------------------- */

            const passwordHash =
                await derivePasswordHash(
                    password,
                    salt
                );


            /* -----------------------------------------
               Create user
            ----------------------------------------- */

            const user = {

                id: createId(),

                firstName,

                lastName,

                email,

                phone,

                passwordHash,

                salt:
                    bytesToBase64(salt),

                createdAt:
                    new Date().toISOString(),

                status: "active"
            };


            users.push(user);


            /* -----------------------------------------
               Save
            ----------------------------------------- */

            const saved =
                writeStorage(
                    STORAGE.USERS,
                    users
                );


            if (!saved) {
                throw new Error(
                    "Unable to save account."
                );
            }


            /* -----------------------------------------
               Update UI
            ----------------------------------------- */

            updateUserCount();


            showMessage(
                "Account created successfully. Redirecting to login...",
                "success"
            );


            /* -----------------------------------------
               Redirect
            ----------------------------------------- */

            window.setTimeout(
                () => {

                    const requested =
                        new URLSearchParams(
                            window.location.search
                        ).get("redirect");

                    let destination =
                        "login.html?registered=1&email=" +
                        encodeURIComponent(email);

                    if (requested) {

                        destination +=
                            "&redirect=" +
                            encodeURIComponent(requested);
                    }

                    window.location.replace(
                        destination
                    );

                },
                850
            );


        } catch (error) {

            console.error(
                "VYRON signup error:",
                error
            );


            showMessage(
                "We could not create the account. Please try again.",
                "error"
            );


            restoreButton(
                submitButton
            );
        }
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    async function handleLogin(form) {

        clearFormState(form);


        const data =
            new FormData(form);


        const email =
            normalizeEmail(
                data.get("email")
            );


        const password =
            String(
                data.get("password") || ""
            );


        let valid = true;


        if (!isValidEmail(email)) {

            showFieldError(
                "email",
                "Enter a valid email address."
            );

            valid = false;
        }


        if (!password) {

            showFieldError(
                "password",
                "Enter your password."
            );

            valid = false;
        }


        if (!valid) {

            showMessage(
                "Enter your email and password to continue.",
                "error"
            );

            return;
        }


        const button =
            $("#loginSubmit");


        setButtonLoading(
            button,
            "VERIFYING..."
        );


        try {

            const users =
                readStorage(
                    STORAGE.USERS,
                    []
                );


            const user =
                Array.isArray(users)
                    ? users.find(
                        item =>
                            item.email === email
                    )
                    : null;


            if (!user) {

                await delay(350);

                showMessage(
                    "The email or password is incorrect.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            const hash =
                await derivePasswordHash(
                    password,
                    base64ToBytes(user.salt)
                );


            if (
                !secureEqual(
                    hash,
                    user.passwordHash
                )
            ) {

                await delay(350);

                showMessage(
                    "The email or password is incorrect.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            /* -----------------------------------------
               Create session
            ----------------------------------------- */

            const now = Date.now();

            const session = {
                userId: user.id,
                email: user.email,

                name:
                    `${user.firstName} ${user.lastName}`,

                createdAt:
                    new Date(now).toISOString(),

                createdAtTimestamp:
                    now,

                lastActivityAt:
                    now,

                expiresAt:
                    now +
                    SESSION_CONFIG.INACTIVITY_TIMEOUT
            };

            const sessionSaved =
                writeStorage(
                    STORAGE.SESSION,
                    session
                );

            if (!sessionSaved) {
                throw new Error(
                    "Unable to create login session."
                );
            }

            startInactivityMonitor();


            showMessage(
                "Login successful. Opening VYRON...",
                "success"
            );

            window.setTimeout(
                () => {

                    window.location.replace(
                        getSafeRedirect()
                    );

                },
                600
            );


        } catch (error) {

            console.error(
                "VYRON login error:",
                error
            );


            showMessage(
                "We could not complete the login. Please try again.",
                "error"
            );


            restoreButton(button);
        }
    }


    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

    function generateResetToken(email) {

        const tokens =
            readStorage(
                STORAGE.RESET,
                []
            );


        const activeTokens =
            Array.isArray(tokens)
                ? tokens.filter(
                    token =>
                        token.expiresAt > Date.now() &&
                        !token.used
                )
                : [];


        const token =
            bytesToBase64(
                randomBytes(32)
            )
            .replace(/[+/=]/g, "")
            .slice(0, 48);


        activeTokens.push({

            token,

            email,

            createdAt:
                Date.now(),

            expiresAt:
                Date.now() + 900000,

            used: false
        });


        writeStorage(
            STORAGE.RESET,
            activeTokens.slice(-5)
        );


        return token;
    }


    async function handleForgotPassword(form) {

        clearFormState(form);


        const email =
            normalizeEmail(
                new FormData(form)
                    .get("email")
            );


        if (!isValidEmail(email)) {

            showFieldError(
                "email",
                "Enter a valid email address."
            );


            showMessage(
                "Enter a valid email address.",
                "error"
            );

            return;
        }


        const button =
            form.querySelector(
                'button[type="submit"]'
            );


        setButtonLoading(
            button,
            "PREPARING..."
        );


        try {

            const users =
                readStorage(
                    STORAGE.USERS,
                    []
                );


            const exists =
                Array.isArray(users) &&
                users.some(
                    user =>
                        user.email === email
                );


            if (exists) {

                const token =
                    generateResetToken(email);


                window.location.href =
                    `reset-password.html?token=${encodeURIComponent(token)}`;

                return;
            }


            await delay(500);


            showMessage(
                "If an account exists for that email, recovery instructions have been prepared.",
                "success"
            );


            restoreButton(button);


        } catch (error) {

            console.error(
                "VYRON recovery error:",
                error
            );


            showMessage(
                "We could not process the recovery request.",
                "error"
            );


            restoreButton(button);
        }
    }


    /* =====================================================
       RESET PASSWORD
    ===================================================== */

    function getResetToken() {

        return (
            new URLSearchParams(
                window.location.search
            ).get("token") ||
            $("#resetToken")?.value ||
            ""
        );
    }


    async function handleResetPassword(form) {

        clearFormState(form);


        const token =
            getResetToken();


        const data =
            new FormData(form);


        const password =
            String(
                data.get("password") || ""
            );


        const confirmPassword =
            String(
                data.get("confirmPassword") || ""
            );


        if (!token) {

            showMessage(
                "This reset link is missing or invalid.",
                "error"
            );

            return;
        }


        let valid = true;


        if (!isStrongPassword(password)) {

            showFieldError(
                "password",
                "Use 8+ characters with uppercase, lowercase, a number and a special character."
            );

            valid = false;
        }


        if (password !== confirmPassword) {

            showFieldError(
                "confirmPassword",
                "Passwords do not match."
            );

            valid = false;
        }


        if (!valid) {

            showMessage(
                "Please correct the highlighted fields.",
                "error"
            );

            return;
        }


        const button =
            form.querySelector(
                'button[type="submit"]'
            );


        setButtonLoading(
            button,
            "UPDATING..."
        );


        try {

            const tokens =
                readStorage(
                    STORAGE.RESET,
                    []
                );


            const resetRequest =
                Array.isArray(tokens)
                    ? tokens.find(
                        item =>
                            item.token === token &&
                            !item.used &&
                            item.expiresAt > Date.now()
                    )
                    : null;


            if (!resetRequest) {

                showMessage(
                    "This reset link has expired or has already been used.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            const users =
                readStorage(
                    STORAGE.USERS,
                    []
                );


            const userIndex =
                Array.isArray(users)
                    ? users.findIndex(
                        user =>
                            user.email ===
                            resetRequest.email
                    )
                    : -1;


            if (userIndex < 0) {

                showMessage(
                    "This reset request is no longer valid.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            const salt =
                randomBytes();


            const passwordHash =
                await derivePasswordHash(
                    password,
                    salt
                );


            users[userIndex].passwordHash =
                passwordHash;


            users[userIndex].salt =
                bytesToBase64(salt);


            users[userIndex].passwordChangedAt =
                new Date().toISOString();


            writeStorage(
                STORAGE.USERS,
                users
            );


            resetRequest.used = true;


            const activeTokens =
                tokens.filter(
                    item =>
                        !item.used &&
                        item.expiresAt > Date.now()
                );


            writeStorage(
                STORAGE.RESET,
                activeTokens
            );


            localStorage.removeItem(
                STORAGE.SESSION
            );


            showMessage(
                "Password updated successfully. Redirecting to login...",
                "success"
            );


            window.setTimeout(
                () => {
                    window.location.href =
                        "login.html?reset=1";
                },
                900
            );


        } catch (error) {

            console.error(
                "VYRON password reset error:",
                error
            );


            showMessage(
                "We could not update the password. Please try again.",
                "error"
            );


            restoreButton(button);
        }
    }


    /* =====================================================
       UTILITIES
    ===================================================== */

    function delay(milliseconds) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );
    }


    /* =====================================================
       LOGIN PAGE INITIALIZATION
    ===================================================== */
    function initializeLoginPage() {
        console.log(
            "[VYRON AUTH] Checking login page..."
        );

        if (isSessionValid()) {
            console.log(
                "[VYRON AUTH] Existing session detected. Redirecting to dashboard."
            );

            redirectToDashboard();
            return;
        }

        const form = $("#loginForm");

        if (!form) {
            console.log(
                "[VYRON AUTH] #loginForm not present. Skipping login initialization."
            );

            return;
        }

        if (form.dataset.authInitialized === "true") {
            console.log(
                "[VYRON AUTH] Login form already initialized."
            );

            return;
        }

        form.dataset.authInitialized = "true";

        console.log(
            "[VYRON AUTH] Attaching login submit event."
        );

        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();
                event.stopPropagation();

                console.log(
                    "[VYRON AUTH] Login form submitted."
                );

                try {
                    await handleLogin(form);
                } catch (error) {
                    console.error(
                        "[VYRON AUTH] Login submission error:",
                        error
                    );

                    showMessage(
                        "We could not complete the login. Please try again.",
                        "error"
                    );

                    const button =
                        $("#loginSubmit");

                    restoreButton(button);
                }
            }
        );

        const params =
            new URLSearchParams(
                window.location.search
            );

        const email =
            params.get("email");

        const emailInput =
            $("#email");

        if (
            email &&
            emailInput
        ) {
            emailInput.value = email;
        }

        if (params.has("registered")) {
            showMessage(
                "Your account is ready. Sign in to continue.",
                "success"
            );
        }

        if (params.has("reset")) {
            showMessage(
                "Your password has been reset. Sign in with your new password.",
                "success"
            );
        }

        if (
            params.has("logout") ||
            params.has("loggedout")
        ) {
            showMessage(
                "You have been securely logged out. Please sign in again to continue.",
                "success"
            );
        }

        if (params.has("timeout")) {
            showMessage(
                "Your session expired after 5 minutes of inactivity. Please sign in again.",
                "error"
            );
        }

        console.log(
            "[VYRON AUTH] Login initialization complete."
        );
    }

    /* =====================================================
       SIGNUP PAGE INITIALIZATION
    ===================================================== */

    function initializeSignupPage() {
        console.log(
            "[VYRON AUTH] Checking signup page..."
        );

        if (isSessionValid()) {
            console.log(
                "[VYRON AUTH] Existing session detected. Redirecting to dashboard."
            );

            redirectToDashboard();
            return;
        }

        const form = $("#signupForm");

        if (!form) {
            console.log(
                "[VYRON AUTH] #signupForm not present. Skipping signup initialization."
            );

            return;
        }

        if (form.dataset.authInitialized === "true") {
            console.log(
                "[VYRON AUTH] Signup form already initialized."
            );

            return;
        }

        form.dataset.authInitialized = "true";

        console.log(
            "[VYRON AUTH] Attaching signup submit event."
        );

        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();
                event.stopPropagation();

                console.log(
                    "[VYRON AUTH] Signup form submitted."
                );

                try {
                    await handleSignup(form);
                } catch (error) {
                    console.error(
                        "[VYRON AUTH] Signup submission error:",
                        error
                    );

                    showMessage(
                        "We could not create your account. Please try again.",
                        "error"
                    );

                    restoreButton(
                        $("#signupSubmit")
                    );
                }
            }
        );

        console.log(
            "[VYRON AUTH] Signup initialization complete."
        );
    }


    /* =====================================================
       FORGOT PASSWORD INITIALIZATION
    ===================================================== */

    function initializeForgotPasswordPage() {
        const form = $("#forgotForm");

        if (!form) {
            return;
        }

        if (
            form.dataset.authInitialized ===
            "true"
        ) {
            return;
        }

        form.dataset.authInitialized =
            "true";

        console.log(
            "[VYRON AUTH] Attaching forgot-password submit event."
        );

        form.addEventListener(
            "submit",
            event => {
                event.preventDefault();
                event.stopPropagation();

                handleForgotPassword(form);
            }
        );
    }


    /* =====================================================
       RESET PASSWORD INITIALIZATION
    ===================================================== */

    function initializeResetPasswordPage() {
        const form = $("#resetForm");

        if (!form) {
            return;
        }

        if (
            form.dataset.authInitialized ===
            "true"
        ) {
            return;
        }

        form.dataset.authInitialized =
            "true";

        const token =
            getResetToken();

        const hiddenToken =
            $("#resetToken");

        if (hiddenToken) {
            hiddenToken.value = token;
        }

        console.log(
            "[VYRON AUTH] Attaching reset-password submit event."
        );

        form.addEventListener(
            "submit",
            event => {
                event.preventDefault();
                event.stopPropagation();

                handleResetPassword(form);
            }
        );
    }

    /* =========================================================
    BOOT
    ========================================================= */

    let bootCompleted = false;

    function boot() {
        if (bootCompleted) {
            console.log(
                "[VYRON AUTH] Boot already completed. Skipping."
            );

            return;
        }

        bootCompleted = true;

        try {
            console.log(
                "[VYRON AUTH] Boot starting..."
            );

            /*
            * Common initialization.
            */
            updateUserCount();
            initializePasswordToggles();
            initializePasswordStrength();

            /*
            * Session monitoring.
            *
            * This only actually starts if a valid
            * session exists.
            */
            startInactivityMonitor();

            /*
            * Page-specific initialization.
            *
            * Functions safely return if their form
            * does not exist on the current page.
            */
            initializeLoginPage();
            initializeSignupPage();
            initializeForgotPasswordPage();
            initializeResetPasswordPage();

            console.log(
                "[VYRON AUTH] Boot completed successfully."
            );

        } catch (error) {
            console.error(
                "[VYRON AUTH] Fatal boot error:",
                error
            );

            /*
            * Allow a future manual retry if boot
            * fails before initialization completes.
            */
            bootCompleted = false;
        }
    }

    /* =========================================================
    PUBLIC API
    ========================================================= */

    window.VyronAuth = {

        isLoggedIn() {
            return isSessionValid();
        },

        getCurrentSession() {
            if (!isSessionValid()) {
                return null;
            }

            return getSession();
        },

        getUsers() {
            return readStorage(
                STORAGE.USERS,
                []
            );
        },

        hasRegisteredAccounts() {
            return hasRegisteredAccounts();
        },

        getRegisteredUserCount() {
            const users =
                readStorage(
                    STORAGE.USERS,
                    []
                );

            return Array.isArray(users)
                ? users.length
                : 0;
        },

        requireAuth() {
            return requireAuthentication();
        },

        goToAuth() {
            routeUserToAuthentication();
        },

        goToLogin(redirect = "") {
            redirectToLogin(redirect);
        },

        goToSignup(redirect = "") {
            redirectToSignup(redirect);
        },

        goToDashboard() {
            redirectToDashboard();
        },

        logout() {
            stopInactivityMonitor();

            localStorage.removeItem(
                STORAGE.SESSION
            );

            if (isInsideAuthDirectory()) {
                window.location.replace(
                    "login.html?loggedout=1"
                );
            } else {
                window.location.replace(
                    "auth/login.html?loggedout=1"
                );
            }
        }
    };


    /* =========================================================
    START VYRON AUTHENTICATION
    ========================================================= */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );

    } else {

        boot();

    }

})();
