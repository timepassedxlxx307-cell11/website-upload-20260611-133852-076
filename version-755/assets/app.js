(function () {
  function root() {
    return document.body.getAttribute("data-root") || "./";
  }

  function setupMenu() {
    var button = document.getElementById("menuToggle");
    var nav = document.getElementById("mobileNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupSearch(inputId, resultsId) {
    var input = document.getElementById(inputId);
    var box = document.getElementById(resultsId);
    if (!input || !box || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      if (query.length < 1) {
        box.classList.remove("open");
        box.innerHTML = "";
        return;
      }
      var hits = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.year).indexOf(query) !== -1;
      }).slice(0, 9);
      if (!hits.length) {
        box.innerHTML = '<div class="search-result-item"><div></div><div><strong>未找到匹配影片</strong><span>换个关键词继续搜索</span></div></div>';
        box.classList.add("open");
        return;
      }
      box.innerHTML = hits.map(function (item) {
        var link = root() + item.url;
        var cover = root() + item.cover;
        return '<a class="search-result-item" href="' + link + '"><img src="' + cover + '" alt="' + item.title + '"><div><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></div></a>';
      }).join("");
      box.classList.add("open");
    });
    document.addEventListener("click", function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove("open");
      }
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle("active", n === current);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("active", n === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-filter-keyword]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    function apply() {
      var keyword = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-year"));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (selectedRegion && normalize(card.getAttribute("data-region")).indexOf(selectedRegion) === -1) {
          ok = false;
        }
        if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    [input, region, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }
  }

  window.initPlayer = function (source) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    if (!video || !source) {
      return;
    }
    var attached = false;
    var playRequested = false;
    function tryPlay() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playRequested) {
            tryPlay();
          }
        });
      } else {
        video.src = source;
      }
    }
    function start() {
      playRequested = true;
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("hidden");
      }
      tryPlay();
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearch("siteSearchInput", "siteSearchResults");
    setupSearch("mobileSearchInput", "mobileSearchResults");
    setupHero();
    setupFilters();
  });
})();
