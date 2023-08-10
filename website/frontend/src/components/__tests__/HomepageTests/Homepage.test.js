import React from 'react';
import CommonCities from '../../AirQuality/Communities';
import ImpactNumbers from '../../ImpactNumbers';
import TopBar from '../../nav/TopBar';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const testComponentRendering = (Component) => {
  render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );
};

// Testing if each component renders without crashing
test('renders TopBar without crashing', () => {
  testComponentRendering(TopBar);
});

test('renders ImpactNumbers without crashing', () => {
  testComponentRendering(ImpactNumbers);
});

test('renders CommonCities without crashing', () => {
  testComponentRendering(CommonCities);
});
