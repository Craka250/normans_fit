/* =========================================================
   VYRON FITNESS — MEMBER AUTHENTICATION
   Stable frontend authentication for VYRON prototype

   DIRECTORY STRUCTURE:

   /index.html
   /member-dashboard.html
   /auth/login.html
   /auth/signup.html
   /auth/forgot-password.html
   /auth/reset-password.html

   IMPORTANT:
   This is frontend/localStorage authentication for the
   current prototype. Production authentication should use
   a backend with secure HTTP-only cookies/tokens.
========================================================= */

(() => {
    "use strict";

    /* =========================================================
       STORAGE
    ========================================================== */

    const STORAGE = {
        USERS: "vyron_users_v1",
        SESSION: "vyron_session_v1",
        RESET: "vyron_reset_tokens_v1"
    };


    /* =========================================================
       SESSION CONFIGURATION

       60 MINUTES OF INACTIVITY
    ========================================================== */

    const SESSION_CONFIG = {
        INACTIVITY_TIMEOUT: 60 * 60 * 1000,
        CHECK_INTERVAL: 10 * 1000,
        ACTIVITY_THROTTLE: 30 * 1000,

        ACTIVITY_EVENTS: [
            "click",
            "keydown",
            "scroll",
            "touchstart",
            "mousemove"
        ]
    };


    /* =========================================================
       CRYPTO CONFIGURATION
    ========================================================== */

    const PBKDF2_ITERATIONS = 120000;

    const encoder = new TextEncoder();


    /* =========================================================
       INTERNAL STATE
    ========================================================== */

    let inactivityTimer = null;

    let monitorStarted = false;

    let lastActivityWrite = 0;

    let bootCompleted = false;


    /* =========================================================
       DOM HELPERS
    ========================================================== */

    const $ = (selector, root = document) => {
        return root.querySelector(selector);
    };


    const $$ = (selector, root = document) => {
        return [...root.querySelectorAll(selector)];
    };


    /* =========================================================
       STORAGE HELPERS
    ========================================================== */

    function readStorage(key, fallback = []) {

        try {

            const raw = localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            const value = JSON.parse(raw);

            return value ?? fallback;

        } catch (error) {

            console.error(
                `[VYRON AUTH] Failed to read storage "${key}":`,
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
                `[VYRON AUTH] Failed to write storage "${key}":`,
                error
            );

            return false;
        }
    }


    function getSession() {

        const session =
            readStorage(
                STORAGE.SESSION,
                null
            );

        if (
            !session ||
            typeof session !== "object"
        ) {
            return null;
        }

        return session;
    }


    /* =========================================================
       NORMALIZATION
    ========================================================== */

    function normalizeEmail(value) {

        return String(value || "")
            .trim()
            .toLowerCase();
    }


    /* =========================================================
       VALIDATION
    ========================================================== */

    function isValidEmail(value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
            .test(
                normalizeEmail(value)
            );
    }


    function isValidName(value) {

        return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/
            .test(
                String(value || "").trim()
            );
    }


    function isValidPhone(value) {

        const phone =
            String(value || "").trim();

        if (!phone) {
            return true;
        }

        return /^[+0-9][0-9 ()-]{7,18}$/
            .test(phone);
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


    /* =========================================================
       CRYPTO HELPERS
    ========================================================== */

    function ensureCrypto() {

        if (
            !globalThis.crypto ||
            !crypto.subtle ||
            !crypto.getRandomValues
        ) {
            throw new Error(
                "Web Crypto API is unavailable."
            );
        }
    }


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
            character =>
                character.charCodeAt(0)
        );
    }


    function randomBytes(size = 16) {

        ensureCrypto();

        const bytes =
            new Uint8Array(size);

        crypto.getRandomValues(bytes);

        return bytes;
    }


    function createId() {

        ensureCrypto();

        if (
            typeof crypto.randomUUID ===
            "function"
        ) {
            return crypto.randomUUID();
        }

        return [
            Date.now().toString(36),
            Math.random().toString(36).slice(2),
            Math.random().toString(36).slice(2)
        ].join("-");
    }


    async function derivePasswordHash(
        password,
        salt
    ) {

        ensureCrypto();

        const key =
            await crypto.subtle.importKey(
                "raw",
                encoder.encode(password),
                "PBKDF2",
                false,
                ["deriveBits"]
            );

        const bits =
            await crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    salt,
                    iterations:
                        PBKDF2_ITERATIONS,
                    hash: "SHA-256"
                },
                key,
                256
            );

        return bytesToBase64(
            new Uint8Array(bits)
        );
    }


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

        for (
            let index = 0;
            index < a.length;
            index++
        ) {

            result |=
                a.charCodeAt(index) ^
                b.charCodeAt(index);
        }

        return result === 0;
    }


    /* =========================================================
       AUTH MESSAGE
    ========================================================== */

    function showMessage(
        message,
        type = "info"
    ) {

        const element =
            $("#authMessage");

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.className =
            `auth-message show ${type}`;
    }


    function clearMessage() {

        const element =
            $("#authMessage");

        if (!element) {
            return;
        }

        element.textContent = "";

        element.className =
            "auth-message";
    }


    /* =========================================================
       FORM STATE
    ========================================================== */

    function clearFormState(form) {

        if (!form) {
            return;
        }

        $$(".field-error", form)
            .forEach(element => {
                element.textContent = "";
            });

        $$(
            "input, textarea, select",
            form
        ).forEach(input => {

            input.classList.remove(
                "invalid"
            );

            input.removeAttribute(
                "aria-invalid"
            );
        });

        clearMessage();
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
            document.getElementById(
                fieldName
            );

        if (errorElement) {

            errorElement.textContent =
                message;
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


    /* =========================================================
       BUTTON STATE
    ========================================================== */

    function setButtonLoading(
        button,
        text
    ) {

        if (!button) {
            return;
        }

        if (
            !button.dataset
                .originalContent
        ) {

            button.dataset
                .originalContent =
                button.innerHTML;
        }

        button.disabled = true;

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

        if (
            button.dataset
                .originalContent
        ) {

            button.innerHTML =
                button.dataset
                    .originalContent;

            delete button.dataset
                .originalContent;
        }
    }


    /* =========================================================
       USER COUNT
    ========================================================== */

    function updateUserCount() {

        const users =
            readStorage(
                STORAGE.USERS,
                []
            );

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
       PASSWORD VISIBILITY
    ========================================================== */

    function initializePasswordToggles() {

        $$(
            "[data-toggle-password]"
        ).forEach(button => {

            if (
                button.dataset
                    .authPasswordInitialized ===
                "true"
            ) {
                return;
            }

            button.dataset
                .authPasswordInitialized =
                "true";

            button.addEventListener(
                "click",
                () => {

                    const input =
                        document.getElementById(
                            button.dataset
                                .togglePassword
                        );

                    if (!input) {
                        return;
                    }

                    const showing =
                        input.type === "text";

                    input.type =
                        showing
                            ? "password"
                            : "text";

                    button.setAttribute(
                        "aria-label",
                        showing
                            ? "Show password"
                            : "Hide password"
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(!showing)
                    );

                    button.innerHTML =
                        showing
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


    /* =========================================================
       PASSWORD STRENGTH
    ========================================================== */

    function initializePasswordStrength() {

        const input =
            $("#password");

        const meter =
            $(".password-strength span");

        if (
            !input ||
            !meter
        ) {
            return;
        }

        if (
            input.dataset
                .authStrengthInitialized ===
            "true"
        ) {
            return;
        }

        input.dataset
            .authStrengthInitialized =
            "true";

        input.addEventListener(
            "input",
            () => {

                const password =
                    input.value;

                let score = 0;

                if (
                    password.length >= 8
                ) {
                    score++;
                }

                if (
                    password.length >= 12
                ) {
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
                    /[^A-Za-z0-9]/.test(
                        password
                    )
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
       ROUTING

       IMPORTANT:
       Login and signup pages are NOT automatically
       redirected during boot.

       This prevents an authentication redirect loop.

       Redirects happen only when:
       - login succeeds
       - signup succeeds
       - protected dashboard requires authentication
       - logout happens
    ========================================================== */

    function isInsideAuthDirectory() {

        return window.location.pathname
            .replace(/\\/g, "/")
            .includes("/auth/");
    }


    function dashboardUrl() {

        return isInsideAuthDirectory()
            ? "../member-dashboard.html"
            : "member-dashboard.html";
    }


    function loginUrl() {

        return isInsideAuthDirectory()
            ? "login.html"
            : "auth/login.html";
    }


    function signupUrl() {

        return isInsideAuthDirectory()
            ? "signup.html"
            : "auth/signup.html";
    }


    function redirectToLogin(
        redirect = ""
    ) {

        const url =
            loginUrl();

        let destination = url;

        if (redirect) {

            destination +=
                `?redirect=${encodeURIComponent(
                    redirect
                )}`;
        }

        window.location.replace(
            destination
        );
    }


    function redirectToSignup(
        redirect = ""
    ) {

        const url =
            signupUrl();

        let destination = url;

        if (redirect) {

            destination +=
                `?redirect=${encodeURIComponent(
                    redirect
                )}`;
        }

        window.location.replace(
            destination
        );
    }


    function redirectToDashboard() {

        window.location.replace(
            dashboardUrl()
        );
    }


    function getSafeRedirect() {

        const requested =
            new URLSearchParams(
                window.location.search
            ).get("redirect");

        const fallback =
            dashboardUrl();

        if (!requested) {
            return fallback;
        }

        if (
            /^https?:/i.test(requested) ||
            /^\/\//.test(requested) ||
            /^javascript:/i.test(requested)
        ) {

            console.warn(
                "[VYRON AUTH] Unsafe redirect blocked."
            );

            return fallback;
        }

        const cleaned =
            requested
                .replace(/^\/+/, "");

        if (
            cleaned ===
                "member-dashboard.html" ||
            cleaned ===
                "../member-dashboard.html"
        ) {
            return fallback;
        }

        return fallback;
    }


    /* =========================================================
       SESSION VALIDATION
    ========================================================== */

    function isSessionValid() {

        const session =
            getSession();

        if (
            !session ||
            typeof session !== "object"
        ) {
            return false;
        }

        const lastActivity =
            Number(
                session.lastActivityAt ||
                session.createdAtTimestamp ||
                0
            );

        if (
            !lastActivity ||
            !session.userId ||
            !session.email
        ) {

            localStorage.removeItem(
                STORAGE.SESSION
            );

            return false;
        }

        const inactiveFor =
            Date.now() -
            lastActivity;

        if (
            inactiveFor >=
            SESSION_CONFIG.INACTIVITY_TIMEOUT
        ) {

            localStorage.removeItem(
                STORAGE.SESSION
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       SESSION ACTIVITY
    ========================================================== */

    function updateSessionActivity(
        force = false
    ) {

        const session =
            getSession();

        if (!session) {
            return;
        }

        const now =
            Date.now();

        if (
            !force &&
            now - lastActivityWrite <
                SESSION_CONFIG.ACTIVITY_THROTTLE
        ) {
            return;
        }

        session.lastActivityAt =
            now;

        session.expiresAt =
            now +
            SESSION_CONFIG.INACTIVITY_TIMEOUT;

        if (
            writeStorage(
                STORAGE.SESSION,
                session
            )
        ) {

            lastActivityWrite =
                now;
        }
    }


    function stopInactivityMonitor() {

        SESSION_CONFIG
            .ACTIVITY_EVENTS
            .forEach(eventName => {

                document.removeEventListener(
                    eventName,
                    updateSessionActivity
                );
            });

        if (
            inactivityTimer !== null
        ) {

            clearInterval(
                inactivityTimer
            );

            inactivityTimer =
                null;
        }

        monitorStarted =
            false;
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
                "member-dashboard.html"
            )
        ) {

            window.location.replace(
                "auth/login.html?timeout=1"
            );
        }
    }


    function checkSessionInactivity() {

        const session =
            getSession();

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

        if (
            Date.now() -
                lastActivity >=
            SESSION_CONFIG.INACTIVITY_TIMEOUT
        ) {

            expireSession();
        }
    }


    function startInactivityMonitor() {

        if (
            monitorStarted ||
            !isSessionValid()
        ) {
            return;
        }

        monitorStarted =
            true;

        SESSION_CONFIG
            .ACTIVITY_EVENTS
            .forEach(eventName => {

                document.addEventListener(
                    eventName,
                    updateSessionActivity,
                    {
                        passive: true
                    }
                );
            });

        inactivityTimer =
            window.setInterval(
                checkSessionInactivity,
                SESSION_CONFIG.CHECK_INTERVAL
            );

        updateSessionActivity(true);
    }


    /* =========================================================
       PROTECTED DASHBOARD AUTHENTICATION
    ========================================================== */

    function requireAuthentication() {

        if (!isSessionValid()) {

            stopInactivityMonitor();

            redirectToLogin(
                "member-dashboard.html"
            );

            return false;
        }

        updateSessionActivity(true);

        startInactivityMonitor();

        return true;
    }


    /* =========================================================
       SIGNUP
    ========================================================== */

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
                data.get("confirmPassword") ||
                ""
            );

        const termsAccepted =
            data.get("terms") === "on";

        let valid = true;


        /* FIRST NAME */

        if (
            !isValidName(firstName)
        ) {

            showFieldError(
                "firstName",
                "Enter a valid first name."
            );

            valid = false;
        }


        /* LAST NAME */

        if (
            !isValidName(lastName)
        ) {

            showFieldError(
                "lastName",
                "Enter a valid last name."
            );

            valid = false;
        }


        /* EMAIL */

        if (
            !isValidEmail(email)
        ) {

            showFieldError(
                "email",
                "Enter a valid email address."
            );

            valid = false;
        }


        /* PHONE */

        if (
            !isValidPhone(phone)
        ) {

            showFieldError(
                "phone",
                "Enter a valid phone number."
            );

            valid = false;
        }


        /* PASSWORD */

        if (
            !isStrongPassword(password)
        ) {

            showFieldError(
                "password",
                "Use 8+ characters with uppercase, lowercase, a number and a special character."
            );

            valid = false;
        }


        /* CONFIRM PASSWORD */

        if (
            password !==
            confirmPassword
        ) {

            showFieldError(
                "confirmPassword",
                "Passwords do not match."
            );

            valid = false;
        }


        /* TERMS */

        if (!termsAccepted) {

            showFieldError(
                "terms",
                "You must accept the required terms."
            );

            valid = false;
        }


        /* STOP INVALID FORM */

        if (!valid) {

            showMessage(
                "Please correct the highlighted fields before continuing.",
                "error"
            );

            return;
        }


        /* READ USERS */

        const users =
            readStorage(
                STORAGE.USERS,
                []
            );

        if (
            !Array.isArray(users)
        ) {

            showMessage(
                "Account storage is unavailable. Please try again.",
                "error"
            );

            return;
        }


        /* DUPLICATE EMAIL */

        const exists =
            users.some(
                user =>
                    normalizeEmail(
                        user.email
                    ) === email
            );

        if (exists) {

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


        const button =
            $("#signupSubmit");

        setButtonLoading(
            button,
            "CREATING ACCOUNT..."
        );


        try {

            const salt =
                randomBytes();

            const passwordHash =
                await derivePasswordHash(
                    password,
                    salt
                );


            const user = {

                id: createId(),

                firstName,

                lastName,

                email,

                phone,

                passwordHash,

                salt:
                    bytesToBase64(
                        salt
                    ),

                createdAt:
                    new Date()
                        .toISOString(),

                status:
                    "active"
            };


            users.push(user);


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


            updateUserCount();


            showMessage(
                "Account created successfully. Redirecting to login...",
                "success"
            );


            const requested =
                new URLSearchParams(
                    window.location.search
                ).get("redirect");


            let destination =
                `login.html?registered=1&email=${encodeURIComponent(
                    email
                )}`;


            if (requested) {

                destination +=
                    `&redirect=${encodeURIComponent(
                        requested
                    )}`;
            }


            window.setTimeout(
                () => {

                    window.location.replace(
                        destination
                    );

                },
                700
            );

        } catch (error) {

            console.error(
                "[VYRON AUTH] Signup error:",
                error
            );


            if (
                error.message &&
                error.message.includes(
                    "Web Crypto"
                )
            ) {

                showMessage(
                    "Secure account creation requires HTTPS or localhost.",
                    "error"
                );

            } else {

                showMessage(
                    "We could not create the account. Please try again.",
                    "error"
                );
            }


            restoreButton(button);
        }
    }


    /* =========================================================
       LOGIN
    ========================================================== */

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


        /* EMAIL */

        if (
            !isValidEmail(email)
        ) {

            showFieldError(
                "email",
                "Enter a valid email address."
            );

            valid = false;
        }


        /* PASSWORD */

        if (!password) {

            showFieldError(
                "password",
                "Enter your password."
            );

            valid = false;
        }


        if (!valid) {

            showMessage(
                "Please correct the highlighted fields before signing in.",
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


            if (
                !Array.isArray(users)
            ) {

                throw new Error(
                    "Account storage is unavailable."
                );
            }


            const user =
                users.find(
                    item =>
                        normalizeEmail(
                            item.email
                        ) === email
                );


            /* ACCOUNT NOT FOUND */

            if (
                !user
            ) {

                showFieldError(
                    "email",
                    "No VYRON account was found with this email."
                );

                showMessage(
                    "The email or password is incorrect.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            /* CORRUPTED USER RECORD */

            if (
                !user.salt ||
                !user.passwordHash
            ) {

                showMessage(
                    "This account record is incomplete. Please create a new account.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            /* PASSWORD CHECK */

            let passwordHash;

            try {

                passwordHash =
                    await derivePasswordHash(
                        password,
                        base64ToBytes(
                            user.salt
                        )
                    );

            } catch (error) {

                throw error;
            }


            if (
                !secureEqual(
                    passwordHash,
                    user.passwordHash
                )
            ) {

                showFieldError(
                    "password",
                    "The password does not match this account."
                );

                showMessage(
                    "The email or password is incorrect.",
                    "error"
                );

                restoreButton(button);

                return;
            }


            /* SUCCESSFUL LOGIN */

            const now =
                Date.now();


            const session = {

                userId:
                    user.id,

                email:
                    user.email,

                name:
                    `${user.firstName} ${user.lastName}`.trim(),

                createdAt:
                    new Date(
                        now
                    ).toISOString(),

                createdAtTimestamp:
                    now,

                lastActivityAt:
                    now,

                expiresAt:
                    now +
                    SESSION_CONFIG.INACTIVITY_TIMEOUT,

                rememberMe:
                    data.get("remember") === "on"
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


            /* Immediately verify session */

            if (!isSessionValid()) {

                throw new Error(
                    "Login session could not be verified."
                );
            }


            updateSessionActivity(true);


            showMessage(
                "Login successful. Opening your VYRON dashboard...",
                "success"
            );


            /*
                IMPORTANT:

                There is only ONE redirect here.

                Login
                   ↓
                member-dashboard.html

                No intermediate authentication route.
            */

            window.setTimeout(
                () => {

                    window.location.replace(
                        getSafeRedirect()
                    );

                },
                500
            );

        } catch (error) {

            console.error(
                "[VYRON AUTH] Login error:",
                error
            );


            if (
                error.message &&
                error.message.includes(
                    "Web Crypto"
                )
            ) {

                showMessage(
                    "Secure login requires HTTPS or localhost.",
                    "error"
                );

            } else {

                showMessage(
                    "We could not complete the login. Please try again.",
                    "error"
                );
            }


            restoreButton(button);
        }
    }


    /* =========================================================
       FORGOT PASSWORD
    ========================================================== */

    function getResetToken() {

        return (
            new URLSearchParams(
                window.location.search
            ).get("token") ||
            $("#resetToken")?.value ||
            ""
        );
    }


    function generateResetToken(
        email
    ) {

        const tokens =
            readStorage(
                STORAGE.RESET,
                []
            );


        const activeTokens =
            Array.isArray(tokens)
                ? tokens.filter(
                    token =>
                        token.expiresAt >
                            Date.now() &&
                        !token.used
                )
                : [];


        const token =
            bytesToBase64(
                randomBytes(32)
            )
                .replace(
                    /[+/=]/g,
                    ""
                )
                .slice(
                    0,
                    48
                );


        activeTokens.push({

            token,

            email,

            createdAt:
                Date.now(),

            expiresAt:
                Date.now() +
                15 * 60 * 1000,

            used:
                false
        });


        writeStorage(
            STORAGE.RESET,
            activeTokens.slice(-5)
        );


        return token;
    }


    async function handleForgotPassword(
        form
    ) {

        clearFormState(form);


        const email =
            normalizeEmail(
                new FormData(form)
                    .get("email")
            );


        if (
            !isValidEmail(email)
        ) {

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
                        normalizeEmail(
                            user.email
                        ) === email
                );


            if (exists) {

                const token =
                    generateResetToken(
                        email
                    );


                window.location.replace(
                    `reset-password.html?token=${encodeURIComponent(
                        token
                    )}`
                );

                return;
            }


            showMessage(
                "If an account exists for that email, recovery instructions have been prepared.",
                "success"
            );


            restoreButton(button);

        } catch (error) {

            console.error(
                "[VYRON AUTH] Recovery error:",
                error
            );


            showMessage(
                "We could not process the recovery request.",
                "error"
            );


            restoreButton(button);
        }
    }


    /* =========================================================
       RESET PASSWORD
    ========================================================== */

    async function handleResetPassword(
        form
    ) {

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
                data.get("confirmPassword") ||
                ""
            );


        if (!token) {

            showMessage(
                "This reset link is missing or invalid.",
                "error"
            );

            return;
        }


        let valid = true;


        if (
            !isStrongPassword(
                password
            )
        ) {

            showFieldError(
                "password",
                "Use 8+ characters with uppercase, lowercase, a number and a special character."
            );

            valid = false;
        }


        if (
            password !==
            confirmPassword
        ) {

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


            const request =
                Array.isArray(tokens)
                    ? tokens.find(
                        item =>
                            item.token === token &&
                            !item.used &&
                            item.expiresAt >
                                Date.now()
                    )
                    : null;


            if (!request) {

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
                            normalizeEmail(
                                user.email
                            ) ===
                            normalizeEmail(
                                request.email
                            )
                    )
                    : -1;


            if (
                userIndex < 0
            ) {

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


            users[userIndex]
                .passwordHash =
                passwordHash;


            users[userIndex]
                .salt =
                bytesToBase64(
                    salt
                );


            users[userIndex]
                .passwordChangedAt =
                new Date()
                    .toISOString();


            if (
                !writeStorage(
                    STORAGE.USERS,
                    users
                )
            ) {

                throw new Error(
                    "Unable to save password."
                );
            }


            request.used =
                true;


            writeStorage(
                STORAGE.RESET,
                tokens.filter(
                    item =>
                        !item.used &&
                        item.expiresAt >
                            Date.now()
                )
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

                    window.location.replace(
                        "login.html?reset=1"
                    );

                },
                700
            );

        } catch (error) {

            console.error(
                "[VYRON AUTH] Reset error:",
                error
            );


            showMessage(
                "We could not update the password. Please try again.",
                "error"
            );


            restoreButton(button);
        }
    }


    /* =========================================================
       LOGIN PAGE INITIALIZATION

       IMPORTANT:
       NO automatic redirect here.

       This is deliberate to prevent the page-refresh loop.
    ========================================================== */

    function initializeLoginPage() {

        const form =
            $("#loginForm");


        if (!form) {
            return;
        }


        if (
            form.dataset
                .authInitialized ===
            "true"
        ) {

            return;
        }


        form.dataset
            .authInitialized =
            "true";


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                event.stopPropagation();


                handleLogin(form)
                    .catch(error => {

                        console.error(
                            "[VYRON AUTH] Login submission error:",
                            error
                        );


                        showMessage(
                            "We could not complete the login. Please try again.",
                            "error"
                        );


                        restoreButton(
                            $("#loginSubmit")
                        );
                    });
            }
        );


        /* URL FEEDBACK */

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

            emailInput.value =
                email;
        }


        if (
            params.has(
                "registered"
            )
        ) {

            showMessage(
                "Your account is ready. Sign in to continue.",
                "success"
            );
        }


        if (
            params.has("reset")
        ) {

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
                "You have been securely logged out. Please sign in again.",
                "success"
            );
        }


        if (
            params.has("timeout")
        ) {

            showMessage(
                "Your session expired after 60 minutes of inactivity. Please sign in again.",
                "error"
            );
        }
    }


    /* =========================================================
       SIGNUP PAGE INITIALIZATION

       IMPORTANT:
       NO automatic redirect here either.
    ========================================================== */

    function initializeSignupPage() {

        const form =
            $("#signupForm");


        if (!form) {
            return;
        }


        if (
            form.dataset
                .authInitialized ===
            "true"
        ) {

            return;
        }


        form.dataset
            .authInitialized =
            "true";


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                event.stopPropagation();


                handleSignup(form)
                    .catch(error => {

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
                    });
            }
        );
    }


    /* =========================================================
       FORGOT PASSWORD INITIALIZATION
    ========================================================== */

    function initializeForgotPasswordPage() {

        const form =
            $("#forgotForm");


        if (!form) {
            return;
        }


        if (
            form.dataset
                .authInitialized ===
            "true"
        ) {

            return;
        }


        form.dataset
            .authInitialized =
            "true";


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                event.stopPropagation();


                handleForgotPassword(
                    form
                ).catch(error => {

                    console.error(
                        "[VYRON AUTH] Forgot-password error:",
                        error
                    );


                    showMessage(
                        "We could not process the recovery request.",
                        "error"
                    );
                });
            }
        );
    }


    /* =========================================================
       RESET PASSWORD INITIALIZATION
    ========================================================== */

    function initializeResetPasswordPage() {

        const form =
            $("#resetForm");


        if (!form) {
            return;
        }


        if (
            form.dataset
                .authInitialized ===
            "true"
        ) {

            return;
        }


        form.dataset
            .authInitialized =
            "true";


        const token =
            getResetToken();


        const hiddenToken =
            $("#resetToken");


        if (hiddenToken) {

            hiddenToken.value =
                token;
        }


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                event.stopPropagation();


                handleResetPassword(
                    form
                ).catch(error => {

                    console.error(
                        "[VYRON AUTH] Reset-password error:",
                        error
                    );


                    showMessage(
                        "We could not update the password. Please try again.",
                        "error"
                    );
                });
            }
        );
    }


    /* =========================================================
       BOOT

       AUTH.JS NEVER REDIRECTS DURING BOOT.

       This is the critical loop-prevention change.
    ========================================================== */

    function boot() {

        if (bootCompleted) {
            return;
        }


        bootCompleted =
            true;


        try {

            updateUserCount();

            initializePasswordToggles();

            initializePasswordStrength();


            /*
                Only start the inactivity monitor
                when a valid session already exists.

                This does NOT redirect.
            */

            if (
                isSessionValid()
            ) {

                startInactivityMonitor();
            }


            initializeLoginPage();

            initializeSignupPage();

            initializeForgotPasswordPage();

            initializeResetPasswordPage();


            console.log(
                "[VYRON AUTH] Authentication initialized successfully."
            );

        } catch (error) {

            console.error(
                "[VYRON AUTH] Fatal initialization error:",
                error
            );


            bootCompleted =
                false;


            const form =
                $(
                    "#loginForm, #signupForm, #forgotForm, #resetForm"
                );


            if (form) {

                showMessage(
                    "Authentication could not initialize. Please check the browser console.",
                    "error"
                );
            }
        }
    }


    /* =========================================================
       PUBLIC API
    ========================================================== */

    window.VyronAuth = {

        isLoggedIn() {

            return isSessionValid();
        },


        getCurrentSession() {

            return isSessionValid()
                ? getSession()
                : null;
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


        goToLogin(
            redirect = ""
        ) {

            redirectToLogin(
                redirect
            );
        },


        goToSignup(
            redirect = ""
        ) {

            redirectToSignup(
                redirect
            );
        },


        goToDashboard() {

            redirectToDashboard();
        },


        logout() {

            stopInactivityMonitor();

            localStorage.removeItem(
                STORAGE.SESSION
            );


            /*
                Direct logout destination.

                Since this function can be called from the
                root dashboard, always use the auth path
                explicitly.
            */

            window.location.replace(
                "auth/login.html?logout=1"
            );
        }
    };


    /* =========================================================
       START AUTHENTICATION
    ========================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

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
