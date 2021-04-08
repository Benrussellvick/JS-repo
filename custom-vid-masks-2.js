window._rlc.rlCustomJS(function () {
  const maskBanner = document.getElementById("rlc-cloth-mask-pdp");
  const foreground = maskBanner.querySelector(".rlc-foreground");
  const vidContainer = maskBanner.querySelector(".rlc-videocontainer");
  // const textGroupArray = maskBanner.getElementsByClassName('rlc-textgroup');
  let isMobile = window.matchMedia("(max-width: 767px)");
  let textPlaying = false;

  function checkWidth() {
    if (isMobile.matches) {
      if (vidContainer.querySelector("video")) {
        videoTextFunction();
      } else {
        vidContainer.addEventListener("VIDEO_LOADED", function () {
          videoTextFunction();
        });
      }
    }
  }

  checkWidth();
  isMobile.addListener(checkWidth);

  function videoTextFunction() {
    let video = vidContainer.querySelector("video");

    function videoText() {
      if (textPlaying == false) {
        video.addEventListener("timeupdate", function (event) {
          textPlaying = true;
          if (video.currentTime < 2) {
            foreground.setAttribute("data-textshow", "1");
          } else if (video.currentTime > 2 && video.currentTime < 4) {
            foreground.setAttribute("data-textshow", "2");
          } else if (video.currentTime > 4) {
            foreground.setAttribute("data-textshow", "3");
          }
        });
      }

      textPlaying = true;
    }
    videoText();
  }
});
