import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import computeChangedRoutes from 'react-router/lib/computeChangedRoutes';
import asyncEnter from './asyncEnter';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import { getNestedState, nestedStateValid } from './nestedState';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import loadStateOnClient from './loadStateOnClient';
import { FD_DONE, NAMESPACE, ROOT_DEPTH } from './constants';
import { map, partial, forEach, dropRight } from 'lodash';

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
      routes, reducers,
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
    const { params, location: { query }} = this.props;
    const { useInitialState, routes } = this.state;

    this.nestReducers(useInitialState, routes, ROOT_DEPTH);
    this.callAsyncEnter(routes, params, query, ROOT_DEPTH);
  }

  componentWillReceiveProps(nextProps) {
    const { location: prevLocation, params: prevRouteParams, store } = this.props;
    const { location: nextLocation, params: nextRouteParams } = nextProps;
    const { query: nextRouteQuery } = nextLocation;
    const { query: prevRouteQuery } = prevLocation;
    const { routes: prevRoutes } = this.state;

    const pathChanged = nextLocation.pathname !== prevLocation.pathname;
    const searchChanged = nextLocation.search !== prevLocation.search;
    const routeChanged = pathChanged || searchChanged;
    if (!routeChanged) return;

    const { enterRoutes: rawEnterRoutes, leaveRoutes } = computeChangedRoutes({
      ...this.props,
      routes: prevRoutes,
    }, nextProps);

    const keepRoutes = dropRight(prevRoutes, leaveRoutes.length);
    const enterRoutes = normalizeRoutes(rawEnterRoutes, true);
    const nextRoutes = keepRoutes.concat(enterRoutes);

    this.asyncLeave(
      leaveRoutes, prevRouteParams,
      prevRouteQuery, keepRoutes.length
    );

    this.nestReducers(
      false, nextRoutes,
      keepRoutes.length
    );

    this.setState({
      storeState: store.getState(),
      routes: nextRoutes,
      useInitialState: false,
    }, () => {
      this.callAsyncEnter(
        nextRoutes,
        nextRouteParams,
        nextRouteQuery,
        keepRoutes.length
      );
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this._unmounted = true;
  }

  resubscribe() {
    const { store } = this.props;
    return store.subscribe(() => {
      this.setState({
        storeState: store.getState(),
      });
    });
  }

  normalizeReducers() {
    const reducers = this.props.reducers || {};
    reducers[NAMESPACE] = (state = {}) => state;
    return reducers;
  }

  nestReducers(useInitialState, routes, replaceAtDepth) {
    const { store } = this.props;
    const { reducers } = this.state;
    this.unsubscribe();

    const routeReducers = map(routes, route => route.reducer);
    if (useInitialState) {
      nestAndReplaceReducers(
        store, reducers,
        ...routeReducers
      );
    } else {
      nestAndReplaceReducersAndState(
        store, replaceAtDepth, reducers,
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

  callAsyncEnter(routes, routeParams, queryParams, replaceAtDepth) {
    const { store } = this.props;
    const { useInitialState } = this.state;
    this.unsubscribe = this.resubscribe();

    asyncEnter(
      routes, routeParams, queryParams, store,
      this.asyncEnterCallback.bind(this),
      this.stillActiveCallback.bind(this),
      useInitialState, replaceAtDepth
    );
  }

  asyncLeave(routesToDrop, routeParams, queryParams, routeDepth) {
    forEach(routesToDrop, route => {
      if (route.asyncLeave) {
        const reducerState = getNestedState(
          this.props.store.getState(),
          routeDepth
        );

        route.asyncLeave({
          reducerState, routeParams, queryParams,
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
