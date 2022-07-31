import { call, put, take, takeEvery, delay, fork, all, cancel } from 'redux-saga/effects';
import { Task } from 'redux-saga';
import authSlice from './slice';
import api, { getErrorMessage, setAccessToken } from 'api';
import { SIGN_IN, SignInCredentials, SIGN_OUT, SIGN_UP, SignUpCredentials, USER_UPDATE } from './actions';
import { StoreActionPromise } from '../store';
import { replace } from 'connected-react-router';

function* signInWorker(action: StoreActionPromise<SignInCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.signIn>> = yield call(() => api.signIn(payload));
    yield call(setAccessToken, response.data.token);
    yield put(authSlice.actions.login(response.data));
    resolve();
    yield put(replace('/main'));
  } catch (error) {
    console.error(error);
    reject(getErrorMessage(error));
  }
}

function* signOutWorker() {
  yield put(authSlice.actions.logout());
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
    yield delay(5000);
    yield call(api.refreshToken);
  }
}

export default function* authWatcher() {
  yield takeEvery(SIGN_UP, signUpWorker);

  while (true) {
    const action: StoreActionPromise<SignInCredentials> = yield take(SIGN_IN);
    yield call(signInWorker, action);

    const updateUserTask: Task = yield takeEvery(USER_UPDATE, userUpdateWorker);
    const refreshTokenTask: Task = yield fork(refreshTokenWatcher);

    yield take(SIGN_OUT);

    yield cancel([updateUserTask, refreshTokenTask]);
    yield call(signOutWorker);
  }
}
