import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('.player-frame'));

players.forEach(frame => {
    const video = frame.querySelector('video[data-src]');
    const overlay = frame.querySelector('[data-play-overlay]');

    if (!video || !overlay) {
        return;
    }

    const source = video.dataset.src;
    let initialized = false;
    let hls = null;

    const initialize = () => {
        if (initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal && hls) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                    }
                }
            });
        }
    };

    const play = () => {
        initialize();
        overlay.hidden = true;
        video.controls = true;
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                overlay.hidden = false;
            });
        }
    };

    overlay.addEventListener('click', play);
    video.addEventListener('click', () => {
        if (video.paused) {
            play();
        }
    });
});
