import React from 'react';
import { shallow } from 'enzyme';
import ConfirmDialog from 'views/containers/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <ConfirmDialog
        open={true}
        close={() => {}}
        title="Session Expired"
        message="Your session has expired due to inactivity. Please log in again."
        confirmBtnMsg="Log In"
        confirm={() => {}}
        error={false}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
