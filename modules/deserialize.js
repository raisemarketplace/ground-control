import { setAtDepth, applicationState } from './stateAtDepth';
import { forEach, merge } from 'lodash';
import { validateRootShape, setShape } from './stateShape';
import { ANR_ROOT } from './constants';

export default (state, routes, deserializer) => {
  const updatedState = merge({}, state);
  if (!validateRootShape(updatedState)) {
    return {
      ...updatedState,
      [ANR_ROOT]: setShape(),
    };
  }

  forEach(routes, (route, index) => {
    const dataAtDepth = applicationState(updatedState, index);

    let deserializedData;
    if (route.deserializer) {
      deserializedData = route.deserializer(dataAtDepth);
    } else {
      deserializedData = deserializer(route, dataAtDepth);
    }

    updatedState[ANR_ROOT] = setAtDepth(state[ANR_ROOT], deserializedData, index);
  });

  return updatedState;
};
