(function () {
    var HLS_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    var hlsLoaderPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = HLS_SCRIPT_URL;
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("播放器组件加载失败"));
            };
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function setStatus(shell, message) {
        var status = shell.querySelector("[data-video-status]");
        if (status) {
            status.textContent = message;
        }
    }

    function tryPlay(video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    function setupPlayer(shell) {
        var video = shell.querySelector("video[data-src]");
        var trigger = shell.querySelector("[data-play-trigger]");
        if (!video || !trigger) {
            return;
        }

        var source = video.dataset.src;
        var started = false;
        var hlsInstance = null;

        function startPlayer() {
            if (started) {
                tryPlay(video);
                return;
            }

            started = true;
            trigger.hidden = true;
            video.controls = true;
            setStatus(shell, "正在加载高清线路...");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setStatus(shell, "播放源已加载");
                tryPlay(video);
                return;
            }

            loadHlsScript().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        setStatus(shell, "播放源已加载");
                        tryPlay(video);
                    });
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus(shell, "网络波动，正在重连...");
                            hlsInstance.startLoad();
                            return;
                        }

                        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus(shell, "媒体解码恢复中...");
                            hlsInstance.recoverMediaError();
                            return;
                        }

                        setStatus(shell, "当前浏览器无法播放该线路");
                        hlsInstance.destroy();
                    });
                    return;
                }

                video.src = source;
                setStatus(shell, "已切换到浏览器原生播放");
                tryPlay(video);
            }).catch(function () {
                video.src = source;
                setStatus(shell, "已尝试使用浏览器原生播放");
                tryPlay(video);
            });
        }

        trigger.addEventListener("click", startPlayer);
        video.addEventListener("play", function () {
            trigger.hidden = true;
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                trigger.hidden = false;
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));
        players.forEach(setupPlayer);
    });
})();
