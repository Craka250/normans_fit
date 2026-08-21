/* =========================================================
   VYRON FITNESS
   PROGRAMS PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       PROGRAM FILTER
    ====================================================== */

    const filterButtons = document.querySelectorAll(
        ".program-filter"
    );

    const programCards = document.querySelectorAll(
        ".program-directory-card"
    );

    const emptyState = document.querySelector(
        ".program-empty-state"
    );


    if (
        filterButtons.length &&
        programCards.length
    ) {

        filterButtons.forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        button.dataset.filter;


                    /* -----------------------------------------
                       UPDATE ACTIVE BUTTON
                    ------------------------------------------ */

                    filterButtons.forEach((btn) => {

                        btn.classList.remove(
                            "active"
                        );

                        btn.setAttribute(
                            "aria-selected",
                            "false"
                        );

                    });


                    button.classList.add(
                        "active"
                    );

                    button.setAttribute(
                        "aria-selected",
                        "true"
                    );


                    /* -----------------------------------------
                       FILTER CARDS
                    ------------------------------------------ */

                    let visibleCount = 0;


                    programCards.forEach((card) => {

                        const category =
                            card.dataset.category;


                        const shouldShow =
                            filter === "all" ||
                            category === filter;


                        if (shouldShow) {

                            card.classList.remove(
                                "is-hidden"
                            );

                            visibleCount++;

                        } else {

                            card.classList.add(
                                "is-hidden"
                            );

                        }

                    });


                    /* -----------------------------------------
                       EMPTY STATE
                    ------------------------------------------ */

                    if (
                        emptyState
                    ) {

                        if (
                            visibleCount === 0
                        ) {

                            emptyState.classList.add(
                                "visible"
                            );

                        } else {

                            emptyState.classList.remove(
                                "visible"
                            );

                        }

                    }

                }
            );

        });

    }



    /* =====================================================
       SMOOTH SCROLL
    ====================================================== */

    const anchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    anchorLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute("href");


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
       PROGRAM CARD INTERACTION
    ====================================================== */

    programCards.forEach((card) => {

        card.addEventListener(
            "mouseenter",
            () => {

                card.classList.add(
                    "is-active"
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.classList.remove(
                    "is-active"
                );

            }
        );

    });



    /* =====================================================
       REVEAL ANIMATION FALLBACK
       
       If your global JS already handles .reveal,
       this does nothing harmful.
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".programs-page .reveal"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "revealed"
                                );

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


        revealElements.forEach(
            (element) => {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            (element) => {

                element.classList.add(
                    "revealed"
                );

            }
        );

    }

});
