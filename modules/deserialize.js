import { atDepth, setAtDepth } from './stateAtDepth';
import { forEach, merge, isObject } from 'lodash';
import { SELF } from './constants';

const sanityCheck = state => isObject(state) && state.hasOwnProperty(SELF);

export default (state, routes, deserializer) => {
  let updatedState = merge({}, state);
  if (!sanityCheck(updatedState)) return null;

  forEach(routes, (route, index) => {
    const dataAtDepth = atDepth(updatedState, index);

    let deserializedData;
    if (route.deserializer) {
      deserializedData = route.deserializer(dataAtDepth);
    } else {
      deserializedData = deserializer(route, dataAtDepth);
    }

    updatedState = setAtDepth(state, deserializedData, index);
  });

  return updatedState;
};
