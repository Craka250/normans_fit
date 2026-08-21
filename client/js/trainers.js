/* =========================================================
   VYRON — TRAINERS PAGE
   ========================================================= */

"use strict";

/* =========================================================
   TRAINER DATA
   ========================================================= */

const TRAINERS = Object.freeze([
    Object.freeze({
        id: "amara-blake",
        number: "01",
        name: "Amara Blake",
        image: "assets/images/gym-trainer-1a.png",
        alt: "Amara Blake, VYRON strength and performance coach",
        specialization: "Strength / Performance",
        category: "strength",
        experience: "7 Years",
        description:
            "Amara focuses on structured strength and performance training. Her coaching approach is centered on building strength progressively while keeping each session purposeful, controlled and aligned with the athlete's goals.",
        focus: Object.freeze([
            "Progressive strength development",
            "Performance-focused resistance training",
            "Movement quality and training technique",
            "Structured progression"
        ]),
        idealFor:
            "Members who want to build strength, improve physical performance and develop a consistent resistance-training foundation."
    }),

    Object.freeze({
        id: "marcus-cole",
        number: "02",
        name: "Marcus Cole",
        image: "assets/images/gym-trainer-2a.png",
        alt: "Marcus Cole, VYRON conditioning and HIIT coach",
        specialization: "Conditioning / HIIT",
        category: "conditioning",
        experience: "4 Years",
        description:
            "Marcus specializes in conditioning and high-intensity interval training. His sessions are designed around controlled intensity, cardiovascular conditioning and challenging full-body work while maintaining clear training structure.",
        focus: Object.freeze([
            "High-intensity interval training",
            "Cardiovascular conditioning",
            "Full-body conditioning",
            "Work-capacity development"
        ]),
        idealFor:
            "Members who enjoy energetic sessions, want to improve conditioning and are looking for structured high-intensity training."
    }),

    Object.freeze({
        id: "daniel-stone",
        number: "03",
        name: "Daniel Stone",
        image: "assets/images/gym-trainer-4a.png",
        alt: "Daniel Stone, VYRON mobility and functional coach",
        specialization: "Mobility / Functional",
        category: "mobility",
        experience: "9 Years",
        description:
            "Daniel focuses on mobility and functional training. His coaching emphasizes controlled movement, useful strength and movement quality to help members develop a more capable and balanced physical foundation.",
        focus: Object.freeze([
            "Mobility development",
            "Functional movement",
            "Foundational physical capacity",
            "Movement control and quality"
        ]),
        idealFor:
            "Members who want to improve mobility, movement quality, functional strength and overall physical capability."
    })
]);


/* =========================================================
   DOM REFERENCES
   ========================================================= */

let trainerGrid = null;
let trainerEmpty = null;
let trainerSearch = null;
let specializationFilter = null;
let clearTrainerSearch = null;
let trainerCount = null;

let trainerModal = null;
let trainerModalClose = null;

let modalTrainerImage = null;
let modalTrainerNumber = null;
let modalTrainerSpecialization = null;
let modalTrainerExperience = null;
let modalTrainerName = null;
let modalTrainerDescription = null;
let modalTrainerFocus = null;
let modalTrainerIdeal = null;


/* =========================================================
   STATE
   ========================================================= */

let activeTrainerId = null;
let previousFocusedElement = null;


/* =========================================================
   NORMALIZE SEARCH
   ========================================================= */

function normalizeSearch(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}


/* =========================================================
   CREATE TRAINER CARD
   ========================================================= */

