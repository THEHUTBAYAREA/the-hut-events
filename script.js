// Replace this with the email address that should receive booking requests.
const BOOKING_EMAIL = "YOUR_EMAIL_HERE";
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}));
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("booking-form").addEventListener("submit", e => {
  e.preventDefault();
  const d = new FormData(e.currentTarget);
  const status = document.getElementById("status");
  if (BOOKING_EMAIL === "YOUR_EMAIL_HERE") {
    status.textContent = "Add your booking email in script.js before publishing to receive requests.";
    return;
  }
  const subject = encodeURIComponent("The Hut booking request — " + d.get("name"));
  const body = encodeURIComponent(`Name: ${d.get("name")}
Email: ${d.get("email")}
Phone: ${d.get("phone")}
Event: ${d.get("type")}
Date: ${d.get("date")}
Guests: ${d.get("guests")}

Details:
${d.get("details")}`);
  status.textContent = "Opening your email app…";
  location.href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`;
});