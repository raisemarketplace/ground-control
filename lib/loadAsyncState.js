'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _nestedState = require('./nestedState');

var _constants = require('./constants');

var isClient = function isClient() {
  return _constants.IS_CLIENT;
};
var isServer = function isServer() {
  return _constants.IS_SERVER;
};

var _stillActive = function _stillActive(cb, route, index) {
  return cb(route, index);
};
var _done = function _done(cb, route, index) {
  return cb(null, null, _constants.FD_DONE, route, index);
};
var _err = function _err(cb, route, index) {
  var errorObject = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  return cb(errorObject, null, null, route, index);
};
var _redirect = function _redirect(cb, redirectObject) {
  return cb(null, redirectObject);
};
var _clientRender = function _clientRender(cb, route, index) {
  return cb(null, null, _constants.FD_CLIENT_RENDER, route, index);
};
var _serverRender = function _serverRender(cb, route, index) {
  if (_constants.IS_SERVER) cb(null, null, _constants.FD_SERVER_RENDER, route, index);
};

exports.default = function (routes, params, store, fetchDataCallback, stillActive, useInitialState) {
  var initialState = arguments.length <= 6 || arguments[6] === undefined ? {} : arguments[6];
  var dispatch = store.dispatch;
  var getState = store.getState;

  if (routes.length > 0) {
    (function () {
      var isHydrated = function isHydrated() {
        return useInitialState;
      };
      (0, _lodash.forEach)(routes, function (route, index) {
        var isMounted = (0, _lodash.partial)(_stillActive, stillActive, route, index);
        var done = (0, _lodash.partial)(_done, fetchDataCallback, route, index);
        var clientRender = (0, _lodash.partial)(_clientRender, fetchDataCallback, route, index);
        var serverRender = (0, _lodash.partial)(_serverRender, fetchDataCallback, route, index);
        var err = (0, _lodash.partial)(_err, fetchDataCallback, route, index);
        var redirect = (0, _lodash.partial)(_redirect, fetchDataCallback);

        var hydratedDataForRoute = function hydratedDataForRoute() {
          if (useInitialState) return (0, _nestedState.getNestedState)(initialState, index);
          return null;
        };

        if (route.fetchData) {
          route.fetchData(done, {
            clientRender: clientRender, serverRender: serverRender, redirect: redirect, err: err,
            params: params, dispatch: dispatch, getState: getState, isMounted: isMounted, isClient: isClient,
            isHydrated: isHydrated, hydratedDataForRoute: hydratedDataForRoute, isServer: isServer
          });
        } else {
          done();
        }
      });
    })();
  }
};