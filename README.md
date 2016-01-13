# AsyncNestedRedux

opinionated new friend for react-router that aims to simplify
the react/redux/react-router setup by giving a bit more power to your routes.

javascript fatigue is real...make your life easier with AsyncNestedRedux!

## TODO
- [x] Route based reducer organization
- [x] Data fetching lifecycle
- [x] Server side rendering
- [x] Hydrate client on initial load
- [x] Update fetchData to object
- [x] Make the example app (code) prettier
- [x] Extract into createClient / createServer for easy reuse
- [x] Rename internally to AsyncNestedRedux
- [x] Easy example showing jsx routes
- [x] Add immutable to 1 reducer in example
- [x] Add combineReducers to 1 reducer in example
- [x] Rename renderChildren to renderNestedRoute
- [x] Deserializers...
- [x] Ensure it plays nice w redux-devtools & various other redux friends
- [ ] Ensure it plays nice w redux-simple-router
- [ ] Add async / await to demo
- [ ] Add getState to data fetch api
- [ ] Add gif showing this in action (like redux-devtools github...)
- [ ] Get tape setup so we can start writing tests
- [ ] Handle error states in loadAsyncState / ssr
- [ ] Convert server example to hapi
- [ ] Thoughts on full API / AsyncProps exports?
- [ ] getReducer to align with getComponent, or not necessary w/ getChildRoutes?
- [ ] Re-read async-props to see if anything else interesting
- [ ] Tests...
- [ ] Add to microclient-reference-app
- [ ] Rename repo to async-nested-redux
- [ ] Open source?

### Problems...

- Using Redux with React-Router: React is easy. Redux is easy. React-Router is easy. All 3 combined is hard! The developer needs to keep React-Router and Redux in sync ([redux-simple-router](https://github.com/rackt/redux-simple-router), [redux-router](https://github.com/acdlite/redux-router)), as reducers are not route-based.
- Data fetching best practices: Best practices for React-Router data fetching are [still being established](https://github.com/rackt/react-router/issues/2638). New versions of React-Router & libraries like [async-props](https://github.com/rackt/async-props) are starting to do nice things.
- Reducer wild wild west: Using something like ```combineReducers``` in a complex single page app creates a flat reducer structure. And it is difficult to have a sense of overall application state when a route changes - what did the previous route, if any, do to application state? Global reducers can get messy.

### Solution: route based reducer organization

- Opinion: Organizing reducers in line with routing structure simplifies overall application state and helps React-Router & redux get along (without redux-simple-router, etc).
- Automatic nested reducers - reducers are nested in line with routing structure. When a route changes, the corresponding state is cleared & replaced with the reducer for the new route, preserving state associated with the parent route reducer. This mimics a server side refresh, but lets developer store certain state a level higher to persist data.

### Solution: first class data fetching

- Opinion: Co-located component data fetching only makes sense with a sophisticated, declarative data fetching service (graphql, falcor). Custom endpoints are better handled at router level.
- Optimal loading control - API to specify exactly when to render route component on server / client. Ex - on server, fetch 'top of page' data, blocking render, and finish loading 'bottom of page' data on client; on client, render 'preview template' immediately & fetch async.

---

###### Data fetching...
*You can do a lot - everything is optional.*
```javascript
fetchData(done, {
  params, dispatch,
  isMounted, hydrated,
  hydratedDataForRoute,
  clientRender, serverRender,
  isClient, isServer
}) {
  // render generic loading template
  // ...
  // ...
  clientRender(); // render preview template

  const promise1 = new Promise((resolve, reject) => {
    if (hydrated()) { // initial load, skip fetch
      resolve();
    } else {
      fetch('endpoint').then(response => {
        if (isMounted()) { // only really necessary for actions that impact parent
          dispatch(actionAssociatedWithParentRouteReducer());
          serverRender(); // block server until...
          resolve();
        }
      });
    }
  });

  // on server, only load 'top of page' data.
  if (isClient()) { // finish loading on client.
    const promise2 = new Promise((resolve, reject) => {
      fetch('endpoint').then(response => {
        dispatch(actionAssociatedWithRouteReducer());
        resolve();
      });
    });

    Promise.all([promise1, promise2]).then(() => {
      done(); // w00t. sets props.loading to false.
    });
  }
}
```

###### Nested reducers...
*Look like this, but @@SELF/@@CHILD are internal.*
```
{
  @@SELF: {
    counter
  },
  @@CHILD: {
    @@SELF: {
      counter
    },
    @@CHILD: {
      @@SELF: {
        counter
      }
    }
  }
}
```

###### Isolated reducers...
*A child can't access parent. If you need to, use thunk.*
```javascript
thunkedAction = () => (dispatch, getState) {
  const applicationCounter = getState().counter;
  dispatch(nestedRouteAction.incr(applicationCounter));
}
```

###### Component data...
*Automatically pass in nested data to nested routes.*
```javascript
// { ['@@SELF']: { counter: 0 }, ['@@CHILD']: { ['@@SELF']: { counter: 0 }}}
const ParentRouteComponent = ({ children, data, dispatch, nestedData }) => {
  return (
    <div>
      <p onClick={() => {dispatch(actions.incr());}}>{data.counter}</p>
      {renderNestedRoute(children, nestedData, dispatch)}
    </div>
  );
};

// { ['@@SELF']: { counter: 0 }}
const ChildRouteComponent = ({ data, dispatch }) => {
  return (
    <p onClick={() => {dispatch(actions.incr());}}>{data.counter}</p>
  );
};
```

### How to use...
See [easy example](easy-example) or [more complex example](example).

---

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props) but extended quite a bit!**
