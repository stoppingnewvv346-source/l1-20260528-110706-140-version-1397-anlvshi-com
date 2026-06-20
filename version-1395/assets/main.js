(function () {
    function getBasePrefix() {
        return document.body ? document.body.dataset.basePrefix || "" : "";
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }

        var currentIndex = 0;
        var timer = null;

        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentIndex);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.dataset.heroDot || 0));
                startTimer();
            });
        });

        startTimer();
    }

    function initHeaderSearch() {
        var input = document.querySelector("[data-site-search]");
        var results = document.querySelector("[data-search-results]");
        var index = window.SITE_SEARCH_INDEX || [];
        if (!input || !results || !index.length) {
            return;
        }

        var basePrefix = getBasePrefix();

        function closeResults() {
            results.classList.remove("is-open");
            results.innerHTML = "";
        }

        input.addEventListener("input", function () {
            var query = normalizeText(input.value);
            if (!query) {
                closeResults();
                return;
            }

            var matched = index.filter(function (item) {
                return normalizeText(item.searchText).indexOf(query) !== -1;
            }).slice(0, 6);

            if (!matched.length) {
                results.innerHTML = '<div class="header-result-item"><div><strong>暂无结果</strong><small>换一个关键词试试</small></div></div>';
                results.classList.add("is-open");
                return;
            }

            results.innerHTML = matched.map(function (item) {
                return [
                    '<a class="header-result-item" href="' + basePrefix + item.url + '">',
                    '<div>',
                    '<strong>' + escapeHtml(item.title) + '</strong>',
                    '<small>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</small>',
                    '</div>',
                    '</a>'
                ].join("");
            }).join("");
            results.classList.add("is-open");
        });

        document.addEventListener("click", function (event) {
            if (!input.contains(event.target) && !results.contains(event.target)) {
                closeResults();
            }
        });
    }

    function initSearchPage() {
        var input = document.getElementById("search-page-input");
        var results = document.querySelector("[data-search-page-results]");
        var summary = document.querySelector("[data-search-summary]");
        var index = window.SITE_SEARCH_INDEX || [];
        if (!input || !results || !index.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var basePrefix = getBasePrefix();
        input.value = initialQuery;

        function render(query) {
            var cleanQuery = normalizeText(query);
            if (!cleanQuery) {
                summary.textContent = "热门推荐";
                return;
            }

            var matched = index.filter(function (item) {
                return normalizeText(item.searchText).indexOf(cleanQuery) !== -1;
            }).slice(0, 120);

            summary.textContent = "搜索结果：" + matched.length + " 条";
            if (!matched.length) {
                results.innerHTML = '<div class="text-panel"><h2>暂无匹配内容</h2><p>可以尝试输入片名、年份、地区、类型或标签。</p></div>';
                return;
            }

            results.innerHTML = matched.map(function (item) {
                return [
                    '<article class="movie-card">',
                    '<a class="cover-frame" href="' + basePrefix + item.url + '">',
                    '<img src="' + basePrefix + item.cover + '" alt="' + escapeHtml(item.title) + '" class="cover-image" loading="lazy">',
                    '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
                    '<span class="score-badge">' + escapeHtml(item.rating) + '</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<div class="movie-card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
                    '<h3><a href="' + basePrefix + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
                    '<p class="movie-card-desc">' + escapeHtml(item.oneLine) + '</p>',
                    '<div class="movie-card-bottom"><a href="' + basePrefix + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.views) + ' 次浏览</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }

        render(initialQuery);

        input.addEventListener("input", function () {
            render(input.value);
        });
    }

    function initFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var container = bar.nextElementSibling;
            if (!container) {
                return;
            }

            var search = bar.querySelector("[data-filter-search]");
            var year = bar.querySelector("[data-filter-year]");
            var sort = bar.querySelector("[data-filter-sort]");
            var count = bar.querySelector("[data-filter-count]");

            function getItems() {
                return Array.prototype.slice.call(container.children);
            }

            function passesYear(item, value) {
                if (!value) {
                    return true;
                }
                var itemYear = Number(item.dataset.year || 0);
                var requestedYear = Number(value);
                if (requestedYear === 2000 || requestedYear === 2010) {
                    return itemYear >= requestedYear;
                }
                return itemYear === requestedYear;
            }

            function applyFilters() {
                var query = normalizeText(search ? search.value : "");
                var yearValue = year ? year.value : "";
                var sortValue = sort ? sort.value : "score";
                var items = getItems();

                items.forEach(function (item) {
                    var keywords = normalizeText(item.dataset.keywords || item.textContent);
                    var visible = (!query || keywords.indexOf(query) !== -1) && passesYear(item, yearValue);
                    item.classList.toggle("is-hidden", !visible);
                });

                var visibleItems = items.filter(function (item) {
                    return !item.classList.contains("is-hidden");
                });

                visibleItems.sort(function (a, b) {
                    if (sortValue === "title") {
                        return a.textContent.trim().localeCompare(b.textContent.trim(), "zh-Hans-CN");
                    }
                    if (sortValue === "year") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    if (sortValue === "views") {
                        return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                    }
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                });

                visibleItems.forEach(function (item) {
                    container.appendChild(item);
                });

                if (count) {
                    count.textContent = "显示 " + visibleItems.length + " 条";
                }
            }

            [search, year, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initHeroSlider();
        initHeaderSearch();
        initSearchPage();
        initFilters();
    });
})();
