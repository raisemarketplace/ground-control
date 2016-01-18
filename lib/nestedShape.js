'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateRootShape = exports.setShape = undefined;

var _lodash = require('lodash');

var _constants = require('./constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var setShape = exports.setShape = function setShape(self, child) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, _constants.SELF, self), _defineProperty(_ref, _constants.CHILD, child), _ref;
};

var validateRootShape = exports.validateRootShape = function validateRootShape(state) {
  return (0, _lodash.isObject)(state) && state.hasOwnProperty(_constants.NAMESPACE) && (state[_constants.NAMESPACE].hasOwnProperty(_constants.SELF) || state[_constants.NAMESPACE].hasOwnProperty(_constants.CHILD));
};