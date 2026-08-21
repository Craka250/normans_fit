/* =========================================================
   CONTACT FORM VALIDATION
========================================================= */

const contactForm = document.getElementById("contactForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const message = document.getElementById("message");

const formStatus = document.getElementById("formStatus");


/* =========================================================
   VALIDATION HELPERS
========================================================= */

function setError(field, message) {

    const group = field.closest(".form-group");
    const error = group.querySelector(".field-error");

    group.classList.add("invalid");
    group.classList.remove("valid");

    error.textContent = message;
}


function setValid(field) {

    const group = field.closest(".form-group");
    const error = group.querySelector(".field-error");

    group.classList.remove("invalid");
    group.classList.add("valid");

    error.textContent = "";
}


function validateName() {

    const value = fullName.value.trim();

    if (!value) {

        setError(
            fullName,
            "Please enter your full name."
        );

        return false;
    }

    if (value.length < 2) {

        setError(
            fullName,
            "Your name must contain at least 2 characters."
        );

        return false;
    }

    setValid(fullName);

    return true;
}


function validateEmail() {

    const value = email.value.trim();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {

        setError(
            email,
            "Please enter your email address."
        );

        return false;
    }

    if (!emailPattern.test(value)) {

        setError(
            email,
            "Please enter a valid email address."
        );

        return false;
    }

    setValid(email);

    return true;
}


function validatePhone() {

    const value = phone.value.trim();

    const phonePattern =
        /^[+]?[0-9\s()-]{9,20}$/;

    if (!value) {

        setError(
            phone,
            "Please enter your phone number."
        );

        return false;
    }

    if (!phonePattern.test(value)) {

        setError(
            phone,
            "Please enter a valid phone number."
        );

        return false;
    }

    setValid(phone);

    return true;
}


function validateMessage() {

    const value = message.value.trim();

    if (!value) {

        setError(
            message,
            "Please enter your message."
        );

        return false;
    }

    if (value.length < 10) {

        setError(
            message,
            "Your message must contain at least 10 characters."
        );

        return false;
    }

    setValid(message);

    return true;
}



/* =========================================================
   LIVE VALIDATION
========================================================= */

fullName.addEventListener(
    "blur",
    validateName
);

email.addEventListener(
    "blur",
    validateEmail
);

phone.addEventListener(
    "blur",
    validatePhone
);

message.addEventListener(
    "blur",
    validateMessage
);



/* =========================================================
   FORM SUBMISSION
========================================================= */

contactForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const nameValid = validateName();
        const emailValid = validateEmail();
        const phoneValid = validatePhone();
        const messageValid = validateMessage();


        if (
            !nameValid ||
            !emailValid ||
            !phoneValid ||
            !messageValid
        ) {

            formStatus.className =
                "form-status error";

            formStatus.textContent =
                "Please correct the highlighted fields before submitting.";

            return;
        }


        /*
         * FRONT-END SUCCESS STATE
         *
         * This currently validates the form only.
         * Connect this form to your backend/database
         * before using it for real submissions.
         */

        formStatus.className =
            "form-status success";

        formStatus.textContent =
            "Thank you! Your message has been received. We'll get back to you soon.";


        contactForm.reset();


        document
            .querySelectorAll(".form-group")
            .forEach(group => {

                group.classList.remove(
                    "valid",
                    "invalid"
                );

            });

    }
);
