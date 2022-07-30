import { store } from '../store';
// import authSlice from './slices/auth';

export const SIGN_IN = 'AUTH/SIGN_IN';
export const SIGN_OUT = 'AUTH/SIGN_OUT';
export type SignInCredentials = { username: string; password: string };
export const signIn = (payload: SignInCredentials) => new Promise((resolve, reject) => store.dispatch({ type: SIGN_IN, payload, resolve, reject }));
export const signOut = () => store.dispatch({ type: SIGN_OUT });

export const SIGN_UP = 'AUTH/SIGN_UP';
export type SignUpCredentials = SignInCredentials & { name: string; confirmPassword: string };
export const signUp = (payload: SignUpCredentials) => new Promise((resolve, reject) => store.dispatch({ type: SIGN_UP, payload, resolve, reject }));

// export const USER_UPDATE = 'AUTH/USER_UPDATE';
// export type Userdata = Omit<User, 'uuid' | 'connected' | 'disconnected_at'>;
// export const updateUser = (payload: Userdata) => new Promise((resolve, reject) => store.dispatch({ type: USER_UPDATE, payload, resolve, reject }));
