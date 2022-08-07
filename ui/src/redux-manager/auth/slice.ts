import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../store';
import { SIGN_IN, SIGN_UP, USER_UPDATE, PASSWORD_UPDATE } from './actions';

const errorKeys = [SIGN_IN, SIGN_UP, USER_UPDATE, PASSWORD_UPDATE] as const;
type ErrorKeys = { [key in typeof errorKeys[number]]?: string };

export type AuthSlice = {
  user: User | null;
  authorized: boolean;
  pendingAuth: boolean;
  loading: boolean;
  errorMessage: ErrorKeys;
};

export default createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    authorized: false,
    pendingAuth: false,
    loading: false,
    errorMessage: {},
  } as AuthSlice,
  reducers: {
    signIn: (state, action: StoreAction<{ user: User }>) => {
      const { user } = action.payload;
      state.user = user;
      state.authorized = true;
      state.pendingAuth = false;
    },
    signOut: state => {
      state.user = null;
      state.authorized = false;
    },
    setUser: (state, action: StoreAction<User>) => {
      state.user = action.payload;
    },
    setPendingAuth: (state, action: StoreAction<boolean>) => {
      state.pendingAuth = action.payload;
    },
    setLoading: (state, action: StoreAction<boolean>) => {
      state.loading = action.payload;
    },
    setErrorMessage: (state, action: StoreAction<ErrorKeys>) => {
      state.errorMessage = action.payload;
    },
  },
});
