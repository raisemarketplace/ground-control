# AsyncNestedRedux

**IMPORTANT!** Relies on React-Router v2 release candidate. Consider this a beta / use cautiously until we release 1.0 (then strict semver)!

Scalable reducer management & powerful data fetching for React Router & Redux. Reducers & state follow nested route hierarchy, automatically replacing reducers & removing stale state on route transitions. Renders on server for universal single page applications. Reverse route lifecycle hooks - the application controls when to render.

Sits beneath your router, and above your application, to provide structure around fetching / storing data.

```javascript
<Router routes={routes} history={browserHistory} render={(props) => (
  <AsyncNestedRedux {...props} store={store} />
)}/>
```

**Demo!** Clone. ```npm i && npm start```. Port 8081.

**Install!** ```npm install async-nested-redux --save-dev```

### Problems...

- Reducer wild wild west: ```combineReducers``` helps you keep reducers small & isolated, but creates a flat reducer structure. This makes it difficult to have an understanding of overall application state on any given route. What did the previous route do to state? Is this the initial page load? And if you navigate back to a route, does state need to be manually cleared to reset the page? Application state feels global & mutable.
- Data fetching best practices & universal rendering: Best practices for React-Router data fetching are [still being established](https://github.com/rackt/react-router/issues/2638). Routing lifecycle hooks aren't built in to React-Router, unlike Ember or Angular. The new [async-props](https://github.com/rackt/async-props) library and React-Router folks are starting to do interesting things in that area & inspired this.

### Solution: Route based reducer organization

- Opinion: Organizing reducers based on routes simplifies overall application state, and provides more structure for single page applications.
- Automatic nested reducers - reducers are nested in line with nested routing structure. When a nested route changes, the corresponding level of state is cleared & the old reducer is replace with the reducer for the new route / nested routes.
- State associated with the parent route reducer is preserved. This mimics a server side refresh, but lets developer store certain state a level higher to easily persist data (current user objects, etc).
- Reducers are isolated / pure & easily testable on their own.

### Solution: First class data fetching & inverse lifecycle

- Opinion: Co-located component data fetching makes the most sense with a sophisticated, declarative data fetching service (graphql, falcor), where you can build a query through component hierarchy. Standard API endpoints are better handled at router level.
- Optimal loading control - API to control exactly when to render a route's component on the server & client, for universal applications.
- For example - On the server, blocking fetch to render 'top of page' data. On the client, render 'preview template' immediately & fetch async to finish loading 'bottom of page' data.
- Universal API to handle data fetching redirects, errors and when to resolve requests on client & server.
- Redux integration to interact with the reducer that is associated with new route. Methods provided to hydrate client with initial data.

---

###### Data fetching...
*Inversed route lifecycle hooks - you tell the framework what to do...*
```javascript
async function fetchData(done, {
  clientRender, serverRender, err, redirect,
  dispatch, isHydrated, isClient,
}) => {
  // don't repeat request if server hydrated client!
  if (!isHydrated()) {
    try {
      const topOfPageData = await fetchTopOfPage();
    } catch (e) {
      // redirect client; 302, etc. on server
      if (e === UNAUTHORIZED) redirect({ pathname: '/' });
      // props.error on client; 500, etc. on server
      if (e === BAD_REQUEST) err({ message: 'failed' });
    }
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
*Reducers & state correlate with nested routes...*
```javascript
{
  anr: {
    self: { counter }, // application state, persists
    child: {
      self: { counter }, // most common, 1st level route
      child: {
        self: { counter }, // infinite...
      },
    },
  },
}
```

*...and the data is fed in to your components.*
```javascript
// { self: { counter: 0 }, child: { self: { counter: 0 }}}
const ParentRouteComponent = ({ children, data, dispatch }) => (
  <div>
    <p>{data.counter}</p>
    <div>{children}</div>
  </div>
);

// { self: { counter: 0 }}
const ChildRouteComponent = ({ data }) => <p>{data.counter}</p>;
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

### How to use...
See [simple example](examples/simple) for simplest setup or a [slightly more complex example](examples/full) which covers most of the API.

A tutorial will come shortly!

### Contribute
- [ ] API improvements
- [ ] Unit tests
- [ ] Better documentation

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props).**
