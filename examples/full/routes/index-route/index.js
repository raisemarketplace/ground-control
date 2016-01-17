import component, { reducer } from 'examples/full/routes/index-route/components';
import { fromJS } from 'immutable';

// set property for app level deserializer
// const deserializeImmutable = true;
// const serializeImmutable = true;

// or a custom route one
const deserializer = data => {
  data.forwards = fromJS(data.forwards);
  return data;
};

const serializer = data => {
  return {
    ...data,
    forwards: data.forwards.toJS(),
  };
};

export default {
  component,
  reducer,
  // deserializeImmutable,
  deserializer,
  // serializeImmutable,
  serializer,
};
