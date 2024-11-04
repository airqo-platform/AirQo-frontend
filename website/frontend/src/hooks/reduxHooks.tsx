import {
  TypedUseSelectorHook,
  useDispatch as rawUseDispatch,
  useSelector as rawUseSelector,
} from 'react-redux';

import type { AppDispatch, RootState } from '@/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch: () => AppDispatch = rawUseDispatch;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;
