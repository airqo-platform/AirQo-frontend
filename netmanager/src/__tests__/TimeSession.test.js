import React from 'react';
import { shallow } from 'enzyme';
import  AppRoutes  from '../AppRoutes'; 

describe('AppRoutes Component', () => {

  it('matches snapshot', () => {
    const auth = { isAuthenticated: true }; // Adjust this based on your test scenario
    const logoutUser = jest.fn(); // A mock function for logoutUser
    const wrapper = shallow(<AppRoutes auth={auth} logoutUser={logoutUser} />);
    expect(wrapper).toMatchSnapshot();
  });
});
