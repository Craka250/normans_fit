/* =========================================================
   VYRON FITNESS
   MAIN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loader =
            document.getElementById("pageLoader");


        window.addEventListener(
            "load",
            () => {

                setTimeout(() => {

                    loader?.classList.add(
                        "loaded"
                    );

                }, 500);

            }
        );


        /* =================================================
           CLOSE LOADER SAFETY FALLBACK
        ================================================= */

        setTimeout(() => {

            loader?.classList.add(
                "loaded"
            );

        }, 2500);


        /* =================================================
           SMOOTH INTERNAL LINKS
        ================================================= */

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

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

                        if (!target) return;


                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            });

    }
);
