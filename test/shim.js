"use strict";

var chrome = {
  shimmed: true,

  storage: {
    local: {
      get: function (opt, f) {
        if (Math.random() < 0.5) {
          f(opt);

        } else {
          setTimeout(function () {
            f(opt);
          }, 1000);
        }
      }
    },

    onChanged: {
      addListener: function (f) {}
    }
  }
};
