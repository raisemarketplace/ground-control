# Getting Started (Universal)

React, Redux and React-Router all work great on the server. GroundControl does as well. And the fetchData API works on both client & server.

###### Server setup

First lets disable webpack / client build.

*server.js*
```javascript
// app.use(webpackDevMiddleware(webpack(WebpackConfig), { publicPath: '/__build__/', stats: { colors: true }}));
```

Add React, React-Router imports and ensure we get render props. Normally you'd want to add more to handle other cases, see [full example](/examples/createServer.js).

*server.js*
```javascript
//...
import React from 'react';
import { match } from 'react-router';
import routes from './routes';

// ...

match({ routes, location: req.url }, (
  routingErr,
  routingRedirectLocation,
  renderProps
) => {
  if (renderProps) {
    console.log(renderProps);
  }
});

res.send(html);
// ...
```

###### loadStateOnServer

GroundControl provides loadStateOnServer as top level API export. Include it.

*server.js*
```javascript
// ...
import { loadStateOnServer } from 'ground-control';

// ...

match({ routes, location: req.url }, (
  routingErr,
  routingRedirectLocation,
  renderProps
) => {
  if (renderProps) {
    loadStateOnServer({ props: renderProps, store}, (
      loadDataErr,
      loadDataRedirectLocation,
      initialData,
      scriptString
    ) => {
      console.log(initialData);
    });
  }
});
// ...
```

But we don't have everything we need to pass in yet. The server needs the same store as the client.

###### Adding the store

Lets remove a few things from client.js so we can reuse them. Then lets add them to the server and see what we get...

```bash
touch store.js serializer.js
```

*store.js*
```javascript
import { createStore } from 'redux';

export default (initialState = {}) => {
  const store = createStore((state = initialState) => state);
  // NOTE! you'll see this log a fair amount. On route change, we create a new reducer & replace the one the store uses.
  // this triggers a few internal actions, like @@redux/INIT, @@anr/REHYDRATE_REDUCERS. it's expected.
  const logCurrentState = () => console.log(JSON.stringify(store.getState()));
  store.subscribe(logCurrentState);
  logCurrentState();

  return store;
};
```

*serializer.js*
```javascript
export default (route, data) => {
  if (route.immutable) return data.toJS();
  return data;
};
```

*client.js*
```javascript
// ...
import routes from './routes';
import createStore from './store';
import serializer from './serializer';

const store = createStore();
render((
  <Router routes={routes} history={browserHistory} render={(props) => (
    <GroundControl {...props} store={store} serializer={serializer} />
  )} />
), document.getElementById('app'));
```

*server.js*
```javascript
// ...
import createStore from './store';

// ...

const store = createStore();
loadStateOnServer({ props: renderProps, store }, (
// ...
```

With any luck, you should of seen a console log in terminal with data that looks familiar!!

###### Get the data

Send data from the loadStateOnServer callback to ```html()```. You'll notice the error / redirect looks similar to React-Router ```match```.

```javascript
const render = (req, res) => {
  match({ routes, location: req.url }, (
    routingErr,
    routingRedirectLocation,
    renderProps
  ) => {
    if (renderProps) {
      const store = createStore();
      loadStateOnServer({ props: renderProps, store }, (
        loadDataErr,
        loadDataRedirectLocation,
        initialData,
        scriptString
      ) => {
        if (loadDataErr) {
          res.status(500).send(loadDataErr.message);
        } else if (loadDataRedirectLocation) {
          res.redirect(302, `${loadDataRedirectLocation.pathname}${loadDataRedirectLocation.search}`);
        } else {
          res.status(200).send(html(renderProps, store, initialData, scriptString));
        }
      });
    }
  });
};
```

###### Render to string!

Now that we have everything we need in the html function, lets update imports and render.

```javascript
import { renderToString } from 'react-dom/server';
import GroundControl, { loadStateOnServer } from 'ground-control';

// ...

const html = (renderProps, store, initialData, scriptString) => {
  const appString = renderToString(
    <GroundControl {...renderProps} store={store} initialData={initialData} />
  );

  return `
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="app">${appString}</div>
        <script src="/__build__/bundle.js" async></script>
        ${scriptString}
      </body>
    </html>
  `;
};
// ...
```

