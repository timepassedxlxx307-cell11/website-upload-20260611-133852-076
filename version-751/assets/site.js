(() => {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mainNav = document.querySelector('[data-main-nav]');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let activeIndex = 0;
        let timer = null;

        const showSlide = index => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, current) => {
                slide.classList.toggle('active', current === activeIndex);
            });
            dots.forEach((dot, current) => {
                dot.classList.toggle('active', current === activeIndex);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                showSlide(activeIndex - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(activeIndex + 1);
                start();
            });
        }

        showSlide(0);
        start();
    }

    const filterInput = document.querySelector('[data-filter-input]');
    const regionSelect = document.querySelector('[data-filter-region]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-title]'));

    const applyFilter = () => {
        const keyword = (filterInput?.value || '').trim().toLowerCase();
        const region = regionSelect?.value || '';
        const year = yearSelect?.value || '';

        cards.forEach(card => {
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesRegion = !region || (card.dataset.region || '').includes(region);
            const matchesYear = !year || card.dataset.year === year;
            card.classList.toggle('hidden-card', !(matchesKeyword && matchesRegion && matchesYear));
        });
    };

    [filterInput, regionSelect, yearSelect].forEach(control => {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });
})();
