(function () {
  const bind = function (videoId, coverId, sourceUrl) {
    const video = document.getElementById(videoId);
    const cover = document.getElementById(coverId);
    let hls = null;
    let loaded = false;

    if (!video || !sourceUrl) {
      return;
    }

    const hideCover = function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    };

    const attach = function () {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    };

    const play = function () {
      attach();
      hideCover();
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      }
    });

    video.addEventListener("play", hideCover);

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  window.MoviePlayer = {
    bind: bind
  };
})();