Now reload! You get your app! We aren't serving JavaScript yet - navigate around. Even go to the redirect route we set up in our previous tutorial - 302 redirect server side.

###### Server render, client render

Comment back in webpack.

*server.js*
```javascript
app.use(webpackDevMiddleware(webpack(WebpackConfig), { publicPath: '/__build__/', stats: { colors: true }}));
```

Great, JS works! But there's an ugly React warning saying that we couldn't reuse the DOM.

###### Client hydration

Notice the `${scriptString}` in HTML we are sending. In Chrome, type ```__INITIAL_DATA__``` and you'll see the data we need to hydrate the app. You'll see some route info in there as well, because we want to tell the client which routes have completed loading server side, and which need more data (more on that in the next section...).

Lets adjust our imports and then wrap ```render``` in a callback to feed in our data.

*client.js*
```javascript
import GroundControl, { loadStateOnClient } from 'ground-control';
// ...

loadStateOnClient({ routes }, initialData => {
  const store = createStore(initialData.initialState);
  render((
    <Router routes={routes} history={browserHistory} render={(props) => (
      <GroundControl {...props} store={store} serializer={serializer} initialData={initialData} />
    )} />
  ), document.getElementById('app'));
});
```

###### Immutable...

One quick problem. We used immutable data! We added serializers for making accessing POJO's in components. But __INITIAL_DATA__ is simple JSON and we need to deserialize it for our reducers.

*components/AppComponent.js*
```javascript
// ...
export const serializer = data => {
  return {
    ...data,
    currentUser: data.currentUser.toJS()
  };
};

export const deserializer = data => {
  return {
    ...data,
    currentUser: fromJS(data.currentUser)
  };
};
// ...
```

*routes.js*
```javascript
// ...
import { component as AppComponent, reducer as appReducer, serializer as appSerializer, deserializer as appDeserializer } from './components/AppComponent';
// ...
<Route path="/" component={AppComponent} reducer={appReducer} serializer={appSerializer} deserializer={appDeserializer}>
// ...
```

And as before, if you are using immutable a lot. Do it at the app level.

```bash
touch deserializer.js
```

*deserializer.js*
```javascript
import { fromJS } from 'immutable';
export default (route, data) => {
  if (route.immutable) return fromJS(data);
  return data;
};

```

*client.js*
```javascript
// ...
import deserializer from './deserializer';
// ...
loadStateOnClient({ routes, deserializer }, initialData => {
// ...
```

*server.js*
```javascript
// ...
import serializer from './serializer';
// ...
<GroundControl {...renderProps} store={store} initialData={initialData} serializer={serializer} />
// ...
```

###### fetchData universal API

The universal fetchData API is pretty powerful. It lets you manage how you fetch data on the client and server. For example, you can fetch top of page data on the server, and then finish the page on the client. If it is entirely rendered client side, fetch the whole thing. It also handles errors, redirects, and when to transition from a blocking fetch to a non-blocking fetch with a 'preview template'. Let's make one of our fetchData calls a bit more complex.

*components/AsyncComponent.js*
```javascript
export const fetchData = (done, {
  dispatch, clientRender, serverRender,
  isHydrated, err, redirect, isClient
}) => {
  const forceErr = Math.random() < .25;
  const forceRedirect = !forceErr && Math.random() < .25;

  clientRender();
  if (!isHydrated()) {
    setTimeout(() => {
      dispatch(asyncActions.load(['a', 'b', 'c', 'd', 'e']));
      if (forceErr) err({ message: 'Oops!' });
      if (forceRedirect) redirect({ pathname: '/' });
      serverRender();
    }, 1000);
  }

  if (isClient()) {
    setTimeout(() => {
      dispatch(asyncActions.load(['f', 'g', 'h']));
      done();
    }, 1000);
  }
};
```

---

#Done! Result...

- That was quite a bit!
- Got the app rendering server side.
- Hydrating the client, and reusing markup on client.
- Handling serialization / deserialization of data on client & server.
- Using universal fetchData API to optimize loading.
