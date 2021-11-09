window._rlc.rlCustomJS(function () {
  function addPolyFills() {
    // IE POLYFILLS
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
      Element.prototype.closest = function (s) {
        let el = this;

        do {
          if (el.matches(s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }

    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (let i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }

    // POLYFILL - MULTIPLES IN CLASSLIST
    let dummy = document.createElement("div"),
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
    // END IE POLYFILLS
  }

  // SETUP EVENTS
  if (typeof Event === "function") {
    window.VIDEO_LOADED = new Event("VIDEO_LOADED");
    window.ENTER_VIEWPORT = new Event("ENTER_VIEWPORT");
  } else {
    // IE
    window.VIDEO_LOADED = document.createEvent("Event");
    window.ENTER_VIEWPORT = document.createEvent("Event");

    window.VIDEO_LOADED.initEvent("VIDEO_LOADED", true, true);
    window.ENTER_VIEWPORT.initEvent("ENTER_VIEWPORT", true, true);
  }

  function rlc_videos() {
    // console.log('rlc_videos HAS BEGUN!!');

    let isDesktop = window.matchMedia("(min-width: 768px)");

    function buildVideo($vidContainer, customattributes) {
      let device = "desktop";
      if (!isDesktop.matches) {
        device = "mobile";
      }

      let vidData = $vidContainer.dataset.video,
        vidSrc = vidData,
        posterData = $vidContainer.dataset.poster,
        vidPoster = posterData;

      if (vidData && vidData.indexOf("{") > -1) {
        // CHANGE SINGLE QUOTES TO DOUBLE QUOTES FOR JSON PARSING
        vidData = JSON.parse(vidData.replace(/'/g, '"'));
        vidSrc = vidData[device];
      }
      if (posterData && posterData.indexOf("{") > -1) {
        // CHANGE SINGLE QUOTES TO DOUBLE QUOTES FOR JSON PARSING
        posterData = JSON.parse(posterData.replace(/'/g, '"'));
        vidPoster = posterData[device];
      }

      // TODO: figure out why this works and the correct way doesn't
      if ($vidContainer.classList.contains("rlc-loopvid")) {
        let html =
          "<video " +
          customattributes +
          ' poster="' +
          vidPoster +
          '"><source src="' +
          vidSrc +
          '" type="video/mp4" />Your browser does not support the video tag.</video><div class="rlc-looppause" aria-label="play/pause button"></div>';
        $vidContainer.innerHTML += html;
        var $videoElem = $vidContainer.getElementsByTagName("video")[0];
      } else {
        var $videoElem = document.createElement("video");
        if (posterData) {
          $videoElem.setAttribute("poster", vidPoster);
        }

        if (customattributes && customattributes != "") {
          let customAttrArray = customattributes.split(" ");
          customAttrArray.forEach(function (attr) {
            $videoElem.setAttribute(attr, attr);
          });
        }

        let $videoSrcElem = document.createElement("source");
        $videoSrcElem.src = vidSrc;
        $videoSrcElem.type = "video/mp4";
        $videoElem.appendChild($videoSrcElem);
        $vidContainer.appendChild($videoElem);

        // if ($vidContainer.classList.contains('rlc-loopvid')) {
        // 	let $videoBtnPause = document.createElement('div');
        // 	$videoBtnPause.classList.add('rlc-looppause');
        // 	$videoBtnPause.setAttribute('aria-label', 'play/pause button');
        // 	$vidContainer.appendChild($videoBtnPause);
        // } else if ($vidContainer.classList.contains('rlc-click2play')) {
        if ($vidContainer.classList.contains("rlc-click2play")) {
          let $videoBtnClose = document.createElement("div");
          $videoBtnClose.classList.add("rlc-btn_close");
          $videoBtnClose.setAttribute("aria-label", "video close button");
          $vidContainer.appendChild($videoBtnClose);
        }
      }
      $vidContainer.classList.add("video_loaded");
      $vidContainer.dispatchEvent(VIDEO_LOADED);

      return $videoElem;
    }

    function addLoopVideoHandlers($vidContainer, $theVid) {
      $theVid.onplay = function () {
        $vidContainer.classList.add("playing");
        return false;
      };
      $theVid.onpause = function () {
        $vidContainer.classList.remove("playing");
        return false;
      };
      $vidContainer.addEventListener("click", function (event) {
        if ($vidContainer.classList.contains("playing")) {
          $vidContainer.classList.add("user_paused");
          $theVid.pause();
        } else {
          $vidContainer.classList.remove("user_paused");
          $theVid.play();
        }
      });

      if ($vidContainer.closest(".rlc-hasvideo")) {
        $vidContainer.closest(".rlc-hasvideo").classList.add("rlc-vidLoaded");
      }

      // Pause looping video when out of view
      let $parentBlock = $vidContainer.closest(".rlc-block");
      if ($parentBlock) {
        // console.log('PARENT BLOCK VIDEO JS', $parentBlock);
        addInViewListeners();

        // Play video if already in view
        if (
          $parentBlock.classList.contains("rlc-isvisible") &&
          !$vidContainer.classList.contains("user_paused")
        ) {
          $theVid.play();
          // $parentBlock.dispatchEvent(ENTER_VIEWPORT);
        }
      }

      // FOR TESTING IF VIDEO IS PLAYING WHEN NOT INVIEW
      // $theVid.addEventListener('timeupdate', function(event) {
      // 	console.log('VID TIME',$vidContainer,$theVid.currentTime);
      // });

      function addInViewListeners() {
        $parentBlock.addEventListener(
          "ENTER_VIEWPORT",
          function () {
            // console.log("ENTER_VIEWPORT VIDEO JS",$parentBlock);
            if (!$vidContainer.classList.contains("user_paused")) {
              // console.log("PLAY VIDEO",$parentBlock);
              $theVid.play();
            }
          },
          false
        );
        $parentBlock.addEventListener(
          "LEAVE_VIEWPORT",
          function () {
            // console.log("LEAVE_VIEWPORT VIDEO JS",$parentBlock);
            if (!$vidContainer.classList.contains("user_paused")) {
              if ($vidContainer.classList.contains("playing")) {
                $theVid.pause();
              }
            }
          },
          false
        );
      }
    }

    function expandMoodBannerVideo($moodbanner) {
      // console.log('expandMoodBannerVideo');
      $moodbanner.classList.add("expand_mb");
      $moodbanner.classList.add("transitioning");
    }
    function closeMoodBannerVideo($moodbanner, $videoElem) {
      $videoElem.pause();
      // CHECK FOR MOBILE FULL SCREEN
      if ($moodbanner.classList.contains("expand_mb")) {
        $moodbanner.classList.add("transitioning");
        $moodbanner.classList.remove("expand_mb");
      }
    }

    function rlActivateVids($el) {
      const $vidContainers = $el.querySelectorAll(".rlc-videocontainer");

      $vidContainers.forEach(function ($vidContainer) {
        // let switchVid = $vidContainer.dataset.desktopvid;

        // if (switchVid != null) {
        if ($vidContainer.dataset.video) {
          // remove existing videos at breakpoint
          if ($vidContainer.getElementsByTagName("video").length != 0) {
            let $theVid = $vidContainer.querySelector("video");
            $el.classList.remove("playing");
            $el.classList.remove("paused");
            // $vidContainer.removeChild(theVid);
            while ($vidContainer.firstChild) {
              $vidContainer.removeChild($vidContainer.firstChild);
            }
          }

          let customattributes = $vidContainer.dataset.customattributes;
          if (!customattributes) {
            customattributes = "";
          }

          // if looping video
          if ($vidContainer.classList.contains("rlc-loopvid")) {
            // customattributes = 'playsinline muted autoplay loop';
            customattributes = "playsinline muted loop";

            // LOOPING VIDEO IN SLIDE
            if ($el.classList.contains("rlc-slide")) {
              customattributes = "playsinline muted loop";
            }
          }
          //  TODO: ADD POPUP VIDEO
          if ($vidContainer.classList.contains("rlc-click2play")) {
            customattributes = "controls";

            // MOOD BANNER
            if ($vidContainer.classList.contains("rlc-video-mb")) {
              // customattributes = 'controls';
              let $moodbanner = $vidContainer.closest(".rlc-moodbanner");
              // TODO: CHANGE TO CLASS OR ALLOW MULTIPLES
              let $videoBtnPlay = document.getElementById($vidContainer.dataset.playbutton);
              let $video_bg = null;

              // GET BG VIDEO FOR PLAY / PAUSE
              if ($moodbanner.querySelector(".rlc-video_bg")) {
                $video_bg = $moodbanner.querySelector(".rlc-video_bg").querySelector("video");
              }

              $videoBtnPlay.addEventListener("click", function (event) {
                // console.log("CLICK $videoBtnPlay");
                // PERFORM THE FULL VIDEO MAGIC
                let $videoElem = $vidContainer.querySelector("video");
                let videoIsFullscreen = false;
                if (!$videoElem) {
                  // IF VIDEO HAS NOT BEEN BUILT YET, BUILD IT
                  $videoElem = buildVideo($vidContainer, customattributes);
                  $videoElem.onplay = function () {
                    $moodbanner.classList.add("playing");
                  };

                  // CLOSE BUTTON
                  let $btn_close = $vidContainer.querySelector(".rlc-btn_close");
                  $btn_close.addEventListener("click", function (e) {
                    closeMoodBannerVideo($moodbanner, $videoElem);
                  });
                  $videoElem.onpause = function () {
                    $moodbanner.classList.remove("playing");
                  };
                  $videoElem.addEventListener("ended", function () {
                    // console.log('VIDEO ENDED','DO SOMETHING!!');
                    closeMoodBannerVideo($moodbanner, $videoElem);
                    if (videoIsFullscreen) {
                      $videoElem.webkitExitFullscreen();
                    }
                  });
                  $moodbanner.addEventListener("transitionend", function (e) {
                    // console.log('transitionend',event);
                    if (e.propertyName == "height") {
                      $moodbanner.classList.remove("transitioning");
                      if ($moodbanner.classList.contains("expand_mb")) {
                        $videoElem.play();
                      } else if ($video_bg) {
                        // CHECK IF USER PAUSED LOOPING VIDEO BEFORE RESTARTING
                        if (!$video_bg.classList.contains("user_paused")) {
                          $video_bg.play();
                        }
                      }
                    }
                  });
                  // TRIGGER PLAY FOR iOS DEVICES TO GO FULLSCREEN
                  if (navigator.platform == "iPhone") {
                    // console.log('iPhone Play');
                    $videoElem.play();
                  }
                  $videoElem.addEventListener("canplaythrough", function (e) {
                    // console.log('canplaythrough');
                    $videoElem.play(); // force video to load so it will show before expanding
                    if (navigator.platform != "iPhone") {
                      $videoElem.pause();
                      expandMoodBannerVideo($moodbanner);
                    }
                  });
                  // iOS hack
                  $videoElem.addEventListener(
                    "load",
                    function (e) {
                      // console.log('load');
                      $videoElem.play(); // force video to load so it will show before expanding
                    },
                    false
                  );
                  $videoElem.addEventListener("webkitbeginfullscreen", function (e) {
                    // console.log('webkitbeginfullscreen');
                    videoIsFullscreen = true;
                  });
                  $videoElem.addEventListener("webkitendfullscreen", function (e) {
                    // console.log('webkitendfullscreen');
                    videoIsFullscreen = false;

                    // CHECK IF USER PAUSED LOOPING VIDEO BEFORE RESTARTING
                    if (!$video_bg.classList.contains("user_paused")) {
                      $video_bg.play();
                    }
                  });
                  $videoElem.play();
                } else {
                  if (navigator.platform == "iPhone") {
                    // console.log('iPhone Play');
                    $videoElem.play();
                  } else {
                    expandMoodBannerVideo($moodbanner);
                  }
                }
                if ($video_bg) {
                  $video_bg.pause();
                }
              });

              // MARK MOODBANNER READY FOR VIDEO
              $moodbanner.classList.add("rlc-video_ready");

              // NOT MOOD BANNER
            } else {
              let $videoBtnPlay = document.createElement("div");
              $videoBtnPlay.classList.add("rlc-playbutton");
              $videoBtnPlay.setAttribute("aria-label", "play button");
              $vidContainer.appendChild($videoBtnPlay);

              $videoBtnPlay.addEventListener("click", function (event) {
                let $videoElem = $vidContainer.querySelector("video");
                let videoIsFullscreen = false;

                if (!$videoElem) {
                  // If video does not exist...
                  $videoElem = buildVideo($vidContainer, customattributes);
                  $videoElem.onplay = function () {
                    $el.classList.add("rlc-vid_playing");
                    $vidContainer.classList.add("playing");
                  };
                  $videoElem.onpause = function () {
                    $el.classList.remove("rlc-vid_playing");
                    $vidContainer.classList.remove("playing");
                  };
                  $videoElem.addEventListener("ended", function () {
                    $el.classList.remove("rlc-vid_playing");
                    $vidContainer.classList.remove("playing");
                    $videoElem.classList.remove("video_open");
                  });
                  $videoElem.addEventListener("webkitbeginfullscreen", function (e) {
                    // console.log('webkitbeginfullscreen');
                    videoIsFullscreen = true;
                  });
                  $videoElem.addEventListener("webkitendfullscreen", function (e) {
                    // console.log('webkitendfullscreen');
                    videoIsFullscreen = false;
                  });
                  $videoElem.addEventListener("ended", function () {
                    // console.log('VIDEO ENDED');
                    if (videoIsFullscreen) {
                      $videoElem.webkitExitFullscreen();
                    }
                  });
                }
                $videoElem.classList.add("video_open");
                if ($vidContainer.classList.contains("playing")) {
                  $videoElem.pause();
                } else {
                  $videoElem.play();
                }
              });
            }
          } else {
            // BUILD VIDEO ELEMENT
            let $videoElem = buildVideo($vidContainer, customattributes);

            addLoopVideoHandlers($vidContainer, $videoElem);
          }
        }
      });
      return;
    }

    function rlFindVids($parentElm) {
      let $allVids = document.querySelectorAll(".rlc-hasvideo");
      // console.log('FIND VIDS ',typeof $parentElm, $parentElm);
      if (typeof $parentElm == "object" && $parentElm.nodeType === 1) {
        if ($parentElm.classList.contains("rlc-hasvideo")) {
          $allVids = $parentElm;
        } else {
          $allVids = $parentElm.querySelectorAll(".rlc-hasvideo");
        }
      }
      $allVids.forEach(function ($el) {
        // ACTIVATE VIDS ONLY IF NOT IN CAROUSEL OR CAROUSEL IS READY
        if (!$el.closest(".rlc-carousel") || $el.closest(".rlc-carousel--ready")) {
          // console.log('VIDEO NOT IN CAROUSEL OR CAROUSEL IS READY',$el);
          $el.classList.remove("rlc-vidLoaded");

          if (!$el.classList.contains(".rlc-lazyLoad") && !$el.closest(".rlc-lazyLoad")) {
            rlActivateVids($el);
          } else {
            // Lazy Load videos
            if ($el.classList.contains(".rlc-block")) {
              $el.addEventListener(
                "ENTER_VIEWPORT",
                function () {
                  rlActivateVids($el);
                },
                { once: true }
              );
            } else if ($el.closest(".rlc-block")) {
              $el.closest(".rlc-block").addEventListener(
                "ENTER_VIEWPORT",
                function () {
                  rlActivateVids($el);
                },
                { once: true }
              );
            }
          }
        }
      });
    }

    function rlBuildCarouselVideos($parentElm) {
      let $carousels = document.querySelectorAll(".rlc-carousel");
      if (typeof $parentElm == "object" && $parentElm.nodeType === 1) {
        $carousels = $parentElm.querySelectorAll(".rlc-carousel");
      }

      $carousels.forEach(function ($carousel) {
        // console.log('VIDEO JS - CAROUSEL',$carousel);
        //  only build if carousel is not yet ready
        if ($carousel.querySelectorAll(".rlc-hasvideo").length > 0) {
          if (!$carousel.classList.contains("rlc-carousel--ready")) {
            // console.log('VIDEO JS - CAROUSEL NOT READY',$carousel);
            // listen for carousel ready event
            $carousel.addEventListener(
              "CAROUSEL_READY",
              function () {
                // console.log('VIDEO JS - CAROUSEL IS NOW READY',$carousel);
                rlFindVids($carousel);
              },
              false
            );
          }
        }
      });
    }
    function rlBuildVideos($parentElm) {
      rlFindVids($parentElm);

      // Build videos in carousels - needed for swiper duplicated slides
      rlBuildCarouselVideos($parentElm);
    }

    rlBuildVideos();
    isDesktop.addListener(rlBuildVideos);

    // Listen for PLP grid change event
    document.addEventListener(
      "productListingUpdated",
      function () {
        rlBuildVideos();
      },
      false
    );

    // EXPOSE TO GLOBAL FOR EXTERNAL CALLS
    window._rlc.buildVids = rlBuildVideos;
  }

  addPolyFills();

  // Do not double init (fix for dynamic content loading)
  if (!window._rlc.buildVids) {
    rlc_videos();
  }
});
