"use strict";

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


  // TODO replace with SVG
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
    var angle = math.angle(x, y)
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


  var state = {
    timeout: null,

    oldX: null,
    oldY: null,

    dirX: null,
    dirY: null,

    click: false
  }

  var htmlNode = document.documentElement

  // The timer that does the actual scrolling; must be very fast so that the scrolling is smooth
  function startCycle(elem) {
    var scrollElem = (elem === htmlNode ? document.body : elem);

    var scrollX = scrollElem.scrollLeft
      , scrollY = scrollElem.scrollTop

    function loop() {
      state.timeout = requestAnimationFrame(loop)

      var scrollWidth  = elem.scrollWidth  - elem.clientWidth
        , scrollHeight = elem.scrollHeight - elem.clientHeight

      scrollX += state.dirX
      scrollY += state.dirY

      if (scrollX < 0) {
        scrollX = 0

      } else if (scrollX > scrollWidth) {
        scrollX = scrollWidth
      }

      if (scrollY < 0) {
        scrollY = 0

      } else if (scrollY > scrollHeight) {
        scrollY = scrollHeight
      }

      // This triggers a reflow
      scrollElem.scrollLeft = scrollX
      scrollElem.scrollTop  = scrollY
    }

    loop();
  }


  function shouldSticky(x, y) {
    return options["stickyScroll"] && /*state.stickyScroll && */math.hypot(x, y) < options["dragThreshold"]
  }

  function scale(value) {
    return value / options["moveSpeed"]
  }


  var root = document.createElement("div")

  // TODO replace with `attachShadow` once it's supported in Chrome
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/createShadowRoot
  var shadow = root.createShadowRoot()

  var inner = document.createElement("div")
  // TODO hack to make it so that Chrome doesn't repaint when scrolling
  inner.style.setProperty("transform", "translateZ(0)")
  inner.style.setProperty("display", "none")
  inner.style.setProperty("position", "fixed")
  inner.style.setProperty("left", "0px")
  inner.style.setProperty("top", "0px")
  inner.style.setProperty("width", "100%")
  inner.style.setProperty("height", "100%")
  inner.style.setProperty("z-index", "2147483647") // 32-bit signed int
  inner.style.setProperty("background-repeat", "no-repeat")

  shadow.appendChild(inner)


  function mousewheel(event) {
    event.preventDefault()
  }

  function mousemove(event) {
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

      state.dirX = x
      state.dirY = y

    } else {
      normalCursor()

      state.dirX = 0
      state.dirY = 0
    }
  }

  function mouseup(event) {
    var x = event.clientX - state.oldX,
        y = event.clientY - state.oldY

    if (state.click || !shouldSticky(x, y)) {
      unclick()
    } else {
      state.click = true
    }
  }

  function unclick() {
    cancelAnimationFrame(state.timeout)

    removeEventListener("mousewheel", mousewheel, true)
    removeEventListener("mousemove", mousemove, true)
    removeEventListener("mouseup", mouseup, true)

    normalCursor()

    inner.style.removeProperty("background-image")
    inner.style.removeProperty("background-position")
    inner.style.setProperty("display", "none")

    state.timeout = null

    state.oldX = null
    state.oldY = null

    state.dirX = null
    state.dirY = null

    state.click = false

    // Force relayout
    //getComputedStyle(root).left;
    //getComputedStyle(inner).left;
  }

  function normalCursor() {
    inner.style.removeProperty("cursor")
  }

  function show(o, x, y) {
    state.oldX = x
    state.oldY = y

    startCycle(o.element)

    addEventListener("mousewheel", mousewheel, true)
    addEventListener("mousemove", mousemove, true)
    addEventListener("mouseup", mouseup, true)

    inner.style.setProperty("background-image", "url(\"" + image(o) + "\")")
    inner.style.setProperty("background-position", (x - 13) + "px " +
                                                   (y - 13) + "px")

    inner.style.removeProperty("display")
  }


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

    if (body_width || body_height) {
      return {
        element: document.body,
        width:   body_width,
        height:  body_height
      };

    } else {
      var html_width  = hasWidth(htmlNode, canScrollTop);
      var html_height = hasHeight(htmlNode, canScrollTop);

      if (html_width || html_height) {
        return {
          element: htmlNode,
          width:   html_width,
          height:  html_height
        };

      } else {
        return null;
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
      // TODO does this need to use childList: true ?
      observer.observe(htmlNode, { childList: true })
    }
  }

  ready(function () {
    document.body.appendChild(root)

    addEventListener("mousedown", function (e) {
      if (((e.button === 1 && options.middleClick) ||
           (e.button === 0 && (e.ctrlKey || e.metaKey) && options.ctrlClick)) &&
          e.clientX < htmlNode.clientWidth &&
          !isInvalid(e.target)) {

        var elem = findScroll(e.target)

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
