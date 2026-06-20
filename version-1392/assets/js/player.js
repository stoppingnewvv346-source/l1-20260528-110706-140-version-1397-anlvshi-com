function initMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    if (!video || !overlay || !streamUrl) {
        return;
    }

    var loaded = false;
    var hls = null;

    function attach() {
        if (loaded) {
            return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.load();
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            return new Promise(function (resolve) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        hls = null;
                        video.src = streamUrl;
                        video.load();
                        resolve();
                    }
                });
            });
        }
        video.src = streamUrl;
        video.load();
        return Promise.resolve();
    }

    function play() {
        overlay.classList.add("is-loading");
        attach().then(function () {
            return video.play();
        }).then(function () {
            overlay.classList.remove("is-loading");
            overlay.classList.add("is-hidden");
        }).catch(function () {
            overlay.classList.remove("is-loading");
            overlay.classList.remove("is-hidden");
        });
    }

    overlay.addEventListener("click", play);
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            overlay.classList.remove("is-hidden");
        }
    });
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
