define(function () {
  "use strict";

  function create(x) {
    return Object.create(x)
  }

  function isObject(x) {
    return x === Object(x)
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:egal
  function is(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1 / x === 1 / y
    }

    // NaN !== NaN, but they are identical.
    // NaNs are the only non-reflexive value, i.e., if x !== x,
    // then x is a NaN.
    // isNaN is broken: it converts its argument to number, so
    // isNaN("foo") => true
    return x !== x && y !== y
  }

  function isnt(x, y) {
    return !is(x, y)
  }

  function iso(x, y) {
    if (is(x, y)) {
      return true
    } else if (isObject(x) && isObject(y)) {
      var s
      for (s in x) {
        if (!(s in y && iso(x[s], y[s]))) {
          return false
        }
      }
      for (s in y) {
        if (!(s in x)) {
          return false
        }
      }
      return true
    } else {
      return false
    }
  }

  function merge(x) {
    x = create(x)
    for (var i = 1, iLen = arguments.length; i < iLen; ++i) {
      var y = arguments[i]
      for (var s in y) {
        if ({}.hasOwnProperty.call(y, s)) {
          x[s] = y[s]
        }
      }
    }
    return x
  }
  
  function deepMerge(x, y) {
    if (isObject(y)) {
      if (!isObject(x)) {
        x = {}
      }
      for (var s in y) {
        if ({}.hasOwnProperty.call(y, s)) {
          x[s] = deepMerge(x[s], y[s])
        }
      }
      return x
    } else {
      return y
    }
  }

  function clone(x) {
    var y = {}
    for (var s in x) {
      if ({}.hasOwnProperty.call(x, s)) {
        y[s] = x[s]
      }
    }
    return y
  }

  function deepClone(x) {
    var y = {}
    for (var s in x) {
      if ({}.hasOwnProperty.call(x, s)) {
        if (isObject(x[s])) {
          y[s] = deepClone(x[s])
        } else {
          y[s] = x[s]
        }
      }
    }
    return y
  }

  function set(o, k, v) {
    if (k in o) {
      o = Object.create(o)
    }
    o[k] = v
    return o
  }

  return Object.freeze({
    create: create,
    is: is,
    isnt: isnt,

    // Non-standard
    isObject: isObject,
    iso: iso,
    merge: merge,
    deepMerge: deepMerge,
    clone: clone,
    deepClone: deepClone,
    set: set,
  })
})
