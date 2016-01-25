import component, { reducer, actions } from 'examples/full/routes/index-route/components';
import { fromJS } from 'immutable';

const CACHE = {}; // you can use cache to optionally persist state upon re-nav
const KEY = 'ABC';

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

const asyncEnter = (done, { dispatch }) => {
  const cachedState = CACHE[KEY];
  if (cachedState) { // need 2 because using nested reducers...
    dispatch(actions.hydrateForwards(cachedState.forwards));
    dispatch(actions.hydrateBackwards(cachedState.backwards));
  }
  done();
};

const onLeave = ({ getReducerState }) => {
  CACHE[KEY] = getReducerState();
};

export default {
  component,
  reducer,
  asyncEnter,
  onLeave,
  // deserializeImmutable,
  deserializer,
  // serializeImmutable,
  serializer,
};
