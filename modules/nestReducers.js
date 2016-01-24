import { NAMESPACE, REHYDRATE_REDUCERS, HYDRATE_STORE, ROOT_DEPTH } from './constants';
import { getNestedState, omitNestedState } from './nestedState';
import { setShape } from './nestedShape';
import { combineReducers } from 'redux';
import { reduceRight, omit, map } from 'lodash';

const nestReducers = (...routeReducers) => {
  return (state, action) => {
    let currentState = state;
    if (action.type === HYDRATE_STORE) {
      return action.state;
    } else if (action.type === REHYDRATE_REDUCERS) {
      currentState = action.state;
    }

    return reduceRight(routeReducers, (result, reducer, depth) => {
      const previousState = getNestedState(currentState, depth, false);
      const nextState = reducer(previousState, action);
      if (result) return setShape(nextState, result);
      return setShape(nextState);
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

export const hydrateThenNestAndReplaceReducers = (state, store, routes, reducers) => {
  nestAndReplaceReducers(store, routes, reducers);
  store.dispatch({ type: HYDRATE_STORE, state: state[NAMESPACE] });
};
