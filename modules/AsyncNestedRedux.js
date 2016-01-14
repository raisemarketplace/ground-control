import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import simpleConnect from './simpleConnect';
import renderNestedRoute from './renderNestedRoute';
import diffRoutes from './diffRoutes';
import loadAsyncState from './loadAsyncState';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import { rootStateAtDepth, rootValidAtDepth } from './stateAtDepth';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import loadStateOnClient from './loadStateOnClient';
import { FD_DONE, ANR_ROOT, ROOT_DEPTH } from './constants';
import { map, take, drop } from 'lodash';

class AsyncNestedRedux extends React.Component {
  static propTypes = {
    render: React.PropTypes.func.isRequired,
    routes: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    initialState: React.PropTypes.object.isRequired,
    reducers: React.PropTypes.object.isRequired,
    onError: React.PropTypes.func.isRequired,
  };

  static defaultProps = {
    onError(err) {
      throw err;
    },

    reducers: {},
    initialState: {},

    render(props, routes) {
      return (
        <RouterContext {...props} routes={routes} createElement={createElement} />
      );
    },
  };

  constructor(props, context) {
    super(props, context);
    const { initialState, store, routes: baseRoutes } = props;

    const routes = normalizeRoutes(baseRoutes);
    const useInitialState = rootValidAtDepth(initialState, ROOT_DEPTH) && rootValidAtDepth(store.getState(), ROOT_DEPTH);
    const reducers = this.normalizeReducers();

    this.state = {
      routes,
      reducers,
      useInitialState,
    };

    this.nestReducers(useInitialState, routes, ROOT_DEPTH);
  }

  componentDidMount() {
    const { params } = this.props;
    const { routes } = this.state;
    this.loadAsyncState(routes, params, ROOT_DEPTH);
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes } = this.state;
    const { location: prevLocation } = this.props;

    const routeChanged = nextProps.location !== prevLocation;
    if (!routeChanged) return;

    const { params, routes } = nextProps;
    const routeDiff = diffRoutes(prevRoutes, routes);
    const sameRoutes = take(routes, routeDiff);
    const differentRoutes = normalizeRoutes(drop(routes, routeDiff), true);
    const nextRoutes = sameRoutes.concat(differentRoutes);

    const useInitialState = false;
    this.setState({ routes: nextRoutes, useInitialState }, () => {
      this.loadAsyncState(nextRoutes, params, routeDiff);
    });
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  normalizeReducers() {
    const reducers = this.props.reducers || {};
    reducers[ANR_ROOT] = (state = {}) => state;
    return reducers;
  }

  nestReducers(useInitialState, routes, replaceAtDepth) {
    const routeReducers = map(routes, route => route.reducer);
    if (useInitialState) {
      nestAndReplaceReducers(
        this.props.store,
        this.state.reducers,
        ...routeReducers
      );
    } else {
      nestAndReplaceReducersAndState(
        this.props.store,
        replaceAtDepth,
        this.state.reducers,
        ...routeReducers
      );
    }
  }

  handleError(cb) {
    return (err, ...args) => {
      if (err && this.props.onError) {
        this.props.onError(err);
      } else {
        cb(null, ...args);
      }
    };
  }

  fetchDataCallback(type, route, index) {
    if (!this._unmounted) {
      const { routes } = this.state;
      if (routes[index] === route) {
        routes[index].blockRender = false;
        if (type === FD_DONE) routes[index].loading = false;
        this.setState({ routes });
      }
    }
  }

  stillActiveCallback(route, index) {
    return this.state.routes[index] === route;
  }

  loadAsyncState(routes, params, replaceAtDepth) {
    const { store, initialState } = this.props;
    const { useInitialState } = this.state;

    this.nestReducers(useInitialState, routes, replaceAtDepth);
    loadAsyncState(
      routes,
      params,
      store,
      this.fetchDataCallback.bind(this),
      this.stillActiveCallback.bind(this),
      useInitialState,
      initialState
    );
  }

  render() {
    return this.props.render(this.props, this.state.routes);
  }
}

export default AsyncNestedRedux;
export {
  ANR_ROOT,
  simpleConnect,
  renderNestedRoute,
  loadStateOnServer,
  loadStateOnClient,
  rootStateAtDepth as stateAtDepth,
};
