'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nestAndReplaceReducersAndState = exports.nestAndReplaceReducers = undefined;

var _constants = require('./constants');

var _nestedState = require('./nestedState');

var _nestedShape = require('./nestedShape');

var _redux = require('redux');

var _lodash = require('lodash');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var nestReducers = function nestReducers() {
  for (var _len = arguments.length, routeReducers = Array(_len), _key = 0; _key < _len; _key++) {
    routeReducers[_key] = arguments[_key];
  }

  return function (state, action) {
    var currentState = state;
    if (action.type === _constants.REHYDRATE_REDUCERS) {
      currentState = action.state;
    }

    return (0, _lodash.reduceRight)(routeReducers, function (result, reducer, depth) {
      var previousState = (0, _nestedState.getNestedState)(currentState, depth, false);
      var nextState = reducer(previousState, action);
      if (result) return (0, _nestedShape.setShape)(nextState, result);
      return (0, _nestedShape.setShape)(nextState);
    }, null);
  };
};

var nestAndReplaceReducers = exports.nestAndReplaceReducers = function nestAndReplaceReducers(store, baseReducers) {
  for (var _len2 = arguments.length, routeReducers = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    routeReducers[_key2 - 2] = arguments[_key2];
  }

  var otherReducers = (0, _lodash.omit)(baseReducers, _constants.NAMESPACE);
  var nestedReducer = nestReducers.apply(undefined, routeReducers);
  var reducers = _extends({}, otherReducers, _defineProperty({}, _constants.NAMESPACE, nestedReducer));
  var reducer = (0, _redux.combineReducers)(reducers);
  store.replaceReducer(reducer);
};

var nestAndReplaceReducersAndState = exports.nestAndReplaceReducersAndState = function nestAndReplaceReducersAndState(store, depth, baseReducers) {
  for (var _len3 = arguments.length, routeReducers = Array(_len3 > 3 ? _len3 - 3 : 0), _key3 = 3; _key3 < _len3; _key3++) {
    routeReducers[_key3 - 3] = arguments[_key3];
  }

  var adjustedState = (0, _nestedState.omitNestedState)(store.getState(), depth);
  nestAndReplaceReducers.apply(undefined, [store, baseReducers].concat(routeReducers));
  store.dispatch({ type: _constants.REHYDRATE_REDUCERS, state: adjustedState });
};