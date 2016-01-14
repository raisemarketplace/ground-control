import { ANR_ROOT, REHYDRATE_REDUCERS } from './constants';
import makeHydratable from './makeHydratable';
import { atDepth, rootOmitAtDepth } from './stateAtDepth';
import { setShape } from './stateShape';
import { combineReducers } from 'redux';
import { reduceRight, omit } from 'lodash';

const nestReducers = (...routeReducers) => {
  return (state, action) => {
    return reduceRight(routeReducers, (result, reducer, depth) => {
      const previousState = atDepth(state, depth);
      const nextState = reducer(previousState, action);
      if (result) return setShape(nextState, result);
      return setShape(nextState);
    }, null);
  };
};

export const nestAndReplaceReducers = (store, baseReducers, ...routeReducers) => {
  const otherReducers = omit(baseReducers, ANR_ROOT);
  const nestedReducer = nestReducers(...routeReducers);
  const hydratedNestedReducer = makeHydratable(nestedReducer);
  const reducer = combineReducers({ ...otherReducers, [ANR_ROOT]: hydratedNestedReducer });
  store.replaceReducer(reducer);
};

export const nestAndReplaceReducersAndState = (store, depth, baseReducers, ...routeReducers) => {
  const adjustedState = rootOmitAtDepth(store.getState(), depth);
  nestAndReplaceReducers(store, baseReducers, ...routeReducers);
  store.dispatch({ type: REHYDRATE_REDUCERS, state: adjustedState });
};
