import { SELF, CHILD, ANR_ROOT } from './constants';

export default (connect, Component) => {
  return connect(state => {
    return {
      data: state[ANR_ROOT][SELF],
      nestedData: state[ANR_ROOT][CHILD],
    };
  })(Component);
};
