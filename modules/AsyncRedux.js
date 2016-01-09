/* eslint-disable react/no-multi-comp, no-console, no-unused-vars */

import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import matchRoutes from 'react-router/lib/matchRoutes';
import makeHydratable from './makeHydratable';
import simpleConnect from './simpleConnect';
import renderChildren from './renderChildren';
import diffRoutes from './diffRoutes';
import { CHILD } from './constants';
import { nestAndReplaceReducersAndState } from './nestReducers';
import { forEach, map, take, drop } from 'lodash';

const createElement = (Component, props) => {
  const { route } = props;

  if (route.blockRender) {
    return route.loader(props);
  }

  return (<Component {...props} loading={route.loading} />);
};

const defaultLoader = () => (<div/>);

const normalizeRoutes = routes => {
  return map(routes, route => {
    if (!route.reducer) {
      route.reducer = state => state;
    }

    if (!route.loader) {
      route.loader = defaultLoader;
    }

    route.blockRender = true;
    route.loading = true;
    return route;
  });
};

const loadAsyncState = (matchedRoutes, store, replaceAtDepth, cb, stillActive) => {
  const { routes, params } = matchedRoutes;
  const reducers = map(routes, route => route.reducer);

  if (routes.length > 0) {
    nestAndReplaceReducersAndState(store, replaceAtDepth, ...reducers);
    forEach(routes, (route, index) => {
      if (route.fetchData) {
        const clientHydrated = false;
        route.fetchData(params, store.dispatch, () => {
          return stillActive(route, index);
        }, () => {
          cb('done', route, index);
        }, () => {
          cb('client', route, index);
        }, clientHydrated, () => {
          // stopBlocking(routes, index); // server render
          console.error('server');
        });
      } else {
        cb('done', route, index);
      }
    });
  }
};

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
    const { routes } = props;
    this.state = {
      //  isServerRender,
      routes: normalizeRoutes(routes),
    };
  }

  componentDidMount() {
    const { location, store } = this.props;
    const { routes } = this.state;
    this.loadAsyncState(routes, location, store, 0);
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes } = this.state;
    const { location: prevLocation } = this.props;

    const routeChanged = nextProps.location !== prevLocation;
    if (!routeChanged) return;

    const { location, store, routes } = nextProps;
    const routeDiff = diffRoutes(prevRoutes, routes);
    const nextRoutes = take(routes, routeDiff).concat(normalizeRoutes(drop(routes, routeDiff)));

    this.setState({ routes: nextRoutes }, () => {
      this.loadAsyncState(nextRoutes, location, store, routeDiff);
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

  loadAsyncState(routes, location, store, replaceAtDepth) {
    matchRoutes(routes, location, (err1, matchedRoutes) => {
      loadAsyncState(
        matchedRoutes,
        store,
        replaceAtDepth,
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
        }
      );
    });
  }

  render() {
    return this.props.render(this.props);
  }
}

export default AsyncRedux;
export {
  makeHydratable,
  simpleConnect,
  renderChildren,
  CHILD,
};
