(function () {
  function initPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-overlay");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    var attached = false;

    if (!video || !button || !stream) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function attachStream() {
      if (attached) {
        player.classList.add("is-ready");
        playVideo();
        return;
      }
      attached = true;
      player.classList.add("is-ready");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            attached = false;
            player.classList.remove("is-ready");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
      } else {
        video.src = stream;
        playVideo();
      }
    }

    button.addEventListener("click", attachStream);
    player.addEventListener("dblclick", attachStream);
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(initPlayer);
  });
})();
