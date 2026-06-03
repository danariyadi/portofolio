const root = document.documentElement;
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = [...document.querySelectorAll(".nav-menu a")];
const sections = [...document.querySelectorAll("section[id]")];
let revealItems = document.querySelectorAll(".reveal");
let filterButtons = document.querySelectorAll(".filter-button");
let projectCards = document.querySelectorAll(".project-card");
const yearNode = document.getElementById("year");
const designGallery = document.getElementById("design-gallery");

const createRange = (start, end) => {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const extensionGroups = [
  { extension: "webp", numbers: [...createRange(11, 24), ...createRange(113, 116), ...createRange(334, 343), 552, 558, 562] },
  { extension: "heic", numbers: [...createRange(25, 42), ...createRange(117, 122), ...createRange(221, 223), ...createRange(344, 346), 351, ...createRange(353, 357), ...createRange(553, 554), 557] },
  { extension: "jpeg", numbers: createRange(126, 131) }
];

const fileExtensions = extensionGroups.reduce((extensions, group) => {
  group.numbers.forEach((number) => {
    extensions[number] = group.extension;
  });

  return extensions;
}, {});

const designItems = [
  ...createRange(112, 131).map((number) => ({ number, label: "EVENT", category: "event" })),
  ...createRange(11, 58).map((number) => ({ number, label: "HARI NASIONAL", category: "hari-nasional" })),
  ...createRange(551, 562).map((number) => ({ number, label: "ORGANISASI", category: "organisasi" })),
  ...createRange(334, 372).map((number) => ({ number, label: "RECAP", category: "recap" })),
  ...createRange(221, 223).map((number) => ({ number, label: "LAINNYA", category: "lainnya" }))
];

if (designGallery) {
  designGallery.innerHTML = designItems.map((item) => `
    <article class="project-card design-card reveal" data-category="${item.category}">
      <div class="project-media">
        <img src="assets/projects/design/${item.number}.${fileExtensions[item.number] || "jpg"}" alt="${item.label} ${item.number}" loading="lazy" decoding="async">
        <span class="project-status">${item.label}</span>
      </div>
    </article>
  `).join("");

  revealItems = document.querySelectorAll(".reveal");
  filterButtons = document.querySelectorAll(".filter-button");
  projectCards = document.querySelectorAll(".project-card");
}

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

const normalizePath = (path) => {
  const fileName = path.split("/").pop() || "index.html";
  return fileName === "" ? "index.html" : fileName;
};

const setActiveLinkByPage = () => {
  const currentPage = normalizePath(window.location.pathname);

  navLinks.forEach((link) => {
    const linkPage = normalizePath(new URL(link.href, window.location.href).pathname);
    link.classList.toggle("active", linkPage === currentPage);
  });
};

const setActiveLinkBySection = () => {
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
  if (navLinks.some((link) => link.getAttribute("href")?.startsWith("#"))) {
    setActiveLinkBySection();
  } else {
    setActiveLinkByPage();
  }
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", onScroll);
setActiveLinkByPage();

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
