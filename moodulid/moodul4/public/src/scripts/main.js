// Slow Pour — minimal client-side interactions for the server-rendered site.
// Dependency-free (no bundler): theme toggle, mobile nav, active-link marking.

const root = document.documentElement;
const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (saved === "dark" || (!saved && prefersDark)) root.classList.add("dark");

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const isDark = root.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

const nav = document.querySelector(".site-nav");
const navToggle = document.getElementById("nav-toggle");
navToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle.setAttribute("aria-label", open ? "Sulge menüü" : "Ava menüü");
});

// Mark the current page in the nav.
const here = location.pathname.replace(/\/+$/, "") || "/";
document.querySelectorAll(".nav-menu a").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("?")[0].replace(/\/+$/, "") || "/";
  if (href === here) a.setAttribute("aria-current", "page");
});
