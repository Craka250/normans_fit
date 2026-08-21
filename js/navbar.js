/* =========================================================
   VYRON FITNESS
   NAVIGATION
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       ELEMENT REFERENCES
    ====================================================== */

    const header =
        document.getElementById("siteHeader");

    /*
     * Support both the original JS IDs and the IDs
     * currently used in your HTML.
     */
    const menuToggle =
        document.getElementById("mobileMenuToggle") ||
        document.getElementById("menuToggle");

    const mobileNavigation =
        document.getElementById("mobileNavigation") ||
        document.getElementById("navLinks");


    /* =====================================================
       SCROLL NAVBAR
    ====================================================== */

    function handleScroll() {
        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    window.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
    );

    handleScroll();


    /* =====================================================
        ACTIVE NAVIGATION
    ====================================================== */

    function setActiveNavigation() {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase() || "index.html";

        const currentHash =
            window.location.hash.toLowerCase();


        /* -------------------------------------------------
        DESKTOP NORMAL NAV LINKS
        ------------------------------------------------- */

        document
            .querySelectorAll(".desktop-nav > .nav-link")
            .forEach(link => {

                const href =
                    link.getAttribute("href");

                if (!href) return;

                const linkPage =
                    href
                        .split("#")[0]
                        .split("/")
                        .pop()
                        .toLowerCase();

                link.classList.remove("active");

                if (
                    linkPage === currentPage &&
                    !href.includes("#")
                ) {
                    link.classList.add("active");
                }
            });


        /* -------------------------------------------------
        DROPDOWN NAVIGATION
        ------------------------------------------------- */

        document
            .querySelectorAll(".nav-dropdown")
            .forEach(dropdown => {

                const toggle =
                    dropdown.querySelector(
                        ".nav-dropdown-toggle"
                    );

                const links =
                    dropdown.querySelectorAll(
                        ".dropdown-menu a"
                    );

                let dropdownIsActive = false;


                /* -----------------------------------------
                CHECK DROPDOWN ITEMS
                ------------------------------------------ */

                links.forEach(link => {

                    const href =
                        link.getAttribute("href");

                    if (!href) return;

                    const url =
                        href
                            .split("#")[0]
                            .split("/")
                            .pop()
                            .toLowerCase();

                    const hash =
                        href.includes("#")
                            ? "#" +
                            href
                                .split("#")[1]
                                .toLowerCase()
                            : "";


                    /* Remove previous active state */
                    link.classList.remove("active");


                    /* -------------------------------------
                    EXACT PAGE + HASH MATCH
                    -------------------------------------- */

                    if (
                        url === currentPage &&
                        hash &&
                        hash === currentHash
                    ) {

                        link.classList.add("active");

                        dropdownIsActive = true;
                    }

                });


                /* -----------------------------------------
                KEEP DROPDOWN ACTIVE ON ITS PAGE
                ------------------------------------------ */

                const dropdownPages =
                    Array.from(links).some(link => {

                        const href =
                            link.getAttribute("href");

                        if (!href) return false;

                        const page =
                            href
                                .split("#")[0]
                                .split("/")
                                .pop()
                                .toLowerCase();

                        return page === currentPage;
                    });


                if (dropdownPages) {
                    dropdownIsActive = true;
                }


                /* -----------------------------------------
                APPLY DROPDOWN ACTIVE STATE
                ------------------------------------------ */

                if (toggle) {

                    toggle.classList.toggle(
                        "active",
                        dropdownIsActive
                    );

                    if (dropdownIsActive) {

                        toggle.setAttribute(
                            "aria-current",
                            "page"
                        );

                    } else {

                        toggle.removeAttribute(
                            "aria-current"
                        );
                    }
                }


                dropdown.classList.toggle(
                    "active",
                    dropdownIsActive
                );

            });


        /* -------------------------------------------------
        MOBILE NAVIGATION
        ------------------------------------------------- */

        document
            .querySelectorAll(".mobile-nav-link")
            .forEach(link => {

                const href =
                    link.getAttribute("href");

                if (!href || href === "#") return;

                const linkPage =
                    href
                        .split("#")[0]
                        .split("/")
                        .pop()
                        .toLowerCase();

                link.classList.remove("active");
                link.removeAttribute("aria-current");

                if (
                    linkPage === currentPage &&
                    !href.includes("#")
                ) {

                    link.classList.add("active");

                    link.setAttribute(
                        "aria-current",
                        "page"
                    );
                }

            });
    }


    /* Run immediately */
    setActiveNavigation();

    /*
     * Re-run active state when the URL hash changes.
     *
     * Example:
     * members.html#basic
     * members.html#standard
     * members.html#premium
     * members.html#compare
     */
    window.addEventListener(
        "hashchange",
        setActiveNavigation
    );


    /* =====================================================
    MOBILE MENU
    ====================================================== */

    if (menuToggle && mobileNavigation) {

        /* -------------------------------------------------
        MOBILE MENU ICON
        ------------------------------------------------- */

        const menuIcon = menuToggle.querySelector("i");


        /* -------------------------------------------------
        UPDATE HAMBURGER / X ICON
        ------------------------------------------------- */

        function updateMenuIcon(isOpen) {

            if (!menuIcon) return;

            if (isOpen) {

                menuIcon.classList.remove("fa-bars");
                menuIcon.classList.add("fa-xmark");

                menuToggle.setAttribute(
                    "aria-label",
                    "Close navigation"
                );

            } else {

                menuIcon.classList.remove("fa-xmark");
                menuIcon.classList.add("fa-bars");

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation"
                );
            }
        }


        /* -------------------------------------------------
        OPEN MOBILE MENU
        ------------------------------------------------- */

        function openMobileMenu() {

            menuToggle.classList.add("active");

            mobileNavigation.classList.add("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );

            mobileNavigation.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.style.overflow = "hidden";

            updateMenuIcon(true);
        }


        /* -------------------------------------------------
        CLOSE MOBILE MENU
        ------------------------------------------------- */

        function closeMobileMenu() {

            menuToggle.classList.remove("active");

            mobileNavigation.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            mobileNavigation.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.style.overflow = "";

            updateMenuIcon(false);
        }


        /* -------------------------------------------------
        TOGGLE MOBILE MENU
        ------------------------------------------------- */

        function toggleMobileMenu() {

            const isOpen =
                mobileNavigation.classList.contains("active");

            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }
        }


        /* -------------------------------------------------
        HAMBURGER BUTTON
        ------------------------------------------------- */

        menuToggle.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleMobileMenu();

            }
        );


        /* -------------------------------------------------
        CLOSE WHEN CLICKING A MOBILE LINK
        ------------------------------------------------- */

        document
            .querySelectorAll(".mobile-nav-link")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        closeMobileMenu();

                    }
                );

            });


        /* -------------------------------------------------
        CLOSE WHEN CLICKING CTA
        ------------------------------------------------- */

        const mobileCTA =
            mobileNavigation.querySelector(
                ".mobile-cta"
            );

        if (mobileCTA) {

            mobileCTA.addEventListener(
                "click",
                () => {

                    closeMobileMenu();

                }
            );

        }


        /* -------------------------------------------------
        CLOSE WHEN CLICKING OUTSIDE
        ------------------------------------------------- */

        mobileNavigation.addEventListener(
            "click",
            event => {

                /*
                * The mobile-navigation itself is
                * the backdrop.
                */

                if (
                    event.target === mobileNavigation
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* -------------------------------------------------
        PREVENT SIDEBAR CLICKS FROM CLOSING MENU
        ------------------------------------------------- */

        const mobileNavInner =
            mobileNavigation.querySelector(
                ".mobile-nav-inner"
            );

        if (mobileNavInner) {

            mobileNavInner.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                }
            );

        }


        /* -------------------------------------------------
        ESC KEY CLOSES MOBILE MENU
        ------------------------------------------------- */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    mobileNavigation.classList.contains(
                        "active"
                    )
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* -------------------------------------------------
        CLOSE WHEN RETURNING TO DESKTOP
        ------------------------------------------------- */

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 900 &&
                    mobileNavigation.classList.contains(
                        "active"
                    )
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* -------------------------------------------------
        INITIAL ICON STATE
        ------------------------------------------------- */

        updateMenuIcon(false);

    }


    /* =====================================================
       DROPDOWNS
    ====================================================== */

    document
        .querySelectorAll(".nav-dropdown-toggle")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const parent =
                        button.closest(
                            ".nav-dropdown"
                        );

                    if (!parent) return;

                    const isOpen =
                        parent.classList.contains(
                            "open"
                        );


                    /*
                     * Close all dropdowns first.
                     */
                    document
                        .querySelectorAll(
                            ".nav-dropdown"
                        )
                        .forEach(dropdown => {

                            dropdown.classList.remove(
                                "open"
                            );

                            const toggle =
                                dropdown.querySelector(
                                    ".nav-dropdown-toggle"
                                );

                            if (toggle) {
                                toggle.setAttribute(
                                    "aria-expanded",
                                    "false"
                                );
                            }
                        });


                    /*
                     * Open the clicked dropdown.
                     */
                    if (!isOpen) {

                        parent.classList.add(
                            "open"
                        );

                        button.setAttribute(
                            "aria-expanded",
                            "true"
                        );
                    }
                }
            );
        });


    /* =====================================================
       CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    ====================================================== */

    document.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".nav-dropdown"
                )
                .forEach(dropdown => {

                    dropdown.classList.remove(
                        "open"
                    );

                    const toggle =
                        dropdown.querySelector(
                            ".nav-dropdown-toggle"
                        );

                    if (toggle) {
                        toggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                });
        }
    );


    /* =====================================================
       PREVENT DROPDOWN MENU CLICKS FROM CLOSING TOO EARLY
    ====================================================== */

    document
        .querySelectorAll(".dropdown-menu")
        .forEach(menu => {

            menu.addEventListener(
                "click",
                event => {
                    event.stopPropagation();
                }
            );
        });

})();
