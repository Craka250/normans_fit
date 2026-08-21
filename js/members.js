/* =========================================================
   VYRON FITNESS
   MEMBERSHIP PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       FAQ ACCORDION
       ===================================================== */

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {

        const question = item.querySelector(".faq-question");

        if (!question) return;

        question.addEventListener("click", () => {

            const isActive = item.classList.contains("active");

            /*
             * Close all other FAQ items
             */
            faqItems.forEach((otherItem) => {

                if (otherItem !== item) {

                    otherItem.classList.remove("active");

                    const otherQuestion =
                        otherItem.querySelector(".faq-question");

                    if (otherQuestion) {
                        otherQuestion.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }

                }

            });


            /*
             * Toggle selected FAQ
             */
            item.classList.toggle(
                "active",
                !isActive
            );

            question.setAttribute(
                "aria-expanded",
                String(!isActive)
            );

        });

    });


    /* =====================================================
       REVEAL ANIMATIONS
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".membership-page .reveal"
        );


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) return;

                        entry.target.classList.add("active");

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -50px 0px"
                }
            );


        revealElements.forEach((element) => {

            revealObserver.observe(element);

        });

    } else {

        /*
         * Fallback for older browsers
         */
        revealElements.forEach((element) => {

            element.classList.add("active");

        });

    }


    /* =====================================================
       PLAN CARD INTERACTION
       ===================================================== */

    const planCards =
        document.querySelectorAll(
            ".membership-plan-card"
        );


    planCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            planCards.forEach((otherCard) => {

                if (otherCard !== card) {
                    otherCard.style.opacity = "0.82";
                }

            });

        });


        card.addEventListener("mouseleave", () => {

            planCards.forEach((otherCard) => {

                otherCard.style.opacity = "";

            });

        });

    });


    /* =====================================================
       SMOOTH SCROLL FOR INTERNAL MEMBERSHIP LINKS
       ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach((link) => {

            link.addEventListener("click", (event) => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(targetId);

                if (!target) return;

                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });


    /* =====================================================
       ACTIVE FAQ ON KEYBOARD
       ===================================================== */

    faqItems.forEach((item) => {

        const question =
            item.querySelector(".faq-question");

        if (!question) return;

        question.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    question.click();

                }

            }
        );

    });


    /* =====================================================
       HERO VISUAL PARALLAX
       ===================================================== */

    const heroVisual =
        document.querySelector(
            ".membership-hero-visual"
        );

    const heroBack =
        document.querySelector(
            ".hero-visual-back"
        );


    if (
        heroVisual &&
        heroBack &&
        !window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        heroVisual.addEventListener(
            "mousemove",
            (event) => {

                const rect =
                    heroVisual.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left)
                    / rect.width - 0.5;

                const y =
                    (event.clientY - rect.top)
                    / rect.height - 0.5;


                heroBack.style.transform =
                    `rotate(${6 + x * 3}deg)
                     skewY(-2deg)
                     translate(${x * 7}px, ${y * -7}px)`;

            }
        );


        heroVisual.addEventListener(
            "mouseleave",
            () => {

                heroBack.style.transform =
                    "rotate(6deg) skewY(-2deg)";

            }
        );

    }

});
