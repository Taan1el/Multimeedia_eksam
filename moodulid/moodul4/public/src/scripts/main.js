import "../styles/tokens.css";
import "../styles/main.css";

const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function syncThemeSources(isDark) {
  document.querySelectorAll('[data-theme-source="dark"]').forEach((source) => {
    source.media = isDark ? "all" : "not all";
  });
}

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  root.classList.add("dark");
}
if (savedTheme) syncThemeSources(savedTheme === "dark");

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  const isDark = root.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  syncThemeSources(isDark);
});

const siteNav = document.querySelector(".site-nav");
const navToggle = document.getElementById("nav-toggle");

navToggle?.addEventListener("click", () => {
  const open = siteNav.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Sulge menüü" : "Ava menüü");
});

const currentPath = location.pathname.replace(/\/+$/, "") || "/";
document.querySelectorAll(".nav-menu a").forEach((link) => {
  const href = new URL(link.href).pathname.replace(/\/+$/, "") || "/";
  if (href === currentPath) link.setAttribute("aria-current", "page");
});

let motionPromise;

function loadMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Promise.resolve();
  }
  motionPromise ??= import("./motion.js").then((motion) => motion.initMotion());
  return motionPromise;
}

window.addEventListener("scroll", loadMotion, { once: true, passive: true });
window.addEventListener("pointerdown", loadMotion, { once: true, passive: true });
window.addEventListener("keydown", loadMotion, { once: true });

if (new URLSearchParams(location.search).get("motion") === "on") {
  loadMotion();
}
