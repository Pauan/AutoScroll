// TODO: Not quite correct, but it's the best I can do
define(function () {
  "use strict";

  var id  = 0
    , sId = "__private__0"

  // TODO: s is currently ignored
  function Name(s) {
    if (!(this instanceof Name)) {
      return new Name(s)
    }
    s = this[sId] = "__private__" + (++id)
    // TODO maybe remove this
    this.public = Object.freeze({
      toString: function () {
        return s
      }
    })
    Object.freeze(this)
  }
  Name.prototype.toString = function () {
    return this[sId]
  }
  // TODO should these be frozen?
  Object.freeze(Name)
  Object.freeze(Name.prototype)

  function isName(x) {
    return x instanceof Name
  }

  return Object.freeze({
    Name: Name,
    isName: isName,
  })
})
