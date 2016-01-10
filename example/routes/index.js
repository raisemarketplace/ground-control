import React from 'react';
import { Route, IndexRoute } from 'react-router';
import {
  App, appReducer,
  ComponentA, caFetch, caReducer, caLoader,
  ComponentB, cbReducer,
  ComponentB1, cb1Fetch, cb1Reducer,
  ComponentB2, cb2Reducer,
} from './temp';

export default (
  <Route path="/" component={App} reducer={appReducer} name='a'>
    <IndexRoute component={ComponentA} fetchData={caFetch} reducer={caReducer} loader={caLoader} name='b'/>
    <Route path="/route-2" component={ComponentB} reducer={cbReducer} name='c'>
      <IndexRoute component={ComponentB1} fetchData={cb1Fetch} reducer={cb1Reducer} name='d' />
      <Route path="/route-2/nested-route" component={ComponentB2} reducer={cb2Reducer} name='e' />
    </Route>
  </Route>
);
