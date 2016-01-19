# Getting Started

Simple tutorial to get up and running with GroundControl. ~5 minutes. Reload after each section to see changes.

###### Bootstrap

```bash
mkdir example && cd example && npm init

# build deps
npm i --save-dev nodemon webpack webpack-dev-middleware babel@5.8.34 babel-loader@5.4.0 express

# project deps
npm i --save-dev react react-dom redux react-router@2.0.0-rc5 ground-control

touch webpack.config.js server.js client.js
```

*add start script to package.json*
```javascript
// ...
"scripts": {
  "start": "nodemon --exec babel-node server.js",
// ...
```

*webpack.config.js*
```javascript
const path = require('path');
module.exports = {
  devtool: 'source-map',
  entry: path.join(__dirname, 'client.js'),
  output: {
    path: path.join(__dirname, '__build__'),
    filename: 'bundle.js',
    publicPath: '/__build__/'
  },
  module: {
    loaders: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel' }]
  }
};
```

*server.js*
```javascript
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import WebpackConfig from './webpack.config';

const html = () => {
  return (`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="app"></div>
        <script src="/__build__/bundle.js" async></script>
      </body>
    </html>
  `);
};

const render = (req, res) => {
  res.send(html());
};

const app = express();
app.use(webpackDevMiddleware(webpack(WebpackConfig), { publicPath: '/__build__/', stats: { colors: true }}));
app.get('*', render);
app.listen(8080, () => { console.log('Server listening on http://localhost:8080.'); });
```

```bash
# To see our empty app...
npm start
open http://localhost:8080
```

###### Get a route working, edit client.js

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, IndexLink, Link, browserHistory } from 'react-router';

