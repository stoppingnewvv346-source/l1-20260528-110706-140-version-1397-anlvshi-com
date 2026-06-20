(function () {
  "use strict";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var toggle = qs("[data-nav-toggle]");
    var panel = qs("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      document.body.classList.toggle("menu-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    var slides = qsa("[data-hero-slide]");
    var dots = qsa("[data-hero-dot]");

    if (slides.length < 2) {
      return;
    }

    var activeIndex = 0;
    var timer = null;

    function showSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("active", index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("active", index === activeIndex);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    start();
  }

  function initCardSearch() {
    qsa("[data-card-search]").forEach(function (input) {
      var target = input.getAttribute("data-card-search");
      var cards = qsa('[data-card-list="' + target + '"] [data-card]');

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-card") || "").toLowerCase();
          card.style.display = haystack.indexOf(query) === -1 ? "none" : "";
        });
      });
    });
  }

  function initFilterChips() {
    qsa("[data-filter-group]").forEach(function (group) {
      var listName = group.getAttribute("data-filter-group");
      var cards = qsa('[data-card-list="' + listName + '"] [data-card]');
      var chips = qsa("[data-filter-value]", group);

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var value = chip.getAttribute("data-filter-value");
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          cards.forEach(function (card) {
            var cardValue = card.getAttribute("data-filter") || "";
            card.style.display = value === "all" || cardValue === value ? "" : "none";
          });
        });
      });
    });
  }

  function initSearchPage() {
    var results = qs("[data-search-results]");
    var form = qs("[data-search-form]");
    var input = qs("[data-search-input]");

    if (!results || !window.SEARCH_INDEX) {
      return;
    }

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matched = [];

      if (normalized) {
        matched = window.SEARCH_INDEX.filter(function (item) {
          return item.text.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 240);
      }

      if (!normalized) {
        results.innerHTML = '<div class="empty-state panel">请输入片名、地区、年份、类型或标签进行搜索。</div>';
        return;
      }

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state panel">没有找到相关影片，请换一个关键词。</div>';
        return;
      }

      results.innerHTML = '<div class="grid card-grid-four">' + matched.map(function (item) {
        return [
          '<a class="movie-card" href="' + escapeHtml(item.file) + '">',
          '  <div class="poster">',
          '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="badge">' + escapeHtml(item.type) + '</span>',
          '  </div>',
          '  <div class="card-body">',
          '    <h3 class="movie-title">' + escapeHtml(item.title) + '</h3>',
          '    <p class="movie-line">' + escapeHtml(item.line) + '</p>',
          '    <div class="card-meta">',
          '      <span class="badge meta-pill">' + escapeHtml(item.region) + '</span>',
          '      <span>' + escapeHtml(item.year) + '</span>',
          '    </div>',
          '  </div>',
          '</a>'
        ].join('');
      }).join('') + '</div>';
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    render(initialQuery);

    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = new URL(window.location.href);
        if (query) {
          url.searchParams.set("q", query);
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url.toString());
        render(query);
      });
    }
  }

  function initPlayers() {
    qsa("[data-video-src]").forEach(function (wrap) {
      var video = qs("video", wrap);
      var overlay = qs(".player-overlay", wrap);
      var status = qs(".player-status", wrap);
      var src = wrap.getAttribute("data-video-src");
      var hlsInstance = null;
      var attached = false;

      if (!video || !src) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        setStatus("正在载入播放源");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
              return;
            }
            setStatus("播放源加载失败，可刷新重试");
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          });
        } else {
          setStatus("当前浏览器不支持 HLS 播放");
        }
      }

      function playVideo() {
        attachSource();
        var result = video.play();
        if (result && typeof result.then === "function") {
          result.then(function () {
            if (overlay) {
              overlay.classList.add("hidden");
            }
            setStatus("正在播放");
          }).catch(function () {
            video.controls = true;
            setStatus("请使用播放器控件开始播放");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
        setStatus("正在播放");
      });

      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initCardSearch();
    initFilterChips();
    initSearchPage();
    initPlayers();
  });
})();
