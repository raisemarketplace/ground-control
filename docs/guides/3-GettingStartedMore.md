# Getting Started (More)

This tutorial builds off of the [previous](docs/guides/2-GettingStartedOrganize.md), to show a bit more of API & flexibility.

###### Adding more structure - combinedReducers

When a child route changes, application state updates, clearing out state at the corresponding level in the nested reducer hierarchy. However, parent route state is maintained, making this an easy place to store data that should persist. Lets add a currentUser at the application level. But rather than that being the only thing on application reducer, lets namespace it with combinedReducers.

*components/AppComponent.js*
```javascript
// ...
import { IndexLink, Link } from 'react-router';
import { combineReducers } from 'redux';

const initialCurrentUserState = { name: 'Nick' };
const currentUserReducer = (state = initialCurrentUserState, action) => {
  return state;
};

export const reducer = combineReducers({
  currentUser: currentUserReducer
});

// ...

<div style={{border:'1px solid green'}}>
  <p>App: {this.props.data.currentUser.name}</p>
// ...
```

*routes.js*
```javascript
// ...
export default (
  <Route path="/" component={AppComponent} reducer={appReducer}>
//...
```

###### Accessing parent data in components / actions

We'd like to be able to see currentUser in a childRoute as well. Since this is common, ```parentData``` is provided as a prop to route component. ```getParentData``` is also provided as a function to get parent-parentData, or parent-parent-parentData (if very deep).

*components/AsyncComponent.js*
```javascript
// ...
const items = this.props.loading ? ['x', 'y', 'z'] : this.props.data.items;
const user = this.props.rootData.currentUser.name;
return (
  <div>
    <p>Async Component (User: {user}) ({this.props.loading ? 'Loading...' : 'Loaded!'})</p>
// ...
```

###### Fancy reducers / actions

Let's make it so we can update the current user name. But theres some boilerplate with Redux. So let's minimize it with a helper lib of preference. I prefer actions that create a unique id, so you don't have to worry about reducer action collisions. Then, lets update that currentUser name in a deeply nested component.

```bash
npm i --save-dev redux-act
```

*components/AppComponent.js*
```javascript
// ...
import { combineReducers } from 'redux';
import { createReducer, createAction } from 'redux-act';

export const actions = {
  update: createAction()
};

const initialCurrentUserState = { name: 'Nick' };
const currentUserReducer = createReducer({
  [actions.update]: (state, payload) => {
    return { name: payload };
  }
}, initialCurrentUserState);
// ...
```

*components/AsyncComponent2.js*
```javascript
import React from 'react';
import { actions as rootActions } from './AppComponent';
export const reducer = (state = 'nested-route-1') => state;
export class component extends React.Component {
  render() {
    const { rootData, dispatch } = this.props;
    const user = rootData.currentUser.name;
    return (
      <div>
        <p>nested-route-1</p>
        <input type='text' value={user} onChange={(e) => {
          dispatch(rootActions.update(e.target.value));
        }} />
      </div>
    );
  }
}
```

###### Fancy data / immutable js

Great! We are persisting data at application level, but easy to interact with throughout various levels of route hierarchy. Let's now make our application reducer use immutable data, if that is your preference.

```bash
npm i --save-dev immutable
```

*components/AppComponent.js*
```javascript
// ...
import { createReducer, createAction } from 'redux-act';
import { Map } from 'immutable';

// ...

const initialCurrentUserState = Map({ name: 'Nick' });
const currentUserReducer = createReducer({
  [actions.update]: (state, payload) => {
    return state.set('name', payload);
  }
}, initialCurrentUserState);

// ...
```

Ok but now current user name not showing up! This is because we'd have to access ```currentUser.name``` as ```currentUser.get('name')``` in each component. You can do this if you'd like. But, it's helpful to add a serializer, and just deal with POJO's in components (so components don't have to care about reducer data API / getters).

*components/AppComponent.js*
```javascript
// ...
export const serializer = data => {
  return {
    ...data,
    currentUser: data.currentUser.toJS()
  };
};

export const component = React.createClass({
// ...
```

*routes.js*
```javascript
// ...
import { component as AppComponent, reducer as appReducer, serializer as appSerializer } from './components/AppComponent';

// ...

export default (
  <Route path="/" component={AppComponent} reducer={appReducer} serializer={appSerializer}>
// ...
```

Use immutable a lot? Let's add an app-level serializer, to make things a bit smoother.

*components/AsyncComponent3.js*
```javascript
import React from 'react';
import { Map } from 'immutable';
export const reducer = (state = Map({ content: 'nested-route-2' })) => state;
export const component = ({ data }) => <p>{data.content}</p>;
```

*routes.js*
```javascript
// ...
<Route path="/async-route/async-nested" component={AsyncComponent3} reducer={asyncReducer3} immutable={true} />
// ...
```

*client.js*
```javascript
// ...
const serializer = (route, data) => {
  if (route.immutable) return data.toJS();
  return data;
};

render((
  <Router routes={routes} history={browserHistory} render={(props) => (
    <AsyncNestedRedux {...props} store={store} serializer={serializer} />
// ...
```

###### Redirects / errors

React router has a nice way of handling redirects, and not found routes at router level. But how do we handle it when we fetch data? Add fetchData and handle an error state for ```/async-route/async-nested```.

*components/AsyncComponent3.js*
```javascript
// ...

export const fetchData = (done, { err }) => {
  setTimeout(() => {
    err({ message: 'Oops!' });
  }, 1000);
};

export const reducer = (state = Map({ content: 'nested-route-2' })) => state;
export const component = ({ data, loadingError }) => {
  return (
    <div>
      {loadingError ? <p>{loadingError.message}</p> : <p>{data.content}</p>}
    </div>
  );
};
```

*routes.js*
```javascript
// ...
import { component as AsyncComponent3, reducer as asyncReducer3, fetchData as async3FetchData } from './components/AsyncComponent3';
// ...
<Route path="/async-route/async-nested" component={AsyncComponent3} reducer={asyncReducer3} immutable={true} fetchData={async3FetchData} />
// ...
```

Great! But now, rather than an error, let's redirect to root.

*components/AsyncComponent3.js*
```javascript
//...
export const fetchData = (done, { redirect }) => {
  setTimeout(() => {
    redirect({ pathname: '/' });
  }, 1000);
};
// ...
```

---

#Done! Result...

- We see the routes file does a bit more than vanilla react-router. But this gives you quite a bit of application control. If routes grow out of hand, you can split them, and don't have to use JSX. See [the complex example to see this](examples/full/routes/index.js). This structure can grow & scale quite easily.
- Added structure to large reducers with combineReducers.
- Accessed root application data throughout deeply nested routes.
- Customized the app with however we'd like to create reducers / actions.
- Added a library like immutable.js and serialized that data into components, to restrict immutable to reducers.
- Used a bit more of the fetchData API to handle redirects & errors.

The [next tutorial](docs/guides/4-GettingStartedUniversal.md) builds off of this, and shows you how to convert this to a universal app.
