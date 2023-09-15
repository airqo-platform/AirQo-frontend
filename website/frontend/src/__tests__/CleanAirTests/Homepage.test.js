import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CleanAirPage from '../../pages/CleanAir';

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

test('renders CleanAir Homepage without crashing', () => {
  testComponentRendering(CleanAirPage);
});