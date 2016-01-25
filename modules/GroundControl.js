import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import computeChangedRoutes from 'react-router/lib/computeChangedRoutes';
import asyncEnter from './asyncEnter';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import { getNestedState, nestedStateValid } from './nestedState';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers, hydrateThenNestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import hydrateClient from './hydrateClient';
import { FD_DONE, NAMESPACE, ROOT_DEPTH, IS_CLIENT } from './constants';
import { partial, forEach, dropRight } from 'lodash';

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
    deserializer: React.PropTypes.func.isRequired,
  };

  static defaultProps = {
    initialData: {},
    reducers: {},
    serializer: (route, state) => state,
    deserializer: (route, state) => state,

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

    const { initialData, store, routes: baseRoutes, deserializer } = props;
    const reducers = this.normalizeReducers();

    let { initialState, initialRoutes } = initialData;
    initialRoutes = initialRoutes ? initialRoutes : normalizeRoutes(baseRoutes);

    if (IS_CLIENT) {
      const { hydratedState, hydratedRoutes } = hydrateClient(initialRoutes, deserializer);
      if (hydratedState && hydratedRoutes) {
        initialRoutes = hydratedRoutes;
        initialState = hydratedState;
      }
    }

    const useInitialState = nestedStateValid(initialState);
    const useInitialStoreState = nestedStateValid(store.getState());

    if (useInitialState && !useInitialStoreState) {
      hydrateThenNestAndReplaceReducers(initialState, store, initialRoutes, reducers);
    } else {
      this.nestReducers(store, initialRoutes, reducers, useInitialState);
    }

    this.state = {
      routes: initialRoutes,
      reducers, useInitialState,
      storeState: store.getState(),
    };
  }

  componentDidMount() {
    const { store, params, location: { query }} = this.props;
    const { routes, reducers, useInitialState } = this.state;

    this.nestReducers(store, routes, reducers, useInitialState);
    this.callAsyncEnter(routes, params, query);
  }

  componentWillReceiveProps(nextProps) {
    const { location: prevLocation, params: prevRouteParams, store } = this.props;
    const { location: nextLocation, params: nextRouteParams } = nextProps;
    const { routes: prevRoutes, reducers } = this.state;
    const { query: nextRouteQuery } = nextLocation;
    const { query: prevRouteQuery } = prevLocation;

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
      store, nextRoutes, reducers,
      false, keepRoutes.length
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

  unsubscribe() {
    return null;
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

  nestReducers(store, routes, reducers, useInitialState = false, replaceAtDepth = ROOT_DEPTH) {
    this.unsubscribe();
    if (useInitialState) {
      nestAndReplaceReducers(store, routes, reducers);
    } else {
      nestAndReplaceReducersAndState(store, routes, reducers, replaceAtDepth);
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

  callAsyncEnter(routes, routeParams, queryParams, replaceAtDepth = ROOT_DEPTH) {
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
  getNestedState,
};
