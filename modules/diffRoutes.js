import { find, findIndex, chain } from 'lodash';

function diffParams(prev, next) {
  return chain(next)
  .map(function(val, key) {
    return { changed: prev[key] !== next[key], key, val }
  })
  .filter(function(o) { return o.changed })
  .pluck('key')
  .value();
}

function hasParamDiff({ path }, paramDiff) {
  return find(paramDiff, function(param) {
    return path.indexOf(`:${param}`) > -1;
  });
}

export default (prev, next, prevParams, nextParams) => {
  let paramDiff = diffParams(prevParams, nextParams);
  let index = findIndex(prev, function(_, i) {
    let diff = prev[i] !== next[i];
    return diff || hasParamDiff(next[i], paramDiff);
  });
  return (index > -1) ? index : null;
};
