export default (previous, next) => {
  for (let i = 0, l = next.length; i < l; i++) {
    if (previous[i] !== next[i]) {
      return i;
    }
  }

  return null;
};
