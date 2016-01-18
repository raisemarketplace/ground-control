'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultLoader = function defaultLoader() {
  return _react2.default.createElement('div', null);
};

exports.default = function (routes) {
  var force = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  return (0, _lodash.map)(routes, function (route) {
    if (!route.normalized || force) {
      route.normalized = true;

      if (!route.reducer) {
        route.reducer = function (state) {
          return state;
        };
      }

      if (!route.loader) {
        route.loader = defaultLoader;
      }

      route.blockRender = true;
      route.loading = true;
      route.loadingError = null;
    }

    return route;
  });
};