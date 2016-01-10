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
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
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
    const clientSideRender = typeof window !== 'undefined';
    let routes = normalizeRoutes(rawRoutes);
    let hydratedData = null;

    store.replaceReducer(makeHydratable(state => state));
    if (clientSideRender) {
      const { routes: serverAdjustedRoutes, hydratedData: _hydratedData } = hydrateClient(store);
      if (!!_hydratedData) {
        hydratedData = _hydratedData;
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
      hydratedData,
    };
  }

  componentDidMount() {
    const { location, store } = this.props;
    const { routes, hydratedData } = this.state;
    this.loadAsyncState(routes, location, store, 0, hydratedData);
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

    this.setState({ routes: nextRoutes, hydratedData: null }, () => {
      this.loadAsyncState(nextRoutes, location, store, routeDiff, false);
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

  loadAsyncState(routes, location, store, replaceAtDepth, hydratedData) {
    matchRoutes(routes, location, (err1, matchedRoutes) => {
      const reducers = map(routes, route => route.reducer);
      if (!hydratedData) {
        nestAndReplaceReducersAndState(store, replaceAtDepth, ...reducers);
      } else {
        nestAndReplaceReducers(store, ...reducers);
      }

      loadAsyncState(
        matchedRoutes.routes,
        matchedRoutes.params,
        store.dispatch,
        (type, route, index) => {
          if (!this._unmounted) {
            const { routes: updatedRoutes } = this.state;
            if (updatedRoutes[index] === route) {
              updatedRoutes[index].blockRender = false;
              if (type === 'done') {
                updatedRoutes[index].loading = false;
              }

              this.setState({ routes: updatedRoutes });
            }
          }
        },
        (route, index) => {
          return this.state.routes[index] === route;
        },
        () => hydratedData
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
