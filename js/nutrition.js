/* =========================================================
   VYRON FITNESS
   NUTRITION PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       NUTRITION GOAL TABS
    ===================================================== */

    const goalTabs =
        document.querySelectorAll(".nutrition-goal-tab");

    const goalPanels =
        document.querySelectorAll(".nutrition-goal-panel");


    goalTabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            const selectedGoal =
                tab.dataset.goal;


            /*
                Remove active state from every tab.
            */

            goalTabs.forEach((item) => {

                item.classList.remove("active");

            });


            /*
                Hide every panel.
            */

            goalPanels.forEach((panel) => {

                panel.classList.remove("active");

            });


            /*
                Activate selected tab.
            */

            tab.classList.add("active");


            /*
                Show matching panel.
            */

            const selectedPanel =
                document.querySelector(
                    `.nutrition-goal-panel[data-panel="${selectedGoal}"]`
                );


            if (selectedPanel) {

                selectedPanel.classList.add("active");

            }

        });

    });



    /* =====================================================
       REVEAL ANIMATIONS
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".nutrition-page .reveal, " +
            ".nutrition-page .reveal-left, " +
            ".nutrition-page .reveal-right"
        );


    /*
        If the project already has a global reveal
        animation system, do not duplicate it.
    */

    if (
        !document.documentElement.classList.contains(
            "reveal-ready"
        )
    ) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        entry.target.classList.add(
                            "revealed"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach((element) => {

            revealObserver.observe(element);

        });

    }


});
