import { call, put, take, takeEvery, delay, fork, cancel, retry } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import authSlice from './slice';
import api, { getErrorMessage, setAccessToken } from 'api';
import { SIGN_IN, SignInCredentials, SIGN_OUT, SIGN_UP, SignUpCredentials, USER_UPDATE, PASSWORD_UPDATE, UpdatePasswordArgs, signOut } from './actions';
import { StoreActionPromise } from '../store';
import { replace } from 'connected-react-router';

const REFRESH_TOKEN_TIMEOUT = (eval(process.env.REACT_APP_REFRESH_TOKEN_TIMEOUT as string) || 60 * 5) * 1000;

function* signInWorker(action: StoreActionPromise<SignInCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.signIn>> = yield call(() => api.signIn(payload));
    yield call(setAccessToken, response.data.token);
    yield put(authSlice.actions.signIn(response.data));
    localStorage.setItem('authorized', '1');
    resolve();
    yield put(replace('/main'));
  } catch (error) {
    reject(getErrorMessage(error));
    throw error;
  }
}

function* autoSignInWorker() {
  try {
    yield put(authSlice.actions.setPendingAuth(true));
    const response: Awaited<ReturnType<typeof api.autoSignIn>> = yield call(api.autoSignIn);
    yield call(setAccessToken, response.data.token);
    yield put(authSlice.actions.signIn(response.data));
    yield put(replace('/main'));
  } catch (error) {
    yield put(authSlice.actions.setPendingAuth(false));
    localStorage.removeItem('authorized');
    throw error;
  }
}

function* signOutWorker(action: StoreActionPromise) {
  const { resolve, reject } = action;
  try {
    yield call(api.signOut);
    resolve();
  } catch (error) {
    reject();
    throw error;
  } finally {
    yield put(authSlice.actions.signOut());
    localStorage.removeItem('authorized');
  }
}

function* signUpWorker(action: StoreActionPromise<SignUpCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    yield call(() => api.signUp(payload));
    resolve();
    yield put(replace('/'));
  } catch (error) {
    console.error(error);
    reject(getErrorMessage(error));
  }
}

function* refreshTokenWatcher() {
  try {
    while (true) {
      yield delay(REFRESH_TOKEN_TIMEOUT);
      const response: Awaited<ReturnType<typeof api.refreshToken>> = yield retry(3, 20 * 1000, api.refreshToken);
      yield call(setAccessToken, response.data.token);
      yield put(authSlice.actions.updateToken(response.data.token));
    }
  } catch (error) {
    yield call(signOut);
  }
}

function* updateUserWorker(action: StoreActionPromise<User>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.updateUser>> = yield call(() => api.updateUser(payload));
    yield put(authSlice.actions.updateUser(response.data.user));
    resolve();
  } catch (error) {
    console.error(error);
    reject(getErrorMessage(error));
  }
}

function* updatePasswordWatcher(action: StoreActionPromise<UpdatePasswordArgs>) {
  const { payload, resolve, reject } = action;
  try {
    yield call(() => api.updatePassword(payload));
    resolve();
  } catch (error) {
    console.error(error);
    reject(getErrorMessage(error));
  }
}

function* authWatcher() {
  let autoAuthorized = false;
  if (localStorage.getItem('authorized')) {
    yield call(autoSignInWorker);
    autoAuthorized = true;
  }

  yield takeEvery(SIGN_UP, signUpWorker);

  while (true) {
    if (!autoAuthorized) {
      const signInAction: StoreActionPromise<SignInCredentials> = yield take(SIGN_IN);
      yield call(signInWorker, signInAction);
    } else autoAuthorized = false;

    const updateUserTask: Task = yield takeEvery(USER_UPDATE, updateUserWorker);
    const updatePasswordTask: Task = yield takeEvery(PASSWORD_UPDATE, updatePasswordWatcher);
    const refreshTokenTask: Task = yield fork(refreshTokenWatcher);

    const signOutAction: StoreActionPromise = yield take(SIGN_OUT);

    yield cancel([updateUserTask, updatePasswordTask, refreshTokenTask]);
    yield call(signOutWorker, signOutAction);
  }
}

export default function* main() {
  while (true) {
    try {
      yield call(authWatcher);
    } catch (error) {
      console.error(error);
    }
  }
}
