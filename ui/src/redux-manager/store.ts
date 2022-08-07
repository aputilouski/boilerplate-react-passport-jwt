import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createBrowserHistory, History, Location } from 'history';
import { connectRouter, routerMiddleware, LOCATION_CHANGE } from 'connected-react-router';
import rootSaga from './rootSaga';
import authSlice from './auth/slice';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
// import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';

// fix for react dev server hot updates
export const createUniversalHistory = (): History<Location> => {
  const history = window.browserHistory || createBrowserHistory();
  if (process.env.NODE_ENV === 'development' && !window.browserHistory) {
    window.browserHistory = history;
  }
  return history;
};

export const history = createUniversalHistory();

const sagaMiddleware = createSagaMiddleware();

const reducer = {
  router: connectRouter<Location>(history),
  auth: authSlice.reducer,
};
export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
      // createStateSyncMiddleware({
      //   predicate: action => !action.type.startsWith('##') && ![LOCATION_CHANGE].includes(action.type),
      //   // blacklist: [LOCATION_CHANGE],
      // }),
      routerMiddleware(history),
      sagaMiddleware
    ),
});

// initMessageListener(store);

let sagaTask = sagaMiddleware.run(rootSaga);
if (module.hot) {
  module.hot.accept('./rootSaga', () => {
    const getNewRootSaga = require('./rootSaga');
    sagaTask.cancel();
    sagaTask = sagaMiddleware.run(getNewRootSaga);
  });
}

export type RootState = ReturnType<typeof store.getState>;

export const useStore: TypedUseSelectorHook<RootState> = useSelector;

export type StoreAction<T = any> = { type: string; payload: T };
export type StoreActionPromise<T = any, S = unknown, J = unknown> = StoreAction<T> & { resolve: (data?: S) => void; reject: (error?: J) => void };