function createTrainerCard(trainer) {

    const article = document.createElement("article");
    article.className = "full-trainer-card reveal";
    article.dataset.trainerId = trainer.id;

    /* IMAGE */

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "full-trainer-image";

    const image = document.createElement("img");

    image.src = trainer.image;
    image.alt = trainer.alt;
    image.loading = "lazy";
    image.decoding = "async";

    imageWrapper.appendChild(image);


    /* NUMBER */

    const number = document.createElement("div");
    number.className = "full-trainer-number";

    const numberLabel = document.createElement("span");
    numberLabel.textContent = "COACH";

    const numberValue = document.createElement("strong");
    numberValue.textContent = trainer.number;

    number.append(
        numberLabel,
        numberValue
    );


    /* PROFILE ACTION */

    const action = document.createElement("div");
    action.className = "full-trainer-action";

    const profileButton = document.createElement("button");

    profileButton.type = "button";
    profileButton.className = "open-trainer-profile";
    profileButton.dataset.trainerId = trainer.id;

    profileButton.setAttribute(
        "aria-label",
        `View ${trainer.name} profile`
    );

    const profileIcon = document.createElement("i");

    profileIcon.className =
        "fa-solid fa-arrow-up-right-from-square";

    profileIcon.setAttribute(
        "aria-hidden",
        "true"
    );

    profileButton.appendChild(profileIcon);
    action.appendChild(profileButton);


    /* IMAGE CONTENT */

    const imageContent = document.createElement("div");

    imageContent.className =
        "full-trainer-image-content";

    const specialization = document.createElement("span");

    specialization.className =
        "full-trainer-specialization";

    specialization.textContent =
        trainer.specialization;

    const name = document.createElement("h3");

    name.textContent =
        trainer.name;

    imageContent.append(
        specialization,
        name
    );


    imageWrapper.append(
        number,
        action,
        imageContent
    );


    /* BODY */

    const body = document.createElement("div");

    body.className =
        "full-trainer-body";


    /* META */

    const meta = document.createElement("div");

    meta.className =
        "full-trainer-meta";

    const metaSpecialization =
        document.createElement("span");

    metaSpecialization.textContent =
        trainer.specialization;

    const line =
        document.createElement("span");

    line.className = "line";
    line.setAttribute(
        "aria-hidden",
        "true"
    );

    const experience =
        document.createElement("span");

    experience.className =
        "experience";

    experience.textContent =
        trainer.experience;

    meta.append(
        metaSpecialization,
        line,
        experience
    );


    /* DESCRIPTION */

    const description =
        document.createElement("p");

    description.className =
        "full-trainer-description";

    description.textContent =
        trainer.description;


    /* TAGS */

    const tags =
        document.createElement("div");

    tags.className =
        "trainer-tags";

    trainer.focus.forEach(
        focusItem => {

            const tag =
                document.createElement("span");

            tag.className =
                "trainer-tag";

            tag.textContent =
                focusItem;

            tags.appendChild(tag);
        }
    );


    /* VIEW PROFILE BUTTON */

    const viewButton =
        document.createElement("button");

    viewButton.type = "button";

    viewButton.className =
        "view-profile-btn";

    viewButton.dataset.trainerId =
        trainer.id;

    viewButton.append(
        document.createTextNode(
            "View Full Profile "
        )
    );

    const arrow =
        document.createElement("i");

    arrow.className =
        "fa-solid fa-arrow-right";

    arrow.setAttribute(
        "aria-hidden",
        "true"
    );

    viewButton.appendChild(arrow);


    /* ASSEMBLE */

    body.append(
        meta,
        description,
        tags,
        viewButton
    );

    article.append(
        imageWrapper,
        body
    );

    return article;
}


/* =========================================================
   UPDATE TRAINER COUNT
   ========================================================= */

function updateTrainerCount(count) {

    if (!trainerCount) {
        return;
    }

    trainerCount.textContent =
        String(count).padStart(2, "0");
}


/* =========================================================
   RENDER TRAINERS
   ========================================================= */

function renderTrainers(list) {

    if (!trainerGrid) {
        return;
    }

    trainerGrid.replaceChildren();

    updateTrainerCount(list.length);


    if (!list.length) {

        if (trainerEmpty) {
            trainerEmpty.hidden = false;
        }

        return;
    }


    if (trainerEmpty) {
        trainerEmpty.hidden = true;
    }


    const fragment =
        document.createDocumentFragment();


    list.forEach(
        trainer => {

            fragment.appendChild(
                createTrainerCard(trainer)
            );

        }
    );


    trainerGrid.appendChild(fragment);

    initializeRevealElements();
}


