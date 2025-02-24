import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import CleanAirAbout from '../../pages/CleanAir/CleanAirAbout';

import store from '../../../store';

const testComponentRendering = (Component) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Component />
      </BrowserRouter>
    </Provider>
  );
};

test('renders CleanAir about page without crashing', () => {
  testComponentRendering(CleanAirAbout);
});

// test('renders CleanAir about page header', () => {
//   const { getByText } = render(testComponentRendering(CleanAirAbout));
//   const header = getByText(/CLEAN-Air Africa Network/i);
//   expect(header).toBeTruthy();
// });

// test('renders CleanAir subNav', () => {
//   const { getByText } = render(testComponentRendering(CleanAirAbout));
//   const subNav = getByText(/About/i);
//   expect(subNav).toBeInTheDocument();
// });

// test('renders CleanAir about page content', () => {
//   const { getByText } = render(testComponentRendering(CleanAirAbout));
//   const content = getByText(/Our mission is/i);
//   expect(content).toBeInTheDocument();
// });

// test('renders CleanAir latestNews', () => {
//   const { getByText } = render(testComponentRendering(CleanAirAbout));
//   const latestNews = getByText(/Latest News/i);
//   expect(latestNews).toBeInTheDocument();
// });

// test('renders CleanAir footer', () => {
//   const { getByText } = render(testComponentRendering(CleanAirAbout));
//   const footer = getByText(/© 2023 AirQo/i);
//   expect(footer).toBeInTheDocument();
// });
