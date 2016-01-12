import { atDepth, setAtDepth } from './stateAtDepth';
import { forEach, merge } from 'lodash';
import { validateShape, setShape } from './stateShape';

export default (state, routes, deserializer) => {
  let updatedState = merge({}, state);
  if (!validateShape(updatedState)) return setShape();

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
