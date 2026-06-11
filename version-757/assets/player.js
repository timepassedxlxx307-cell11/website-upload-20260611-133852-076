(function () {
    var video = document.getElementById('mainVideo');
    var layer = document.getElementById('playLayer');
    var shell = document.getElementById('playerShell');

    if (!video) {
        return;
    }

    var playlist = video.getAttribute('data-playlist');
    var ready = false;
    var hlsInstance = null;
    var loadingHls = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (loadingHls) {
            return loadingHls;
        }

        loadingHls = new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[data-hls-loader]');

            if (existing) {
                existing.addEventListener('load', function () {
                    resolve(window.Hls);
                });
                existing.addEventListener('error', reject);
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
            script.async = true;
            script.setAttribute('data-hls-loader', 'true');
            script.addEventListener('load', function () {
                resolve(window.Hls);
            });
            script.addEventListener('error', reject);
            document.head.appendChild(script);
        });

        return loadingHls;
    }

    function attach() {
        if (!playlist || ready) {
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playlist;
            ready = true;
            return Promise.resolve();
        }

        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(playlist);
                hlsInstance.attachMedia(video);
                ready = true;
                return;
            }

            video.src = playlist;
            ready = true;
        }).catch(function () {
            video.src = playlist;
            ready = true;
        });
    }

    function begin() {
        attach().then(function () {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }

            if (layer) {
                layer.classList.add('is-hidden');
            }
        });
    }

    if (layer) {
        layer.addEventListener('click', function (event) {
            event.preventDefault();
            begin();
        });
    }

    if (shell) {
        shell.addEventListener('click', function (event) {
            if (event.target === shell) {
                begin();
            }
        });
    }

    video.addEventListener('play', function () {
        if (layer) {
            layer.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (layer && video.currentTime === 0) {
            layer.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
