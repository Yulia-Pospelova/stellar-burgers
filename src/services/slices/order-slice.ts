import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderInfo: TOrder | null;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  orderInfo: null,
};

export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredientIds: string[]): Promise<TOrder> => {
    const data = await orderBurgerApi(ingredientIds);
    return data.order;
  }
);

export const fetchOrderByNumber = createAsyncThunk(
  'order/fetchByNumber',
  async (number: number): Promise<TOrder | null> => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0] ?? null;
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderModal: (state) => {
      state.orderModalData = null;
    },
  },
  selectors: {
    selectOrderRequest: (state) => state.orderRequest,
    selectOrderModalData: (state) => state.orderModalData,
    selectOrderInfo: (state) => state.orderInfo,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state) => {
        state.orderRequest = false;
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.orderInfo = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.orderInfo = action.payload;
      });
  },
});

export const { resetOrderModal } = orderSlice.actions;

export const { selectOrderRequest, selectOrderModalData, selectOrderInfo } =
  orderSlice.selectors;
