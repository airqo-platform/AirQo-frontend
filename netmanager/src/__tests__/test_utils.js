import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
// As a basic setup, import your same slice reducers
import { configureStore } from '@reduxjs/toolkit';
import RootReducer from '../reducer';

export function renderWithProviders(
  ui,
  { preloadedState = {}, store = configureStore(RootReducer), ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
