import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
};

type TTokens = {
  accessToken: string;
  refreshToken: string;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
};

const saveTokens = ({ accessToken, refreshToken }: TTokens): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const checkUserAuth = createAsyncThunk(
  'user/checkAuth',
  async (): Promise<TUser | null> => {
    if (!getCookie('accessToken')) {
      return null;
    }

    const data = await getUserApi();
    return data.user;
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (registerData: TRegisterData): Promise<TUser> => {
    const data = await registerUserApi(registerData);
    saveTokens(data);
    return data.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData: TLoginData): Promise<TUser> => {
    const data = await loginUserApi(loginData);
    saveTokens(data);
    return data.user;
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (userData: Partial<TRegisterData>): Promise<TUser> => {
    const data = await updateUserApi(userData);
    return data.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async (): Promise<void> => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { selectUser, selectIsAuthChecked } = userSlice.selectors;
