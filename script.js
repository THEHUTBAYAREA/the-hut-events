
const BOOKING_FUNCTION_URL =
  "https://ngfeuohbrdzrmbtefpix.supabase.co/functions/v1/rapid-processor";

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
    e.preventDefault();

    const status = document.getElementById("status");
    const button = form.querySelector('[type="submit"]');

    if (form.dataset.submitting === "true") return;

    const d = new FormData(form);

    const booking = {
      name: String(d.get("name") ?? "").trim(),
      email: String(d.get("email") ?? "").trim(),
      phone: String(d.get("phone") ?? "").trim(),
      type: String(d.get("type") ?? "").trim(),
      date: String(d.get("date") ?? "").trim(),
      guests: String(d.get("guests") ?? "").trim(),
      details: String(d.get("details") ?? "").trim(),
    };

    if (status) {
      status.textContent = "Submitting your booking request…";
    }

    form.dataset.submitting = "true";
    if (button) button.disabled = true;

    try {
      console.log("Submitting booking to:", BOOKING_FUNCTION_URL);

      const response = await fetch(BOOKING_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(booking),
      });

      const responseText = await response.text();
      let result;

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `Booking server returned unreadable data (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          `Booking server returned HTTP ${response.status}.`
        );
      }

      if (result.success !== true) {
        throw new Error(
          result.error ||
          result.message ||
          "The server did not confirm your booking."
        );
      }

      if (result.booking_saved === true && result.email_sent === true) {
        if (status) {
          status.textContent =
            "Thank you! Your booking request was received and the notification email was sent.";
        }
        form.reset();
      } else if (result.booking_saved === true) {
        if (status) {
          status.textContent =
            "Your booking was saved, but email delivery was not confirmed. Please contact events@thehutbayarea.com.";
        }
      } else {
        throw new Error("The server did not confirm that your booking was saved.");
      }
    } catch (error) {
      console.error("Booking submission failed:", error);

      if (status) {
        const message = error?.message || "";
        const networkFailure =
          error instanceof TypeError ||
          /failed to fetch|networkerror|load failed|cors/i.test(message);

        status.textContent = networkFailure
          ? "Unable to connect to the booking server. Your information has not been cleared. Please contact events@thehutbayarea.com."
          : `Booking failed: ${message} Your information has not been cleared.`;
      }
    } finally {
      delete form.dataset.submitting;
      if (button) button.disabled = false;
    }
  });
}
