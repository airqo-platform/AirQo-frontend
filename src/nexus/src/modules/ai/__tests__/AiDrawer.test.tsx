import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiDrawer } from '../components/AiDrawer';
import type { AiMessage } from '../types';

const mockPush = jest.fn();
const mockCapture = jest.fn();
const mockClose = jest.fn();
const mockSend = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: mockCapture }),
}));

const renderDrawer = (
  overrides: Partial<React.ComponentProps<typeof AiDrawer>> = {}
) =>
  render(
    <AiDrawer
      isOpen
      onClose={mockClose}
      feature="home"
      messages={[]}
      sendMessage={mockSend}
      isStreaming={false}
      error={null}
      stop={jest.fn()}
      reset={jest.fn()}
      {...overrides}
    />
  );

describe('Ask AirQo drawer', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockCapture.mockReset();
    mockClose.mockReset();
    mockSend.mockReset();
  });

  it('labels the prototype and focuses the prompt', () => {
    renderDrawer();

    const dialog = screen.getByRole('dialog', { name: 'Ask AirQo' });
    expect(dialog.className).toContain('inset-1');
    expect(dialog.className).toContain('md:w-[400px]');
    expect(screen.getByText('BETA')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Beta guidance only. Nothing is saved or changed in your account.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('submits with Enter and closes with Escape', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.type(
      screen.getByRole('textbox'),
      'Explain the AQI categories{Enter}'
    );
    expect(mockSend).toHaveBeenCalledWith('Explain the AQI categories');

    await user.keyboard('{Escape}');
    expect(mockClose).toHaveBeenCalled();
  });

  it('shows a streaming state and an allowlisted action', async () => {
    const user = userEvent.setup();
    const messages: AiMessage[] = [
      {
        id: 'assistant-1',
        role: 'assistant',
        content: 'Open the map to see the current category.',
        actions: [
          { id: 'open-map', label: 'Open map', href: '/user/map' },
          {
            id: 'open-map',
            label: 'Leave Nexus',
            href: 'https://evil.example',
          },
        ],
      },
    ];

    const { rerender } = renderDrawer({
      isStreaming: true,
      messages: [{ id: 'assistant-1', role: 'assistant', content: '' }],
    });
    expect(screen.getByLabelText('Loading response')).toBeInTheDocument();

    rerender(
      <AiDrawer
        isOpen
        onClose={mockClose}
        feature="home"
        messages={messages}
        sendMessage={mockSend}
        isStreaming={false}
        error={null}
        stop={jest.fn()}
        reset={jest.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Open map' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Leave Nexus' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open map' }));
    expect(mockPush).toHaveBeenCalledWith('/user/map');
    expect(mockCapture).toHaveBeenCalledWith(
      'ask_airqo_action_selected',
      expect.objectContaining({ action_id: 'open-map', feature: 'home' })
    );
    expect(mockClose).toHaveBeenCalled();
  });
});
