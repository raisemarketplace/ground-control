import { setNestedState, getNestedState } from './nestedState';
import { validateRootShape, setShape } from './nestedShape';
import { forEach } from 'lodash';
import { NAMESPACE } from './constants';

export default (state, routes, deserializer = null) => {
  const updatedState = { ...state };
  if (!validateRootShape(updatedState)) {
    return {
      ...updatedState,
      [NAMESPACE]: setShape(),
    };
  }

  forEach(routes, (route, index) => {
    const dataAtDepth = getNestedState(updatedState, index);

    let deserializedData;
    if (route.deserializer) {
      deserializedData = route.deserializer(dataAtDepth);
    } else if (deserializer) {
      deserializedData = deserializer(route, dataAtDepth);
    } else {
      deserializedData = dataAtDepth;
    }

    updatedState[NAMESPACE] = setNestedState(state, deserializedData, index);
  });

  return updatedState;
};
