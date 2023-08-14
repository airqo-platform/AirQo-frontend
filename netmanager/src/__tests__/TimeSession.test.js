import React from 'react';
import { shallow } from 'enzyme';
import  AppRoutes  from '../AppRoutes'; 

describe('AppRoutes Component', () => {

  it('matches snapshot', () => {
    const auth = { isAuthenticated: true };
    const logoutUser = jest.fn();
    const wrapper = shallow(<AppRoutes auth={auth} logoutUser={logoutUser} />);
    expect(wrapper).toMatchSnapshot();
  });
});