/* =========================================================
   FILTER TRAINERS
   ========================================================= */

function filterTrainers() {

    const searchTerm =
        normalizeSearch(
            trainerSearch?.value
        );

    const category =
        specializationFilter?.value ||
        "all";


    const filtered =
        TRAINERS.filter(
            trainer => {

                const searchableText =
                    normalizeSearch(
                        [
                            trainer.name,
                            trainer.specialization,
                            trainer.description,
                            trainer.experience,
                            ...trainer.focus
                        ].join(" ")
                    );


                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );


                const matchesCategory =
                    category === "all" ||
                    trainer.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    renderTrainers(filtered);
}


/* =========================================================
   OPEN TRAINER PROFILE
   ========================================================= */

function openTrainerProfile(trainerId) {

    const trainer =
        TRAINERS.find(
            item => item.id === trainerId
        );


    if (!trainer || !trainerModal) {
        return;
    }


    activeTrainerId =
        trainer.id;

    previousFocusedElement =
        document.activeElement;


    if (modalTrainerImage) {
        modalTrainerImage.src =
            trainer.image;

        modalTrainerImage.alt =
            trainer.alt;
    }


    if (modalTrainerNumber) {
        modalTrainerNumber.textContent =
            trainer.number;
    }


    if (modalTrainerSpecialization) {
        modalTrainerSpecialization.textContent =
            trainer.specialization;
    }


    if (modalTrainerExperience) {
        modalTrainerExperience.textContent =
            trainer.experience;
    }


    if (modalTrainerName) {
        modalTrainerName.textContent =
            trainer.name;
    }


    if (modalTrainerDescription) {
        modalTrainerDescription.textContent =
            trainer.description;
    }


    if (modalTrainerFocus) {

        modalTrainerFocus.replaceChildren();

        trainer.focus.forEach(
            item => {

                const li =
                    document.createElement("li");

                li.textContent =
                    item;

                modalTrainerFocus.appendChild(li);
            }
        );
    }


    if (modalTrainerIdeal) {
        modalTrainerIdeal.textContent =
            trainer.idealFor;
    }


    trainerModal.hidden = false;

    document.body.classList.add(
        "trainer-modal-open"
    );


    requestAnimationFrame(
        () => {
            trainerModalClose?.focus();
        }
    );
}


/* =========================================================
   CLOSE TRAINER PROFILE
   ========================================================= */

function closeTrainerProfile() {

    if (!trainerModal) {
        return;
    }


    trainerModal.hidden = true;

    document.body.classList.remove(
        "trainer-modal-open"
    );


    activeTrainerId = null;


    if (
        previousFocusedElement &&
        typeof previousFocusedElement.focus ===
            "function"
    ) {
        previousFocusedElement.focus();
    }


    previousFocusedElement = null;
}


/* =========================================================
   TRAINER EVENTS
   ========================================================= */

function initializeTrainerEvents() {

    if (!trainerGrid) {
        return;
    }


    trainerGrid.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-trainer-id]"
                );


            if (!button) {
                return;
            }


            const trainerId =
                button.dataset.trainerId;


            if (!trainerId) {
                return;
            }


            openTrainerProfile(
                trainerId
            );
        }
    );
}


/* =========================================================
   MODAL EVENTS
   ========================================================= */

function initializeModalEvents() {

    trainerModalClose?.addEventListener(
        "click",
        closeTrainerProfile
    );


    trainerModal?.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "[data-modal-close]"
                )
            ) {
                closeTrainerProfile();
            }
        }
    );
}


/* =========================================================
   ESCAPE
   ========================================================= */

function initializeEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                trainerModal &&
                !trainerModal.hidden
            ) {
                closeTrainerProfile();
            }
        }
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function initializeSearch() {

    if (!trainerSearch) {
        return;
    }


    trainerSearch.addEventListener(
        "input",
        filterTrainers
    );
}


/* =========================================================
   FILTER
   ========================================================= */

