import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceDeployStatus from '../views/components/DataDisplay/DeviceView/DeviceDeployStatus';

jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
  }));

  // i have used the DeviceDeployStatus for the tests because all the functions for the recall an deploy are in 
  // this component
  
  describe('RecallDevice', () => {
    it('renders without errors', () => {
      const { asFragment } = render(
        <DeviceDeployStatus deviceData={{}} siteOptions={[]} />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
