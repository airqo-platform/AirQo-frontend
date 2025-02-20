import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
// As a basic setup, import your same slice reducers
import { createStore } from 'redux';
import RootReducer from '../redux';

export function renderWithProviders(
  ui,
  { preloadedState = {}, store = createStore(RootReducer), ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
