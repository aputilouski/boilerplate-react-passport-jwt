import { store } from '../store';
// import authSlice from './slices/auth';

export const SIGN_IN = 'AUTH/SIGN_IN';
export const SIGN_OUT = 'AUTH/SIGN_OUT';
export type SignInCredentials = { username: string; password: string };
export const signIn = (payload: SignInCredentials) => new Promise((resolve, reject) => store.dispatch({ type: SIGN_IN, payload, resolve, reject }));
export const signOut = () => store.dispatch({ type: SIGN_OUT });

// export const REGISTRATION = 'AUTH/REGISTRATION';
export type SignUpCredentials = SignInCredentials & { name: string; confirmPassword: string };
// export const register = (payload: RegistrationCredentials) => store.dispatch({ type: REGISTRATION, payload });

// export const CHECK_USERNAME = 'AUTH/CHECK_USERNAME';
// export const checkUsername = (payload: string) => store.dispatch({ type: CHECK_USERNAME, payload });
// export const setUserAvailable = authSlice.actions.setUserAvailable;

// export const USER_UPDATE = 'AUTH/USER_UPDATE';
// export type Userdata = Omit<User, 'uuid' | 'connected' | 'disconnected_at'>;
// export const updateUser = (payload: Userdata) => new Promise((resolve, reject) => store.dispatch({ type: USER_UPDATE, payload, resolve, reject }));
