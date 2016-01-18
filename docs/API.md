### API

###### Top Level
- [AsyncNestedRedux](examples/createClient.js#L43) - sits right underneath Router component / above routes on client and server (if universal).
- [loadStateOnServer(renderProps, store, additionalReducers, cb)](examples/createServer.js#L67) - runs through route life cycle hooks and populates Redux store. Callback to render page, handle redirects, and errors on server. And to feed the apps initial data to the client.
- [loadStateOnClient({ routes, deserializer }, callback)](examples/createClient.js#L26) - hydrates client with initial data from server. Runs data through deserializer & also provides routes information about what was loaded on server. Deserializer can be defined at application layer here, or on routes for specific control, if using immutable.js, etc.
- [getNestedState(state, level)](examples/full/routes/child-routes/nested-counters/components/index.js#L59) - helper to access parent data. To access parent data in reducers, it is recommended to use thunk actions.

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
