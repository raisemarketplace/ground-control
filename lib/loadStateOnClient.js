'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _matchRoutes = require('react-router/lib/matchRoutes');

var _matchRoutes2 = _interopRequireDefault(_matchRoutes);

var _RouteUtils = require('react-router/lib/RouteUtils');

var _reactRouter = require('react-router');

var _normalizeRoutes = require('./normalizeRoutes');

var _normalizeRoutes2 = _interopRequireDefault(_normalizeRoutes);

var _deserialize = require('./deserialize');

var _deserialize2 = _interopRequireDefault(_deserialize);

var _constants = require('./constants');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialData = _constants.IS_CLIENT && typeof __INITIAL_DATA__ !== 'undefined' ? __INITIAL_DATA__ : null; /* global __INITIAL_DATA__ */

var defaultData = {};
var cachedData = null;

var deserializeRoutes = function deserializeRoutes(routes, hydratedRoutes) {
  return (0, _lodash.map)((0, _normalizeRoutes2.default)(routes), function (route, index) {
    var hydratedRoute = hydratedRoutes[index];
    route.blockRender = hydratedRoute.blockRender;
    route.loadingError = hydratedRoute.loadingError;
    route.loading = hydratedRoute.loading;
    return route;
  });
};

exports.default = function (_ref, cb) {
  var routes = _ref.routes;
  var deserializer = _ref.deserializer;

  if (cachedData) {
    cb(cachedData);
    return;
  }

  if (initialData) {
    (function () {
      var hydratedState = initialData.initialState;
      var hydratedRoutes = initialData.initialRoutes;

      var unlisten = _reactRouter.browserHistory.listen(function (location) {
        (0, _matchRoutes2.default)((0, _RouteUtils.createRoutes)(routes), location, function (err, matchedRoutes) {
          if (err) cb(defaultData);
          var initialRoutes = deserializeRoutes(matchedRoutes.routes, hydratedRoutes);
          var initialState = (0, _deserialize2.default)(hydratedState, initialRoutes, deserializer);

          cachedData = { initialRoutes: initialRoutes, initialState: initialState };
          cb(cachedData);
        });
      });

      unlisten();
    })();
  } else {
    cb(defaultData);
  }
};