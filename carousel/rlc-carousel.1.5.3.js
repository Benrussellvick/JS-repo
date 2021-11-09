window._rlc.rlCustomJS(function () {
  function RL_Carousels() {
    // IE POLYFILLS
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
      Element.prototype.closest = function (s) {
        var $el = this;

        do {
          if ($el.matches(s)) return $el;
          $el = $el.parentElement || $el.parentNode;
        } while ($el !== null && $el.nodeType === 1);
        return null;
      };
    }

    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    if (!String.prototype.startsWith) {
      Object.defineProperty(String.prototype, "startsWith", {
        value: function (search, rawPos) {
          var pos = rawPos > 0 ? rawPos | 0 : 0;
          return this.substring(pos, pos + search.length) === search;
        },
      });
    }

    // POLYFILL - MULTIPLES IN CLASSLIST
    var dummy = document.createElement("div"),
      dtp = DOMTokenList.prototype,
      toggle = dtp.toggle,
      add = dtp.add,
      rem = dtp.remove;

    dummy.classList.add("class1", "class2");

    // Older versions of the HTMLElement.classList spec didn't allow multiple
    // arguments, easy to test for
    if (!dummy.classList.contains("class2")) {
      dtp.add = function () {
        Array.prototype.forEach.call(arguments, add.bind(this));
      };
      dtp.remove = function () {
        Array.prototype.forEach.call(arguments, rem.bind(this));
      };
    }

    // Older versions of the spec didn't have a forcedState argument for
    // `toggle` either, test by checking the return value after forcing
    if (!dummy.classList.toggle("class1", true)) {
      dtp.toggle = function (cls, forcedState) {
        if (forcedState === undefined) return toggle.call(this, cls);

        (forcedState ? add : rem).call(this, cls);
        return !!forcedState;
      };
    }

    // SETUP EVENTS
    if (typeof Event === "function") {
      window.ENTER_VIEWPORT = new Event("ENTER_VIEWPORT");
      window.LEAVE_VIEWPORT = new Event("LEAVE_VIEWPORT");
      window.CAROUSEL_READY = new Event("CAROUSEL_READY");
    } else {
      // IE
      window.ENTER_VIEWPORT = document.createEvent("Event");
      window.LEAVE_VIEWPORT = document.createEvent("Event");
      window.CAROUSEL_READY = document.createEvent("Event");

      window.ENTER_VIEWPORT.initEvent("ENTER_VIEWPORT", true, true);
      window.LEAVE_VIEWPORT.initEvent("LEAVE_VIEWPORT", true, true);
      window.CAROUSEL_READY.initEvent("CAROUSEL_READY", true, true);
    }

    // CAROUSELS
    const $carousels = document.querySelectorAll(".rlc-carousel");

    // console.log('GET CAROUSELS',$carousels);
    $carousels.forEach(function ($carousel) {
      // console.log('BUILD CAROUSEL',$carousel);
      // CHECK IF CAROUSEL ALREADY BUILT
      if (!$carousel.classList.contains("rlc-carousel--ready")) {
        buildCarousel($carousel);
      }
    });

    // BUILD CAROUSEL
    function buildCarousel($carousel) {
      // console.log('buildCarousel',$carousel)
      let config = getConfig($carousel);
      // addControls ( $carousel );
      // addADA ( $carousel );

      $carousel.classList.add("rlc-carousel-nointeraction");

      $carousel.dataset.currentslide = 1;
      $carousel.dataset.slidecount = $carousel.querySelectorAll(".rlc-slide").length;

      // ALLOW CUSTOM INITIALIZING OF SWIPER
      // if (config !== 'custom') {
      let $carouselElm = $carousel;
      // WRAPPER FOR CONTROL OF OVERFLOW TO SHOW OTHER SLIDES
      if ($carousel.querySelector(".rlc-carousel_wrapper")) {
        $carouselElm = $carousel.querySelector(".rlc-carousel_wrapper");
      }
      addControls($carouselElm, $carousel, config);
      addADA($carousel);

      let swiper = new Swiper($carouselElm, config);

      swiper.on("init", function () {
        // console.log("ACTIVE SLIDE", this.el.querySelector('.swiper-slide-active'));
        window._rlc.inView();

        if (needsLazyLoader) {
          window._rlc.lazyLoader();
        }

        let $activeSlide = this.el.querySelector(".swiper-slide-active");

        if ($activeSlide) {
          checkVisibility($carousel);
          // $activeSlide.classList.add('rlc-isvisible');
          // $activeSlide.dispatchEvent(ENTER_VIEWPORT);
          // jQuery($activeSlide).trigger('ENTER_VIEWPORT');

          $activeSlide.removeAttribute("aria-hidden");
          // console.log('INIT updateSlideADA');
          // updateSlideADA ($activeSlide);
          updateControlADA($activeSlide, $carousel);
        }
        // Re init quickshop
        document.dispatchEvent(
          new CustomEvent("addQuickShop", { detail: { checkProducts: false, type: "link" } })
        );
      });
      swiper.on("touchMove", function () {
        let $carousel = this.el;
        if (!$carousel.classList.contains("rlc-carousel")) {
          $carousel = this.el.closest(".rlc-carousel");
        }
        $carousel.classList.add("isDragging");
      });
      swiper.on("touchEnd", function () {
        let $carousel = this.el;
        if (!$carousel.classList.contains("rlc-carousel")) {
          $carousel = this.el.closest(".rlc-carousel");
        }
        $carousel.classList.remove("isDragging");
      });
      swiper.on("transitionStart", function () {
        let $carousel = this.el;
        if (!$carousel.classList.contains("rlc-carousel")) {
          $carousel = this.el.closest(".rlc-carousel");
        }
        $carousel.classList.add("inTransition");
      });
      swiper.on("slidePrevTransitionStart", function () {
        let $carousel = this.el;
        if (!$carousel.classList.contains("rlc-carousel")) {
          $carousel = this.el.closest(".rlc-carousel");
        }
        $carousel.classList.add("inTransitionPrev");
      });
      swiper.on("slidePrevTransitionEnd", function () {
        let $carousel = this.el;
        if (!$carousel.classList.contains("rlc-carousel")) {
          $carousel = this.el.closest(".rlc-carousel");
        }
        $carousel.classList.remove("inTransitionPrev");
      });
      swiper.on("transitionEnd", function () {
        // console.log("slideChange",this.previousIndex,this.realIndex, this.activeIndex, this.el);
        window._rlc.inView();
        let $carousel = this.el;
        if (!$carousel.classList.contains("rlc-carousel")) {
          $carousel = this.el.closest(".rlc-carousel");
        }
        $carousel.classList.remove("inTransition");

        if (this.previousIndex > 0 || $carousel.classList.contains("rlc-category_carousel")) {
          // use previousIndex because all other Index properties are wrong
          $carousel.classList.remove("rlc-carousel-nointeraction");
        }

        // console.log("ACTIVE SLIDE", this.el.querySelector('.swiper-slide-active'));
        let $activeSlide = this.el.querySelector(".swiper-slide-active");

        // GET ACTIVE SLIDE DATA INDEX BECAUSE SWIPER INDEX IS WRONG
        // console.log("$carousel",$carousel);
        if (this.previousIndex > 0) {
          // use previousIndex to stop swiper from breaking on load
          // console.log("CAROUSEL END",$carousel.dataset.currentslide,$carousel.dataset.slidecount);
          // ADD DATA ATTRIBUTE FOR CURRENT SLIDE
          $carousel.dataset.currentslide = parseInt($activeSlide.dataset.swiperSlideIndex) + 1;

          // ADD CLASS FOR LAST SLIDE - DO IT THIS WONKY WAY BECAUSE SWIPER INDEX IS WRONG
          if ($carousel.dataset.currentslide == $carousel.dataset.slidecount) {
            $carousel.classList.add("rlc-last_slide");
          } else {
            $carousel.classList.remove("rlc-last_slide");
          }
        }

        // FIRE EVENTS

        if ($activeSlide) {
          // console.log("IS ACTIVE SLIDE",$activeSlide);
          $activeSlide.classList.add("rlc-isvisible");

          // TODO: Change to inView code
          // for (var i = 0; i < $activeSlide.parentNode.children.length; i++) { // KILL IE NOW!!
          // 	let $sibling = $activeSlide.parentNode.children[i]; // KILL IE NOW!!
          // 	if ($sibling !== $activeSlide) {
          // 		console.log('DISPATCH LEAVE_VIEWPORT',$sibling,$activeSlide);
          // 		$sibling.classList.remove('rlc-isvisible');
          // 		$activeSlide.dispatchEvent(LEAVE_VIEWPORT);
          // 		jQuery($sibling).trigger('LEAVE_VIEWPORT');
          // 	}
          // }
          checkVisibility($carousel);

          // console.log('DISPATCH ENTER_VIEWPORT',$activeSlide);
          // $activeSlide.dispatchEvent(ENTER_VIEWPORT);
          // jQuery($activeSlide).trigger('ENTER_VIEWPORT');

          if (!$carousel.classList.contains("rlc-carousel-nointeraction")) {
            // console.log('TRANS END updateSlideADA');
            updateSlideADA($activeSlide, $carousel);
          }
        }

        // FIX LAZYLOAD OF NEXT SLIDE
        // let $nextSlide = this.el.querySelector('.swiper-slide-next');
        // if ($nextSlide) {
        // 	$nextSlide.dispatchEvent(ENTER_VIEWPORT);
        // 	jQuery($nextSlide).trigger('ENTER_VIEWPORT');
        // }

        // FIX LAZYLOAD OF PREV SLIDE
        // let $prevSlide = this.el.querySelector('.swiper-slide-prev');
        // if ($prevSlide) {
        // 	$prevSlide.dispatchEvent(ENTER_VIEWPORT);
        // 	jQuery($prevSlide).trigger('ENTER_VIEWPORT');
        // }
      });

      // ALLOW OVERRIDE OF INIT TO ADD CUSTOM EVENTS
      if (!config.customjs) {
        swiper.init();
      }

      $carousel.swiper = swiper;

      $carousel.classList.add("rlc-carousel--ready");
      $carousel.dispatchEvent(CAROUSEL_READY);

      // }
    }

    // handle resize
    function updateCarousels() {
      // console.log('updateCarousels');
      $carousels.forEach(function ($carousel) {
        let $carouselElm = $carousel;

        // WRAPPER FOR CONTROL OF OVERFLOW TO SHOW OTHER SLIDES
        if ($carousel.querySelector(".rlc-carousel_wrapper")) {
          $carouselElm = $carousel.querySelector(".rlc-carousel_wrapper");
        }
        if ($carouselElm.swiper) {
          // console.log('updateSize');
          $carouselElm.swiper.updateSize();
        }
      });
    }

    function addControls($carousel, $parent, config) {
      // console.log('addControls',config);
      if (config.navigation && !$carousel.querySelector(".swiper-button-next")) {
        // Add Left Arrow
        let $arrowLeft = document.createElement("button");
        $arrowLeft.classList.add(
          "rlc-carousel-arrow",
          "rlc-carousel-arrow-left",
          "swiper-button-prev"
        );
        $carousel.appendChild($arrowLeft);

        // Add Right Arrow
        let $arrowRight = document.createElement("button");
        $arrowRight.classList.add(
          "rlc-carousel-arrow",
          "rlc-carousel-arrow-right",
          "swiper-button-next"
        );
        $carousel.appendChild($arrowRight);
      }

      if (config.scrollbar && !$carousel.querySelector(".swiper-scrollbar")) {
        // Add Scrollbar
        let $scrollbar = document.createElement("div");
        $scrollbar.classList.add("rlc-carousel-scrollbar", "swiper-scrollbar");
        $carousel.appendChild($scrollbar);
      }

      if (config.pagination && !$carousel.querySelector(".swiper-pagination")) {
        // Add Pagination
        let $pagination = document.createElement("div");
        $pagination.classList.add("rlc-carousel-pagination", "swiper-pagination");
        $carousel.appendChild($pagination);
      }
    }

    function addADA($carousel) {
      if (
        $carousel.classList.contains("rlc-twovis") ||
        $carousel.classList.contains("rlc-blp-nav")
      ) {
        // console.log("CAT SLIDER");
        $carousel.setAttribute("role", "navigation");
        $carousel.setAttribute("aria-label", "category navigation");
        slideTitle = "item ";
      } else if ($carousel.attributes["aria-label"] && $carousel.attributes.role == "navigation") {
        // console.log("NAVIGATION");
        if (!$carousel.attributes["aria-label"]) {
          $carousel.setAttribute("aria-label", "navigation");
        }
        slideTitle = "item ";
      } else {
        // console.log("CAROUSEL");
        $carousel.setAttribute("role", "carousel");
        $carousel.setAttribute("aria-label", "carousel");
        slideTitle = "slide ";
      }

      if (!$carousel.classList.contains("rlc-three__m_carousel")) {
        let $slides = $carousel.querySelectorAll(".rlc-slide");
        let slideQty = $slides.length;
        $slides.forEach(function ($this, index) {
          $this.setAttribute("aria-hidden", "true");
        });
      }

      // Add live region
      let $liveregion = document.createElement("div");
      $liveregion.classList.add("rlc-liveregion", "rlc-visuallyhidden");
      $liveregion.setAttribute("aria-live", "polite");
      $liveregion.setAttribute("aria-atomic", "true");
      $carousel.appendChild($liveregion);
    }
    function updateSlideADA($activeSlide, $carousel) {
      // console.log('updateSlideADA $activeSlide',$activeSlide);
      // $activeSlide.setAttribute('tabindex','0');
      $activeSlide.removeAttribute("aria-hidden");

      for (var i = 0; i < $activeSlide.parentNode.children.length; i++) {
        // KILL IE NOW!!
        let $sibling = $activeSlide.parentNode.children[i]; // KILL IE NOW!!
        if ($sibling !== $activeSlide) {
          // console.log('NOT $activeSlide',$sibling);
          // $activeSlide.setAttribute('tabindex','-1');
          $sibling.removeAttribute("tabindex");
          $sibling.removeAttribute("aria-label");
          $sibling.setAttribute("aria-hidden", "true");
          // } else {
          // 	console.log('IS $activeSlide',$sibling);
        }
      }

      // DON'T ANNOUNCE ON INIT
      if (!$carousel.classList.contains("rlc-carousel-nointeraction")) {
        $carousel.querySelector(".rlc-liveregion").textContent =
          "Item " +
          (parseInt($activeSlide.dataset.swiperSlideIndex) + 1) +
          " of " +
          $carousel.dataset.slidecount;
      }

      $activeSlide.setAttribute("tabindex", "-1");
      $activeSlide.setAttribute(
        "aria-label",
        "Slide " + (parseInt($activeSlide.dataset.swiperSlideIndex) + 1) + " (Current)"
      );
      $activeSlide.focus();

      updateControlADA($activeSlide, $carousel);
    }

    function updateControlADA($activeSlide, $carousel) {
      let $pagination = $carousel.querySelector(".swiper-pagination");
      if ($pagination) {
        let $activeBullet = $pagination.querySelector(".swiper-pagination-bullet-active");
        $activeBullet.setAttribute(
          "aria-label",
          "Go to Slide " + (parseInt($activeSlide.dataset.swiperSlideIndex) + 1) + " (Current)"
        );

        for (var i = 0; i < $pagination.children.length; i++) {
          // KILL IE NOW!!
          let $sibling = $pagination.children[i]; // KILL IE NOW!!
          if ($sibling !== $activeBullet) {
            $sibling.setAttribute("aria-label", "Go to Slide " + (i + 1));
          }
        }
      }
    }

    function getConfig($carousel) {
      // expects format: data-config="'loop': true,'left':20"
      let config;
      if ($carousel.dataset.config && $carousel.dataset.config.length > 0) {
        // console.log("CUSTOM CAROUSEL");
        if ($carousel.dataset.config == "custom") {
          config = "custom";
        } else {
          config = JSON.parse("{" + $carousel.dataset.config.replace(/'/gi, '"') + "}");
          config.custom = true;
          config.init = false;
        }
      } else {
        if ($carousel.classList.contains("rlc-banner")) {
          config = {
            loop: true,
            // slidesPerView: 3,
            slidesPerView: "auto",
            centeredSlides: true,
            speed: 600,
            // breakpoints: {
            // 	767: {
            // 		slidesPerView: 2
            // 	}
            // },

            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },

            // Navigation arrows
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },

            mousewheel: {
              forceToAxis: true,
              sensitivity: 1,
            },

            init: false,
          };
        } else if ($carousel.classList.contains("rlc-featured_products")) {
          config = {
            loop: true,
            // slidesPerView: 2,
            // centeredSlides: true,
            speed: 600,
            breakpoints: {
              767: {
                slidesPerView: "auto",
                centeredSlides: true,
              },
            },

            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },

            // Navigation arrows
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },

            mousewheel: {
              forceToAxis: true,
              sensitivity: 1,
            },

            init: false,
          };
        } else if ($carousel.classList.contains("rlc-category_carousel")) {
          config = {
            // loop: true,
            slidesPerView: "auto",
            // slidesPerView: 2,
            // centeredSlides: true,
            speed: 600,
            freeMode: false,
            resistance: false,
            // resistanceRatio: 0,
            watchSlidesVisibility: true,
            preloadImages: false,
            lazy: true,
            breakpoints: {
              767: {
                // slidesPerView: 'auto',
                // centeredSlides: true,
                freeMode: false,
                resistance: true,
              },
            },
            scrollbar: {
              el: ".swiper-scrollbar",
              hide: false,
              //draggable: true,
              dragSize: 200, //,
              //snapOnRelease: false
            },
            // pagination: {
            // 	el: '.swiper-pagination',
            // 	clickable: true
            // },

            // Navigation arrows
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },

            mousewheel: {
              forceToAxis: true,
              sensitivity: 1,
            },

            init: false,
          };
        } else if ($carousel.classList.contains("rlc-three__m_carousel")) {
          config = {
            slidesPerView: "auto",
            centeredSlides: true,
            speed: 600,
            breakpoints: {
              767: {
                loop: true,
                slidesPerView: "auto",
                centeredSlides: true,
              },
            },

            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },

            // Navigation arrows
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },

            mousewheel: {
              forceToAxis: true,
              sensitivity: 1,
            },

            init: false,
          };
        } else {
          config = {
            loop: true,
            slidesPerView: "auto",
            centeredSlides: true,
            speed: 600,

            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },

            // Navigation arrows
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },

            mousewheel: {
              forceToAxis: true,
              sensitivity: 1,
            },

            init: false,
          };
        }
      }
      return config;
    }

    // ****************************************
    // FROM INVIEW.JS IN RLC WEBPACK JS PACKAGE
    // is visible
    function isElementVisible($el) {
      let rect = $el.getBoundingClientRect(),
        vWidth = window.innerWidth || doc.documentElement.clientWidth,
        vHeight = window.innerHeight || doc.documentElement.clientHeight,
        efp = function (x, y) {
          return document.elementFromPoint(x, y);
        };

      // Return false if it's not in the viewport
      if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight)
        return false;

      // CHECK FOR SLIDER ELEMENTS NOT IN PARENT
      let parentBlock = $el.closest("rlc-block");
      if (parentBlock) {
        let parentRect = parentBlock.getBoundingClientRect();
        if (
          parentBlock.classList.contains("rlc-isvisible") &&
          rect.left >= parentRect.left &&
          rect.left < parentRect.right
        ) {
          return true;
        }
      }
      // Return true if any of its four corners are visible
      // return (
      else if (
        $el.contains(efp(rect.left, rect.top)) ||
        $el.contains(efp(rect.right, rect.top)) ||
        $el.contains(efp(rect.right, rect.bottom)) ||
        $el.contains(efp(rect.left, rect.bottom))
      ) {
        return true;
      } else if (
        (rect.right > 0 || rect.bottom > 0) &&
        (rect.left < vWidth || rect.top < vHeight)
      ) {
        // HACK FOR EMPTY ELEMENTS
        return true;
      } else {
        return false;
      }
      // );
    }

    function onVisibilityChange($el, callback) {
      // console.log('onVisibilityChange',$el);
      let old_visible = $el.classList.contains("rlc-isvisible");

      return function () {
        // let visible = isElementInViewport($el);
        let visible = isElementVisible($el);

        if (visible != old_visible) {
          old_visible = visible;
          if (typeof callback == "function") {
            callback(visible);
          }
        }
      };
    }

    function checkVisibility($carousel) {
      // console.log('checkVisibility',$carousel);
      let $elms = $carousel.querySelectorAll(".rlc-block");
      // for (let key in $elms) {
      // 	// skip loop if the property is from prototype
      // 	if (!$elms.hasOwnProperty(key)) continue;

      // 	let $elm = $elms[key];
      // 	// bizarre IE fix
      // 	if ($elm.length > 1) {
      // 		$elm = $elm[0];
      // 	}
      $elms.forEach(function ($elm) {
        onVisibilityChange($elm, function (visible) {
          // console.log("isvisible CHANGE $elm", $elm, visible, typeof visible);
          if (visible) {
            // console.log("ENTER_VIEWPORT")
            $elm.classList.add("rlc-isvisible");
            $elm.dispatchEvent(ENTER_VIEWPORT);
            // jQuery($elm).trigger("ENTER_VIEWPORT");
          } else {
            // console.log("NOT_ENTER_VIEWPORT")
            $elm.classList.remove("rlc-isvisible");
            $elm.dispatchEvent(LEAVE_VIEWPORT);
            // jQuery($elm).trigger("LEAVE_VIEWPORT");
          }
        })();
      });
      // }
    }
    // END INVIEW.JS
    // ****************************************

    if (window.addEventListener) {
      addEventListener("resize", updateCarousels, false);
    } else if (window.attachEvent) {
      attachEvent("onresize", updateCarousels);
    }

    // TELL THE WORLD THE CAROUSELS HAVE BEEN INITIALIZED
    window._rlc.carouselsActive = true;
  }

  const needsLazyLoader = document.querySelectorAll(".rlc-lazyLoad").length > 0;

  // CACHE FOR REPEAT CHECK
  function init() {
    // CHECK inView MODULE IS READY AND lazyLoader IF NEEDED
    let viewInitCheck = setInterval(function () {
      if (
        typeof window._rlc.inView == "function" &&
        (!needsLazyLoader || (needsLazyLoader && typeof window._rlc.lazyLoader == "function"))
      ) {
        RL_Carousels();
        clearInterval(viewInitCheck);
      }
    }, 150);
  }

  // check to prevent carousel js from firing twice if duplicate inclusion
  if (!window._rlc.carouselsActive) {
    init();
  }
});
