
const BOOKING_FUNCTION_URL =
  "https://ngfeuohbrdzrmbtefpix.supabase.co/functions/v1/rapid-processing";

// Paste your Supabase publishable (public) key below.
// Never use a service-role key or sb_secret_ key here.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bmIZvwV4XmNiTzOyeH-1oQ_y4XqdOJ1";

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const form = document.getElementById("booking-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const status = document.getElementById("status");
    const button = form.querySelector('[type="submit"]');

    if (SUPABASE_PUBLISHABLE_KEY === "sb_publishable_bmIZvwV4XmNiTzOyeH-1oQ_y4XqdOJ1") {
      status.textContent = "Booking form setup is incomplete. Please contact us directly.";
      return;
    }

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

    status.textContent = "Submitting your booking request…";
    if (button) button.disabled = true;

    try {
      const response = await fetch(BOOKING_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(booking),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Submission failed");
      }

      status.textContent = result.email_sent
        ? "Thank you! Your booking request was received."
        : "Your booking was saved. Please contact us if you need confirmation.";

      form.reset();
    } catch (error) {
      console.error("Booking submission failed:", error);
      status.textContent =
        "We couldn't submit your request. Please try again or email events@thehutbayarea.com.";
    } finally {
      if (button) button.disabled = false;
    }
  });
}
