/* =========================================================
   VYRON FITNESS
   SCROLL REVEAL
========================================================= */

(() => {

    const elements =
        document.querySelectorAll(
            ".reveal, .reveal-left, .reveal-right"
        );


    if (!elements.length) return;


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.classList.add(
                        "visible"
                    );


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


    elements.forEach(element => {

        observer.observe(element);

    });

})();
