function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var shell = document.querySelector('[data-player-shell]');
  var button = document.getElementById('play-trigger');
  if (!video || !source) return;

  var loaded = false;
  var hls = null;

  function loadSource() {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    loadSource();
    if (shell) shell.classList.add('is-playing');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) start();
  });

  video.addEventListener('play', function () {
    if (shell) shell.classList.add('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
