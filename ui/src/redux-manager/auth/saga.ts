import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import authSlice, { AuthSlice } from './slice';
import api, { getErrorMessage, setAccessToken } from 'api';
import { SIGN_IN, SignInCredentials } from './actions';
import { RootState, StoreAction, StoreActionPromise } from '../store';
import { replace, LOCATION_CHANGE } from 'connected-react-router';

function* signInWorker(action: StoreActionPromise<SignInCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.login>> = yield call(() => api.login(payload));
    setAccessToken(response.data.token);
    yield put(authSlice.actions.login(response.data));
    resolve();
    yield put(replace('/main'));
  } catch (error) {
    console.error(error);
    reject(getErrorMessage(error));
  }
}

// function* logoutWorker() {
//   yield put(authSlice.actions.logout());
// }

// function* resetWorker() {
//   // const path: string = yield select(({ router }: RootState) => router.location.pathname);
//   const location: string = yield select(({ router }: RootState) => router.location);
//   console.log(location);
//   // if (['/', '/register'].includes(path)) {
//   //   const auth: AuthSlice = yield select((state: RootState) => state.auth);
//   //   if (auth.error || auth.loading) yield put(authSlice.actions.reset());
//   // }
// }

// function* registerWorker(action: StoreAction<RegistrationCredentials>) {
//   yield put(authSlice.actions.runLoading());
//   try {
//     yield call(() => api.register(action.payload));
//     yield put(replace('/'));
//   } catch (error) {
//     console.error(error);
//     yield put(authSlice.actions.catchError(getErrorMessage(error)));
//   }
// }

// function* checkUsernameWorker(action: StoreAction<string>) {
//   try {
//     const response: Awaited<ReturnType<typeof api.checkUsername>> = yield call(() => api.checkUsername(action.payload));
//     yield put(authSlice.actions.setUserAvailable(response.data.available));
//   } catch (error) {
//     console.error(error);
//   }
// }

// function* userUpdateWorker(action: StoreActionPromise<User>) {
//   yield put(authSlice.actions.runLoading());
//   const { payload, resolve, reject } = action;
//   try {
//     const response: Awaited<ReturnType<typeof api.updateUser>> = yield call(() => api.updateUser(payload));
//     yield put(authSlice.actions.setUser(response.data.user));
//     resolve();
//   } catch (error) {
//     console.error(error);
//     yield put(authSlice.actions.catchError(getErrorMessage(error)));
//     reject();
//   }
// }

export default function* authWatcher() {
  yield takeEvery(SIGN_IN, signInWorker);
  // yield takeEvery(LOGOUT, logoutWorker);
  // yield takeEvery(REGISTRATION, registerWorker);
  // yield takeEvery(CHECK_USERNAME, checkUsernameWorker);
  // yield takeEvery(USER_UPDATE, userUpdateWorker);
  // yield takeLatest(LOCATION_CHANGE, resetWorker);
}
