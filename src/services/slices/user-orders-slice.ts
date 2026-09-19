import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TUserOrdersState = {
  orders: TOrder[];
};

const initialState: TUserOrdersState = {
  orders: [],
};

export const fetchUserOrders = createAsyncThunk('userOrders/fetch', getOrdersApi);

export const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {},
  selectors: {
    selectUserOrders: (state) => state.orders,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
    });
  },
});

export const { selectUserOrders } = userOrdersSlice.selectors;
