(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        const toggle = document.querySelector("[data-menu-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            const isOpen = panel.classList.toggle("is-open");
            toggle.classList.toggle("is-open", isOpen);
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const input = form.querySelector("input[name='q']");
                const value = input ? input.value.trim() : "";
                const action = form.getAttribute("action") || "./search.html";
                window.location.href = value ? action + "?q=" + encodeURIComponent(value) : action;
            });
        });
    }

    function setupHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        show(0);
        play();
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            const scope = panel.parentElement || document;
            const textInput = panel.querySelector("[data-filter-text]");
            const yearSelect = panel.querySelector("[data-filter-year]");
            const typeSelect = panel.querySelector("[data-filter-type]");
            const empty = scope.querySelector("[data-filter-empty]");
            const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-item"));
            const params = new URLSearchParams(window.location.search);
            const query = params.get("q");
            if (query && textInput) {
                textInput.value = query;
            }
            function apply() {
                const term = normalize(textInput && textInput.value);
                const year = normalize(yearSelect && yearSelect.value);
                const type = normalize(typeSelect && typeSelect.value);
                let visible = 0;
                cards.forEach(function (card) {
                    const fields = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].map(normalize).join(" ");
                    const matchesTerm = !term || fields.indexOf(term) !== -1;
                    const matchesYear = !year || normalize(card.dataset.year) === year;
                    const matchesType = !type || normalize(card.dataset.type) === type;
                    const show = matchesTerm && matchesYear && matchesType;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
