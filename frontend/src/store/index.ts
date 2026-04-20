import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import customerReducer from './slices/customerSlice';
import adminReducer from './slices/adminSlice';
import { RootState } from '@/types';

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    admin: adminReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

// Export typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
