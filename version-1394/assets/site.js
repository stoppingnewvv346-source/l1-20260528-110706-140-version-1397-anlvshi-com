(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    restart();
  }

  function searchableText(item) {
    return [
      item.getAttribute('data-title'),
      item.getAttribute('data-genre'),
      item.getAttribute('data-region'),
      item.getAttribute('data-year'),
      item.getAttribute('data-type')
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
    forms.forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var list = document.querySelector('[data-search-list]');
      if (!input || !list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      function apply() {
        var term = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          item.classList.toggle('is-hidden', term && searchableText(item).indexOf(term) === -1);
        });
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
        apply();
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.player-cover');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-stream');
      var started = false;
      var hls;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function start() {
        if (started) {
          playVideo();
          return;
        }
        started = true;
        box.classList.add('is-playing');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = source;
          video.load();
          playVideo();
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
