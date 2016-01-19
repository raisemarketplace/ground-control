# AsyncNestedRedux

**IMPORTANT!** Relies on React-Router v2 release candidate. This a beta! Use cautiously until we release 1.0 (then strict semver)!

A library that helps reduce the complexity of React-Router/Redux applications:

- Automatically organize application state / reducers based on routing structure.
- Universal data fetching API that lets you control when to render components & manage client / server differences.

```javascript
<Router routes={routes} history={browserHistory} render={(props) => (
  <AsyncNestedRedux {...props} store={store} />
)}/>
```

- **Demo**: Clone & ```npm i && npm start```.
- **Install**: ```npm install async-nested-redux --save-dev```

---

###### Nested application state
*Declare a reducer as a property on your routes. Global application state will automatically build. When a nested route changes, that level of state will clear, and reducers replaced.*
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

*...and the data is fed in to your components.*
```javascript
// { self: { currentUser: 'Nick' }, child: { self: { items: ['a', 'b'] }, child: { self: { quantity: 100 }}}}
const LayoutComponent = ({ children, data, dispatch }) => (
  <div>
    <p>{data.currentUser}</p>
    <div>{children}</div>
  </div>
);

// { self: { items: ['a', 'b'] }, child: { self: { quantity: 100 }}}
const ItemsComponent = ({ data }) => <p>{data.items.length}</p>;

// { self: { quantity: 100 }}
const ItemComponent = ({ data }) => <p>{data.quantity}</p>;
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
- [Example 1](examples/simple)
- [Example 2](examples/full)
- [Tutorial](docs/guides) 
- [API Reference](/docs/guides/API.md)

### Contribute
- [ ] API improvements
- [ ] Better documentation
- [ ] Unit tests

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props).**
