"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (previous, next) {
  for (var i = 0, l = next.length; i < l; i++) {
    if (previous[i] !== next[i]) {
      return i;
    }
  }

  return null;
};