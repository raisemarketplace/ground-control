# AsyncRedux

opinionated new friend for react-router that aims to simplify
the react/redux/react-router setup by giving a bit more power to your routes.

javascript fatigue is real...make your life easier with AsyncRedux!

## TODO
- [x] Route based reducer organization
- [x] Data fetching lifecycle
- [x] Server side rendering
- [x] Hydrate client on initial load
- [x] Update fetchData to object
- [x] Make the example app (code) prettier
- [ ] Add gif showing this in action (like redux-devtools github...)
- [ ] Handle error states in loadAsyncState / ssr
- [ ] Convert server example to hapi
- [ ] Thoughts on full API / AsyncProps exports?
- [ ] getReducer to align with getComponent, or not necessary w/ getChildRoutes?
- [ ] Re-read async-props to see if anything else interesting
- [ ] Tests...
- [ ] Add to microclient-reference-app
- [ ] Open source?

### First class data fetching

- opinion: co-located component data fetching only makes sense with a sophisticated, declarative data fetching service (graphql, falcor). custom endpoints are better handled at router level.
- optimal loading control - api to specify exactly when to render route component on server / client. ex - on server, fetch 'top of page' data blocking render, finish loading 'bottom of page' data on client. on client, render 'preview template' immediately & fetch async.

### Route based reducer organization

- opinion: react is easy. redux is easy. react-router is easy. all 3 combined is hard! organizing reducers in line with routing structure simplifies overall application state and helps react-router & redux get along (without redux-simple-router, etc).
- automatic nested reducers - reducers are nested in line with routing structure. when a route changes, the corresponding state is cleared & replaced with the reducer for the new route. this preserves state associated with the parent route reducer. this mimics a server side refresh, but lets developer store certain state a level higher to persist data.

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
  clientReady(); // render preview template

  const promise1 = new Promise((resolve, reject) => {
    if (hydrated()) { // initial load, skip fetch
      resolve();
    } else {
      fetch('endpoint').then(response => {
        if (isMounted()) { // only really necessary for actions that impact parent
          dispatch(actionAssociatedWithParentRouteReducer());
          serverReady(); // block server until...
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
*Look like this, but @@child is hidden from developer.*
```
{
  counter,
  @@child: {
    counter,
    @@child: {
      counter
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
// { counter: 0, ['@@CHILD']: { counter: 0 }}

const ParentRouteComponent = ({ children, data, dispatch }) => {
  return (
    <div>
      <p onClick={() => {dispatch(actions.incr());}}>{data.counter}</p>
      {renderChildren(children, data, dispatch)}
    </div>
  );
};

const ChildRouteComponent = ({ data, dispatch }) => {
  return (
    <p onClick={() => {dispatch(actions.incr());}}>{data.counter}</p>
  );
};
```

### How to use...
[See example implementation]('tree/master/example').

---

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props) but extended quite a bit!**
