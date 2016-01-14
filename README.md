# AsyncNestedRedux

Scalable reducer management & powerful data fetching micro-framework for React Router. Member of Redux & Friends.

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
- [x] Rename repo to async-nested-redux
- [x] Deserializers...
- [x] Ensure it plays nice w redux-devtools & various other redux friends
- [x] Ensure it plays nice w redux-simple-router
- [x] Add async / await to demo
- [x] Add getState to data fetch api
- [x] Get tape setup so we can start writing tests
- [x] Refactor
- [x] Fix checksum bug for when JSX routes are used
- [ ] Remove redux-act from easy-example (not complex one)
- [ ] Add gif showing this in action (like redux-devtools github...)
- [ ] Handle error states in loadAsyncState / ssr
- [ ] Convert server example to hapi
- [ ] Thoughts on full API / AsyncProps exports?
- [ ] Re-read async-props to see if anything else interesting
- [ ] Tests...
- [ ] Add to microclient-reference-app
- [ ] Improve readme.
- [ ] Open source.

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
*Inversed route lifecycle hooks - you tell the framework what to do.*
```javascript
async function fetchData(done, { dispatch, hydrated, clientRender, serverRender, isClient }) => {
  // don't repeat request if server hydrated client!
  if (!hydrated()) {
    const topOfPageData = await fetchTopOfPage();
    dispatch(actions.loadTop(topOfPageData));
  }

  // render loading template until we call...
  clientRender(); // render preview template!
  // block server until we call...
  serverRender();

  // load top of page data on server, all data on client
  if (isClient()) {
    const bottomOfPageData = await fetchBottomOfPage();
    dispatch(actions.loadBottom(bottomOfPageData));
    done(); // sets props.loading to false in component!
  }
};
```

###### Nested reducers...
*Reducers & state automatically mirror your nested routes...*
```
{
  anr: {
    self: { counter },
    child: {
      self: { counter },
      child: {
        self: { counter },
      },
    },
  },
}
```

*...and the data is fed in to your components.*
```javascript
// { self: { counter: 0 }, child: { self: { counter: 0 }}}
const ParentRouteComponent = ({ children, data, dispatch, nestedData }) => (
  <div>
    <p>{data.counter}</p>
    {renderNestedRoute(children, nestedData, dispatch)}
  </div>
);

// { self: { counter: 0 }}
const ChildRouteComponent = ({ data }) => <p>{data.counter}</p>;
```

###### Redux & friends
*Plays nicely (hopefully) with everything else...*

- [x] React
- [x] Redux
- [x] React Router
- [x] Immutable.js
- [x] Redux Simple Router
- [x] React-Redux
- [x] Redux DevTools
- [x] Middleware/store enhancers
- [ ] Others?

### How to use...
See [easy example](easy-example) or [more complex example](example).

---

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props) but extended quite a bit!**
