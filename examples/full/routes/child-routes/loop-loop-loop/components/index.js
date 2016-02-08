import React, { Component, PropTypes } from 'react';
import { createReducer } from 'redux-act';
import createActions from 'examples/utils/createActions';
import { routeStyle } from 'examples/utils/style';
import { Effects, loop } from 'redux-loop';

const LOOOOP = 'loop';

export const actions = createActions('LoopLoopLoop', ['loop']);
export const reducer = createReducer({
  [actions.loop]: state => {
    const nextState = { ...state, text: `${state.text}${LOOOOP}` }
    const effect = nextState.text.length <= LOOOOP.length * 3 ? Effects.constant(actions.loop()) : Effects.none();
    console.log(nextState, effect)
    return loop(nextState, effect);
  },
}, { text: LOOOOP });

export default class extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.dispatch(actions.loop());
  }

  render() {
    console.warn('props?',this.props.data)
    return (
      <div style={routeStyle}>
        {this.props.data.text}
      </div>
    );
  }
}
