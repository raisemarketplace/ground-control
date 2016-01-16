import { NAMESPACE, REHYDRATE_REDUCERS } from './constants';
import { getNestedState, omitNestedState } from './nestedState';
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
      const previousState = getNestedState(currentState, depth, false);
      const nextState = reducer(previousState, action);
      if (result) return setShape(nextState, result);
      return setShape(nextState);
    }, null);
  };
};

export const nestAndReplaceReducers = (store, baseReducers, ...routeReducers) => {
  const otherReducers = omit(baseReducers, NAMESPACE);
  const nestedReducer = nestReducers(...routeReducers);
  const reducers = { ...otherReducers, [NAMESPACE]: nestedReducer };
  const reducer = combineReducers(reducers);
  store.replaceReducer(reducer);
};

export const nestAndReplaceReducersAndState = (store, depth, baseReducers, ...routeReducers) => {
  const adjustedState = omitNestedState(store.getState(), depth);
  nestAndReplaceReducers(store, baseReducers, ...routeReducers);
  store.dispatch({ type: REHYDRATE_REDUCERS, state: adjustedState });
};
