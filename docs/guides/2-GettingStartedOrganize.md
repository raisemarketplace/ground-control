# Result from [tutorial 1](docs/guides/1-GettingStarted.md), but organized to make next tutorials clearer.

###### Organization

```bash
touch routes.js && mkdir components && touch components/AppComponent.js components/IndexComponent.js components/AsyncComponent.js components/AsyncComponent2.js components/AsyncComponent3.js
```

*components/AppComponent.js*
```javascript
import React from 'react';
import { IndexLink, Link } from 'react-router';
export const component = React.createClass({
  render() {
    return (
      <div style={{border:'1px solid green'}}>
        <p>App</p>
        <IndexLink to="/">Home</IndexLink>&nbsp;
        <Link to="/async-route">Async Route</Link>
        <div style={{border:'1px solid purple'}}>{this.props.children}</div>
      </div>
    );
  }
});
```

*components/IndexComponent.js*
```javascript
import React from 'react';

const actions = {
  increment: (count) => {
    return { type: 'incr', payload: count };
  }
};

const initialState = { counter: 0 };
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'incr':
      return { counter: state.counter + 1 };
    default:
  }

  return state;
};

export const component = React.createClass({
  render() {
    return (
      <p onClick={() => { this.props.dispatch(actions.increment(1)); }}>
        Index component: {this.props.data.counter}
      </p>
    );
  }
});
```

*components/AsyncComponent.js*
```javascript
import React from 'react';
import { Link } from 'react-router';

const actions = {
  load: (data) => {
    return { type: 'load', payload: data };
  }
};

const initialState = { items: [] };
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'load':
      state.items = action.payload;
      break;
    default:
  }

  return state;
};

export const fetchData = (done, { dispatch, clientRender }) => {
  clientRender();
  setTimeout(() => {
    dispatch(actions.load(['a', 'b', 'c', 'd', 'e']));
    done();
  }, 1000);
};

export const component = React.createClass({
  render() {
    const items = this.props.loading ? ['x', 'y', 'z'] : this.props.data.items;
    return (
      <div>
        <p>Async Component ({this.props.loading ? 'Loading...' : 'Loaded!'})</p>
        <Link to="/async-route">AsyncHome</Link>&nbsp;
        <Link to="/async-route/async-nested">Async nested</Link>
        <div>
          {items.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
        <div style={{border:'1px solid red'}}>
          {this.props.children}
        </div>
      </div>
    );
  }
});
```

*components/AsyncComponent2.js*
```javascript
import React from 'react';
export const reducer = (state = 'nested-route-1') => state;
export class component extends React.Component {
  render() {
    return (
      <p>nested-route-1</p>
    );
  }
}
```

*components/AsyncComponent3.js*
```javascript
import React from 'react';
export const reducer = (state = 'nested-route-2') => state;
export const component = ({ data }) => <p>{data}</p>;
```

*routes.js*
```javascript
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { component as AppComponent } from './components/AppComponent';
import { component as IndexComponent, reducer as indexReducer } from './components/IndexComponent';
import { component as AsyncComponent, reducer as asyncReducer, fetchData as asyncFetchData } from './components/AsyncComponent';
import { component as AsyncComponent2, reducer as asyncReducer2 } from './components/AsyncComponent2';
import { component as AsyncComponent3, reducer as asyncReducer3 } from './components/AsyncComponent3';

export default (
  <Route path="/" component={AppComponent}>
    <IndexRoute component={IndexComponent} reducer={indexReducer} />
    <Route path="/async-route" component={AsyncComponent} reducer={asyncReducer} fetchData={asyncFetchData}>
      <IndexRoute component={AsyncComponent2} reducer={asyncReducer2} />
      <Route path="/async-route/async-nested" component={AsyncComponent3} reducer={asyncReducer3} />
    </Route>
  </Route>
);
```

*app.js*
```javascript
import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import AsyncNestedRedux from 'async-nested-redux';
import routes from 'routes';

import { createStore } from 'redux';
const store = createStore((state = {}) => state);
// NOTE! you'll see this log a fair amount. On route change, we create a new reducer & replace the one the store uses.
// this triggers a few internal actions, like @@redux/INIT, @@anr/REHYDRATE_REDUCERS. it's expected.
const logCurrentState = () => console.log(JSON.stringify(store.getState()));
store.subscribe(logCurrentState);
logCurrentState();

render((
  <Router routes={routes} history={browserHistory} render={(props) => (
    <AsyncNestedRedux {...props} store={store} />
  )} />
), document.getElementById('app'));
```

# Done!

Reload and make sure that all went well. Same result as previous tutorial. On to the [next](docs/guides/3-GettingStartedMore.md) to show a bit more of API & flexibility.
