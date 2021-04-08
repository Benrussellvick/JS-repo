window._rlc.rlCustomJS(function () {
  function findHeight() {
    var topBanner = document.getElementsByClassName("top-banner")[0];
    var height = topBanner.offsetHeight;
    let topPosition = document.querySelectorAll(".rlc-top-position");
    for (let i = 0; i < topPosition.length; i++) {
      topPosition[i].style.top = height + "px";
    }
  }
  findHeight();
  window.onresize = findHeight;
});
