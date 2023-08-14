import React from 'react';
import { shallow } from 'enzyme';
import  AppRoutes  from '../AppRoutes'; 

describe('AppRoutes Component', () => {
  it('renders without crashing', () => {
    const auth = { isAuthenticated: true }; 
    const logoutUser = jest.fn(); 
    shallow(<AppRoutes auth={auth} logoutUser={logoutUser} />);
  });
});
