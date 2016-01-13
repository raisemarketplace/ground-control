import { map, pick } from 'lodash';
import component, { reducer, actions } from 'example/routes/child-routes/google-books/components';
import loader from 'example/routes/child-routes/google-books/components/loader';

const API = 'https://www.googleapis.com/books/v1/volumes?q=subject:';
const cache = {};

const adjustResponse = data => {
  return map(data.items, item => {
    let adjustedItem = item.volumeInfo;
    adjustedItem.author = adjustedItem.authors[0] || 'Unknown';
    adjustedItem = pick(adjustedItem, 'title', 'author');
    return adjustedItem;
  });
};

// Complex example to show full power of API...
const fetchData = (done, { dispatch, hydrated, hydratedDataForRoute, clientRender, serverRender, isClient }) => {
  const topOfPagePromise = new Promise((resolve) => {
    const fictionKey = `${API}fiction`;
    if (!hydrated()) {
      const topDone = items => {
        dispatch(actions.loadFiction(items));
        clientRender();
        serverRender();
        resolve();
      };

      if (cache[fictionKey]) {
        topDone(cache[fictionKey]);
      } else {
        // await topData();
        // clientRender();
        // serverRender();
        setTimeout(() => {
          fetch(fictionKey)
              .then(response => response.json())
              .then(adjustResponse)
              .then((items) => {
                if (isClient()) cache[fictionKey] = items;
                topDone(items);
              });
        }, 500);
      }
    } else {
      const hydratedData = hydratedDataForRoute();
      if (hydratedData && hydratedData.fiction) cache[fictionKey] = hydratedData.fiction;
      clientRender();
      resolve();
    }
  });

  if (isClient()) {
    const bottomOfPagePromise = new Promise((resolve) => {
      setTimeout(() => {
        fetch(`${API}javascript`)
            .then(response => response.json())
            .then(adjustResponse)
            .then((items) => {
              dispatch(actions.loadJavascript(items));
              resolve();
            });
      }, 1500);
    });

    Promise.all([topOfPagePromise, bottomOfPagePromise]).then(done);
  }
};

export default {
  path: '/google-books',
  component,
  reducer,
  fetchData,
  loader,
};
