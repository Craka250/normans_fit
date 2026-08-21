/* =========================================================
   VYRON FITNESS
   ANIMATED COUNTERS
========================================================= */

(() => {

    const counters =
        document.querySelectorAll(
            "[data-counter]"
        );


    if (!counters.length) return;


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    animateCounter(
                        entry.target
                    );


                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.5
            }
        );


    counters.forEach(counter => {

        observer.observe(counter);

    });


    function animateCounter(element) {

        const target =
            Number(
                element.dataset.counter
            );

        const duration = 1600;

        const startTime =
            performance.now();


        function update(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
                Ease-out function
            */
            const eased =
                1 - Math.pow(
                    1 - progress,
                    3
                );


            const current =
                Math.floor(
                    eased * target
                );


            element.textContent =
                current.toLocaleString();


            if (progress < 1) {

                requestAnimationFrame(
                    update
                );

            } else {

                element.textContent =
                    target.toLocaleString();

            }

        }


        requestAnimationFrame(update);

    }

})();
