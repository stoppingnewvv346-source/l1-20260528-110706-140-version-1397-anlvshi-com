(function () {
  const ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  };

  ready(function () {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
    }

    const slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      const slides = Array.from(slider.querySelectorAll(".hero-slide"));
      const dots = Array.from(slider.querySelectorAll(".hero-dot"));
      let active = 0;

      const show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    }

    document.querySelectorAll(".global-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const target = form.getAttribute("data-target") || form.getAttribute("action") || "library.html";
        const value = input ? input.value.trim() : "";
        window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
      });
    });

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    const searchInput = document.querySelector(".site-search");
    const categoryFilter = document.querySelector(".category-filter");
    const yearFilter = document.querySelector(".year-filter");
    const typeFilter = document.querySelector(".type-filter");
    const cards = Array.from(document.querySelectorAll(".filter-grid .movie-card"));

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    const normalize = function (value) {
      return (value || "").toString().toLowerCase().trim();
    };

    const filterCards = function () {
      const query = normalize(searchInput ? searchInput.value : "");
      const category = normalize(categoryFilter ? categoryFilter.value : "");
      const year = normalize(yearFilter ? yearFilter.value : "");
      const type = normalize(typeFilter ? typeFilter.value : "");

      cards.forEach(function (card) {
        const text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        const sameCategory = !category || normalize(card.getAttribute("data-category")) === category;
        const sameYear = !year || normalize(card.getAttribute("data-year")) === year;
        const sameType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
        const sameQuery = !query || text.indexOf(query) !== -1;
        card.classList.toggle("hidden", !(sameCategory && sameYear && sameType && sameQuery));
      });
    };

    [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    if (cards.length) {
      filterCards();
    }
  });
})();
