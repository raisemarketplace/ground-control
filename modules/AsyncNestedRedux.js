import React from 'react';
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
import { atDepth, setAtDepth } from './stateAtDepth';
import { nestAndReplaceReducersAndState, nestAndReplaceReducers } from './nestReducers';
import loadStateOnServer from './loadStateOnServer';
import { CHILD, HYDRATE } from './constants';
import { map, take, drop } from 'lodash';

class AsyncNestedRedux extends React.Component {

  static propTypes = {
    render: React.PropTypes.func.isRequired,
    routes: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    hydrationSerializer: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    onError(err) {
      throw err;
    },

    hydrationSerializer(clientRoute, data) {
      return data;
    },

    render(props) {
      return (
        <RouterContext {...props} createElement={createElement} />
      );
    },
  }

  constructor(props, context) {
    super(props, context);
    const { store, routes: rawRoutes, hydrationSerializer } = props;
    store.replaceReducer(makeHydratable(state => state));

    const clientSideRender = typeof window !== 'undefined';
    const hydratedData = getHydratedData(clientSideRender);
    let routes = normalizeRoutes(rawRoutes);

    if (clientSideRender) {
      if (hydratedData.didHydrate) {
        const { routes: hydratedRoutes } = hydratedData;
        let { state: hydratedState } = hydratedData;

        routes = map(routes, (clientRoute, index) => {
          const hydratedRoute = hydratedRoutes[index];
          clientRoute.blockRender = hydratedRoute.blockRender;
          clientRoute.loading = hydratedRoute.loading;
          if (hydratedState) {
            const stateAtDepth = atDepth(hydratedState, index);
            hydratedState = setAtDepth(
              hydratedState,
              clientRoute.serializer ? clientRoute.serializer(stateAtDepth) : hydrationSerializer(clientRoute, stateAtDepth),
              index
            );
          }

          return clientRoute;
        });

        store.dispatch({ type: HYDRATE, state: hydratedState });
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

    const resetHydratedData = getHydratedData(false);
    this.setState({ routes: nextRoutes, hydratedData: resetHydratedData }, () => {
      this.loadAsyncState(nextRoutes, location, store, routeDiff, resetHydratedData);
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
      const { didHydrate } = hydratedData;
      const reducers = map(routes, route => route.reducer);
      if (didHydrate) {
        nestAndReplaceReducers(store, ...reducers);
      } else {
        nestAndReplaceReducersAndState(store, replaceAtDepth, ...reducers);
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
        (route, index) => this.state.routes[index] === route,
        didHydrate
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
  CHILD,
};
