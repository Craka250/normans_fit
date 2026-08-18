/* =========================================================
   VYRON FITNESS
   NAVIGATION
========================================================= */

(() => {

    const header =
        document.getElementById("siteHeader");

    const menuToggle =
        document.getElementById("mobileMenuToggle");

    const mobileNavigation =
        document.getElementById("mobileNavigation");


    /* =====================================================
       SCROLL NAVBAR
    ====================================================== */

    function handleScroll() {

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
       MOBILE MENU
    ====================================================== */

    if (menuToggle && mobileNavigation) {

        menuToggle.addEventListener("click", () => {

            const active =
                menuToggle.classList.toggle("active");

            mobileNavigation.classList.toggle(
                "active",
                active
            );

            menuToggle.setAttribute(
                "aria-expanded",
                active
            );

            document.body.style.overflow =
                active ? "hidden" : "";

        });


        document
            .querySelectorAll(".mobile-nav-link")
            .forEach(link => {

                link.addEventListener("click", () => {

                    menuToggle.classList.remove("active");

                    mobileNavigation.classList.remove(
                        "active"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    document.body.style.overflow = "";

                });

            });

    }


    /* =====================================================
       DROPDOWNS
    ====================================================== */

    document
        .querySelectorAll(".nav-dropdown-toggle")
        .forEach(button => {

            button.addEventListener("click", event => {

                event.stopPropagation();

                const parent =
                    button.closest(".nav-dropdown");

                const isOpen =
                    parent.classList.contains("open");


                document
                    .querySelectorAll(".nav-dropdown")
                    .forEach(dropdown => {

                        dropdown.classList.remove("open");

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


                if (!isOpen) {

                    parent.classList.add("open");

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            });

        });


    document.addEventListener("click", () => {

        document
            .querySelectorAll(".nav-dropdown")
            .forEach(dropdown => {

                dropdown.classList.remove("open");

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

    });

})();
