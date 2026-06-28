import React from "react";
import { renderHook, RenderHookOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../mocks/queryClient";
import { setupStore } from "./renderWithProviders";

interface ExtendedRenderHookOptions<Props> extends RenderHookOptions<Props> {
  preloadedState?: any;
}

export function renderHookWithProviders<Result, Props>(
  renderCallback: (initialProps: Props) => Result,
  { preloadedState = {}, ...renderOptions }: ExtendedRenderHookOptions<Props> = {}
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

  return {
    store,
    queryClient,
    ...renderHook(renderCallback, { wrapper: Wrapper, ...renderOptions }),
  };
}
