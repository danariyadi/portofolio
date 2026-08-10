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

// Map section id → URL slug (untuk sub-bagian portofolio pakai slug sendiri)
const SECTION_SLUG_MAP = {
  about:          'about',
  experience:     'experience',
  prestasi:       'prestasi',
  portofolio:     'portofolio',
  contact:        'contact',
  'section-webdev': 'webdev',
  'section-desain': 'desain',
  'section-video':  'video',
};

// Sub-bagian portofolio yang punya slug sendiri
const portfolioSubSections = ['section-webdev', 'section-desain', 'section-video']
  .map(id => document.getElementById(id))
  .filter(Boolean);

let _lastSlug = null;
// Bekukan update URL jika ada hash awal di URL (supaya tidak langsung ditimpa #about)
let _slugFrozen = !!window.location.hash;

const updateUrlSlug = (slug) => {
  if (_slugFrozen) return;           // tahan dulu saat scroll awal
  if (!slug || slug === _lastSlug) return;
  _lastSlug = slug;
  history.replaceState(null, '', '#' + slug);
};

const setActiveLinkBySection = () => {
  let currentSection = sections[0]?.id || 'about';
  const scrollMid = window.scrollY + 140;

  // Cek main sections dulu
  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    const bottom = top + section.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      currentSection = section.id;
    }
  });

  // Jika sedang di section portofolio, cek sub-bagian mana yang aktif
  let activeSlug = SECTION_SLUG_MAP[currentSection] || currentSection;
  if (currentSection === 'portofolio') {
    let activeSubId = null;
    portfolioSubSections.forEach(el => {
      const top = el.getBoundingClientRect().top + window.scrollY - 160;
      if (window.scrollY >= top) {
        activeSubId = el.id;
      }
    });
    if (activeSubId && SECTION_SLUG_MAP[activeSubId]) {
      activeSlug = SECTION_SLUG_MAP[activeSubId];
    }
  }

  updateUrlSlug(activeSlug);

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentSection}`;
    link.classList.toggle('active', isActive);
  });
};

const onScroll = () => {
  header?.classList.toggle('scrolled', window.scrollY > 18);
  if (navLinks.some((link) => link.getAttribute('href')?.startsWith('#'))) {
    setActiveLinkBySection();
  } else {
    setActiveLinkByPage();
  }
};

// Scroll ke section yang sesuai hash saat halaman pertama dibuka
const scrollToHashOnLoad = () => {
  const hash = window.location.hash.replace('#', '');
  if (!hash) {
    _slugFrozen = false; // tidak ada hash awal, langsung aktifkan
    return;
  }

  // Cari elemen berdasarkan slug atau id langsung
  const reverseMap = Object.fromEntries(
    Object.entries(SECTION_SLUG_MAP).map(([id, slug]) => [slug, id])
  );
  const targetId = reverseMap[hash] || hash;
  const target = document.getElementById(targetId);
  if (!target) {
    _slugFrozen = false;
    return;
  }

  // Simpan slug target agar URL tetap benar
  _lastSlug = hash;

  setTimeout(() => {
    const headerH = header ? header.offsetHeight : 72;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top, behavior: 'smooth' });

    // Aktifkan update URL lagi setelah animasi scroll selesai (~1.1 detik)
    setTimeout(() => { _slugFrozen = false; }, 1100);
  }, 150);
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', () => { onScroll(); scrollToHashOnLoad(); });
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

/* ─── Reusable AchievementCard Component ───────────────────────────────────── */
/**
 * Generates an Achievement Card HTML string or DOM node.
 * @param {Object} props
 * @param {string[]} props.images - Array of image URLs for the carousel (2 images per card)
 * @param {string} props.badge - Pill badge text floating at top left (e.g. "WEB DEVELOPER")
 * @param {string} props.category - Category text above title (e.g. "SERTIFIKASI")
 * @param {string} props.title - Achievement title
 * @param {string} props.description - Short description
 * @param {string} [props.certificateLink] - URL for "Lihat Sertifikat"
 * @param {string} [props.documentationLink] - URL for "Lihat Dokumentasi"
 * @param {string[]} props.tags - Array of tag strings
 * @returns {string} HTML string of the AchievementCard component
 */
function AchievementCard(props = {}) {
  const {
    images = [],
    badge = "",
    category = "",
    title = "",
    description = "",
    tags = []
  } = props;

  const imagesAttr = images.filter(Boolean).join("|");
  const fallbackImg = images[0] || "";
  const tagsHtml = tags.map((tag) => `<span>${tag}</span>`).join("");

  return `
    <article class="project-card reveal">
      <div class="project-media media-carousel" style="aspect-ratio:1920/912;" data-carousel data-images="${imagesAttr}">
        <img src="${fallbackImg}" alt="Prestasi - ${title}" loading="lazy" decoding="async">
        <span class="project-status">${badge}</span>
      </div>
      <div class="project-content" style="display:flex;flex-direction:column;">
        <div class="project-meta"><span>${category}</span></div>
        <h3>${title}</h3>
        <p style="flex:1;text-align:justify;text-justify:inter-word;">${description}</p>
        <div class="project-tags">
          ${tagsHtml}
        </div>
      </div>
    </article>
  `;
}

window.AchievementCard = AchievementCard;

/* ─── PORTFOLIO DOWNLOAD & PASSWORD GATE MODAL ───────────────────────── */
function togglePortfolioDownloads(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const wrapper = document.getElementById("portfolioDownloadWrapper");
  const btn = document.getElementById("experienceToggleBtn");
  if (!wrapper) return;

  const currentDisplay = window.getComputedStyle(wrapper).display;
  const isHidden = currentDisplay === "none" || wrapper.hasAttribute("hidden");

  if (isHidden) {
    wrapper.style.display = "block";
    wrapper.removeAttribute("hidden");
    if (btn) btn.classList.add("is-active");
  } else {
    wrapper.style.display = "none";
    wrapper.setAttribute("hidden", "");
    if (btn) btn.classList.remove("is-active");
  }
}

window.togglePortfolioDownloads = togglePortfolioDownloads;

var _globalSelectedVersion = null;

function closePasswordModal() {
  const pwdModalOverlay = document.getElementById("pwdModalOverlay");
  const pwdInput = document.getElementById("pwdInput");
  const pwdErrorMsg = document.getElementById("pwdErrorMsg");
  if (!pwdModalOverlay) return;
  pwdModalOverlay.setAttribute("hidden", "");
  pwdModalOverlay.setAttribute("aria-hidden", "true");
  if (pwdInput) pwdInput.value = "";
  if (pwdErrorMsg) {
    pwdErrorMsg.setAttribute("hidden", "");
    pwdErrorMsg.textContent = "";
  }
}

window.closePasswordModal = closePasswordModal;

function openPasswordModal(version) {
  _globalSelectedVersion = version;
  const pwdModalOverlay = document.getElementById("pwdModalOverlay");
  const pwdInput = document.getElementById("pwdInput");
  const pwdErrorMsg = document.getElementById("pwdErrorMsg");
  const pwdModalVersionName = document.getElementById("pwdModalVersionName");

  if (!pwdModalOverlay) return;

  if (pwdModalVersionName) {
    pwdModalVersionName.textContent = "";
  }

  pwdModalOverlay.removeAttribute("hidden");
  pwdModalOverlay.setAttribute("aria-hidden", "false");
  if (pwdInput) pwdInput.value = "";
  if (pwdErrorMsg) {
    pwdErrorMsg.setAttribute("hidden", "");
    pwdErrorMsg.textContent = "";
  }

  setTimeout(() => {
    if (pwdInput) pwdInput.focus();
  }, 100);
}

window.openPasswordModal = openPasswordModal;

function initPortfolioDownload() {
  const experienceToggleBtn = document.getElementById("experienceToggleBtn");
  const portfolioDownloadWrapper = document.getElementById("portfolioDownloadWrapper");
  const btnDownloadVersions = document.querySelectorAll(".btn-download-version");

  const pwdModalOverlay = document.getElementById("pwdModalOverlay");
  const pwdModalClose = document.getElementById("pwdModalClose");
  const pwdCancelBtn = document.getElementById("pwdCancelBtn");
  const pwdModalForm = document.getElementById("pwdModalForm");
  const pwdInput = document.getElementById("pwdInput");
  const pwdErrorMsg = document.getElementById("pwdErrorMsg");
  const pwdSubmitBtn = document.getElementById("pwdSubmitBtn");
  const pwdModalVersionName = document.getElementById("pwdModalVersionName");

  if (!pwdModalOverlay) return;

  let failedAttempts = 0;
  let lockoutTimer = null;
  let lockoutEndTime = 0;

  const TARGET_HASH = "5b4ed33ef2e71b0b80ebac6c2740a63641743d6a432a61b114d3ae59128afa9c";

  const _pdfMap = {
    webdev: { path: "downloads/7f2a9c-webdev-portfolio.pdf", label: "Web Developer" },
    desain: { path: "downloads/3d8e1b-desain-portfolio.pdf", label: "Desain Grafis" },
    umum: { path: "downloads/b91f4a-umum-portfolio.pdf", label: "Umum" }
  };

  if (experienceToggleBtn && portfolioDownloadWrapper) {
    experienceToggleBtn.addEventListener("click", togglePortfolioDownloads);
  }

  // Open modal when any version button is clicked
  btnDownloadVersions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const version = btn.getAttribute("data-version");
      if (!_pdfMap[version]) return;
      openPasswordModal(version);
    });
  });

  function openModal() {
    pwdModalOverlay.removeAttribute("hidden");
    pwdModalOverlay.setAttribute("aria-hidden", "false");
    pwdInput.value = "";
    hideError();

    // Check if lockout active
    const now = Date.now();
    if (now < lockoutEndTime) {
      startLockoutCountdown(Math.ceil((lockoutEndTime - now) / 1000));
    } else {
      enableInputs();
      setTimeout(() => pwdInput.focus(), 100);
    }
  }

  function closeModal() {
    pwdModalOverlay.setAttribute("hidden", "");
    pwdModalOverlay.setAttribute("aria-hidden", "true");
    pwdInput.value = "";
    hideError();
  }

  if (pwdModalClose) pwdModalClose.addEventListener("click", closeModal);
  if (pwdCancelBtn) pwdCancelBtn.addEventListener("click", closeModal);

  pwdModalOverlay.addEventListener("click", (e) => {
    if (e.target === pwdModalOverlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pwdModalOverlay.hasAttribute("hidden")) {
      closeModal();
    }
  });

  function showError(msg) {
    if (!pwdErrorMsg) return;
    pwdErrorMsg.textContent = msg;
    pwdErrorMsg.removeAttribute("hidden");
  }

  function hideError() {
    if (!pwdErrorMsg) return;
    pwdErrorMsg.setAttribute("hidden", "");
    pwdErrorMsg.textContent = "";
  }

  function disableInputs() {
    pwdInput.disabled = true;
    pwdSubmitBtn.disabled = true;
  }

  function enableInputs() {
    pwdInput.disabled = false;
    pwdSubmitBtn.disabled = false;
  }

  function startLockoutCountdown(remainingSeconds) {
    disableInputs();

    const updateMsg = (secs) => {
      showError(`Terlalu banyak percobaan, coba lagi sebentar lagi (${secs} detik)`);
    };

    updateMsg(remainingSeconds);

    if (lockoutTimer) clearInterval(lockoutTimer);

    let currentSecs = remainingSeconds;
    lockoutTimer = setInterval(() => {
      currentSecs--;
      if (currentSecs <= 0) {
        clearInterval(lockoutTimer);
        lockoutTimer = null;
        lockoutEndTime = 0;
        failedAttempts = 0;
        enableInputs();
        hideError();
        pwdInput.focus();
      } else {
        updateMsg(currentSecs);
      }
    }, 1000);
  }

  // SHA-256 Hashing with Web Crypto API
  async function hashSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Form Submit Handler
  if (pwdModalForm) {
    pwdModalForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const now = Date.now();
      if (now < lockoutEndTime) return;

      const inputVal = pwdInput.value.trim();
      if (!inputVal) {
        showError("Password tidak boleh kosong.");
        return;
      }

      try {
        const hashedVal = await hashSHA256(inputVal);

        if (hashedVal === TARGET_HASH) {
          // Success!
          failedAttempts = 0;

          // Trigger download
          const activeVersion = _globalSelectedVersion || "webdev";
          if (_pdfMap[activeVersion]) {
            const fileInfo = _pdfMap[activeVersion];
            const a = document.createElement("a");
            a.href = fileInfo.path;
            a.download = fileInfo.path.split("/").pop();
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
            }, 100);
          }

          closeModal();
        } else {
          // Failed attempt
          failedAttempts++;

          if (failedAttempts >= 5) {
            lockoutEndTime = Date.now() + 30000; // 30s lockout
            startLockoutCountdown(30);
          } else {
            showError(`Password salah! Percobaan tersisa: ${5 - failedAttempts}`);
            pwdInput.value = "";
            pwdInput.focus();
          }
        }
      } catch (err) {
        console.error("Crypto hashing error:", err);
        showError("Terjadi kesalahan saat memverifikasi password.");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioDownload);
} else {
  initPortfolioDownload();
}

/* ── PORTFOLIO FILTER TAB NAVIGATION ─────────────────────── */
function scrollToPortfolioSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const headerEl = document.querySelector('.site-header');
  const headerH = headerEl ? headerEl.offsetHeight : 72;
  const offset = 24; // extra breathing room
  const top = target.getBoundingClientRect().top + window.scrollY - headerH - offset;

  window.scrollTo({ top, behavior: 'smooth' });
  setActivePortfolioTab(sectionId);
}

function setActivePortfolioTab(sectionId) {
  const map = {
    'section-webdev': 'tab-webdev',
    'section-desain': 'tab-desain',
    'section-video':  'tab-video',
  };
  document.querySelectorAll('.pf-tab').forEach(btn => btn.classList.remove('pf-tab--active'));
  const activeId = map[sectionId];
  if (activeId) {
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) activeBtn.classList.add('pf-tab--active');
  }
}

// Update active tab automatically on scroll
(function () {
  const sectionIds = ['section-webdev', 'section-desain', 'section-video'];
  const tabObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActivePortfolioTab(entry.target.id);
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

  function initTabObserver() {
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) tabObserver.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabObserver);
  } else {
    initTabObserver();
  }
})();
/* ─────────────────────────────────────────────────────────── */
