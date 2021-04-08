window._rlc.rlCustomJS(function () {
  var isDesktop = window.matchMedia("(min-width: 768px)");

  // FULLSCREEN VIDEO
  function goFSVideo(vid) {
    var theVid = vid;
    if (
      !document.fullscreenElement && // alternative standard method
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      // current working methods
      if (theVid.requestFullscreen) {
        theVid.requestFullscreen();
      } else if (theVid.msRequestFullscreen) {
        theVid.msRequestFullscreen();
      } else if (theVid.mozRequestFullScreen) {
        theVid.mozRequestFullScreen();
      } else if (theVid.webkitRequestFullscreen) {
        theVid.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    }
    theVid.play();
    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);
    document.addEventListener("MSFullscreenChange", exitHandler);
    theVid.addEventListener("webkitendfullscreen", exitHandler);

    function exitHandler() {
      if (
        !document.fullscreenElement &&
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        killFS(theVid);
      }
    }
  }
  function killFS(vid) {
    // Exits fullscreen
    if (vid.exitFullscreen) {
      vid.exitFullscreen();
    } else if (vid.webkitExitFullscreen) {
      vid.webkitExitFullscreen();
    } else if (vid.mozCancelFullScreen) {
      vid.mozCancelFullScreen();
    } else if (vid.msExitFullscreen) {
      vid.msExitFullscreen();
    }
    if (rlcVidContainer.querySelector("video")) {
      rlcVidContainer.classList.remove("playing");
      rlcVidContainer.classList.remove("paused");
      rlcVid.pause();
      rlcVid.removeAttribute("src"); // empty source
      rlcVid.load();
      rlcVid.innerHTML = "";
      rlcVid.remove();
      fVid = null;
    }
    //introVidLoop.play();
  }
  var introVidBlock = document.getElementById("rlc-ppvidblock"),
    introVidLoop = introVidBlock.getElementsByTagName("video")[0],
    introVidButton = document.getElementById("rlc-playintrofull"),
    rlcVidContainer = null,
    fVid = null;
  function drawVid(el) {
    if (rlcVidContainer.querySelector("video")) {
      rlcVidContainer.classList.remove("playing");
      rlcVidContainer.classList.removeClass("paused");
      rlcVid.innerHTML = "";
      rlcVid.remove();
    }

    var vidSrc = el.dataset.desktopvid;

    if (!isDesktop.matches) {
      vidSrc = el.dataset.mobilevid;
    }
    let videoElement = document.createElement("video");
    videoElement.textContent = "Your browser does not support the video tag.";
    let videoSrc = document.createElement("source");
    videoSrc.setAttribute("src", vidSrc);
    videoSrc.setAttribute("type", "video/mp4");
    videoElement.appendChild(videoSrc);

    rlcVidContainer.insertBefore(videoElement, undefined);
    rlcVid = videoElement;

    fVid = rlcVid;
    return false;
  }

  introVidButton.onclick = function (event) {
    event.preventDefault();
    rlcVidContainer = document.getElementById("rlc-ppvidfull");
    drawVid(introVidButton);
    //introVidLoop.pause();
    setTimeout(function () {
      goFSVideo(fVid);
    }, 750);
    return false;
  };

  return;
});
