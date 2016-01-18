'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _loadAsyncState = require('./loadAsyncState');

var _loadAsyncState2 = _interopRequireDefault(_loadAsyncState);

var _normalizeRoutes = require('./normalizeRoutes');

var _normalizeRoutes2 = _interopRequireDefault(_normalizeRoutes);

var _nestReducers = require('./nestReducers');

var _createMemoryHistory = require('react-router/lib/createMemoryHistory');

var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);

var _lodash = require('lodash');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var createFetchDataCallback = function createFetchDataCallback(initialRoutes, store, cb) {
  var needToLoadCounter = initialRoutes.length;
  var maybeFinish = function maybeFinish() {
    if (needToLoadCounter === 0) {
      var initialState = store.getState();
      var initialData = { initialState: initialState, initialRoutes: initialRoutes };
      var json = JSON.stringify(initialData);
      var scriptString = '<script>window.__INITIAL_DATA__=' + json + ';</script>';
      cb(null, null, initialData, scriptString);
    }
  };

  return function (err, redirect, type, route, index) {
    if (err) cb(err);
    if (redirect) {
      var pathname = redirect.pathname;
      var query = redirect.query;
      var state = redirect.state;

      var history = (0, _createMemoryHistory2.default)();
      var search = undefined;
      if (query && !(0, _lodash.isEmpty)(query)) {
        search = (0, _lodash.reduce)(query, function (result, item, key) {
          var pair = key + '=' + item;
          if (result.length > 1) pair = '&' + pair;
          return '' + result + pair;
        }, '?');
      }

      cb(null, history.createLocation({
        pathname: pathname,
        search: search,
        state: state
      }, 'REPLACE'));
    }

    if (type === _constants.FD_DONE || type === _constants.FD_SERVER_RENDER) {
      initialRoutes[index].blockRender = false;
      if (type === _constants.FD_DONE) {
        initialRoutes[index].loading = false;
      }
      --needToLoadCounter;
      maybeFinish();
    }
  };
};

// on server, route is still active bc blocking!
var stillActiveCallback = function stillActiveCallback() {
  return true;
};
var useHydratedData = false;

exports.default = function (_ref, cb) {
  var props = _ref.props;
  var store = _ref.store;
  var reducers = _ref.reducers;
  var routes = props.routes;
  var location = props.location;

  var initialRoutes = (0, _normalizeRoutes2.default)(routes);
  var fetchDataCallback = createFetchDataCallback(initialRoutes, store, cb);
  var routeReducers = (0, _lodash.map)(initialRoutes, function (route) {
    return route.reducer;
  });

  _nestReducers.nestAndReplaceReducersAndState.apply(undefined, [store, _constants.ROOT_DEPTH, reducers].concat(_toConsumableArray(routeReducers)));

  (0, _loadAsyncState2.default)(initialRoutes, location.query, store, fetchDataCallback, stillActiveCallback, useHydratedData);
};