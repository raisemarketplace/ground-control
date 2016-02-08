import React, { Component, PropTypes } from 'react';
import { createReducer } from 'redux-act';
import createActions from 'examples/utils/createActions';
import { routeStyle } from 'examples/utils/style';
import { Effects, loop } from 'redux-loop';

const LOOOOP = 'loop';

export const actions = createActions('LoopLoopLoop', ['loop']);

const delayedLoop = () => new Promise(resolve => {
  setTimeout(() => {
    resolve(actions.loop());
  }, 500);
});

export const reducer = createReducer({
  [actions.loop]: state => {
    const nextState = { ...state, text: `${state.text}${LOOOOP}` };
    const effect = nextState.text.length <= LOOOOP.length * 2 ? Effects.promise(delayedLoop) : Effects.none();
    return loop(nextState, effect);
  },
}, { text: LOOOOP });

export default class extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    delayedLoop().then(action => this.props.dispatch(action));
  }

  render() {
    return (
      <div style={routeStyle}>
        {this.props.data.text}
      </div>
    );
  }
}
