(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length > 1) {
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var grid = document.querySelector("[data-filter-grid]");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]")) : [];
    var input = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var clearButton = document.querySelector("[data-clear-filter]");
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = normalize(input ? input.value : "");
      var year = normalize(yearFilter ? yearFilter.value : "");
      var region = normalize(regionFilter ? regionFilter.value : "");
      var type = normalize(typeFilter ? typeFilter.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));

        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, yearFilter, regionFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (yearFilter) {
          yearFilter.value = "";
        }
        if (regionFilter) {
          regionFilter.value = "";
        }
        if (typeFilter) {
          typeFilter.value = "";
        }
        applyFilters();
      });
    }

    var heroSearch = document.querySelector("[data-hero-search]");
    var heroSearchLink = document.querySelector("[data-hero-search-link]");

    if (heroSearch && heroSearchLink) {
      function updateHeroSearch() {
        var value = heroSearch.value.trim();
        heroSearchLink.href = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      }

      heroSearch.addEventListener("input", updateHeroSearch);
      heroSearch.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          updateHeroSearch();
          window.location.href = heroSearchLink.href;
        }
      });
      updateHeroSearch();
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q");
      if (queryValue) {
        input.value = queryValue;
        applyFilters();
      }
    }

    var configNode = document.getElementById("video-config");
    var video = document.querySelector("[data-video-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButton = document.querySelector("[data-play-button]");
    var message = document.querySelector("[data-player-message]");
    var hlsInstance = null;

    function showPlayerMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add("is-visible");
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function readConfig() {
      if (!configNode) {
        return null;
      }

      try {
        return JSON.parse(configNode.textContent || "{}");
      } catch (error) {
        return null;
      }
    }

    function startPlayer() {
      var config = readConfig();

      if (!video || !config || !config.src) {
        return;
      }

      hideOverlay();

      if (hlsInstance || video.getAttribute("src")) {
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(config.src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showPlayerMessage("视频暂时无法播放，请稍后再试");
          }
        });
      } else {
        video.src = config.src;
        video.play().catch(function () {});
      }
    }

    if (video && configNode) {
      var config = readConfig();
      if (config && config.poster) {
        video.setAttribute("poster", config.poster);
      }

      if (playButton) {
        playButton.addEventListener("click", startPlayer);
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayer);
      }

      video.addEventListener("play", hideOverlay);
    }
  });
})();
