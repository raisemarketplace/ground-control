import { map, pick } from 'lodash';
import component, { reducer, actions } from 'complex-example/routes/child-routes/google-books/components';
import loader from 'complex-example/routes/child-routes/google-books/components/loader';

const cache = {};
const FICTION_KEY = 'FICTION';
const UNAUTHORIZED = 'Unauthorized';
const SERVER_ERROR = 'ServerError';

const API = 'https://www.googleapis.com/books/v1/volumes?q=subject:';
const FICTION = `${API}fiction`;
const JAVASCRIPT = `${API}javascript`;

// handle errors however youd like...
const handleErrors = params => response => {
  const TEST_SERVER_ERROR = !!params.error;
  const TEST_REDIRECT = !!params.redirect;
  if (TEST_SERVER_ERROR || response.status === 500) throw new Error(SERVER_ERROR);
  if (TEST_REDIRECT || response.status === 401) throw new Error(UNAUTHORIZED);
  return response;
};

const adjustResponse = data => map(data.items, item => {
  let adjustedItem = item.volumeInfo;
  adjustedItem.author = adjustedItem.authors[0] || 'Unknown';
  adjustedItem = pick(adjustedItem, 'title', 'author');
  return adjustedItem;
});

const fetchTopOfPageData = async (params, isClient) => new Promise((resolve, reject) => {
  if (cache[FICTION_KEY]) {
    if (params.error) reject(SERVER_ERROR); // for sake of demo
    if (params.redirect) reject(UNAUTHORIZED);
    resolve(cache[FICTION_KEY]);
  } else {
    setTimeout(() => {
      fetch(FICTION)
          .then(handleErrors(params))
          .then(response => response.json())
          .then(adjustResponse)
          .then(books => {
            if (isClient) cache[FICTION_KEY] = books;
            resolve(books);
          }).catch(error => {
            reject(error.message);
          });
    }, 500);
  }
});

const fetchBottomOfPageData = async () => new Promise(resolve => {
  setTimeout(() => {
    fetch(JAVASCRIPT)
        .then(response => response.json())
        .then(adjustResponse)
        .then(books => resolve(books));
  }, 500);
});

// Complex example to show full power of API!
const fetchData = async (done, {
  params, dispatch, isHydrated, clientRender, serverRender,
  isClient, isMounted, hydratedDataForRoute, err, redirect,
}) => {
  if (isHydrated()) {
    const hydratedData = hydratedDataForRoute();
    if (hydratedData && hydratedData.fiction) cache[FICTION_KEY] = hydratedData.fiction;
  } else {
    try {
      const books = await fetchTopOfPageData(params, isClient());
      if (isMounted()) dispatch(actions.loadFiction(books));
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
    const books = await fetchBottomOfPageData();
    if (isMounted()) dispatch(actions.loadJavascript(books));
    done();
  }
};

export default {
  path: '/google-books',
  component,
  reducer,
  fetchData,
  loader,
};
