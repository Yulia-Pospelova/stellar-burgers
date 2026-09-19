import { combineReducers } from '@reduxjs/toolkit';

import { constructorSlice } from './slices/constructor-slice';
import { feedSlice } from './slices/feed-slice';
import { ingredientsSlice } from './slices/ingredients-slice';
import { orderSlice } from './slices/order-slice';
import { userOrdersSlice } from './slices/user-orders-slice';
import { userSlice } from './slices/user-slice';

export const rootReducer = combineReducers({
  [ingredientsSlice.reducerPath]: ingredientsSlice.reducer,
  [constructorSlice.reducerPath]: constructorSlice.reducer,
  [orderSlice.reducerPath]: orderSlice.reducer,
  [feedSlice.reducerPath]: feedSlice.reducer,
  [userSlice.reducerPath]: userSlice.reducer,
  [userOrdersSlice.reducerPath]: userOrdersSlice.reducer,
});
