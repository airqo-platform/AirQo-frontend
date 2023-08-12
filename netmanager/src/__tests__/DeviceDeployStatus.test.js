import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceDeployStatus from '../views/components/DataDisplay/DeviceView/DeviceDeployStatus';

jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
  }));
  
  describe('DeviceDeployStatus', () => {
    it('renders without errors', () => {
      const { asFragment } = render(
        <DeviceDeployStatus deviceData={{}} siteOptions={[]} />
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
