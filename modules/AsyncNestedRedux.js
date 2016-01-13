import React from 'react';
import { combineReducers } from 'redux';
import RouterContext from 'react-router/lib/RouterContext';
import matchRoutes from 'react-router/lib/matchRoutes';
import simpleConnect from './simpleConnect';
import renderNestedRoute from './renderNestedRoute';
import diffRoutes from './diffRoutes';
import loadAsyncState from './loadAsyncState';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import getHydratedData from './getHydratedData';
import makeHydratable from './makeHydratable';
import deserialize from './deserialize';
import { rootStateAtDepth, rootValidAtDepth } from './stateAtDepth';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import { REHYDRATE_REDUCERS, HYDRATE_CLIENT, FD_DONE, IS_CLIENT, ANR_ROOT } from './constants';
import { map, take, drop } from 'lodash';

class AsyncNestedRedux extends React.Component {

  static propTypes = {
    render: React.PropTypes.func.isRequired,
    routes: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    reducers: React.PropTypes.object.isRequired,
    deserializer: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    onError(err) {
      throw err;
    },

    deserializer(clientRoute, data) {
      return data;
    },

    reducers: {
      [ANR_ROOT]: (s = {}) => s,
    },

    render(props) {
      return (
        <RouterContext {...props} createElement={createElement} />
      );
    },
  }

  constructor(props, context) {
    super(props, context);
    const { store, routes: rawRoutes, deserializer } = props;
    let routes = normalizeRoutes(rawRoutes);
    let state = store.getState();
    if (!props.reducers.hasOwnProperty(ANR_ROOT)) props.reducers[ANR_ROOT] = (s = {}) => s;

    if (IS_CLIENT) state = deserialize(state, routes, deserializer);
    let useHydratedData = rootValidAtDepth(state, 0);
    const reducer = makeHydratable(combineReducers(props.reducers));
    store.replaceReducer(reducer);

    if (useHydratedData) {
      store.dispatch({ type: REHYDRATE_REDUCERS, state });
    } else if (IS_CLIENT) {
      const hydratedData = getHydratedData(IS_CLIENT);
      useHydratedData = hydratedData.useHydratedData;

      if (useHydratedData) {
        const { state: hydratedState, routes: hydratedRoutes } = hydratedData;

        routes = map(routes, (clientRoute, index) => {
          const hydratedRoute = hydratedRoutes[index];
          clientRoute.blockRender = hydratedRoute.blockRender;
          clientRoute.loading = hydratedRoute.loading;
          return clientRoute;
        });

        state = deserialize(hydratedState, routes, deserializer);
        store.dispatch({ type: HYDRATE_CLIENT, state });
      }
    }

    this.state = {
      routes,
      useHydratedData,
    };
  }

  componentDidMount() {
    const { location, store } = this.props;
    const { routes, useHydratedData } = this.state;
    this.loadAsyncState(routes, location, store, 0, useHydratedData);
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes } = this.state;
    const { location: prevLocation } = this.props;

    const routeChanged = nextProps.location !== prevLocation;
    if (!routeChanged) return;

    const { location, store, routes } = nextProps;
    const routeDiff = diffRoutes(prevRoutes, routes);
    const sameRoutes = take(routes, routeDiff);
    const differentRoutes = normalizeRoutes(drop(routes, routeDiff), true);
    const nextRoutes = sameRoutes.concat(differentRoutes);

    const useHydratedData = false;
    this.setState({ routes: nextRoutes, useHydratedData }, () => {
      this.loadAsyncState(nextRoutes, location, store, routeDiff, useHydratedData);
    });
  }

  componentWillUnmount() {
    this._unmounted = true;
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

  loadAsyncState(routes, location, store, replaceAtDepth, useHydratedData) {
    matchRoutes(routes, location, (err1, matchedRoutes) => {
      const reducers = map(routes, route => route.reducer);
      if (useHydratedData) {
        nestAndReplaceReducers(store, this.props.reducers, ...reducers);
      } else {
        nestAndReplaceReducersAndState(store, replaceAtDepth, this.props.reducers, ...reducers);
      }

      loadAsyncState(
        matchedRoutes.routes,
        matchedRoutes.params,
        store,
        (type, route, index) => {
          if (!this._unmounted) {
            const { routes: updatedRoutes } = this.state;
            if (updatedRoutes[index] === route) {
              updatedRoutes[index].blockRender = false;
              if (type === FD_DONE) {
                updatedRoutes[index].loading = false;
              }

              this.setState({ routes: updatedRoutes });
            }
          }
        },
        (route, index) => this.state.routes[index] === route,
        useHydratedData
      );
    });
  }

  render() {
    return this.props.render(this.props);
  }
}

export default AsyncNestedRedux;
export {
  simpleConnect,
  renderNestedRoute,
  loadStateOnServer,
  rootStateAtDepth as stateAtDepth,
};
