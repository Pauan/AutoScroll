;(function () {
  "use strict";

  var RAD_TO_DEG = Math.PI / 180

  var math = {
    hypot: function (x, y) {
      return Math.sqrt(x * x + y * y)
    },

    /*min: function (num, cap) {
      var neg = cap * -1
      return (num > neg && num < 0
               ? neg
               : (num < cap && num > 0
                   ? cap
                   : num))
    },*/

    max: function (num, cap) {
      var neg = cap * -1
      return (num > cap
               ? cap
               : (num < neg
                   ? neg
                   : num))
    },

    angle: function (x, y) {
      var angle = Math.atan(y / x) / RAD_TO_DEG
      if (x < 0) {
        angle += 180
      } else if (y < 0) {
        angle += 360
      }
      return angle
    }
  }

  if ((typeof requestAnimationFrame === "undefined") ||
      (typeof cancelAnimationFrame  === "undefined")) {
    // http://www.sitepoint.com/creating-accurate-timers-in-javascript/
    var startAnimation = function (f) {
      var step  = 1000 / 60
        , start = Date.now()
        , i     = 0
      ;(function anon() {
        i += step
        var diff = Date.now() - start - i
        f(setTimeout(anon, step - diff))
      })()
    }
    var stopAnimation = function (i) {
      clearTimeout(i)
    }
  } else {
    var startAnimation = function (f) {
      ;(function anon() {
        f(requestAnimationFrame(anon))
      })()
    }
    var stopAnimation = cancelAnimationFrame
  }

  // The timer that does the actual scrolling; must be very fast so the scrolling is smooth
  var cycle = {
    dirX: 0,
    dirY: 0,
    start: function (elem) {
      var self = this

      startAnimation(function (id) {
        self.timeout = id

        var x = self.dirX
          , y = self.dirY

        if (x !== 0) {
          elem.scrollLeft += x
        }
        if (y !== 0) {
          elem.scrollTop += y
        }
      })
    },
    stop: function () {
      this.dirX = 0
      this.dirY = 0
      stopAnimation(this.timeout)
      //clearTimeout(this.timeout)
    }
  }

  var defaults = {
    dragThreshold: 10,
    moveThreshold: 10,
    moveSpeed: 5,
    stickyScroll: true,
    innerScroll: true,
    scrollOnLinks: false,
    sameSpeed: false,
    capSpeed: "",
    shouldCap: false,
    ctrlClick: false,
    middleClick: true
  }

  // Get the options
  chrome.storage.local.get(defaults, function (options) {

    // Update the options when they change
    chrome.storage.onChanged.addListener(function (o, s) {
      console.assert(s === "local")
      for (var k in o) {
        var x = o[k]
        if ("newValue" in x) {
          options[k] = x.newValue
        } else if ("oldValue" in x) {
          options[k] = defaults[k]
        }
      }
    })

    function make(parent, f) {
      var state = {}

      function image(o) {
        // both
        if (o.width && o.height) {
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oBHQQpGLBBnHoAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAACGklEQVRIx71WsW6jQBB9uN49S1QclmgorqJM5YrShRWlnR/hB/IN1pVIVKba/ABIka6JC1eWSL1ShE8nS0RUuWKuwRw4XkwaRqJhZmd23743OxZu2x2AewBLAD8AfAfwF8AfAK8AfgF4ArAbSjIb8K0A5ABepJQPRASl1FFrfdRan5RSRyKClPIBwEsTu8IX7ScAdl13p5Ta8w1TSu1d190B4GbtTfvW7IyjKHq+ljTLMt5sNlcLRlH03BTLm1xGyy3LejedoqoqdhyHhRBclqXxdJZlvTfFzHANQUVE3OyYwzAchNIE42oILmbm7XbbFjl/SZIYi3Vg7BEkd113Z1p0Op14sViwEIKllDyfz9m2bfZ9n6uqMhZrCJJ3dcJj2PVV60B4BwCPUsqD6SRjzRQrpTwAeJwBWK7X69+Xl5amKYIgGC28IAiQpumn/03uJQC8dWGrqqpllxCit7s4jhkAe57HcRz3fEIIBsBE1Lu3Br43APjQWpdnMTqO07JKStlL5nle6/M87xKi1uc4DmdZxszMWusSwEev1xVFgbqu/zfC2Ww0dN3Yuq5RFMWnmB50ZVlyGIYMgG3bHg2dbdutkLtdowtdTkT5JVuSJGHf90ezzvf9qwImovysJSO9h8Q4NvZM70kFO1kLmrSpTvZMTPrwTfqUTzacXBu3WEp5IKJcKbXXWpda61IptSeivNEJ3xq3rKkGyH8lNonzV39hnwAAAABJRU5ErkJggg=="
        // horizontal
        } else if (o.width) {
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oBHQQqCmjVvvEAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAB50lEQVRIx72WsY6bQBCGP1yzKagIBQ1FKsqrXFG6sKJr90V4gXuIlEh0VJsXAOmkNOfClSVSr3TCUWTJJ6pLMWm4i7GNzV1O/CUzzOx+O7M7Dtd1A3wF5sAX4DPwB/gN/AR+AN+B1aUgswu2BVABD0qpW601xpittXZrrd0ZY7Zaa5RSt8BD57vgjfoGSBAEK2PMWq7IGLMOgmAFSPfvVX3qViZpmt7LG5Wm6X2XrOpiDapyHOdpzC4u7c5xnKcu2TCu/0lymGwI4+K9uEZg7BVIFQTBSj5YXYFUh33yIcguILwBuFNKbc457na70UGHfJVSG+BuBsyXy+Wv40MrioI4jkc3XhzHFEVx8r2LPQd4PMS23+9Fay2AuK7bW12WZQJIGIaSZVnP5rquAKK1lv1+f4zvEeDZWtuIiJRlKb7vS8dVlFK9YGEYvtrCMDxG9GrzfV/KshQREWttAzz37rq6rmnb9t9FOJuNRnfo27YtdV2f+PTQNU0jSZIIIJ7njUbneZ4AkiSJNE1zFl2lta6OqyXPc4miaHTVRVEkeZ6ffNdaVy+9NFjeh4d6TUO+L+U9acNOdgVNeqlO9kxM+vBN+pRPNpycG7dEKbXRWlfGmLW1trHWNsaYtda66vpEro1bzlQD5F9vYOwJQVIC3gAAAABJRU5ErkJggg=="
        // vertical
        } else {
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kMGAAPFtr03KgAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAABv0lEQVRIx72WvYoiQRSFv+q4a12M3BbawMAnmMjI0ECWSQzqRTqXeQbZtDEyq30BGwY2GREjg40r2HYRoSecDe4mNeKA/TOBfaChoereU3U4t+5V1OMB+A6MgRHwDfgHnIDfwC/gJ7CtShJUrE2BDHjRWj8aY7DWHp1zR+fc2Vp7NMagtX4EXvzeKZ/ED0CiKNpaa/dSA2vtPoqiLSA+thZf/MkkSZLnW0k3m40sl8ubhEmSPHuyzOcqRaaUei27RVEU0uv1JAxDyfO89HZKqVdPVi5XlVTGGPEnlslkUillmYzTKrlERNbr9YXk/VutVqVkVzJ+MEgWRdG2LOh8Pku/35cwDEVrLZ1OR7rdrgyHQymKopTMGyS7rhNp4q7P4krCB4AnrfVB7gSt9QF4CoDxbDb7y53gc48DYDSfz782CUrTFKUUg8GANE0bEfncI4A351zeRIY4ji+Oi+O4kXTOuRx4C2gJAXDa7XZ/mmxeLBYAxHF8+a+Dz30CyIwx2b1cZ4zJ3mupFXu3WrCtPUGtPqqttYlWG1+rrby14eTWuCVa64MxJrPW7p1zuXMut9bujTGZrxOpG7dUWwPkfygcHtlJuYQSAAAAAElFTkSuQmCC"
        }
      }

      function direction(x, y) {
        var	angle = math.angle(x, y)
        if (angle < 30 || angle >= 330) {
          return "e-resize"
        } else if (angle < 60) {
          return "se-resize"
        } else if (angle < 120) {
          return "s-resize"
        } else if (angle < 150) {
          return "sw-resize"
        } else if (angle < 210) {
          return "w-resize"
        } else if (angle < 240) {
          return "nw-resize"
        } else if (angle < 300) {
          return "n-resize"
        } else {
          return "ne-resize"
        }
      }

      function shouldSticky(x, y) {
        return options["stickyScroll"] && /*state.stickyScroll && */math.hypot(x, y) < options["dragThreshold"]
      }

      function scale(value) {
        return value / options["moveSpeed"]
      }

      var e = document.createElement("iframe")
      //e.src = chrome.runtime.getURL("data/AutoScroll.html")
      e.style.setProperty("display", "none", "important")
      e.style.setProperty("position", "fixed", "important")
      e.style.setProperty("padding", "0px", "important")
      e.style.setProperty("margin", "0px", "important")
      e.style.setProperty("left", "0px", "important")
      e.style.setProperty("top", "0px", "important")
      e.style.setProperty("width", "100%", "important")
      e.style.setProperty("height", "100%", "important")
      e.style.setProperty("background-color", "transparent", "important")
      e.style.setProperty("z-index", "2147483647", "important") // 32-bit signed int
      e.style.setProperty("border", "none", "important")
      parent.appendChild(e)

      var inner = e.contentDocument.body

      // TODO
      //e.contentDocument.insertBefore(e.contentDocument.implementation.createDocumentType("html", "", ""), e.contentDocument.childNodes[0])
      //console.log(e.contentDocument.compatMode, e.contentDocument.doctype, document.doctype)

      function stopScroll(e) {
        if (e.stopImmediatePropagation) {
          e.stopImmediatePropagation()
        }
        e.stopPropagation()
      }

      function unclick() {
        cycle.stop()
        inner.style.removeProperty("cursor")
        inner.style.setProperty("display", "none", "important")
        e.style.setProperty("display", "none", "important")
        delete state.oldX
        delete state.oldY
        delete state.click

        // Force relayout
        getComputedStyle(inner).left;
        getComputedStyle(e).left;
        getComputedStyle(eCursor).left;

        removeEventListener("scroll", stopScroll, true)
      }

      function normalCursor() {
        inner.style.removeProperty("cursor")
        //inner.style.setProperty("cursor", "default")
        //inner.style.setProperty("cursor", "all-scroll")
      }

/*
      // TODO: not sure if "paste" is the right event for this, but it works for now
      addEventListener("paste", function (event) {
        console.log("HIYA", state.isScrolling)
        if (state.isScrolling) {
          event.preventDefault()
        }
      }, true)*/

      // TODO these don't seem to be working correctly...
      //addEventListener("blur", unclick, true)
      //inner.addEventListener("blur", unclick, true)

      inner.addEventListener("mousewheel", function (event) {
        event.preventDefault()
      }, true)

      inner.addEventListener("mousemove", function (event) {
        var x = event.clientX - state.oldX,
            y = event.clientY - state.oldY

        if (math.hypot(x, y) > options["moveThreshold"]) {
          //state.stickyScroll = false;

          inner.style.setProperty("cursor", direction(x, y))

          // 10 = 5
          // 5  = 10
          // 1  = 50
          if (options["sameSpeed"]) {
            x = math.max(x, 1) * 50
            //(Options.get("moveSpeed") * 0.04);
            y = math.max(y, 1) * 50
            //(Options.get("moveSpeed") * 0.04);
          }

          x = scale(x)
          y = scale(y)

          if (options["shouldCap"]) {
            x = math.max(x, options["capSpeed"])
            y = math.max(y, options["capSpeed"])
          }

          cycle.dirX = Math.round(x) | 0
          cycle.dirY = Math.round(y) | 0
        } else {
          normalCursor()

          cycle.dirX = 0
          cycle.dirY = 0
        }
      }, true)
/*
      inner.addEventListener("mousedown", function () {
        unclick()
      }, true)*/

      inner.addEventListener("mouseup", function (event) {
        var x = event.clientX - state.oldX,
            y = event.clientY - state.oldY

        if (state.click || !shouldSticky(x, y)) {
          unclick()
        } else {
          state.click = true
        }
      }, true)

      var eCursor = document.createElement("img")
      eCursor.style.setProperty("position", "absolute")
      inner.appendChild(eCursor)

      function show(o, x, y) {
        state.oldX = x
        state.oldY = y

        addEventListener("scroll", stopScroll, true)

        normalCursor()
        eCursor.setAttribute("src", image(o))
        eCursor.style.setProperty("left", (x - 13) + "px")
        eCursor.style.setProperty("top",  (y - 13) + "px")
        inner.style.setProperty("display", "block", "important")
        e.style.setProperty("display", "block", "important")
        cycle.start(o.element)
      }

      f(show)
    }


    var htmlNode = document.documentElement

    function isInvalid(elem) {
      if (options["scrollOnLinks"]) {
        return false
      // <input> tags can't have children, so the only time it will ever occur is as event.target
      } else if (elem.localName === "input") {
        return !(elem.type === "button"   ||
                 elem.type === "checkbox" ||
                 elem.type === "file"     ||
                 elem.type === "hidden"   ||
                 elem.type === "image"    ||
                 elem.type === "radio"    ||
                 elem.type === "reset"    ||
                 elem.type === "submit")
      } else {
        while (true) {
          if (elem === document.body || elem === htmlNode) {
            return false
          } else if (elem.localName === "a" && elem.href || elem.localName === "textarea") {
            return true
          } else {
            elem = elem.parentNode
          }
        }
      }
    }

    function canScroll(elem, style) {
      return style === "auto" || style === "scroll"
    }

    function canScrollTop(elem, style) {
      return style === "auto" || style === "scroll" || style === "visible"
    }

    function hasWidth(elem, can) {
      var style = getComputedStyle(elem)
      return can(elem, style.overflowX) && elem.scrollWidth > elem.clientWidth
    }

    function hasHeight(elem, can) {
      var style = getComputedStyle(elem)
      return can(elem, style.overflowY) && elem.scrollHeight > elem.clientHeight
    }

    function findScroll(elem) {
      if (options["innerScroll"]) {
        while (elem !== document &&
               elem !== document.body &&
               elem !== htmlNode) {

          var width  = hasWidth(elem, canScroll)
            , height = hasHeight(elem, canScroll)

          if (width || height) {
            return {
              element: elem,
              width:   width,
              height:  height
            }

          } else {
            elem = elem.parentNode
          }
        }
      }

      //if (document.compatMode === "BackCompat") {

      var body_width  = hasWidth(document.body, canScrollTop);
      var body_height = hasHeight(document.body, canScrollTop);

      var html_width  = hasWidth(htmlNode, canScrollTop);
      var html_height = hasHeight(htmlNode, canScrollTop);

      var width  = (body_width  || html_width);
      var height = (body_height || html_height);

      if (width || height) {
        return {
          element: document.body,
          width:   width,
          height:  height
        };
      } else {
        return null;
      }
    }

    function getBody(x) {
      if (x === null) {
        return null;

      } else {
        return {
          element: (x.element === htmlNode ? document.body : x.element),
          width:   x.width,
          height:  x.height
        }
      }
    }

    // TODO would be useful for other extensions too
    function ready(f) {
      if (document.body) {
        f()
      } else {
        var observer = new MutationObserver(function () {
          if (document.body) {
            observer.disconnect()
            f()
          }
        })
        observer.observe(htmlNode, { childList: true })
      }
    }

    ready(function () {
      make(document.body, function (show) {
        addEventListener("mousedown", function (e) {
          if (((e.button === 1 && options.middleClick) ||
               (e.button === 0 && (e.ctrlKey || e.metaKey) && options.ctrlClick)) &&
              e.clientX < htmlNode.clientWidth &&
              !isInvalid(e.target)) {
            var elem = getBody(findScroll(e.target))
            if (elem !== null) {
              if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation()
              }
              e.stopPropagation()
              e.preventDefault()
              show(elem, e.clientX, e.clientY)
            }
          }
        }, true)
      })
    })
  })
})()
