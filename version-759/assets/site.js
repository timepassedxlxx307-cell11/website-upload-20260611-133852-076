(function () {
  function ready(handler) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handler);
    } else {
      handler();
    }
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    activate(0);
    play();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var started = false;

      if (!video || !button || !stream) {
        return;
      }

      function bindStream() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        bindStream();
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      button.addEventListener("click", start);
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
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!form || !results || !window.movieSearchIndex) {
      return;
    }

    var input = document.getElementById("searchInput");
    var categoryFilter = document.getElementById("categoryFilter");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var sortFilter = document.getElementById("sortFilter");
    var params = new URLSearchParams(window.location.search);

    function uniqueValues(key) {
      var values = window.movieSearchIndex.map(function (movie) {
        return movie[key];
      }).filter(Boolean);
      return Array.from(new Set(values)).sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-Hans-CN");
      });
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>",
        "<span class=\"poster-play\">▶</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<div class=\"meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
        "<p>" + escapeHtml(movie.oneLine) + "</p>",
        "<div class=\"card-tags\">" + tags + "</div>",
        "<div class=\"card-bottom\"><span class=\"rating\">★ " + escapeHtml(movie.rating) + "</span><a href=\"category-" + movie.categorySlug + ".html\">" + escapeHtml(movie.categoryName) + "</a></div>",
        "</div>",
        "</article>"
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function applySearch() {
      var query = normalize(input ? input.value : "");
      var category = categoryFilter ? categoryFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var sort = sortFilter ? sortFilter.value : "score";
      var matches = window.movieSearchIndex.filter(function (movie) {
        var text = normalize([movie.title, movie.oneLine, movie.region, movie.type, movie.genre, movie.tags.join(" "), movie.categoryName].join(" "));
        var queryMatch = !query || text.indexOf(query) >= 0;
        var categoryMatch = !category || movie.categoryName === category;
        var typeMatch = !type || movie.type === type;
        var yearMatch = !year || movie.year === year;
        return queryMatch && categoryMatch && typeMatch && yearMatch;
      });

      matches.sort(function (a, b) {
        if (sort === "rating") {
          return Number(b.rating) - Number(a.rating);
        }
        if (sort === "views") {
          return Number(b.views) - Number(a.views);
        }
        if (sort === "year") {
          return String(b.year).localeCompare(String(a.year), "zh-Hans-CN");
        }
        return Number(b.score) - Number(a.score);
      });

      results.innerHTML = matches.slice(0, 80).map(card).join("");
      if (status) {
        status.textContent = matches.length ? "已展示匹配影片，继续调整条件可缩小范围。" : "暂未匹配到影片，换一个关键词再试。";
      }
    }

    fillSelect(categoryFilter, uniqueValues("categoryName"));
    fillSelect(typeFilter, uniqueValues("type"));
    fillSelect(yearFilter, uniqueValues("year"));

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    [input, categoryFilter, typeFilter, yearFilter, sortFilter].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applySearch);
        element.addEventListener("change", applySearch);
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applySearch();
    });

    applySearch();
  }

  function setupBackToTop() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.textContent = "↑";
    button.setAttribute("aria-label", "回到顶部");
    document.body.appendChild(button);
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", function () {
      button.classList.toggle("is-visible", window.scrollY > 420);
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupPlayers();
    setupSearchPage();
    setupBackToTop();
  });
})();