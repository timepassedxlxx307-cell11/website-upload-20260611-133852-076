
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer() {
    var shell = document.querySelector('[data-video-player]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-toggle]');
    var status = shell.querySelector('[data-player-status]');
    if (!video) {
      return;
    }
    var source = video.dataset.src || '';
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (!source) {
        setStatus('播放源暂不可用');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放加载异常，可刷新后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
        }, { once: true });
      } else {
        setStatus('当前浏览器不支持 HLS 播放');
      }
    }

    function play() {
      if (!video.src && !hlsInstance) {
        attachSource();
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          setStatus('点击播放器控件继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
      setStatus('播放结束');
    });
    video.addEventListener('error', function () {
      setStatus('播放加载异常，可刷新后重试');
    });

    attachSource();
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(initPlayer);
})();
