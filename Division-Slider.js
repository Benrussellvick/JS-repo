window._rlc.rlCustomJS(function () {
  // YOUR CODE HERE

  jQuery(".rlc-category_carousel").on("CAROUSEL_READY", function () {
    jQuery(".rlc-ds-link").click(function (event) {
      event.preventDefault();
      var $href = jQuery(jQuery(this).attr("href"));
      if ($href.is(".rlc-ds-active")) return;
      var $activeSiblings = $href.siblings(".rlc-ds-active");
      if ($activeSiblings.length > 0) {
        $activeSiblings.removeClass("rlc-ds-active").addClass("rlc-ds-hide");
        $href.addClass("rlc-ds-active").removeClass("rlc-ds-hide");
      } else {
        $href.addClass("rlc-ds-active").removeClass("rlc-ds-hide");
      }

      var $button = jQuery(this);
      if ($button.is(".rlc-ds-b-active")) return;
      var $activeButtonSiblings = $button.siblings(".rlc-ds-b-active");
      if ($activeButtonSiblings.length > 0) {
        $activeButtonSiblings.removeClass("rlc-ds-b-active");
        $button.addClass("rlc-ds-b-active");
      } else {
        $button.addClass("rlc-ds-b-active");
      }
    });
  });

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      // -- used to set initial division --
      if (typeof initialDivision === "undefined" || initialDivision === null) {
        initialDivision = 0;
      }
      var divSliderNav = document.getElementById("rlc-division-slider-nav");
      var divSliderNavLinks = divSliderNav.querySelectorAll(".rlc-links .rlc-linecta");
      divSliderNavLinks[initialDivision].classList.add("rlc-ds-b-active");

      var divSlider = document.getElementById("rlc-division-slider");
      var divSliderCarousels = divSlider.querySelectorAll(".rlc-carousel.rlc-category_carousel");
      divSliderCarousels[initialDivision].classList.remove("rlc-ds-hide");
      divSliderCarousels[initialDivision].classList.add("rlc-ds-active");

      // -- used to remove specific slide --
      // if( typeof divisionSlideToRemove === 'number') {
      // 	jQuery('.rlc-category_carousel').on('CAROUSEL_READY', function() {
      // 		var thisSwiper = this.swiper;
      // 		thisSwiper.removeSlide(divisionSlideToRemove);
      // 		thisSwiper.update();
      // 	})
      // };
    },
    false
  );

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      // -- used to set initial division --
      if (typeof initialDivision === "undefined" || initialDivision === null) {
        initialDivision = 0;
      }
      var divSliderNav2 = document.getElementById("rlc-division-slider-nav-2");
      var divSliderNavLinks2 = divSliderNav2.querySelectorAll(".rlc-links .rlc-linecta");
      divSliderNavLinks2[initialDivision].classList.add("rlc-ds-b-active");

      var divSlider2 = document.getElementById("rlc-division-slider-2");
      var divSliderCarousels2 = divSlider.querySelectorAll(".rlc-carousel.rlc-category_carousel");
      divSliderCarousels2[initialDivision].classList.remove("rlc-ds-hide");
      divSliderCarousels2[initialDivision].classList.add("rlc-ds-active");
    },
    false
  );

  initialDivision = 0;
});
