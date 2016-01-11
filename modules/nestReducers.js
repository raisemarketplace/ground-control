import { HYDRATE, CHILD, SELF } from './constants';
import makeHydratable from './makeHydratable';
import { atDepth, omitAtDepth } from './stateAtDepth';
import { reduceRight } from 'lodash';

const nestReducers = (...reducers) => {
  return (state, action) => {
    if (action.type === HYDRATE) {
      return state;
    }

    return reduceRight(reducers, (result, reducer, depth) => {
      const previousState = atDepth(state, depth);
      const nextState = reducer(previousState, action);
      if (result) {
        return {
          [SELF]: nextState,
          [CHILD]: result,
        };
      }

      return {
        [SELF]: nextState,
      };
    }, null);
  };
};

export const nestAndReplaceReducers = (store, ...reducers) => {
  const reducer = makeHydratable(nestReducers(...reducers));
  store.replaceReducer(reducer);
};

export const nestAndReplaceReducersAndState = (store, depth, ...reducers) => {
  const state = store.getState();
  const adjustedState = omitAtDepth(state, depth);
  store.dispatch({ type: HYDRATE, state: adjustedState });
  nestAndReplaceReducers(store, ...reducers);
};
