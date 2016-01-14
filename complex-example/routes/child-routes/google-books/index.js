import { map, pick } from 'lodash';
import component, { reducer, actions } from 'complex-example/routes/child-routes/google-books/components';
import loader from 'complex-example/routes/child-routes/google-books/components/loader';

const cache = {};
const FICTION_KEY = 'FICTION';

const API = 'https://www.googleapis.com/books/v1/volumes?q=subject:';
const FICTION = `${API}fiction`;
const JAVASCRIPT = `${API}javascript`;

const adjustResponse = data => map(data.items, item => {
  let adjustedItem = item.volumeInfo;
  adjustedItem.author = adjustedItem.authors[0] || 'Unknown';
  adjustedItem = pick(adjustedItem, 'title', 'author');
  return adjustedItem;
});

const fetchTopOfPageData = async (isClient) => new Promise(resolve => {
  if (cache[FICTION_KEY]) {
    resolve(cache[FICTION_KEY]);
  } else {
    setTimeout(() => {
      fetch(FICTION)
          .then(response => response.json())
          .then(adjustResponse)
          .then(books => {
            if (isClient) cache[FICTION_KEY] = books;
            resolve(books);
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
  dispatch, hydrated, clientRender, serverRender,
  isClient, isMounted, hydratedDataForRoute,
}) => {
  if (hydrated()) {
    const hydratedData = hydratedDataForRoute();
    if (hydratedData && hydratedData.fiction) cache[FICTION_KEY] = hydratedData.fiction;
  } else {
    const books = await fetchTopOfPageData(isClient());
    if (isMounted()) dispatch(actions.loadFiction(books));
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
