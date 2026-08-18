/* =========================================================
   VYRON FITNESS
   THEME SYSTEM
========================================================= */

(() => {

    const themeToggle =
        document.getElementById("themeToggle");

    if (!themeToggle) return;


    const icon =
        themeToggle.querySelector("i");


    const storedTheme =
        localStorage.getItem("vyron-theme");


    const systemPrefersLight =
        window.matchMedia(
            "(prefers-color-scheme: light)"
        ).matches;


    const initialTheme =
        storedTheme ||
        (systemPrefersLight ? "light" : "dark");


    applyTheme(initialTheme);


    themeToggle.addEventListener("click", () => {

        const currentTheme =
            document.documentElement
                .getAttribute("data-theme") || "dark";

        const newTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        applyTheme(newTheme);

        localStorage.setItem(
            "vyron-theme",
            newTheme
        );

    });


    function applyTheme(theme) {

        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );


        if (theme === "light") {

            icon.className =
                "fa-solid fa-sun";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

        } else {

            icon.className =
                "fa-solid fa-moon";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        }

    }

})();
