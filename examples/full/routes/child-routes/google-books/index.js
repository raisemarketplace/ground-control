import { map, pick } from 'lodash';
import component, { reducer, actions } from 'examples/full/routes/child-routes/google-books/components';
import loader from 'examples/full/routes/child-routes/google-books/components/loader';

const cache = {};
const UNAUTHORIZED = 'Unauthorized';
const SERVER_ERROR = 'ServerError';

const API = 'https://www.googleapis.com/books/v1/volumes?q=subject:';

// handle errors however youd like...
const handleErrors = (forceError, forceRedirect) => response => {
  if (forceError || response.status === 500) throw new Error(SERVER_ERROR);
  if (forceRedirect || response.status === 401) throw new Error(UNAUTHORIZED);
  return response;
};

const adjustResponse = data => map(data.items, item => {
  let adjustedItem = item.volumeInfo;
  adjustedItem.author = adjustedItem.authors[0] || 'Unknown';
  adjustedItem = pick(adjustedItem, 'title', 'author');
  return adjustedItem;
});

const fetchTopOfPageData = async (key, { forceError, forceRedirect, isClient }) => new Promise((resolve, reject) => {
  if (cache[key]) {
    if (forceError) reject(SERVER_ERROR); // for sake of demo
    if (forceRedirect) reject(UNAUTHORIZED);
    resolve(cache[key]);
  } else {
    setTimeout(() => {
      fetch(`${API}${key}`)
          .then(handleErrors(forceError, forceRedirect))
          .then(response => response.json())
          .then(adjustResponse)
          .then(books => {
            if (isClient) cache[key] = books;
            resolve(books);
          }).catch(error => {
            reject(error.message);
          });
    }, 500);
  }
});

const fetchBottomOfPageData = async (key) => new Promise(resolve => {
  setTimeout(() => {
    fetch(`${API}${key}`)
        .then(response => response.json())
        .then(adjustResponse)
        .then(books => resolve(books));
  }, 500);
});

// Complex example to show full power of API!
const fetchData = async (done, {
  routeParams, queryParams, dispatch, isHydrated, clientRender, serverRender,
  isClient, isMounted, hydratedDataForRoute, err, redirect,
}) => {
  const topKey = routeParams.top;
  const bottomKey = routeParams.bottom;

  if (isHydrated()) {
    const hydratedData = hydratedDataForRoute();
    if (hydratedData && hydratedData.top) cache[topKey] = hydratedData.top;
  } else {
    try {
      const forceError = queryParams.error;
      const forceRedirect = queryParams.redirect;
      const books = await fetchTopOfPageData(topKey, { forceError, forceRedirect, isClient: isClient() });
      if (isMounted()) dispatch(actions.loadTop(books));
    } catch (e) {
      if (e === SERVER_ERROR) {
        err({ topBooks: true, message: 'Nope!' });
      } else {
        redirect({ pathname: '/', query: { redirected: true }, state: { testing: 'hello' }});
      }
    }
  }

  clientRender();
  serverRender();

  if (isClient()) {
    const books = await fetchBottomOfPageData(bottomKey);
    if (isMounted()) dispatch(actions.loadBottom(books));
    done();
  }
};

export default {
  path: '/google-books/:top/:bottom',
  component,
  reducer,
  fetchData,
  loader,
};
