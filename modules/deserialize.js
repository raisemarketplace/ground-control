import { setNestedState, getNestedState } from './nestedState';
import { validateRootShape, setShape } from './nestedShape';
import { forEach, merge } from 'lodash';
import { NAMESPACE } from './constants';

export default (state, routes, deserializer) => {
  const updatedState = merge({}, state);
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
    } else {
      deserializedData = deserializer(route, dataAtDepth);
    }

    updatedState[NAMESPACE] = setNestedState(state, deserializedData, index);
  });

  return updatedState;
};
