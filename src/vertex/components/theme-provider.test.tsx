import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { ThemeProvider, useTheme } from './theme-provider';

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

vi.mock('@/core/redux/hooks', () => ({
  useAppSelector: () => null,
}));

function TestConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <span data-testid="resolved-theme-val">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders children and provides default theme context', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-val').textContent).toBe('light');
    expect(screen.getByTestId('resolved-theme-val').textContent).toBe('light');
  });

  it('updates theme mode when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText('Set Dark').click();
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(screen.getByTestId('resolved-theme-val').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      screen.getByText('Set Light').click();
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('light');
    expect(screen.getByTestId('resolved-theme-val').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('processes general theme storage events when active group has no stored override', () => {
    render(
      <ThemeProvider activeGroupId="grp-123">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-val').textContent).toBe('light');

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
          newValue: JSON.stringify({
            mode: 'dark',
            primaryColor: '#145FFF',
            interfaceStyle: 'default',
            contentLayout: 'wide',
          }),
        })
      );
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('ignores general theme storage events when active group has a specific stored override', () => {
    localStorage.setItem(
      'theme_group_grp-123',
      JSON.stringify({
        mode: 'light',
        primaryColor: '#FF0000',
        interfaceStyle: 'default',
        contentLayout: 'wide',
      })
    );

    render(
      <ThemeProvider activeGroupId="grp-123">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-val').textContent).toBe('light');

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
          newValue: JSON.stringify({
            mode: 'dark',
            primaryColor: '#00FF00',
            interfaceStyle: 'default',
            contentLayout: 'wide',
          }),
        })
      );
    });

    // Stays light because group override exists
    expect(screen.getByTestId('theme-val').textContent).toBe('light');
  });

  it('processes group-specific storage events for the active group', () => {
    render(
      <ThemeProvider activeGroupId="grp-123">
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme_group_grp-123',
          newValue: JSON.stringify({
            mode: 'dark',
            primaryColor: '#FF0000',
            interfaceStyle: 'default',
            contentLayout: 'wide',
          }),
        })
      );
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
