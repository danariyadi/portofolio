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
  { extension: "webp", numbers: [...createRange(11, 24), 48, 49, ...createRange(113, 116), ...createRange(334, 343), 552, 558, 562] },
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

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const imagePaths = (carousel.dataset.images || "").split("|").filter(Boolean);
  const fallbackImage = carousel.querySelector("img");
  const fallbackAlt = fallbackImage?.getAttribute("alt") || "Preview project website";

  if (imagePaths.length > 1 && fallbackImage) {
    const track = document.createElement("div");
    track.className = "media-carousel-track";

    imagePaths.forEach((path, index) => {
      const slide = document.createElement("figure");
      const image = document.createElement("img");

      slide.className = "media-slide";
      image.src = path;
      image.alt = `${fallbackAlt} ${index + 1}`;
      image.loading = "lazy";
      image.decoding = "async";

      slide.appendChild(image);
      track.appendChild(slide);
    });

    fallbackImage.remove();
    carousel.insertBefore(track, carousel.firstChild);

    const previousButton = document.createElement("button");
    const nextButton = document.createElement("button");
    const dots = document.createElement("div");

    previousButton.className = "carousel-button carousel-button--prev";
    previousButton.type = "button";
    previousButton.setAttribute("aria-label", "Foto sebelumnya");
    previousButton.innerHTML = "&lsaquo;";

    nextButton.className = "carousel-button carousel-button--next";
    nextButton.type = "button";
    nextButton.setAttribute("aria-label", "Foto berikutnya");
    nextButton.innerHTML = "&rsaquo;";

    dots.className = "carousel-dots";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = imagePaths.map((_, index) => `<span class="${index === 0 ? "active" : ""}"></span>`).join("");

    carousel.append(previousButton, nextButton, dots);
  }

  const track = carousel.querySelector(".media-carousel-track");
  const slides = [...carousel.querySelectorAll(".media-slide")];
  const dots = [...carousel.querySelectorAll(".carousel-dots span")];
  const previousButton = carousel.querySelector(".carousel-button--prev");
  const nextButton = carousel.querySelector(".carousel-button--next");

  if (!track || slides.length === 0) {
    return;
  }

  const getCurrentIndex = () => {
    const slideWidth = slides[0].getBoundingClientRect().width || track.clientWidth;
    return Math.round(track.scrollLeft / slideWidth);
  };

  const updateDots = () => {
    const currentIndex = Math.min(getCurrentIndex(), dots.length - 1);
    dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));
  };

  const scrollToSlide = (index) => {
    const slideWidth = slides[0].getBoundingClientRect().width || track.clientWidth;
    const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({ left: slideWidth * targetIndex, behavior: "smooth" });
  };

  previousButton?.addEventListener("click", () => {
    scrollToSlide(getCurrentIndex() - 1);
  });

  nextButton?.addEventListener("click", () => {
    scrollToSlide(getCurrentIndex() + 1);
  });

  track.addEventListener("scroll", updateDots, { passive: true });
  updateDots();
});

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
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = header ? header.offsetHeight + 12 : 0;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
      closeMenu();
    });
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

const urlParams = new URLSearchParams(window.location.search);
const initialFilter = urlParams.get("filter");
if (initialFilter) {
  const targetButton = document.querySelector(`.filter-button[data-filter="${initialFilter}"]`);
  if (targetButton) {
    targetButton.click();
  }
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

/* ─── Portfolio Picker Modal ──────────────────────────────────────────────── */

const portfolioModalOverlay = document.getElementById("portfolio-modal");
const portfolioModalPanel = document.getElementById("portfolio-modal-panel");
const btnLihatPortfolio = document.getElementById("btn-lihat-portfolio");
const modalCloseBtn = document.getElementById("modal-close-btn");

const openPortfolioModal = () => {
  if (!portfolioModalOverlay) return;
  portfolioModalOverlay.removeAttribute("hidden");
  requestAnimationFrame(() => {
    portfolioModalOverlay.classList.add("is-open");
  });
  document.body.style.overflow = "hidden";
  modalCloseBtn?.focus();
};

const closePortfolioModal = () => {
  if (!portfolioModalOverlay) return;
  portfolioModalOverlay.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => {
    portfolioModalOverlay.setAttribute("hidden", "");
  }, 280);
  btnLihatPortfolio?.focus();
};

btnLihatPortfolio?.addEventListener("click", openPortfolioModal);
modalCloseBtn?.addEventListener("click", closePortfolioModal);

portfolioModalOverlay?.addEventListener("click", (event) => {
  if (!portfolioModalPanel?.contains(event.target)) {
    closePortfolioModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && portfolioModalOverlay && !portfolioModalOverlay.hasAttribute("hidden")) {
    closePortfolioModal();
  }
});
