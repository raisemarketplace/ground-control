import { HYDRATE, CLIENT_HYDRATE, ANR_ROOT } from './constants';

export default (reducer) => {
  return (state, action) => {
    if (action.type === CLIENT_HYDRATE) {
      if (state[ANR_ROOT]) return action.state;
      return action.state[ANR_ROOT];
    }

    return reducer(action.type === HYDRATE ? action.state : state, action);
  };
};
