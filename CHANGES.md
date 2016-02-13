## [0.4.0]

- [x] Handle deserialize in constructor not loadStateOnClient.
- [x] Rename reducerData to getReducerState
- [x] Change asyncLeave to onLeave & call with extra params.
- [x] Use state for injected params.

## [0.3.0]

- Fix - only call asyncEnter for changed routes.
- Temporary - omit routeParams from injected props.
- Rename isHydrated to isInitialLoad.
- Rename hydratedDataForRoute to reducerData.
- Rename fetchData to asyncEnter.
- Add asyncLeave.

## [0.2.0]

- Remove getParentData & rootData from injected props. Rely on context.
- Remove options.params from fetchData. Add options.queryParams & options.routeParams.

## [0.1.0]

- Initial Version!
