(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                var open = mobileMenu.hasAttribute("hidden");
                if (open) {
                    mobileMenu.removeAttribute("hidden");
                } else {
                    mobileMenu.setAttribute("hidden", "");
                }
                menuButton.setAttribute("aria-expanded", String(open));
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        panels.forEach(function (panel) {
            var scope = panel.closest("section") || document;
            var input = scope.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var reset = scope.querySelector("[data-filter-reset]");
            var empty = scope.querySelector("[data-filter-empty]");
            var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-card]"));

            function normalized(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var q = normalized(input ? input.value : "");
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute("data-filter-select")] = normalized(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalized([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var ok = !q || haystack.indexOf(q) !== -1;
                    Object.keys(filters).forEach(function (key) {
                        if (filters[key] && normalized(card.getAttribute("data-" + key)) !== filters[key]) {
                            ok = false;
                        }
                    });
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    apply();
                });
            }
            apply();
        });
    });
})();
