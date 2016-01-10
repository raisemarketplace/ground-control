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
import { nestAndReplaceReducersAndState } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import { CHILD } from './constants';
import { forEach, map, take, drop } from 'lodash';

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
  simpleConnect,
  renderChildren,
  loadStateOnServer,
  CHILD,
};
