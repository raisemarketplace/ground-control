import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import diffRoutes from './diffRoutes';
import asyncEnter from './asyncEnter';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import { getNestedState, nestedStateValid } from './nestedState';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import loadStateOnClient from './loadStateOnClient';
import { FD_DONE, NAMESPACE, ROOT_DEPTH } from './constants';
import { map, take, drop, partial, forEach } from 'lodash';

export default class extends React.Component {
  static propTypes = {
    render: React.PropTypes.func.isRequired,
    routes: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    initialData: React.PropTypes.object.isRequired,
    reducers: React.PropTypes.object.isRequired,
    serializer: React.PropTypes.func.isRequired,
  };

  static defaultProps = {
    initialData: {},
    reducers: {},
    serializer: (route, state) => state,

    render(props, routes) {
      const finalCreateElement = partial(
        createElement, props.store, props.serializer
      );

      return (
        <RouterContext {...props} routes={routes}
            createElement={finalCreateElement} />
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

    this.nestReducers(
      useInitialState,
      routes, ROOT_DEPTH
    );
  }

  componentDidMount() {
    const { location, store, params: routeParams } = this.props;
    const { routes } = this.state;

    this.unsubscribe = store.subscribe(() => {
      const storeState = store.getState();
      this.setState({ storeState });
    });

    this.nestThenAsyncEnter(
      routes, routeParams,
      location.query, ROOT_DEPTH
    );
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes } = this.state;
    const { location: prevLocation, params: prevRouteParams } = this.props;
    const { location, routes, params: routeParams } = nextProps;

    const pathChanged = nextProps.location.pathname !== prevLocation.pathname;
    const searchChanged = nextProps.location.search !== prevLocation.search;
    const routeChanged = pathChanged || searchChanged;
    if (!routeChanged) return;

    const routeDiff = diffRoutes(prevRoutes, routes);
    const routesToKeep = take(routes, routeDiff);
    const routesToDrop = drop(prevRoutes, routeDiff);
    const routesToAdd = normalizeRoutes(drop(routes, routeDiff), true);
    const nextRoutes = routesToKeep.concat(routesToAdd);

    this.asyncLeave(
      routesToDrop, prevRouteParams,
      prevLocation.query, routeDiff
    );

    this.setState({
      routes: nextRoutes,
      useInitialState: false,
    }, () => {
      this.nestThenAsyncEnter(
        nextRoutes, routeParams,
        location.query, routeDiff
      );
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

  asyncEnterCallback(err, redirect, type, route, index) {
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

  nestThenAsyncEnter(routes, routeParams, queryParams, replaceAtDepth) {
    const { store, initialData } = this.props;
    const { useInitialState } = this.state;
    const { initialState } = initialData;

    this.nestReducers(
      useInitialState, routes, replaceAtDepth
    );

    asyncEnter(
      routes, routeParams, queryParams, store,
      this.asyncEnterCallback.bind(this),
      this.stillActiveCallback.bind(this),
      useInitialState, initialState, replaceAtDepth
    );
  }

  asyncLeave(routesToDrop, routeParams, queryParams, routeDepth) {
    forEach(routesToDrop, route => {
      if (route.asyncLeave) {
        const endReducerState = getNestedState(
          this.state.storeState,
          routeDepth
        );

        route.asyncLeave({
          endReducerState,
          routeParams,
          queryParams,
        });
      }
    });
  }

  render() {
    return this.props.render(
      this.props, this.state.routes
    );
  }
}

export {
  loadStateOnServer,
  loadStateOnClient,
  getNestedState,
};
