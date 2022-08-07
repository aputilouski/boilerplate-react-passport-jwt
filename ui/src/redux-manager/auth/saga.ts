import { call, put, take, takeEvery, delay, fork, cancel, retry, cancelled } from 'redux-saga/effects';
import { Task, EventChannel, eventChannel } from 'redux-saga';
import authSlice from './slice';
import api, { getErrorMessage, setAccessToken, getAccessToken } from 'api';
import { SIGN_IN, SignInCredentials, SIGN_OUT, SIGN_UP, SignUpCredentials, USER_UPDATE, PASSWORD_UPDATE, UpdatePasswordArgs, signOut, SYNC_ACCESS_TOKEN } from './actions';
import { StoreActionPromise, StoreAction } from '../store';
import { replace } from 'connected-react-router';

const REFRESH_TOKEN_TIMEOUT = (eval(process.env.REACT_APP_REFRESH_TOKEN_TIMEOUT as string) || 60 * 5) * 1000;

function subscribe(bc: BroadcastChannel) {
  return eventChannel(emit => {
    bc.onmessage = event => {
      console.log(event);
    };
    return () => {
      bc.close();
    };
  });
}

function* syncAccessToken(bc: BroadcastChannel, action: StoreAction<string>) {
  const token = action.payload;
  console.log('syncAccessToken', token);
  yield call(setAccessToken, token);
  yield call([bc, bc.postMessage], { access_token: token });
}

function* syncAccessTokenWorker(bc: BroadcastChannel) {
  yield takeEvery(SYNC_ACCESS_TOKEN, syncAccessToken, bc);

  const channel: EventChannel<StoreAction> = yield call(subscribe, bc);
  try {
    while (true) {
      const action: StoreAction = yield take(channel);
      yield put(action);
    }
  } finally {
    const result: boolean = yield cancelled();
    if (result) channel.close();
  }
}

function* signInWorker(action: StoreAction<SignInCredentials>) {
  try {
    yield put(authSlice.actions.setErrorMessage({}));
    yield put(authSlice.actions.setLoading(true));
    const response: Awaited<ReturnType<typeof api.signIn>> = yield call(() => api.signIn(action.payload));
    yield call(setAccessToken, response.data.token);
    // yield put({ type: SYNC_ACCESS_TOKEN, payload: response.data.token });
    yield put(authSlice.actions.signIn(response.data));
    yield call([localStorage, localStorage.setItem], 'authorized', '1');
    yield put(replace('/main'));
  } catch (error) {
    yield put(authSlice.actions.setErrorMessage({ [SIGN_IN]: getErrorMessage(error) }));
    throw error;
  } finally {
    yield put(authSlice.actions.setLoading(false));
  }
}

function* autoSignInWorker() {
  try {
    yield put(authSlice.actions.setPendingAuth(true));
    const result: ReturnType<typeof getAccessToken> = yield call(getAccessToken);
    if (result) {
      yield call(setAccessToken, result);
      const response: Awaited<ReturnType<typeof api.getUser>> = yield call(api.getUser);
      yield put(authSlice.actions.signIn({ user: response.data.user }));
    } else {
      const response: Awaited<ReturnType<typeof api.autoSignIn>> = yield call(api.autoSignIn);
      yield call(setAccessToken, response.data.token);
      // yield put({ type: SYNC_ACCESS_TOKEN, payload: response.data.token });
      yield put(authSlice.actions.signIn({ user: response.data.user }));
    }
    yield put(replace('/main'));
  } catch (error) {
    yield put(authSlice.actions.setPendingAuth(false));
    yield call([localStorage, localStorage.removeItem], 'authorized');
    throw error;
  }
}

function* signOutWorker() {
  try {
    yield put(authSlice.actions.setPendingAuth(true));
    yield call(api.signOut);
  } catch (error) {
    throw error;
  } finally {
    yield put(authSlice.actions.setPendingAuth(false));
    yield put(authSlice.actions.signOut());
    yield call([localStorage, localStorage.removeItem], 'authorized');
  }
}

function* signUpWorker(action: StoreAction<SignUpCredentials>) {
  try {
    yield put(authSlice.actions.setErrorMessage({}));
    yield put(authSlice.actions.setLoading(true));
    yield call(() => api.signUp(action.payload));
    yield put(replace('/'));
  } catch (error) {
    console.error(error);
    yield put(authSlice.actions.setErrorMessage({ [SIGN_UP]: getErrorMessage(error) }));
  } finally {
    yield put(authSlice.actions.setLoading(false));
  }
}

function* refreshTokenWorker() {
  try {
    // const bc: BroadcastChannel = yield call(() => new BroadcastChannel('access_token'));
    // yield fork(syncAccessTokenWorker, bc);

    while (true) {
      yield delay(REFRESH_TOKEN_TIMEOUT);
      const response: Awaited<ReturnType<typeof api.refreshToken>> = yield retry(3, 20 * 1000, api.refreshToken);
      yield call(setAccessToken, response.data.token);
      // yield put({ type: SYNC_ACCESS_TOKEN, payload: response.data.token });
    }
  } catch (error) {
    yield call(signOut);
  }
}

function* updateUserWorker(action: StoreAction<User>) {
  try {
    yield put(authSlice.actions.setErrorMessage({}));
    yield put(authSlice.actions.setLoading(true));
    const response: Awaited<ReturnType<typeof api.updateUser>> = yield call(() => api.updateUser(action.payload));
    yield put(authSlice.actions.setUser(response.data.user));
  } catch (error) {
    console.error(error);
    yield put(authSlice.actions.setErrorMessage({ [USER_UPDATE]: getErrorMessage(error) }));
  } finally {
    yield put(authSlice.actions.setLoading(false));
  }
}

function* updatePasswordWorker(action: StoreAction<UpdatePasswordArgs>) {
  try {
    yield put(authSlice.actions.setErrorMessage({}));
    yield put(authSlice.actions.setLoading(true));
    yield call(() => api.updatePassword(action.payload));
  } catch (error) {
    console.error(error);
    yield put(authSlice.actions.setErrorMessage({ [PASSWORD_UPDATE]: getErrorMessage(error) }));
  } finally {
    yield put(authSlice.actions.setLoading(false));
  }
}

function* authWather() {
  let autoAuthorized = false;
  const result: boolean = yield call([localStorage, localStorage.getItem], 'authorized');
  if (result) {
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
    const updatePasswordTask: Task = yield takeEvery(PASSWORD_UPDATE, updatePasswordWorker);
    const refreshTokenTask: Task = yield fork(refreshTokenWorker);

    yield take(SIGN_OUT);

    yield cancel([updateUserTask, updatePasswordTask, refreshTokenTask]);
    yield call(signOutWorker);
  }
}

export default function* main() {
  while (true) {
    try {
      yield call(authWather);
    } catch (error) {
      console.error(error);
    }
  }
}
