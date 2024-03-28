import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ManagementFaults from '../../views/components/DataDisplay/DeviceManagement/ManagementFaults';

describe('ManagementFaults Component', () => {
  it('should render without errors', async () => {
    const { container } = render(<ManagementFaults />);
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });
});
