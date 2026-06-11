(function () {
  var header = document.querySelector('[data-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  });

  function applyFilters(scope) {
    var grid = document.querySelector(scope);
    if (!grid) {
      return;
    }
    var queryInput = document.querySelector('[data-search-input][data-filter-scope="' + scope + '"]');
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var activeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope="' + scope + '"].filter-chip.is-active'));
    var filters = {};

    activeButtons.forEach(function (button) {
      var key = button.getAttribute('data-filter-key');
      var value = button.getAttribute('data-filter-value') || '';
      if (key && value) {
        filters[key] = value;
      }
    });

    Array.prototype.slice.call(grid.querySelectorAll('[data-card]')).forEach(function (card) {
      var text = (card.getAttribute('data-title') || '').toLowerCase();
      var region = card.getAttribute('data-region') || '';
      var year = card.getAttribute('data-year') || '';
      var genre = card.getAttribute('data-genre') || '';
      var visible = true;

      if (query && text.indexOf(query) === -1) {
        visible = false;
      }
      if (filters.region && region !== filters.region) {
        visible = false;
      }
      if (filters.year && year !== filters.year) {
        visible = false;
      }
      if (filters.genre && genre.indexOf(filters.genre) === -1) {
        visible = false;
      }

      card.classList.toggle('is-hidden', !visible);
    });
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilters(input.getAttribute('data-filter-scope'));
    });
  });

  document.querySelectorAll('.filter-chip[data-filter-scope]').forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-filter-key');
      var scope = button.getAttribute('data-filter-scope');
      var group = Array.prototype.slice.call(document.querySelectorAll('.filter-chip[data-filter-key="' + key + '"][data-filter-scope="' + scope + '"]'));
      group.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      applyFilters(scope);
    });
  });
})();
