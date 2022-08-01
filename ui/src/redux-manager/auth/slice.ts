import { createSlice } from '@reduxjs/toolkit';
import { StoreAction } from '../store';

export type AuthSlice = {
  token: string | null;
  user: User | null;
  authorized: boolean;
  // pendingAutoSignIn: boolean;
};

export default createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    authorized: false,
    // pendingAutoSignIn: false
  } as AuthSlice,
  reducers: {
    signIn: (state, action: StoreAction<{ token: string; user: User }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.authorized = true;
    },
    signOut: state => {
      state.token = null;
      state.user = null;
      state.authorized = false;
    },
    updateUser: (state, action: StoreAction<User>) => {
      state.user = action.payload;
    },
    updateToken: (state, action: StoreAction<string>) => {
      state.token = action.payload;
    },
  },
});
