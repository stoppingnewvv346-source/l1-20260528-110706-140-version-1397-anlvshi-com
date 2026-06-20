(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initImages() {
    qsa("img").forEach(function (img) {
      function markMissing() {
        var holder = img.closest(".poster-shell, .hero-visual, .detail-poster, .category-cover, .compact-thumb, .category-overview-media, .search-result-thumb");
        if (holder) {
          holder.classList.add("image-missing");
        }
      }
      img.addEventListener("error", markMissing, { once: true });
      if (img.complete && img.naturalWidth === 0) {
        markMissing();
      }
    });
  }

  function initMenu() {
    var button = qs("[data-menu-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSearch() {
    var toggle = qs("[data-search-toggle]");
    var panel = qs("[data-search-panel]");
    var input = qs("#siteSearchInput");
    var results = qs("#siteSearchResults");
    var index = window.SITE_SEARCH_INDEX || [];
    if (!toggle || !panel || !input || !results) {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = "<div class=\"search-result-item\"><div></div><span>没有找到相关内容</span></div>";
        results.classList.add("is-open");
        return;
      }
      results.innerHTML = items.map(function (item) {
        return "<a class=\"search-result-item\" href=\"" + escapeHtml(item.url) + "\">" +
          "<span class=\"search-result-thumb\" data-title=\"" + escapeHtml(item.title) + "\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\"></span>" +
          "<span><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.year) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.category) + "</span></span>" +
          "</a>";
      }).join("");
      initImages();
      results.classList.add("is-open");
    }

    function performSearch() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }
      var matched = index.filter(function (item) {
        var haystack = [item.title, item.desc, item.tags, item.category, item.year, item.type, item.region].join(" ").toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 12);
      render(matched);
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      if (panel.classList.contains("is-open")) {
        window.setTimeout(function () {
          input.focus();
        }, 50);
      }
    });

    input.addEventListener("input", performSearch);
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && !toggle.contains(event.target)) {
        results.classList.remove("is-open");
      }
    });
  }

  function initHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa("[data-hero-dot]", slider);
    var prev = qs("[data-hero-prev]", slider);
    var next = qs("[data-hero-next]", slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function initFilters() {
    var bar = qs("[data-filter-bar]");
    var list = qs("[data-filter-list]");
    if (!bar || !list) {
      return;
    }
    var cards = qsa(".movie-card", list);
    var active = { all: "all" };

    function applyFilters() {
      cards.forEach(function (card) {
        var hidden = false;
        if (active.year && active.year !== card.getAttribute("data-year").replace(/\D/g, "").slice(0, 4)) {
          hidden = true;
        }
        if (active.type && active.type !== card.getAttribute("data-type")) {
          hidden = true;
        }
        card.classList.toggle("is-hidden", hidden);
      });
    }

    qsa(".filter-btn", bar).forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.getAttribute("data-filter-group");
        var value = button.getAttribute("data-filter-value");
        if (group === "all") {
          active = { all: "all" };
          qsa(".filter-btn", bar).forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
        } else {
          active.all = null;
          if (active[group] === value) {
            delete active[group];
            button.classList.remove("is-active");
          } else {
            active[group] = value;
            qsa(".filter-btn[data-filter-group='" + group + "']", bar).forEach(function (item) {
              item.classList.remove("is-active");
            });
            button.classList.add("is-active");
          }
          var allButton = qs(".filter-btn[data-filter-group='all']", bar);
          if (allButton) {
            allButton.classList.remove("is-active");
          }
        }
        applyFilters();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initImages();
    initMenu();
    initSearch();
    initHero();
    initFilters();
  });
})();
