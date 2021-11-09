// rlc-sticky-sub-nav
window._rlc.rlCustomJS(function () {
  // find_height.js
  const $topBanner = document.querySelector(".top-banner"),
    $navbar = document.querySelector(".rlc-top-position");
  let top_trigger = 0;

  function setNavPosition() {
    if ($topBanner && $navbar) {
      $navbar.style.top = $topBanner.offsetHeight + "px";

      top_trigger = $topBanner.offsetHeight + $navbar.offsetHeight + 5;
    }
  }

  setNavPosition();
  window.onresize = setNavPosition;

  // dropdown.js
  const $ddButton = document.getElementById("rlc-dd-click");

  $ddButton.onclick = function () {
    $ddButton.classList.toggle("rlc-dd-active");
  };

  // Activate Current Nav element
  const $nav_dds = document.querySelectorAll(".rlc-nav-dd");
  const $nav_ctas = document.querySelectorAll(".rlc-nav_cta");
  const $nav_triggers = document.querySelectorAll("[data-nav_target]");

  if ($nav_ctas) {
    $nav_ctas.forEach(function ($nav_cta) {
      $nav_cta.onclick = function () {
        console.log("this", this);
        removeNavActiveState();
        this.classList.toggle("rlc-dd-active");
      };
    });
  }

  function handleNavTrigger($elm) {
    if ($elm.dataset) {
      let $nav_target = document.getElementById($elm.dataset.nav_target);
      let $nav_target_dd = document.getElementById($elm.dataset.nav_target + "-dd");

      if ($nav_target) {
        removeNavActiveState();

        $nav_target.classList.add("rlc-nav_cta-active");

        if ($nav_target_dd) {
          $nav_target_dd.classList.add("rlc-active-dd");
        }
      }
    }
  }

  function removeNavActiveState() {
    $nav_ctas.forEach(function ($nav_cta) {
      $nav_cta.classList.remove("rlc-nav_cta-active");
    });

    $nav_dds.forEach(function ($nav_dd) {
      $nav_dd.classList.remove("rlc-active-dd");
    });
  }

  // CHECK FOR CURRENT TRIGGER SECTION
  function isTriggerActive($elm) {
    let rect = $elm.getBoundingClientRect(),
      vHeight = window.innerHeight || doc.documentElement.clientHeight;
    if (rect.bottom < 0 || rect.top > vHeight) {
      return false;
    }

    if (rect.top <= top_trigger && rect.bottom > top_trigger) {
      return true;
    }
  }

  function checkIsActiveSection() {
    if ($nav_triggers) {
      $nav_triggers.forEach(function ($elm) {
        if (isTriggerActive($elm)) {
          handleNavTrigger($elm);
        }
      });
    }
  }

  const handler = function () {
    checkIsActiveSection(); // top of element is higher that bottom of nav but still on screen
  };

  let ticking = false;

  const scrollHandler = function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        handler();
        ticking = false;
      });

      ticking = true;
    }
  };

  function init() {
    // console.log("INVIEW INIT");
    if (document.readyState === "complete") {
      handler();
    }

    if (window.addEventListener) {
      addEventListener("DOMContentLoaded", handler, false);
      addEventListener("load", handler, false);
      addEventListener("scroll", scrollHandler, false);
      addEventListener("resize", handler, false);
      // isDesktop.addListener( handler );
    } else if (window.attachEvent) {
      attachEvent("onDOMContentLoaded", handler); // IE9+ :(
      attachEvent("onload", handler);
      attachEvent("onscroll", scrollHandler);
      attachEvent("onresize", handler);
    }

    handler();
  }

  init();
});
