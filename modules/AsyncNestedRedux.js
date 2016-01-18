import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import diffRoutes from './diffRoutes';
import loadAsyncState from './loadAsyncState';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import { getNestedState, nestedStateValid } from './nestedState';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import loadStateOnClient from './loadStateOnClient';
import { FD_DONE, NAMESPACE, ROOT_DEPTH } from './constants';
import { map, take, drop, partial } from 'lodash';

class AsyncNestedRedux extends React.Component {
  static propTypes = {
    render: React.PropTypes.func.isRequired,
    routes: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    initialData: React.PropTypes.object.isRequired,
    reducers: React.PropTypes.object.isRequired,
    serializer: React.PropTypes.func.isRequired,
  };

  static defaultProps = {
    initialData: {},
    reducers: {},
    serializer: (route, state) => state,

    render(props, routes) {
      const finalCreateElement = partial(createElement, props.store, props.serializer);
      return (
        <RouterContext {...props} routes={routes} createElement={finalCreateElement} />
      );
    },
  };

  constructor(props, context) {
    super(props, context);
    const { initialData, store, routes: baseRoutes } = props;
    const { initialState, initialRoutes } = initialData;

    const storeState = store.getState();
    const routes = initialRoutes ? initialRoutes : normalizeRoutes(baseRoutes);
    const useInitialState = nestedStateValid(initialState, ROOT_DEPTH) && nestedStateValid(storeState, ROOT_DEPTH);
    const reducers = this.normalizeReducers();

    this.state = {
      routes,
      reducers,
      useInitialState,
      storeState,
    };

    this.unsubscribe = () => null;
    this.nestReducers(useInitialState, routes, ROOT_DEPTH);
  }

  componentDidMount() {
    const { location, store } = this.props;
    const { routes } = this.state;

    this.unsubscribe = store.subscribe(() => {
      const storeState = store.getState();
      this.setState({ storeState });
    });

    this.loadAsyncState(routes, location.query, ROOT_DEPTH);
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes } = this.state;
    const { location: prevLocation } = this.props;

    const pathChanged = nextProps.location.pathname !== prevLocation.pathname;
    const searchChanged = nextProps.location.search !== prevLocation.search;
    const routeChanged = pathChanged || searchChanged;
    if (!routeChanged) return;

    const { location, routes } = nextProps;
    const routeDiff = diffRoutes(prevRoutes, routes);
    const sameRoutes = take(routes, routeDiff);
    const differentRoutes = normalizeRoutes(drop(routes, routeDiff), true);
    const nextRoutes = sameRoutes.concat(differentRoutes);

    const useInitialState = false;
    this.setState({ routes: nextRoutes, useInitialState }, () => {
      this.loadAsyncState(nextRoutes, location.query, routeDiff);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this._unmounted = true;
  }

  normalizeReducers() {
    const reducers = this.props.reducers || {};
    reducers[NAMESPACE] = (state = {}) => state;
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

  fetchDataCallback(err, redirect, type, route, index) {
    if (!this._unmounted) {
      const { routes } = this.state;
      if (routes[index] === route) {
        if (redirect) {
          this.props.router.replace(redirect);
        } else {
          routes[index].blockRender = false;
          if (err) routes[index].loadingError = err;
          if (type === FD_DONE) routes[index].loading = false;
          this.setState({ routes });
        }
      }
    }
  }

  stillActiveCallback(route, index) {
    return this.state.routes[index] === route;
  }

  loadAsyncState(routes, params, replaceAtDepth) {
    const { store, initialData } = this.props;
    const { useInitialState } = this.state;
    const { initialState } = initialData;

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
  loadStateOnServer,
  loadStateOnClient,
  getNestedState,
};
