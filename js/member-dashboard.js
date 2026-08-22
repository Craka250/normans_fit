/* =========================================================
   VYRON FITNESS
   MEMBER DASHBOARD JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       AUTHENTICATION GUARD
       ===================================================== */

    if (
        !window.VyronAuth ||
        !window.VyronAuth.requireAuth()
    ) {
        return;
    }

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const pageLoader =
        document.getElementById("pageLoader");

    const themeToggle =
        document.getElementById("memberThemeToggle");

    const sidebar =
        document.getElementById("memberSidebar");

    const menuToggle =
        document.getElementById("dashboardMenuToggle");

    const sidebarOverlay =
        document.getElementById(
            "dashboardSidebarOverlay"
        );

    const logoutButton =
        document.getElementById("logoutButton");

    const logoutModal =
        document.getElementById("logoutModal");

    const modalClose =
        document.getElementById("modalClose");

    const cancelLogout =
        document.getElementById("cancelLogout");

    const confirmLogout =
        document.getElementById("confirmLogout");

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const profileButton =
        document.getElementById(
            "profileButton"
        );

    /* =====================================================
       CURRENT MEMBER
       ===================================================== */

    function getCurrentSession() {
        if (
            !window.VyronAuth ||
            typeof window.VyronAuth.getCurrentSession !==
                "function"
        ) {
            return null;
        }

        return window.VyronAuth.getCurrentSession();
    }

    function getCurrentUser() {
        const session = getCurrentSession();

        if (!session) {
            return null;
        }

        const users = Array.isArray(
            window.VyronAuth.getUsers?.()
        )
            ? window.VyronAuth.getUsers()
            : [];

        return (
            users.find(
                user =>
                    user.id === session.userId
            ) ||
            users.find(
                user =>
                    user.email === session.email
            ) ||
            null
        );
    }

    /* =====================================================
       PAGE LOADER
       ===================================================== */

    window.addEventListener("load", () => {
        window.setTimeout(() => {
            if (pageLoader) {
                pageLoader.classList.add("hidden");
            }
        }, 450);
    });

    /* =====================================================
       THEME
       ===================================================== */

    const savedTheme =
        localStorage.getItem("vyron-theme");

    if (savedTheme === "light") {
        document.documentElement.setAttribute(
            "data-theme",
            "light"
        );
    }

    function updateThemeIcon() {
        if (!themeToggle) {
            return;
        }

        const icon =
            themeToggle.querySelector("i");

        if (!icon) {
            return;
        }

        const isLight =
            document.documentElement.getAttribute(
                "data-theme"
            ) === "light";

        icon.className = isLight
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }

    updateThemeIcon();

    if (themeToggle) {
        themeToggle.addEventListener(
            "click",
            () => {
                const isLight =
                    document.documentElement.getAttribute(
                        "data-theme"
                    ) === "light";

                if (isLight) {
                    document.documentElement.removeAttribute(
                        "data-theme"
                    );

                    localStorage.setItem(
                        "vyron-theme",
                        "dark"
                    );
                } else {
                    document.documentElement.setAttribute(
                        "data-theme",
                        "light"
                    );

                    localStorage.setItem(
                        "vyron-theme",
                        "light"
                    );
                }

                updateThemeIcon();
            }
        );
    }

    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    function openSidebar() {
        if (sidebar) {
            sidebar.classList.add("active");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("active");
        }

        if (menuToggle) {
            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        document.body.classList.add(
            "sidebar-open"
        );
    }

    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("active");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        document.body.classList.remove(
            "sidebar-open"
        );
    }

    if (menuToggle) {
        menuToggle.addEventListener(
            "click",
            () => {
                const isOpen =
                    sidebar?.classList.contains(
                        "active"
                    );

                if (isOpen) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            }
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }

    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    document
        .querySelectorAll(
            ".dashboard-nav-link"
        )
        .forEach(link => {
            link.addEventListener(
                "click",
                () => {
                    document
                        .querySelectorAll(
                            ".dashboard-nav-link"
                        )
                        .forEach(item => {
                            item.classList.remove(
                                "active"
                            );
                        });

                    link.classList.add(
                        "active"
                    );

                    if (
                        window.innerWidth <= 1000
                    ) {
                        closeSidebar();
                    }
                }
            );
        });

    /* =====================================================
       MODAL HELPERS
       ===================================================== */

    function lockBodyScroll() {
        document.body.classList.add(
            "modal-open"
        );
    }

    function unlockBodyScroll() {
        const activeModal =
            document.querySelector(
                ".dashboard-modal.active, " +
                ".profile-edit-modal.active, " +
                "[role='dialog'].active"
            );

        if (!activeModal) {
            document.body.classList.remove(
                "modal-open"
            );
        }
    }

    /* =====================================================
       LOGOUT MODAL
       ===================================================== */

    function openLogoutModal() {
        if (!logoutModal) {
            return;
        }

        logoutModal.classList.add("active");

        logoutModal.setAttribute(
            "aria-hidden",
            "false"
        );

        lockBodyScroll();
    }

    function closeLogoutModal() {
        if (!logoutModal) {
            return;
        }

        logoutModal.classList.remove(
            "active"
        );

        logoutModal.setAttribute(
            "aria-hidden",
            "true"
        );

        unlockBodyScroll();
    }

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                openLogoutModal();
            }
        );
    }

    if (modalClose) {
        modalClose.addEventListener(
            "click",
            closeLogoutModal
        );
    }

    if (cancelLogout) {
        cancelLogout.addEventListener(
            "click",
            closeLogoutModal
        );
    }

    /*
       Actual logout confirmation button.
       If your HTML uses a different ID, change
       "confirmLogout" above to match it.
    */

    if (confirmLogout) {
        confirmLogout.addEventListener(
            "click",
            event => {
                event.preventDefault();

                if (
                    window.VyronAuth &&
                    typeof window.VyronAuth.logout ===
                        "function"
                ) {
                    window.VyronAuth.logout();
                }
            }
        );
    }

    if (logoutModal) {
        logoutModal.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    logoutModal
                ) {
                    closeLogoutModal();
                }
            }
        );
    }

    /* =====================================================
       NOTIFICATION BUTTON
       ===================================================== */

    if (notificationButton) {
        notificationButton.addEventListener(
            "click",
            event => {
                event.preventDefault();

                const notificationSection =
                    document.getElementById(
                        "notifications"
                    );

                if (notificationSection) {
                    notificationSection.scrollIntoView(
                        {
                            behavior: "smooth",
                            block: "start"
                        }
                    );
                }
            }
        );
    }

    /* =====================================================
       PROFILE BUTTON
       ===================================================== */

    if (profileButton) {
        profileButton.addEventListener(
            "click",
            event => {
                event.preventDefault();

                const profile =
                    document.getElementById(
                        "profile"
                    );

                if (profile) {
                    profile.scrollIntoView(
                        {
                            behavior: "smooth",
                            block: "start"
                        }
                    );
                }
            }
        );
    }

    /* =====================================================
       SMOOTH INTERNAL LINKS
       ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {
            link.addEventListener(
                "click",
                event => {
                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    let target = null;

                    try {
                        target =
                            document.querySelector(
                                targetId
                            );
                    } catch (error) {
                        console.warn(
                            "[VYRON DASHBOARD] Invalid internal link:",
                            targetId
                        );

                        return;
                    }

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView(
                        {
                            behavior: "smooth",
                            block: "start"
                        }
                    );
                }
            );
        });

    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key !== "Escape"
            ) {
                return;
            }

            closeLogoutModal();
            closeProfileEditor();
            closeSidebar();
        }
    );

    /* =====================================================
       SIMPLE CARD REVEAL
       ===================================================== */

    const cards =
        document.querySelectorAll(
            ".dashboard-card, " +
            ".member-kpi-card, " +
            ".quick-action-card"
        );

    if (
        "IntersectionObserver" in
        window
    ) {
        const observer =
            new IntersectionObserver(
                entries => {
                    entries.forEach(
                        entry => {
                            if (
                                entry.isIntersecting
                            ) {
                                entry.target.style.opacity =
                                    "1";

                                entry.target.style.transform =
                                    "translateY(0)";

                                observer.unobserve(
                                    entry.target
                                );
                            }
                        }
                    );
                },
                {
                    threshold: 0.08
                }
            );

        cards.forEach(card => {
            card.style.opacity = "0";

            card.style.transform =
                "translateY(18px)";

            card.style.transition =
                "opacity 0.6s ease, transform 0.6s ease";

            observer.observe(card);
        });
    }

    /* =====================================================
       PROFILE EDITOR
       ===================================================== */

    const editButton =
        document.querySelector(
            ".profile-edit-button"
        );

    const profileEditModal =
        document.getElementById(
            "profileEditModal"
        );

    const profileEditClose =
        document.getElementById(
            "profileEditClose"
        );

    const profileEditCancel =
        document.getElementById(
            "profileEditCancel"
        );

    const profileEditForm =
        document.getElementById(
            "profileEditForm"
        );

    const editFullName =
        document.getElementById(
            "editFullName"
        );

    const editEmail =
        document.getElementById(
            "editEmail"
        );

    const editPhone =
        document.getElementById(
            "editPhone"
        );

    /* =====================================================
       PROFILE FIELD HELPERS
       ===================================================== */

    function setProfileName(name) {
        document
            .querySelectorAll(
                ".dashboard-profile-name, " +
                ".profile-details h4, " +
                ".sidebar-member strong"
            )
            .forEach(element => {
                element.textContent =
                    name;
            });
    }

    function setProfileInformation(
        email,
        phone
    ) {
        const values =
            document.querySelectorAll(
                ".profile-info-grid strong"
            );

        if (values[0]) {
            values[0].textContent =
                email;
        }

        if (values[1] && phone) {
            values[1].textContent =
                phone;
        }
    }

    function populateProfileForm() {
        const session =
            getCurrentSession();

        const user =
            getCurrentUser();

        if (!session) {
            return;
        }

        const name =
            user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : session.name || "";

        const email =
            user?.email ||
            session.email ||
            "";

        const phone =
            user?.phone ||
            "";

        if (editFullName) {
            editFullName.value =
                name;
        }

        if (editEmail) {
            editEmail.value =
                email;
        }

        if (editPhone) {
            editPhone.value =
                phone;
        }
    }

    /* =====================================================
       PROFILE MODAL OPEN
       ===================================================== */

    function openProfileEditor() {
        if (
            !profileEditModal ||
            !profileEditForm
        ) {
            return;
        }

        populateProfileForm();

        clearProfileErrors();

        profileEditModal.classList.add(
            "active"
        );

        profileEditModal.setAttribute(
            "aria-hidden",
            "false"
        );

        lockBodyScroll();

        window.setTimeout(() => {
            editFullName?.focus();
        }, 50);
    }

    /* =====================================================
       PROFILE MODAL CLOSE
       ===================================================== */

    function closeProfileEditor() {
        if (!profileEditModal) {
            return;
        }

        profileEditModal.classList.remove(
            "active"
        );

        profileEditModal.setAttribute(
            "aria-hidden",
            "true"
        );

        unlockBodyScroll();
    }

    /* =====================================================
       PROFILE VALIDATION
       ===================================================== */

    function isValidName(value) {
        return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,100}$/.test(
            String(value || "").trim()
        );
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
            String(value || "")
                .trim()
                .toLowerCase()
        );
    }

    function isValidPhone(value) {
        const phone =
            String(value || "").trim();

        if (!phone) {
            return true;
        }

        return /^[+0-9][0-9 ()-]{7,18}$/.test(
            phone
        );
    }

    function showProfileError(
        field,
        message
    ) {
        const input =
            document.getElementById(
                field
            );

        const errorElement =
            document.querySelector(
                `[data-error-for="${field}"]`
            );

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

        if (errorElement) {
            errorElement.textContent =
                message;
        }
    }

    function clearProfileErrors() {
        [
            "editFullName",
            "editEmail",
            "editPhone"
        ].forEach(field => {
            showProfileError(
                field,
                ""
            );
        });
    }

    /* =====================================================
       SAVE PROFILE TO AUTH STORAGE
       ===================================================== */

    function saveMemberProfile(
        fullName,
        email,
        phone
    ) {
        const session =
            getCurrentSession();

        if (!session) {
            throw new Error(
                "No active member session."
            );
        }

        const users =
            Array.isArray(
                window.VyronAuth.getUsers?.()
            )
                ? window.VyronAuth.getUsers()
                : [];

        if (!users.length) {
            throw new Error(
                "No registered users found."
            );
        }

        /*
           Locate the currently authenticated
           user using the safest available
           identifier.
        */

        const userIndex =
            users.findIndex(
                user =>
                    user.id ===
                    session.userId
            );

        const fallbackIndex =
            userIndex >= 0
                ? userIndex
                : users.findIndex(
                      user =>
                          user.email ===
                          session.email
                  );

        if (fallbackIndex < 0) {
            throw new Error(
                "Authenticated member account could not be found."
            );
        }

        /*
           Split full name into first and
           last names while preserving
           the existing auth structure.
        */

        const nameParts =
            fullName
                .trim()
                .split(/\s+/);

        const firstName =
            nameParts.shift() || "";

        const lastName =
            nameParts.join(" ") || "";

        /*
           Prevent changing the email to an
           email already belonging to another
           member.
        */

        const emailTaken =
            users.some(
                (user, index) =>
                    index !== fallbackIndex &&
                    String(
                        user.email || ""
                    ).toLowerCase() ===
                        email.toLowerCase()
            );

        if (emailTaken) {
            showProfileError(
                "editEmail",
                "This email is already registered to another account."
            );

            return false;
        }

        /*
           Update the authenticated user.
        */

        users[fallbackIndex] = {
            ...users[fallbackIndex],

            firstName,
            lastName,
            email,
            phone,

            updatedAt:
                new Date().toISOString()
        };

        /*
           Save updated users.
        */

        localStorage.setItem(
            "vyron_users_v1",
            JSON.stringify(users)
        );

        /*
           Update the active authentication
           session so the dashboard and
           auth system remain synchronized.
        */

        const updatedSession = {
            ...session,

            email,

            name: fullName,

            updatedAt:
                new Date().toISOString()
        };

        localStorage.setItem(
            "vyron_session_v1",
            JSON.stringify(
                updatedSession
            )
        );

        /*
           Keep a user-specific profile cache
           as an optional UI convenience.
        */

        const profileKey =
            `vyronMemberProfile_${updatedSession.userId}`;

        localStorage.setItem(
            profileKey,
            JSON.stringify({
                userId:
                    updatedSession.userId,

                fullName,

                email,

                phone,

                updatedAt:
                    updatedSession.updatedAt
            })
        );

        return true;
    }

    /* =====================================================
       UPDATE DASHBOARD UI
       ===================================================== */

    function refreshProfileUI(
        fullName,
        email,
        phone
    ) {
        setProfileName(
            fullName
        );

        setProfileInformation(
            email,
            phone
        );

        /*
           Update any elements that explicitly
           expose member email/name.
        */

        document
            .querySelectorAll(
                "[data-member-name]"
            )
            .forEach(element => {
                element.textContent =
                    fullName;
            });

        document
            .querySelectorAll(
                "[data-member-email]"
            )
            .forEach(element => {
                element.textContent =
                    email;
            });

        document
            .querySelectorAll(
                "[data-member-phone]"
            )
            .forEach(element => {
                element.textContent =
                    phone || "Not provided";
            });
    }

    /* =====================================================
       PROFILE BUTTON
       ===================================================== */

    if (editButton) {
        editButton.addEventListener(
            "click",
            event => {
                event.preventDefault();
                openProfileEditor();
            }
        );
    }

    /* =====================================================
       PROFILE CLOSE BUTTON
       ===================================================== */

    if (profileEditClose) {
        profileEditClose.addEventListener(
            "click",
            closeProfileEditor
        );
    }

    /* =====================================================
       PROFILE CANCEL BUTTON
       ===================================================== */

    if (profileEditCancel) {
        profileEditCancel.addEventListener(
            "click",
            closeProfileEditor
        );
    }

    /* =====================================================
       CLICK OUTSIDE PROFILE MODAL
       ===================================================== */

    if (profileEditModal) {
        profileEditModal.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    profileEditModal
                ) {
                    closeProfileEditor();
                }
            }
        );
    }

    /* =====================================================
       SAVE PROFILE
       ===================================================== */

    if (profileEditForm) {
        profileEditForm.addEventListener(
            "submit",
            event => {
                event.preventDefault();

                clearProfileErrors();

                const fullName =
                    editFullName?.value
                        .trim() || "";

                const email =
                    editEmail?.value
                        .trim()
                        .toLowerCase() || "";

                const phone =
                    editPhone?.value
                        .trim() || "";

                let valid = true;

                /* Full name */

                if (
                    !isValidName(
                        fullName
                    )
                ) {
                    showProfileError(
                        "editFullName",
                        "Enter a valid full name."
                    );

                    valid = false;
                }

                /* Email */

                if (
                    !isValidEmail(
                        email
                    )
                ) {
                    showProfileError(
                        "editEmail",
                        "Enter a valid email address."
                    );

                    valid = false;
                }

                /* Phone */

                if (
                    !isValidPhone(
                        phone
                    )
                ) {
                    showProfileError(
                        "editPhone",
                        "Enter a valid phone number."
                    );

                    valid = false;
                }

                if (!valid) {
                    return;
                }

                const saveButton =
                    profileEditForm.querySelector(
                        'button[type="submit"]'
                    );

                const originalContent =
                    saveButton?.innerHTML;

                if (saveButton) {
                    saveButton.disabled =
                        true;

                    saveButton.innerHTML =
                        `
                            <span>SAVING...</span>
                            <i
                                class="fa-solid fa-spinner fa-spin"
                                aria-hidden="true"
                            ></i>
                        `;
                }

                try {
                    const saved =
                        saveMemberProfile(
                            fullName,
                            email,
                            phone
                        );

                    if (!saved) {
                        return;
                    }

                    refreshProfileUI(
                        fullName,
                        email,
                        phone
                    );

                    closeProfileEditor();

                    /*
                       Optional visual confirmation.
                       Uses your existing auth message
                       element if it exists.
                    */

                    const message =
                        document.getElementById(
                            "authMessage"
                        );

                    if (message) {
                        message.textContent =
                            "Profile updated successfully.";

                        message.className =
                            "auth-message show success";

                        window.setTimeout(
                            () => {
                                message.className =
                                    "auth-message";
                                message.textContent =
                                    "";
                            },
                            3000
                        );
                    }

                } catch (error) {
                    console.error(
                        "[VYRON DASHBOARD] Profile update failed:",
                        error
                    );

                    const message =
                        document.getElementById(
                            "authMessage"
                        );

                    if (message) {
                        message.textContent =
                            "We could not update your profile. Please try again.";

                        message.className =
                            "auth-message show error";
                    }

                } finally {
                    if (saveButton) {
                        saveButton.disabled =
                            false;

                        if (
                            originalContent !==
                            undefined
                        ) {
                            saveButton.innerHTML =
                                originalContent;
                        }
                    }
                }
            }
        );
    }

    /* =====================================================
       INITIAL PROFILE DISPLAY
       ===================================================== */

    function initializeProfileDisplay() {
        const session =
            getCurrentSession();

        const user =
            getCurrentUser();

        if (!session) {
            return;
        }

        const fullName =
            user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : session.name || "";

        const email =
            user?.email ||
            session.email ||
            "";

        const phone =
            user?.phone ||
            "";

        if (fullName) {
            setProfileName(
                fullName
            );
        }

        setProfileInformation(
            email,
            phone
        );
    }

    initializeProfileDisplay();

    /* =====================================================
       INITIAL ARIA STATE
       ===================================================== */

    if (menuToggle) {
        menuToggle.setAttribute(
            "aria-expanded",
            sidebar?.classList.contains(
                "active"
            )
                ? "true"
                : "false"
        );
    }

    if (logoutModal) {
        logoutModal.setAttribute(
            "aria-hidden",
            logoutModal.classList.contains(
                "active"
            )
                ? "false"
                : "true"
        );
    }

    if (profileEditModal) {
        profileEditModal.setAttribute(
            "aria-hidden",
            profileEditModal.classList.contains(
                "active"
            )
                ? "false"
                : "true"
        );
    }

    console.log(
        "[VYRON DASHBOARD] Dashboard initialized successfully."
    );
});
