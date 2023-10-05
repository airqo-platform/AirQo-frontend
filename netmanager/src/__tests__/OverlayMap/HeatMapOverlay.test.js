import React from 'react';
import { render } from '@testing-library/react';
import HeatMapOverlay from '../../views/pages/Heatmap/HeatMapOverlay';

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn();

describe('HeatMapOverlay', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<HeatMapOverlay />);
    expect(getByTestId('heat-map-overlay')).toBeInTheDocument();
  });
});
