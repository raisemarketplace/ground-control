# GroundControl

**IMPORTANT!** Relies on React-Router v2 release candidate. This a beta! Use cautiously until we release 1.0 (then strict semver)! Tests coming...

GroundControl simplifies React-Router/Redux applications:

- Organize your reducers based on routing structure, and GroundControl builds your application state & replaces reducers on transition.
- Data fetching API that helps you control when to render components & manage client / server differences (Universal API).

```javascript
<Router
    history={browserHistory}
    render={(props) => (
      <GroundControl {...props} store={store} />
    )}>
  <Route path="/" reducer={rootReducer}>
    <IndexRoute reducer={indexReducer} />
    <Route path="/route-1" reducer={route1Reducer} />
  </Route>
</Router>
```

**Demo** Clone & ```npm i && npm start```.
**Install** ```npm install ground-control --save-dev```

---

###### Nested application state
*Declare a reducer as a property on your routes. Global application state will automatically build. When a nested route changes, that level of state will clear, and reducers replaced...*
```javascript
{
  anr: {
    self: { currentUser }, // path: "/" -- root component / layout.
    child: {
      self: { items }, // path: "/items" -- 1st level route.
      child: {
        self: { item }, // path: "/items/:id" -- nested
      },
    },
  },
}
```

*...and the data is automatically fed in to your route components.*
```javascript
// { self: { currentUser: 'Nick' }, child: { self: { items: ['a', 'b'] }, child: { self: { item: { quantity: 100 }}}}}
const LayoutComponent = ({ children, data, dispatch }) => (
  <div>
    <p>{data.currentUser}</p>
    <div>{children}</div>
  </div>
);

// { self: { items: ['a', 'b'] }, child: { self: { item: { quantity: 100 }}}}
const ItemsRouteComponent = ({ data }) => <p>{data.items.length}</p>;

// { self: { item: { quantity: 100 }}}
const ItemRouteComponent = ({ data }) => <p>{data.item.quantity}</p>;
```

###### Universal data fetching API
*Inverse route lifecycle hooks - you tell the framework what to do...*
```javascript
async function fetchData(done, { clientRender, serverRender, dispatch, isClient }) => {
  clientRender();
  const topOfPageData = await fetchTopOfPage();
  dispatch(actions.loadTop(topOfPageData));
  serverRender();
  if (isClient()) {
    const bottomOfPageData = await fetchBottomOfPage();
    dispatch(actions.loadBottom(bottomOfPageData));
    done();
  }
};
```

###### Redux & friends
*Plays nicely (hopefully)...*

- [x] React
- [x] Redux
- [x] React Router
- [x] Universal rendering (isomorphic)
- [x] Immutable.js
- [x] Redux Simple Router
- [x] React-Redux (if desired)
- [x] Redux DevTools
- [x] Thunk / middleware
- [ ] Others?

---

### How to use
- [Example 1 (Simple)](examples/simple)
- [Example 2 (Full)](examples/full)
- [Tutorial](docs/guides)
- [API Reference](/docs/guides/API.md)

### Contribute
- [ ] API improvements
- [ ] Better documentation
- [ ] Unit tests

### Why GroundControl?
- [Tribute to one of best artists ever](https://www.youtube.com/watch?v=D67kmFzSh_o)
- Layer above your application to help you control data.
  - API to fetch data for your routes.
  - Clean up state from previous routes.
  - Updates store with new reducers.

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props).**
