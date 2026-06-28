import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../mocks/queryClient";
import userReducer from "@/core/redux/slices/userSlice";
import sitesReducer from "@/core/redux/slices/sitesSlice";
import devicesReducer from "@/core/redux/slices/devicesSlice";
import cohortsReducer from "@/core/redux/slices/cohortsSlice";
import gridsReducer from "@/core/redux/slices/gridsSlice";
import groupsReducer from "@/core/redux/slices/groupsSlice";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: any;
  route?: string;
}

export function setupStore(preloadedState?: any) {
  return configureStore({
    reducer: {
      user: userReducer,
      sites: sitesReducer,
      devices: devicesReducer,
      grids: gridsReducer,
      cohorts: cohortsReducer,
      groups: groupsReducer,
    },
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: ExtendedRenderOptions = {}
) {
  const store = setupStore(preloadedState);
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