function initializeFilter() {

    if (!specializationFilter) {
        return;
    }


    specializationFilter.addEventListener(
        "change",
        filterTrainers
    );
}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function initializeClearFilters() {

    clearTrainerSearch?.addEventListener(
        "click",
        () => {

            if (trainerSearch) {
                trainerSearch.value = "";
            }


            if (specializationFilter) {
                specializationFilter.value =
                    "all";
            }


            filterTrainers();

            trainerSearch?.focus();
        }
    );
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const navLinks =
        document.getElementById(
            "navLinks"
        );


    if (!menuToggle || !navLinks) {
        return;
    }


    menuToggle.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isOpen =
                navLinks.classList.toggle(
                    "show"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            const icon =
                menuToggle.querySelector("i");


            if (icon) {

                icon.className =
                    isOpen
                        ? "fa-solid fa-xmark"
                        : "fa-solid fa-bars";
            }
        }
    );


    navLinks.addEventListener(
        "click",
        event => {

            if (
                event.target.closest("a")
            ) {

                navLinks.classList.remove(
                    "show"
                );


                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const icon =
                    menuToggle.querySelector("i");


                if (icon) {
                    icon.className =
                        "fa-solid fa-bars";
                }
            }
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !navLinks.contains(
                    event.target
                ) &&
                !menuToggle.contains(
                    event.target
                )
            ) {

                navLinks.classList.remove(
                    "show"
                );


                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const icon =
                    menuToggle.querySelector("i");


                if (icon) {
                    icon.className =
                        "fa-solid fa-bars";
                }
            }
        }
    );
}


/* =========================================================
   REVEAL ANIMATION
   ========================================================= */

function initializeRevealElements() {

    const elements =
        document.querySelectorAll(
            ".reveal:not(.reveal-ready)"
        );


    if (!elements.length) {
        return;
    }


    elements.forEach(
        element => {

            element.classList.add(
                "reveal-ready"
            );
        }
    );


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "active"
                );
            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "active"
                            );


                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );
            },
            {
                threshold: 0.05,
                rootMargin:
                    "0px 0px 0px 0px"
            }
        );


    elements.forEach(
        element => {
            observer.observe(element);
        }
    );
}


/* =========================================================
   YEAR
   ========================================================= */

function initializeYear() {

    const year =
        document.getElementById(
            "currentYear"
        );


    if (year) {

        year.textContent =
            String(
                new Date().getFullYear()
            );
    }
}


/* =========================================================
   DOM REFERENCES
   ========================================================= */

function initializeDOMReferences() {

    trainerGrid =
        document.getElementById(
            "trainerGrid"
        );

    trainerEmpty =
        document.getElementById(
            "trainerEmpty"
        );

    trainerSearch =
        document.getElementById(
            "trainerSearch"
        );

    specializationFilter =
        document.getElementById(
            "specializationFilter"
        );

    clearTrainerSearch =
        document.getElementById(
            "clearTrainerSearch"
        );

    trainerCount =
        document.getElementById(
            "trainerCount"
        );


    trainerModal =
        document.getElementById(
            "trainerModal"
        );

    trainerModalClose =
        document.getElementById(
            "trainerModalClose"
        );


    modalTrainerImage =
        document.getElementById(
            "modalTrainerImage"
        );

    modalTrainerNumber =
        document.getElementById(
            "modalTrainerNumber"
        );

    modalTrainerSpecialization =
        document.getElementById(
            "modalTrainerSpecialization"
        );

    modalTrainerExperience =
        document.getElementById(
            "modalTrainerExperience"
        );

    modalTrainerName =
        document.getElementById(
            "modalTrainerName"
        );

    modalTrainerDescription =
        document.getElementById(
            "modalTrainerDescription"
        );

    modalTrainerFocus =
        document.getElementById(
            "modalTrainerFocus"
        );

    modalTrainerIdeal =
        document.getElementById(
            "modalTrainerIdeal"
        );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeDOMReferences();

        renderTrainers(
            [...TRAINERS]
        );

        initializeTrainerEvents();

        initializeModalEvents();

        initializeEscapeKey();

        initializeSearch();

        initializeFilter();

        initializeClearFilters();

        initializeNavigation();

        initializeRevealElements();

        initializeYear();
    }
);
