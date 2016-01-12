import component, { reducer } from 'example/routes/index-route/components';
import { fromJS } from 'immutable';

// set property for app level serializer
// const serializeImmutable = true;

// or a custom route one
const serializer = data => {
  data.forwards = fromJS(data.forwards);
  return data;
};

export default {
  component,
  reducer,
  // serializeImmutable,
  serializer,
};
