/* =========================================================
   VYRON TESTIMONIAL IMAGE FALLBACK
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const testimonialImages = document.querySelectorAll(
        ".testimonial-image"
    );

    testimonialImages.forEach((container) => {

        const image = container.querySelector("img");
        const initials = container.querySelector(
            ".testimonial-initials"
        );

        /*
         * No image element found.
         * Show initials as the fallback.
         */
        if (!image) {

            container.classList.add("no-image");

            return;
        }


        /*
         * IMAGE LOADED SUCCESSFULLY
         */
        const imageLoaded = () => {

            if (image.naturalWidth > 0) {

                container.classList.remove("no-image");

                container.classList.add("has-image");

            }

        };


        /*
         * IMAGE FAILED TO LOAD
         */
        const imageFailed = () => {

            container.classList.remove("has-image");

            container.classList.add("no-image");

        };


        /*
         * Listen for future image loading
         */
        image.addEventListener(
            "load",
            imageLoaded
        );

        image.addEventListener(
            "error",
            imageFailed
        );


        /*
         * Handle cached images.
         */
        if (image.complete) {

            if (image.naturalWidth > 0) {

                imageLoaded();

            } else {

                imageFailed();

            }

        }

    });

});
