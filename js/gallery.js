/* =========================================================
   VYRON FITNESS
   GALLERY FILTER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const filterButtons =
        document.querySelectorAll(".gallery-filter");

    const galleryItems =
        document.querySelectorAll(".gallery-page-item");


    if (!filterButtons.length || !galleryItems.length) {
        return;
    }


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;


            /* ---------------------------------------------
               UPDATE ACTIVE BUTTON
            --------------------------------------------- */

            filterButtons.forEach(item => {

                item.classList.remove("active");

                item.setAttribute(
                    "aria-selected",
                    "false"
                );

            });


            button.classList.add("active");

            button.setAttribute(
                "aria-selected",
                "true"
            );


            /* ---------------------------------------------
               FILTER IMAGES
            --------------------------------------------- */

            galleryItems.forEach(item => {

                const category =
                    item.dataset.category;


                const shouldShow =
                    filter === "all" ||
                    category === filter;


                if (shouldShow) {

                    item.classList.remove(
                        "gallery-hidden"
                    );

                } else {

                    item.classList.add(
                        "gallery-hidden"
                    );

                }

            });

        });

    });

});
