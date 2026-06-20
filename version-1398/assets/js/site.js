(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var forms = document.querySelectorAll('[data-search-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim().length === 0) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var applyFilter = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
        var matchedKeyword = keyword.length === 0 || haystack.indexOf(keyword) !== -1;
        var matchedYear = year.length === 0 || card.dataset.year === year;
        var matchedRegion = region.length === 0 || card.dataset.region === region;
        card.hidden = !(matchedKeyword && matchedYear && matchedRegion);
      });
    };
    ['input', 'change'].forEach(function (eventName) {
      if (keywordInput) keywordInput.addEventListener(eventName, applyFilter);
      if (yearSelect) yearSelect.addEventListener(eventName, applyFilter);
      if (regionSelect) regionSelect.addEventListener(eventName, applyFilter);
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) keywordInput.value = '';
        if (yearSelect) yearSelect.value = '';
        if (regionSelect) regionSelect.value = '';
        applyFilter();
      });
    }
  }

  var searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = document.querySelector('[data-search-page-input]');
    if (input) input.value = q;
    var render = function (keyword) {
      var text = keyword.trim().toLowerCase();
      var list = window.SEARCH_INDEX.filter(function (item) {
        if (!text) return true;
        return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase().indexOf(text) !== -1;
      }).slice(0, 120);
      if (list.length === 0) {
        searchRoot.innerHTML = '<div class="empty-state">没有找到匹配的影片。</div>';
        return;
      }
      searchRoot.innerHTML = '<div class="movie-grid three">' + list.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-wrap" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
          '<span class="play-badge">▶</span><span class="duration-badge">' + item.duration + '</span></a>' +
          '<div class="card-body"><a class="card-category" href="' + item.categoryUrl + '">' + item.category + '</a>' +
          '<h2><a href="' + item.url + '">' + item.title + '</a></h2>' +
          '<p>' + item.description + '</p>' +
          '<div class="card-meta"><span>' + item.region + '</span><span>' + item.year + '</span><span>' + item.genre + '</span></div></div></article>';
      }).join('') + '</div>';
    };
    render(q);
    var searchForm = document.querySelector('[data-search-page-form]');
    if (searchForm && input) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var keyword = input.value.trim();
        var url = keyword ? 'search.html?q=' + encodeURIComponent(keyword) : 'search.html';
        window.history.replaceState(null, '', url);
        render(keyword);
      });
    }
  }
})();
