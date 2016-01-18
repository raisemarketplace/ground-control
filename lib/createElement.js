'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _nestedState = require('./nestedState');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (store, serializer, Component, props) {
  var routes = props.routes;
  var route = props.route;

  if (route.blockRender) {
    return route.loader(props);
  }

  var depth = undefined;
  (0, _lodash.forEach)(routes, function (_, index) {
    if (routes[index] === route) {
      depth = index;
    }
  });

  var state = store.getState();
  var dispatch = store.dispatch;
  var finalGetNestedState = (0, _lodash.partial)(_nestedState.getNestedState, state);
  var getStateAndSerialize = function getStateAndSerialize(requestedDepth) {
    var nestedState = finalGetNestedState(requestedDepth);
    var routeForRequested = !!routes[requestedDepth] ? routes[requestedDepth] : null;
    if (routeForRequested) {
      if (routeForRequested.serializer) {
        return routeForRequested.serializer(nestedState);
      }
      return serializer(routeForRequested, nestedState);
    }

    return nestedState;
  };

  var data = getStateAndSerialize(depth);
  var rootData = getStateAndSerialize(_constants.ROOT_DEPTH);

  var getRelativeParentData = function getRelativeParentData() {
    var requestedDepth = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

    if (!(0, _lodash.isNumber)(requestedDepth)) return null;
    return getStateAndSerialize(depth - Math.abs(requestedDepth));
  };

  return _react2.default.createElement(Component, _extends({}, props, {
    loading: route.loading,
    loadingError: route.loadingError,
    getRelativeParentData: getRelativeParentData,
    dispatch: dispatch,
    rootData: rootData,
    data: data
  }));
};