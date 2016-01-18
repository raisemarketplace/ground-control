'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nestedState = require('./nestedState');

var _nestedShape = require('./nestedShape');

var _lodash = require('lodash');

var _constants = require('./constants');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = function (state, routes) {
  var deserializer = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var updatedState = (0, _lodash.merge)({}, state);
  if (!(0, _nestedShape.validateRootShape)(updatedState)) {
    return _extends({}, updatedState, _defineProperty({}, _constants.NAMESPACE, (0, _nestedShape.setShape)()));
  }

  (0, _lodash.forEach)(routes, function (route, index) {
    var dataAtDepth = (0, _nestedState.getNestedState)(updatedState, index);

    var deserializedData = undefined;
    if (route.deserializer) {
      deserializedData = route.deserializer(dataAtDepth);
    } else if (deserializer) {
      deserializedData = deserializer(route, dataAtDepth);
    } else {
      deserializedData = dataAtDepth;
    }

    updatedState[_constants.NAMESPACE] = (0, _nestedState.setNestedState)(state, deserializedData, index);
  });

  return updatedState;
};