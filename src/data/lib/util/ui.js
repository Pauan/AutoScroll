define(["./name", "./cell"], function (name, oCell) {
  "use strict";

  var styleIds = 0

  var highestZIndex = "2147483647" /* 32-bit signed int */

  var _e       = new name.Name()
    , _styles  = new name.Name()
    , bindings = new name.Name()

  function isOver(self, e) {
    return !self.contains(e.relatedTarget)
  }

  function addRule(document, s, f) {
    var e = document.createElement("style")
    e.type = "text/css"
    document.head.appendChild(e)

    var sheet = document.styleSheets[document.styleSheets.length - 1]
    sheet.insertRule(s + "{}", sheet.cssRules.length) //sheet.addRule(s)

    return f(sheet.cssRules[sheet.cssRules.length - 1].style)
  }

  var specialStyles = {
    "filter": ["-webkit-filter"]
  }

  function isSameStyle(x, y) {
    if (x === null) {
      x = ""
    }
    if (y === null) {
      y = ""
    }
    return x === y
  }

  var styleProto = {
    set: function (s, v, type) {
      if (type == null) {
        type = ""
      }
      var self = this
      if (Array.isArray(s)) {
        // TODO use "iter" module ?
        s.forEach(function (s) {
          self.set(s, v, type)
        })
      // TODO if v is null, convert it to ""
      //      http://dev.w3.org/csswg/cssom/#the-cssstyledeclaration-interface
      // TODO if v is not a string, throw an error
      } else {
        var props = (specialStyles[s] != null
                      ? specialStyles[s]
                      : [s])
        var sOld = props.map(function (s) {
          return self[_e].getPropertyValue(s)
        })
        props.forEach(function (s) {
          self[_e].setProperty(s, v, type)
        })
        var every = props.every(function (s, i) {
          var sNew = self[_e].getPropertyValue(s)
                                     // TODO a bit hacky ?
          return sOld[i] === sNew && !isSameStyle(v, sNew)
        })
        if (every) {
          throw new Error(s + ": " + v)
        }
      }
    }
  }

  var styleProto2 = Object.create(styleProto)
  styleProto2.styles = function () {
    var a = this[_styles]
    // TODO "iter" module ?
    ;[].slice.call(arguments).forEach(function (x) {
      a.push(x)
    })
  }

  function style(f) {
    var name = "_" + (++styleIds)
    var o = Object.create(styleProto2)
    o.name = name
    o[_styles] = []
    addRule(document, "." + name, function (e) {
      o[_e] = e
      Object.freeze(o) // TODO remove this later ?
      f(o)
    })
    return o
  }

  function addStyleTo(r, o, a) {
    a.forEach(function (x) {
      addStyleTo(r, o, x[_styles])
      var s = x.name
      if (o[s] == null) {
        o[s] = 0
        r.push(s)
      }
      ++o[s]
    })
  }

  function removeStyleFrom(r, o, a) {
    a.forEach(function (x) {
      var s = x.name
      if (o[s] != null) {
        --o[s]
        if (o[s] === 0) {
          delete o[s]
          r.push(s)
        }
        removeStyleFrom(r, o, x[_styles])
      }
    })
  }

  var Box = {
    style: function (f) {
      // TODO remove this eventually
      if (arguments.length > 1) {
        throw new Error()
      }
      var o = Object.create(styleProto)
      o[_e] = this[_e].style
      Object.freeze(o) // TODO remove this later ?
      f(o)
    },
    styles: function () {
      this[_styles] = {}

      var r = []
      addStyleTo(r, this[_styles], [].slice.call(arguments))

      this[_e].className = r.join(" ")
    },
    styleWhen: function (x, b) {
      var self = this[_e]
        , o    = this[_styles]
      if (b) {
        var s = x.name
        if (o[s] == null) {
          var r = []
          addStyleTo(r, o, [x])
          r.forEach(function (s) {
            self.classList.add(s)
          })
        }
      } else {
        var r = []
        removeStyleFrom(r, o, [x])
        r.forEach(function (s) {
          self.classList.remove(s)
        })
      }
    },
    styleObject: function (o, prop, b) {
      b = (b && o[prop] != null)
      if (b) {
        this.styleWhen(o[prop], true)
      }
      // TODO use "iter" module
      for (var s in o) {
        if (!(b && s === prop)) {
          this.styleWhen(o[s], false)
        }
      }
    },
    name: function (s) {
      this[_e].name = s
    },
    addText: function (s) {
      this[_e].appendChild(document.createTextNode(s || ""))
    },
    /*previous: function () {
      var e = this[_e].previousSibling
      while (true) {
        if (e) {
          if (_e in e) {
            return e[_e]
          } else {
            e = e.previousSibling
          }
        } else {
          return e
        }
      }
    },
    next: function () {
      var e = this[_e].nextSibling
      while (true) {
        if (e) {
          if (_e in e) {
            return e[_e]
          } else {
            e = e.nextSibling
          }
        } else {
          return e
        }
      }
    },*/
    dom: function () {
      return this[_e]
    },
    // TODO test the false version
    autofocus: function (b) {
      this[_e].autofocus = b
    },
    stopDragging: function () {
      this[_e].addEventListener("selectstart", function (e) {
        if (e.target.localName !== "input") { // && !e.target.draggable
          e.preventDefault()
        }
      }, true)
    },
    move: function (e) {
      e[_e].appendChild(this[_e])
      return this
    },
    moveBefore: function (e, x) {
      if (x) {
        e[_e].insertBefore(this[_e], x[_e])
      } else {
        e[_e].appendChild(this[_e])
      }
    },
    /*replace: function (e) {
      e[_e].parentNode.replaceChild(this[_e], e[_e])
    },*/

    text: function (s) {
      this[_e].textContent = s || ""
    },
    remove: function () {
      this.removed = true
      var self = this[_e]
      if (self.parentNode) {
        self.parentNode.removeChild(self)
      }
    },
    bind: function (a, f) {
      var o = oCell.bind(a, f)
      this[bindings].push(o)
      return o
    },
    event: function (a, f) {
      var o = oCell.event(a, f)
      this[bindings].push(o)
      return o
    },
    title: function (s) {
      this[_e].title = s
    },
    isHidden: function () {
      return !!this[_e].hidden
    },
    hide: function () {
      this[_e].hidden = true
    },
    show: function () {
      this[_e].hidden = false
    },
    getPosition: function () {
      return this[_e].getBoundingClientRect()
    },
    // TODO this should only apply to certain things, like radio buttons and <option>s
    value: function (s) {
      this[_e].value = s
    }
  }

  var ListItem = Object.create(Box)
  ListItem.select = function () {
    this[_e].selected = true
  }

  var ListGroup = Object.create(Box)
  ListGroup.label = function (s) {
    this[_e].label = s
  }

  var Table = Object.create(Box)
  Table.rowspan = function (s) {
    this[_e].rowSpan = s
  }

  var Image = Object.create(Box)
  Image.alt = function (s) {
    this[_e].alt = s
  }
  Image.src = function (s) {
    this[_e].src = s
  }

  var IFrame = Object.create(Box)
  IFrame.src = function (s) {
    this[_e].src = s
  }
  IFrame.sandbox = function (s) {
    this[_e].sandbox = s || ""
  }
  IFrame.seamless = function () {
    this[_e].setAttribute("seamless", "") // TODO remove this later
    this[_e].seamless = true
  }
  IFrame.getWindow = function () {
    return this[_e].contentWindow
  }

  var Link = Object.create(Box)
  Link.src = function (s) {
    this[_e].href = s
  }
  Link.download = function (s) {
    this[_e].download = s
  }
  Link.click = function () {
    this[_e].click()
  }

  var File = Object.create(Box)
  File.accept = function (s) {
    this[_e].accept = s
  }
  File.click = function () {
    this[_e].click()
  }

  function remove(x) {
    var e = x[_e]
    if (e.removed) {
      x[_e] = null

      e[bindings].forEach(function (x) {
        x.unbind()
      })
      e[_e] = null
      e[bindings] = null
      e.mouseclick = null
      e.mousedown = null
      e.mouseover = null
      e.value = null
    }
  }

  function make(constructor, o) {
    var e = Object.create(constructor)
    o[_e]       = e
    e[_e]       = o
    e[bindings] = []
    e[_styles]  = {}

    // TODO maybe needs to bind the events even if the cell isn't bound
    // TODO if the window loses focus and refocuses, it doesn't update properly
    e.focused = oCell.dedupe(false, {
      bind: function (self) {
        o.tabIndex = -1

        function focus() {
          self.set(document.hasFocus())
        }

        function blur() {
          self.set(false)
        }

        o.addEventListener("focus", focus, true)
        o.addEventListener("blur", blur, true)

        return {
          focus: focus,
          blur: blur
        }
      },
      unbind: function (e) {
        o.tabIndex = ""
        o.removeEventListener("focus", e.focus, true)
        o.removeEventListener("blur", e.blur, true)
      },
      set: function (self, b) {
        if (b) {
          o.focus()
        } else {
          o.blur()
        }
      }
    })

    // TODO closures
    e.mouseclick = oCell.dedupe(undefined, {
      bind: function (self) {
        function click(e) {
          e.preventDefault()
          var oEvent = { left:   (e.button === 0)
                       , middle: (e.button === 1)
                       , right:  false
                       , mouseX: e.clientX
                       , mouseY: e.clientY
                       , shift:  e.shiftKey
                       , ctrl:   (e.ctrlKey || e.metaKey)
                       , alt:    e.altKey }
          oEvent[_e] = e.target
          self.set(oEvent)
        }

        function contextmenu(e) {
          e.preventDefault()
          var oEvent = { left:   false
                       , middle: false
                       , right:  true
                       , mouseX: e.clientX
                       , mouseY: e.clientY
                       , shift:  e.shiftKey
                       , ctrl:   (e.ctrlKey || e.metaKey)
                       , alt:    e.altKey }
          oEvent[_e] = e.target
          self.set(oEvent)
        }

        o.addEventListener("click", click, true)
        o.addEventListener("contextmenu", contextmenu, true)

        return {
          click: click,
          contextmenu: contextmenu
        }
      },
      unbind: function (e) {
        o.removeEventListener("click", e.click, true)
        o.removeEventListener("contextmenu", e.contextmenu, true)
      }
    })

    function makeSeen(seen, e) {
      var o    = {}
      o.left   = seen.left
      o.middle = seen.middle
      o.right  = seen.right
      o[_e]    = e
      return o
    }

    var seen = { left: false, middle: false, right: false }
                              // TODO is this correct?
    e.mousedown = oCell.dedupe(makeSeen(seen, o), {
      bind: function (self) {
        function contextmenu(e) {
          e.preventDefault()
        }

        function mousedown(e) {
          if (e.button === 0) {
            seen.left = true
          } else if (e.button === 1) {
            seen.middle = true
          } else if (e.button === 2) {
            seen.right = true
          }
          self.set(makeSeen(seen, e.target))

          addEventListener("mouseup", function anon(f) {
            if (f.button === e.button) {
              removeEventListener("mouseup", anon, true)
              if (e.button === 0) {
                seen.left = false
              } else if (e.button === 1) {
                seen.middle = false
              } else if (e.button === 2) {
                seen.right = false
              }
              self.set(makeSeen(seen, e.target))
            }
          }, true)
        }

        // TODO blur
        o.addEventListener("contextmenu", contextmenu, true)
        o.addEventListener("mousedown", mousedown, true)

        return {
          contextmenu: contextmenu,
          mousedown: mousedown
        }
      },
      unbind: function (e) {
        o.removeEventListener("contextmenu", e.contextmenu, true)
        o.removeEventListener("mousedown", e.mousedown, true)
      }
    })

    e.mouseover = oCell.dedupe(false, {
      bind: function (self) {
        function mouseover(e) {
          if (isOver(o, e)) {
            var oEvent = { mouseX: e.clientX, mouseY: e.clientY }
            oEvent[_e] = e.target // TODO why is this here?
            self.set(oEvent)
          }
        }

        function mouseout(e) {
          if (isOver(o, e)) {
            self.set(false)
          }
        }

        // TODO blur
        o.addEventListener("mouseover", mouseover, true)
        o.addEventListener("mouseout", mouseout, true)

        return {
          mouseover: mouseover,
          mouseout: mouseout
        }
      },
      unbind: function (e) {
        o.removeEventListener("mouseover", e.mouseover, true)
        o.removeEventListener("mouseout", e.mouseout, true)
      }
    })

    return e
  }

  function call(f, e) {
    if (f != null) {
      f(e)
    }
    return e
  }

  addRule(document, "[hidden]", function (o) {
    o.setProperty("display", "none", "important")
  })

  /*addRule(document, ".clip *", function (o) {
    o.overflow = "hidden"
    o.textOverflow = "ellipsis"
  })*/

  addRule(document, "[data-box]", function (o) {
    o.MozBoxSizing = "border-box" // TODO
    o.boxSizing = "border-box"

    o.margin = "0px"
    o.padding = "0px"

    //o.whiteSpace = "pre-wrap" // TODO

    o.backgroundColor = "transparent"

    // TODO I wish there was a way to get rid of these two
    o.borderWidth = "0px"
    o.borderColor = "transparent"
    o.borderStyle = "solid"

    o.outlineWidth = "0px"
    o.outlineStyle = "solid"

    o.flexGrow = "0"
    o.flexShrink = "0" // "1"
    o.flexBasis = "auto" // TODO try out other stuff like min-content once it becomes available

    o.position = "relative"

    o.backgroundSize = "100% 100%"

    o.cursor = "inherit"

    o.verticalAlign = "middle"

    //o.verticalAlign = "top" // TODO needed in Firefox
    //o.tableLayout = "fixed"
    //o.backgroundClip = "padding-box" // TODO content-box
  })

  /*addRule(document, ".horiz > *", function (o) {
    o.display = "inline-block"
    //o.cssFloat = "left"
    //o.padding = "0px"
    o.height = "100%"
    //o.whiteSpace = "normal"
    //o.width = "100%"
  })*/

  /*addRule(document, ".vert > *", function (o) {

    //o.width = "100%"
  })*/

  addRule(document, "[data-body]", function (o) {
    o.cursor = "default"
  })

  addRule(document, "[data-separator]", function (o) {
    o.height = "1px"
    o.marginTop = o.marginBottom = "0.5em"
    o.backgroundColor = "rgb(238, 238, 238)"
  })

  addRule(document, "[data-button]", function (o) {
    o.outline = "none"
    o.cursor = "pointer"
  })

  addRule(document, "[data-list]", function (o) {
    o.outline = "none"
    //o.display = "block"
    /*o.position = "relative"
    o.top = "-2px"*/
  })

  addRule(document, "[data-table]", function (o) {
    o.borderSpacing = "0px"
  })

  addRule(document, "[data-text]", function (o) {
    o.cursor = "auto"
  })

  addRule(document, "[data-search]", function (o) {
    o.border = "none"
    o.outline = "none"
    //o.margin = "0px"

    o.cursor = "auto"

    //o.backgroundColor = "white"
    //o.color = "black"
  })

  addRule(document, "[data-checkbox]", function (o) {
    o.marginTop = "1px"
    //o.position = "relative"
    //o.top = "-1px"
    //o.marginRight = "3px"
  })

  var horiz = style(function (e) {
    e.set("display", "flex")
    e.set("flex-direction", "row")
    e.set("align-items", "center")
  })

  var vert = style(function (e) {
    e.set("display", "flex")
    e.set("flex-direction", "column")
  })

  var panel = style(function (e) {
    e.set("position", "absolute")
    e.set("z-index", highestZIndex)
  })

  var fixedPanel = style(function (e) {
    e.set("position", "fixed")
    e.set("z-index", highestZIndex)
  })

  var shrink = style(function (e) {
    // e.set("display", "inline-block")
    e.set("flex-shrink", "1")
  })

  var clip = style(function (e) {
    e.set("overflow", "hidden")
    e.set("text-overflow", "ellipsis")
  })

  var stretch = style(function (e) {
    e.set("flex-shrink", "1")
    e.set("flex-grow", "1")
    e.set("flex-basis", "0%")
  })

  function normalize(f) {
    document.body.dataset["box"] = ""
    document.body.dataset["body"] = ""

    addRule(document, "html, body", function (o) {
      //o.margin = "0px"
      o.width = "100%"
      o.height = "100%"
    })

    /*addRule(document, "*", function (o) {
      //o.textOverflow = "ellipsis"

      //o.overflow = "hidden"
      //o.textOverflow = "ellipsis"
      //o.minWidth = "0px"
      //o.minHeight = "0px"
      //o.whiteSpace = "pre"
    })*/

    new MutationObserver(function (a) {
      a.forEach(function (x) {
        if (x.type === "childList") {
          ;[].forEach.call(x.removedNodes, function (x) {
            if (_e in x) {
              remove(x)
            }
          })
        }
      })
    }).observe(document.body, {
      childList: true,
      subtree: true,
    })

    //var o = document.createElement("div")
    //o.className = "vert"
    //o.style.width = o.style.height = "100%"
    //document.body.appendChild(o)
    return call(f, make(Box, document.body))
  }

  /*function calculate(x) {
    var s, s2
    if (x[_e].className === "vert") {
      s  = "height"
      s2 = "offsetHeight"
    } else if (x[_e].className === "horiz") {
      s  = "width"
      s2 = "offsetWidth"
    } else {
      throw new Error("can only add elements to horiz or vert elements")
    }

    var size  = 0
      , elems = []
    ;[].forEach.call(x[_e].children, function (x) {
      if (x.style[s] === "") {
        elems.push(x)
      } else {
        size += x[s2]
      }
    })

    var len = calc((100 / elems.length) + "%", "-", size + "px")
    console.log(len)
    elems.forEach(function (x) {
      x.style[s] = len
    })
  }*/

  function box(f) {
    var o = document.createElement("div")
    o.dataset["box"] = ""
    //calculate(x)
    return call(f, make(Box, o))
  }

  // TODO remove this ?
  function element(s, f) {
    var o = document.createElement(s)
    o.dataset["box"] = ""
    return call(f, make(Box, o))
  }

  function label(f) {
    var o = document.createElement("label")
    o.dataset["box"] = ""
    return call(f, make(Box, o))
  }

  function separator(f) {
    var o = document.createElement("hr")
    o.dataset["box"] = ""
    o.dataset["separator"] = ""
    return call(f, make(Box, o))
  }

  function checkbox(f) {
    var o = document.createElement("input")
    o.dataset["box"] = ""
    o.dataset["checkbox"] = ""
    o.type = "checkbox"

    var e = make(Box, o)

    // TODO closure
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change() {
          self.set(o.checked)
        }

        o.addEventListener("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })

    // indeterminate has priority
    // TODO closure
    // TODO should <cell>.get() trigger <cell>bind() ?
    // TODO maybe this can ignore duplicates ?
    e.checked = oCell.value(o.indeterminate ? null : o.checked, {
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (b) {
          self.set(o.indeterminate ? null : b)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        if (x === null) {
          o.checked = false
          o.indeterminate = true
        } else {
          o.checked = x
          o.indeterminate = false
        }
      }
    })

    return call(f, e)
  }

  function radio(f) {
    var o = document.createElement("input")
    o.dataset["box"] = ""
    o.dataset["checkbox"] = ""
    o.type = "radio"

    var e = make(Box, o)

    // TODO closure
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change() {
          self.set(o.checked)
        }

        o.addEventListener("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })

    // indeterminate has priority
    // TODO code duplication with checkbox
    // TODO closure
    // TODO should <cell>.get() trigger <cell>bind() ?
    // TODO maybe this can ignore duplicates ?
    e.checked = oCell.value(o.indeterminate ? null : o.checked, {
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (b) {
          self.set(o.indeterminate ? null : b)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        if (x === null) {
          o.checked = false
          o.indeterminate = true
        } else {
          o.checked = x
          o.indeterminate = false
        }
      }
    })

    return call(f, e)
  }

  function list(f) {
    var o = document.createElement("select")
    o.dataset["box"] = ""
    o.dataset["list"] = ""

    var e = make(Box, o)

    // TODO closure
    // TODO maybe this can ignore duplicates
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change() {
          //var x = o.options[o.selectedIndex]
          self.set(o.value)
        }

        o.addEventListener("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })

    return call(f, e)
  }

  function listItem(f) {
    var o = document.createElement("option")
    o.dataset["box"] = ""
    return call(f, make(ListItem, o))
  }

  function listGroup(f) {
    var o = document.createElement("optgroup")
    o.dataset["box"] = ""
    return call(f, make(ListGroup, o))
  }

  function search(f) {
    var o = document.createElement("input")
    o.dataset["box"] = ""
    o.dataset["search"] = ""
    o.type = "search"
    o.incremental = true
    o.autocomplete = "off"
    o.placeholder = "Search"
    o.setAttribute("results", "")
    //calculate(x)

    var e = make(Box, o)

    // TODO closure
    e.value = oCell.dedupe(o.value, {
      bind: function (self) {
        console.log("HIYA")

        function search() {
          self.set(o.value)
        }

        o.addEventListener("search", search, true)

        return {
          search: search
        }
      },
      unbind: function (e) {
        o.removeEventListener("search", e.search, true)
      },
      set: function (self, x) {
        o.value = x
      }
    })

    return call(f, e)
  }

  function textbox(f) {
    var o = document.createElement("input")
    o.dataset["box"] = ""
    o.dataset["text"] = ""
    o.type = "text"

    var e = make(Box, o)

    // TODO closure
    // TODO code duplication
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change() {
          e.value.set(o.value)
          self.set(o.value)
        }

        o.addEventListener("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })

    // TODO closure
    // TODO code duplication
    // TODO should <cell>.get() trigger <cell>bind() ?
    e.value = oCell.dedupe(o.value, {
      // TODO is all this stuff necessary ?
      bind: function (self) {
        // TODO is this correct; does it leak; is it inefficient; can it be replaced with cell.map ?
        return e.event([e.changed], function (x) {
          self.set(x)
        })
      },
      unbind: function (e) {
        e.unbind()
      },
      set: function (self, x) {
        o.value = x
      }
    })

    return call(f, e)
  }

  function textarea(f) {
    var o = document.createElement("textarea")
    o.dataset["box"] = ""

    var e = make(Box, o)

    // TODO closure
    // TODO code duplication
    e.value = oCell.dedupe(o.value, {
      bind: function (self) {
        function input() {
          self.set(o.value)
        }

        o.addEventListener("input", input, true)

        return {
          input: input
        }
      },
      unbind: function (e) {
        o.removeEventListener("input", e.input, true)
      },
      set: function (self, x) {
        o.value = x
      }
    })

    return call(f, e)
  }

  function link(f) {
    var o = document.createElement("a")
    o.dataset["box"] = ""
    return call(f, make(Link, o))
  }

  function iframe(f) {
    var o = document.createElement("iframe")
    o.dataset["box"] = ""
    return call(f, make(IFrame, o))
  }

  function file(f) {
    var o = document.createElement("input")
    o.dataset["box"] = ""
    o.type = "file"

    o.addEventListener("error", function (e) {
      console.log(e)
      alert("Error: " + JSON.stringify(e))
    }, true)

    var e = make(File, o)

    // TODO closure
    e.changed = oCell.value(undefined, {
      bind: function (self) {
        function change(e) {
          var x = new FileReader()
          x.onerror = x.onabort = function (e) {
            console.log(e)
            alert("Error: " + JSON.stringify(e))
          }
          x.onload = function (e) {
            self.set(e.target.result)
          }
          x.readAsText(e.target.files[0])
        }

        o.addEventListener("change", change, true)

        return {
          change: change
        }
      },
      unbind: function (e) {
        o.removeEventListener("change", e.change, true)
      }
    })

    return call(f, e)
  }

  function image(f) {
    var o = document.createElement("img")
    o.dataset["box"] = ""
    //calculate(x)
    return call(f, make(Image, o))
  }

  function button(f) {
    var o = document.createElement("button")
    o.dataset["box"] = ""
    o.dataset["button"] = ""
    return call(f, make(Box, o))
  }

  function table(f) {
    var o = document.createElement("table")
    o.dataset["box"] = ""
    o.dataset["table"] = ""
    return call(f, make(Box, o))
  }

  function row(f) {
    var o = document.createElement("tr")
    o.dataset["box"] = ""
    return call(f, make(Box, o))
  }

  function cell(f) {
    var o = document.createElement("td")
    o.dataset["box"] = ""
    return call(f, make(Table, o))
  }

  // TODO multi-platform, e.g. -webkit, -moz, etc.
  function calc() {
    return "calc(" + [].slice.call(arguments).join(" ") + ")"
  }

  // TODO multi-platform, e.g. -webkit, -moz, etc.
  function gradient(x) {
    var r = [x]
    ;[].slice.call(arguments, 1).forEach(function (a) {
      r.push(a[1] + " " + a[0])
    })
    return "linear-gradient(" + r.join(",") + ")"
  }

  // TODO multi-platform, e.g. -webkit, -moz, etc.
  function repeatingGradient(x) {
    var r = [x]
    ;[].slice.call(arguments, 1).forEach(function (a) {
      r.push(a[1] + " " + a[0])
    })
    return "repeating-linear-gradient(" + r.join(",") + ")"
  }

  function hsl(hue, sat, light, alpha) {
    if (alpha == null) {
      alpha = 1
    }
    if (alpha === 1) {
      return "hsl(" + hue + ", " + sat + "%, " + light + "%)"
    } else {
      return "hsla(" + hue + ", " + sat + "%, " + light + "%, " + alpha + ")"
    }
  }

  function textStroke(color, blur) {
    return ["-1px -1px " + blur + " " + color,
            "-1px  1px " + blur + " " + color,
            " 1px -1px " + blur + " " + color,
            " 1px  1px " + blur + " " + color].join(",")
  }

  // TODO not completely ideal, but it's the best I've come up with so far...
  function exclude(x, e) {
    return oCell.filter(x.get(), x, function (x) {
      return !x || !e[_e].contains(x[_e])
    })
  }

  function width() {
    return document.documentElement.offsetWidth
  }

  function height() {
    return document.documentElement.offsetHeight
  }

  return Object.freeze({
    gradient: gradient,
    repeatingGradient: repeatingGradient,
    calc: calc,
    exclude: exclude,
    hsl: hsl,
    textStroke: textStroke,
    //highestZIndex: highestZIndex,

    style: style,

    horiz: horiz,
    vert: vert,
    panel: panel,
    fixedPanel: fixedPanel,
    shrink: shrink,
    clip: clip,
    stretch: stretch,

    normalize: normalize,
    box: box,
    search: search,
    textbox: textbox,
    textarea: textarea,
    label: label,
    checkbox: checkbox,
    image: image,
    element: element,
    list: list,
    listItem: listItem,
    listGroup: listGroup,
    button: button,
    link: link,
    file: file,
    radio: radio,
    iframe: iframe,
    separator: separator,

    table: table,
    row: row,
    cell: cell,

    width: width,
    height: height,
  })
})
