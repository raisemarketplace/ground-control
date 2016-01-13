import { map, pick } from 'lodash';
import component, { reducer, actions } from 'complex-example/routes/child-routes/google-books/components';
import loader from 'complex-example/routes/child-routes/google-books/components/loader';

const cache = {};
const FICTION_KEY = 'FICTION';

const API = 'https://www.googleapis.com/books/v1/volumes?q=subject:';
const FICTION = `${API}fiction`;
const JAVASCRIPT = `${API}javascript`;

const adjustResponse = data => {
  return map(data.items, item => {
    let adjustedItem = item.volumeInfo;
    adjustedItem.author = adjustedItem.authors[0] || 'Unknown';
    adjustedItem = pick(adjustedItem, 'title', 'author');
    return adjustedItem;
  });
};

const fetchFiction = async (isClient) => {
  return new Promise(resolve => {
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
};

const fetchJavascript = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      fetch(JAVASCRIPT)
          .then(response => response.json())
          .then(adjustResponse)
          .then(books => resolve(books));
    }, 500);
  });
};

// Complex example to show full power of API!
const fetchData = async (done, {
  dispatch, hydrated, clientRender, serverRender,
  isClient, isMounted, hydratedDataForRoute,
}) => {
  if (!hydrated()) {
    const fiction = await fetchFiction(isClient());
    if (isMounted()) dispatch(actions.loadFiction(fiction));
  } else {
    const hydratedData = hydratedDataForRoute();
    if (hydratedData && hydratedData.fiction) cache[FICTION_KEY] = hydratedData.fiction;
  }

  clientRender();
  serverRender();

  if (isClient()) {
    const javascript = await fetchJavascript();
    if (isMounted()) dispatch(actions.loadJavascript(javascript));
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
