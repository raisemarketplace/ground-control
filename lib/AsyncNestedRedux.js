'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNestedState = exports.loadStateOnClient = exports.loadStateOnServer = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _RouterContext = require('react-router/lib/RouterContext');

var _RouterContext2 = _interopRequireDefault(_RouterContext);

var _diffRoutes = require('./diffRoutes');

var _diffRoutes2 = _interopRequireDefault(_diffRoutes);

var _loadAsyncState2 = require('./loadAsyncState');

var _loadAsyncState3 = _interopRequireDefault(_loadAsyncState2);

var _createElement = require('./createElement');

var _createElement2 = _interopRequireDefault(_createElement);

var _normalizeRoutes = require('./normalizeRoutes');

var _normalizeRoutes2 = _interopRequireDefault(_normalizeRoutes);

var _nestedState = require('./nestedState');

var _nestReducers = require('./nestReducers');

var _loadStateOnServer = require('./loadStateOnServer');

var _loadStateOnServer2 = _interopRequireDefault(_loadStateOnServer);

var _loadStateOnClient = require('./loadStateOnClient');

var _loadStateOnClient2 = _interopRequireDefault(_loadStateOnClient);

var _constants = require('./constants');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AsyncNestedRedux = function (_React$Component) {
  _inherits(AsyncNestedRedux, _React$Component);

  function AsyncNestedRedux(props, context) {
    _classCallCheck(this, AsyncNestedRedux);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AsyncNestedRedux).call(this, props, context));

    var initialData = props.initialData;
    var store = props.store;
    var baseRoutes = props.routes;
    var initialState = initialData.initialState;
    var initialRoutes = initialData.initialRoutes;

    var storeState = store.getState();
    var routes = initialRoutes ? initialRoutes : (0, _normalizeRoutes2.default)(baseRoutes);
    var useInitialState = (0, _nestedState.nestedStateValid)(initialState, _constants.ROOT_DEPTH) && (0, _nestedState.nestedStateValid)(storeState, _constants.ROOT_DEPTH);
    var reducers = _this.normalizeReducers();

    _this.state = {
      routes: routes,
      reducers: reducers,
      useInitialState: useInitialState,
      storeState: storeState
    };

    _this.unsubscribe = function () {
      return null;
    };
    _this.nestReducers(useInitialState, routes, _constants.ROOT_DEPTH);
    return _this;
  }

  _createClass(AsyncNestedRedux, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var _props = this.props;
      var location = _props.location;
      var store = _props.store;
      var routes = this.state.routes;

      this.unsubscribe = store.subscribe(function () {
        var storeState = store.getState();
        _this2.setState({ storeState: storeState });
      });

      this.loadAsyncState(routes, location.query, _constants.ROOT_DEPTH);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this3 = this;

      var prevRoutes = this.state.routes;
      var prevLocation = this.props.location;

      var pathChanged = nextProps.location.pathname !== prevLocation.pathname;
      var searchChanged = nextProps.location.search !== prevLocation.search;
      var routeChanged = pathChanged || searchChanged;
      if (!routeChanged) return;

      var location = nextProps.location;
      var routes = nextProps.routes;

      var routeDiff = (0, _diffRoutes2.default)(prevRoutes, routes);
      var sameRoutes = (0, _lodash.take)(routes, routeDiff);
      var differentRoutes = (0, _normalizeRoutes2.default)((0, _lodash.drop)(routes, routeDiff), true);
      var nextRoutes = sameRoutes.concat(differentRoutes);

      var useInitialState = false;
      this.setState({ routes: nextRoutes, useInitialState: useInitialState }, function () {
        _this3.loadAsyncState(nextRoutes, location.query, routeDiff);
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.unsubscribe();
      this._unmounted = true;
    }
  }, {
    key: 'normalizeReducers',
    value: function normalizeReducers() {
      var reducers = this.props.reducers || {};
      reducers[_constants.NAMESPACE] = function () {
        var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        return state;
      };
      return reducers;
    }
  }, {
    key: 'nestReducers',
    value: function nestReducers(useInitialState, routes, replaceAtDepth) {
      var routeReducers = (0, _lodash.map)(routes, function (route) {
        return route.reducer;
      });
      if (useInitialState) {
        _nestReducers.nestAndReplaceReducers.apply(undefined, [this.props.store, this.state.reducers].concat(_toConsumableArray(routeReducers)));
      } else {
        _nestReducers.nestAndReplaceReducersAndState.apply(undefined, [this.props.store, replaceAtDepth, this.state.reducers].concat(_toConsumableArray(routeReducers)));
      }
    }
  }, {
    key: 'fetchDataCallback',
    value: function fetchDataCallback(err, redirect, type, route, index) {
      if (!this._unmounted) {
        var routes = this.state.routes;

        if (routes[index] === route) {
          if (redirect) {
            this.props.router.replace(redirect);
          } else {
            routes[index].blockRender = false;
            if (err) routes[index].loadingError = err;
            if (type === _constants.FD_DONE) routes[index].loading = false;
            this.setState({ routes: routes });
          }
        }
      }
    }
  }, {
    key: 'stillActiveCallback',
    value: function stillActiveCallback(route, index) {
      return this.state.routes[index] === route;
    }
  }, {
    key: 'loadAsyncState',
    value: function loadAsyncState(routes, params, replaceAtDepth) {
      var _props2 = this.props;
      var store = _props2.store;
      var initialData = _props2.initialData;
      var useInitialState = this.state.useInitialState;
      var initialState = initialData.initialState;

      this.nestReducers(useInitialState, routes, replaceAtDepth);
      (0, _loadAsyncState3.default)(routes, params, store, this.fetchDataCallback.bind(this), this.stillActiveCallback.bind(this), useInitialState, initialState);
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.render(this.props, this.state.routes);
    }
  }]);

  return AsyncNestedRedux;
}(_react2.default.Component);

AsyncNestedRedux.propTypes = {
  render: _react2.default.PropTypes.func.isRequired,
  routes: _react2.default.PropTypes.array.isRequired,
  location: _react2.default.PropTypes.object.isRequired,
  router: _react2.default.PropTypes.object.isRequired,
  store: _react2.default.PropTypes.object.isRequired,
  initialData: _react2.default.PropTypes.object.isRequired,
  reducers: _react2.default.PropTypes.object.isRequired,
  serializer: _react2.default.PropTypes.func.isRequired
};
AsyncNestedRedux.defaultProps = {
  initialData: {},
  reducers: {},
  serializer: function serializer(route, state) {
    return state;
  },

  render: function render(props, routes) {
    var finalCreateElement = (0, _lodash.partial)(_createElement2.default, props.store, props.serializer);
    return _react2.default.createElement(_RouterContext2.default, _extends({}, props, { routes: routes, createElement: finalCreateElement }));
  }
};
exports.default = AsyncNestedRedux;
exports.loadStateOnServer = _loadStateOnServer2.default;
exports.loadStateOnClient = _loadStateOnClient2.default;
exports.getNestedState = _nestedState.getNestedState;