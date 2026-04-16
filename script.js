const root = document.documentElement;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
const sections = [...document.querySelectorAll("section[id]")];
const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const yearNode = document.getElementById("year");

const closeMenu = () => {
  if (!menuToggle || !navMenu) {
    return;
  }

  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
};

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

const setActiveLink = () => {
  let currentSection = sections[0]?.id || "home";

  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    const bottom = top + section.offsetHeight;

    if (window.scrollY >= top && window.scrollY < bottom) {
      currentSection = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentSection}`;
    link.classList.toggle("active", isActive);
  });
};

const onScroll = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
  setActiveLink();
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", onScroll);

document.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;

  root.style.setProperty("--pointer-x", `${x}%`);
  root.style.setProperty("--pointer-y", `${y}%`);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.toggle("active", item === button));

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ").filter(Boolean);
      const matches = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
