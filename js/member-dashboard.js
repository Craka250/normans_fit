/* =========================================================
   VYRON FITNESS
   MEMBER DASHBOARD JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
    ====================================================== */

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

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    /* =====================================================
       PAGE LOADER
    ====================================================== */

    window.addEventListener("load", () => {

        setTimeout(() => {

            if (pageLoader) {
                pageLoader.classList.add("hidden");
            }

        }, 450);

    });


    /* =====================================================
       THEME
    ====================================================== */

    const savedTheme =
        localStorage.getItem("vyron-theme");

    if (savedTheme === "light") {

        document.documentElement.setAttribute(
            "data-theme",
            "light"
        );

        updateThemeIcon();

    }


    function updateThemeIcon() {

        if (!themeToggle) return;

        const icon =
            themeToggle.querySelector("i");

        if (!icon) return;

        const lightMode =
            document.documentElement.getAttribute(
                "data-theme"
            ) === "light";


        icon.className = lightMode
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";

    }


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
    ====================================================== */

    function openSidebar() {

        sidebar?.classList.add("active");

        sidebarOverlay?.classList.add("active");

        menuToggle?.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function closeSidebar() {

        sidebar?.classList.remove("active");

        sidebarOverlay?.classList.remove("active");

        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            () => {

                const open =
                    sidebar?.classList.contains(
                        "active"
                    );

                open
                    ? closeSidebar()
                    : openSidebar();

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
    ====================================================== */

    document
        .querySelectorAll(".dashboard-nav-link")
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


                    link.classList.add("active");


                    if (
                        window.innerWidth <= 1000
                    ) {

                        closeSidebar();

                    }

                }
            );

        });


    /* =====================================================
       LOGOUT MODAL
    ====================================================== */

    function openLogoutModal() {

        if (!logoutModal) return;

        logoutModal.classList.add("active");

        logoutModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";

    }


    function closeLogoutModal() {

        if (!logoutModal) return;

        logoutModal.classList.remove("active");

        logoutModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            openLogoutModal
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


    if (logoutModal) {

        logoutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === logoutModal
                ) {

                    closeLogoutModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeLogoutModal();

                closeSidebar();

            }

        }
    );


    /* =====================================================
       NOTIFICATION BUTTON
    ====================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                const notificationSection =
                    document.getElementById(
                        "notifications"
                    );


                if (notificationSection) {

                    notificationSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    /* =====================================================
       PROFILE BUTTON
    ====================================================== */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                const profile =
                    document.getElementById(
                        "profile"
                    );


                if (profile) {

                    profile.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ====================================================== */

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


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =====================================================
       SIMPLE CARD REVEAL
    ====================================================== */

    const cards =
        document.querySelectorAll(
            ".dashboard-card, .member-kpi-card, .quick-action-card"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

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

                    });

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


});

/* =========================================================
   EDIT PROFILE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const editButton = document.querySelector(
        ".profile-edit-button"
    );

    const profileEditModal = document.getElementById(
        "profileEditModal"
    );

    const profileEditClose = document.getElementById(
        "profileEditClose"
    );

    const profileEditCancel = document.getElementById(
        "profileEditCancel"
    );

    const profileEditForm = document.getElementById(
        "profileEditForm"
    );


    if (
        !editButton ||
        !profileEditModal ||
        !profileEditForm
    ) {
        return;
    }


    /* OPEN */
    editButton.addEventListener("click", () => {

        profileEditModal.classList.add("show");

        profileEditModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    });


    /* CLOSE */
    function closeProfileEditor() {

        profileEditModal.classList.remove(
            "show"
        );

        profileEditModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (profileEditClose) {

        profileEditClose.addEventListener(
            "click",
            closeProfileEditor
        );

    }


    if (profileEditCancel) {

        profileEditCancel.addEventListener(
            "click",
            closeProfileEditor
        );

    }


    /* CLICK OUTSIDE */
    profileEditModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                profileEditModal
            ) {
                closeProfileEditor();
            }

        }
    );


    /* ESC KEY */
    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                profileEditModal.classList.contains("show")
            ) {
                closeProfileEditor();
            }

        }
    );


    /* SAVE */
    profileEditForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const fullName =
                document.getElementById(
                    "editFullName"
                ).value.trim();

            const email =
                document.getElementById(
                    "editEmail"
                ).value.trim();

            const phone =
                document.getElementById(
                    "editPhone"
                ).value.trim();


            if (!fullName || !email) {
                return;
            }


            /*
             * Update visible dashboard information
             */
            const profileNames =
                document.querySelectorAll(
                    ".dashboard-profile-name, " +
                    ".profile-details h4, " +
                    ".sidebar-member strong"
                );


            profileNames.forEach((element) => {
                element.textContent = fullName;
            });


            const emailElement =
                document.querySelector(
                    ".profile-info-grid strong"
                );

            if (emailElement) {
                emailElement.textContent = email;
            }


            const phoneElements =
                document.querySelectorAll(
                    ".profile-info-grid strong"
                );


            if (
                phone &&
                phoneElements.length > 1
            ) {
                phoneElements[1].textContent =
                    phone;
            }


            /*
             * Save locally for now.
             *
             * Later we can replace this with
             * your backend/API request.
             */
            const profileData = {
                fullName,
                email,
                phone
            };


            localStorage.setItem(
                "vyronMemberProfile",
                JSON.stringify(profileData)
            );


            closeProfileEditor();

        }
    );

});
