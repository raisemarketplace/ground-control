import { getNestedStateAndMeta, omitNestedState } from './nestedState';
import { setShape } from './nestedShape';
import { combineReducers } from 'redux';
import { partial, reduceRight, omit, map } from 'lodash';
import {
  NAMESPACE, REHYDRATE_REDUCERS, HYDRATE_STORE,
  ROOT_DEPTH, UPDATE_ROUTE_STATE,
} from './constants';

export const META_INITIAL_STATE = {
  blockRender: true,
  loading: true,
  loadingError: null,
};

const identityReducer = (s = {}) => s;
const baseMetaReducer = (depth, state = META_INITIAL_STATE, action) => {
  if (action.type === UPDATE_ROUTE_STATE && action.depth === depth) {
    return { ...state, ...action.meta };
  }

  return state;
};

const nestReducers = (...routeReducers) => {
  return (state, action) => {
    let currentState = state;
    if (action.type === HYDRATE_STORE) {
      return action.state;
    } else if (action.type === REHYDRATE_REDUCERS) {
      currentState = action.state;
    }

    return reduceRight(routeReducers, (nextChild, routeReducer, depth) => {
      const { state: previousState, meta: previousMeta } = getNestedStateAndMeta(currentState, depth, false);
      action.__ROUTE_DEPTH__ = depth;

      const reducer = combineReducers({
        self: routeReducer, child: identityReducer, meta: partial(baseMetaReducer, depth),
      });

      const previous = setShape(previousState, nextChild, previousMeta);
      const next = reducer(previous, action);
      return next;
    }, null);
  };
};

const getRouteReducers = routes => map(routes, route => route.reducer);

export const nestAndReplaceReducers = (store, routes, baseReducers) => {
  const otherReducers = omit(baseReducers, NAMESPACE);
  const routeReducers = getRouteReducers(routes);
  const nestedReducer = nestReducers(...routeReducers);
  const reducers = { ...otherReducers, [NAMESPACE]: nestedReducer };
  const reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
};

export const nestAndReplaceReducersAndState = (store, routes, reducers, depth = ROOT_DEPTH) => {
  const adjustedState = omitNestedState(store.getState(), depth);
  nestAndReplaceReducers(store, routes, reducers);
  store.dispatch({ type: REHYDRATE_REDUCERS, state: adjustedState });
};

export const hydrateStore = (state, store) => {
  store.dispatch({ type: HYDRATE_STORE, state: state[NAMESPACE] });
};
