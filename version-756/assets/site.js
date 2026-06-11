(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-target')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var filterGrid = document.querySelector('[data-filter-grid]');

    if (filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var searchInput = document.querySelector('[data-search-input]');
        var typeFilter = document.querySelector('[data-filter-type]');
        var yearFilter = document.querySelector('[data-filter-year]');
        var categoryFilter = document.querySelector('[data-filter-category]');
        var emptyBox = document.querySelector('[data-filter-empty]');

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function filterCards() {
            var query = valueOf(searchInput);
            var typeValue = valueOf(typeFilter);
            var yearValue = valueOf(yearFilter);
            var categoryValue = valueOf(categoryFilter);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();
                var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                var cardYear = Number(card.getAttribute('data-year')) || 0;
                var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }

                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }

                if (yearValue && cardYear < Number(yearValue)) {
                    matched = false;
                }

                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyBox) {
                emptyBox.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filterCards);
                element.addEventListener('change', filterCards);
            }
        });
    }

    function initializePlayer(stage) {
        var video = stage.querySelector('video');
        var button = stage.querySelector('.play-overlay');
        var loaded = false;
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function loadAndPlay() {
            var streamUrl = video.getAttribute('data-stream');

            if (!loaded && streamUrl) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                loaded = true;
            }

            stage.classList.add('is-playing');
            video.controls = true;

            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                loadAndPlay();
            });
        }

        stage.addEventListener('click', function (event) {
            if (event.target === video && loaded) {
                return;
            }
            loadAndPlay();
        });

        video.addEventListener('play', function () {
            stage.classList.add('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
})();
