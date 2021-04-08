window._rlc.rlCustomJS(function () {
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var el = document.querySelector("iframe.rlc-fullbleed");

  function preventGameScrollOnTouch(e) {
    e.preventDefault();
  }

  if (iOS && el) {
    el.addEventListener("touchstart", preventGameScrollOnTouch, false);
    el.addEventListener("touchend", preventGameScrollOnTouch, false);
    el.addEventListener("touchcancel", preventGameScrollOnTouch, false);
    el.addEventListener("touchleave", preventGameScrollOnTouch, false);
    el.addEventListener("touchmove", preventGameScrollOnTouch, false);
  }
});
