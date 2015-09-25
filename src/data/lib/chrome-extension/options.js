// TODO don't like the reliance on chrome
document.title = chrome.runtime.getManifest().name + " - Options"

define(function (require, exports) {
  "use strict";

  var ui = require("../util/ui") // TODO don't like this dependency

  var changes = {
    // TODO a bit of a hack
    item: ui.style(function (e) {
      e.set("border-color",     ui.hsl(0, 50, 60), "important")
      e.set("background-color", ui.hsl(0, 50, 96), "important")
    }),

    categoryBackground: ui.hsl(0, 0, 99),
    button:             ui.hsl(211, 75, 99),
    buttonHover:        ui.hsl(211, 100, 92),
    //font:               ui.hsl(211, 100, 20),
    fontShadow:         ui.hsl(211, 30, 30, 0.15),
    background:         ui.hsl(211, 13, 35)
  }

  exports.subgroup = (function () {
    var top = ui.style(function (e) {
      e.set("font-weight", "bold")
      e.set("margin-bottom", "6px")
    })

    var bottom = ui.style(function (e) {
      e.set("margin-left", "12px")
    })

    return function (e, s, f) {
      ui.box(function (e) {
        ui.box(function (e) {
          e.styles(top)
          e.text(s)
        }).move(e)

        ui.box(function (e) {
          e.styles(bottom)
          f(e)
        }).move(e)
      }).move(e)
    }
  })({})

  exports.textbox = (function () {
    var textbox = ui.style(function (e) {
      //e.set("top", "-1px")
      e.set("box-shadow", "0px 0px 3px " + ui.hsl(0, 0, 0, 0.5))
      
      e.set(["margin-top", "margin-bottom"], "2px")
      e.set(["margin-left", "margin-right"], "3px")

      e.set("border-width", "1px")
      e.set("border-radius", "3px")
      e.set("border-color", "dimgray")

      e.set("text-align", "center")
      e.set("width", "3em")
      e.set("background-color", changes.button)
    })

    return function (e, oOpt, info) {
      return ui.textbox(function (e) {
        e.styles(textbox)

        if (info.width != null) {
          e.style(function (e) {
            e.set("width", info.width)
          })
        }

        var def = info.default

        if (def != null) {
          if (info.get == null) {
            e.title("Default: " + def)
          } else {
            e.title("Default: " + info.get(def))
          }
        }
        
        // TODO check that def is a number ?
        if (info.type === "number" && def == null) {
          throw new Error("must provide default when type is \"number\"")
        }

        e.bind([oOpt], function (x) {
          e.styleWhen(changes.item, def != null && x !== def)
        })
        
        function setValue(x) {
          if (info.get != null) {
            x = info.get(x)
          }
          e.value.set(x)
        }

        e.bind([oOpt], function (x) {
          setValue(x)
        })

        // TODO should also save on blur
        e.event([e.changed], function (x) {
          if (info.set != null) {
            x = info.set(x)
          }
          // TODO don't rely on the global isNaN
          if (info.type === "number" && (typeof x !== "number" || isNaN(x))) {
            x = def
          }
          oOpt.set(x)
          setValue(x)
        })
      }).move(e)
    }
  })()

  exports.checkbox = (function () {
    var wrapper = ui.style(function (e) {
      e.set("display", "inline-block")
      e.set(["margin-top", "margin-bottom"], "1px")
    })

    var label = ui.style(function (e) {
      e.set("padding", "1px 3px")
      e.set("border-width", "1px")
      e.set("border-radius", "5px")
    })

    var checkbox = ui.style(function (e) {
      e.set("margin-right", "3px")
    })

    return function (e, oOpt, info) {
      ui.box(function (e) {
        e.styles(wrapper)

        ui.label(function (e) {
          var def = info.default

          e.styles(ui.horiz, label)

          if (def != null) {
            e.title("Default: " + def)
          }

          e.bind([oOpt], function (x) {
            e.styleWhen(changes.item, x !== def)
          })

          ui.checkbox(function (e) {
            e.styles(checkbox)

            e.bind([oOpt], function (x) {
              e.checked.set(x)
              // TODO this doesn't work but should
              /*if (x === def) {
                e.border(function (t) {
                  t.color("")
                })
              } else {
                e.border(function (t) {
                  t.color("blue")
                })
              }*/
            })

            e.event([e.changed], function (x) {
              oOpt.set(x)
            })
          }).move(e)

          if (info.text != null) {
            e.addText(info.text)
          }
        }).move(e)
      }).move(e)
    }
  })()

  exports.category = (function () {
    var category = ui.style(function (e) {
      e.set("border-width", "1px")
      e.set("border-style", "outset")
      e.set("border-color", ui.hsl(0, 0, 15, 1))
      e.set("border-radius", "5px")

      e.set("background-color", changes.categoryBackground)

      e.set("padding-top", "5px")
      e.set(["padding-left", "padding-bottom", "padding-right"], "10px")

      e.set("box-shadow", "1px 1px 10px 1px " + ui.hsl(0, 0, 0, 0.5))
      //e.width("100%") // TODO is this needed?

      e.set("margin-bottom", "30px")
    })

    var header = ui.style(function (e) {
      e.set("font-size", "20px")
      e.set("color", ui.hsl(0, 0, 0, 0.8))
      e.set("letter-spacing", "1px")
      e.set("font-variant", "small-caps")
      e.set("text-shadow", "1px 1px 2px " + changes.fontShadow)
    })

    var separator = ui.style(function (e) {
      e.set("background-color", ui.hsl(0, 0, 0, 0.05))
      e.set("margin-top", "0px")
      e.set("margin-bottom", ui.calc("0.5em", "+", "2px")) // TODO a bit hacky
    })

    var content = ui.style(function (e) {
      e.set("padding", "0px 10px")
    })

    return function (e, s, f) {
      ui.row(function (e) {
        ui.cell(function (e) {
          ui.box(function (e) {
            e.styles(category)

            // TODO maybe make a ui.header function ?
            ui.element("h1", function (e) {
              e.styles(header)
              e.text(s)
            }).move(e)

            ui.separator(function (e) {
              e.styles(separator)
            }).move(e)

            ui.box(function (e) {
              e.styles(content)
              f(e)
            }).move(e)
          }).move(e)
        }).move(e)
      }).move(e)
    }
  })()

  exports.separator = (function () {
    var separator = ui.style(function (e) {
      e.set("margin-top", "0.5em")
      e.set("margin-bottom", ui.calc("0.5em", "+", "2px")) // TODO a bit hacky
    })

    return function (e) {
      ui.separator(function (e) {
        e.styles(separator)
      }).move(e)
    }
  })()

  exports.list = (function () {
    var list = ui.style(function (e) {
      e.set("height", "20px")
      e.set("box-shadow", "0px 0px 5px lightgray")
      e.set("padding-left", "1px")
      e.set("margin-top", "-2px")
      //e.set("top", "-2px")
      e.set("border-width", "1px")
      e.set("border-radius", "3px")
      e.set("text-shadow", "0px 1px 0px white")
      e.set("background-image", ui.gradient("to bottom", ["0%",   "transparent"],
                                                         ["20%",  "rgba(0, 0, 0, 0.04)"],
                                                         ["70%",  "rgba(0, 0, 0, 0.05)"],
                                                         ["100%", "rgba(0, 0, 0, 0.1)"]))
      e.set("background-color", changes.button)
      e.set("border-color", [ui.hsl(0, 0, 65),            // Top
                             ui.hsl(0, 0, 55),            // Right
                             ui.hsl(0, 0, 55),            // Bottom
                             ui.hsl(0, 0, 65)].join(" ")) // Left
    })

    return function (e, oOpt, info) {
      return ui.list(function (eTop) {
        eTop.styles(list)

        var def = info.default

        ;(function anon(a, e) {
          // TODO "iter" module ?
          a.forEach(function (x) {
            if (x.group != null) {
              ui.listGroup(function (e) {
                e.label(x.group)
                anon(x.items, e)
              }).move(e)
            } else if (x.separator) {
              ui.listGroup().move(e)
              // TODO replace with this when it works better
              //ui.separator(function (e) {}).move(e)

              /*ui.listGroup(function (e) {
                e.font(function (t) {
                  t.size("2px")
                })
              }).move(e)

              ui.listGroup(function (e) {
                e.font(function (t) {
                  t.size("1px")
                })
                e.background(function (t) {
                  // TODO code duplication with "ui/menu" module
                  t.color("gainsboro")
                })
              }).move(e)

              ui.listGroup(function (e) {
                e.font(function (t) {
                  t.size("2px")
                })
              }).move(e)*/
            } else {
              if (def != null && x.value === def) {
                eTop.title("Default: " + x.name)
              }
              ui.listItem(function (e) {
                e.text(x.name)
                e.value(x.value) // TODO is this necessary ?
                e.bind([oOpt], function (v) {
                  if (v === x.value) {
                    e.select()
                  }
                })
              }).move(e)
            }
          })
        })(info.items, eTop)

        eTop.bind([oOpt], function (x) {
          eTop.styleWhen(changes.item, def != null && x !== def)
        })

        eTop.event([eTop.changed], function (value) {
          oOpt.set(value)
        })
      }).move(e)
    }
  })()

  exports.radio = (function () {
    var radioId = 0

    var radio = ui.style(function (e) {
      e.set("margin-right", "2px")
    })

    var shrink = ui.style(function (e) {
      e.set("display", "inline-block")
      // TODO code duplication with "checkbox" module
      e.set("padding", "1px 3px")
      e.set("border-width", "1px")
      e.set("border-radius", "5px")
    })

    return function (e, oOpt, info) {
      var def = info.default

      return ui.box(function (e) {
        e.styles(shrink)

        e.bind([oOpt], function (x) {
          e.styleWhen(changes.item, def != null && x !== def)
        })

        var sRadioId = "__radio" + (++radioId)

        info.items.forEach(function (x) {
          if (def != null && x.value === def) {
            e.title("Default: " + x.name)
          }

          ui.label(function (e) {
            e.styles(ui.horiz)

            ui.radio(function (e) {
              e.styles(radio)
              e.name(sRadioId)
              e.value(x.value) // TODO is this necessary ?

              e.bind([oOpt], function (v) {
                if (v === x.value) {
                  e.checked.set(true)
                }
              })

              /*e.bind([oOpt], function (x) {
                if (x === def) {
                  e.border(function (t) {
                    t.color(color.hsl(0, 0, 65) + " " +
                            color.hsl(0, 0, 55) + " " +
                            color.hsl(0, 0, 55) + " " +
                            color.hsl(0, 0, 65))
                  })
                } else {
                  e.border(function (t) {
                    t.color("blue")
                  })
                }
              })*/

              e.event([e.changed], function () {
                oOpt.set(x.value)
              })
            }).move(e)

            e.addText(x.name)
          }).move(e)
        })
      }).move(e)
    }
  })()

  exports.button = (function () {
    var button = ui.style(function (e) {
      e.set("height", "24px")
      //o.set("minHeight", "22px")
      e.set("padding-top", "1px")
      e.set(["padding-left", "padding-right"], "14px")
      e.set("padding-bottom", "2px")

      e.set("border-width", "1px")
      e.set("border-radius", "3px")
      e.set("text-shadow", "0px 1px 0px white")
      e.set("background-color", changes.button)

      e.set("box-shadow", "1px 1px 4px rgba(0, 0, 0, 0.1)")
      e.set("border-color", [ui.hsl(0, 0, 65),
                             ui.hsl(0, 0, 55),
                             ui.hsl(0, 0, 55),
                             ui.hsl(0, 0, 65)].join(" "))
      e.set("background-image", ui.gradient("to bottom", ["0%",   "transparent"],
                                                         ["20%",  "rgba(0, 0, 0, 0.04)"],
                                                         ["70%",  "rgba(0, 0, 0, 0.05)"],
                                                         ["100%", "rgba(0, 0, 0, 0.1 )"]))
    })

    var hover = ui.style(function (e) {
      e.set("background-color", changes.buttonHover)
        //t.color(color.hsl(215, 100, 94)) /*! #e6f0ff */
    })

    var click = ui.style(function (e) {
      e.set("padding-bottom", "0px")

      e.set("box-shadow", "none")
      e.set("border-color", ["gray", "silver", "silver", "gray"].join(" "))
      e.set("background-image", ui.gradient("to bottom", ["0%",   "transparent"],
                                                         ["15%",  "rgba(0, 0, 0, 0.05)"],
                                                         ["85%",  "rgba(0, 0, 0, 0.06)"],
                                                         ["100%", "rgba(0, 0, 0, 0.1)"]))
    })

    return function (e, s, f) {
      return ui.button(function (e) {
        e.styles(button)
        e.text(s)

        /*o.rule("button:disabled", function (o) {
          o.cursor = "default"
          o.opacity = "0.5"
        })*/

        /*o.color = "black"
        font: menu;
        font-size: 14px;*/

        e.bind([e.mouseover], function (over) {
          e.styleWhen(hover, over)
        })

        // TODO test this
        e.bind([e.mouseover, e.mousedown], function (over, down) {
          e.styleWhen(click, over && down.left)
        })

        e.event([e.mouseclick], function (click) {
          if (click.left) {
            f()
          }
        })
      }).move(e)
    }
  })()

  exports.normalize = (function () {
    var body = ui.style(function (e) {
      //e.overflow = "auto"

      e.set("font-family", "sans-serif")
      e.set("font-size", "13px")

      e.set("padding-top", "29px")
      e.set("padding-right", "45px")

      e.set("background-attachment", "fixed")
      //t.color("#6BACCF")
      e.set("background-color", changes.background)
      //t.repeat("repeat-x")
      // TODO position top left ?
      e.set("background-image", ui.gradient("to bottom", ["0%",   "transparent"],
                                                         ["100%", "rgba(0, 0, 0, 0.1)"]))
    })
    
    var table = ui.style(function (e) {
      e.set("white-space", "pre-wrap")
      e.set(["margin-left", "margin-right"], "auto")
    })

    return function (f) {
      return ui.normalize(function (e) {
        e.styles(body)
        e.stopDragging()
        ui.table(function (e) {
          e.styles(table)
          f(e)
        }).move(e)
      })
    }
  })()
})