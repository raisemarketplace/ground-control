import { ANR_ROOT, REHYDRATE_REDUCERS } from './constants';
import { atDepth, rootOmitAtDepth } from './nestedState';
import { setShape } from './nestedShape';
import { combineReducers } from 'redux';
import { reduceRight, omit } from 'lodash';

const nestReducers = (...routeReducers) => {
  return (state, action) => {
    let currentState = state;
    if (action.type === REHYDRATE_REDUCERS) {
      currentState = action.state;
    }

    return reduceRight(routeReducers, (result, reducer, depth) => {
      const previousState = atDepth(currentState, depth);
      const nextState = reducer(previousState, action);
      if (result) return setShape(nextState, result);
      return setShape(nextState);
    }, null);
  };
};

export const nestAndReplaceReducers = (store, baseReducers, ...routeReducers) => {
  const otherReducers = omit(baseReducers, ANR_ROOT);
  const nestedReducer = nestReducers(...routeReducers);
  const reducers = { ...otherReducers, [ANR_ROOT]: nestedReducer };
  const reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
};

export const nestAndReplaceReducersAndState = (store, depth, baseReducers, ...routeReducers) => {
  const adjustedState = rootOmitAtDepth(store.getState(), depth);
  nestAndReplaceReducers(store, baseReducers, ...routeReducers);
  store.dispatch({ type: REHYDRATE_REDUCERS, state: adjustedState });
};
