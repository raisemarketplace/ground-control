import { HYDRATE, CLIENT_HYDRATE } from './constants';

export default (reducer) => {
  return (state, action) => {
    if (action.type === CLIENT_HYDRATE) return action.state;
    return reducer(action.type === HYDRATE ? action.state : state, action);
  };
};
