import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import CleanAirMembership from '../../pages/CleanAir/CleanAirPartners';

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

// testing if the page renders
test('renders CleanAir membership page without crashing', () => {
  testComponentRendering(CleanAirMembership);
});
