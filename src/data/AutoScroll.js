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

    dirX: 0,
    dirY: 0,

    click: false,
    scrolling: false
  }

  var htmlNamespace = "http://www.w3.org/1999/xhtml"

  var htmlNode = document.documentElement

  // This is needed to support SVG
  var bodyNode = (document.body
                   ? document.body
                   : htmlNode)

  // The timer that does the actual scrolling; must be very fast so that the scrolling is smooth
  function startCycle(elem, scroller, root) {
    // This is needed to support SVG
    var scrollX = (root ? window.scrollX : scroller.scrollLeft)
      , scrollY = (root ? window.scrollY : scroller.scrollTop)

    function loop() {
      state.timeout = requestAnimationFrame(loop)

      var scrollWidth  = scroller.scrollWidth  - elem.clientWidth
        , scrollHeight = scroller.scrollHeight - elem.clientHeight

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

      // This is needed to support SVG
      if (root) {
        // This triggers a reflow
        window.scroll(scrollX, scrollY);

      } else {
        // This triggers a reflow
        scroller.scrollLeft = scrollX
        scroller.scrollTop  = scrollY
      }
    }

    loop();
  }


  function shouldSticky(x, y) {
    return options["stickyScroll"] && /*state.stickyScroll && */math.hypot(x, y) < options["dragThreshold"]
  }

  function scale(value) {
    return value / options["moveSpeed"]
  }


  // This is needed to make AutoScroll work in SVG documents
  var outer = document.createElementNS(htmlNamespace, "AutoScroll")


  // TODO replace with `attachShadow` once it's supported in Chrome
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/createShadowRoot
  var shadow = (outer.createShadowRoot
                 ? outer.createShadowRoot()
                 // TODO hack for Chrome 29 to 34, remove this later
                 : outer.webkitCreateShadowRoot())

  // This is needed to make AutoScroll work in SVG documents
  var inner = document.createElementNS(htmlNamespace, "div")
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
    // TODO is this a good idea ?
    stopEvent(event, true)
  }

  function mousemove(event) {
    // TODO is this a good idea ?
    stopEvent(event, true)

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
    // TODO is this a good idea ?
    stopEvent(event, true)

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

    removeEventListener("wheel", mousewheel, true)
    removeEventListener("mousemove", mousemove, true)
    removeEventListener("mouseup", mouseup, true)

    normalCursor()

    inner.style.removeProperty("background-image")
    inner.style.removeProperty("background-position")
    inner.style.setProperty("display", "none")

    state.timeout = null

    state.oldX = null
    state.oldY = null

    state.dirX = 0
    state.dirY = 0

    state.click = false
    state.scrolling = false
  }

  function normalCursor() {
    inner.style.removeProperty("cursor")
  }

  function show(o, x, y) {
    state.scrolling = true
    state.oldX = x
    state.oldY = y

    startCycle(o.element, o.scroller, o.root)

    addEventListener("wheel", mousewheel, true)
    addEventListener("mousemove", mousemove, true)
    addEventListener("mouseup", mouseup, true)

    inner.style.setProperty("background-image", "url(\"" + image(o) + "\")")
    inner.style.setProperty("background-position", (x - 13) + "px " +
                                                   (y - 13) + "px")

    inner.style.removeProperty("display")
  }


  function isInvalid(elem) {
    return elem.isContentEditable ||
           (elem.localName === "a" && elem.href) ||
           (elem.localName === "textarea") ||
           (elem.localName === "input");
  }

  function isValid(elem) {
    if (options["scrollOnLinks"]) {
      return true

    } else {
      while (true) {
        if (elem === document ||
            elem === htmlNode ||
            elem === bodyNode) {
          return true

        } else if (isInvalid(elem)) {
          return false

        } else {
          elem = elem.parentNode
        }
      }
    }
  }


  function canScroll(style) {
    return style === "auto" || style === "scroll"
  }

  /**
   * Shows scrollbar:
   *   <html>   <body>
   *   visible  visible
   *   visible  auto
   *   visible  scroll
   *   auto     visible
   *   auto     auto
   *   auto     scroll
   *   auto     hidden
   *   scroll   visible
   *   scroll   auto
   *   scroll   scroll
   *   scroll   hidden
   *
   * Does not show scrollbar:
   *   <html>   <body>
   *   visible  hidden
   *   hidden   visible
   *   hidden   auto
   *   hidden   scroll
   *   hidden   hidden
   */
  function canScrollTop(html, body) {
    switch (html) {
    case "visible":
      return body !== "hidden";

    case "auto":
    case "scroll":
      return true;

    default:
      return false;
    }
  }


  // TODO this isn't quite correct, but it's close enough
  function findScrollTop(element) {
    var scroller = (document.scrollingElement
                     ? document.scrollingElement
                     : bodyNode)

    var htmlStyle = getComputedStyle(htmlNode)
    var bodyStyle = getComputedStyle(bodyNode)

    var width = canScrollTop(htmlStyle.overflowX, bodyStyle.overflowX) &&
                scroller.scrollWidth > element.clientWidth

    var height = canScrollTop(htmlStyle.overflowY, bodyStyle.overflowY) &&
                 scroller.scrollHeight > element.clientHeight

    if (width || height) {
      return {
        element:  element,
        scroller: scroller,
        width:    width,
        height:   height,
        root:     true
      };

    } else {
      return null;
    }
  }

  function findScrollNormal(elem) {
    var style = getComputedStyle(elem)

    var width = canScroll(style.overflowX) &&
                elem.scrollWidth > elem.clientWidth

    var height = canScroll(style.overflowY) &&
                 elem.scrollHeight > elem.clientHeight

    if (width || height) {
      return {
        element:  elem,
        scroller: elem,
        width:    width,
        height:   height,
        root:     false
      }

    } else {
      return null
    }
  }

  // TODO this should handle the case where <body> has its own scrollbar (separate from the viewport's scrollbar)
  function findScroll(elem) {
    if (options["innerScroll"]) {
      while (elem !== document &&
             elem !== htmlNode &&
             elem !== bodyNode) {

        var x = findScrollNormal(elem)

        if (x === null) {
          elem = elem.parentNode

        } else {
          return x
        }
      }
    }

    // TODO hack needed to work around non-spec-compliant versions of Chrome
    //      https://code.google.com/p/chromium/issues/detail?id=157855
    if (document.compatMode === "CSS1Compat") {
      return findScrollTop(htmlNode);

    } else {
      return findScrollTop(bodyNode);
    }
  }

  function stopEvent(e, preventDefault) {
    e.stopImmediatePropagation()
    e.stopPropagation()

    if (preventDefault) {
      e.preventDefault()
    }
  }


  htmlNode.appendChild(outer)

  addEventListener("mousedown", function (e) {
    if (state.scrolling) {
      stopEvent(e, false)

    } else {
      if (((e.button === 1 && options["middleClick"]) ||
           (e.button === 0 && (e.ctrlKey || e.metaKey) && options["ctrlClick"])) &&
          // Make sure the click is not on a scrollbar
          // TODO what about using middle click on the scrollbar of a non-<html> element ?
          e.clientX < htmlNode.clientWidth &&
          e.clientY < htmlNode.clientHeight &&
          isValid(e.target)) {

        var elem = findScroll(e.target)

        if (elem !== null) {
          stopEvent(e, false)
          show(elem, e.clientX, e.clientY)
        }
      }
    }
  }, true)
})
