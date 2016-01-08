export default (connect, Component) => {
  return connect(state => ({ data: state }))(Component);
};
