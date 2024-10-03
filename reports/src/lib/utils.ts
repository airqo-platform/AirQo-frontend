import { type ClassValue, clsx } from 'clsx';
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from 'react-redux';
import { twMerge } from 'tailwind-merge';

import type { AppDispatch, AppStore, RootState } from './store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<AppStore>();
