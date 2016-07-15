import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';
import { createStore } from 'redux';
import GroundControl from 'ground-control';

const store = createStore((state = {}) => state);

const AppComponent = React.createClass({
  render() {
    return (
      <div style={{border:'1px solid green'}}>
        <Link to="/">Index</Link>
        <Link to="/a">A route</Link>
        <div style={{border:'1px solid purple'}}>{this.props.children}</div>
      </div>
    );
  }
});

const IndexComponent = React.createClass({
  render() {
    return (
      <p>Index component</p>
    );
  }
});

const areducer = (state = { a: 'aaa', b: 0 }, action) => {
  if (action.type === 'something') return { ...state, b: state.b + 1 };
  return state;
};

const AComponent = React.createClass({
  componentDidMount() {
    this.unsubscribe = this.props.store.subscribe(() => {
      console.log('aaa', this.props.store.getState());
    });
  },

  componentWillUnmount() {
    this.unsubscribe();
  },

  render() {
    return (
      <p onClick={() => { this.props.dispatch({ type: 'something' })}}>a component</p>
    );
  }
});

render((
  <Router history={browserHistory} render={(props) => (
    <GroundControl {...props} store={store} />
  )}>
    <Route path="/" component={AppComponent}>
      <IndexRoute component={IndexComponent} />
      <Route
        path="/a"
        component={AComponent}
        reducer={areducer}
      />
    </Route>
  </Router>
), document.getElementById('app'));
