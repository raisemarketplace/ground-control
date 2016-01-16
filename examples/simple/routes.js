import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AppComponent from 'examples/simple/components';
import HomeComponent, { reducer as homeReducer } from 'examples/simple/components/home';
import Route2Component, { reducer as route2Reducer, fetchData as route2FetchData } from 'examples/simple/components/route-2';

export default (
  <Route path="/" component={AppComponent}>
    <IndexRoute component={HomeComponent} reducer={homeReducer} />
    <Route path="/route-2" component={Route2Component} reducer={route2Reducer} fetchData={route2FetchData} />
  </Route>
);
