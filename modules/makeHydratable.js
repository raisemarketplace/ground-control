import { HYDRATE } from './constants';

export default (reducer) => {
  return (state, action) => {
    switch (action.type) {
    case HYDRATE:
      return reducer(action.state, action);
    default:
      return reducer(state, action);
    }
  };
};
