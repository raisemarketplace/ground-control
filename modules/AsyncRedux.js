/* eslint-disable react/no-multi-comp, no-console, no-unused-vars */

import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import matchRoutes from 'react-router/lib/matchRoutes';
import makeHydratable from './makeHydratable';
import simpleConnect from './simpleConnect';
import renderChildren from './renderChildren';
import diffRoutes from './diffRoutes';
import { nestAndReplaceReducersAndState } from './nestReducers';
import { forEach, map } from 'lodash';

const createElement = (Component, props) => {
  return (
    <Component {...props} />
  );
};

const normalizeRoutes = routes => {
  return map(routes, route => {
    if (!route.reducer) {
      route.reducer = state => state;
    }

    return route;
  });
};

const loadAsyncState = (matchedRoutes, store, replaceAtDepth, cb) => {
  console.warn('loadAsyncState', matchedRoutes, store);
  const { routes: rawRoutes, params } = matchedRoutes;
  const routes = normalizeRoutes(rawRoutes);
  const reducers = map(routes, route => route.reducer);

  let needToLoadCounter = routes.length;
  const maybeFinish = () => {
    if (needToLoadCounter === 0) {
      // console.log('finished!');
      // cb(null, 'yay!');
    }
  };

  if (routes.length > 0) {
    nestAndReplaceReducersAndState(store, replaceAtDepth, ...reducers);

    forEach(routes, (route, index) => {
      if (route.fetchData) {
        const clientHydrated = false;
        route.fetchData(params, store.dispatch, () => {
          // console.warn('app done');
        }, () => {
          // console.warn('app client ready');
        }, clientHydrated, () => {
          // console.warn('app server ready');
        });
      }

      needToLoadCounter--;
      maybeFinish();
    });
  } else {
    maybeFinish();
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
    renderLoading: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    onError(err) {
      throw err;
    },

    renderLoading() {
      return null;
    },

    render(props) {
      return (
        <RouterContext {...props} createElement={createElement} />
      );
    },
  }

  constructor(props, context) {
    super(props, context);
    console.log(props);
  }

  componentDidMount() {
    const { routes, location, store } = this.props;
    this.loadAsyncState(routes, location, store, 0);
  }

  componentWillReceiveProps(nextProps) {
    const { routes: prevRoutes, location: prevLocation } = this.props;
    const routeChanged = nextProps.location !== prevLocation;
    if (!routeChanged) return;

    const { routes, location, store } = nextProps;
    this.loadAsyncState(routes, location, store, diffRoutes(prevRoutes, routes));
  }

  componentWillUnmount() {
    console.log('componentWillUnmount()');
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
    // loading: true
    matchRoutes(routes, location, (err1, matchedRoutes) => {
      loadAsyncState(
        matchedRoutes,
        store,
        replaceAtDepth,
        this.handleError((err2, xxx) => {
          console.log('loadAsnycStateCB', err2, xxx);
          // loading: false
          // dispatch to stores
        })
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
};
