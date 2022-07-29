import { spawn } from 'redux-saga/effects';
import authWatcher from './auth/saga';

export default function* rootSaga() {
  yield spawn(authWatcher);
}
