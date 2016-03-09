import React, { PropTypes, Component } from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import computeChangedRoutes from 'react-router/lib/computeChangedRoutes';
import asyncEnter from './asyncEnter';
import baseCreateElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import { getNestedState, nestedStateValid } from './nestedState';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers, hydrateStore } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import hydrateClient from './hydrateClient';
import updateRouteState from './updateRouteState';
import { NAMESPACE, ROOT_DEPTH, IS_CLIENT } from './constants';
import { partial, dropRight } from 'lodash';
import { connect } from 'react-redux';

class GroundControl extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired, routes: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired, router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired, params: PropTypes.object.isRequired,
    initialData: PropTypes.object.isRequired, reducers: PropTypes.object.isRequired,
    serializer: PropTypes.func.isRequired, deserializer: PropTypes.func.isRequired,
    combineReducers: PropTypes.func,
  };

  static defaultProps = {
    initialData: {}, reducers: {},
    serializer: (route, state) => state,
    deserializer: (route, state) => state,

    render(props, routes) {
      const { store, serializer } = props;
      const createElement = partial(baseCreateElement, store, serializer);
      const routerContextProps = () => ({ ...props, routes, createElement });
      return <RouterContext {...routerContextProps()} />;
    },
  };

  constructor(props, context) {
    super(props, context);

    const { initialData, store, routes: baseRoutes, deserializer, combineReducers } = props;
    const reducers = this.normalizeReducers();

    let { initialState, initialRoutes } = initialData;
    initialRoutes = initialRoutes ? initialRoutes : normalizeRoutes(baseRoutes, props);

    if (IS_CLIENT) {
      const { hydratedState, hydratedRoutes } = hydrateClient(props, initialRoutes, deserializer);
      if (hydratedState && hydratedRoutes) {
        initialRoutes = hydratedRoutes;
        initialState = hydratedState;
      }
    }

    const useInitialState = nestedStateValid(initialState);
    const useInitialStoreState = nestedStateValid(store.getState());

    if (useInitialState && !useInitialStoreState) {
      nestAndReplaceReducers(store, initialRoutes, reducers, combineReducers);
      hydrateStore(initialState, store);
    } else {
      this.nestReducers(store, initialRoutes, reducers, useInitialState, ROOT_DEPTH, combineReducers);
    }

    this.state = {
      routes: initialRoutes,
      reducers, useInitialState,
      storeState: store.getState(),
    };
  }

  componentDidMount() {
    this.callAsyncEnter(this.state.routes, this.props.params, this.props.location.query);
  }

  componentWillReceiveProps(nextProps) {
    const { location: prevLocation, store, combineReducers } = this.props;
    const { location: nextLocation, params: nextRouteParams } = nextProps;
    const { routes: prevRoutes, reducers } = this.state;
    const { query: nextRouteQuery } = nextLocation;

    const pathChanged = nextLocation.pathname !== prevLocation.pathname;
    const searchChanged = nextLocation.search !== prevLocation.search;
    const routeChanged = pathChanged || searchChanged;
    if (!routeChanged) return;

    const { enterRoutes: rawEnterRoutes, leaveRoutes } = computeChangedRoutes({
      ...this.props, routes: prevRoutes,
    }, nextProps);

    const keepRoutes = dropRight(prevRoutes, leaveRoutes.length);
    const enterRoutes = normalizeRoutes(rawEnterRoutes, nextProps, keepRoutes.length, true);
    const nextRoutes = keepRoutes.concat(enterRoutes);

    this.nestReducers(
      store, nextRoutes, reducers,
      false, keepRoutes.length,
      combineReducers
    );

    this.setState({
      storeState: store.getState(),
      routes: nextRoutes,
      useInitialState: false,
    }, () => {
      this.callAsyncEnter(
        nextRoutes, nextRouteParams,
        nextRouteQuery, keepRoutes.length
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

  nestReducers(store, routes, reducers, useInitialState = false, replaceAtDepth = ROOT_DEPTH, combineReducers) {
    this.unsubscribe();
    if (useInitialState) {
      nestAndReplaceReducers(store, routes, reducers, combineReducers);
    } else {
      nestAndReplaceReducersAndState(store, routes, reducers, replaceAtDepth, combineReducers);
    }
  }

  asyncEnterCallback(loadingError, redirect, type, route, depth) {
    if (!this._unmounted) {
      const { routes } = this.state;
      if (routes[depth] === route) {
        if (redirect) {
          this.props.router.replace(redirect);
        } else {
          updateRouteState(this.props.store, depth, type, loadingError);
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

  render() {
    return this.props.render(
      this.props, this.state.routes
    );
  }
}

const GroundControlContainer = connect(s => s)(GroundControl);

export {
  GroundControlContainer as default,
  loadStateOnServer,
  getNestedState,
};
