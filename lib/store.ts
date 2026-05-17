'use client';

import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from '@/lib/store/expensesSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
