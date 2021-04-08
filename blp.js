window._rlc.rlCustomJS(function () {
  const $scriptLoaderElm = document.getElementById("rlc-scripts");

  if ($scriptLoaderElm) {
    // CHECK IF SCRIPTS HAVE ALREADY LOADED
    if ($scriptLoaderElm.classList.contains("rlc-loaded")) {
      yourFunction();
    } else {
      // LISTEN FOR EVENT
      $scriptLoaderElm.addEventListener("SCRIPTS_LOADED", blpElements);
    }
  }

  function blpElements() {
    // IE POLYFILLS
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
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
    // 'toggle' either, test by checking the return value after forcing
    if (!dummy.classList.toggle("class1", true)) {
      dtp.toggle = function (cls, forcedState) {
        if (forcedState === undefined) return toggle.call(this, cls);

        (forcedState ? add : rem).call(this, cls);
        return !!forcedState;
      };
    }
    // END IE POLYFILLS

    var isDesktop = window.matchMedia("(min-width: 768px)");

    // FADE SLIDER CODE:

    gsap.registerPlugin(Draggable);

    const fadeleftsliders = document.querySelectorAll(".rlc-fadeslider");

    // TODO: ADD POLYFILL
    fadeleftsliders.forEach(function ($element, index) {
      const slider = $element,
        slides = slider.querySelectorAll(".rlc-slide"),
        arrowPrev = document.createElement("button"),
        arrowNext = document.createElement("button"),
        pagination = document.createElement("div"),
        proxy = document.createElement("div"),
        copyGroups = slider.querySelectorAll(".rlc-copygroup"),
        videoSlides = slider.querySelectorAll(".rlc-videoslide"),
        videoContainers = slider.querySelectorAll(".rlc-videocontainer"),
        wrapper = slider.querySelector(".rlc-slidewrapper");
      let activeIdx = 0,
        autoplay = false,
        duration = 4000,
        sliderWidth = slider.offsetWidth,
        startProg = 0,
        sDir = "left",
        nextSlide = slides[activeIdx],
        prevIdx = 0,
        prevSlide = slides[0],
        nextTL = null,
        sMax = 0,
        sCancel = false,
        interacted = false,
        pauseButton = null,
        countSeconds = null,
        seconds = 1,
        hasVideo = false;
      if (videoContainers.length != 0) {
        hasVideo = true;
      }

      // CREATE ARROWS AND PAGINATION:
      pagination.setAttribute("class", "rlc-pagination");
      arrowPrev.setAttribute("class", "rlc-carousel-arrow rlc-carousel-arrow-left");
      arrowPrev.setAttribute("aria-label", "Previous slide");
      arrowNext.setAttribute("class", "rlc-carousel-arrow rlc-carousel-arrow-right");
      arrowNext.setAttribute("aria-label", "Next slide");
      arrowPrev.setAttribute("tabindex", 0);
      arrowNext.setAttribute("tabindex", 0);
      arrowPrev.setAttribute("role", "button");
      arrowNext.setAttribute("role", "button");
      wrapper.parentNode.insertBefore(pagination, wrapper);
      wrapper.parentNode.insertBefore(arrowPrev, wrapper);
      wrapper.parentNode.insertBefore(arrowNext, wrapper);

      slides.forEach(function ($element, index) {
        // TODO: change from string to node
        if ($element.dataset.duration == undefined || $element.dataset.duration == "") {
          var d = duration / 1000;
        } else {
          var d = $element.dataset.duration;
        }
        pagination.innerHTML = pagination.innerHTML + '<button class="rlc-bullet rlc-' + d + 's"/>';
      });
      const bullets = pagination.querySelectorAll(".rlc-bullet");

      slides[0].classList.add("rlc-active");
      bullets[0].classList.add("rlc-active");
      slider.classList.add("rlc-init");

      function startAutoPlay() {
        slides[activeIdx].dispatchEvent(ENTER_VIEWPORT);

        if (autoplay) {
          slider.classList.remove("rlc-stopbullet");
          if (
            slides[activeIdx].dataset.duration == undefined ||
            slides[activeIdx].dataset.duration == ""
          ) {
            var timeout = duration;
          } else {
            var timeout = slides[activeIdx].dataset.duration * 1000;
          }
          clearInterval(countSeconds);
          countSeconds = null;

          slider.classList.add("rlc-autoplay");
          slider.classList.remove("user_paused");

          countSeconds = setInterval(function () {
            if (seconds >= timeout / 1000) {
              seconds = 1;
              var ni = activeIdx + 1;
              if (ni == slides.length) {
                ni = 0;
              }
              sDir = "left";
              updateActive();
              nextTL.play();
              clearInterval(countSeconds);
              return;
            } else {
              seconds++;
            }
          }, 1000);
        }
        setTimeout(function () {
          slides[activeIdx].classList.add("rlc-active");
          bullets[activeIdx].classList.add("rlc-active");
        }, 700);
      }

      function stopAutoPlay() {
        clearInterval(countSeconds);
        countSeconds = null;
        slider.classList.add("rlc-stopbullet", "user_paused");

        slides[activeIdx].dispatchEvent(LEAVE_VIEWPORT);
        autoplay = false;
      }

      gsap.to(slider, {
        scrollTrigger: {
          trigger: slider.closest(".rlc-block"),
          start: "center top",
          onEnter: function () {
            if (autoplay) {
              interacted = true;
              clearInterval(countSeconds);
              countSeconds = null;
              slider.classList.add("rlc-stopbullet");
            }
            slides.forEach(function ($element, index) {
              $element.dispatchEvent(LEAVE_VIEWPORT);
            });
            if (hasVideo) {
              window._rlc.inView();
            }
          },
          onEnterBack: function () {
            if (autoplay) {
              interacted = false;
              startAutoPlay();
              slider.classList.remove("rlc-stopbullet");
              nextSlide.dispatchEvent(ENTER_VIEWPORT);
            }
          },
        },
      });

      if (slider.dataset.autoplay === "true") {
        autoplay = true;
        pauseButton = document.createElement("button");
        pauseButton.setAttribute("class", "rlc-looppause");
        pauseButton.setAttribute("rlc-looppause", "play/pause button");
        wrapper.parentNode.insertBefore(pauseButton, wrapper);
        setTimeout(function () {
          startAutoPlay();
        }, 1000);
      }

      function moveNext(target) {
        var tl = new TimelineLite({
          paused: true,
          onComplete: resetSlidesComplete,
          onReverseComplete: resetSlidesReverse,
        });

        var nextcopy = nextSlide.querySelector(".rlc-copygroup");
        var prevcopy = prevSlide.querySelector(".rlc-copygroup");

        if (isDesktop.matches) {
          var slideToLeft = "40em",
            copyToLeft = "6em",
            slideDur = 0.7;
        } else {
          var slideToLeft = "17.578em",
            copyToLeft = "6em",
            slideDur = 0.7;
        }
        if (sDir == "left") {
          tl.from(nextSlide, slideDur, { left: slideToLeft, opacity: 0 }, 0);
          tl.from(nextcopy, slideDur, { marginLeft: copyToLeft }, 0);
          tl.to(prevcopy, 0.25, { opacity: 0 }, 0);
        } else {
          copyToLeft = "-" + copyToLeft;
          tl.from(nextSlide, slideDur, { right: slideToLeft, opacity: 0 }, 0);
          tl.from(nextcopy, slideDur, { marginLeft: copyToLeft }, 0);
          tl.to(prevcopy, 0.25, { opacity: 0 }, 0);
        }
        return tl;
      }

      function resetSlidesComplete() {
        clearInterval(countSeconds);
        countSeconds = null;
        startAutoPlay();
        interacted = false;
        bullets.forEach(function ($element, index) {
          $element.classList.remove("rlc-active");
        });
        bullets[activeIdx].classList.add("rlc-active");
        slides.forEach(function ($element, index) {
          var copy = $element.querySelector(".rlc-copygroup");
          copy.style.margin = "auto";
          copy.style.opacity = 1;
        });
      }

      function resetSlidesReverse() {
        clearInterval(countSeconds);
        countSeconds = null;
        startAutoPlay();
        interacted = false;
        if (sCancel && sDir == "left") {
          activeIdx = prevIdx;
          resetSlidesComplete();
        }
        if (sCancel && sDir == "right") {
          activeIdx = prevIdx;
          prevIdx = activeIdx - 1;
          if (prevIdx < 0) {
            prevIdx = slides.length - 1;
          }
          resetSlidesComplete();
        }
      }

      function updateActive(skip) {
        var skip = skip;
        seconds = 1;
        if (interacted) {
          slider.classList.remove("rlc-autoplay");
        }
        slider.classList.add("rlc-" + sDir);
        slides.forEach(function ($element, index) {
          $element.classList.remove("rlc-prev");
          $element.style.left = "auto";
          $element.style.right = "auto";
          $element.style.opacity = 1;
          $element.querySelector(".rlc-copygroup").style.opacity = 1;
        });
        prevIdx = activeIdx;
        prevSlide = slides[activeIdx];
        prevSlide.classList.add("rlc-prev");
        if (skip != undefined) {
          activeIdx = skip;
        } else {
          if (sDir == "left") {
            activeIdx = activeIdx + 1;
            if (activeIdx == slides.length) {
              activeIdx = 0;
            }
          } else {
            activeIdx = activeIdx - 1;
            if (activeIdx < 0) {
              activeIdx = slides.length - 1;
            }
          }
        }
        nextSlide = slides[activeIdx];
        // TODO: Lets move Active Slide / Bullet to a single function

        bullets.forEach(function ($element, index) {
          $element.classList.remove("rlc-active");
        });
        slides.forEach(function ($element, index) {
          $element.classList.remove("rlc-active");
          $element.dispatchEvent(LEAVE_VIEWPORT);
        });
        bullets[activeIdx].classList.add("rlc-active");
        nextSlide.classList.add("rlc-active");
        nextSlide.dispatchEvent(ENTER_VIEWPORT);
        if (hasVideo) {
          window._rlc.inView();
        }
        nextTL = moveNext(nextSlide);
      }

      function updateProgress() {
        var p = Math.abs(startProg - this.x);

        // can't drag past width of slider:
        if (p >= sliderWidth) {
          p = sliderWidth;
        }
        if (p <= 0) {
          p = 0;
        }

        // distance value between 0 and 1:
        var z = p / sliderWidth;

        // heading in one direction:
        if (z >= sMax) {
          sMax = z;
          sCancel = false;
        }

        // direction has switched:
        if (z <= sMax - 0.05) {
          sCancel = true;
        }

        // user has not dragged far enough, so cancel
        if (z <= 0.05) {
          sCancel = true;
        }
        nextTL.progress(z);
      }

      var draggable = new Draggable(proxy, {
        trigger: slider,
        type: "x",
        lockAxis: true,
        onDrag: updateProgress,
        onDragStart: function () {
          interacted = true;
          clearInterval(countSeconds);
          countSeconds = null;
          sCancel = false;
          sDir = this.getDirection("start");
          updateActive();
        },
        onDragEnd: function () {
          startProg = this.endX;
          sMax = 0;
          if (sCancel) {
            nextTL.reverse();
          } else {
            nextTL.play();
          }
        },
        allowEventDefault: false,
      });

      arrowNext.addEventListener("click", function (event) {
        sDir = "left";
        if (interacted) {
          return;
        }
        interacted = true;
        clearInterval(countSeconds);
        countSeconds = null;
        updateActive();
        nextTL.play();
      });

      arrowPrev.addEventListener("click", function (event) {
        sDir = "right";
        if (interacted) {
          return;
        }
        interacted = true;
        clearInterval(countSeconds);
        countSeconds = null;
        updateActive();
        nextTL.play();
      });

      bullets.forEach(function ($element, index) {
        var idx = index;
        $element.addEventListener("click", function (event) {
          if ($element.classList.contains("rlc-active")) {
            return;
          }
          if (idx >= activeIdx) {
            sDir = "left";
          } else {
            sDir = "right";
          }
          updateActive(idx);
          nextTL.play();
          interacted = true;
        });
      });

      copyGroups.forEach(function ($element, index) {
        if (autoplay) {
          $element.addEventListener("mouseover", function (event) {
            if (slider.classList.contains("user_paused")) {
              return;
            }
            interacted = true;
            clearInterval(countSeconds);
            countSeconds = null;
            slider.classList.add("rlc-stopbullet");
          });
          $element.addEventListener("mouseleave", function (event) {
            if (slider.classList.contains("user_paused")) {
              return;
            }
            interacted = false;
            startAutoPlay();
            slider.classList.remove("rlc-stopbullet");
          });
        }
      });

      pauseButton.addEventListener("click", function (event) {
        if (autoplay) {
          stopAutoPlay();
          autoplay = false;
          videoContainers.forEach(function ($element, index) {
            $element.classList.add("user_paused");
          });
          $element.dispatchEvent(LEAVE_VIEWPORT);
        } else {
          autoplay = true;
          startAutoPlay();
          videoContainers.forEach(function ($element, index) {
            $element.classList.remove("user_paused");
          });
          $element.dispatchEvent(ENTER_VIEWPORT);
        }
        if (hasVideo) {
          window._rlc.inView();
        }
        return false;
      });

      window.addEventListener("resize", function () {
        sliderWidth = slider.offsetWidth;
      });
    });

    var getClosest = function (elem, selector) {
      // Element.matches() polyfill
      if (!Element.prototype.matches) {
        Element.prototype.matches =
          Element.prototype.matchesSelector ||
          Element.prototype.mozMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          Element.prototype.oMatchesSelector ||
          Element.prototype.webkitMatchesSelector ||
          function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
              i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
          };
      }
      for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) return elem;
      }
      return null;
    };

    // REGISTER SCROLLTRIGGER:

    gsap.registerPlugin(ScrollTrigger);

    // PINCLIP CODE:
    // Important: every section above these elements must have a set height or min-height

    const pinClips = document.querySelectorAll(".rlc-pinclip");

    pinClips.forEach(function ($element, index) {
      var rlcIn = $element.querySelector(".rlc-in");
      gsap.to($element, {
        scrollTrigger: {
          trigger: $element,
          start: "top top",
          pin: true,
          pinSpacing: false,
        },
      });
    });

    return;
  }
});
