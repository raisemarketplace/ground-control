import { SELF, CHILD } from './constants';

export default (connect, Component) => {
  return connect(state => {
    return {
      data: state[SELF],
      nestedData: state[CHILD],
    };
  })(Component);
};
