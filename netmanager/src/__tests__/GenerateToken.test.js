import React from 'react';
import { shallow } from 'enzyme';
import {configureStore} from '@reduxjs/toolkit';
import GenerateToken from '../views/pages/Settings/components/GenerateToken/GenerateToken';

const mockStore = configureStore();

describe('GenerateToken', () => {
  it('renders correctly', () => {
    const store = mockStore({});
    const wrapper = shallow(<GenerateToken store={store} />);
    expect(wrapper).toMatchSnapshot();
  });
});