const AppComponent = React.createClass({
  render() {
    return (
      <div style={{border:'1px solid green'}}>
        <p>App</p>
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

render((
  <Router history={browserHistory}>
    <Route path="/" component={AppComponent}>
      <IndexRoute component={IndexComponent} />
    </Route>
  </Router>
), document.getElementById('app'));
```

###### Create a store & subscribe (just so you can see how the state changes)
*This reducer doesn't matter. It'll be replaced.*

```javascript
// ...

import { Router, Route, IndexRoute, IndexLink, Link, browserHistory } from 'react-router';

import { createStore } from 'redux';
const store = createStore((state = {}) => state);
// NOTE! you'll see this log a fair amount. On route change, we create a new reducer & replace the one the store uses.
// this triggers a few internal actions, like @@redux/INIT, @@anr/REHYDRATE_REDUCERS. it's expected.
const logCurrentState = () => console.log(JSON.stringify(store.getState()));
store.subscribe(logCurrentState);
logCurrentState();

// ...
```

###### Add GroundControl

```javascript
// ...

import { Router, Route, IndexRoute, IndexLink, Link, browserHistory } from 'react-router';
import GroundControl from 'ground-control';

// ...
```

```javascript
// ...

render((
  <Router history={browserHistory} render={(props) => (
    <GroundControl {...props} store={store} />
  )}>
    <Route path="/" component={AppComponent}>

// ...
```

###### Replace IndexComponent & create reducer / actions that work together. Add reducer to the route.

```javascript
// ...

const indexActions = {
  increment: (count) => {
    return { type: 'incr', payload: count };
  }
};

const indexInitialState = { counter: 0 };
const indexReducer = (state = indexInitialState, action) => {
  switch (action.type) {
    case 'incr':
      return { counter: state.counter + 1 };
    default:
  }

  return state;
};

const IndexComponent = React.createClass({
  render() {
    return (
      <p onClick={() => { this.props.dispatch(indexActions.increment(1)); }}>
        Index component: {this.props.data.counter}
      </p>
    );
  }
});

// ...

<Route path="/" component={AppComponent}>
  <IndexRoute component={IndexComponent} reducer={indexReducer} />
</Route>

// ...
```

*Reload here to see your counter!*

###### Add a 2nd Route, and Links

```javascript
// ...

<p>App</p>
<IndexLink to="/">Home</IndexLink>&nbsp;
<Link to="/async-route">Async Route</Link>
<div style={{border:'1px solid purple'}}>{this.props.children}</div>

// ...

const AsyncComponent = React.createClass({
  render() {
    return (
      <div>Async Component</div>
    );
  }
});

render((

// ...

<IndexRoute component={IndexComponent} reducer={indexReducer} />
<Route path="/async-route" component={AsyncComponent} />

// ...
```

###### Add a reducer, and add to route

```javascript
// ...

const asyncActions = {
  load: (data) => {
    return { type: 'load', payload: data };
  }
};

const asyncInitialState = { items: [] };
const asyncReducer = (state = asyncInitialState, action) => {
  switch (action.type) {
    case 'load':
      state.items = action.payload;
      break;
    default:
  }

  return state;
};

const AsyncComponent = React.createClass({
  render() {
    return (
      <div>
        <p>Async Component</p>
        <div>
          {this.props.data.items.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      </div>
    );
  }
});

// ...

<Route path="/async-route" component={AsyncComponent} reducer={asyncReducer} />

// ...
```

###### Create fetchData function, and loading spinner & add to route. Timeout BLOCKS render of component.

```javascript
// ...

const asyncFetchData = (done, { dispatch }) => {
  setTimeout(() => {
    dispatch(asyncActions.load(['a', 'b', 'c', 'd', 'e']));
    done();
  }, 1000);
};

const AsyncComponent = React.createClass({

// ...

<Route path="/async-route" component={AsyncComponent} reducer={asyncReducer} fetchData={asyncFetchData} loader={() => (<p>Loading...</p>)} />

// ...

```

###### Update fetchData to call clientRender, remove loader & add a preview template. Non-blocking.

```javascript
// ...

const asyncFetchData = (done, { dispatch, clientRender }) => {
  clientRender();
  setTimeout(() => {
    dispatch(asyncActions.load(['a', 'b', 'c', 'd', 'e']));
    done();
  }, 1000);
};

const AsyncComponent = React.createClass({
  render() {
    const items = this.props.loading ? ['x', 'y', 'z'] : this.props.data.items;
    return (
      <div>
        <p>Async Component ({this.props.loading ? 'Loading...' : 'Loaded!'})</p>
        <div>
          {items.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      </div>
    );
  }
});

// ...

<Route path="/async-route" component={AsyncComponent} reducer={asyncReducer} fetchData={asyncFetchData} />

// ...
```

###### Change AsyncComponent to have nested routes

```javascript
// ...

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

// ...
```

###### Add an index route, components and reducers.

``` javascript
// ...

const asyncReducer2 = (state = 'nested-route-1') => state;
class AsyncComponent2 extends React.Component {
  render() {
    return (
      <p>nested-route-1</p>
    );
  }
}

const asyncReducer3 = (state = 'nested-route-2') => state;
const AsyncComponent3 = ({ data }) => <p>{data}</p>;

render((

// ...

<Route path="/async-route" component={AsyncComponent} reducer={asyncReducer} fetchData={asyncFetchData}>
  <IndexRoute component={AsyncComponent2} reducer={asyncReducer2}/>
  <Route path="/async-route/async-nested" component={AsyncComponent3} reducer={asyncReducer3} />
</Route>

// ...
```
---

#Done! Result...

- You have one file with React, Redux, React-Router, and now GroundControl.
- You can organize your actual application code however you like (wouldn't recommend one file...).
- No thought required for initial reducer structure. Just follow your routes.
- Easy to get started with new routes - 1 file for actions, reducer, component.
- Passed data into your components without worrying about actual nested structure (didn't have to access via anr.self.child.self)
- Transitioned routes without having to reset state manually.
- Controls how data loads with sync/async route transitions.

One file is getting out of hand. [Organize...](docs/guides/2-GettingStartedOrganize.md).
