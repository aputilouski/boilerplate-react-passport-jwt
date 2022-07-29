import axios, { AxiosError } from 'axios';
import { SignInCredentials, signOut } from 'redux-manager';

const DEFAULT_ERROR_MESSAGE = 'An unexpected problem has occurred, please try again later.';
axios.interceptors.response.use(
  response => {
    if (response.data.message) console.log(response.data.message);
    return response;
  },
  error => {
    let message = DEFAULT_ERROR_MESSAGE;
    if (error.response?.data) {
      const dataType = typeof error.response.data;
      if (dataType === 'string') message = error.response.data;
      else if (dataType === 'object') message = error.response.data.message;
    }
    console.log(message);
    if (error.response?.status === 401) signOut();
    throw error;
  }
);

const endpoints = {
  login: '/auth/login',
  register: '/auth/register',
  checkUsername: '/auth/check-username',
  updateUser: '/auth/user',
};

const api = {
  login: (credentials: SignInCredentials) => axios.post<{ token: string; user: User }>(endpoints.login, credentials),
  // register: (credentials: SignUpCredentials) => axios.post(endpoints.register, credentials),
  // checkUsername: (username: string) => axios.post<{ available: boolean }>(endpoints.checkUsername, { username }),
  // updateUser: (userdata: User) => axios.post<{ user: User }>(endpoints.updateUser, userdata),
};

export type ApiError = AxiosError<{ message?: string }>;

export const isApiError = (payload: any): payload is ApiError => axios.isAxiosError(payload);

export const getErrorMessage = (e: unknown): string => (isApiError(e) ? e.response?.data.message || 'Oops, Something went wrong...' : (e as Error).message);

export const setAccessToken = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;
