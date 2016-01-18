'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.omitNestedState = exports.nestedStateValid = exports.setNestedState = exports.getNestedState = undefined;

var _constants = require('./constants');

var _nestedShape = require('./nestedShape');

var _lodash = require('lodash');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var NORMALIZED_ROOT = '@@NORMALIZED_ROOT';

var keyForDepth = function keyForDepth(depth) {
  if (depth < 0) return null;
  return (0, _lodash.reduce)(Array(depth), function (result) {
    return result + ('[' + _constants.CHILD + ']');
  }, '[' + NORMALIZED_ROOT + ']');
};

var normalizeStateShape = function normalizeStateShape(state) {
  return _defineProperty({}, NORMALIZED_ROOT, state);
};

var scopedState = function scopedState(state) {
  var fromNamespace = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  return fromNamespace ? state[_constants.NAMESPACE] : state;
};

var getNestedState = exports.getNestedState = function getNestedState(state) {
  var depth = arguments.length <= 1 || arguments[1] === undefined ? _constants.ROOT_DEPTH : arguments[1];
  var fromNamespace = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
  var key = arguments.length <= 3 || arguments[3] === undefined ? _constants.SELF : arguments[3];

  var normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  var nestedState = (0, _lodash.get)(normalizedState, keyForDepth(depth));
  return nestedState ? (0, _lodash.get)(nestedState, key) : nestedState;
};

var setNestedState = exports.setNestedState = function setNestedState(state, data, depth) {
  var fromNamespace = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  var key = keyForDepth(depth);
  var normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  var currentStateAtDepth = (0, _lodash.get)(normalizedState, key);
  var updatedStateAtDepth = (0, _lodash.set)(currentStateAtDepth, _constants.SELF, data);
  return (0, _lodash.set)(normalizedState, key, updatedStateAtDepth)[NORMALIZED_ROOT];
};

var nestedStateValid = exports.nestedStateValid = function nestedStateValid(state, depth) {
  var fromNamespace = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  if (!state) return false;
  var valid = (0, _lodash.partial)(getNestedState, state, depth, fromNamespace);
  return !!valid(_constants.SELF) || !!valid(_constants.CHILD);
};

var omitNestedState = exports.omitNestedState = function omitNestedState(state, depth) {
  var fromNamespace = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  var key = keyForDepth(depth);
  var normalizedState = normalizeStateShape(scopedState(state, fromNamespace));
  return (0, _lodash.set)(normalizedState, key, (0, _nestedShape.setShape)())[NORMALIZED_ROOT];
};