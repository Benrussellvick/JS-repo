window._rlc.rlCustomJS(function () {
  // YOUR CODE HERE
  function navBar() {
    var idSTYLE = document.getElementById("trigger-STYLE");
    var idENVIR = document.getElementById("trigger-ENVIR");
    var idLIVES = document.getElementById("trigger-LIVES");

    var triggerSTYLE = idSTYLE.getBoundingClientRect().top;
    var triggerENVIR = idENVIR.getBoundingClientRect().top;
    var triggerLIVES = idLIVES.getBoundingClientRect().top;

    let navColor = document.querySelectorAll(".rlc-nav-cta");

    var navSTYLE = document.getElementById("rlc-style");
    var navENVIR = document.getElementById("rlc-envir");
    var navLIVES = document.getElementById("rlc-lives");

    let navColordd = document.querySelectorAll(".rlc-nav-dd");

    var navSTYLEdd = document.getElementById("rlc-style-dd");
    var navENVIRdd = document.getElementById("rlc-envir-dd");
    var navLIVESdd = document.getElementById("rlc-lives-dd");

    window.onscroll = function () {
      if (window.pageYOffset < triggerENVIR) {
        console.log("style");

        for (let i = 0; i < navColor.length; i++) {
          navColor[i].classList.remove("rlc-active-cta");
        }

        navSTYLE.classList.add("rlc-active-cta");

        for (let i = 0; i < navColordd.length; i++) {
          navColordd[i].classList.remove("rlc-active-dd");
        }

        navSTYLEdd.classList.add("rlc-active-dd");
      } else if (window.pageYOffset >= triggerENVIR && window.pageYOffset < triggerLIVES) {
        console.log("envir");

        for (let i = 0; i < navColor.length; i++) {
          navColor[i].classList.remove("rlc-active-cta");
        }

        navENVIR.classList.add("rlc-active-cta");

        for (let i = 0; i < navColordd.length; i++) {
          navColordd[i].classList.remove("rlc-active-dd");
        }

        navENVIRdd.classList.add("rlc-active-dd");
      } else if (window.pageYOffset >= triggerLIVES) {
        console.log("fleece");

        for (let i = 0; i < navColor.length; i++) {
          navColor[i].classList.remove("rlc-active-cta");
        }

        navLIVES.classList.add("rlc-active-cta");

        for (let i = 0; i < navColordd.length; i++) {
          navColordd[i].classList.remove("rlc-active-dd");
        }

        navLIVESdd.classList.add("rlc-active-dd");
      }
    };
  }

  function doneResizing() {
    //whatever we want to do
    var yPosition = window.pageYOffset;

    // document.getElementById("rlc-dfg").style.opacity = "0";

    setTimeout(function () {
      window.scrollTo(0, 0);
      navBar();
      window.scrollBy(100, yPosition);
      // document.getElementById("rlc-dfg").style.opacity = "1";
    }, 1000);
  }

  navBar();

  window.addEventListener("resize", doneResizing);
  window.addEventListener("load", doneResizing);
});
