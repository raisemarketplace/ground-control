# AsyncNestedRedux

Scalable reducer management & powerful data fetching for React Router & Redux. Reducers & state follow nested route hierarchy, automatically replacing reducers & removing stale state on route transitions. Renders on server for universal (isomorphic) single page applications. Reverse route lifecycle hooks - the application controls when to render.

**To see demo...** Clone. ```npm i && npm start```. Port 8081.

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
- [x] Remove redux-act from easy-example (not complex one)
- [x] Handle error states in loadAsyncState / ssr
- [x] Redirect / error examples
- [x] Upgrade to React Router rc5
- [x] Start writing tests...
- [x] Helper to connect to appliationState
- [x] Basic documentation for api.
- [ ] Add to microclient-reference-app
- [ ] Setup build tools for npm etc
- [ ] Open source.
- [ ] More tests...

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
*Plays nicely (hopefully)...*

- [x] React
- [x] Redux
- [x] React Router
- [x] Universal rendering (isomorphic)
- [x] Immutable.js
- [x] Redux Simple Router
- [x] React-Redux
- [x] Redux DevTools
- [x] Thunk / middleware
- [ ] Others?

---

### API

###### Top Level
- [AsyncNestedRedux](examples/createClient.js#L43) - sits right underneath Router component / above routes on client and server (if universal).
- [loadStateOnServer(renderProps, store, additionalReducers, cb)](examples/createServer.js#L67) - runs through route life cycle hooks and populates Redux store. Callback to render page, handle redirects, and errors on server. And to feed the apps initial data to the client.
- [loadStateOnClient(routes, callback, deserializer)](examples/createClient.js#L26) - hydrates client with initial data from server. Runs data through deserializer & also provides routes information about what was loaded on server. Deserializer can be defined at application layer here, or on routes for specific control, if using immutable.js, etc.
- [simpleConnect(connect, Component)](examples/full/routes/index.js) - helper pass data to top level component as props.
- [renderNestedRoute(children, nestedData, dispatch)](examples/full/routes/components/index.js#L45) - helper to render children and pass data as props.
- [applicationState(state, level)](examples/full/routes/child-routes/nested-counters/components/index.js#L59) - helper to access parent data in connect. To access parent data in reducers, it is recommended to use thunk actions.

###### AsyncNestedRedux Props
- [initialData](examples/createClient.js) - for universal applications, pass initialData to hydrate client. You get initialData in the callback for loadStateOnClient & loadStateOnServer.
- [reducers](examples/full/config.js) - if using combineReducers at top level, pass them in so we can properly recreate store on route transitions.
- [store](examples/createClient.js) - pass in store. This is Redux!
- [...router.props](examples/createClient.js) - pass in all props from Router.render callback.

###### Route Props
- [reducer](examples/simple/routes.js) - reducers are set in route definition
- ```fetchData``` - as is fetchData. detailed below.
- ```deserializer(data)``` - for initial client hydration
- ```...customProps``` - set ```route.immutable = true``` and then look for that in application deserializer, etc.

###### Data Fetching [Detailed Example](examples/full/routes/child-routes/google-books/index.js#L61)
- ```params{}``` - route params to tailor requests
- ```dispatch(action)``` - dispatch actions with data to reducers
- ```getState()``` - get current state of store, if needed
- ```clientRender()``` - stop blocking on the client, render preview template
- ```serverRender()``` - stop blocking on the server, only use if server doesnt fetch all data & cant call done
- ```done()``` - stop blocking sync requests & set loading to false for async requests
- ```err({})``` - set client loadingError and [cb](examples/createServer.js#L74) to server for however you'd like to handle errors.
- ```redirect({ pathname, query, state })``` - redirect on client & [cb](examples/createServer.js#L76) for server redirects.
- ```isMounted()``` - ensure we are still on the same route. most important if dispatching actions that impact parent route / application state
- ```isHydrated()``` - universal app whether the client already has the data it needs, skip a fetch. only for first render, not subsequent transitions.
- ```hydratedDataForRoute()``` - universal app get data that is hydrated. useful for client side caching, between route transitions.
- ```isClient()```
- ```isServer()```

*All optional except ```done()```*

###### Route Component Props
- ```data{}``` - state associated with route reducers is fed to component under ```props.data```
- ```dispatch()``` - send new actions to your store
- ```loader``` - sync transitions, a custom / generic loading template that blocks render.
- ```loading``` - async transitions, render a 'preview template' until request resolves. non-blocking.
- ```loadingError``` - set by err({}) callback. null by default.
- ```nestedData``` - data associated with children to pass further down the chain

---

### How to use...
See [simple example](examples/simple) for simplest setup or a [slightly more complex example](examples/full) which covers most of the API.

**Special thanks to [ryan florence](https://github.com/ryanflorence)! Initially based on [aync-props](https://github.com/rackt/async-props).**
