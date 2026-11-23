
const BOOKING_FUNCTION_URL =
  "https://ngfeuohbrdzrmbtefpix.supabase.co/functions/v1/rapid-processing";

// Public Supabase publishable key only.
// Never put a service-role key or sb_secret_ key in website code.
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_bmIZvwV4XmNiTzOyeH-1oQ_yX4qdOJ1";

// Mobile navigation
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Current year
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Booking form
const form = document.getElementById("booking-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    // Prevent the browser's normal form submission, page reload,
    // and loss of entered information.
    e.preventDefault();

    const status = document.getElementById("status");
    const button = form.querySelector('[type="submit"]');

    if (form.dataset.submitting === "true") return;

    const d = new FormData(form);

    const booking = {
      name: d.get("name"),
      email: d.get("email"),
      phone: d.get("phone"),
      type: d.get("type"),
      date: d.get("date"),
      guests: d.get("guests"),
      details: d.get("details"),
    };

    if (status) {
      status.textContent = "Submitting your booking request…";
    }

    form.dataset.submitting = "true";
    if (button) button.disabled = true;

    try {
      const response = await fetch(BOOKING_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         apikey: SUPABASE_PUBLISHABLE_KEY,},
        body: JSON.stringify(booking),
      });

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `The server returned an unreadable response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            `The booking server returned HTTP ${response.status}.`
        );
      }

      if (result.success !== true) {
        throw new Error(
          result.error ||
            result.message ||
            "The server did not confirm that your booking was saved."
        );
      }

      // Do not claim email was sent unless the function confirms it.
      if (result.email_sent === true) {
        if (status) {
          status.textContent =
            "Thank you! Your booking request was received and the email was sent.";
        }

        // Clear the form only after confirmed success.
        form.reset();
      } else {
        if (status) {
          status.textContent =
            "Your booking was accepted, but email delivery was not confirmed. Please contact events@thehutbayarea.com.";
        }

        // Keep the entered information because email delivery
        // was not confirmed.
      }
    } catch (error) {
      console.error("Booking submission failed:", error);

      if (status) {
        status.textContent =
          `Booking failed: ${error.message || "Unable to contact the booking server."} Your information has not been cleared.`;
      }

      // Intentionally do not reset the form on failure.
    } finally {
      delete form.dataset.submitting;
      if (button) button.disabled = false;
    }
  });
}
