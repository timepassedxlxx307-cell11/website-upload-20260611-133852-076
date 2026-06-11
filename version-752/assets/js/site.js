
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initLocalSearch() {
    var input = document.querySelector('[data-local-search]');
    var grid = document.querySelector('[data-card-grid]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var count = document.querySelector('[data-result-count]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search-item]'));

    function searchableText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.category,
        card.textContent
      ].join(' '));
    }

    function updateCount() {
      if (!count) {
        return;
      }
      var visible = cards.filter(function (card) {
        return !card.classList.contains('is-hidden');
      }).length;
      count.textContent = '正在展示 ' + visible + ' 部影片';
    }

    function filter() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var matched = !query || searchableText(card).indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !matched);
      });
      updateCount();
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();
      if (mode === 'views') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      } else if (mode === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        });
      } else if (mode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', filter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortCards();
        filter();
      });
    }
    sortCards();
    filter();
  }

  function initSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initScrollPlayerButtons() {
    var buttons = document.querySelectorAll('[data-scroll-player]');
    var player = document.querySelector('[data-video-player]');
    buttons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initLocalSearch();
    initSearchForms();
    initScrollPlayerButtons();
  });
})();
