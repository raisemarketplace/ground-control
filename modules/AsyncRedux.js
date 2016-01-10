/* eslint-disable react/no-multi-comp, no-console, no-unused-vars */

import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import matchRoutes from 'react-router/lib/matchRoutes';
import simpleConnect from './simpleConnect';
import renderChildren from './renderChildren';
import diffRoutes from './diffRoutes';
import loadAsyncState from './loadAsyncState';
import createElement from './createElement';
import normalizeRoutes from './normalizeRoutes';
import hydrateClient from './hydrateClient';
import makeHydratable from './makeHydratable';
import { nestAndReplaceReducersAndState } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import { CHILD } from './constants';
import { merge, forEach, map, take, drop } from 'lodash';

class AsyncRedux extends React.Component {

  static propTypes = {
    render: React.PropTypes.func.isRequired,
    routes: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    onError: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    onError(err) {
      throw err;
    },

    render(props) {
      return (
        <RouterContext {...props} createElement={createElement} />
      );
    },
  }

  constructor(props, context) {
    super(props, context);
    const { store, routes: rawRoutes } = props;
    let routes = normalizeRoutes(rawRoutes);
    let hasHydrated = false;
    const clientSideRender = typeof window !== 'undefined';

    store.replaceReducer(makeHydratable(state => state));
    if (clientSideRender) {
      const { routes: serverAdjustedRoutes, didHydrate } = hydrateClient(store);
      if (didHydrate) {
        hasHydrated = true;
        routes = map(routes, (clientRoute, index) => {
          const serverRoute = serverAdjustedRoutes[index];
          clientRoute.blockRender = serverRoute.blockRender;
          clientRoute.loading = serverRoute.loading;
          return clientRoute;
        });
      }
    }

    this.state = {
      routes,
      hasHydrated,
    };
  }

  componentDidMount() {
    const { location, store } = this.props;
    const { routes, hasHydrated } = this.state;
    this.loadAsyncState(routes, location, store, 0, hasHydrated);
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes, hasHydrated } = this.state;
    const { location: prevLocation } = this.props;

    const routeChanged = nextProps.location !== prevLocation;
    if (!routeChanged) return;

    const { location, store, routes } = nextProps;
    const routeDiff = diffRoutes(prevRoutes, routes);
    const nextRoutes = take(routes, routeDiff).concat(normalizeRoutes(drop(routes, routeDiff)));

    this.setState({ routes: nextRoutes }, () => {
      this.loadAsyncState(nextRoutes, location, store, routeDiff, hasHydrated);
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

  loadAsyncState(routes, location, store, replaceAtDepth, hasHydrated) {
    matchRoutes(routes, location, (err1, matchedRoutes) => {
      const reducers = map(routes, route => route.reducer);
      nestAndReplaceReducersAndState(store, replaceAtDepth, ...reducers);

      loadAsyncState(
        matchedRoutes.routes,
        matchedRoutes.params,
        store.dispatch,
        (type, route, index) => {
          if (!this._unmounted) {
            const { routes: updatedRoutes } = this.state;
            if (updatedRoutes[index] === route) {
              updatedRoutes[index].blockRender = false;
              if (type === 'done') updatedRoutes[index].loading = false;
              this.setState({ routes: updatedRoutes });
            }
          }
        },
        (route, index) => {
          return this.state.routes[index] === route;
        },
        () => hasHydrated
      );
    });
  }

  render() {
    return this.props.render(this.props);
  }
}

export default AsyncRedux;
export {
  simpleConnect,
  renderChildren,
  loadStateOnServer,
  CHILD,
};
