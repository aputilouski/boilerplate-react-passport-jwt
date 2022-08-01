import { call, put, take, takeEvery, delay, fork, cancel } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import authSlice from './slice';
import api, { getErrorMessage, setAccessToken } from 'api';
import { SIGN_IN, SignInCredentials, SIGN_OUT, SIGN_UP, SignUpCredentials, USER_UPDATE } from './actions';
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
    console.error(error);
    reject(getErrorMessage(error));
  }
}

function* signOutWorker(action: StoreActionPromise) {
  const { resolve, reject } = action;
  try {
    yield call(api.signOut);
    yield put(authSlice.actions.signOut());
    localStorage.removeItem('authorized');
    resolve();
  } catch (error) {
    console.error(error);
    reject();
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

function* userUpdateWorker(action: StoreActionPromise<User>) {
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

function* refreshTokenWatcher() {
  while (true) {
    yield delay(REFRESH_TOKEN_TIMEOUT);
    const response: Awaited<ReturnType<typeof api.refreshToken>> = yield call(api.refreshToken);
    yield call(setAccessToken, response.data.token);
    yield put(authSlice.actions.updateToken(response.data.token));
  }
}

export default function* authWatcher() {
  yield takeEvery(SIGN_UP, signUpWorker);

  while (true) {
    // if (localStorage.getItem('authorized')) {
    // } else {
    // }

    const signInAction: StoreActionPromise<SignInCredentials> = yield take(SIGN_IN);
    yield call(signInWorker, signInAction);

    const updateUserTask: Task = yield takeEvery(USER_UPDATE, userUpdateWorker);
    const refreshTokenTask: Task = yield fork(refreshTokenWatcher);

    const signOutAction: StoreActionPromise = yield take(SIGN_OUT);

    yield cancel([updateUserTask, refreshTokenTask]);
    yield call(signOutWorker, signOutAction);
  }
}
