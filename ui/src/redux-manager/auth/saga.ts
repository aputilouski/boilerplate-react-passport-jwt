import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import authSlice from './slice';
import api, { getErrorMessage, setAccessToken } from 'api';
import { SIGN_IN, SignInCredentials, SIGN_OUT, SIGN_UP, SignUpCredentials, USER_UPDATE } from './actions';
import { StoreActionPromise } from '../store';
import { replace } from 'connected-react-router';

function* signInWorker(action: StoreActionPromise<SignInCredentials>) {
  const { payload, resolve, reject } = action;
  try {
    const response: Awaited<ReturnType<typeof api.signIn>> = yield call(() => api.signIn(payload));
    setAccessToken(response.data.token);
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

export default function* authWatcher() {
  yield takeEvery(SIGN_IN, signInWorker);
  yield takeEvery(SIGN_OUT, signOutWorker);
  yield takeEvery(SIGN_UP, signUpWorker);
  yield takeEvery(USER_UPDATE, userUpdateWorker);
}
