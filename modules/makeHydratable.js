import {
  ANR_ROOT,
  HYDRATE_CLIENT,
  REHYDRATE_REDUCERS,
} from './constants';

export default (reducer) => {
  return (state, action) => {
    if (action.type === HYDRATE_CLIENT) {
      if (state[ANR_ROOT]) return action.state;
      return action.state[ANR_ROOT]; // HACK for redux-devtools replaying state
    }

    return reducer(action.type === REHYDRATE_REDUCERS ? action.state : state, action);
  };
};
