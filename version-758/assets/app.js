(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initializeMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initializeBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function toggle() {
            if (window.scrollY > 420) {
                button.classList.add("is-visible");
            } else {
                button.classList.remove("is-visible");
            }
        }
        window.addEventListener("scroll", toggle, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        toggle();
    }

    function initializeFilters() {
        var search = document.querySelector("[data-filter-search]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var sort = document.querySelector("[data-sort-cards]");
        var container = document.querySelector("[data-card-container]");
        var empty = document.querySelector("[data-filter-empty]");
        if (!cards.length || (!search && !selects.length && !sort)) {
            return;
        }
        function cardText(card) {
            return normalize([
                card.dataset.title,
                card.dataset.category,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.textContent
            ].join(" "));
        }
        function applySort(items) {
            if (!sort || !container) {
                return items;
            }
            var mode = sort.value;
            if (mode === "default") {
                items.sort(function (a, b) {
                    return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
                });
            }
            if (mode === "rating") {
                items.sort(function (a, b) {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                });
            }
            if (mode === "views") {
                items.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            }
            if (mode === "year") {
                items.sort(function (a, b) {
                    return Number(normalize(b.dataset.year).match(/\d{4}/) || 0) - Number(normalize(a.dataset.year).match(/\d{4}/) || 0);
                });
            }
            items.forEach(function (item) {
                container.appendChild(item);
            });
            return items;
        }
        cards.forEach(function (card, index) {
            card.dataset.originalIndex = String(index);
        });
        function update() {
            var query = search ? normalize(search.value) : "";
            var visible = 0;
            var ordered = applySort(cards.slice());
            ordered.forEach(function (card) {
                var matched = !query || cardText(card).indexOf(query) !== -1;
                selects.forEach(function (select) {
                    var key = select.dataset.filterSelect;
                    var value = normalize(select.value);
                    if (value && normalize(card.dataset[key]).indexOf(value) === -1) {
                        matched = false;
                    }
                });
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (search) {
            search.addEventListener("input", update);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", update);
        });
        if (sort) {
            sort.addEventListener("change", update);
        }
        update();
    }

    ready(function () {
        initializeMenu();
        initializeBackTop();
        initializeFilters();
    });
}());

function initMoviePlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var attached = false;
    if (!video || !overlay || !streamUrl) {
        return;
    }
    function attach() {
        if (attached) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            attached = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            attached = true;
            return;
        }
        video.src = streamUrl;
        attached = true;
    }
    function start() {
        attach();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
