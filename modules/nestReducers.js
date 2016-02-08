import { getNestedStateAndMeta, omitNestedState } from './nestedState';
import { setShape } from './nestedShape';
import { partial, reduceRight, omit, map } from 'lodash';
import { combineReducers as reduxCombineReducers } from 'redux';
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
  if (action.type === UPDATE_ROUTE_STATE && action.depth === depth) return { ...state, ...action.meta };
  return state;
};

const nestReducers = (cr, ...routeReducers) => {
  return (state, action) => {
    let currentState = state;
    if (action.type === HYDRATE_STORE) {
      return action.state;
    } else if (action.type === REHYDRATE_REDUCERS) {
      currentState = action.state;
    }

    return reduceRight(routeReducers, (nextChild, routeReducer, depth) => {
      const { state: previousState, meta: previousMeta } = getNestedStateAndMeta(currentState, depth, false);
      const reducer = cr({ self: routeReducer, child: identityReducer, meta: partial(baseMetaReducer, depth) });
      const previous = setShape(previousState, nextChild, previousMeta);
      const next = reducer(previous, action);
      return next;
    }, null);
  };
};

const getRouteReducers = routes => map(routes, route => route.reducer);
export const hydrateStore = (state, store) => store.dispatch({ type: HYDRATE_STORE, state: state[NAMESPACE] });

export const nestAndReplaceReducers = (store, routes, baseReducers, combineReducers = reduxCombineReducers) => {
  const otherReducers = omit(baseReducers, NAMESPACE);
  const routeReducers = getRouteReducers(routes);
  const nestedReducer = nestReducers(combineReducers, ...routeReducers);
  const reducers = { ...otherReducers, [NAMESPACE]: nestedReducer };
  const reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
};

export const nestAndReplaceReducersAndState = (store, routes, reducers, depth = ROOT_DEPTH, combineReducers = reduxCombineReducers) => {
  const adjustedState = omitNestedState(store.getState(), depth);
  nestAndReplaceReducers(store, routes, reducers, combineReducers);
  store.dispatch({ type: REHYDRATE_REDUCERS, state: adjustedState });
};
